"use client";

import { useApi, apiMutate } from "./useApi";
import type { DriverRow } from "@/lib/supabase/types";

export function useDrivers(params?: {
  status?: string;
  jenis?: string;
  q?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.jenis)  qs.set("jenis", params.jenis);
  if (params?.q)      qs.set("q", params.q);

  const url = `/api/drivers${qs.toString() ? `?${qs}` : ""}`;
  return useApi<DriverRow[]>(url, [params?.status, params?.jenis, params?.q]);
}

export function useDriver(id: string) {
  return useApi<DriverRow & { memberships: unknown[] }>(`/api/drivers/${id}`, [id]);
}

export const createDriver = (body: Partial<DriverRow>) =>
  apiMutate<DriverRow>("/api/drivers", "POST", body);

export const updateDriver = (id: string, body: Partial<DriverRow>) =>
  apiMutate<DriverRow>(`/api/drivers/${id}`, "PUT", body);

export const deleteDriver = (id: string) =>
  apiMutate(`/api/drivers/${id}`, "DELETE");
