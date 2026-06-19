import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonErr, withErrorHandler } from "@/lib/api";

// GET /api/[cabang]/transfers
export async function GET(_req: NextRequest, { params }: { params: Promise<{ cabang: string }> }) {
  return withErrorHandler(async () => {
    const { cabang } = await params;
    const db = createServiceClient();
    const { data, error } = await db
      .from("transfers")
      .select("*")
      .eq("cabang_id", cabang)
      .order("tanggal", { ascending: false });

    if (error) return jsonErr(error.message);
    return jsonOk(data);
  });
}

// POST /api/[cabang]/transfers
export async function POST(req: NextRequest, { params }: { params: Promise<{ cabang: string }> }) {
  return withErrorHandler(async () => {
    const { cabang } = await params;
    const db = createServiceClient();
    const body = await req.json();

    const { tanggal, nominal, keterangan } = body;

    if (!tanggal)              return jsonErr("tanggal wajib diisi");
    if (!nominal || nominal <= 0) return jsonErr("nominal harus > 0");

    const { data, error } = await db
      .from("transfers")
      .insert({
        cabang_id: cabang,
        tanggal,
        nominal,
        keterangan: keterangan?.trim() || null,
      })
      .select()
      .single();

    if (error) return jsonErr(error.message);
    return jsonOk(data, 201);
  });
}
