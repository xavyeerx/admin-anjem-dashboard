"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, ChevronRight, Zap, Building2, Lock } from "lucide-react";

interface CabangInfo {
  id: string;
  nama: string;
  universitas: string;
  kota: string;
  warna: string;
  logo_url: string | null;
}

export default function LandingPage() {
  const [cabangList, setCabangList] = useState<CabangInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cabang")
      .then(r => r.json())
      .then(json => { if (json.data) setCabangList(json.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "Outfit, sans-serif" }}>

      {/* ── Dark Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #1e293b 100%)",
        padding: "48px 24px 52px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Orb decoration */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 240, height: 240, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(109,40,217,0.25) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", position: "relative" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
            }}>
              <Zap size={20} color="#fff" />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>ANJEM</span>
          </div>

          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.03em" }}>
            Pilih Cabang Anda
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", margin: 0 }}>
            Masuk ke dashboard manajemen sesuai cabang
          </p>
        </div>
      </div>

      {/* ── Cards ── */}
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px 0" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: "48px 0", fontSize: 14 }}>
            Memuat daftar cabang...
          </div>
        ) : cabangList.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: "48px 0", fontSize: 14 }}>
            Belum ada cabang aktif
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {cabangList.map(c => <BranchCard key={c.id} cabang={c} />)}
          </div>
        )}

        {/* Super Admin card */}
        <SuperAdminCard />
      </div>
    </div>
  );
}

function SuperAdminCard() {
  const [hovered, setHovered] = useState(false);

  return (
        <div style={{ marginTop: 20, paddingBottom: 32 }}>
          <div style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
            color: "#94a3b8", textTransform: "uppercase",
            marginBottom: 10, paddingLeft: 2,
          }}>
            Akses Khusus
          </div>
          <Link
            href="/super"
            style={{ textDecoration: "none" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div style={{
              background: hovered ? "#1e1b4b" : "#0f172a",
              borderRadius: 14,
              display: "flex", alignItems: "center", gap: 16,
              padding: "16px 20px",
              cursor: "pointer",
              boxShadow: hovered ? "0 4px 20px rgba(0,0,0,0.2)" : "0 1px 6px rgba(0,0,0,0.1)",
              transform: hovered ? "translateY(-1px)" : "none",
              transition: "all 0.18s ease",
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 10px rgba(124,58,237,0.4)",
              }}>
                <Lock size={18} color="#fff" strokeWidth={2} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Super Admin</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Kelola semua cabang & konfigurasi sistem</div>
              </div>
              <ChevronRight size={18} color={hovered ? "#a78bfa" : "rgba(255,255,255,0.25)"} style={{ transition: "color 0.18s", flexShrink: 0 }} />
            </div>
          </Link>
        </div>
  );
}

function BranchCard({ cabang }: { cabang: CabangInfo }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/${cabang.id}/login`}
      style={{ textDecoration: "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: "#fff",
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "18px 20px",
        cursor: "pointer",
        boxShadow: hovered ? "0 4px 20px rgba(0,0,0,0.1)" : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-1px)" : "none",
        transition: "all 0.18s ease",
        borderLeft: `4px solid ${cabang.warna}`,
      }}>
        {/* Icon */}
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          background: `${cabang.warna}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Building2 size={22} color={cabang.warna} strokeWidth={1.8} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>{cabang.nama}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: cabang.warna,
              background: `${cabang.warna}18`, padding: "2px 7px", borderRadius: 99,
              letterSpacing: "0.04em",
            }}>
              {cabang.id.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#475569", marginBottom: 3 }}>{cabang.universitas}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <MapPin size={10} color="#94a3b8" />
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{cabang.kota}</span>
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight size={18} color={hovered ? cabang.warna : "#cbd5e1"} style={{ transition: "color 0.18s", flexShrink: 0 }} />
      </div>
    </Link>
  );
}
