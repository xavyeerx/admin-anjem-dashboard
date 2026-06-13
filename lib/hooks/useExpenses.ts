"use client";

import { useApi, apiMutate } from "./useApi";
import type { ExpenseRow } from "@/lib/supabase/types";

export function useExpenses(params?: { kategori?: string; from?: string; to?: string }) {
  const qs = new URLSearchParams();
  if (params?.kategori) qs.set("kategori", params.kategori);
  if (params?.from)     qs.set("from",     params.from);
  if (params?.to)       qs.set("to",       params.to);

  const url = `/api/expenses${qs.toString() ? `?${qs}` : ""}`;
  return useApi<ExpenseRow[]>(url, [params?.kategori, params?.from, params?.to]);
}

export const createExpense = (body: Omit<ExpenseRow, "id" | "created_at">) =>
  apiMutate<ExpenseRow>("/api/expenses", "POST", body);

export const updateExpense = (id: string, body: Partial<ExpenseRow>) =>
  apiMutate<ExpenseRow>(`/api/expenses/${id}`, "PUT", body);

export const deleteExpense = (id: string) =>
  apiMutate(`/api/expenses/${id}`, "DELETE");
