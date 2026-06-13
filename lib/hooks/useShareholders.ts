"use client";

import { useApi, apiMutate } from "./useApi";
import type { ShareholderRow } from "@/lib/supabase/types";

interface ShareholderData {
  shareholders: Array<ShareholderRow & { hak: number; sudah_transfer?: number; sisa?: number }>;
  summary: {
    total_pemasukan: number;
    total_pengeluaran: number;
    laba_bersih: number;
    total_transfer_bintang: number;
  };
}

export function useShareholders() {
  return useApi<ShareholderData>("/api/shareholders");
}

export const updateShareholders = (shareholders: { id: string; persentase: number }[]) =>
  apiMutate("/api/shareholders", "PUT", { shareholders });
