import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonErr, withErrorHandler } from "@/lib/api";
import { syncDriverLifecycle } from "@/lib/lifecycle";
import type { JenisDriver, StatusOperasional } from "@/lib/supabase/types";

// GET /api/drivers — list all drivers, optional ?status=&jenis=&q=
export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    await syncDriverLifecycle(db);
    const { searchParams } = req.nextUrl;

    let query = db.from("drivers").select("*").order("tanggal_bergabung", { ascending: false });

    const status = searchParams.get("status");
    const jenis  = searchParams.get("jenis");
    const q      = searchParams.get("q");

    if (status) query = query.eq("status_operasional", status);
    if (jenis)  query = query.eq("jenis_driver", jenis);
    if (q)      query = query.ilike("nama", `%${q}%`);

    const { data, error } = await query;
    if (error) return jsonErr(error.message);
    return jsonOk(data);
  });
}

// POST /api/drivers — create new driver
export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    const body = await req.json();

    const { nama, no_whatsapp, jenis_driver, status_operasional, catatan, tanggal_bergabung } = body;

    if (!nama?.trim())      return jsonErr("nama wajib diisi");
    if (!jenis_driver)      return jsonErr("jenis_driver wajib diisi (ANJEM / JASTIP)");

    const validJenis: JenisDriver[] = ["ANJEM", "JASTIP"];
    const validStatus: StatusOperasional[] = ["Aktif", "Menunggu Konfirmasi", "Off Sementara", "Keluar"];

    if (!validJenis.includes(jenis_driver))    return jsonErr("jenis_driver tidak valid");
    if (status_operasional && !validStatus.includes(status_operasional)) {
      return jsonErr("status_operasional tidak valid");
    }

    const { data, error } = await db
      .from("drivers")
      .insert({
        nama: nama.trim(),
        no_whatsapp: no_whatsapp?.trim() || null,
        jenis_driver,
        status_operasional: status_operasional || "Aktif",
        catatan: catatan?.trim() || null,
        tanggal_bergabung: tanggal_bergabung || new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (error) return jsonErr(error.message);
    return jsonOk(data, 201);
  });
}
