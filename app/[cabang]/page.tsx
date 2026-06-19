"use client";

import {
  Users, UserCheck, Clock, PauseCircle,
  AlertTriangle, TrendingUp, Wallet, ArrowDownRight,
  BellRing, Zap, Loader2,
} from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/data";
import { useDashboardStats } from "@/lib/hooks/useDashboard";
import { useCabang } from "@/lib/context/CabangContext";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";


const DRIVER_CARDS = [
  { key: "total",    label: "Total Driver", icon: Users,       color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  { key: "aktif",    label: "Aktif",        icon: UserCheck,   color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  { key: "menunggu", label: "Menunggu",     icon: Clock,       color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  { key: "off",      label: "Off Sementara",icon: PauseCircle, color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
  { key: "belum",    label: "Belum Bayar",  icon: AlertTriangle,color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  { key: "lewat",    label: "Lewat Tempo",  icon: AlertTriangle,color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
] as const;

function DriverStatCard({
  label, value, icon: Icon, color, bg, delay,
}: {
  label: string; value: number; icon: React.ElementType;
  color: string; bg: string; delay: number;
}) {
  return (
    <div
      className={`animate-fade-in delay-${delay}`}
      style={{
        background: `linear-gradient(135deg, ${bg} 0%, var(--bg-card) 70%)`,
        border: `1px solid ${color}28`,
        borderRadius: 12,
        padding: "16px 18px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", top: -12, right: -12,
        width: 64, height: 64, borderRadius: "50%",
        background: `${color}18`,
      }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, color, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {label}
          </div>
          <div style={{
            fontSize: 30, fontWeight: 800, color: "var(--text-primary)",
            marginTop: 4, lineHeight: 1, fontFamily: "JetBrains Mono, monospace",
          }}>
            {value}
          </div>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${color}22`, border: `1px solid ${color}35`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon size={18} color={color} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}

function FinanceCard({
  label, value, icon: Icon, gradient, accent, sub,
}: {
  label: string; value: string; icon: React.ElementType;
  gradient: string; accent: string; sub?: string;
}) {
  return (
    <div style={{
      background: gradient,
      border: `1px solid ${accent}30`,
      borderRadius: 14,
      padding: "22px 24px",
      position: "relative",
      overflow: "hidden",
      flex: 1,
      minWidth: "min(200px, 100%)",
    }}>
      <div style={{
        position: "absolute", bottom: -20, right: -20,
        width: 100, height: 100, borderRadius: "50%",
        background: `${accent}15`,
      }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, color: accent, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {label}
          </div>
          <div style={{
            fontSize: 26, fontWeight: 800, color: "var(--text-primary)",
            marginTop: 8, fontFamily: "JetBrains Mono, monospace", lineHeight: 1.1,
          }}>
            {value}
          </div>
          {sub && (
            <div style={{
              marginTop: 8, fontSize: 11, fontWeight: 600,
              color: accent, background: `${accent}18`,
              display: "inline-block", padding: "3px 10px", borderRadius: 99,
            }}>
              {sub}
            </div>
          )}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${accent}22`, border: `1px solid ${accent}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={20} color={accent} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}

function ReminderItem({
  nama, detail, type, nominal,
}: {
  nama: string; detail: string; type: "urgent" | "warning" | "info"; nominal?: number;
}) {
  const palette = {
    urgent:  { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.22)" },
    warning: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.22)" },
    info:    { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.22)" },
  }[type];

  return (
    <div style={{
      background: palette.bg,
      border: `1px solid ${palette.border}`,
      borderRadius: 10,
      padding: "10px 12px",
      marginBottom: 8,
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: `${palette.color}20`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 800, color: palette.color,
      }}>
        {nama.charAt(0)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {nama}
        </div>
        <div style={{ fontSize: 11, color: palette.color, fontWeight: 500 }}>{detail}</div>
      </div>
      {nominal != null && nominal > 0 && (
        <div style={{ fontSize: 11, fontWeight: 700, color: palette.color, fontFamily: "JetBrains Mono, monospace", flexShrink: 0 }}>
          {formatRupiah(nominal)}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const tickColor = "#475569";
  const gridColor = "rgba(0,0,0,0.06)";

  const { id: cabang, nama: cabangNama } = useCabang();
  const { data: stats, loading, error } = useDashboardStats(cabang);

  const driverValues: Record<string, number> = stats ? {
    total: stats.drivers.total,
    aktif: stats.drivers.aktif,
    menunggu: stats.drivers.menunggu,
    off: stats.drivers.off,
    keluar: stats.drivers.keluar,
    belum: stats.payments.belum_bayar,
    lewat: stats.payments.lewat_jatuh_tempo,
  } : {};

  const finance = stats?.finance;
  const laba = finance?.laba_bersih ?? 0;
  const monthly = stats?.monthly_revenue ?? [];
  const reminders = stats?.reminders;

  const reminderCount = reminders
    ? reminders.lewat_jatuh_tempo.length + reminders.belum_bayar.length + reminders.menunggu_konfirmasi.length
    : 0;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload?.[0]) {
      return (
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 4 }}>{label}</div>
          <div style={{ color: "#8b5cf6", fontSize: 13, fontWeight: 700 }}>
            {formatRupiah(payload[0].value)}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading && !stats) {
    return (
      <div style={{ padding: "var(--page-py) var(--page-px)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 12, color: "var(--text-secondary)" }}>
        <Loader2 size={22} className="action-overlay-spin" /> Memuat dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "var(--page-py) var(--page-px)", color: "var(--red)" }}>
        Gagal memuat dashboard: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--page-py) var(--page-px)", maxWidth: 1400 }}>
      {/* Header */}
      <div className="animate-fade-in" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 22, height: 22, borderRadius: 6,
                background: "var(--brand-glow)", border: "1px solid var(--brand-border)",
              }}>
                <Zap size={12} color="var(--brand)" strokeWidth={2.5} />
              </div>
              <span style={{
                fontSize: 10.5, color: "var(--brand)", fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
              }}>
                Pusat Kendali · {cabangNama}
              </span>
            </div>
            <h1 style={{
              fontSize: 24, fontWeight: 800, color: "var(--text-primary)",
              letterSpacing: "-0.03em", lineHeight: 1.15, margin: 0,
            }}>
              Dashboard Manajemen
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 5, lineHeight: 1.5 }}>
              Pantau driver, membership, dan keuangan {cabangNama} secara real-time
            </p>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "8px 14px", flexShrink: 0,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 0 2px rgba(16,185,129,0.25)",
            }} />
            <div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 500 }}>Hari ini</div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>
                {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 12,
        marginBottom: 20,
      }}>
        {DRIVER_CARDS.map((c, i) => (
          <DriverStatCard
            key={c.key}
            label={c.label}
            value={driverValues[c.key] ?? 0}
            icon={c.icon}
            color={c.color}
            bg={c.bg}
            delay={Math.min(i + 1, 8)}
          />
        ))}
      </div>

      {/* Financial Stats — 3 cards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <FinanceCard
          label="Total Pemasukan"
          value={formatRupiah(finance?.total_pemasukan ?? 0)}
          icon={TrendingUp}
          gradient="linear-gradient(135deg, rgba(139,92,246,0.14) 0%, var(--bg-card) 60%)"
          accent="#8b5cf6"
          sub="Semua membership lunas"
        />
        <FinanceCard
          label="Total Pengeluaran"
          value={formatRupiah(finance?.total_pengeluaran ?? 0)}
          icon={ArrowDownRight}
          gradient="linear-gradient(135deg, rgba(239,68,68,0.12) 0%, var(--bg-card) 60%)"
          accent="#ef4444"
        />
        <FinanceCard
          label="Laba Bersih"
          value={formatRupiah(laba)}
          icon={Wallet}
          gradient={laba >= 0
            ? "linear-gradient(135deg, rgba(16,185,129,0.14) 0%, var(--bg-card) 60%)"
            : "linear-gradient(135deg, rgba(239,68,68,0.14) 0%, var(--bg-card) 60%)"}
          accent={laba >= 0 ? "#10b981" : "#ef4444"}
          sub={laba >= 0 ? "Surplus" : "Defisit"}
        />
      </div>

      {/* Charts + Reminders */}
      <div className="charts-grid">
        {/* Revenue Chart */}
        <div className="animate-fade-in delay-3" style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", padding: 24,
        }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Grafik Pendapatan 6 Bulan</h2>
            <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Total pemasukan membership per bulan</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="bulan" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="pemasukan" name="Pemasukan" stroke="#8b5cf6" fill="url(#colorPemasukan)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Reminder — scrollable */}
        <div className="animate-fade-in delay-4" style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", padding: "20px 16px 16px",
          display: "flex", flexDirection: "column",
          maxHeight: 320,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexShrink: 0, padding: "0 4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BellRing size={16} color="var(--brand)" />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Reminder Aktif</h2>
            </div>
            {reminderCount > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: "var(--brand)",
                background: "var(--brand-glow)", padding: "2px 8px", borderRadius: 99,
              }}>
                {reminderCount}
              </span>
            )}
          </div>

          <div style={{
            overflowY: "auto",
            flex: 1,
            paddingRight: 4,
            scrollbarWidth: "thin",
          }}>
            {reminders?.lewat_jatuh_tempo.map((r) => (
              <ReminderItem
                key={r.membership_id}
                nama={r.driver?.nama ?? "—"}
                detail={`Lewat Jatuh Tempo${r.days_overdue > 0 ? ` · ${r.days_overdue} hari` : ""}`}
                type="urgent"
                nominal={r.nominal}
              />
            ))}

            {reminders?.belum_bayar.map((r) => (
              <ReminderItem
                key={r.membership_id}
                nama={r.driver?.nama ?? "—"}
                detail={r.deadline ? `Deadline: ${formatDate(r.deadline)}` : "Belum Bayar"}
                type="warning"
                nominal={r.nominal}
              />
            ))}

            {reminders?.menunggu_konfirmasi.map((d) => (
              <ReminderItem
                key={d.driver_id}
                nama={d.nama}
                detail="Menunggu Konfirmasi"
                type="info"
              />
            ))}

            {reminderCount === 0 && (
              <div style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 13, padding: "32px 0" }}>
                Semua driver oke!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bar chart driver status */}
      <div className="animate-fade-in delay-5" style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", padding: 24, marginTop: 20,
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
          Distribusi Status Driver
        </h2>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>
          Komposisi status seluruh driver
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={[
              { status: "Aktif", jumlah: stats?.drivers.aktif ?? 0, fill: "#10b981" },
              { status: "Menunggu", jumlah: stats?.drivers.menunggu ?? 0, fill: "#f59e0b" },
              { status: "Off", jumlah: stats?.drivers.off ?? 0, fill: "#6366f1" },
            ]}
            margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="status" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            <Bar dataKey="jumlah" name="Jumlah Driver" radius={[6, 6, 0, 0]}>
              {["#10b981", "#f59e0b", "#6366f1"].map((fill, i) => (
                <Cell key={i} fill={fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
