import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonErr, withErrorHandler } from "@/lib/api";

// GET /api/transfers
export async function GET() {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    const { data, error } = await db
      .from("transfers")
      .select("*")
      .order("tanggal", { ascending: false });

    if (error) return jsonErr(error.message);
    return jsonOk(data);
  });
}

// POST /api/transfers
export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    const body = await req.json();

    const { tanggal, nominal, keterangan } = body;

    if (!tanggal)              return jsonErr("tanggal wajib diisi");
    if (!nominal || nominal <= 0) return jsonErr("nominal harus > 0");

    const { data, error } = await db
      .from("transfers")
      .insert({
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
