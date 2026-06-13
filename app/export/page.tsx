"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Check, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface ExportItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  formats: ("Excel (.xlsx)" | "CSV")[];
  rowCount: number;
}

const EXPORT_ITEMS: ExportItem[] = [
  {
    id: "drivers",
    title: "Data Driver",
    description: "Seluruh data driver termasuk status, jenis, dan kontak",
    icon: FileSpreadsheet,
    color: "var(--purple)",
    formats: ["Excel (.xlsx)", "CSV"],
    rowCount: 10,
  },
  {
    id: "membership",
    title: "Data Membership",
    description: "Seluruh record membership beserta status pembayaran",
    icon: FileSpreadsheet,
    color: "var(--cyan)",
    formats: ["Excel (.xlsx)", "CSV"],
    rowCount: 8,
  },
  {
    id: "keuangan",
    title: "Laporan Keuangan",
    description: "Revenue log, expense log, dan ringkasan keuangan",
    icon: FileSpreadsheet,
    color: "var(--green)",
    formats: ["Excel (.xlsx)", "CSV"],
    rowCount: 14,
  },
  {
    id: "shareholder",
    title: "Data Shareholder",
    description: "Konfigurasi persentase, distribusi profit, dan riwayat transfer",
    icon: FileSpreadsheet,
    color: "var(--amber)",
    formats: ["Excel (.xlsx)", "CSV"],
    rowCount: 4,
  },
];

export default function ExportPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());

  const handleDownload = (id: string, format: string) => {
    const key = `${id}-${format}`;
    setDownloading(key);
    setTimeout(() => {
      setDownloading(null);
      setDownloaded((prev) => new Set([...prev, key]));
      setTimeout(() => {
        setDownloaded((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }, 3000);
    }, 1200);
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 800 }}>
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
          Data akan diexport sesuai kondisi database terkini. File tersedia dalam format Excel (.xlsx) dan CSV.
        </div>
      </div>

      {/* Export cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {EXPORT_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
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
                <Icon size={22} color={item.color} />
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>
                  {item.description}
                </div>
                <div style={{ fontSize: 11, color: item.color }}>
                  {item.rowCount} record tersedia
                </div>
              </div>

              {/* Download buttons */}
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {item.formats.map((fmt) => {
                  const key = `${item.id}-${fmt}`;
                  const isDownloading = downloading === key;
                  const isDone = downloaded.has(key);
                  return (
                    <button
                      key={fmt}
                      onClick={() => handleDownload(item.id, fmt)}
                      disabled={isDownloading}
                      style={{
                        display: "flex", alignItems: "center", gap: 7,
                        padding: "9px 14px", borderRadius: 8,
                        border: `1px solid ${isDone ? "rgba(16,185,129,0.3)" : `${item.color}30`}`,
                        background: isDone ? "var(--green-glow)" : `${item.color}10`,
                        color: isDone ? "var(--green)" : item.color,
                        fontSize: 12, fontWeight: 600, cursor: isDownloading ? "not-allowed" : "pointer",
                        fontFamily: "Outfit, sans-serif", transition: "all 0.2s",
                        opacity: isDownloading ? 0.7 : 1,
                      }}
                    >
                      {isDone ? (
                        <Check size={13} />
                      ) : isDownloading ? (
                        <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} />
                      ) : (
                        <Download size={13} />
                      )}
                      {fmt === "Excel (.xlsx)" ? "Excel" : "CSV"}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Backup section */}
      <div className="animate-fade-in delay-6" style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", padding: "20px 24px", marginTop: 24,
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
          Full Backup
        </h2>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>
          Download seluruh data dalam satu file ZIP yang mencakup semua modul
        </p>
        <button
          onClick={() => handleDownload("full", "zip")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "var(--amber)", color: "#000",
            padding: "10px 20px", borderRadius: 8, border: "none",
            fontWeight: 700, fontSize: 13, cursor: "pointer",
            fontFamily: "Outfit, sans-serif",
          }}
        >
          {downloading === "full-zip" ? (
            <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} />
          ) : downloaded.has("full-zip") ? (
            <Check size={15} />
          ) : (
            <Download size={15} />
          )}
          {downloaded.has("full-zip") ? "Berhasil Didownload!" : "Download Full Backup (.zip)"}
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
