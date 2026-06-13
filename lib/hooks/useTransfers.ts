"use client";

import { useApi, apiMutate } from "./useApi";
import type { TransferRow } from "@/lib/supabase/types";

export function useTransfers() {
  return useApi<TransferRow[]>("/api/transfers");
}

export const createTransfer = (body: Omit<TransferRow, "id" | "created_at">) =>
  apiMutate<TransferRow>("/api/transfers", "POST", body);

export const deleteTransfer = (id: string) =>
  apiMutate(`/api/transfers/${id}`, "DELETE");
