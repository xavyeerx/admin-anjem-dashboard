"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export type OverlayState =
  | { mode: "loading"; message: string }
  | { mode: "success"; message: string }
  | { mode: "error"; message: string };

interface ActionOverlayProps {
  state: OverlayState | null;
}

export default function ActionOverlay({ state }: ActionOverlayProps) {
  if (!state) return null;

  const isLoading = state.mode === "loading";
  const isSuccess = state.mode === "success";
  const isError = state.mode === "error";

  return (
    <div
      className="action-overlay-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(6px)",
        pointerEvents: "all",
      }}
    >
      <div
        className={`action-overlay-card animate-overlay-pop ${isSuccess ? "action-overlay-success" : ""} ${isError ? "action-overlay-error" : ""}`}
        style={{
          background: "var(--bg-card)",
          border: `1px solid ${isSuccess ? "var(--green)" : isError ? "var(--red)" : "var(--border-strong)"}`,
          borderRadius: 16,
          padding: "28px 36px",
          minWidth: 220,
          maxWidth: 320,
          textAlign: "center",
          boxShadow: "0 24px 48px rgba(0,0,0,0.35)",
        }}
      >
        {isLoading && (
          <Loader2
            size={36}
            className="action-overlay-spin"
            style={{ color: "var(--amber)", margin: "0 auto 14px" }}
          />
        )}
        {isSuccess && (
          <CheckCircle2 size={40} style={{ color: "var(--green)", margin: "0 auto 14px" }} />
        )}
        {isError && (
          <XCircle size={40} style={{ color: "var(--red)", margin: "0 auto 14px" }} />
        )}
        <p style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-primary)",
          lineHeight: 1.5,
          margin: 0,
        }}>
          {state.message}
        </p>
      </div>
    </div>
  );
}
