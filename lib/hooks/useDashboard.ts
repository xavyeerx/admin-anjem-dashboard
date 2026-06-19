"use client";

import { useApi } from "./useApi";

export interface DashboardStats {
  drivers: {
    total: number;
    aktif: number;
    menunggu: number;
    off: number;
    keluar: number;
  };
  payments: {
    belum_bayar: number;
    lewat_jatuh_tempo: number;
  };
  finance: {
    total_pemasukan: number;
    total_pengeluaran: number;
    laba_bersih: number;
    expense_by_category: Record<string, number>;
  };
  monthly_revenue: { bulan: string; pemasukan: number }[];
  reminders: {
    lewat_jatuh_tempo: {
      membership_id: string;
      driver: { id: string; nama: string; no_whatsapp: string | null; jenis_driver: string } | null;
      deadline: string | null;
      nominal: number;
      days_overdue: number;
    }[];
    belum_bayar: {
      membership_id: string;
      driver: { id: string; nama: string; no_whatsapp: string | null; jenis_driver: string } | null;
      deadline: string | null;
      nominal: number;
      days_left: number | null;
    }[];
    menunggu_konfirmasi: { driver_id: string; nama: string }[];
    off_sementara: { driver_id: string; nama: string }[];
  };
  shareholders: Array<{
    id: string;
    nama: string;
    persentase: number;
    hak: number;
    sudah_transfer?: number;
    sisa?: number;
  }>;
}

export function useDashboardStats(cabang: string) {
  return useApi<DashboardStats>(`/api/${cabang}/dashboard/stats`, [cabang]);
}
