-- ============================================================
-- ANJEM Admin Management System — Database Schema
-- Run this in Supabase SQL Editor to set up all tables
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM types
-- ============================================================
DO $$ BEGIN
  CREATE TYPE jenis_driver_enum AS ENUM ('ANJEM', 'JASTIP');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE status_operasional_enum AS ENUM ('Aktif', 'Menunggu Konfirmasi', 'Off Sementara', 'Keluar');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE status_pembayaran_enum AS ENUM ('Lunas', 'Belum Bayar', 'Lewat Jatuh Tempo');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- DRIVERS
-- ============================================================
CREATE TABLE IF NOT EXISTS drivers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama                TEXT NOT NULL,
  no_whatsapp         TEXT,
  jenis_driver        jenis_driver_enum NOT NULL,
  status_operasional  status_operasional_enum NOT NULL DEFAULT 'Aktif',
  catatan             TEXT,
  tanggal_bergabung   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MEMBERSHIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS memberships (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id             UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  jenis_driver          jenis_driver_enum NOT NULL,
  tanggal_mulai         DATE NOT NULL,
  tanggal_selesai_awal  DATE NOT NULL,
  hari_izin             INTEGER NOT NULL DEFAULT 0,
  tanggal_selesai_final DATE NOT NULL,
  nominal               INTEGER NOT NULL,
  status_pembayaran     status_pembayaran_enum NOT NULL DEFAULT 'Belum Bayar',
  deadline_pembayaran   DATE,
  tanggal_pembayaran    DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- IZIN RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS izin_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id       UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  membership_id   UUID REFERENCES memberships(id) ON DELETE SET NULL,
  jumlah_hari     INTEGER NOT NULL CHECK (jumlah_hari > 0),
  alasan          TEXT,
  tanggal_input   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EXPENSES (pengeluaran)
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal     DATE NOT NULL DEFAULT CURRENT_DATE,
  kategori    TEXT NOT NULL,
  nominal     INTEGER NOT NULL CHECK (nominal > 0),
  keterangan  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SHAREHOLDERS (config — only 2 rows: Diki & Bintang)
-- ============================================================
CREATE TABLE IF NOT EXISTS shareholders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama        TEXT NOT NULL UNIQUE,
  persentase  INTEGER NOT NULL DEFAULT 0
    CHECK (persentase >= 0 AND persentase <= 100),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRANSFERS (to Bintang)
-- ============================================================
CREATE TABLE IF NOT EXISTS transfers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal     DATE NOT NULL DEFAULT CURRENT_DATE,
  nominal     INTEGER NOT NULL CHECK (nominal > 0),
  keterangan  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_memberships_driver_id  ON memberships(driver_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status     ON memberships(status_pembayaran);
CREATE INDEX IF NOT EXISTS idx_izin_driver_id         ON izin_records(driver_id);
CREATE INDEX IF NOT EXISTS idx_izin_membership_id     ON izin_records(membership_id);
CREATE INDEX IF NOT EXISTS idx_expenses_tanggal       ON expenses(tanggal);
CREATE INDEX IF NOT EXISTS idx_transfers_tanggal      ON transfers(tanggal);

-- ============================================================
-- updated_at trigger helper
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_drivers_updated_at
  BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_shareholders_updated_at
  BEFORE UPDATE ON shareholders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- AUTO status: Lewat Jatuh Tempo
-- Runs every time a membership row is fetched/updated
-- ============================================================
CREATE OR REPLACE FUNCTION auto_update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status_pembayaran = 'Belum Bayar'
     AND NEW.deadline_pembayaran IS NOT NULL
     AND NEW.deadline_pembayaran < CURRENT_DATE
  THEN
    NEW.status_pembayaran = 'Lewat Jatuh Tempo';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_auto_payment_status
  BEFORE INSERT OR UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION auto_update_payment_status();

-- ============================================================
-- SEED DATA (default shareholders)
-- ============================================================
INSERT INTO shareholders (nama, persentase)
VALUES
  ('Diki',    70),
  ('Bintang', 30)
ON CONFLICT (nama) DO NOTHING;
