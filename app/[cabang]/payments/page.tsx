"use client";

import { useState, useMemo } from "react";
import { Wallet, AlertTriangle, Clock, CheckCircle, Loader2, Search, ArrowUpDown } from "lucide-react";
import { formatRupiah } from "@/lib/data";
import { usePaymentTracking, markTrackingPaid } from "@/lib/hooks/usePaymentTracking";
import type { TrackingItem } from "@/lib/hooks/usePaymentTracking";
import type { PaymentStatus } from "@/lib/data";
import { useCabang } from "@/lib/context/CabangContext";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import ActionOverlay from "@/components/ActionOverlay";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useActionFeedback } from "@/lib/hooks/useActionFeedback";

// Parse "YYYY-MM-DD" manual — bebas timezone shift
function parseLocalDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const parts = s.split("T")[0].split("-").map(Number);
  if (parts.length !== 3) return null;
  const [y, m, d] = parts;
  if (!y || !m || !d || y < 2000 || y > 2100) return null;
  return new Date(y, m - 1, d, 12, 0, 0);
}

function safeFormatDate(s: string | null | undefined): string {
  const d = parseLocalDate(s);
  if (!d) return "—";
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function PaymentsPage() {
  const { id: cabang } = useCabang();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof TrackingItem; direction: "asc" | "desc" } | null>(null);

  const { overlay, confirmOpen, confirmOptions, confirm, handleConfirm, handleCancel, runAction } = useActionFeedback();

  const { data, loading, error, refetch } = usePaymentTracking(cabang);
  const items: TrackingItem[] = data ?? [];

  const belumBayar = items.filter((r) => r.status === "Belum Bayar").length;
  const lewatTempo = items.filter((r) => r.status === "Lewat Jatuh Tempo").length;

  const processedItems = useMemo(() => {
    let result = [...items];

    if (filter !== "all") {
      result = result.filter((r) => r.status === filter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => r.driver_nama.toLowerCase().includes(q));
    }

    if (sortConfig !== null) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
           return sortConfig.direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [items, filter, searchQuery, sortConfig]);

  const handleSort = (key: keyof TrackingItem) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleMarkPaid = async (item: TrackingItem) => {
    const ok = await confirm({
      title: "Tandai Lunas?",
      message: `Tandai pembayaran "${item.driver_nama}" sebagai Lunas?`,
      confirmLabel: "Lunas",
      danger: false,
    });
    if (!ok) return;

    await runAction({
      loading: "Menandai lunas...",
      success: `${item.driver_nama} ditandai lunas`,
      action: async () => {
        if (!item.membership_id) return;
        const res = await markTrackingPaid(cabang, item.membership_id);
        if (res.error) throw new Error(res.error);
        refetch();
      },
    });
  };

  return (
    <div style={{ padding: "var(--page-py) var(--page-px)", position: "relative" }}>
      <ActionOverlay state={overlay} />
      <ConfirmDialog open={confirmOpen} options={confirmOptions} onConfirm={handleConfirm} onCancel={handleCancel} />

      <PageHeader
        title="Tracking Pembayaran"
        subtitle="Monitor status pembayaran membership driver (data real-time)"
        icon={Wallet}
      />

      {error && (
        <div style={{ background: "var(--red-glow)", border: "1px solid var(--red)", borderRadius: 8, padding: "12px 16px", marginBottom: 16, color: "var(--red)", fontSize: 13 }}>
          Gagal memuat data: {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="animate-fade-in delay-1 stat-grid-3">
        {[
          { label: "Total Tracking", value: loading ? "—" : items.length, icon: Wallet, color: "var(--blue)", bg: "var(--blue-glow)", border: "rgba(37,99,235,0.2)" },
          { label: "Belum Bayar",    value: loading ? "—" : belumBayar,   icon: Clock,   color: "var(--brand)", bg: "var(--brand-glow)", border: "var(--brand-border)" },
          { label: "Lewat Jatuh Tempo", value: loading ? "—" : lewatTempo, icon: AlertTriangle, color: "var(--red)", bg: "var(--red-glow)", border: "rgba(220,38,38,0.2)" },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: "var(--radius)", padding: "18px 20px", display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}20`, border: `1px solid ${c.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={18} color={c.color} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: c.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: c.color, fontFamily: "JetBrains Mono, monospace" }}>{c.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workflow */}
      <div className="animate-fade-in delay-2" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px", marginBottom: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>Workflow Pembayaran</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {[
            { label: "Input Membership Manual", color: "var(--text-secondary)" },
            { label: "→" },
            { label: "Status: Belum Bayar", color: "var(--brand)" },
            { label: "→" },
            { label: "Jatuh Tempo (Mulai + 3 Hari)", color: "var(--brand)" },
            { label: "→" },
            { label: "Lewat Jatuh Tempo", color: "var(--red)" },
          ].map((step, i) => (
            <span key={i} style={{ fontSize: 12, color: step.color ?? "var(--text-muted)", fontWeight: step.color && step.label !== "→" ? 600 : 400 }}>
              {step.label}
            </span>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="animate-fade-in delay-3 filter-bar">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "Belum Bayar", "Lewat Jatuh Tempo"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 14px", borderRadius: 8, border: "1px solid",
              borderColor: filter === f ? "var(--brand)" : "var(--border)",
              background: filter === f ? "var(--brand-glow)" : "transparent",
              color: filter === f ? "var(--brand)" : "var(--text-secondary)",
              fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Outfit, sans-serif",
            }}>
              {f === "all" ? "Semua" : f}
            </button>
          ))}
        </div>
        <div className="filter-bar-search">
          <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Cari nama driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px 8px 32px",
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              borderRadius: 8, color: "var(--text-primary)", fontSize: 13,
              fontFamily: "Outfit, sans-serif", outline: "none",
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="animate-fade-in delay-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 48, color: "var(--text-secondary)" }}>
            <Loader2 size={20} className="action-overlay-spin" /> Memuat data pembayaran...
          </div>
        ) : (
          <div className="table-scroll">
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th onClick={() => handleSort("driver_nama")} style={{ cursor: "pointer", userSelect: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>Driver <ArrowUpDown size={12} color="var(--text-muted)" /></div>
                </th>
                <th onClick={() => handleSort("tanggal_mulai")} style={{ cursor: "pointer", userSelect: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>Aktif Kembali <ArrowUpDown size={12} color="var(--text-muted)" /></div>
                </th>
                <th onClick={() => handleSort("nominal")} style={{ cursor: "pointer", userSelect: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>Nominal <ArrowUpDown size={12} color="var(--text-muted)" /></div>
                </th>
                <th onClick={() => handleSort("deadline_pembayaran")} style={{ cursor: "pointer", userSelect: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>Jatuh Tempo <ArrowUpDown size={12} color="var(--text-muted)" /></div>
                </th>
                <th onClick={() => handleSort("status")} style={{ cursor: "pointer", userSelect: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>Status <ArrowUpDown size={12} color="var(--text-muted)" /></div>
                </th>
                <th>Keterangan</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {processedItems.map((item, i) => {
                const isLewat = item.status === "Lewat Jatuh Tempo";
                const avatarColor = isLewat ? "var(--red)" : "var(--brand)";
                const avatarBg   = isLewat ? "var(--red-glow)" : "var(--brand-glow)";
                const avatarBorder = isLewat ? "rgba(220,38,38,0.3)" : "var(--brand-border)";

                return (
                  <tr key={item.membership_id ?? `${item.driver_id}-${i}`}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: avatarBg, border: `1px solid ${avatarBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: avatarColor }}>
                          {item.driver_nama.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{item.driver_nama}</div>
                          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{item.driver_jenis}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {safeFormatDate(item.tanggal_mulai)}
                    </td>
                    <td>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, fontWeight: 600, color: "var(--green)" }}>
                        {formatRupiah(item.nominal)}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, fontWeight: 600, color: isLewat ? "var(--red)" : "var(--text-primary)" }}>
                      {safeFormatDate(item.deadline_pembayaran)}
                    </td>
                    <td><StatusBadge status={item.status as PaymentStatus} /></td>
                    <td>
                      {isLewat && item.days_overdue > 0 && (
                        <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 600 }}>
                          Terlambat {item.days_overdue} hari
                        </span>
                      )}
                      {item.status === "Belum Bayar" && item.days_left >= 0 && (
                        <span style={{ fontSize: 12, color: "var(--brand)" }}>
                          Sisa {item.days_left} hari
                        </span>
                      )}
                      {item.status === "Belum Bayar" && item.days_left < 0 && (
                        <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 600 }}>
                          Lewat {Math.abs(item.days_left)} hari
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => handleMarkPaid(item)}
                        style={{
                          padding: "4px 10px", background: "var(--green-glow)", color: "var(--green)",
                          border: "1px solid rgba(5,150,105,0.3)", borderRadius: 6, fontSize: 11,
                          fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif",
                        }}
                      >
                        Tandai Lunas
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}

        {!loading && processedItems.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-secondary)" }}>
            <CheckCircle size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <p style={{ fontSize: 13 }}>
              {searchQuery ? "Tidak ada driver yang cocok dengan pencarian." : (filter === "all" ? "Semua driver sudah lunas! 🎉" : `Tidak ada driver dengan status "${filter}"`)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
