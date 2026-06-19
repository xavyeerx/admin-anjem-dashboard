import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { jsonOk, withErrorHandler } from "@/lib/api";
import { syncDriverLifecycle } from "@/lib/lifecycle";

export interface TrackingItem {
  membership_id: string | null;
  driver_id: string;
  driver_nama: string;
  driver_jenis: string;
  driver_wa: string | null;
  tanggal_mulai: string | null;
  deadline_pembayaran: string | null;
  nominal: number;
  status: "Belum Bayar" | "Lewat Jatuh Tempo";
  days_overdue: number;
  days_left: number;
}

function isValidYear(s: string | null): s is string {
  if (!s) return false;
  const y = parseInt(s.split("-")[0]);
  return y >= 2000 && y <= 2100;
}

function addDaysStr(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  return [
    dt.getFullYear(),
    String(dt.getMonth() + 1).padStart(2, "0"),
    String(dt.getDate()).padStart(2, "0"),
  ].join("-");
}

function daysBetween(from: string, to: string): number {
  const p = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d, 12).getTime();
  };
  return Math.floor((p(to) - p(from)) / 86400000);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ cabang: string }> }) {
  return withErrorHandler(async () => {
    const { cabang } = await params;
    const db = createServiceClient();
    await syncDriverLifecycle(db, cabang);
    const today = new Date().toISOString().split("T")[0];

    // 1. Memberships Belum Bayar / Lewat Jatuh Tempo
    const { data: pendingMems } = await db
      .from("memberships")
      .select("*, drivers(id, nama, no_whatsapp, jenis_driver)")
      .eq("cabang_id", cabang)
      .in("status_pembayaran", ["Belum Bayar", "Lewat Jatuh Tempo"])
      .order("created_at", { ascending: false });

    // 2. Kumpulkan driver_id yang butuh last paid membership (hanya untuk data lama yang corrupt date-nya)
    const needLastPaid = [
      ...new Set([
        ...(pendingMems ?? [])
          .filter((m) => !isValidYear(m.tanggal_mulai) || !isValidYear(m.deadline_pembayaran))
          .map((m) => m.driver_id),
      ]),
    ];

    // 4. Fetch last paid membership per driver
    const lastPaidMap: Record<string, { selesai: string; nominal: number }> = {};
    if (needLastPaid.length > 0) {
      const { data: paidRows } = await db
        .from("memberships")
        .select("driver_id, tanggal_selesai_final, nominal")
        .eq("cabang_id", cabang)
        .eq("status_pembayaran", "Lunas")
        .in("driver_id", needLastPaid)
        .order("tanggal_mulai", { ascending: false });

      for (const row of paidRows ?? []) {
        if (!lastPaidMap[row.driver_id] && isValidYear(row.tanggal_selesai_final)) {
          lastPaidMap[row.driver_id] = {
            selesai: row.tanggal_selesai_final,
            nominal: row.nominal,
          };
        }
      }
    }

    const items: TrackingItem[] = [];

    // 5. Build from pending memberships
    for (const m of pendingMems ?? []) {
      const dr = m.drivers as { id: string; nama: string; no_whatsapp: string | null; jenis_driver: string } | null;

      let tanggalMulai: string | null = m.tanggal_mulai;
      let deadline: string | null = m.deadline_pembayaran;

      // Fix invalid dates from last paid membership
      if (!isValidYear(tanggalMulai) || !isValidYear(deadline)) {
        const last = lastPaidMap[m.driver_id];
        if (last) {
          tanggalMulai = addDaysStr(last.selesai, 1); // habis+1 = hari aktif kembali
          deadline    = addDaysStr(last.selesai, 3); // habis+3 = jatuh tempo
          // Patch DB silently (fire & forget)
          db.from("memberships").update({
            tanggal_mulai: tanggalMulai,
            tanggal_selesai_awal: addDaysStr(last.selesai, 14),
            tanggal_selesai_final: addDaysStr(last.selesai, 14),
            deadline_pembayaran: deadline,
          }).eq("cabang_id", cabang).eq("id", m.id).then(() => {});
        }
      }

      const daysOverdue = isValidYear(deadline)
        ? Math.max(0, daysBetween(deadline, today))
        : 0;
      const daysLeft = isValidYear(deadline)
        ? daysBetween(today, deadline)
        : 0;

      items.push({
        membership_id: m.id,
        driver_id: m.driver_id,
        driver_nama: dr?.nama ?? "—",
        driver_jenis: dr?.jenis_driver ?? "ANJEM",
        driver_wa: dr?.no_whatsapp ?? null,
        tanggal_mulai: tanggalMulai,
        deadline_pembayaran: deadline,
        nominal: m.nominal,
        status: m.status_pembayaran as "Belum Bayar" | "Lewat Jatuh Tempo",
        days_overdue: daysOverdue,
        days_left: daysLeft,
      });
    }

    // Sort: Lewat Jatuh Tempo dulu, lalu by overdue terlama
    items.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "Lewat Jatuh Tempo" ? -1 : 1;
      }
      return b.days_overdue - a.days_overdue;
    });

    return jsonOk(items);
  });
}
