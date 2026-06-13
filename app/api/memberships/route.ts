import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonErr, withErrorHandler, calcFinalDate } from "@/lib/api";
import {
  syncDriverLifecycle,
  activateDriverOnNewMembership,
  resolveMembershipPaymentFields,
} from "@/lib/lifecycle";

// GET /api/memberships — list with optional filters
export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    await syncDriverLifecycle(db);
    const { searchParams } = req.nextUrl;

    let query = db
      .from("memberships")
      .select(`*, drivers(id, nama, no_whatsapp, jenis_driver, status_operasional)`)
      .order("tanggal_mulai", { ascending: false });

    const driverId = searchParams.get("driver_id");
    const status   = searchParams.get("status");
    const jenis    = searchParams.get("jenis");

    if (driverId) query = query.eq("driver_id", driverId);
    if (status)   query = query.eq("status_pembayaran", status);
    if (jenis)    query = query.eq("jenis_driver", jenis);

    const { data, error } = await query;
    if (error) return jsonErr(error.message);
    return jsonOk(data);
  });
}

// POST /api/memberships — create membership
export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    await syncDriverLifecycle(db);
    const body = await req.json();

    const {
      driver_id,
      jenis_driver,
      tanggal_mulai,
      tanggal_selesai_awal,
      hari_izin = 0,
      nominal,
      status_pembayaran = "Belum Bayar",
      tanggal_pembayaran = null,
    } = body;

    // Validasi wajib
    if (!driver_id)           return jsonErr("driver_id wajib diisi");
    if (!jenis_driver)        return jsonErr("jenis_driver wajib diisi");
    if (!tanggal_mulai)       return jsonErr("tanggal_mulai wajib diisi");
    if (!tanggal_selesai_awal)return jsonErr("tanggal_selesai_awal wajib diisi");
    if (!nominal || nominal <= 0) return jsonErr("nominal harus > 0");

    // Pastikan driver ada
    const { data: driver, error: dErr } = await db
      .from("drivers").select("id, jenis_driver").eq("id", driver_id).single();
    if (dErr || !driver) return jsonErr("Driver tidak ditemukan", 404);

    const tanggal_selesai_final = calcFinalDate(tanggal_selesai_awal, hari_izin);
    const paymentFields = resolveMembershipPaymentFields(
      tanggal_mulai,
      status_pembayaran,
      tanggal_pembayaran,
    );

    const { data, error } = await db
      .from("memberships")
      .insert({
        driver_id,
        jenis_driver: jenis_driver || driver.jenis_driver,
        tanggal_mulai,
        tanggal_selesai_awal,
        hari_izin,
        tanggal_selesai_final,
        nominal,
        ...paymentFields,
      })
      .select(`*, drivers(id, nama)`)
      .single();

    if (error) return jsonErr(error.message);

    // Sync jenis_driver ke tabel drivers sesuai pilihan di membership
    await db.from("drivers").update({ jenis_driver: jenis_driver }).eq("id", driver_id);

    // Flow 1 & 3: membership baru → driver Aktif (kecuali Keluar)
    await activateDriverOnNewMembership(db, driver_id);

    return jsonOk(data, 201);
  });
}
