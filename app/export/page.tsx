"use client";

import { useState, useEffect } from "react";
import { Download, FileSpreadsheet, Check, Loader2, AlertCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface ExportItem {
  id: string;
  title: string;
  description: string;
  color: string;
  formats: Array<{ label: string; format: "xlsx" | "csv" }>;
}

const EXPORT_ITEMS: ExportItem[] = [
  {
    id: "drivers",
    title: "Data Driver",
    description: "Seluruh data driver termasuk status, jenis, dan kontak",
    color: "var(--purple)",
    formats: [
      { label: "Excel", format: "xlsx" },
      { label: "CSV", format: "csv" },
    ],
  },
  {
    id: "membership",
    title: "Data Membership",
    description: "Seluruh record membership beserta status pembayaran",
    color: "var(--cyan)",
    formats: [
      { label: "Excel", format: "xlsx" },
      { label: "CSV", format: "csv" },
    ],
  },
  {
    id: "keuangan",
    title: "Laporan Keuangan",
    description: "Pemasukan membership, pengeluaran, dan riwayat transfer",
    color: "var(--green)",
    formats: [
      { label: "Excel", format: "xlsx" },
      { label: "CSV", format: "csv" },
    ],
  },
  {
    id: "shareholder",
    title: "Data Shareholder",
    description: "Konfigurasi persentase dan riwayat transfer profit",
    color: "var(--amber)",
    formats: [
      { label: "Excel", format: "xlsx" },
      { label: "CSV", format: "csv" },
    ],
  },
];

type DownloadState = "idle" | "loading" | "done" | "error";

export default function ExportPage() {
  const [states, setStates] = useState<Record<string, DownloadState>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setState(key: string, state: DownloadState) {
    setStates((prev) => ({ ...prev, [key]: state }));
  }

  async function handleDownload(id: string, format: "xlsx" | "csv") {
    const key = `${id}-${format}`;
    setState(key, "loading");
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });

    try {
      const res = await fetch(`/api/export?type=${id}&format=${format}`);
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      a.href = url;
      a.download = match?.[1] ?? `export.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setState(key, "done");
      setTimeout(() => setState(key, "idle"), 3000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal download";
      setErrors((prev) => ({ ...prev, [key]: msg }));
      setState(key, "error");
      setTimeout(() => setState(key, "idle"), 4000);
    }
  }

  return (
    <div style={{ padding: "var(--page-py) var(--page-px)", maxWidth: 800 }}>
      <PageHeader
        title="Export & Backup"
        subtitle="Download data dalam format Excel atau CSV"
        icon={Download}
      />

      {/* Info banner */}
      <div className="animate-fade-in delay-1" style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", padding: "14px 18px", marginBottom: 24,
        display: "flex", gap: 12, alignItems: "center",
      }}>
        <Download size={16} color="var(--blue)" />
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          Data diambil langsung dari database. File tersedia dalam format Excel (.xlsx) dan CSV.
        </div>
      </div>

      {/* Export cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {EXPORT_ITEMS.map((item, idx) => (
          <div
            key={item.id}
            className={`animate-fade-in delay-${idx + 2}`}
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "20px 24px",
              display: "flex", alignItems: "center", gap: 20,
            }}
          >
            {/* Icon */}
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `${item.color}15`, border: `1px solid ${item.color}25`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <FileSpreadsheet size={22} color={item.color} />
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {item.description}
              </div>
              {item.formats.some((f) => errors[`${item.id}-${f.format}`]) && (
                <div style={{ fontSize: 11, color: "var(--red)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <AlertCircle size={11} />
                  {Object.entries(errors)
                    .filter(([k]) => k.startsWith(item.id))
                    .map(([, v]) => v)[0]}
                </div>
              )}
            </div>

            {/* Download buttons */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {item.formats.map(({ label, format }) => {
                const key = `${item.id}-${format}`;
                const st = states[key] ?? "idle";
                const isLoading = st === "loading";
                const isDone = st === "done";
                const isError = st === "error";
                return (
                  <button
                    key={format}
                    onClick={() => handleDownload(item.id, format)}
                    disabled={isLoading}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "9px 14px", borderRadius: 8,
                      border: `1px solid ${
                        isDone ? "rgba(16,185,129,0.3)"
                        : isError ? "rgba(239,68,68,0.3)"
                        : `${item.color}30`
                      }`,
                      background: isDone
                        ? "var(--green-glow)"
                        : isError
                        ? "rgba(239,68,68,0.08)"
                        : `${item.color}10`,
                      color: isDone ? "var(--green)" : isError ? "var(--red)" : item.color,
                      fontSize: 12, fontWeight: 600,
                      cursor: isLoading ? "not-allowed" : "pointer",
                      fontFamily: "Outfit, sans-serif",
                      transition: "all 0.2s",
                      opacity: isLoading ? 0.7 : 1,
                    }}
                  >
                    {isDone ? (
                      <Check size={13} />
                    ) : isLoading ? (
                      <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} />
                    ) : isError ? (
                      <AlertCircle size={13} />
                    ) : (
                      <Download size={13} />
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
