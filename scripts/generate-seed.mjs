/**
 * Generate supabase/seed.sql from real ANJEM transaction data.
 * Run: node scripts/generate-seed.mjs
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, "../supabase/seed.sql");

// Driver registry — synced with lib/data.ts
const DRIVERS = [
  { id: "d01", uuid: "a0000001-0000-4000-8000-000000000001", nama: "Ilul",      status: "Aktif",               bergabung: "2026-04-02", catatan: "Bayar 03 Jun 2026" },
  { id: "d02", uuid: "a0000002-0000-4000-8000-000000000002", nama: "Hadi",      status: "Aktif",               bergabung: "2026-03-05", catatan: "Bayar 27 Mei 2026" },
  { id: "d03", uuid: "a0000003-0000-4000-8000-000000000003", nama: "Syakira",   status: "Aktif",               bergabung: "2026-01-02", catatan: "Bayar 23 Mei 2026" },
  { id: "d04", uuid: "a0000004-0000-4000-8000-000000000004", nama: "Rhayzan",   status: "Aktif",               bergabung: "2026-02-10", catatan: "Bayar 19 Mei 2026" },
  { id: "d05", uuid: "a0000005-0000-4000-8000-000000000005", nama: "Fajar",     status: "Aktif",               bergabung: "2025-12-10", catatan: "Bayar 19 Mei 2026" },
  { id: "d06", uuid: "a0000006-0000-4000-8000-000000000006", nama: "Raka",      status: "Aktif",               bergabung: "2025-11-24", catatan: "Bayar 18 Mei 2026" },
  { id: "d07", uuid: "a0000007-0000-4000-8000-000000000007", nama: "Agista",    status: "Aktif",               bergabung: "2026-04-06", catatan: "Bayar 18 Mei 2026" },
  { id: "d08", uuid: "a0000008-0000-4000-8000-000000000008", nama: "Adit",      status: "Aktif",               bergabung: "2026-04-06", catatan: "Bayar 18 Mei 2026" },
  { id: "d09", uuid: "a0000009-0000-4000-8000-000000000009", nama: "Zahy",      status: "Menunggu Konfirmasi", bergabung: "2026-01-01", catatan: "Terakhir bayar 14 Mei" },
  { id: "d10", uuid: "a0000010-0000-4000-8000-000000000010", nama: "Hendra",    status: "Menunggu Konfirmasi", bergabung: "2025-11-24", catatan: "Terakhir bayar 14 Mei" },
  { id: "d11", uuid: "a0000011-0000-4000-8000-000000000011", nama: "Giandra",   status: "Menunggu Konfirmasi", bergabung: "2026-04-03", catatan: "Terakhir bayar 15 Mei" },
  { id: "d12", uuid: "a0000012-0000-4000-8000-000000000012", nama: "Mindo",     status: "Menunggu Konfirmasi", bergabung: "2026-02-18", catatan: "Terakhir bayar 01 Mei" },
  { id: "d13", uuid: "a0000013-0000-4000-8000-000000000013", nama: "Fiqry",     status: "Menunggu Konfirmasi", bergabung: "2026-02-25", catatan: "Terakhir bayar 13 Mei" },
  { id: "d14", uuid: "a0000014-0000-4000-8000-000000000014", nama: "Rizal",     status: "Menunggu Konfirmasi", bergabung: "2025-12-06", catatan: "Terakhir bayar 12 Mei" },
  { id: "d15", uuid: "a0000015-0000-4000-8000-000000000015", nama: "Faris",     status: "Menunggu Konfirmasi", bergabung: "2026-02-12", catatan: "Terakhir bayar 08 Mei" },
  { id: "d16", uuid: "a0000016-0000-4000-8000-000000000016", nama: "Teplok",    status: "Menunggu Konfirmasi", bergabung: "2026-04-13", catatan: "Terakhir bayar 11 Mei" },
  { id: "d17", uuid: "a0000017-0000-4000-8000-000000000017", nama: "Inoora",    status: "Menunggu Konfirmasi", bergabung: "2026-04-06", catatan: "Bayar 21 Mei partial" },
  { id: "d18", uuid: "a0000018-0000-4000-8000-000000000018", nama: "Abip",      status: "Menunggu Konfirmasi", bergabung: "2025-11-24", catatan: "Bayar 21 Mei partial" },
  { id: "d19", uuid: "a0000019-0000-4000-8000-000000000019", nama: "Yudha",     status: "Off Sementara",       bergabung: "2026-02-20", catatan: "Off sejak 15 Mei" },
  { id: "d20", uuid: "a0000020-0000-4000-8000-000000000020", nama: "Winner",    status: "Off Sementara",       bergabung: "2026-02-11", catatan: "Off sejak 19 Mei" },
  { id: "d21", uuid: "a0000021-0000-4000-8000-000000000021", nama: "Aceng",     status: "Off Sementara",       bergabung: "2026-02-18", catatan: "Off sejak 14 Mei" },
  { id: "d22", uuid: "a0000022-0000-4000-8000-000000000022", nama: "Tegar",     status: "Off Sementara",       bergabung: "2026-04-03", catatan: "Off sejak 15 Mei" },
  { id: "d23", uuid: "a0000023-0000-4000-8000-000000000023", nama: "Oho",       status: "Off Sementara",       bergabung: "2026-03-31", catatan: "Off sejak 19 Mei" },
  { id: "d24", uuid: "a0000024-0000-4000-8000-000000000024", nama: "Wulan",     status: "Off Sementara",       bergabung: "2026-04-04", catatan: "Off sejak 18 Apr" },
  { id: "d25", uuid: "a0000025-0000-4000-8000-000000000025", nama: "Daffa",     status: "Off Sementara",       bergabung: "2025-12-05", catatan: "Off sejak Apr 2026" },
  { id: "d26", uuid: "a0000026-0000-4000-8000-000000000026", nama: "Bang Jack", status: "Off Sementara",       bergabung: "2025-11-24", catatan: "Off sejak 03 Mei" },
  { id: "d27", uuid: "a0000027-0000-4000-8000-000000000027", nama: "Wiwit",     status: "Off Sementara",       bergabung: "2026-02-19", catatan: "Off sejak Mar 2026" },
  { id: "d28", uuid: "a0000028-0000-4000-8000-000000000028", nama: "Renan",     status: "Keluar",              bergabung: "2025-11-24", catatan: "Tidak aktif sejak Nov 2025" },
  { id: "d29", uuid: "a0000029-0000-4000-8000-000000000029", nama: "Radit",     status: "Keluar",              bergabung: "2025-11-24", catatan: "Tidak aktif sejak Des 2025" },
  { id: "d30", uuid: "a0000030-0000-4000-8000-000000000030", nama: "Alza",      status: "Keluar",              bergabung: "2025-11-24", catatan: "Tidak aktif sejak Feb 2026" },
  { id: "d31", uuid: "a0000031-0000-4000-8000-000000000031", nama: "Ferdy",     status: "Keluar",              bergabung: "2026-01-01", catatan: "Tidak aktif sejak Feb 2026" },
  { id: "d32", uuid: "a0000032-0000-4000-8000-000000000032", nama: "Dini",      status: "Keluar",              bergabung: "2026-02-09", catatan: "Tidak aktif sejak Feb 2026" },
  { id: "d33", uuid: "a0000033-0000-4000-8000-000000000033", nama: "Alit",      status: "Keluar",              bergabung: "2025-11-24", catatan: "Tidak aktif sejak Mar 2026" },
  { id: "d34", uuid: "a0000034-0000-4000-8000-000000000034", nama: "Aldi",      status: "Keluar",              bergabung: "2025-12-08", catatan: "Tidak aktif sejak Jan 2026" },
  { id: "d35", uuid: "a0000035-0000-4000-8000-000000000035", nama: "Nadip",     status: "Keluar",              bergabung: "2025-11-25", catatan: "Tidak aktif sejak Des 2025" },
  { id: "d36", uuid: "a0000036-0000-4000-8000-000000000036", nama: "Ayub",      status: "Keluar",              bergabung: "2025-11-26", catatan: "Tidak aktif sejak Nov 2025" },
  { id: "d37", uuid: "a0000037-0000-4000-8000-000000000037", nama: "Zuhdi",     status: "Keluar",              bergabung: "2025-11-27", catatan: "Tidak aktif sejak Nov 2025" },
  { id: "d38", uuid: "a0000038-0000-4000-8000-000000000038", nama: "Elhana",    status: "Keluar",              bergabung: "2025-12-02", catatan: "Tidak aktif sejak Des 2025" },
];

const NAME_ALIASES = {
  "jack": "Bang Jack",
  "dini": "Dini",
  "rizal (10 hari)": "Rizal",
};

// [DD/MM/YYYY, keterangan, nominal] — semua transaksi pemasukan nyata
const INCOME_TX = `24/11/2025	Radit	30000
24/11/2025	Raka	30000
24/11/2025	Alza	30000
24/11/2025	Abip	30000
24/11/2025	Jack	30000
24/11/2025	Hendra	30000
24/11/2025	Alit	30000
24/11/2025	Renan	30000
25/11/2025	Nadip	30000
26/11/2025	Ayub	30000
27/11/2025	Zuhdi	30000
02/12/2025	Elhana	30000
05/12/2025	Daffa	30000
06/12/2025	Rizal	30000
08/12/2025	Aldi	30000
08/12/2025	Raka	30000
08/12/2025	Alit	30000
08/12/2025	Abip	30000
08/12/2025	Hendra	30000
08/12/2025	Radit	30000
09/12/2025	Alza	30000
09/12/2025	Nadip	30000
10/12/2025	Fajar	30000
19/12/2025	Daffa	30000
20/12/2025	Rizal	30000
01/01/2026	Ferdy	40000
01/01/2026	Zahy	40000
02/01/2026	Syakira	40000
03/01/2026	Alza	40000
03/01/2026	Aldi	40000
04/01/2026	Fajar	40000
01/02/2026	Rizal (10 hari)	10000
01/02/2026	Zahy	40000
01/02/2026	Ferdy	40000
02/02/2026	Syakira	40000
03/02/2026	Alza	40000
05/02/2026	Fajar	40000
06/02/2026	Hendra	40000
07/02/2026	Raka	40000
09/02/2026	Dini	40000
10/02/2026	Rhayzan	40000
10/02/2026	Abip	40000
11/02/2026	Winner	40000
12/02/2026	Alit	40000
12/02/2026	Faris	40000
17/02/2026	Zahy	40000
17/02/2026	Rizal	40000
17/02/2026	Syakira	40000
18/02/2026	Mindo	40000
18/02/2026	Aceng	40000
19/02/2026	Wiwit	40000
20/02/2026	Yudha	40000
20/02/2026	Fajar	40000
21/02/2026	Hendra	40000
21/02/2026	Raka	40000
22/02/2026	Ferdy	40000
24/02/2026	Rhayzan	40000
25/02/2026	DIni	40000
25/02/2026	Fiqry	40000
25/02/2026	Winner	40000
26/02/2026	Faris	40000
03/03/2026	Zahy	40000
03/03/2026	Rizal	40000
03/03/2026	Syakira	40000
04/03/2026	Mindo	40000
05/03/2026	Abip	25000
05/03/2026	Hadi	40000
05/03/2026	Wiwit	40000
06/03/2026	Fajar	40000
07/03/2026	Hendra	40000
07/03/2026	Raka	40000
12/03/2026	Fiqry	40000
12/03/2026	Faris	40000
13/03/2026	Rhayzan	40000
30/03/2026	Yudha	40000
30/03/2026	Aceng	40000
30/03/2026	Winner	40000
30/03/2026	Bang Jack	40000
31/03/2026	Zahy	40000
31/03/2026	Rizal	40000
31/03/2026	Daffa	40000
31/03/2026	Oho	25000
31/03/2026	Alit	25000
01/04/2026	Abip	25000
01/04/2026	Hadi	40000
01/04/2026	Mindo	40000
02/04/2026	Ilul	40000
03/04/2026	Giandra	40000
03/04/2026	Tegar	40000
03/04/2026	Fajar	40000
04/04/2026	Wulan	40000
04/04/2026	Raka	40000
04/04/2026	Hendra	40000
04/04/2026	Wiwit	40000
06/04/2026	Agista	40000
06/04/2026	Inoora	40000
06/04/2026	Adit	40000
10/04/2026	Faris	40000
10/04/2026	Rhayzan	40000
11/04/2026	Syakira	40000
13/04/2026	Teplok	40000
13/04/2026	Aceng	40000
13/04/2026	Yudha	40000
14/04/2026	Zahy	40000
14/04/2026	Rizal	40000
14/04/2026	Daffa	40000
16/04/2026	Ilul	40000
17/04/2026	Giandra	40000
17/04/2026	Tegar	40000
17/04/2026	Fajar	40000
18/04/2026	Raka	40000
18/04/2026	Hadi	40000
19/04/2026	Bang Jack	40000
20/04/2026	Agista	40000
20/04/2026	Adit	40000
21/04/2026	Abip	25000
22/04/2026	Inoora	40000
24/04/2026	Fiqry	40000
24/04/2026	Rhayzan	40000
24/04/2026	Faris	40000
25/04/2026	Syakira	40000
28/04/2026	Rizal	40000
29/04/2026	Zahy	40000
29/04/2026	Teplok	40000
30/04/2026	Aceng	40000
01/05/2026	Mindo	80000
01/05/2026	Fajar	40000
28/04/2026	Hendra	40000
04/05/2026	Ilul	40000
01/05/2026	Yudha	40000
04/05/2026	Raka	40000
01/05/2026	Giandra	40000
01/05/2026	Tegar	40000
04/05/2026	Agista	40000
07/05/2026	Inoora	40000
05/05/2026	Winner	40000
07/05/2026	Hadi	40000
07/05/2026	Abip	25000
05/05/2026	Oho	25000
13/05/2026	Fiqry	40000
08/05/2026	Rhayzan	40000
08/05/2026	Faris	40000
09/05/2026	Syakira	40000
12/05/2026	Rizal	40000
14/05/2026	Zahy	40000
14/05/2026	Hendra	40000
11/05/2026	Teplok	40000
15/05/2026	Giandra	40000
18/05/2026	Raka	40000
19/05/2026	Rhayzan	40000
18/05/2026	Agista	40000
18/05/2026	Adit	40000
19/05/2026	Fajar	40000
03/06/2026	Ilul	40000
21/05/2026	Abip	25000
21/05/2026	Inoora	25000
23/05/2026	Syakira	40000
27/05/2026	Hadi	40000`;

const EXPENSES = [
  ["2025-12-02", "Marketing", 330000, "PP maba.ugm dan ugm.story"],
  ["2025-12-02", "Tools",      24000,  "PP saluran wa"],
  ["2026-02-14", "Tools",      24000,  "PP saluran wa"],
  ["2026-02-14", "Marketing",  30000,  "PP kajian ugm"],
  ["2026-03-28", "Tools",      39000,  "PP saluran wa"],
];

const TRANSFERS = [
  ["2026-04-01", 500000, "Bagi Hasil Q1 2026"],
  ["2026-05-01", 300000, "Bagi Hasil Apr 2026"],
];

const IZIN = [
  ["a0000006-0000-4000-8000-000000000006", 2, "Keperluan keluarga", "2026-05-20"],
  ["a0000014-0000-4000-8000-000000000014", 3, "Sakit", "2026-05-10"],
];

function parseDate(ddmmyyyy) {
  const [d, m, y] = ddmmyyyy.split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function addDays(iso, days) {
  const dt = new Date(iso + "T12:00:00");
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
}

function esc(s) {
  return s.replace(/'/g, "''");
}

function resolveDriver(name) {
  const key = name.trim().toLowerCase();
  const normalized = NAME_ALIASES[key] ?? name.trim();
  const driver = DRIVERS.find((d) => d.nama.toLowerCase() === normalized.toLowerCase());
  if (!driver) throw new Error(`Driver tidak ditemukan: ${name}`);
  return driver;
}

const driverByName = Object.fromEntries(DRIVERS.map((d) => [d.nama.toLowerCase(), d]));

// Build membership rows from income transactions
const incomeRows = INCOME_TX.trim().split("\n").map((line, i) => {
  const [date, name, amountStr] = line.split("\t");
  const nominal = parseInt(amountStr, 10);
  const driver = resolveDriver(name);
  const tanggal = parseDate(date);
  const periodDays = name.toLowerCase().includes("(10 hari)") ? 10 : 14;
  const selesaiAwal = addDays(tanggal, periodDays);
  const deadline = addDays(tanggal, 3);
  const uuid = `b${String(i + 1).padStart(7, "0")}-0000-4000-8000-000000000001`;
  return {
    uuid,
    driver_uuid: driver.uuid,
    tanggal,
    selesaiAwal,
    nominal,
    deadline,
  };
});

// Pending memberships (belum bayar) from lib/data.ts
const PENDING = [
  ["a0000009-0000-4000-8000-000000000009", "2026-06-08", "2026-06-22", 40000, "Belum Bayar", "2026-06-11"],
  ["a0000012-0000-4000-8000-000000000012", "2026-06-07", "2026-06-21", 40000, "Lewat Jatuh Tempo", "2026-06-05"],
];

let sql = `-- ============================================================
-- ANJEM Admin — Seed Data (DATA NYATA)
-- Generated by scripts/generate-seed.mjs — jangan edit manual
-- Run SETELAH schema.sql di Supabase SQL Editor
-- ============================================================

-- Hapus data lama (jika pernah pakai seed demo)
TRUNCATE transfers, expenses, izin_records, memberships, drivers CASCADE;

`;

sql += `-- ---- DRIVERS (${DRIVERS.length} driver) ----\n`;
sql += `INSERT INTO drivers (id, nama, no_whatsapp, jenis_driver, status_operasional, catatan, tanggal_bergabung) VALUES\n`;
sql += DRIVERS.map((d, i) => {
  const wa = `0812${String(i + 1).padStart(8, "0")}`;
  return `  ('${d.uuid}', '${esc(d.nama)}', '${wa}', 'ANJEM', '${d.status}', '${esc(d.catatan)}', '${d.bergabung}')`;
}).join(",\n");
sql += `\nON CONFLICT (id) DO UPDATE SET\n`;
sql += `  nama = EXCLUDED.nama, status_operasional = EXCLUDED.status_operasional, catatan = EXCLUDED.catatan;\n\n`;

sql += `-- ---- MEMBERSHIPS (${incomeRows.length} transaksi pemasukan + ${PENDING.length} pending) ----\n`;
sql += `INSERT INTO memberships (id, driver_id, jenis_driver, tanggal_mulai, tanggal_selesai_awal, hari_izin, tanggal_selesai_final, nominal, status_pembayaran, deadline_pembayaran, tanggal_pembayaran) VALUES\n`;

const memLines = incomeRows.map((r) =>
  `  ('${r.uuid}', '${r.driver_uuid}', 'ANJEM', '${r.tanggal}', '${r.selesaiAwal}', 0, '${r.selesaiAwal}', ${r.nominal}, 'Lunas', '${r.deadline}', '${r.tanggal}')`
);

PENDING.forEach(([driverUuid, mulai, selesai, nominal, status, deadline], i) => {
  const id = `c000000${i + 1}-0000-4000-8000-000000000001`;
  memLines.push(
    `  ('${id}', '${driverUuid}', 'ANJEM', '${mulai}', '${selesai}', 0, '${selesai}', ${nominal}, '${status}', '${deadline}', NULL)`
  );
});

sql += memLines.join(",\n");
sql += `\nON CONFLICT (id) DO NOTHING;\n\n`;

sql += `-- ---- EXPENSES (${EXPENSES.length} pengeluaran nyata) ----\n`;
sql += `INSERT INTO expenses (tanggal, kategori, nominal, keterangan) VALUES\n`;
sql += EXPENSES.map(([t, k, n, ket]) => `  ('${t}', '${k}', ${n}, '${esc(ket)}')`).join(",\n");
sql += `;\n\n`;

sql += `-- ---- IZIN RECORDS ----\n`;
sql += `INSERT INTO izin_records (driver_id, jumlah_hari, alasan, tanggal_input) VALUES\n`;
sql += IZIN.map(([du, h, a, t]) => `  ('${du}', ${h}, '${esc(a)}', '${t}')`).join(",\n");
sql += `;\n\n`;

sql += `-- ---- TRANSFERS ----\n`;
sql += `INSERT INTO transfers (tanggal, nominal, keterangan) VALUES\n`;
sql += TRANSFERS.map(([t, n, ket]) => `  ('${t}', ${n}, '${esc(ket)}')`).join(",\n");
sql += `;\n`;

// Verify totals
const totalIncome = incomeRows.reduce((s, r) => s + r.nominal, 0);
const totalExpense = EXPENSES.reduce((s, e) => s + e[2], 0);
console.log(`Drivers: ${DRIVERS.length}`);
console.log(`Memberships (lunas): ${incomeRows.length}`);
console.log(`Total pemasukan: Rp${totalIncome.toLocaleString("id-ID")}`);
console.log(`Total pengeluaran: Rp${totalExpense.toLocaleString("id-ID")}`);
console.log(`Saldo: Rp${(totalIncome - totalExpense).toLocaleString("id-ID")}`);

writeFileSync(OUT, sql, "utf8");
console.log(`Written: ${OUT}`);
