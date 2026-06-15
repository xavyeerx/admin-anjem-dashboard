"use client";

import { useState } from "react";
import { MessageSquare, Copy, RefreshCw, Check, Zap } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function BroadcastPage() {
  const [broadcast, setBroadcast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setBroadcast(null);
    try {
      const res = await fetch("/api/broadcast");
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API Error ${res.status}: ${text}`);
      }
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setBroadcast(json.data.text);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!broadcast) return;
    navigator.clipboard.writeText(broadcast);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: "var(--page-py) var(--page-px)", maxWidth: 900 }}>
      <PageHeader
        title="Broadcast Generator"
        subtitle="Generate broadcast WhatsApp otomatis dari database driver"
        icon={MessageSquare}
      />

      {/* Info banner */}
      <div className="animate-fade-in delay-1" style={{
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
        padding: "16px 20px", marginBottom: 20,
        display: "flex", gap: 12, alignItems: "flex-start",
      }}>
        <Zap size={18} color="var(--amber)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            Cara Pakai
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Klik <strong style={{ color: "var(--amber)" }}>Generate Broadcast</strong> untuk membuat teks broadcast secara otomatis berdasarkan data driver terkini.
            Setelah di-generate, klik <strong style={{ color: "var(--green)" }}>Copy Broadcast</strong> lalu paste ke grup WhatsApp driver.
            Proses ini memakan waktu kurang dari 5 detik!
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="animate-fade-in delay-2" style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "var(--amber)", color: "#000",
            padding: "11px 20px", borderRadius: 10, border: "none",
            fontWeight: 700, fontSize: 14, cursor: generating ? "not-allowed" : "pointer",
            fontFamily: "Outfit, sans-serif", opacity: generating ? 0.7 : 1,
            transition: "all 0.15s",
          }}
        >
          <RefreshCw size={15} style={{ animation: generating ? "spin 0.8s linear infinite" : "none" }} />
          {generating ? "Generating..." : "Generate Broadcast"}
        </button>
        {broadcast && (
          <button
            onClick={handleCopy}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: copied ? "var(--green-glow)" : "var(--bg-card)",
              color: copied ? "var(--green)" : "var(--text-primary)",
              padding: "11px 20px", borderRadius: 10,
              border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
              fontWeight: 600, fontSize: 14, cursor: "pointer",
              fontFamily: "Outfit, sans-serif", transition: "all 0.2s",
            }}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Tersalin!" : "Copy Broadcast"}
          </button>
        )}
      </div>

      {/* Preview */}
      {broadcast && (
        <div className="animate-fade-in" style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", overflow: "hidden",
        }}>
          <div style={{
            padding: "12px 16px", background: "var(--bg-elevated)",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
            <span style={{ fontSize: 12, color: "var(--text-secondary)", marginLeft: 8 }}>Preview Broadcast WhatsApp</span>
          </div>

          {/* WhatsApp bubble style */}
          <div style={{ padding: "24px", background: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M20 0L40 20L20 40L0 20z'/%3E%3C/g%3E%3C/svg%3E\")" }}>
            <div style={{
              maxWidth: 400, marginLeft: "auto",
              background: "#1a2f1a", border: "1px solid rgba(16,185,129,0.15)",
              borderRadius: "12px 12px 0 12px", padding: "12px 16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}>
              <div style={{ fontSize: 12, color: "var(--green)", fontWeight: 600, marginBottom: 8 }}>Admin ANJEM</div>
              <pre style={{
                fontSize: 12, color: "#e2e8f0", lineHeight: 1.7,
                whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0,
              }}>
                {broadcast}
              </pre>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textAlign: "right", marginTop: 8 }}>
                {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} ✓✓
              </div>
            </div>
          </div>
        </div>
      )}

      {!broadcast && !generating && (
        <div style={{
          background: "var(--bg-card)", border: "1px dashed var(--border)",
          borderRadius: "var(--radius)", padding: "60px 40px", textAlign: "center",
        }}>
          <MessageSquare size={36} style={{ margin: "0 auto 16px", opacity: 0.3, display: "block" }} />
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Klik &ldquo;Generate Broadcast&rdquo; untuk membuat broadcast WhatsApp
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
