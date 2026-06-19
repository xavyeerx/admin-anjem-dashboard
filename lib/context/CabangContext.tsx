"use client";
import { createContext, useContext } from "react";

export interface CabangInfo {
  id: string;
  nama: string;
  universitas: string;
  kota: string;
  warna: string;
  logo_url: string | null;
}

const CabangContext = createContext<CabangInfo | null>(null);

export function CabangProvider({ cabang, children }: { cabang: CabangInfo; children: React.ReactNode }) {
  return <CabangContext.Provider value={cabang}>{children}</CabangContext.Provider>;
}

export function useCabang(): CabangInfo {
  const ctx = useContext(CabangContext);
  if (!ctx) throw new Error("useCabang must be used within CabangProvider");
  return ctx;
}
