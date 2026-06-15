"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}

export default function Modal({ open, onClose, title, children, width = 500 }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%", maxWidth: width,
          background: "var(--bg-card)",
          border: "1px solid var(--border-strong)",
          borderRadius: 14,
          overflow: "hidden",
          animation: "fade-in 0.2s ease",
          maxHeight: "calc(100dvh - 32px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px", borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "1px solid var(--border)",
              borderRadius: 8, padding: 6, cursor: "pointer",
              color: "var(--text-secondary)", display: "flex",
            }}
          >
            <X size={14} />
          </button>
        </div>
        <div style={{ padding: "20px", overflowY: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
