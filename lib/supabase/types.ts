// ============================================================
// Supabase Database Types — ANJEM Admin Management System
// ============================================================

export type JenisDriver = "ANJEM" | "JASTIP";
export type StatusOperasional = "Aktif" | "Menunggu Konfirmasi" | "Off Sementara" | "Keluar";
export type StatusPembayaran = "Lunas" | "Belum Bayar" | "Lewat Jatuh Tempo";

export interface Database {
  public: {
    Tables: {
      drivers: {
        Row: {
          id: string;
          nama: string;
          no_whatsapp: string | null;
          jenis_driver: JenisDriver;
          status_operasional: StatusOperasional;
          catatan: string | null;
          tanggal_bergabung: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          no_whatsapp?: string | null;
          jenis_driver: JenisDriver;
          status_operasional?: StatusOperasional;
          catatan?: string | null;
          tanggal_bergabung?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          nama?: string;
          no_whatsapp?: string | null;
          jenis_driver?: JenisDriver;
          status_operasional?: StatusOperasional;
          catatan?: string | null;
          tanggal_bergabung?: string;
          updated_at?: string;
        };
      };

      memberships: {
        Row: {
          id: string;
          driver_id: string;
          jenis_driver: JenisDriver;
          tanggal_mulai: string;
          tanggal_selesai_awal: string;
          hari_izin: number;
          tanggal_selesai_final: string;
          nominal: number;
          status_pembayaran: StatusPembayaran;
          deadline_pembayaran: string | null;
          tanggal_pembayaran: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          jenis_driver: JenisDriver;
          tanggal_mulai: string;
          tanggal_selesai_awal: string;
          hari_izin?: number;
          tanggal_selesai_final: string;
          nominal: number;
          status_pembayaran?: StatusPembayaran;
          deadline_pembayaran?: string | null;
          tanggal_pembayaran?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          driver_id?: string;
          jenis_driver?: JenisDriver;
          tanggal_mulai?: string;
          tanggal_selesai_awal?: string;
          hari_izin?: number;
          tanggal_selesai_final?: string;
          nominal?: number;
          status_pembayaran?: StatusPembayaran;
          deadline_pembayaran?: string | null;
          tanggal_pembayaran?: string | null;
          updated_at?: string;
        };
      };

      izin_records: {
        Row: {
          id: string;
          driver_id: string;
          membership_id: string | null;
          jumlah_hari: number;
          alasan: string | null;
          tanggal_input: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          membership_id?: string | null;
          jumlah_hari: number;
          alasan?: string | null;
          tanggal_input?: string;
          created_at?: string;
        };
        Update: {
          jumlah_hari?: number;
          alasan?: string | null;
          tanggal_input?: string;
        };
      };

      expenses: {
        Row: {
          id: string;
          tanggal: string;
          kategori: string;
          nominal: number;
          keterangan: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tanggal: string;
          kategori: string;
          nominal: number;
          keterangan?: string | null;
          created_at?: string;
        };
        Update: {
          tanggal?: string;
          kategori?: string;
          nominal?: number;
          keterangan?: string | null;
        };
      };

      shareholders: {
        Row: {
          id: string;
          nama: string;
          persentase: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          persentase: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          nama?: string;
          persentase?: number;
          updated_at?: string;
        };
      };

      transfers: {
        Row: {
          id: string;
          tanggal: string;
          nominal: number;
          keterangan: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tanggal: string;
          nominal: number;
          keterangan?: string | null;
          created_at?: string;
        };
        Update: {
          tanggal?: string;
          nominal?: number;
          keterangan?: string | null;
        };
      };
    };

    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ---- Convenience Row Types ----
export type DriverRow       = Database["public"]["Tables"]["drivers"]["Row"];
export type MembershipRow   = Database["public"]["Tables"]["memberships"]["Row"];
export type IzinRow         = Database["public"]["Tables"]["izin_records"]["Row"];
export type ExpenseRow      = Database["public"]["Tables"]["expenses"]["Row"];
export type ShareholderRow  = Database["public"]["Tables"]["shareholders"]["Row"];
export type TransferRow     = Database["public"]["Tables"]["transfers"]["Row"];

// ---- API Response helpers ----
export type ApiSuccess<T> = { data: T; error: null };
export type ApiError      = { data: null; error: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function ok<T>(data: T): ApiSuccess<T> {
  return { data, error: null };
}

export function err(message: string): ApiError {
  return { data: null, error: message };
}
