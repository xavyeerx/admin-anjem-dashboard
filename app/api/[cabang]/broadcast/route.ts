import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonErr, withErrorHandler } from "@/lib/api";
import { syncDriverLifecycle } from "@/lib/lifecycle";
import type { JenisDriver } from "@/lib/supabase/types";
import { todayISO, daysBetween } from "@/lib/utils";

type MembershipBrief = {
  id: string;
  tanggal_mulai: string;
  tanggal_selesai_final: string;
  status_pembayaran: string;
  deadline_pembayaran: string | null;
  nominal: number;
};

type DriverBrief = {
  id: string;
  nama: string;
  jenis_driver: JenisDriver;
  status_operasional: string;
  memberships: MembershipBrief[];
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export const dynamic = "force-dynamic";

/**
 * GET /api/[cabang]/broadcast
 * Generate broadcast text from live database data.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ cabang: string }> }) {
  return withErrorHandler(async () => {
    const { cabang } = await params;
    const db = createServiceClient();
    await syncDriverLifecycle(db, cabang);

    // Fetch drivers and their latest memberships in one go
    const { data: drivers, error } = await db
      .from("drivers")
      .select(`
        id, nama, jenis_driver, status_operasional,
        memberships(
          id, tanggal_mulai, tanggal_selesai_final,
          status_pembayaran, deadline_pembayaran, nominal
        )
      `)
      .eq("cabang_id", cabang)
      .neq("status_operasional", "Keluar")
      .order("nama");

    if (error) return jsonErr(error.message);

    const getLatestMembership = (memberships: MembershipBrief[] | null) => {
      if (!memberships || memberships.length === 0) return null;
      return [...memberships].sort((a, b) => {
        const d1 = a.tanggal_mulai ? new Date(a.tanggal_mulai).getTime() : 0;
        const d2 = b.tanggal_mulai ? new Date(b.tanggal_mulai).getTime() : 0;
        return d2 - d1;
      })[0];
    };

    const allDrivers = (drivers ?? []) as DriverBrief[];

    const today = new Date();
    const dateStr = today.toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    const groups: JenisDriver[] = ["ANJEM", "JASTIP"];
    let text = `🚨 WAYAE WAYAE FEE DRIVER 🚨\n📅 ${dateStr}\n`;

    const isoToday = todayISO();

    for (const jenis of groups) {
      const inGroup = allDrivers.filter((d) => d.jenis_driver === jenis);
      if (inGroup.length === 0) continue;

      text += `━━━━━━━━━━━━━━━\n`;
      text += `${jenis === "ANJEM" ? "🚗" : "📦"} *DRIVER ${jenis}*\n`;
      text += `━━━━━━━━━━━━━━━\n`;

      const belum = inGroup.filter((d) => {
        const m = getLatestMembership(d.memberships);
        return m?.status_pembayaran === "Belum Bayar";
      });

      const aktif = inGroup.filter((d) => {
        if (d.status_operasional !== "Aktif") return false;
        const m = getLatestMembership(d.memberships);
        if (m?.tanggal_selesai_final) {
          const daysLeft = daysBetween(isoToday, m.tanggal_selesai_final);
          return daysLeft > 2; // Hanya yang lebih dari H-2 yang benar-benar tampil di Aktif
        }
        return true;
      });

      const menunggu = inGroup.filter((d) => {
        if (d.status_operasional === "Menunggu Konfirmasi") return true;
        if (d.status_operasional === "Aktif") {
          const m = getLatestMembership(d.memberships);
          if (m?.tanggal_selesai_final) {
            const daysLeft = daysBetween(isoToday, m.tanggal_selesai_final);
            return daysLeft <= 2 && daysLeft >= 0; // H-2 hingga Hari H masuk ke Menunggu Konfirmasi
          }
        }
        return false;
      });

      const off = inGroup.filter((d) => d.status_operasional === "Off Sementara");

      if (aktif.length) {
        text += `🟢 *AKTIF*\n`;
        aktif.forEach((d) => {
          const m = getLatestMembership(d.memberships);
          const period = m ? `(${formatDate(m.tanggal_mulai)} - ${formatDate(m.tanggal_selesai_final)})` : "";
          text += `• ${d.nama} ${period}\n`;
        });
      }

      if (belum.length) {
        text += `⏳ *BELUM BAYAR*\n`;
        belum.forEach((d) => {
          const m = getLatestMembership(d.memberships);
          const deadline = m?.deadline_pembayaran ? `(Deadline: ${formatDate(m.deadline_pembayaran)})` : "";
          text += `• ${d.nama} ${deadline}\n`;
        });
      }

      if (menunggu.length) {
        text += `🟡 *MENUNGGU KONFIRMASI*\n`;
        menunggu.forEach((d) => {
          const m = getLatestMembership(d.memberships);
          if (m?.tanggal_selesai_final) {
            const daysLeft = daysBetween(isoToday, m.tanggal_selesai_final);
            if (daysLeft > 0) {
              text += `• ${d.nama} (Sisa ${daysLeft} Hari)\n`;
            } else if (daysLeft === 0) {
              text += `• ${d.nama} (Habis Hari Ini)\n`;
            } else {
              text += `• ${d.nama} (Membership Habis)\n`;
            }
          } else {
            text += `• ${d.nama} (Membership Habis)\n`;
          }
        });
      }

      if (off.length) {
        text += `🔵 *OFF SEMENTARA*\n`;
        off.forEach((d) => { text += `• ${d.nama}\n`; });
      }
    }

    text += `━━━━━━━━━━━━━━━\n_Generated by ANJEM Admin System_`;

    return jsonOk({ text, generated_at: new Date().toISOString() });
  });
}
