import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { CabangProvider } from "@/lib/context/CabangContext";
import LayoutShell from "@/components/LayoutShell";
import type { CabangInfo } from "@/lib/context/CabangContext";

export default async function CabangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ cabang: string }>;
}) {
  const { cabang: cabangId } = await params;

  // Fetch branch info
  const db = createServiceClient();
  const { data: cabangData } = await db.from("cabang").select("*").eq("id", cabangId).eq("aktif", true).single();

  if (!cabangData) redirect("/");

  const cabangInfo: CabangInfo = {
    id: cabangData.id,
    nama: cabangData.nama,
    universitas: cabangData.universitas,
    kota: cabangData.kota,
    warna: cabangData.warna,
    logo_url: cabangData.logo_url,
  };

  // Generate brand color variations
  const brandGlow = cabangData.warna + "20";
  const brandBorder = cabangData.warna + "30";

  return (
    <CabangProvider cabang={cabangInfo}>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "var(--bg-deep)",
          // @ts-expect-error CSS custom properties
          "--brand": cabangData.warna,
          "--brand-glow": brandGlow,
          "--brand-border": brandBorder,
        }}
      >
        <LayoutShell>{children}</LayoutShell>
      </div>
    </CabangProvider>
  );
}
