"use client";

import { useApi, apiMutate } from "./useApi";
import type { MembershipRow } from "@/lib/supabase/types";

type MembershipWithDriver = MembershipRow & {
  drivers: { id: string; nama: string; no_whatsapp: string; jenis_driver: string; status_operasional: string } | null;
};

export function useMemberships(cabang: string, params?: { driver_id?: string; status?: string; jenis?: string }) {
  const qs = new URLSearchParams();
  if (params?.driver_id) qs.set("driver_id", params.driver_id);
  if (params?.status)    qs.set("status",    params.status);
  if (params?.jenis)     qs.set("jenis",     params.jenis);

  const url = `/api/${cabang}/memberships${qs.toString() ? `?${qs}` : ""}`;
  return useApi<MembershipWithDriver[]>(url, [cabang, params?.driver_id, params?.status, params?.jenis]);
}

export const createMembership = (cabang: string, body: Partial<MembershipRow>) =>
  apiMutate<MembershipRow>(`/api/${cabang}/memberships`, "POST", body);

export const updateMembership = (cabang: string, id: string, body: Partial<MembershipRow>) =>
  apiMutate<MembershipRow>(`/api/${cabang}/memberships/${id}`, "PUT", body);

export const markMembershipPaid = (cabang: string, id: string, tanggal?: string) =>
  apiMutate<MembershipRow>(`/api/${cabang}/memberships/${id}/pay`, "POST", { tanggal_pembayaran: tanggal });

export const deleteMembership = (cabang: string, id: string) =>
  apiMutate(`/api/${cabang}/memberships/${id}`, "DELETE");
