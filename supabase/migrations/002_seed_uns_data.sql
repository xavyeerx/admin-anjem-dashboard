-- ============================================================
-- Migration 002: Seed Data ANJEM UNS
-- Jalankan di Supabase SQL Editor SETELAH migration 001
--
-- STRUKTUR:
--   Bagian 1 : 75 driver (74 awal + Jamrood)
--              → Aktif jika bayar Juni, sisanya Menunggu Konfirmasi
--   Bagian 2 : 342 membership records, nominal EXACT dari spreadsheet
--              Total pemasukan = Rp 16.003.000
-- ============================================================

-- ============================================================
-- BAGIAN 1: DRIVER UNS
-- ============================================================
INSERT INTO drivers (cabang_id, nama, jenis_driver, status_operasional, tanggal_bergabung)
VALUES
  -- ── ANJEM ────────────────────────────────────────────────
  ('uns', 'Andhika',  'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Adib',     'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Eza',      'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Zull',     'ANJEM', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Ical',     'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Avis',     'ANJEM', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Harits',   'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Yogi',     'ANJEM', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Bedun',    'ANJEM', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Aduh',     'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Maria',    'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Sasa',     'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Hakim',    'ANJEM', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Ripekik',  'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Yoga',     'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Ilham',    'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Arif',     'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Febi',     'ANJEM', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Askur',    'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Shafa',    'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Riva',     'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Ayik',     'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Imam',     'ANJEM', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Reva',     'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Rafi',     'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Farrel',   'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Odja',     'ANJEM', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Vikei',    'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Dimas',    'ANJEM', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Daffa',    'ANJEM', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Try',      'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Agoy',     'ANJEM', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Farhan',   'ANJEM', 'Aktif',               '2026-02-09'),
  ('uns', 'Satrio',   'ANJEM', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Edi',      'ANJEM', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Ilman',    'ANJEM', 'Aktif',               '2026-02-09'),

  -- ── JASTIP ───────────────────────────────────────────────
  ('uns', 'Widia',    'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Ulfi',     'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Rama',     'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Fahrul',   'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Mustaqim', 'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Gretta',   'JASTIP', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Hamim',    'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Fito',     'JASTIP', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Ariyok',   'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Aan',      'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Eryka',    'JASTIP', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Ridho',    'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Oca',      'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Iki',      'JASTIP', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Khafsoh',  'JASTIP', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Bagus',    'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Gibran',   'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Ignatius', 'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Nayla',    'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Ahim',     'JASTIP', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Rizky',    'JASTIP', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Fah',      'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Alba',     'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Aulia',    'JASTIP', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Pras',     'JASTIP', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Mualif',   'JASTIP', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Ima',      'JASTIP', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Sinta',    'JASTIP', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Ajik',     'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Fatwa',    'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Ciyo',     'JASTIP', 'Menunggu Konfirmasi', '2026-02-09'),
  ('uns', 'Ivan',     'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Jovan',    'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Zulfa',    'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Akbar',    'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Tegar',    'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Irham',    'JASTIP', 'Aktif',               '2026-02-09'),
  ('uns', 'Nisa',     'JASTIP', 'Aktif',               '2026-02-09'),

  -- ── Driver baru (gabung Juni) ─────────────────────────────
  ('uns', 'Jamrood',  'ANJEM', 'Aktif', '2026-06-15')
ON CONFLICT DO NOTHING;

-- ============================================================
-- BAGIAN 2: SEMUA MEMBERSHIP (nominal exact dari spreadsheet)
-- Total = Rp 16.003.000
-- ============================================================
WITH d AS (
  SELECT id, nama, jenis_driver FROM drivers WHERE cabang_id = 'uns'
),
p (nama, tgl, nominal) AS (
  VALUES
  -- 09/02/2026
  ('Andhika','2026-02-09'::date,60000),('Adib','2026-02-09'::date,60000),
  ('Eza','2026-02-09'::date,60000),('Zull','2026-02-09'::date,60000),
  ('Ical','2026-02-09'::date,60000),('Avis','2026-02-09'::date,60000),
  ('Harits','2026-02-09'::date,60000),('Yogi','2026-02-09'::date,60000),
  ('Bedun','2026-02-09'::date,60000),('Aduh','2026-02-09'::date,60000),
  ('Maria','2026-02-09'::date,60000),('Sasa','2026-02-09'::date,60000),
  ('Hakim','2026-02-09'::date,60000),('Ripekik','2026-02-09'::date,60000),
  ('Yoga','2026-02-09'::date,60000),('Ilham','2026-02-09'::date,60000),
  ('Arif','2026-02-09'::date,60000),('Febi','2026-02-09'::date,60000),
  ('Askur','2026-02-09'::date,60000),('Shafa','2026-02-09'::date,60000),
  ('Riva','2026-02-09'::date,60000),('Ayik','2026-02-09'::date,60000),
  ('Imam','2026-02-09'::date,60000),('Reva','2026-02-09'::date,60000),
  ('Rafi','2026-02-09'::date,60000),('Widia','2026-02-09'::date,60000),
  ('Ulfi','2026-02-09'::date,60000),('Rama','2026-02-09'::date,60000),
  ('Fahrul','2026-02-09'::date,60000),('Satrio','2026-02-09'::date,35000),
  ('Edi','2026-02-09'::date,35000),('Mustaqim','2026-02-09'::date,35000),
  ('Farhan','2026-02-09'::date,35000),('Gretta','2026-02-09'::date,35000),
  ('Hamim','2026-02-09'::date,35000),('Fito','2026-02-09'::date,35000),
  ('Ariyok','2026-02-09'::date,35000),('Aan','2026-02-09'::date,35000),
  ('Eryka','2026-02-09'::date,35000),('Ridho','2026-02-09'::date,35000),
  ('Oca','2026-02-09'::date,35000),('Iki','2026-02-09'::date,35000),
  ('Ilman','2026-02-09'::date,35000),('Fahrul','2026-02-09'::date,35000),
  ('Khafsoh','2026-02-09'::date,35000),('Bagus','2026-02-09'::date,35000),
  ('Gibran','2026-02-09'::date,35000),('Ignatius','2026-02-09'::date,35000),
  ('Nayla','2026-02-09'::date,35000),

  -- 22/02/2026
  ('Adib','2026-02-22'::date,60000),('Andhika','2026-02-22'::date,60000),
  ('Sasa','2026-02-22'::date,60000),('Shafa','2026-02-22'::date,60000),
  ('Rafi','2026-02-22'::date,60000),('Ilham','2026-02-22'::date,60000),
  ('Rama','2026-02-22'::date,35000),('Eryka','2026-02-22'::date,35000),
  ('Gibran','2026-02-22'::date,35000),('Ariyok','2026-02-22'::date,35000),
  ('Aan','2026-02-22'::date,35000),('Imam','2026-02-22'::date,35000),
  ('Harits','2026-02-22'::date,60000),('Satrio','2026-02-22'::date,35000),
  ('Ahim','2026-02-22'::date,35000),('Askur','2026-02-22'::date,60000),
  ('Harits','2026-02-22'::date,60000),('Fah','2026-02-22'::date,35000),
  ('Ridho','2026-02-22'::date,35000),('Yogi','2026-02-22'::date,60000),
  ('Mustaqim','2026-02-22'::date,35000),('Bedun','2026-02-22'::date,60000),
  ('Aduh','2026-02-22'::date,60000),('Ilman','2026-02-22'::date,35000),
  ('Fahrul','2026-02-22'::date,35000),('Farrel','2026-02-22'::date,60000),
  ('Eza','2026-02-22'::date,60000),('Arif','2026-02-22'::date,60000),
  ('Farhan','2026-02-22'::date,60000),('Bagus','2026-02-22'::date,35000),
  ('Maria','2026-02-22'::date,60000),('Ical','2026-02-22'::date,60000),
  ('Zull','2026-02-22'::date,60000),('Avis','2026-02-22'::date,60000),
  ('Ripekik','2026-02-22'::date,60000),('Yoga','2026-02-22'::date,60000),
  ('Riva','2026-02-22'::date,60000),('Ayik','2026-02-22'::date,60000),
  ('Reva','2026-02-22'::date,60000),('Widia','2026-02-22'::date,35000),
  ('Ulfi','2026-02-22'::date,35000),('Edi','2026-02-22'::date,35000),
  ('Hamim','2026-02-22'::date,35000),('Oca','2026-02-22'::date,35000),
  ('Rizky','2026-02-22'::date,35000),

  -- 24/02/2026
  ('Nayla','2026-02-24'::date,35000),

  -- 01/03/2026
  ('Khafsoh','2026-03-01'::date,35000),('Hakim','2026-03-01'::date,60000),

  -- 04/03/2026
  ('Odja','2026-03-04'::date,60000),

  -- 08/03/2026
  ('Adib','2026-03-08'::date,60000),('Sasa','2026-03-08'::date,60000),
  ('Ilham','2026-03-08'::date,60000),('Ariyok','2026-03-08'::date,35000),
  ('Bagus','2026-03-08'::date,35000),('Gibran','2026-03-08'::date,35000),
  ('Harits','2026-03-08'::date,60000),('Satrio','2026-03-08'::date,30000),
  ('Edi','2026-03-08'::date,30000),('Rafi','2026-03-08'::date,20000),
  ('Yogi','2026-03-08'::date,30000),('Arif','2026-03-08'::date,50000),
  ('Aan','2026-03-08'::date,15000),('Yoga','2026-03-08'::date,50000),
  ('Askur','2026-03-08'::date,50000),('Mustaqim','2026-03-08'::date,30000),
  ('Aduh','2026-03-08'::date,50000),('Ilman','2026-03-08'::date,30000),
  ('Alba','2026-03-08'::date,30000),('Widia','2026-03-08'::date,30000),
  ('Reva','2026-03-08'::date,50000),('Oca','2026-03-08'::date,30000),

  -- 29/03/2026
  ('Andhika','2026-03-29'::date,60000),('Ilham','2026-03-29'::date,60000),
  ('Ariyok','2026-03-29'::date,35000),('Gibran','2026-03-29'::date,35000),
  ('Sasa','2026-03-29'::date,60000),('Rafi','2026-03-29'::date,60000),
  ('Zull','2026-03-29'::date,60000),('Eryka','2026-03-29'::date,35000),
  ('Aduh','2026-03-29'::date,60000),('Adib','2026-03-29'::date,60000),
  ('Bagus','2026-03-29'::date,35000),('Ahim','2026-03-29'::date,35000),
  ('Satrio','2026-03-29'::date,35000),('Avis','2026-03-29'::date,60000),
  ('Widia','2026-03-29'::date,35000),('Yoga','2026-03-29'::date,60000),
  ('Hamim','2026-03-29'::date,35000),('Widia','2026-03-29'::date,35000),
  ('Aan','2026-03-29'::date,35000),('Ical','2026-03-29'::date,60000),
  ('Shafa','2026-03-29'::date,35000),('Arif','2026-03-29'::date,60000),
  ('Try','2026-03-29'::date,60000),('Rama','2026-03-29'::date,35000),
  ('Hakim','2026-03-29'::date,60000),('Mustaqim','2026-03-29'::date,35000),
  ('Reva','2026-03-29'::date,60000),('Askur','2026-03-29'::date,63000),
  ('Alba','2026-03-29'::date,47000),('Aulia','2026-03-29'::date,35000),
  ('Nayla','2026-03-29'::date,38000),

  -- 01/04/2026
  ('Pras','2026-04-01'::date,35000),

  -- 02/04/2026
  ('Vikei','2026-04-02'::date,60000),

  -- 04/04/2026
  ('Khafsoh','2026-04-04'::date,35000),

  -- 05/04/2026
  ('Mualif','2026-04-05'::date,35000),('Harits','2026-04-05'::date,60000),

  -- 06/04/2026
  ('Ima','2026-04-06'::date,35000),

  -- 09/04/2026
  ('Riva','2026-04-09'::date,60000),('Imam','2026-04-09'::date,60000),

  -- 10/04/2026
  ('Adib','2026-04-10'::date,60000),('Harits','2026-04-10'::date,60000),
  ('Ilham','2026-04-10'::date,60000),('Reva','2026-04-10'::date,60000),
  ('Rafi','2026-04-10'::date,60000),('Try','2026-04-10'::date,60000),
  ('Widia','2026-04-10'::date,35000),('Shafa','2026-04-10'::date,35000),
  ('Fahrul','2026-04-10'::date,35000),('Ariyok','2026-04-10'::date,35000),
  ('Aan','2026-04-10'::date,35000),('Eryka','2026-04-10'::date,35000),
  ('Bagus','2026-04-10'::date,35000),('Gibran','2026-04-10'::date,35000),
  ('Ahim','2026-04-10'::date,35000),('Nayla','2026-04-10'::date,35000),
  ('Alba','2026-04-10'::date,35000),('Aulia','2026-04-10'::date,35000),
  ('Bedun','2026-04-10'::date,60000),('Agoy','2026-04-10'::date,60000),
  ('Aduh','2026-04-10'::date,60000),

  -- 01/05/2026
  ('Rama','2026-05-01'::date,35000),

  -- 02/05/2026
  ('Vikei','2026-05-02'::date,60000),

  -- 03/05/2026
  ('Satrio','2026-05-03'::date,60000),

  -- 04/05/2026
  ('Ical','2026-05-04'::date,60000),

  -- 05/05/2026
  ('Ciyo','2026-05-05'::date,35000),

  -- 06/05/2026
  ('Andhika','2026-05-06'::date,60000),

  -- 07/05/2026
  ('Mustaqim','2026-05-07'::date,35000),

  -- 08/05/2026
  ('Dimas','2026-05-08'::date,60000),

  -- 09/05/2026
  ('Edi','2026-05-09'::date,35000),

  -- 10/05/2026
  ('Arif','2026-05-10'::date,60000),

  -- 11/05/2026
  ('Pras','2026-05-11'::date,35000),

  -- 12/05/2026
  ('Daffa','2026-05-12'::date,60000),

  -- 13/05/2026
  ('Ayik','2026-05-13'::date,60000),

  -- 14/05/2026
  ('Fah','2026-05-14'::date,35000),

  -- 15/05/2026
  ('Sinta','2026-05-15'::date,35000),

  -- 16/05/2026
  ('Ima','2026-05-16'::date,35000),

  -- 17/05/2026
  ('Ajik','2026-05-17'::date,35000),

  -- 18/05/2026
  ('Fatwa','2026-05-18'::date,35000),

  -- 25/05/2026
  ('Eza','2026-05-25'::date,35000),('Ivan','2026-05-25'::date,35000),
  ('Jovan','2026-05-25'::date,35000),('Zulfa','2026-05-25'::date,35000),
  ('Akbar','2026-05-25'::date,35000),

  -- 26/05/2026
  ('Ical','2026-05-26'::date,60000),('Andhika','2026-05-26'::date,60000),
  ('Adib','2026-05-26'::date,60000),('Ilman','2026-05-26'::date,60000),
  ('Eza','2026-05-26'::date,60000),('Sasa','2026-05-26'::date,60000),
  ('Yoga','2026-05-26'::date,60000),('Rafi','2026-05-26'::date,60000),
  ('Try','2026-05-26'::date,60000),('Edi','2026-05-26'::date,60000),
  ('Yogi','2026-05-26'::date,35000),('Widia','2026-05-26'::date,35000),
  ('Rama','2026-05-26'::date,35000),('Fahrul','2026-05-26'::date,35000),
  ('Ariyok','2026-05-26'::date,35000),('Aan','2026-05-26'::date,35000),
  ('Eryka','2026-05-26'::date,35000),('Oca','2026-05-26'::date,35000),
  ('Bagus','2026-05-26'::date,35000),('Gibran','2026-05-26'::date,35000),
  ('Ignatius','2026-05-26'::date,35000),('Mualif','2026-05-26'::date,35000),
  ('Ajik','2026-05-26'::date,35000),('Fatwa','2026-05-26'::date,35000),
  ('Yoga','2026-05-26'::date,35000),('Ayik','2026-05-26'::date,60000),
  ('Askur','2026-05-26'::date,60000),('Ilham','2026-05-26'::date,60000),
  ('Daffa','2026-05-26'::date,60000),('Zull','2026-05-26'::date,60000),
  ('Maria','2026-05-26'::date,60000),('Ripekik','2026-05-26'::date,60000),
  ('Arif','2026-05-26'::date,60000),('Riva','2026-05-26'::date,60000),
  ('Reva','2026-05-26'::date,60000),('Satrio','2026-05-26'::date,60000),
  ('Edi','2026-05-26'::date,60000),('Farhan','2026-05-26'::date,60000),
  ('Shafa','2026-05-26'::date,35000),('Ulfi','2026-05-26'::date,35000),
  ('Mustaqim','2026-05-26'::date,35000),('Fah','2026-05-26'::date,35000),
  ('Alba','2026-05-26'::date,35000),('Tegar','2026-05-26'::date,35000),

  -- 27/05/2026
  ('Ical','2026-05-27'::date,35000),

  -- 29/05/2026
  ('Pras','2026-05-29'::date,35000),

  -- 31/05/2026
  ('Andhika','2026-05-31'::date,60000),('Adib','2026-05-31'::date,60000),
  ('Ilman','2026-05-31'::date,60000),('Zull','2026-05-31'::date,60000),
  ('Harits','2026-05-31'::date,60000),('Yogi','2026-05-31'::date,60000),
  ('Yoga','2026-05-31'::date,60000),('Aduh','2026-05-31'::date,60000),
  ('Maria','2026-05-31'::date,60000),('Sasa','2026-05-31'::date,60000),
  ('Ripekik','2026-05-31'::date,60000),('Ilham','2026-05-31'::date,60000),
  ('Arif','2026-05-31'::date,60000),('Askur','2026-05-31'::date,60000),
  ('Riva','2026-05-31'::date,60000),('Ayik','2026-05-31'::date,60000),
  ('Reva','2026-05-31'::date,60000),('Try','2026-05-31'::date,60000),
  ('Mustaqim','2026-05-31'::date,60000),('Widia','2026-05-31'::date,35000),
  ('Shafa','2026-05-31'::date,35000),('Rama','2026-05-31'::date,35000),
  ('Fahrul','2026-05-31'::date,35000),('Hamim','2026-05-31'::date,35000),
  ('Ariyok','2026-05-31'::date,35000),('Aan','2026-05-31'::date,35000),
  ('Eryka','2026-05-31'::date,35000),('Ridho','2026-05-31'::date,35000),
  ('Oca','2026-05-31'::date,35000),('Fah','2026-05-31'::date,35000),
  ('Khafsoh','2026-05-31'::date,35000),('Bagus','2026-05-31'::date,35000),
  ('Gibran','2026-05-31'::date,35000),('Nayla','2026-05-31'::date,35000),
  ('Alba','2026-05-31'::date,35000),('Pras','2026-05-31'::date,35000),
  ('Ima','2026-05-31'::date,35000),('Ajik','2026-05-31'::date,35000),
  ('Fatwa','2026-05-31'::date,35000),('Tegar','2026-05-31'::date,35000),
  ('Irham','2026-05-31'::date,35000),

  -- 05/06/2026
  ('Ivan','2026-06-05'::date,35000),

  -- 08/06/2026
  ('Eza','2026-06-08'::date,60000),('Vikei','2026-06-08'::date,60000),
  ('Rafi','2026-06-08'::date,35000),('Jovan','2026-06-08'::date,35000),
  ('Zulfa','2026-06-08'::date,35000),('Akbar','2026-06-08'::date,35000),
  ('Akbar','2026-06-08'::date,35000),

  -- 10/06/2026
  ('Ical','2026-06-10'::date,60000),

  -- 11/06/2026
  ('Nisa','2026-06-11'::date,35000),

  -- 15/06/2026
  ('Ariyok','2026-06-15'::date,60000),('Riva','2026-06-15'::date,60000),
  ('Widia','2026-06-15'::date,35000),('Tegar','2026-06-15'::date,35000),
  ('Ajik','2026-06-15'::date,35000),('Gibran','2026-06-15'::date,35000),
  ('Ilham','2026-06-15'::date,60000),('Harits','2026-06-15'::date,60000),
  ('Ilman','2026-06-15'::date,60000),('Sasa','2026-06-15'::date,60000),
  ('Farrel','2026-06-15'::date,60000),('Adib','2026-06-15'::date,60000),
  ('Jamrood','2026-06-15'::date,60000),('Ayik','2026-06-15'::date,60000),
  ('Aduh','2026-06-15'::date,60000),('Hamim','2026-06-15'::date,60000),
  ('Andhika','2026-06-15'::date,60000),('Shafa','2026-06-15'::date,60000),
  ('Arif','2026-06-15'::date,60000),('Fatwa','2026-06-15'::date,60000),
  ('Fahrul','2026-06-15'::date,60000),('Yoga','2026-06-15'::date,60000),
  ('Try','2026-06-15'::date,60000),('Mustaqim','2026-06-15'::date,60000),
  ('Maria','2026-06-15'::date,60000),('Oca','2026-06-15'::date,35000),
  ('Bagus','2026-06-15'::date,35000),('Ignatius','2026-06-15'::date,35000),
  ('Reva','2026-06-15'::date,35000),('Alba','2026-06-15'::date,35000),
  ('Ridho','2026-06-15'::date,35000),('Farhan','2026-06-15'::date,35000),
  ('Ripekik','2026-06-15'::date,35000),('Fah','2026-06-15'::date,35000),
  ('Ulfi','2026-06-15'::date,35000),('Rama','2026-06-15'::date,35000),
  ('Nayla','2026-06-15'::date,35000),('Alba','2026-06-15'::date,35000),
  ('Askur','2026-06-15'::date,35000),('Irham','2026-06-15'::date,35000),

  -- 18/06/2026
  ('Aan','2026-06-18'::date,35000)
)
INSERT INTO memberships (
  cabang_id, driver_id, jenis_driver,
  tanggal_mulai, tanggal_selesai_awal, tanggal_selesai_final,
  hari_izin, nominal, status_pembayaran, tanggal_pembayaran
)
SELECT
  'uns', d.id, d.jenis_driver,
  p.tgl,
  p.tgl + INTERVAL '14 days',
  p.tgl + INTERVAL '14 days',
  0, p.nominal, 'Lunas', p.tgl
FROM p
JOIN d ON d.nama = p.nama;

-- ============================================================
-- VERIFIKASI
-- ============================================================
-- SELECT COUNT(*)   FROM drivers     WHERE cabang_id = 'uns';         -- 75
-- SELECT COUNT(*)   FROM drivers     WHERE cabang_id = 'uns' AND status_operasional = 'Aktif'; -- 49
-- SELECT COUNT(*)   FROM memberships WHERE cabang_id = 'uns';         -- 342
-- SELECT SUM(nominal) FROM memberships WHERE cabang_id = 'uns';       -- 16003000
