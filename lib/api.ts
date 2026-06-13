import { NextResponse } from "next/server";

/** Wrap a route handler body; catches errors and returns uniform JSON */
export async function withErrorHandler(
  fn: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await fn();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Internal server error";
    console.error("[API Error]", msg, e);
    return NextResponse.json({ data: null, error: msg }, { status: 500 });
  }
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null }, { status });
}

export function jsonErr(message: string, status = 400) {
  return NextResponse.json({ data: null, error: message }, { status });
}

/** Calculate final membership end date given start + leave days */
export function calcFinalDate(selesaiAwal: string, hariIzin: number): string {
  const d = new Date(selesaiAwal + "T12:00:00");
  d.setDate(d.getDate() + hariIzin);
  return d.toISOString().split("T")[0];
}

/** Calculate payment deadline: H+3 = start hari ke-3 (inklusif) = tanggalAktif + 2 hari
 *  Contoh: mulai 1 Jun → batas bayar 3 Jun (tgl 1,2,3 = 3 hari termasuk hari mulai)
 *  Pakai T12:00:00 untuk menghindari timezone shift di Node/Windows.
 */
export function calcDeadline(tanggalAktif: string): string {
  const d = new Date(tanggalAktif + "T12:00:00");
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
}

/** Determine if a deadline is overdue */
export function isOverdue(deadline: string | null): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date(new Date().toDateString());
}
