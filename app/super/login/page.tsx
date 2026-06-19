"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

export default function SuperLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error || "Email atau password salah");
        return;
      }
      const role = json.data?.user?.user_metadata?.role;
      if (role !== "super_admin") {
        setError("Akun ini tidak memiliki akses Super Admin");
        await fetch("/api/auth/logout", { method: "POST" });
        return;
      }
      router.push("/super");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
            boxShadow: "0 8px 24px rgba(124,58,237,0.4)",
          }}>
            <Zap size={26} color="#fff" />
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", padding: "4px 12px", borderRadius: 99, marginBottom: 10 }}>
            <ShieldCheck size={12} color="rgba(255,255,255,0.8)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Super Admin</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0 }}>ANJEM Dashboard</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 6 }}>Masuk ke panel manajemen super admin</p>
        </div>

        {/* Card */}
        <div style={{
          background: "#fff",
          borderRadius: 20,
          padding: 32,
          boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
        }}>
          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 10, padding: "11px 14px", marginBottom: 20,
              fontSize: 13, color: "#dc2626", display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 7, letterSpacing: "0.02em" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@anjem.id"
                required
                autoFocus
                style={{
                  width: "100%", padding: "11px 14px",
                  border: "1.5px solid #e5e7eb", borderRadius: 10,
                  fontSize: 14, color: "#111827", outline: "none",
                  background: "#f9fafb", fontFamily: "Outfit, sans-serif",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => { e.target.style.borderColor = "#7c3aed"; e.target.style.background = "#fff"; }}
                onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.background = "#f9fafb"; }}
              />
            </div>

            <div style={{ marginBottom: 26 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 7, letterSpacing: "0.02em" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%", padding: "11px 42px 11px 14px",
                    border: "1.5px solid #e5e7eb", borderRadius: 10,
                    fontSize: 14, color: "#111827", outline: "none",
                    background: "#f9fafb", fontFamily: "Outfit, sans-serif",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => { e.target.style.borderColor = "#7c3aed"; e.target.style.background = "#fff"; }}
                  onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.background = "#f9fafb"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "#9ca3af", display: "flex", alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px",
                background: loading ? "#a78bfa" : "linear-gradient(135deg, #7c3aed, #5b21b6)",
                color: "#fff", border: "none", borderRadius: 12,
                fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "Outfit, sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: loading ? "none" : "0 4px 16px rgba(124,58,237,0.35)",
                transition: "all 0.2s",
              }}
            >
              {loading && <Loader2 size={16} className="action-overlay-spin" />}
              {loading ? "Memverifikasi..." : "Masuk ke Super Admin"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          Hanya super admin yang dapat mengakses halaman ini
        </p>
      </div>
    </div>
  );
}
