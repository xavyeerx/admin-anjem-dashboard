"use client";

import { useApi, apiMutate } from "./useApi";
import type { IzinRow } from "@/lib/supabase/types";

export function useIzin(cabang: string, driverId?: string) {
  const qs = driverId ? `?driver_id=${driverId}` : "";
  return useApi<IzinRow[]>(`/api/${cabang}/izin${qs}`, [cabang, driverId]);
}

export const createIzin = (cabang: string, body: {
  driver_id: string;
  membership_id?: string;
  jumlah_hari: number;
  alasan?: string;
  tanggal_input?: string;
}) => apiMutate<IzinRow>(`/api/${cabang}/izin`, "POST", body);

export const deleteIzin = (cabang: string, id: string) =>
  apiMutate(`/api/${cabang}/izin/${id}`, "DELETE");
