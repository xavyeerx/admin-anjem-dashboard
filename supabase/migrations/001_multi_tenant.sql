-- ============================================================
-- Migration 001: Multi-Tenant Support
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Tabel konfigurasi cabang
CREATE TABLE IF NOT EXISTS cabang (
  id          text PRIMARY KEY,
  nama        text NOT NULL,
  universitas text NOT NULL,
  kota        text NOT NULL DEFAULT '',
  logo_url    text,
  warna       text NOT NULL DEFAULT '#d97706',
  aktif       boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. Seed cabang awal
INSERT INTO cabang (id, nama, universitas, kota, warna) VALUES
  ('ugm', 'ANJEM UGM', 'Universitas Gadjah Mada',    'Yogyakarta', '#d97706'),
  ('uns', 'ANJEM UNS', 'Universitas Sebelas Maret',   'Surakarta',  '#2563eb')
ON CONFLICT (id) DO NOTHING;

-- 3. Tambah cabang_id ke semua tabel (nullable dulu agar migrasi bisa jalan)
ALTER TABLE drivers       ADD COLUMN IF NOT EXISTS cabang_id text REFERENCES cabang(id);
ALTER TABLE memberships   ADD COLUMN IF NOT EXISTS cabang_id text REFERENCES cabang(id);
ALTER TABLE izin_records  ADD COLUMN IF NOT EXISTS cabang_id text REFERENCES cabang(id);
ALTER TABLE expenses      ADD COLUMN IF NOT EXISTS cabang_id text REFERENCES cabang(id);
ALTER TABLE shareholders  ADD COLUMN IF NOT EXISTS cabang_id text REFERENCES cabang(id);
ALTER TABLE transfers     ADD COLUMN IF NOT EXISTS cabang_id text REFERENCES cabang(id);

-- 4. Migrasi semua data lama ke UGM
UPDATE drivers       SET cabang_id = 'ugm' WHERE cabang_id IS NULL;
UPDATE memberships   SET cabang_id = 'ugm' WHERE cabang_id IS NULL;
UPDATE izin_records  SET cabang_id = 'ugm' WHERE cabang_id IS NULL;
UPDATE expenses      SET cabang_id = 'ugm' WHERE cabang_id IS NULL;
UPDATE shareholders  SET cabang_id = 'ugm' WHERE cabang_id IS NULL;
UPDATE transfers     SET cabang_id = 'ugm' WHERE cabang_id IS NULL;

-- 5. Set NOT NULL setelah semua row terisi
ALTER TABLE drivers       ALTER COLUMN cabang_id SET NOT NULL;
ALTER TABLE memberships   ALTER COLUMN cabang_id SET NOT NULL;
ALTER TABLE izin_records  ALTER COLUMN cabang_id SET NOT NULL;
ALTER TABLE expenses      ALTER COLUMN cabang_id SET NOT NULL;
ALTER TABLE shareholders  ALTER COLUMN cabang_id SET NOT NULL;
ALTER TABLE transfers     ALTER COLUMN cabang_id SET NOT NULL;

-- 6. Index untuk performa query per cabang
CREATE INDEX IF NOT EXISTS idx_drivers_cabang       ON drivers(cabang_id);
CREATE INDEX IF NOT EXISTS idx_memberships_cabang   ON memberships(cabang_id);
CREATE INDEX IF NOT EXISTS idx_izin_records_cabang  ON izin_records(cabang_id);
CREATE INDEX IF NOT EXISTS idx_expenses_cabang      ON expenses(cabang_id);
CREATE INDEX IF NOT EXISTS idx_shareholders_cabang  ON shareholders(cabang_id);
CREATE INDEX IF NOT EXISTS idx_transfers_cabang     ON transfers(cabang_id);

-- ============================================================
-- SUPABASE AUTH: Setup user metadata
-- Jalankan ini di Supabase Dashboard > Authentication > Users
-- atau lewat Supabase Admin API setelah membuat user
--
-- Setiap admin cabang: { "cabang_id": "ugm", "role": "admin" }
-- Super admin:         { "role": "super_admin" }
--
-- Contoh update metadata user yang sudah ada:
-- UPDATE auth.users
--   SET raw_user_meta_data = '{"cabang_id": "ugm", "role": "admin"}'
--   WHERE email = 'admin@anjemugm.id';
-- ============================================================
