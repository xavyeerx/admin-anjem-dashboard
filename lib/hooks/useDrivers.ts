"use client";

import { useApi, apiMutate } from "./useApi";
import type { DriverRow } from "@/lib/supabase/types";

export function useDrivers(cabang: string, params?: {
  status?: string;
  jenis?: string;
  q?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.jenis)  qs.set("jenis", params.jenis);
  if (params?.q)      qs.set("q", params.q);

  const url = `/api/${cabang}/drivers${qs.toString() ? `?${qs}` : ""}`;
  return useApi<DriverRow[]>(url, [cabang, params?.status, params?.jenis, params?.q]);
}

export function useDriver(cabang: string, id: string) {
  return useApi<DriverRow & { memberships: unknown[] }>(`/api/${cabang}/drivers/${id}`, [cabang, id]);
}

export const createDriver = (cabang: string, body: Partial<DriverRow>) =>
  apiMutate<DriverRow>(`/api/${cabang}/drivers`, "POST", body);

export const updateDriver = (cabang: string, id: string, body: Partial<DriverRow>) =>
  apiMutate<DriverRow>(`/api/${cabang}/drivers/${id}`, "PUT", body);

export const deleteDriver = (cabang: string, id: string) =>
  apiMutate(`/api/${cabang}/drivers/${id}`, "DELETE");
