// ============================================================
// Data ANJEM Admin Management System
// Synchronized with real transaction data
// ============================================================

export type DriverType = "ANJEM" | "JASTIP";
export type OperationalStatus = "Aktif" | "Menunggu Konfirmasi" | "Off Sementara" | "Keluar";
export type PaymentStatus = "Lunas" | "Belum Bayar" | "Lewat Jatuh Tempo";

export interface Driver {
  id: string;
  nama: string;
  noWhatsApp: string;
  jenisDriver: DriverType;
  statusOperasional: OperationalStatus;
  catatan: string;
  tanggalBergabung: string;
  daysLeft?: number;
}

export interface Membership {
  id: string;
  driverId: string;
  jenisDriver: DriverType;
  tanggalMulai: string;
  tanggalSelesaiAwal: string;
  hariIzin: number;
  tanggalSelesaiFinal: string;
  nominal: number;
  statusPembayaran: PaymentStatus;
  deadlinePembayaran: string;
  tanggalPembayaran: string | null;
}

export interface IzinRecord {
  id: string;
  driverId: string;
  jumlahHari: number;
  alasan: string;
  tanggalInput: string;
}

export interface PaymentTracking {
  id: string;
  driverId: string;
  tanggalAktifKembali: string;
  nominalMembership: number;
  deadlinePembayaran: string;
  statusPembayaran: PaymentStatus;
}

export interface ExpenseRecord {
  id: string;
  tanggal: string;
  kategori: string;
  nominal: number;
  keterangan: string;
}

export interface TransferRecord {
  id: string;
  tanggal: string;
  nominal: number;
  keterangan: string;
}

// ============================================================
// DRIVERS — 38 driver berdasarkan data transaksi nyata
// ============================================================
export const DRIVERS: Driver[] = [
  // ---- AKTIF (membership masih berlaku / baru diperpanjang) ----
  { id: "d01", nama: "Ilul",     noWhatsApp: "081201000001", jenisDriver: "ANJEM", statusOperasional: "Aktif",               catatan: "Bayar 03 Jun 2026",              tanggalBergabung: "2026-04-02" },
  { id: "d02", nama: "Hadi",     noWhatsApp: "081201000002", jenisDriver: "ANJEM", statusOperasional: "Aktif",               catatan: "Bayar 27 Mei 2026",             tanggalBergabung: "2026-03-05" },
  { id: "d03", nama: "Syakira",  noWhatsApp: "081201000003", jenisDriver: "ANJEM", statusOperasional: "Aktif",               catatan: "Bayar 23 Mei 2026",             tanggalBergabung: "2026-01-02" },
  { id: "d04", nama: "Rhayzan",  noWhatsApp: "081201000004", jenisDriver: "ANJEM", statusOperasional: "Aktif",               catatan: "Bayar 19 Mei 2026",             tanggalBergabung: "2026-02-10" },
  { id: "d05", nama: "Fajar",    noWhatsApp: "081201000005", jenisDriver: "ANJEM", statusOperasional: "Aktif",               catatan: "Bayar 19 Mei 2026",             tanggalBergabung: "2025-12-10" },
  { id: "d06", nama: "Raka",     noWhatsApp: "081201000006", jenisDriver: "ANJEM", statusOperasional: "Aktif",               catatan: "Bayar 18 Mei 2026",             tanggalBergabung: "2025-11-24" },
  { id: "d07", nama: "Agista",   noWhatsApp: "081201000007", jenisDriver: "ANJEM", statusOperasional: "Aktif",               catatan: "Bayar 18 Mei 2026",             tanggalBergabung: "2026-04-06" },
  { id: "d08", nama: "Adit",     noWhatsApp: "081201000008", jenisDriver: "ANJEM", statusOperasional: "Aktif",               catatan: "Bayar 18 Mei 2026",             tanggalBergabung: "2026-04-06" },

  // ---- MENUNGGU KONFIRMASI (membership habis, belum ada kabar) ----
  { id: "d09", nama: "Zahy",     noWhatsApp: "081201000009", jenisDriver: "ANJEM", statusOperasional: "Menunggu Konfirmasi", catatan: "Terakhir bayar 14 Mei, habis 28 Mei", tanggalBergabung: "2026-01-01" },
  { id: "d10", nama: "Hendra",   noWhatsApp: "081201000010", jenisDriver: "ANJEM", statusOperasional: "Menunggu Konfirmasi", catatan: "Terakhir bayar 14 Mei, habis 28 Mei", tanggalBergabung: "2025-11-24" },
  { id: "d11", nama: "Giandra",  noWhatsApp: "081201000011", jenisDriver: "ANJEM", statusOperasional: "Menunggu Konfirmasi", catatan: "Terakhir bayar 15 Mei, habis 29 Mei", tanggalBergabung: "2026-04-03" },
  { id: "d12", nama: "Mindo",    noWhatsApp: "081201000012", jenisDriver: "ANJEM", statusOperasional: "Menunggu Konfirmasi", catatan: "Terakhir bayar 01 Mei (2 period)", tanggalBergabung: "2026-02-18" },
  { id: "d13", nama: "Fiqry",    noWhatsApp: "081201000013", jenisDriver: "ANJEM", statusOperasional: "Menunggu Konfirmasi", catatan: "Terakhir bayar 13 Mei, habis 27 Mei", tanggalBergabung: "2026-02-25" },
  { id: "d14", nama: "Rizal",    noWhatsApp: "081201000014", jenisDriver: "ANJEM", statusOperasional: "Menunggu Konfirmasi", catatan: "Terakhir bayar 12 Mei, habis 26 Mei", tanggalBergabung: "2025-12-06" },
  { id: "d15", nama: "Faris",    noWhatsApp: "081201000015", jenisDriver: "ANJEM", statusOperasional: "Menunggu Konfirmasi", catatan: "Terakhir bayar 08 Mei, habis 22 Mei", tanggalBergabung: "2026-02-12" },
  { id: "d16", nama: "Teplok",   noWhatsApp: "081201000016", jenisDriver: "ANJEM", statusOperasional: "Menunggu Konfirmasi", catatan: "Terakhir bayar 11 Mei, habis 25 Mei", tanggalBergabung: "2026-04-13" },
  { id: "d17", nama: "Inoora",   noWhatsApp: "081201000017", jenisDriver: "ANJEM", statusOperasional: "Menunggu Konfirmasi", catatan: "Bayar 21 Mei (partial Rp25rb)",   tanggalBergabung: "2026-04-06" },
  { id: "d18", nama: "Abip",     noWhatsApp: "081201000018", jenisDriver: "ANJEM", statusOperasional: "Menunggu Konfirmasi", catatan: "Bayar 21 Mei (partial Rp25rb)",   tanggalBergabung: "2025-11-24" },

  // ---- OFF SEMENTARA ----
  { id: "d19", nama: "Yudha",    noWhatsApp: "081201000019", jenisDriver: "ANJEM", statusOperasional: "Off Sementara",       catatan: "Off sejak 15 Mei",              tanggalBergabung: "2026-02-20" },
  { id: "d20", nama: "Winner",   noWhatsApp: "081201000020", jenisDriver: "ANJEM", statusOperasional: "Off Sementara",       catatan: "Off sejak 19 Mei",              tanggalBergabung: "2026-02-11" },
  { id: "d21", nama: "Aceng",    noWhatsApp: "081201000021", jenisDriver: "ANJEM", statusOperasional: "Off Sementara",       catatan: "Off sejak 14 Mei",              tanggalBergabung: "2026-02-18" },
  { id: "d22", nama: "Tegar",    noWhatsApp: "081201000022", jenisDriver: "ANJEM", statusOperasional: "Off Sementara",       catatan: "Off sejak 15 Mei",              tanggalBergabung: "2026-04-03" },
  { id: "d23", nama: "Oho",      noWhatsApp: "081201000023", jenisDriver: "ANJEM", statusOperasional: "Off Sementara",       catatan: "Off sejak 19 Mei",              tanggalBergabung: "2026-03-31" },
  { id: "d24", nama: "Wulan",    noWhatsApp: "081201000024", jenisDriver: "ANJEM", statusOperasional: "Off Sementara",       catatan: "Off sejak 18 Apr",              tanggalBergabung: "2026-04-04" },
  { id: "d25", nama: "Daffa",    noWhatsApp: "081201000025", jenisDriver: "ANJEM", statusOperasional: "Off Sementara",       catatan: "Off sejak Apr 2026",            tanggalBergabung: "2025-12-05" },
  { id: "d26", nama: "Bang Jack",noWhatsApp: "081201000026", jenisDriver: "ANJEM", statusOperasional: "Off Sementara",       catatan: "Off sejak 03 Mei",              tanggalBergabung: "2025-11-24" },
  { id: "d27", nama: "Wiwit",    noWhatsApp: "081201000027", jenisDriver: "ANJEM", statusOperasional: "Off Sementara",       catatan: "Off sejak Mar 2026",            tanggalBergabung: "2026-02-19" },

  // ---- KELUAR ----
  { id: "d28", nama: "Renan",    noWhatsApp: "081201000028", jenisDriver: "ANJEM", statusOperasional: "Keluar",              catatan: "Tidak aktif sejak Nov 2025",    tanggalBergabung: "2025-11-24" },
  { id: "d29", nama: "Radit",    noWhatsApp: "081201000029", jenisDriver: "ANJEM", statusOperasional: "Keluar",              catatan: "Tidak aktif sejak Des 2025",    tanggalBergabung: "2025-11-24" },
  { id: "d30", nama: "Alza",     noWhatsApp: "081201000030", jenisDriver: "ANJEM", statusOperasional: "Keluar",              catatan: "Tidak aktif sejak Feb 2026",    tanggalBergabung: "2025-11-24" },
  { id: "d31", nama: "Ferdy",    noWhatsApp: "081201000031", jenisDriver: "ANJEM", statusOperasional: "Keluar",              catatan: "Tidak aktif sejak Feb 2026",    tanggalBergabung: "2026-01-01" },
  { id: "d32", nama: "Dini",     noWhatsApp: "081201000032", jenisDriver: "ANJEM", statusOperasional: "Keluar",              catatan: "Tidak aktif sejak Feb 2026",    tanggalBergabung: "2026-02-09" },
  { id: "d33", nama: "Alit",     noWhatsApp: "081201000033", jenisDriver: "ANJEM", statusOperasional: "Keluar",              catatan: "Tidak aktif sejak Mar 2026",    tanggalBergabung: "2025-11-24" },
  { id: "d34", nama: "Aldi",     noWhatsApp: "081201000034", jenisDriver: "ANJEM", statusOperasional: "Keluar",              catatan: "Tidak aktif sejak Jan 2026",    tanggalBergabung: "2025-12-08" },
  { id: "d35", nama: "Nadip",    noWhatsApp: "081201000035", jenisDriver: "ANJEM", statusOperasional: "Keluar",              catatan: "Tidak aktif sejak Des 2025",    tanggalBergabung: "2025-11-25" },
  { id: "d36", nama: "Ayub",     noWhatsApp: "081201000036", jenisDriver: "ANJEM", statusOperasional: "Keluar",              catatan: "Tidak aktif sejak Nov 2025",    tanggalBergabung: "2025-11-26" },
  { id: "d37", nama: "Zuhdi",    noWhatsApp: "081201000037", jenisDriver: "ANJEM", statusOperasional: "Keluar",              catatan: "Tidak aktif sejak Nov 2025",    tanggalBergabung: "2025-11-27" },
  { id: "d38", nama: "Elhana",   noWhatsApp: "081201000038", jenisDriver: "ANJEM", statusOperasional: "Keluar",              catatan: "Tidak aktif sejak Des 2025",    tanggalBergabung: "2025-12-02" },
];

// ============================================================
// MEMBERSHIPS — periode terkini tiap driver aktif/menunggu
// Periode = 14 hari, nominal sesuai data nyata
// ============================================================
export const MEMBERSHIPS: Membership[] = [
  // AKTIF — membership masih berjalan
  { id: "m01", driverId: "d01", jenisDriver: "ANJEM", tanggalMulai: "2026-06-03", tanggalSelesaiAwal: "2026-06-17", hariIzin: 0, tanggalSelesaiFinal: "2026-06-17", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-06-06", tanggalPembayaran: "2026-06-03" },
  { id: "m02", driverId: "d02", jenisDriver: "ANJEM", tanggalMulai: "2026-05-27", tanggalSelesaiAwal: "2026-06-10", hariIzin: 0, tanggalSelesaiFinal: "2026-06-10", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-30", tanggalPembayaran: "2026-05-27" },
  { id: "m03", driverId: "d03", jenisDriver: "ANJEM", tanggalMulai: "2026-05-23", tanggalSelesaiAwal: "2026-06-06", hariIzin: 0, tanggalSelesaiFinal: "2026-06-06", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-26", tanggalPembayaran: "2026-05-23" },
  { id: "m04", driverId: "d04", jenisDriver: "ANJEM", tanggalMulai: "2026-05-19", tanggalSelesaiAwal: "2026-06-02", hariIzin: 0, tanggalSelesaiFinal: "2026-06-02", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-22", tanggalPembayaran: "2026-05-19" },
  { id: "m05", driverId: "d05", jenisDriver: "ANJEM", tanggalMulai: "2026-05-19", tanggalSelesaiAwal: "2026-06-02", hariIzin: 0, tanggalSelesaiFinal: "2026-06-02", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-22", tanggalPembayaran: "2026-05-19" },
  { id: "m06", driverId: "d06", jenisDriver: "ANJEM", tanggalMulai: "2026-05-18", tanggalSelesaiAwal: "2026-06-01", hariIzin: 0, tanggalSelesaiFinal: "2026-06-01", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-21", tanggalPembayaran: "2026-05-18" },
  { id: "m07", driverId: "d07", jenisDriver: "ANJEM", tanggalMulai: "2026-05-18", tanggalSelesaiAwal: "2026-06-01", hariIzin: 0, tanggalSelesaiFinal: "2026-06-01", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-21", tanggalPembayaran: "2026-05-18" },
  { id: "m08", driverId: "d08", jenisDriver: "ANJEM", tanggalMulai: "2026-05-18", tanggalSelesaiAwal: "2026-06-01", hariIzin: 0, tanggalSelesaiFinal: "2026-06-01", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-21", tanggalPembayaran: "2026-05-18" },

  // MENUNGGU KONFIRMASI — membership sudah habis
  { id: "m09", driverId: "d09", jenisDriver: "ANJEM", tanggalMulai: "2026-05-14", tanggalSelesaiAwal: "2026-05-28", hariIzin: 0, tanggalSelesaiFinal: "2026-05-28", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-17", tanggalPembayaran: "2026-05-14" },
  { id: "m10", driverId: "d10", jenisDriver: "ANJEM", tanggalMulai: "2026-05-14", tanggalSelesaiAwal: "2026-05-28", hariIzin: 0, tanggalSelesaiFinal: "2026-05-28", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-17", tanggalPembayaran: "2026-05-14" },
  { id: "m11", driverId: "d11", jenisDriver: "ANJEM", tanggalMulai: "2026-05-15", tanggalSelesaiAwal: "2026-05-29", hariIzin: 0, tanggalSelesaiFinal: "2026-05-29", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-18", tanggalPembayaran: "2026-05-15" },
  { id: "m12", driverId: "d12", jenisDriver: "ANJEM", tanggalMulai: "2026-05-01", tanggalSelesaiAwal: "2026-05-29", hariIzin: 0, tanggalSelesaiFinal: "2026-05-29", nominal: 80000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-04", tanggalPembayaran: "2026-05-01" },
  { id: "m13", driverId: "d13", jenisDriver: "ANJEM", tanggalMulai: "2026-05-13", tanggalSelesaiAwal: "2026-05-27", hariIzin: 0, tanggalSelesaiFinal: "2026-05-27", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-16", tanggalPembayaran: "2026-05-13" },
  { id: "m14", driverId: "d14", jenisDriver: "ANJEM", tanggalMulai: "2026-05-12", tanggalSelesaiAwal: "2026-05-26", hariIzin: 0, tanggalSelesaiFinal: "2026-05-26", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-15", tanggalPembayaran: "2026-05-12" },
  { id: "m15", driverId: "d15", jenisDriver: "ANJEM", tanggalMulai: "2026-05-08", tanggalSelesaiAwal: "2026-05-22", hariIzin: 0, tanggalSelesaiFinal: "2026-05-22", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-11", tanggalPembayaran: "2026-05-08" },
  { id: "m16", driverId: "d16", jenisDriver: "ANJEM", tanggalMulai: "2026-05-11", tanggalSelesaiAwal: "2026-05-25", hariIzin: 0, tanggalSelesaiFinal: "2026-05-25", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-14", tanggalPembayaran: "2026-05-11" },
  { id: "m17", driverId: "d17", jenisDriver: "ANJEM", tanggalMulai: "2026-05-21", tanggalSelesaiAwal: "2026-06-04", hariIzin: 0, tanggalSelesaiFinal: "2026-06-04", nominal: 25000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-24", tanggalPembayaran: "2026-05-21" },
  { id: "m18", driverId: "d18", jenisDriver: "ANJEM", tanggalMulai: "2026-05-21", tanggalSelesaiAwal: "2026-06-04", hariIzin: 0, tanggalSelesaiFinal: "2026-06-04", nominal: 25000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-24", tanggalPembayaran: "2026-05-21" },

  // OFF SEMENTARA — period terakhir
  { id: "m19", driverId: "d19", jenisDriver: "ANJEM", tanggalMulai: "2026-05-01", tanggalSelesaiAwal: "2026-05-15", hariIzin: 0, tanggalSelesaiFinal: "2026-05-15", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-04", tanggalPembayaran: "2026-05-01" },
  { id: "m20", driverId: "d20", jenisDriver: "ANJEM", tanggalMulai: "2026-05-05", tanggalSelesaiAwal: "2026-05-19", hariIzin: 0, tanggalSelesaiFinal: "2026-05-19", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-08", tanggalPembayaran: "2026-05-05" },
  { id: "m21", driverId: "d21", jenisDriver: "ANJEM", tanggalMulai: "2026-04-30", tanggalSelesaiAwal: "2026-05-14", hariIzin: 0, tanggalSelesaiFinal: "2026-05-14", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-03", tanggalPembayaran: "2026-04-30" },
  { id: "m22", driverId: "d22", jenisDriver: "ANJEM", tanggalMulai: "2026-05-01", tanggalSelesaiAwal: "2026-05-15", hariIzin: 0, tanggalSelesaiFinal: "2026-05-15", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-04", tanggalPembayaran: "2026-05-01" },
  { id: "m23", driverId: "d23", jenisDriver: "ANJEM", tanggalMulai: "2026-05-05", tanggalSelesaiAwal: "2026-05-19", hariIzin: 0, tanggalSelesaiFinal: "2026-05-19", nominal: 25000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-05-08", tanggalPembayaran: "2026-05-05" },
  { id: "m24", driverId: "d24", jenisDriver: "ANJEM", tanggalMulai: "2026-04-04", tanggalSelesaiAwal: "2026-04-18", hariIzin: 0, tanggalSelesaiFinal: "2026-04-18", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-04-07", tanggalPembayaran: "2026-04-04" },
  { id: "m25", driverId: "d25", jenisDriver: "ANJEM", tanggalMulai: "2026-03-31", tanggalSelesaiAwal: "2026-04-14", hariIzin: 0, tanggalSelesaiFinal: "2026-04-14", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-04-03", tanggalPembayaran: "2026-03-31" },
  { id: "m26", driverId: "d26", jenisDriver: "ANJEM", tanggalMulai: "2026-04-19", tanggalSelesaiAwal: "2026-05-03", hariIzin: 0, tanggalSelesaiFinal: "2026-05-03", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-04-22", tanggalPembayaran: "2026-04-19" },
  { id: "m27", driverId: "d27", jenisDriver: "ANJEM", tanggalMulai: "2026-04-04", tanggalSelesaiAwal: "2026-04-18", hariIzin: 0, tanggalSelesaiFinal: "2026-04-18", nominal: 40000, statusPembayaran: "Lunas",       deadlinePembayaran: "2026-04-07", tanggalPembayaran: "2026-04-04" },

  // BELUM BAYAR — driver baru aktif kembali, belum bayar
  { id: "m28", driverId: "d09", jenisDriver: "ANJEM", tanggalMulai: "2026-06-08", tanggalSelesaiAwal: "2026-06-22", hariIzin: 0, tanggalSelesaiFinal: "2026-06-22", nominal: 40000, statusPembayaran: "Belum Bayar",  deadlinePembayaran: "2026-06-11", tanggalPembayaran: null },
  { id: "m29", driverId: "d12", jenisDriver: "ANJEM", tanggalMulai: "2026-06-07", tanggalSelesaiAwal: "2026-06-21", hariIzin: 0, tanggalSelesaiFinal: "2026-06-21", nominal: 40000, statusPembayaran: "Lewat Jatuh Tempo", deadlinePembayaran: "2026-06-05", tanggalPembayaran: null },
];

// ============================================================
// IZIN RECORDS
// ============================================================
export const IZIN_RECORDS: IzinRecord[] = [
  { id: "i1", driverId: "d06", jumlahHari: 2, alasan: "Keperluan keluarga", tanggalInput: "2026-05-20" },
  { id: "i2", driverId: "d14", jumlahHari: 3, alasan: "Sakit",              tanggalInput: "2026-05-10" },
];

// ============================================================
// PAYMENT TRACKING — driver aktif kembali, belum bayar
// ============================================================
export const PAYMENT_TRACKING: PaymentTracking[] = [
  { id: "pt1", driverId: "d09", tanggalAktifKembali: "2026-06-08", nominalMembership: 40000, deadlinePembayaran: "2026-06-11", statusPembayaran: "Belum Bayar" },
  { id: "pt2", driverId: "d12", tanggalAktifKembali: "2026-06-02", nominalMembership: 40000, deadlinePembayaran: "2026-06-05", statusPembayaran: "Lewat Jatuh Tempo" },
];

// ============================================================
// EXPENSES — data pengeluaran nyata (5 transaksi)
// ============================================================
export const EXPENSES: ExpenseRecord[] = [
  { id: "e1", tanggal: "2025-12-02", kategori: "Marketing",   nominal: 330000, keterangan: "PP maba.ugm dan ugm.story"   },
  { id: "e2", tanggal: "2025-12-02", kategori: "Tools",       nominal:  24000, keterangan: "PP saluran wa"               },
  { id: "e3", tanggal: "2026-02-14", kategori: "Tools",       nominal:  24000, keterangan: "PP saluran wa"               },
  { id: "e4", tanggal: "2026-02-14", kategori: "Marketing",   nominal:  30000, keterangan: "PP kajian ugm"               },
  { id: "e5", tanggal: "2026-03-28", kategori: "Tools",       nominal:  39000, keterangan: "PP saluran wa"               },
];

// ============================================================
// TRANSFERS — ke Bintang (default shareholder)
// ============================================================
export const TRANSFERS: TransferRecord[] = [
  { id: "t1", tanggal: "2026-04-01", nominal: 500000, keterangan: "Bagi Hasil Q1 2026" },
  { id: "t2", tanggal: "2026-05-01", nominal: 300000, keterangan: "Bagi Hasil Apr 2026" },
];

// ============================================================
// SHAREHOLDER CONFIG
// ============================================================
export const SHAREHOLDERS = {
  diki:    { nama: "Diki",    persentase: 70 },
  bintang: { nama: "Bintang", persentase: 30 },
};

// ============================================================
// MONTHLY REVENUE — data nyata Jan–Jun 2026
// Semua dikategorikan ANJEM (tidak ada pembeda jenis di data)
// ============================================================
export const MONTHLY_REVENUE = [
  { bulan: "Jan", anjem:  240000, jastip: 0 },
  { bulan: "Feb", anjem: 1170000, jastip: 0 },
  { bulan: "Mar", anjem:  835000, jastip: 0 },
  { bulan: "Apr", anjem: 1690000, jastip: 0 },
  { bulan: "Mei", anjem: 1220000, jastip: 0 },
  { bulan: "Jun", anjem:   40000, jastip: 0 },
];

// ============================================================
// HELPERS
// ============================================================
export function getDriverById(id: string): Driver | undefined {
  return DRIVERS.find((d) => d.id === id);
}

export function getTotalPemasukan(): number {
  return MEMBERSHIPS.filter((m) => m.statusPembayaran === "Lunas")
    .reduce((sum, m) => sum + m.nominal, 0);
}

export function getTotalPemasukanAnjem(): number {
  return MEMBERSHIPS.filter((m) => m.statusPembayaran === "Lunas" && m.jenisDriver === "ANJEM")
    .reduce((sum, m) => sum + m.nominal, 0);
}

export function getTotalPemasukanJastip(): number {
  return MEMBERSHIPS.filter((m) => m.statusPembayaran === "Lunas" && m.jenisDriver === "JASTIP")
    .reduce((sum, m) => sum + m.nominal, 0);
}

export function getTotalPengeluaran(): number {
  return EXPENSES.reduce((sum, e) => sum + e.nominal, 0);
}

export function getLabaBersih(): number {
  return getTotalPemasukan() - getTotalPengeluaran();
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  // Parse manual agar tidak kena timezone shift di Windows/Node.js
  const datePart = dateStr.split("T")[0];
  const parts = datePart.split("-");
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts.map(Number);
  if (!y || !m || !d) return dateStr;
  const dt = new Date(y, m - 1, d, 12, 0, 0);
  return dt.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}
