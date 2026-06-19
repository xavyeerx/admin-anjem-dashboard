import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonErr, withErrorHandler } from "@/lib/api";
import { syncDriverLifecycle } from "@/lib/lifecycle";

/**
 * POST /api/[cabang]/memberships/[id]/pay
 * Mark a membership as paid. Body: { tanggal_pembayaran?: string }
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ cabang: string; id: string }> }) {
  return withErrorHandler(async () => {
    const { cabang, id } = await params;
    const db = createServiceClient();
    await syncDriverLifecycle(db, cabang);
    const body = await req.json().catch(() => ({}));

    const tanggal_pembayaran = body.tanggal_pembayaran || new Date().toISOString().split("T")[0];

    // Fetch the membership first
    const { data: membership, error: fetchErr } = await db
      .from("memberships")
      .select("*")
      .eq("cabang_id", cabang)
      .eq("id", id)
      .single();

    if (fetchErr || !membership) return jsonErr("Membership tidak ditemukan", 404);
    if (membership.status_pembayaran === "Lunas") return jsonErr("Membership sudah Lunas");

    // Update to Lunas
    const { data, error } = await db
      .from("memberships")
      .update({ status_pembayaran: "Lunas", tanggal_pembayaran })
      .eq("cabang_id", cabang)
      .eq("id", id)
      .select(`*, drivers(id, nama)`)
      .single();

    if (error) return jsonErr(error.message);

    return jsonOk(data);
  });
}
