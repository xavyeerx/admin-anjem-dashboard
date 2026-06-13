"use client";

import { AlertTriangle } from "lucide-react";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmDialogProps {
  open: boolean;
  options: ConfirmOptions | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, options, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open || !options) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 150,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        animation: "fade-in 0.15s ease",
      }}
    >
      <div style={{
        width: "100%", maxWidth: 400,
        background: "var(--bg-card)",
        border: "1px solid var(--border-strong)",
        borderRadius: 14,
        overflow: "hidden",
        animation: "overlay-pop 0.2s ease",
      }}>
        <div style={{ padding: "22px 24px 18px", textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: options.danger ? "var(--red-glow)" : "var(--amber-glow)",
            border: `1px solid ${options.danger ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
          }}>
            <AlertTriangle size={22} style={{ color: options.danger ? "var(--red)" : "var(--amber)" }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            {options.title}
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55, margin: 0 }}>
            {options.message}
          </p>
        </div>
        <div style={{
          display: "flex", gap: 10, padding: "14px 20px 20px",
          borderTop: "1px solid var(--border)",
        }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "10px 16px", borderRadius: 8,
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--text-secondary)", fontWeight: 600, fontSize: 13,
              cursor: "pointer", fontFamily: "Outfit, sans-serif",
            }}
          >
            {options.cancelLabel ?? "Batal"}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "10px 16px", borderRadius: 8, border: "none",
              background: options.danger ? "var(--red)" : "var(--amber)",
              color: options.danger ? "#fff" : "#000",
              fontWeight: 700, fontSize: 13, cursor: "pointer",
              fontFamily: "Outfit, sans-serif",
            }}
          >
            {options.confirmLabel ?? "Ya, Lanjutkan"}
          </button>
        </div>
      </div>
    </div>
  );
}
