import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonErr, withErrorHandler } from "@/lib/api";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const { id } = await params;
    const db = createServiceClient();
    const { data, error } = await db.from("cabang").select("*").eq("id", id).single();
    if (error) return jsonErr(error.message, 404);
    return jsonOk(data);
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const { id } = await params;
    const db = createServiceClient();
    const body = await req.json();
    const { nama, universitas, kota, logo_url, warna, aktif } = body;
    const { data, error } = await db
      .from("cabang")
      .update({ nama, universitas, kota, logo_url, warna, aktif })
      .eq("id", id)
      .select()
      .single();
    if (error) return jsonErr(error.message);
    return jsonOk(data);
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const { id } = await params;
    const db = createServiceClient();
    const { error } = await db.from("cabang").update({ aktif: false }).eq("id", id);
    if (error) return jsonErr(error.message);
    return jsonOk({ id, aktif: false });
  });
}
