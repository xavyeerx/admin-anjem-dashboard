import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonErr, withErrorHandler } from "@/lib/api";
import type { Database } from "@/lib/supabase/types";
type DriverUpdate = Database["public"]["Tables"]["drivers"]["Update"];

// GET /api/drivers/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    const { id } = await params;

    const { data, error } = await db
      .from("drivers")
      .select(`
        *,
        memberships(*)
      `)
      .eq("id", id)
      .single();

    if (error) return jsonErr(error.message, 404);
    return jsonOk(data);
  });
}

// PUT /api/drivers/[id] — update driver
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    const { id } = await params;
    const body = await req.json();

    const allowedFields: (keyof DriverUpdate)[] = ["nama", "no_whatsapp", "jenis_driver", "status_operasional", "catatan", "tanggal_bergabung"];
    const updates: DriverUpdate = {};
    for (const key of allowedFields) {
      if (key in body) (updates as Record<string, unknown>)[key] = body[key];
    }

    if (Object.keys(updates).length === 0) return jsonErr("Tidak ada field yang diupdate");

    const { data, error } = await db
      .from("drivers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return jsonErr(error.message);
    return jsonOk(data);
  });
}

// DELETE /api/drivers/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    const { id } = await params;

    const { error } = await db.from("drivers").delete().eq("id", id);
    if (error) return jsonErr(error.message);
    return jsonOk({ deleted: true });
  });
}
