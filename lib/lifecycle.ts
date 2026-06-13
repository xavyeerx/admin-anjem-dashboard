import type { SupabaseClient } from "@supabase/supabase-js";
import { calcDeadline } from "@/lib/api";
import { todayISO, daysBetween } from "@/lib/utils";

/**
 * H+3 lewat → status pembayaran Lewat Jatuh Tempo.
 * Status operasional TIDAK diubah (driver boleh tetap Aktif).
 */
export async function syncPaymentOverdue(db: SupabaseClient) {
  const today = todayISO();
  await db
    .from("memberships")
    .update({ status_pembayaran: "Lewat Jatuh Tempo" })
    .eq("status_pembayaran", "Belum Bayar")
    .not("deadline_pembayaran", "is", null)
    .lt("deadline_pembayaran", today);
}

/**
 * H-3 membership habis → driver Aktif menjadi Menunggu Konfirmasi.
 * Off Sementara / Keluar tidak disentuh.
 */
export async function syncExpiredMemberships(db: SupabaseClient) {
  const today = todayISO();

  const { data: memberships } = await db
    .from("memberships")
    .select("driver_id, tanggal_selesai_final, tanggal_mulai")
    .order("tanggal_mulai", { ascending: false });

  if (!memberships?.length) return;

  const latestEndByDriver = new Map<string, string>();
  for (const m of memberships) {
    if (!latestEndByDriver.has(m.driver_id)) {
      latestEndByDriver.set(m.driver_id, m.tanggal_selesai_final);
    }
  }

  const expiredIds = [...latestEndByDriver.entries()]
    .filter(([, end]) => daysBetween(today, end) < 0)
    .map(([id]) => id);

  if (expiredIds.length) {
    await db
      .from("drivers")
      .update({ status_operasional: "Menunggu Konfirmasi" })
      .eq("status_operasional", "Aktif")
      .in("id", expiredIds);
  }

  // Auto-heal: kembalikan ke Aktif jika belum kedaluwarsa tapi telanjur Menunggu Konfirmasi
  const activeIds = [...latestEndByDriver.entries()]
    .filter(([, end]) => daysBetween(today, end) >= 0)
    .map(([id]) => id);

  if (activeIds.length) {
    await db
      .from("drivers")
      .update({ status_operasional: "Aktif" })
      .eq("status_operasional", "Menunggu Konfirmasi")
      .in("id", activeIds);
  }
}

/** Jalankan semua sinkronisasi lifecycle (panggil di awal request baca data). */
export async function syncDriverLifecycle(db: SupabaseClient) {
  await syncPaymentOverdue(db);
  await syncExpiredMemberships(db);
}

/**
 * Membership baru dibuat → driver menjadi Aktif.
 * Berlaku untuk Lunas (bayar langsung) dan Belum Bayar (aktif kembali, ditagih H+3).
 * Driver Keluar tidak diubah otomatis.
 */
export async function activateDriverOnNewMembership(db: SupabaseClient, driverId: string) {
  const { data: driver } = await db
    .from("drivers")
    .select("status_operasional")
    .eq("id", driverId)
    .single();

  if (!driver || driver.status_operasional === "Keluar") return;

  await db
    .from("drivers")
    .update({ status_operasional: "Aktif" })
    .eq("id", driverId);
}

/** Siapkan field membership untuk flow aktif kembali / perpanjangan. */
export function resolveMembershipPaymentFields(
  tanggalMulai: string,
  statusPembayaran: string,
  tanggalPembayaran: string | null | undefined,
) {
  const deadline = calcDeadline(tanggalMulai);

  if (statusPembayaran === "Lunas") {
    return {
      status_pembayaran: "Lunas" as const,
      deadline_pembayaran: deadline,
      tanggal_pembayaran: tanggalPembayaran ?? tanggalMulai,
    };
  }

  if (statusPembayaran === "Lewat Jatuh Tempo") {
    return {
      status_pembayaran: "Lewat Jatuh Tempo" as const,
      deadline_pembayaran: deadline,
      tanggal_pembayaran: null,
    };
  }

  // Belum Bayar — aktif kembali, deadline H+3
  return {
    status_pembayaran: "Belum Bayar" as const,
    deadline_pembayaran: deadline,
    tanggal_pembayaran: null,
  };
}
