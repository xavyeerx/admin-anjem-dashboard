"use client";

import { useApi, apiMutate } from "./useApi";
import type { TransferRow } from "@/lib/supabase/types";

export function useTransfers(cabang: string) {
  return useApi<TransferRow[]>(`/api/${cabang}/transfers`, [cabang]);
}

export const createTransfer = (cabang: string, body: Omit<TransferRow, "id" | "created_at" | "cabang_id">) =>
  apiMutate<TransferRow>(`/api/${cabang}/transfers`, "POST", body);

export const deleteTransfer = (cabang: string, id: string) =>
  apiMutate(`/api/${cabang}/transfers/${id}`, "DELETE");
