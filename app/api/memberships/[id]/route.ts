import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonErr, withErrorHandler, calcFinalDate } from "@/lib/api";
import { syncDriverLifecycle, activateDriverOnNewMembership } from "@/lib/lifecycle";
import type { Database } from "@/lib/supabase/types";
type MembershipUpdate = Database["public"]["Tables"]["memberships"]["Update"];

// GET /api/memberships/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    await syncDriverLifecycle(db);
    const { id } = await params;

    const { data, error } = await db
      .from("memberships")
      .select(`*, drivers(id, nama, no_whatsapp, jenis_driver, status_operasional)`)
      .eq("id", id)
      .single();

    if (error) return jsonErr(error.message, 404);
    return jsonOk(data);
  });
}

// PUT /api/memberships/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    await syncDriverLifecycle(db);
    const { id } = await params;
    const body = await req.json();

    const allowedFields: (keyof MembershipUpdate)[] = [
      "jenis_driver", "tanggal_mulai", "tanggal_selesai_awal",
      "hari_izin", "nominal", "status_pembayaran",
      "deadline_pembayaran", "tanggal_pembayaran",
    ];

    const updates: MembershipUpdate = {};
    for (const key of allowedFields) {
      if (key in body) (updates as Record<string, unknown>)[key] = body[key];
    }

    // Recalculate final date when relevant fields change
    if ("tanggal_selesai_awal" in updates || "hari_izin" in updates) {
      const { data: existing } = await db.from("memberships").select("tanggal_selesai_awal, hari_izin").eq("id", id).single();
      if (existing) {
        const base  = (updates.tanggal_selesai_awal as string) ?? existing.tanggal_selesai_awal;
        const days  = (updates.hari_izin as number) ?? existing.hari_izin;
        updates.tanggal_selesai_final = calcFinalDate(base, days);
      }
    }

    const { data, error } = await db
      .from("memberships")
      .update(updates)
      .eq("id", id)
      .select("*, driver_id")
      .single();

    if (error) return jsonErr(error.message);

    // Sync jenis_driver ke tabel drivers jika diubah
    if (updates.jenis_driver && data?.driver_id) {
      await db.from("drivers").update({ jenis_driver: updates.jenis_driver }).eq("id", data.driver_id);
    }

    // Jika admin menandai Lunas lewat edit, aktifkan driver (kecuali Keluar)
    if (updates.status_pembayaran === "Lunas" && data?.driver_id) {
      await activateDriverOnNewMembership(db, data.driver_id);
    }

    return jsonOk(data);
  });
}

// DELETE /api/memberships/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    const { id } = await params;

    const { error } = await db.from("memberships").delete().eq("id", id);
    if (error) return jsonErr(error.message);
    return jsonOk({ deleted: true });
  });
}
