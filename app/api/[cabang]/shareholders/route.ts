import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonErr, withErrorHandler } from "@/lib/api";

// GET /api/[cabang]/shareholders — fetch config + computed profit distribution
export async function GET(_req: NextRequest, { params }: { params: Promise<{ cabang: string }> }) {
  return withErrorHandler(async () => {
    const { cabang } = await params;
    const db = createServiceClient();

    // Fetch shareholder config
    const { data: shareholders, error: shErr } = await db
      .from("shareholders")
      .select("*")
      .eq("cabang_id", cabang)
      .order("persentase", { ascending: false });

    if (shErr) return jsonErr(shErr.message);

    // Total revenue (Lunas memberships)
    const { data: revenues } = await db
      .from("memberships")
      .select("nominal")
      .eq("cabang_id", cabang)
      .eq("status_pembayaran", "Lunas");

    const totalPemasukan = (revenues ?? []).reduce((s: number, r: { nominal: number }) => s + r.nominal, 0);

    // Total expenses
    const { data: expenses } = await db.from("expenses").select("nominal").eq("cabang_id", cabang);
    const totalPengeluaran = (expenses ?? []).reduce((s: number, e: { nominal: number }) => s + e.nominal, 0);

    const labaBersih = totalPemasukan - totalPengeluaran;

    // Transfers to Bintang
    const { data: transfers } = await db.from("transfers").select("nominal").eq("cabang_id", cabang);
    const totalTransfer = (transfers ?? []).reduce((s: number, t: { nominal: number }) => s + t.nominal, 0);

    // Compute hak masing-masing
    const distribution = (shareholders ?? []).map((sh: { id: string; nama: string; persentase: number; created_at: string; updated_at: string }) => ({
      ...sh,
      hak: Math.round(labaBersih * (sh.persentase / 100)),
    }));

    return jsonOk({
      shareholders: distribution,
      summary: {
        total_pemasukan: totalPemasukan,
        total_pengeluaran: totalPengeluaran,
        laba_bersih: labaBersih,
        total_transfer_bintang: totalTransfer,
      },
    });
  });
}

// PUT /api/[cabang]/shareholders — update shareholder percentages
export async function PUT(req: NextRequest, { params }: { params: Promise<{ cabang: string }> }) {
  return withErrorHandler(async () => {
    const { cabang } = await params;
    const db = createServiceClient();
    const body = await req.json();

    // Expected: [{ id: "uuid", persentase: 70 }, { id: "uuid", persentase: 30 }]
    const updates: { id: string; persentase: number }[] = body.shareholders;

    if (!Array.isArray(updates) || updates.length === 0) {
      return jsonErr("Body harus berisi array shareholders");
    }

    const total = updates.reduce((s, sh) => s + sh.persentase, 0);
    if (total !== 100) {
      return jsonErr(`Total persentase harus 100, diterima: ${total}`);
    }

    const results = await Promise.all(
      updates.map(({ id, persentase }) =>
        db.from("shareholders").update({ persentase }).eq("cabang_id", cabang).eq("id", id).select().single(),
      ),
    );

    const failed = results.find((r) => r.error);
    if (failed?.error) return jsonErr(failed.error.message);

    return jsonOk(results.map((r) => r.data));
  });
}
