import { createServiceClient } from "@/lib/supabase/server";
import { jsonOk, jsonErr, withErrorHandler } from "@/lib/api";
import { syncDriverLifecycle } from "@/lib/lifecycle";

type DrvRow = { id: string; nama: string; status_operasional: string; jenis_driver: string };
type MemRow = {
  id: string; status_pembayaran: string; jenis_driver: string; nominal: number;
  driver_id: string; tanggal_mulai: string; deadline_pembayaran: string | null;
  tanggal_selesai_final: string;
  drivers: { id: string; nama: string; no_whatsapp: string | null; jenis_driver: string } | null;
};
type ExpRow = { id: string; nominal: number; kategori: string; tanggal: string };
type TrfRow = { id: string; nominal: number };

/**
 * GET /api/dashboard/stats
 * Returns aggregated stats for the dashboard in a single request.
 */
export async function GET() {
  return withErrorHandler(async () => {
    const db = createServiceClient();
    await syncDriverLifecycle(db);

    // Run all queries in parallel for performance
    const [driversRes, membershipsRes, expensesRes, transfersRes] = await Promise.all([
      db.from("drivers").select("id, nama, status_operasional, jenis_driver"),
      db.from("memberships").select("id, status_pembayaran, jenis_driver, nominal, driver_id, tanggal_mulai, deadline_pembayaran, tanggal_selesai_final, drivers(id, nama, no_whatsapp, jenis_driver)"),
      db.from("expenses").select("id, nominal, kategori, tanggal"),
      db.from("transfers").select("id, nominal"),
    ]);

    if (driversRes.error)     return jsonErr(driversRes.error.message);
    if (membershipsRes.error) return jsonErr(membershipsRes.error.message);
    if (expensesRes.error)    return jsonErr(expensesRes.error.message);
    if (transfersRes.error)   return jsonErr(transfersRes.error.message);

    const drivers     = (driversRes.data     as unknown as DrvRow[]) ?? [];
    const memberships = (membershipsRes.data as unknown as MemRow[]) ?? [];
    const expenses    = (expensesRes.data    as unknown as ExpRow[]) ?? [];
    const transfers   = (transfersRes.data   as unknown as TrfRow[]) ?? [];

    // ---- Driver stats ----
    const driverStats = {
      total:    drivers.filter((d) => d.status_operasional !== "Keluar").length,
      aktif:    drivers.filter((d) => d.status_operasional === "Aktif").length,
      menunggu: drivers.filter((d) => d.status_operasional === "Menunggu Konfirmasi").length,
      off:      drivers.filter((d) => d.status_operasional === "Off Sementara").length,
      keluar:   drivers.filter((d) => d.status_operasional === "Keluar").length,
    };

    // ---- Payment stats ----
    const paymentStats = {
      belum_bayar:      memberships.filter((m) => m.status_pembayaran === "Belum Bayar").length,
      lewat_jatuh_tempo: memberships.filter((m) => m.status_pembayaran === "Lewat Jatuh Tempo").length,
    };

    // ---- Financial stats ----
    const totalPemasukan = memberships
      .filter((m) => m.status_pembayaran === "Lunas")
      .reduce((s, m) => s + m.nominal, 0);
    const totalPengeluaran = expenses.reduce((s, e) => s + e.nominal, 0);
    const labaBersih       = totalPemasukan - totalPengeluaran;

    // ---- Expense by category ----
    const expenseByCategory = expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.kategori] = (acc[e.kategori] ?? 0) + e.nominal;
      return acc;
    }, {});

    // ---- Monthly revenue (last 6 months) ----
    const monthlyRevenue: { bulan: string; pemasukan: number }[] = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year  = d.getFullYear();
      const month = d.getMonth() + 1;
      const label = d.toLocaleDateString("id-ID", { month: "short" });

      const inMonth = memberships.filter((m) => {
        if (m.status_pembayaran !== "Lunas") return false;
        const dt = new Date(m.tanggal_mulai);
        return dt.getFullYear() === year && dt.getMonth() + 1 === month;
      });

      monthlyRevenue.push({
        bulan: label,
        pemasukan: inMonth.reduce((s, m) => s + m.nominal, 0),
      });
    }

    // ---- Reminders ----
    const today_str = new Date().toISOString().split("T")[0];

    const reminders = {
      lewat_jatuh_tempo: memberships
        .filter((m) => m.status_pembayaran === "Lewat Jatuh Tempo")
        .map((m) => ({
          membership_id: m.id,
          driver: m.drivers,
          deadline: m.deadline_pembayaran,
          nominal: m.nominal,
          days_overdue: m.deadline_pembayaran
            ? Math.floor((new Date(today_str).getTime() - new Date(m.deadline_pembayaran).getTime()) / 86400000)
            : 0,
        })),

      belum_bayar: memberships
        .filter((m) => m.status_pembayaran === "Belum Bayar")
        .map((m) => ({
          membership_id: m.id,
          driver: m.drivers,
          deadline: m.deadline_pembayaran,
          nominal: m.nominal,
          days_left: m.deadline_pembayaran
            ? Math.floor((new Date(m.deadline_pembayaran).getTime() - new Date(today_str).getTime()) / 86400000)
            : null,
        })),

      menunggu_konfirmasi: drivers
        .filter((d) => d.status_operasional === "Menunggu Konfirmasi")
        .map((d) => ({ driver_id: d.id, nama: d.nama })),

      off_sementara: drivers
        .filter((d) => d.status_operasional === "Off Sementara")
        .map((d) => ({ driver_id: d.id, nama: d.nama })),
    };

    // ---- Shareholder summary ----
    const { data: shareholders } = await db.from("shareholders").select("*").order("persentase", { ascending: false });
    const totalTransfer = transfers.reduce((s, t) => s + t.nominal, 0);

    const shareholderSummary = ((shareholders as unknown as { id: string; nama: string; persentase: number }[]) ?? []).map((sh) => ({
      ...sh,
      hak: Math.round(labaBersih * (sh.persentase / 100)),
      ...(sh.nama === "Bintang" ? { sudah_transfer: totalTransfer, sisa: Math.round(labaBersih * (sh.persentase / 100)) - totalTransfer } : {}),
    }));

    return jsonOk({
      drivers: driverStats,
      payments: paymentStats,
      finance: {
        total_pemasukan: totalPemasukan,
        total_pengeluaran: totalPengeluaran,
        laba_bersih: labaBersih,
        expense_by_category: expenseByCategory,
      },
      monthly_revenue: monthlyRevenue,
      reminders,
      shareholders: shareholderSummary,
    });
  });
}
