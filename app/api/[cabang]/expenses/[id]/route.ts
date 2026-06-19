import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonErr, withErrorHandler } from "@/lib/api";
import type { Database } from "@/lib/supabase/types";
type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"];

// PUT /api/[cabang]/expenses/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ cabang: string; id: string }> }) {
  return withErrorHandler(async () => {
    const { cabang, id } = await params;
    const db = createServiceClient();
    const body = await req.json();

    const allowed: (keyof ExpenseUpdate)[] = ["tanggal", "kategori", "nominal", "keterangan"];
    const updates: ExpenseUpdate = {};
    for (const k of allowed) if (k in body) (updates as Record<string, unknown>)[k] = body[k];

    const { data, error } = await db
      .from("expenses")
      .update(updates)
      .eq("cabang_id", cabang)
      .eq("id", id)
      .select()
      .single();

    if (error) return jsonErr(error.message);
    return jsonOk(data);
  });
}

// DELETE /api/[cabang]/expenses/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ cabang: string; id: string }> }) {
  return withErrorHandler(async () => {
    const { cabang, id } = await params;
    const db = createServiceClient();
    const { error } = await db.from("expenses").delete().eq("cabang_id", cabang).eq("id", id);
    if (error) return jsonErr(error.message);
    return jsonOk({ deleted: true });
  });
}
