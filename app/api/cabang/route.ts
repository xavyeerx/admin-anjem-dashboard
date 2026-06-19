import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonErr, withErrorHandler } from "@/lib/api";

// GET /api/cabang — public list of active branches
export async function GET() {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    const { data, error } = await db.from("cabang").select("*").eq("aktif", true).order("created_at");
    if (error) return jsonErr(error.message);
    return jsonOk(data);
  });
}

// POST /api/cabang — super admin creates a branch
export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    const body = await req.json();
    const { id, nama, universitas, kota, logo_url, warna } = body;
    if (!id?.trim() || !nama?.trim() || !universitas?.trim()) return jsonErr("id, nama, universitas wajib diisi");
    const { data, error } = await db
      .from("cabang")
      .insert({
        id: id.trim().toLowerCase(),
        nama,
        universitas,
        kota: kota || "",
        logo_url: logo_url || null,
        warna: warna || "#d97706",
      })
      .select()
      .single();
    if (error) return jsonErr(error.message);
    return jsonOk(data, 201);
  });
}
