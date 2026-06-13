import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonErr, withErrorHandler } from "@/lib/api";

const VALID_CATEGORIES = [
  "Operasional", "Marketing", "Bonus", "Tools", "Domain", "Hosting", "Lainnya",
];

// GET /api/expenses
export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    const { searchParams } = req.nextUrl;

    let query = db
      .from("expenses")
      .select("*")
      .order("tanggal", { ascending: false });

    const kategori  = searchParams.get("kategori");
    const dateFrom  = searchParams.get("from");
    const dateTo    = searchParams.get("to");

    if (kategori) query = query.eq("kategori", kategori);
    if (dateFrom) query = query.gte("tanggal", dateFrom);
    if (dateTo)   query = query.lte("tanggal", dateTo);

    const { data, error } = await query;
    if (error) return jsonErr(error.message);
    return jsonOk(data);
  });
}

// POST /api/expenses
export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    const body = await req.json();

    const { tanggal, kategori, nominal, keterangan } = body;

    if (!tanggal)              return jsonErr("tanggal wajib diisi");
    if (!kategori)             return jsonErr("kategori wajib diisi");
    if (!nominal || nominal <= 0) return jsonErr("nominal harus > 0");
    if (!VALID_CATEGORIES.includes(kategori)) {
      return jsonErr(`kategori tidak valid. Pilihan: ${VALID_CATEGORIES.join(", ")}`);
    }

    const { data, error } = await db
      .from("expenses")
      .insert({ tanggal, kategori, nominal, keterangan: keterangan?.trim() || null })
      .select()
      .single();

    if (error) return jsonErr(error.message);
    return jsonOk(data, 201);
  });
}
