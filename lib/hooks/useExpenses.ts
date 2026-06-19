"use client";

import { useApi, apiMutate } from "./useApi";
import type { ExpenseRow } from "@/lib/supabase/types";

export function useExpenses(cabang: string, params?: { kategori?: string; from?: string; to?: string }) {
  const qs = new URLSearchParams();
  if (params?.kategori) qs.set("kategori", params.kategori);
  if (params?.from)     qs.set("from",     params.from);
  if (params?.to)       qs.set("to",       params.to);

  const url = `/api/${cabang}/expenses${qs.toString() ? `?${qs}` : ""}`;
  return useApi<ExpenseRow[]>(url, [cabang, params?.kategori, params?.from, params?.to]);
}

export const createExpense = (cabang: string, body: Omit<ExpenseRow, "id" | "created_at" | "cabang_id">) =>
  apiMutate<ExpenseRow>(`/api/${cabang}/expenses`, "POST", body);

export const updateExpense = (cabang: string, id: string, body: Partial<ExpenseRow>) =>
  apiMutate<ExpenseRow>(`/api/${cabang}/expenses/${id}`, "PUT", body);

export const deleteExpense = (cabang: string, id: string) =>
  apiMutate(`/api/${cabang}/expenses/${id}`, "DELETE");
