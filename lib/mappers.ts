import type { DriverRow, MembershipRow, ExpenseRow } from "@/lib/supabase/types";
import type { Driver, Membership, ExpenseRecord } from "@/lib/data";

export function fromDriverRow(row: DriverRow): Driver {
  return {
    id: row.id,
    nama: row.nama,
    noWhatsApp: row.no_whatsapp ?? "",
    jenisDriver: row.jenis_driver,
    statusOperasional: row.status_operasional,
    catatan: row.catatan ?? "",
    tanggalBergabung: row.tanggal_bergabung,
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
