"use client";

import { useState } from "react";
import { PieChart, Plus, TrendingUp, TrendingDown, DollarSign, Loader2, Trash2, Edit2 } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/data";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { useExpenses, createExpense, updateExpense, deleteExpense } from "@/lib/hooks/useExpenses";
import { useCabang } from "@/lib/context/CabangContext";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import ActionOverlay from "@/components/ActionOverlay";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useActionFeedback } from "@/lib/hooks/useActionFeedback";
import type { MembershipRow, ExpenseRow } from "@/lib/supabase/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RPieChart, Pie, Cell, LabelList
} from "recharts";

type MembershipWithDriver = MembershipRow & {
  drivers: { id: string; nama: string; jenis_driver: string } | null;
};

const EXPENSE_CATEGORIES = ["Operasional", "Marketing", "Bonus", "Tools", "Domain", "Hosting", "Lainnya"];
const EXPENSE_COLORS: Record<string, string> = {
  Operasional: "#3b82f6", Marketing: "#8b5cf6", Bonus: "#f59e0b",
  Tools: "#06b6d4", Domain: "#10b981", Hosting: "#f97316", Lainnya: "#64748b",
};

const tickColor = "#475569";
const gridColor = "rgba(0,0,0,0.06)";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px",
  background: "var(--bg-elevated)", border: "1px solid var(--border)",
  borderRadius: 8, color: "var(--text-primary)", fontSize: 13,
  fontFamily: "Outfit, sans-serif", outline: "none",
};
const cancelBtnStyle: React.CSSProperties = {
  padding: "9px 16px", background: "transparent", color: "var(--text-secondary)",
  border: "1px solid var(--border)", borderRadius: 8, fontWeight: 500, fontSize: 13,
  cursor: "pointer", fontFamily: "Outfit, sans-serif",
};

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

export default function FinancePage() {
  const { id: cabang } = useCabang();
  const [activeTab, setActiveTab] = useState<"revenue" | "expense">("revenue");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    kategori: "Operasional",
    nominal: "",
    keterangan: "",
  });

  const { overlay, confirmOpen, confirmOptions, confirm, handleConfirm, handleCancel, runAction } = useActionFeedback();

  // Data real-time dari Supabase
  const { data: memRows, loading: memLoading } = useMemberships(cabang);
  const { data: expRows, loading: expLoading, refetch: refetchExp } = useExpenses(cabang);

  const memberships = (memRows as MembershipWithDriver[] | null) ?? [];
  const expenses    = (expRows as ExpenseRow[] | null) ?? [];

  const paidMemberships = memberships.filter((m) => m.status_pembayaran === "Lunas");

  // Kalkulasi finansial
  const totalPemasukan   = paidMemberships.reduce((s, m) => s + m.nominal, 0);
  const totalPemasukanAnjem  = paidMemberships.filter((m) => m.jenis_driver === "ANJEM").reduce((s, m) => s + m.nominal, 0);
  const totalPemasukanJastip = paidMemberships.filter((m) => m.jenis_driver === "JASTIP").reduce((s, m) => s + m.nominal, 0);
  const totalPengeluaran = expenses.reduce((s, e) => s + e.nominal, 0);
  const labaBersih       = totalPemasukan - totalPengeluaran;

  // Monthly revenue (6 bulan terakhir dari data Supabase)
  const monthlyRevenue = (() => {
    const today = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
      const year = d.getFullYear(), month = d.getMonth() + 1;
      const label = d.toLocaleDateString("id-ID", { month: "short" });
      const inMonth = paidMemberships.filter((m) => {
        const dt = new Date(m.tanggal_mulai);
        return dt.getFullYear() === year && dt.getMonth() + 1 === month;
      });
      return {
        bulan: label,
        total: inMonth.reduce((s, m) => s + m.nominal, 0),
      };
    });
  })();

  const expenseByCategory = EXPENSE_CATEGORIES.map((cat) => ({
    name: cat,
    value: expenses.filter((e) => e.kategori === cat).reduce((s, e) => s + e.nominal, 0),
    color: EXPENSE_COLORS[cat],
  })).filter((c) => c.value > 0);

  const handleSaveExpense = async () => {
    if (!expenseForm.nominal || Number(expenseForm.nominal) <= 0) return;
    setShowExpenseModal(false);
    await runAction({
      loading: editingExpenseId ? "Mengubah pengeluaran..." : "Menyimpan pengeluaran...",
      success: editingExpenseId ? "Pengeluaran berhasil diubah" : "Pengeluaran berhasil ditambahkan",
      action: async () => {
        const payload = {
          tanggal: expenseForm.tanggal,
          kategori: expenseForm.kategori,
          nominal: Number(expenseForm.nominal),
          keterangan: expenseForm.keterangan || null,
        };
        const result = editingExpenseId
          ? await updateExpense(cabang, editingExpenseId, payload)
          : await createExpense(cabang, payload);

        if (result.error) throw new Error(result.error);
        refetchExp();
        setExpenseForm({ tanggal: new Date().toISOString().split("T")[0], kategori: "Operasional", nominal: "", keterangan: "" });
        setEditingExpenseId(null);
      },
    });
  };

  const handleEditExpense = (e: ExpenseRow) => {
    setEditingExpenseId(e.id);
    setExpenseForm({
      tanggal: e.tanggal,
      kategori: e.kategori,
      nominal: e.nominal.toString(),
      keterangan: e.keterangan || "",
    });
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = async (id: string, keterangan: string) => {
    const ok = await confirm({
      title: "Hapus Pengeluaran?",
      message: `"${keterangan}" akan dihapus permanen.`,
      confirmLabel: "Hapus",
      danger: true,
    });
    if (!ok) return;
    await runAction({
      loading: "Menghapus...",
      success: "Pengeluaran dihapus",
      action: async () => {
        const result = await deleteExpense(cabang, id);
        if (result.error) throw new Error(result.error);
        refetchExp();
      },
    });
  };

  const isLoading = memLoading || expLoading;

  return (
    <div style={{ padding: "var(--page-py) var(--page-px)", position: "relative" }}>
      <ActionOverlay state={overlay} />
      <ConfirmDialog open={confirmOpen} options={confirmOptions} onConfirm={handleConfirm} onCancel={handleCancel} />

      <PageHeader title="Laporan Keuangan" subtitle="Revenue, pengeluaran, dan laba bersih ANJEM (data real-time)" icon={PieChart} />

      {isLoading && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-secondary)", marginBottom: 16, fontSize: 13 }}>
          <Loader2 size={16} className="action-overlay-spin" /> Memuat data keuangan...
        </div>
      )}

      {/* Summary Cards */}
      <div className="animate-fade-in delay-1 stat-grid-5">
        {[
          { label: "Pemasukan ANJEM",  value: totalPemasukanAnjem,  icon: TrendingUp,   color: "var(--purple)" },
          { label: "Pemasukan JASTIP", value: totalPemasukanJastip, icon: TrendingUp,   color: "var(--cyan)" },
          { label: "Total Pemasukan",  value: totalPemasukan,       icon: TrendingUp,   color: "var(--green)" },
          { label: "Total Pengeluaran",value: totalPengeluaran,     icon: TrendingDown, color: "var(--red)" },
          { label: "Laba Bersih",      value: labaBersih,           icon: DollarSign,   color: labaBersih >= 0 ? "var(--green)" : "var(--red)" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "18px 20px" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}15`, border: `1px solid ${s.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: s.color, marginTop: 3, fontFamily: "JetBrains Mono, monospace" }}>
                    {formatRupiah(s.value)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="animate-fade-in delay-2 chart-2col">
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px 24px" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Pendapatan Bulanan</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyRevenue} margin={{ top: 25, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="bulan" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
              <Tooltip
                formatter={(val) => formatRupiah(Number(val))}
                contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              <Bar dataKey="total" name="Pendapatan" fill="#7c3aed" radius={[4, 4, 0, 0]}>
                <LabelList
                  dataKey="total"
                  position="top"
                  formatter={(val: unknown) => Number(val) > 0 ? new Intl.NumberFormat("id-ID").format(Number(val)) : ""}
                  style={{ fill: "var(--text-secondary)", fontSize: 11, fontWeight: 600, fontFamily: "JetBrains Mono, monospace" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px 24px" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Pengeluaran per Kategori</h2>
          {expenseByCategory.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 13, padding: "40px 0" }}>Belum ada pengeluaran</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <RPieChart>
                  <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {expenseByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(val) => formatRupiah(Number(val))} contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                </RPieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                {expenseByCategory.map((e) => (
                  <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: e.color, flexShrink: 0, display: "inline-block" }} />
                    <span style={{ color: "var(--text-secondary)", flex: 1 }}>{e.name}</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600, fontFamily: "JetBrains Mono, monospace" }}>{formatRupiah(e.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="animate-fade-in delay-3">
        <div style={{ display: "flex", gap: 0, marginBottom: 0, borderBottom: "1px solid var(--border)" }}>
          {[
            { key: "revenue" as const, label: "Revenue Log" },
            { key: "expense" as const, label: "Expense Log" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: "10px 20px", background: "transparent", cursor: "pointer",
              color: activeTab === tab.key ? "var(--brand)" : "var(--text-secondary)",
              fontFamily: "Outfit, sans-serif", fontSize: 13, fontWeight: 600,
              border: "none", borderBottom: `2px solid ${activeTab === tab.key ? "var(--brand)" : "transparent"}`,
              transition: "all 0.15s",
            }}>
              {tab.label}
            </button>
          ))}
          {activeTab === "expense" && (
            <button onClick={() => {
              setEditingExpenseId(null);
              setExpenseForm({ tanggal: new Date().toISOString().split("T")[0], kategori: "Operasional", nominal: "", keterangan: "" });
              setShowExpenseModal(true);
            }} style={{
              marginLeft: "auto", display: "flex", alignItems: "center", gap: 8,
              background: "var(--brand)", color: "#fff",
              padding: "8px 14px", borderRadius: 8, border: "none",
              fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "Outfit, sans-serif",
              alignSelf: "center", marginBottom: 6,
            }}>
              <Plus size={13} /> Tambah Pengeluaran
            </button>
          )}
        </div>

        {/* Revenue Table */}
        {activeTab === "revenue" && (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderTop: "none", borderRadius: "0 0 var(--radius) var(--radius)", overflow: "hidden" }}>
            <div className="table-scroll">
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Tanggal Bayar</th>
                  <th>Driver</th>
                  <th>Jenis</th>
                  <th>Tgl Mulai</th>
                  <th>Nominal</th>
                </tr>
              </thead>
              <tbody>
                {paidMemberships.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {m.tanggal_pembayaran ? formatDate(m.tanggal_pembayaran) : "—"}
                    </td>
                    <td style={{ fontSize: 13, fontWeight: 500 }}>{(m as MembershipWithDriver).drivers?.nama ?? "—"}</td>
                    <td>
                      <span className={`status-badge ${m.jenis_driver === "ANJEM" ? "badge-anjem" : "badge-jastip"}`}>
                        {m.jenis_driver}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{formatDate(m.tanggal_mulai)}</td>
                    <td>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, fontWeight: 600, color: "var(--green)" }}>
                        +{formatRupiah(m.nominal)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {paidMemberships.length === 0 && !isLoading && (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-secondary)", fontSize: 13 }}>Belum ada revenue.</div>
            )}
          </div>
        )}

        {/* Expense Table */}
        {activeTab === "expense" && (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderTop: "none", borderRadius: "0 0 var(--radius) var(--radius)", overflow: "hidden" }}>
            <div className="table-scroll">
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Kategori</th>
                  <th>Nominal</th>
                  <th>Keterangan</th>
                  <th style={{ textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{formatDate(e.tanggal)}</td>
                    <td>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                        background: `${EXPENSE_COLORS[e.kategori] ?? "#64748b"}20`,
                        color: EXPENSE_COLORS[e.kategori] ?? "#64748b",
                        border: `1px solid ${EXPENSE_COLORS[e.kategori] ?? "#64748b"}30`,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: EXPENSE_COLORS[e.kategori] ?? "#64748b", display: "inline-block" }} />
                        {e.kategori}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, fontWeight: 600, color: "var(--red)" }}>
                        -{formatRupiah(e.nominal)}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{e.keterangan}</td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <button
                          onClick={() => handleEditExpense(e)}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "4px 10px", background: "var(--blue-glow)", color: "var(--blue)",
                            border: "1px solid rgba(37,99,235,0.3)", borderRadius: 6, fontSize: 11,
                            fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif",
                          }}
                        >
                          <Edit2 size={11} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(e.id, e.keterangan ?? e.kategori)}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "4px 10px", background: "var(--red-glow)", color: "var(--red)",
                            border: "1px solid rgba(220,38,38,0.3)", borderRadius: 6, fontSize: 11,
                            fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif",
                          }}
                        >
                          <Trash2 size={11} /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {expenses.length === 0 && !isLoading && (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-secondary)", fontSize: 13 }}>Belum ada pengeluaran.</div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Expense Modal */}
      <Modal open={showExpenseModal} onClose={() => setShowExpenseModal(false)} title={editingExpenseId ? "Edit Pengeluaran" : "Tambah Pengeluaran"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Tanggal">
            <input type="date" style={inputStyle} value={expenseForm.tanggal}
              onChange={(e) => setExpenseForm({ ...expenseForm, tanggal: e.target.value })} />
          </FormField>
          <FormField label="Kategori">
            <select style={inputStyle} value={expenseForm.kategori}
              onChange={(e) => setExpenseForm({ ...expenseForm, kategori: e.target.value })}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Nominal">
            <input type="number" placeholder="50000" style={inputStyle} value={expenseForm.nominal}
              onChange={(e) => setExpenseForm({ ...expenseForm, nominal: e.target.value })} />
          </FormField>
          <FormField label="Keterangan">
            <input type="text" placeholder="Deskripsi pengeluaran..." style={inputStyle} value={expenseForm.keterangan}
              onChange={(e) => setExpenseForm({ ...expenseForm, keterangan: e.target.value })} />
          </FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setShowExpenseModal(false)} style={cancelBtnStyle}>Batal</button>
            <button onClick={handleSaveExpense} style={{
              padding: "9px 16px", background: "var(--brand)", color: "#fff",
              border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13,
              cursor: "pointer", fontFamily: "Outfit, sans-serif",
            }}>Simpan</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
