"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Zap, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CabangLoginPage() {
  const router = useRouter();
  const params = useParams();
  const cabang = params.cabang as string;

  const [cabangInfo, setCabangInfo] = useState<{ nama: string; warna: string; logo_url: string | null } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/cabang/${cabang}`)
      .then(r => r.json())
      .then(json => { if (json.data) setCabangInfo(json.data); });
  }, [cabang]);

  const warna = cabangInfo?.warna ?? "#d97706";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, cabang }),
      });
      const json = await res.json();
      if (!res.ok || json.error) { setError(json.error || "Login gagal."); return; }
      router.push(`/${cabang}/`);
      router.refresh();
    } catch { setError("Terjadi kesalahan jaringan."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-deep)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${warna}12 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div className="animate-fade-in" style={{ width: "100%", maxWidth: 400, background: "var(--bg-card)", border: "1px solid var(--border-strong)", borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "32px 32px 24px", borderBottom: "1px solid var(--border)", textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: warna, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 4px 20px ${warna}40` }}>
            <Zap size={24} color="#fff" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            {cabangInfo?.nama ?? "ANJEM Admin"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Masuk untuk mengelola operasional</p>
        </div>
        <form onSubmit={handleLogin} style={{ padding: "24px 32px 32px" }}>
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--red-glow)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
              <AlertCircle size={14} color="var(--red)" />
              <span style={{ fontSize: 13, color: "var(--red)" }}>{error}</span>
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Email Admin</label>
            <input type="email" placeholder="admin@anjem.id" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%", padding: "10px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 14, fontFamily: "Outfit, sans-serif", outline: "none" }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPwd ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", padding: "10px 44px 10px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 14, fontFamily: "Outfit, sans-serif", outline: "none" }} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}>
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", background: loading ? `${warna}99` : warna, color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", fontFamily: "Outfit, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: loading ? "none" : `0 4px 14px ${warna}40` }}>
            {loading ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : <Zap size={16} />}
            {loading ? "Masuk..." : "Masuk ke Dashboard"}
          </button>
          <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, fontSize: 12, color: "var(--text-muted)", textDecoration: "none" }}>
            <ArrowLeft size={12} /> Kembali ke pilihan cabang
          </Link>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
