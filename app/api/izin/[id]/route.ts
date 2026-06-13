import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonErr, withErrorHandler, calcFinalDate } from "@/lib/api";

// DELETE /api/izin/[id] — remove izin and restore membership
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    const { id } = await params;

    // Get the izin first so we can reverse the membership extension
    const { data: izin, error: fetchErr } = await db
      .from("izin_records")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !izin) return jsonErr("Izin tidak ditemukan", 404);

    // Reverse extension on the linked membership
    if (izin.membership_id) {
      const { data: membership } = await db
        .from("memberships")
        .select("tanggal_selesai_awal, hari_izin")
        .eq("id", izin.membership_id)
        .single();

      if (membership) {
        const newHari  = Math.max(0, membership.hari_izin - izin.jumlah_hari);
        const newFinal = calcFinalDate(membership.tanggal_selesai_awal, newHari);
        await db
          .from("memberships")
          .update({ hari_izin: newHari, tanggal_selesai_final: newFinal })
          .eq("id", izin.membership_id);
      }
    }

    const { error } = await db.from("izin_records").delete().eq("id", id);
    if (error) return jsonErr(error.message);
    return jsonOk({ deleted: true });
  });
}
