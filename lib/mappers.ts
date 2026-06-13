import type { DriverRow, MembershipRow, ExpenseRow } from "@/lib/supabase/types";
import type { Driver, Membership, ExpenseRecord } from "@/lib/data";
import { todayISO, daysBetween } from "@/lib/utils";

export function fromDriverRow(row: DriverRow & { memberships?: { tanggal_selesai_final: string }[] }): Driver {
  let daysLeft: number | undefined = undefined;

  if (row.memberships && row.memberships.length > 0) {
    // Cari tanggal paling jauh
    const validEnds = row.memberships
      .map(m => m.tanggal_selesai_final)
      .filter(Boolean);
    
    if (validEnds.length > 0) {
      const ends = validEnds.map(d => new Date(d).getTime());
      const latest = new Date(Math.max(...ends)).toISOString().split("T")[0];
      daysLeft = daysBetween(todayISO(), latest);
    }
  }

  return {
    id: row.id,
    nama: row.nama,
    noWhatsApp: row.no_whatsapp ?? "",
    jenisDriver: row.jenis_driver,
    statusOperasional: row.status_operasional,
    catatan: row.catatan ?? "",
    tanggalBergabung: row.tanggal_bergabung,
    daysLeft,
  };
}

export function toDriverPayload(form: {
  nama: string;
  noWhatsApp: string;
  jenisDriver: Driver["jenisDriver"];
  statusOperasional: Driver["statusOperasional"];
  catatan: string;
  tanggalBergabung: string;
}) {
  return {
    nama: form.nama,
    no_whatsapp: form.noWhatsApp || null,
    jenis_driver: form.jenisDriver,
    status_operasional: form.statusOperasional,
    catatan: form.catatan || null,
    tanggal_bergabung: form.tanggalBergabung || undefined,
  };
}

export function fromMembershipRow(row: MembershipRow): Membership {
  return {
    id: row.id,
    driverId: row.driver_id,
    jenisDriver: row.jenis_driver,
    tanggalMulai: row.tanggal_mulai,
    tanggalSelesaiAwal: row.tanggal_selesai_awal,
    hariIzin: row.hari_izin,
    tanggalSelesaiFinal: row.tanggal_selesai_final,
    nominal: row.nominal,
    statusPembayaran: row.status_pembayaran,
    deadlinePembayaran: row.deadline_pembayaran ?? "",
    tanggalPembayaran: row.tanggal_pembayaran,
  };
}

export function fromExpenseRow(row: ExpenseRow): ExpenseRecord {
  return {
    id: row.id,
    tanggal: row.tanggal,
    kategori: row.kategori,
    nominal: row.nominal,
    keterangan: row.keterangan ?? "",
  };
}
