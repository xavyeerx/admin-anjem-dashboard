"use client";

import { useApi, apiMutate } from "./useApi";
import type { TrackingItem } from "@/app/api/payments/tracking/route";

export type { TrackingItem };

export function usePaymentTracking() {
  return useApi<TrackingItem[]>("/api/payments/tracking");
}

// Untuk item yang sudah punya membership_id
export const markTrackingPaid = (membershipId: string, tanggalPembayaran?: string) =>
  apiMutate(`/api/memberships/${membershipId}/pay`, "POST", {
    tanggal_pembayaran: tanggalPembayaran,
  });

// Untuk Menunggu Konfirmasi: buat membership baru langsung Lunas
export const createAndPayMembership = (body: {
  driver_id: string;
  jenis_driver: string;
  tanggal_mulai: string;
  nominal: number;
}) => {
  const d = new Date(body.tanggal_mulai + "T12:00:00");
  d.setDate(d.getDate() + 13); // +13 hari untuk masa aktif 14 hari inklusif
  const tanggal_selesai_awal = d.toISOString().split("T")[0];

  return apiMutate("/api/memberships", "POST", {
    ...body,
    tanggal_selesai_awal,
    status_pembayaran: "Lunas",
    tanggal_pembayaran: new Date().toISOString().split("T")[0],
    hari_izin: 0,
  });
};
