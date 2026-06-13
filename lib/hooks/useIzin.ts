"use client";

import { useApi, apiMutate } from "./useApi";
import type { IzinRow } from "@/lib/supabase/types";

export function useIzin(driverId?: string) {
  const qs = driverId ? `?driver_id=${driverId}` : "";
  return useApi<IzinRow[]>(`/api/izin${qs}`, [driverId]);
}

export const createIzin = (body: {
  driver_id: string;
  membership_id?: string;
  jumlah_hari: number;
  alasan?: string;
  tanggal_input?: string;
}) => apiMutate<IzinRow>("/api/izin", "POST", body);

export const deleteIzin = (id: string) =>
  apiMutate(`/api/izin/${id}`, "DELETE");
