"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, Edit2, ToggleLeft, ToggleRight, Loader2, Zap,
  Users, Building2, LogOut, ChevronLeft,
  Trash2, ShieldCheck, Shield, MapPin, User,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────

interface CabangInfo {
  id: string;
  nama: string;
  universitas: string;
  kota: string;
  warna: string;
  logo_url: string | null;
  aktif: boolean;
}

interface UserInfo {
  id: string;
  email: string | undefined;
  user_metadata: { role?: string; cabang_id?: string; nama?: string };
  created_at: string;
  last_sign_in_at?: string;
}

const DEFAULT_CABANG_FORM = { id: "", nama: "", universitas: "", kota: "", warna: "#d97706", logo_url: "" };
const DEFAULT_USER_FORM   = { email: "", password: "", nama: "", role: "admin", cabang_id: "" };

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SuperAdminPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<"cabang" | "users">("cabang");

  // Cabang state
  const [cabangList, setCabangList] = useState<CabangInfo[]>([]);
  const [cabangLoading, setCabangLoading] = useState(true);
  const [showCabangForm, setShowCabangForm] = useState(false);
  const [cabangForm, setCabangForm] = useState(DEFAULT_CABANG_FORM);
  const [cabangSaving, setCabangSaving] = useState(false);
  const [cabangError, setCabangError] = useState<string | null>(null);
  const [editCabangId, setEditCabangId] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  // User state
  const [userList, setUserList] = useState<UserInfo[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState(DEFAULT_USER_FORM);
  const [userSaving, setUserSaving] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [userFilter, setUserFilter] = useState<string>("all");

  // Current user info
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // ── Auth guard ────────────────────────────────────────────────────────────

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.role !== "super_admin") {
        router.replace("/super/login");
        return;
      }
      setCurrentUserEmail(user.email ?? null);
      setAuthChecked(true);
    };
    check();
  }, [router]);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchCabang = async () => {
    const res = await fetch("/api/cabang");
    const json = await res.json();
    if (json.data) setCabangList(json.data);
    setCabangLoading(false);
  };

  const fetchUsers = async () => {
    setUserLoading(true);
    const res = await fetch("/api/super/users");
    const json = await res.json();
    if (json.data) setUserList(json.data);
    setUserLoading(false);
  };

  useEffect(() => {
    if (!authChecked) return;
    fetchCabang();
    fetchUsers();
  }, [authChecked]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const userCountByCabang = useMemo(() => {
    const map: Record<string, number> = {};
    for (const u of userList) {
      const cid = u.user_metadata?.cabang_id;
      if (cid) map[cid] = (map[cid] ?? 0) + 1;
    }
    return map;
  }, [userList]);

  const filteredUsers = useMemo(() => {
    if (userFilter === "all") return userList;
    if (userFilter === "super_admin") return userList.filter(u => u.user_metadata?.role === "super_admin");
    return userList.filter(u => u.user_metadata?.cabang_id === userFilter);
  }, [userList, userFilter]);

  // ── Logout ────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/super/login");
  };

  // ── Cabang handlers ───────────────────────────────────────────────────────

  const handleCabangSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCabangSaving(true);
    setCabangError(null);
    try {
      // Upload logo if a new file was selected
      let logoUrl = cabangForm.logo_url || null;
      if (logoFile) {
        const fd = new FormData();
        fd.append("file", logoFile);
        const upRes = await fetch("/api/super/upload-logo", { method: "POST", body: fd });
        const upJson = await upRes.json();
        if (!upRes.ok || upJson.error) { setCabangError(upJson.error || "Gagal upload logo"); return; }
        logoUrl = upJson.data.url;
      }

      const url = editCabangId ? `/api/cabang/${editCabangId}` : "/api/cabang";
      const method = editCabangId ? "PATCH" : "POST";
      const body = editCabangId
        ? { nama: cabangForm.nama, universitas: cabangForm.universitas, kota: cabangForm.kota, warna: cabangForm.warna, logo_url: logoUrl }
        : { ...cabangForm, logo_url: logoUrl };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok || json.error) { setCabangError(json.error || "Gagal menyimpan"); return; }
      setShowCabangForm(false);
      setCabangForm(DEFAULT_CABANG_FORM);
      setLogoFile(null);
      setLogoPreview("");
      setEditCabangId(null);
      fetchCabang();
    } finally { setCabangSaving(false); }
  };

  const toggleAktif = async (c: CabangInfo) => {
    await fetch(`/api/cabang/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aktif: !c.aktif }),
    });
    fetchCabang();
  };

  const startEditCabang = (c: CabangInfo) => {
    setCabangForm({ id: c.id, nama: c.nama, universitas: c.universitas, kota: c.kota, warna: c.warna, logo_url: c.logo_url ?? "" });
    setLogoFile(null);
    setLogoPreview(c.logo_url ?? "");
    setEditCabangId(c.id);
    setShowCabangForm(true);
  };

  // ── User handlers ─────────────────────────────────────────────────────────

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserSaving(true);
    setUserError(null);
    try {
      if (editUserId) {
        const body: Record<string, unknown> = {
          role: userForm.role,
          cabang_id: userForm.role === "admin" ? userForm.cabang_id : null,
          nama: userForm.nama,
        };
        if (userForm.password.trim()) body.password = userForm.password.trim();
        const res = await fetch(`/api/super/users/${editUserId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok || json.error) { setUserError(json.error || "Gagal menyimpan"); return; }
      } else {
        const res = await fetch("/api/super/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userForm),
        });
        const json = await res.json();
        if (!res.ok || json.error) { setUserError(json.error || "Gagal membuat user"); return; }
      }
      setShowUserForm(false);
      setUserForm(DEFAULT_USER_FORM);
      setEditUserId(null);
      fetchUsers();
    } finally { setUserSaving(false); }
  };

  const startEditUser = (u: UserInfo) => {
    setUserForm({
      email: u.email ?? "",
      password: "",
      nama: u.user_metadata?.nama ?? "",
      role: u.user_metadata?.role ?? "admin",
      cabang_id: u.user_metadata?.cabang_id ?? "",
    });
    setEditUserId(u.id);
    setShowUserForm(true);
    setConfirmDeleteId(null);
  };

  const handleDeleteUser = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/super/users/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || json.error) { alert(json.error || "Gagal menghapus"); return; }
      setConfirmDeleteId(null);
      fetchUsers();
    } finally { setDeleting(false); }
  };

  // ── Loading / auth check ──────────────────────────────────────────────────

  if (!authChecked) {
    return (
      <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#6d28d9" }}>
          <Loader2 size={32} className="action-overlay-spin" />
          <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const tabs = [
    { key: "cabang" as const, label: "Cabang", icon: Building2 },
    { key: "users" as const,  label: "Users",  icon: Users     },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "Outfit, sans-serif" }}>

      {/* ── Top Nav ── */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1024, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 58 }}>

          {/* Left: badge + logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 160 }}>
            <span style={{
              fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
              color: "#6d28d9", background: "#ede9fe", padding: "3px 8px", borderRadius: 6,
            }}>SUPER ADMIN</span>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg, #7c3aed, #5b21b6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={13} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: 15, color: "#1e293b" }}>ANJEM</span>
            </div>
          </div>

          {/* Center: tabs */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: 4 }}>
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: "6px 18px", background: "none", border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 600, fontFamily: "Outfit, sans-serif",
                  color: activeTab === key ? "#6d28d9" : "#64748b",
                  borderBottom: activeTab === key ? "2.5px solid #6d28d9" : "2.5px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right: back + user */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 160, justifyContent: "flex-end" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b", textDecoration: "none", fontWeight: 600 }}>
              <ChevronLeft size={13} /> Kembali
            </Link>
            <div style={{ width: 1, height: 18, background: "#e2e8f0" }} />
            <button
              onClick={handleLogout}
              title={`Logout (${currentUserEmail})`}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 8, color: "#64748b", fontSize: 12, fontWeight: 600 }}
            >
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={14} color="#6d28d9" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1024, margin: "0 auto", padding: "32px 24px" }}>

        {/* ── TAB: Cabang ── */}
        {activeTab === "cabang" && (
          <>
            {/* Cabang Section Header */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#6d28d9", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>Super Admin</p>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: 0 }}>Manajemen Cabang</h2>
              </div>
              <button
                onClick={() => { setShowCabangForm(true); setEditCabangId(null); setCabangForm(DEFAULT_CABANG_FORM); setCabangError(null); setLogoFile(null); setLogoPreview(""); }}
                style={primaryBtnStyle}
              >
                <Plus size={14} /> Tambah Cabang
              </button>
            </div>

            {/* Cabang Cards Grid */}
            {cabangLoading ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8", fontSize: 13 }}>Memuat cabang...</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                {cabangList.map(c => (
                  <CabangCard
                    key={c.id}
                    cabang={c}
                    userCount={userCountByCabang[c.id] ?? 0}
                    onEdit={() => startEditCabang(c)}
                    onToggle={() => toggleAktif(c)}
                  />
                ))}
              </div>
            )}

            {/* Inline Add/Edit Form */}
            {showCabangForm && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 28, marginBottom: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 20px" }}>
                  {editCabangId ? "Edit Cabang" : "Tambah Cabang Baru"}
                </h3>
                {cabangError && <ErrorBox message={cabangError} />}
                <form onSubmit={handleCabangSubmit}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {!editCabangId && (
                      <LightField label="ID Cabang" value={cabangForm.id} onChange={v => setCabangForm(f => ({ ...f, id: v }))} placeholder="ugm / uns / undip" required />
                    )}
                    <LightField label="Nama" value={cabangForm.nama} onChange={v => setCabangForm(f => ({ ...f, nama: v }))} placeholder="ANJEM UGM" required />
                    <LightField label="Universitas" value={cabangForm.universitas} onChange={v => setCabangForm(f => ({ ...f, universitas: v }))} placeholder="Universitas Gadjah Mada" required />
                    <LightField label="Kota" value={cabangForm.kota} onChange={v => setCabangForm(f => ({ ...f, kota: v }))} placeholder="Yogyakarta" />
                    {/* Logo upload */}
                    <div>
                      <label style={labelStyle}>Logo Cabang</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {logoPreview && (
                          <div style={{ width: 44, height: 44, borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
                            <img src={logoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                          </div>
                        )}
                        <label style={{
                          flex: 1, padding: "9px 14px", border: "1.5px dashed #cbd5e1", borderRadius: 10,
                          fontSize: 13, color: "#64748b", cursor: "pointer", background: "#f8fafc",
                          display: "flex", alignItems: "center", gap: 8, transition: "border-color 0.15s",
                        }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = "#6d28d9")}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = "#cbd5e1")}
                        >
                          <span style={{ fontSize: 16 }}>📁</span>
                          <span>{logoFile ? logoFile.name : "Pilih file (png/jpg/webp/svg)"}</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            style={{ display: "none" }}
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              setLogoFile(f);
                              setLogoPreview(URL.createObjectURL(f));
                            }}
                          />
                        </label>
                        {logoPreview && (
                          <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(""); setCabangForm(f => ({ ...f, logo_url: "" })); }}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18, padding: "4px 6px" }} title="Hapus logo">✕</button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Warna Brand</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input type="color" value={cabangForm.warna} onChange={e => setCabangForm(f => ({ ...f, warna: e.target.value }))}
                          style={{ width: 40, height: 38, border: "1px solid #e2e8f0", borderRadius: 8, padding: 2, cursor: "pointer" }} />
                        <span style={{ fontSize: 13, color: "#64748b", fontFamily: "monospace" }}>{cabangForm.warna}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
                    <LightCancelBtn onClick={() => { setShowCabangForm(false); setEditCabangId(null); setLogoFile(null); setLogoPreview(""); }} />
                    <LightSaveBtn saving={cabangSaving} label={editCabangId ? "Simpan" : "Buat Cabang"} />
                  </div>
                </form>
              </div>
            )}

            {/* User section below (always visible on cabang tab) */}
            <UserSection
              users={filteredUsers}
              allUsers={userList}
              cabangList={cabangList}
              userLoading={userLoading}
              userFilter={userFilter}
              setUserFilter={setUserFilter}
              showUserForm={showUserForm}
              setShowUserForm={setShowUserForm}
              userForm={userForm}
              setUserForm={setUserForm}
              userError={userError}
              setUserError={setUserError}
              userSaving={userSaving}
              editUserId={editUserId}
              setEditUserId={setEditUserId}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
              deleting={deleting}
              onSubmit={handleUserSubmit}
              onEdit={startEditUser}
              onDelete={handleDeleteUser}
            />
          </>
        )}

        {/* ── TAB: Users ── */}
        {activeTab === "users" && (
          <UserSection
            users={filteredUsers}
            allUsers={userList}
            cabangList={cabangList}
            userLoading={userLoading}
            userFilter={userFilter}
            setUserFilter={setUserFilter}
            showUserForm={showUserForm}
            setShowUserForm={setShowUserForm}
            userForm={userForm}
            setUserForm={setUserForm}
            userError={userError}
            setUserError={setUserError}
            userSaving={userSaving}
            editUserId={editUserId}
            setEditUserId={setEditUserId}
            confirmDeleteId={confirmDeleteId}
            setConfirmDeleteId={setConfirmDeleteId}
            deleting={deleting}
            onSubmit={handleUserSubmit}
            onEdit={startEditUser}
            onDelete={handleDeleteUser}
            standalone
          />
        )}

      </div>
    </div>
  );
}

// ── Cabang Card ───────────────────────────────────────────────────────────────

function CabangCard({ cabang: c, userCount, onEdit, onToggle }: {
  cabang: CabangInfo; userCount: number; onEdit: () => void; onToggle: () => void;
}) {
  const initials = c.nama.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0",
      overflow: "hidden", display: "flex", flexDirection: "column",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      {/* Left color strip */}
      <div style={{ height: 4, background: c.warna, width: "100%" }} />
      <div style={{ padding: "18px 20px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: c.warna + "22",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 800, color: c.warna,
            }}>
              {c.logo_url ? <img src={c.logo_url} alt={c.nama} style={{ width: 28, height: 28, objectFit: "contain" }} /> : initials}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>{c.nama}</span>
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 6,
                  background: c.warna + "20", color: c.warna, letterSpacing: "0.04em",
                }}>{c.id.toUpperCase()}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <MapPin size={11} color="#94a3b8" />
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{c.kota}</span>
              </div>
            </div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
            background: c.aktif ? "#dcfce7" : "#fee2e2",
            color: c.aktif ? "#16a34a" : "#dc2626",
          }}>
            {c.aktif ? "Aktif" : "Nonaktif"}
          </span>
        </div>

        <p style={{ fontSize: 13, color: "#475569", margin: "0 0 10px" }}>{c.universitas}</p>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Users size={12} color="#94a3b8" />
            <span style={{ fontSize: 12, color: "#64748b" }}>{userCount} users</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: c.warna }} />
            <span style={{ fontSize: 11, fontFamily: "monospace", color: "#94a3b8" }}>{c.warna}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onEdit} style={outlineBtnStyle}>
            <Edit2 size={12} /> Edit
          </button>
          <button onClick={onToggle} style={{ ...outlineBtnStyle, color: c.aktif ? "#dc2626" : "#16a34a", borderColor: c.aktif ? "#fca5a5" : "#86efac" }}>
            {c.aktif ? <ToggleLeft size={12} /> : <ToggleRight size={12} />}
            {c.aktif ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── User Section (shared between Cabang tab and Users tab) ────────────────────

function UserSection({
  users, allUsers, cabangList, userLoading,
  userFilter, setUserFilter,
  showUserForm, setShowUserForm, userForm, setUserForm,
  userError, setUserError, userSaving,
  editUserId, setEditUserId, confirmDeleteId, setConfirmDeleteId, deleting,
  onSubmit, onEdit, onDelete, standalone,
}: {
  users: UserInfo[]; allUsers: UserInfo[]; cabangList: CabangInfo[]; userLoading: boolean;
  userFilter: string; setUserFilter: (v: string) => void;
  showUserForm: boolean; setShowUserForm: (v: boolean) => void;
  userForm: typeof DEFAULT_USER_FORM; setUserForm: React.Dispatch<React.SetStateAction<typeof DEFAULT_USER_FORM>>;
  userError: string | null; setUserError: (v: string | null) => void;
  userSaving: boolean;
  editUserId: string | null; setEditUserId: (v: string | null) => void;
  confirmDeleteId: string | null; setConfirmDeleteId: (v: string | null) => void;
  deleting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onEdit: (u: UserInfo) => void;
  onDelete: (id: string) => Promise<void>;
  standalone?: boolean;
}) {
  return (
    <div style={standalone ? {} : { marginTop: 8 }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: standalone ? 22 : 18, fontWeight: 800, color: "#1e293b", margin: 0 }}>
          {standalone && <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6d28d9", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Super Admin</span>}
          Manajemen User
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Filter dropdown */}
          <div style={{ position: "relative" }}>
            <select
              value={userFilter}
              onChange={e => setUserFilter(e.target.value)}
              style={{
                appearance: "none", WebkitAppearance: "none",
                padding: "8px 30px 8px 12px", fontSize: 12, fontWeight: 600,
                border: "1px solid #e2e8f0", borderRadius: 9, background: "#fff",
                color: "#374151", cursor: "pointer", fontFamily: "Outfit, sans-serif",
              }}
            >
              <option value="all">Semua ({allUsers.length})</option>
              <option value="super_admin">Super Admin</option>
              {cabangList.map(c => (
                <option key={c.id} value={c.id}>{c.nama}</option>
              ))}
            </select>
            <ChevronDown size={12} style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
          </div>
          <button
            onClick={() => { setShowUserForm(true); setEditUserId(null); setUserForm(DEFAULT_USER_FORM); setUserError(null); setConfirmDeleteId(null); }}
            style={primaryBtnStyle}
          >
            <Plus size={14} /> Tambah User
          </button>
        </div>
      </div>

      {/* User form */}
      {showUserForm && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 28, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "0 0 18px" }}>
            {editUserId ? "Edit User" : "Tambah User Baru"}
          </h3>
          {userError && <ErrorBox message={userError} />}
          <form onSubmit={onSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <LightField label="Email" value={userForm.email} onChange={v => setUserForm(f => ({ ...f, email: v }))}
                placeholder="admin@anjem.id" required={!editUserId} disabled={!!editUserId} type="email" />
              <LightField
                label={editUserId ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}
                value={userForm.password} onChange={v => setUserForm(f => ({ ...f, password: v }))}
                placeholder="Min. 6 karakter" required={!editUserId} type="password" />
              <LightField label="Nama (opsional)" value={userForm.nama} onChange={v => setUserForm(f => ({ ...f, nama: v }))} placeholder="Nama admin" />
              <div>
                <label style={labelStyle}>Role</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["admin", "super_admin"] as const).map(r => (
                    <button key={r} type="button"
                      onClick={() => setUserForm(f => ({ ...f, role: r, cabang_id: r === "super_admin" ? "" : f.cabang_id }))}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "9px 14px",
                        borderRadius: 9, border: `1.5px solid ${userForm.role === r ? "#6d28d9" : "#e2e8f0"}`,
                        background: userForm.role === r ? "#ede9fe" : "#f8fafc",
                        color: userForm.role === r ? "#6d28d9" : "#64748b",
                        fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "Outfit, sans-serif",
                      }}>
                      {r === "super_admin" ? <ShieldCheck size={13} /> : <Shield size={13} />}
                      {r === "super_admin" ? "Super Admin" : "Admin Cabang"}
                    </button>
                  ))}
                </div>
              </div>
              {userForm.role === "admin" && (
                <div>
                  <label style={labelStyle}>Cabang <span style={{ color: "#dc2626" }}>*</span></label>
                  <select
                    value={userForm.cabang_id}
                    onChange={e => setUserForm(f => ({ ...f, cabang_id: e.target.value }))}
                    required
                    style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 9, fontSize: 13, fontFamily: "Outfit, sans-serif", color: "#374151", background: "#f8fafc", cursor: "pointer", outline: "none" }}
                  >
                    <option value="">— Pilih cabang —</option>
                    {cabangList.map(c => <option key={c.id} value={c.id}>{c.nama} ({c.id})</option>)}
                  </select>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <LightCancelBtn onClick={() => { setShowUserForm(false); setEditUserId(null); setUserError(null); }} />
              <LightSaveBtn saving={userSaving} label={editUserId ? "Simpan" : "Buat User"} />
            </div>
          </form>
        </div>
      )}

      {/* User table */}
      {userLoading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 13 }}>Memuat users...</div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                {["NAMA", "CABANG", "ROLE", "AKSI"].map(h => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", background: "#f8fafc" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: "40px 20px", textAlign: "center", fontSize: 13, color: "#94a3b8" }}>Tidak ada user</td></tr>
              ) : users.map(u => {
                const role = u.user_metadata?.role;
                const cabangId = u.user_metadata?.cabang_id;
                const cabang = cabangId ? cabangList.find(c => c.id === cabangId) : null;
                const isConfirmDelete = confirmDeleteId === u.id;
                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 20px" }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", margin: "0 0 2px" }}>
                        {u.user_metadata?.nama || u.email?.split("@")[0] || "—"}
                      </p>
                      <a href={`mailto:${u.email}`} style={{ fontSize: 12, color: "#6d28d9", textDecoration: "none" }}>
                        {u.email ?? "—"}
                      </a>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      {cabang ? (
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
                          background: cabang.warna + "20", color: cabang.warna,
                        }}>
                          {cabang.id.toUpperCase()}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        fontSize: 12, fontWeight: 600,
                        color: role === "super_admin" ? "#6d28d9" : "#374151",
                      }}>
                        {role === "super_admin" ? <ShieldCheck size={12} /> : <Shield size={12} />}
                        {role === "super_admin" ? "Super Admin" : "Admin"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button onClick={() => { onEdit(u); setShowUserForm(true); }} style={outlineBtnStyle}>
                          <Edit2 size={11} /> Edit
                        </button>
                        {isConfirmDelete ? (
                          <>
                            <button onClick={() => onDelete(u.id)} disabled={deleting}
                              style={{ ...outlineBtnStyle, color: "#dc2626", borderColor: "#fca5a5", background: "#fff5f5" }}>
                              {deleting ? <Loader2 size={11} className="action-overlay-spin" /> : <Trash2 size={11} />} Yakin?
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)} style={outlineBtnStyle}>Batal</button>
                          </>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(u.id)} style={{ ...outlineBtnStyle, color: "#94a3b8" }}>
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const primaryBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 7, padding: "9px 18px",
  background: "#6d28d9", color: "#fff", border: "none", borderRadius: 10,
  fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "Outfit, sans-serif",
  boxShadow: "0 2px 8px rgba(109,40,217,0.25)",
};

const outlineBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 4, padding: "6px 11px",
  background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8,
  cursor: "pointer", fontSize: 12, color: "#475569",
  fontFamily: "Outfit, sans-serif", fontWeight: 600,
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 7,
};

function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "11px 14px", marginBottom: 16, fontSize: 13, color: "#dc2626" }}>
      {message}
    </div>
  );
}

function LightCancelBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      style={{ padding: "9px 18px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "Outfit, sans-serif", color: "#64748b" }}>
      Batal
    </button>
  );
}

function LightSaveBtn({ saving, label }: { saving: boolean; label: string }) {
  return (
    <button type="submit" disabled={saving}
      style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 20px", background: "#6d28d9", color: "#fff", border: "none", borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", fontFamily: "Outfit, sans-serif" }}>
      {saving && <Loader2 size={14} className="action-overlay-spin" />}
      {label}
    </button>
  );
}

function LightField({ label, value, onChange, placeholder, required, disabled, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; disabled?: boolean; type?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}{required && <span style={{ color: "#dc2626" }}> *</span>}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required} disabled={disabled}
        style={{
          width: "100%", padding: "10px 12px",
          border: "1.5px solid #e2e8f0", borderRadius: 9,
          background: disabled ? "#f1f5f9" : "#f8fafc",
          color: disabled ? "#94a3b8" : "#1e293b",
          fontSize: 13, fontFamily: "Outfit, sans-serif", outline: "none",
          cursor: disabled ? "not-allowed" : "text", boxSizing: "border-box",
        }}
      />
    </div>
  );
}
