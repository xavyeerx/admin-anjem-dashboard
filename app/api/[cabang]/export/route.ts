import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";

type ExportType = "drivers" | "membership" | "keuangan" | "shareholder";
type ExportFormat = "xlsx" | "csv";

async function fetchDrivers(db: ReturnType<typeof createServiceClient>, cabang: string) {
  const { data, error } = await db
    .from("drivers")
    .select("*")
    .eq("cabang_id", cabang)
    .order("tanggal_bergabung", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: Record<string, unknown>) => ({
    "Nama": r.nama,
    "No WhatsApp": r.no_whatsapp ?? "-",
    "Jenis Driver": r.jenis_driver,
    "Status Operasional": r.status_operasional,
    "Tanggal Bergabung": r.tanggal_bergabung,
    "Catatan": r.catatan ?? "-",
  }));
}

async function fetchMembership(db: ReturnType<typeof createServiceClient>, cabang: string) {
  const { data, error } = await db
    .from("memberships")
    .select("*, drivers(nama)")
    .eq("cabang_id", cabang)
    .order("tanggal_mulai", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: Record<string, unknown>) => {
    const driver = r.drivers as Record<string, unknown> | null;
    return {
      "Nama Driver": driver?.nama ?? "-",
      "Jenis Driver": r.jenis_driver,
      "Tanggal Mulai": r.tanggal_mulai,
      "Tanggal Selesai Awal": r.tanggal_selesai_awal,
      "Hari Izin": r.hari_izin,
      "Tanggal Selesai Final": r.tanggal_selesai_final,
      "Nominal (Rp)": r.nominal,
      "Status Pembayaran": r.status_pembayaran,
      "Deadline Pembayaran": r.deadline_pembayaran ?? "-",
      "Tanggal Pembayaran": r.tanggal_pembayaran ?? "-",
    };
  });
}

async function fetchKeuangan(db: ReturnType<typeof createServiceClient>, cabang: string) {
  const [{ data: memberships, error: e1 }, { data: expenses, error: e2 }, { data: transfers, error: e3 }] =
    await Promise.all([
      db.from("memberships").select("tanggal_mulai, nominal, status_pembayaran, tanggal_pembayaran").eq("cabang_id", cabang).order("tanggal_mulai", { ascending: false }),
      db.from("expenses").select("*").eq("cabang_id", cabang).order("tanggal", { ascending: false }),
      db.from("transfers").select("*").eq("cabang_id", cabang).order("tanggal", { ascending: false }),
    ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);
  if (e3) throw new Error(e3.message);

  const rows: Record<string, unknown>[] = [];

  for (const m of memberships ?? []) {
    rows.push({
      "Tanggal": m.tanggal_pembayaran ?? m.tanggal_mulai,
      "Jenis": "Pemasukan",
      "Kategori": "Membership",
      "Nominal (Rp)": m.nominal,
      "Status": m.status_pembayaran,
      "Keterangan": "-",
    });
  }
  for (const e of expenses ?? []) {
    rows.push({
      "Tanggal": e.tanggal,
      "Jenis": "Pengeluaran",
      "Kategori": e.kategori,
      "Nominal (Rp)": e.nominal,
      "Status": "-",
      "Keterangan": e.keterangan ?? "-",
    });
  }
  for (const t of transfers ?? []) {
    rows.push({
      "Tanggal": t.tanggal,
      "Jenis": "Transfer",
      "Kategori": "Transfer Shareholder",
      "Nominal (Rp)": t.nominal,
      "Status": "-",
      "Keterangan": t.keterangan ?? "-",
    });
  }

  rows.sort((a, b) => String(b["Tanggal"]).localeCompare(String(a["Tanggal"])));
  return rows;
}

async function fetchShareholder(db: ReturnType<typeof createServiceClient>, cabang: string) {
  const [{ data: shareholders, error: e1 }, { data: transfers, error: e2 }] = await Promise.all([
    db.from("shareholders").select("*").eq("cabang_id", cabang).order("persentase", { ascending: false }),
    db.from("transfers").select("*").eq("cabang_id", cabang).order("tanggal", { ascending: false }),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);

  const shRows = (shareholders ?? []).map((s: Record<string, unknown>) => ({
    "Sheet": "Konfigurasi",
    "Nama": s.nama,
    "Persentase (%)": s.persentase,
    "Tanggal Bergabung": s.created_at,
    "Nominal Transfer": "-",
    "Keterangan Transfer": "-",
  }));

  const trRows = (transfers ?? []).map((t: Record<string, unknown>) => ({
    "Sheet": "Riwayat Transfer",
    "Nama": "-",
    "Persentase (%)": "-",
    "Tanggal Bergabung": t.tanggal,
    "Nominal Transfer": t.nominal,
    "Keterangan Transfer": t.keterangan ?? "-",
  }));

  return [...shRows, ...trRows];
}

function buildXlsx(rows: Record<string, unknown>[], sheetName: string): Buffer {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return buf as Buffer;
}

function buildCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => {
        const val = String(r[h] ?? "").replace(/"/g, '""');
        return val.includes(",") || val.includes('"') || val.includes("\n") ? `"${val}"` : val;
      }).join(",")
    ),
  ];
  return lines.join("\r\n");
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ cabang: string }> }) {
  try {
    const { cabang } = await params;
    const { searchParams } = req.nextUrl;
    const type = searchParams.get("type") as ExportType | null;
    const format = (searchParams.get("format") ?? "xlsx") as ExportFormat;

    if (!type) {
      return NextResponse.json({ error: "type diperlukan" }, { status: 400 });
    }

    const db = createServiceClient();

    let rows: Record<string, unknown>[] = [];
    let sheetName = "Data";
    let filename = "export";

    switch (type) {
      case "drivers":
        rows = await fetchDrivers(db, cabang);
        sheetName = "Data Driver";
        filename = "data-driver";
        break;
      case "membership":
        rows = await fetchMembership(db, cabang);
        sheetName = "Membership";
        filename = "data-membership";
        break;
      case "keuangan":
        rows = await fetchKeuangan(db, cabang);
        sheetName = "Keuangan";
        filename = "laporan-keuangan";
        break;
      case "shareholder":
        rows = await fetchShareholder(db, cabang);
        sheetName = "Shareholder";
        filename = "data-shareholder";
        break;
      default:
        return NextResponse.json({ error: "type tidak valid" }, { status: 400 });
    }

    const dateStr = new Date().toISOString().split("T")[0];

    if (format === "csv") {
      const csv = buildCsv(rows);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}-${dateStr}.csv"`,
        },
      });
    }

    const buf = buildXlsx(rows, sheetName);
    return new NextResponse(buf as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}-${dateStr}.xlsx"`,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
