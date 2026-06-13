import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonErr, withErrorHandler, calcFinalDate } from "@/lib/api";

// GET /api/izin
export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    const { searchParams } = req.nextUrl;

    let query = db
      .from("izin_records")
      .select(`*, drivers(id, nama, jenis_driver), memberships(id, tanggal_mulai, tanggal_selesai_awal, tanggal_selesai_final, hari_izin)`)
      .order("tanggal_input", { ascending: false });

    const driverId = searchParams.get("driver_id");
    if (driverId) query = query.eq("driver_id", driverId);

    const { data, error } = await query;
    if (error) return jsonErr(error.message);
    return jsonOk(data);
  });
}

// POST /api/izin — add izin and extend membership
export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    const body = await req.json();

    const { driver_id, membership_id, jumlah_hari, alasan, tanggal_input } = body;

    if (!driver_id)           return jsonErr("driver_id wajib diisi");
    if (!jumlah_hari || jumlah_hari < 1) return jsonErr("jumlah_hari harus >= 1");

    // Get active membership if not specified
    let resolvedMembershipId = membership_id;
    if (!resolvedMembershipId) {
      const { data: latestMembership } = await db
        .from("memberships")
        .select("id")
        .eq("driver_id", driver_id)
        .order("tanggal_mulai", { ascending: false })
        .limit(1)
        .single();
      resolvedMembershipId = latestMembership?.id || null;
    }

    // Extend the membership final date
    if (resolvedMembershipId) {
      const { data: membership, error: mErr } = await db
        .from("memberships")
        .select("tanggal_selesai_awal, hari_izin, tanggal_selesai_final")
        .eq("id", resolvedMembershipId)
        .single();

      if (mErr || !membership) return jsonErr("Membership tidak ditemukan", 404);

      const newHariIzin = membership.hari_izin + jumlah_hari;
      const newFinal    = calcFinalDate(membership.tanggal_selesai_awal, newHariIzin);

      await db
        .from("memberships")
        .update({ hari_izin: newHariIzin, tanggal_selesai_final: newFinal })
        .eq("id", resolvedMembershipId);
    }

    // Insert izin record
    const { data, error } = await db
      .from("izin_records")
      .insert({
        driver_id,
        membership_id: resolvedMembershipId,
        jumlah_hari,
        alasan: alasan?.trim() || null,
        tanggal_input: tanggal_input || new Date().toISOString().split("T")[0],
      })
      .select(`*, drivers(id, nama, jenis_driver)`)
      .single();

    if (error) return jsonErr(error.message);
    return jsonOk(data, 201);
  });
}
