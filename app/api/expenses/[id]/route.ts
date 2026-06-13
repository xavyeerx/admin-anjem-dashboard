import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonErr, withErrorHandler } from "@/lib/api";
import type { Database } from "@/lib/supabase/types";
type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"];

// PUT /api/expenses/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    const { id } = await params;
    const body = await req.json();

    const allowed: (keyof ExpenseUpdate)[] = ["tanggal", "kategori", "nominal", "keterangan"];
    const updates: ExpenseUpdate = {};
    for (const k of allowed) if (k in body) (updates as Record<string, unknown>)[k] = body[k];

    const { data, error } = await db
      .from("expenses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return jsonErr(error.message);
    return jsonOk(data);
  });
}

// DELETE /api/expenses/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    const { id } = await params;
    const { error } = await db.from("expenses").delete().eq("id", id);
    if (error) return jsonErr(error.message);
    return jsonOk({ deleted: true });
  });
}
