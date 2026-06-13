"use client";

import { useState } from "react";
import { CreditCard, Plus, Loader2, Search } from "lucide-react";
import { formatRupiah, formatDate, type PaymentStatus } from "@/lib/data";
import { fromDriverRow, fromMembershipRow } from "@/lib/mappers";
import { useDrivers } from "@/lib/hooks/useDrivers";
import {
  useMemberships, createMembership, updateMembership, markMembershipPaid, deleteMembership,
} from "@/lib/hooks/useMemberships";
import type { MembershipRow } from "@/lib/supabase/types";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import ActionOverlay from "@/components/ActionOverlay";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useActionFeedback } from "@/lib/hooks/useActionFeedback";

type MembershipWithDriver = MembershipRow & {
  drivers: { id: string; nama: string } | null;
};

const MEMBERSHIP_PERIOD_DAYS = 14;

const emptyForm = {
  driverId: "",
  jenisDriver: "ANJEM" as "ANJEM" | "JASTIP",
  tanggalMulai: "",
  tanggalSelesaiAwal: "",
  hariIzin: 0,
  nominal: "",
  statusPembayaran: "Lunas" as PaymentStatus,
};

function addDaysISO(iso: string, days: number): string {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function calcSelesaiAwal(tanggalMulai: string): string {
  // +13 karena dihitung inklusif (hari pertama adalah hari ke-1)
  return addDaysISO(tanggalMulai, MEMBERSHIP_PERIOD_DAYS - 1);
}

function calcSelesaiFinal(selesaiAwal: string, hariIzin: number): string {
  return addDaysISO(selesaiAwal, hariIzin);
}

export default function MembershipPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    overlay, confirmOpen, confirmOptions, confirm,
    handleConfirm, handleCancel, runAction,
  } = useActionFeedback();

  const { data: driverRows } = useDrivers();
  const drivers = (driverRows ?? []).map(fromDriverRow);

  const { data: rows, loading, error, refetch } = useMemberships({
    status: filterStatus !== "all" ? filterStatus : undefined,
  });

  const memberships = (rows as MembershipWithDriver[] | null ?? []).map(fromMembershipRow);
  const driverMap = Object.fromEntries(
    (rows as MembershipWithDriver[] | null ?? []).map((r) => [r.id, r.drivers?.nama ?? "—"]),
  );

  const filteredMemberships = memberships.filter((m) => {
    const driverName = driverMap[m.id] ?? drivers.find((d) => d.id === m.driverId)?.nama ?? "—";
    if (searchQuery && !driverName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, driverId: drivers[0]?.id ?? "" });
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (m: ReturnType<typeof fromMembershipRow>) => {
    setEditingId(m.id);
    setForm({
      driverId: m.driverId,
      jenisDriver: m.jenisDriver,
      tanggalMulai: m.tanggalMulai,
      tanggalSelesaiAwal: m.tanggalSelesaiAwal,
      hariIzin: m.hariIzin,
      nominal: String(m.nominal),
      statusPembayaran: m.statusPembayaran,
    });
    setFormError(null);
    setShowModal(true);
  };

  const selesaiAwal = form.tanggalMulai
    ? calcSelesaiAwal(form.tanggalMulai)
    : form.tanggalSelesaiAwal;
  const selesaiFinal = calcSelesaiFinal(selesaiAwal, form.hariIzin);

  const handleSave = async () => {
    if (!form.driverId || !form.tanggalMulai || !form.nominal) {
      setFormError("Lengkapi semua field wajib");
      return;
    }
    setFormError(null);
    const payload = {
      driver_id: form.driverId,
      jenis_driver: form.jenisDriver,
      tanggal_mulai: form.tanggalMulai,
      tanggal_selesai_awal: selesaiAwal,
      hari_izin: form.hariIzin,
      nominal: Number(form.nominal),
      status_pembayaran: form.statusPembayaran,
    };
    const isEdit = Boolean(editingId);
    setShowModal(false);

    try {
      await runAction({
        loading: isEdit ? "Menyimpan perubahan..." : "Menambahkan membership...",
        success: isEdit ? "Membership berhasil diperbarui" : "Membership berhasil ditambahkan",
        action: async () => {
          const result = isEdit
            ? await updateMembership(editingId!, payload)
            : await createMembership(payload);
          if (result.error) throw new Error(result.error);
          refetch();
        },
      });
    } catch {
      setShowModal(true);
    }
  };

  const handleMarkPaid = async (id: string, driverName: string) => {
    await runAction({
      loading: "Menandai lunas...",
      success: `${driverName} ditandai lunas`,
      action: async () => {
        const result = await markMembershipPaid(id);
        if (result.error) throw new Error(result.error);
        refetch();
      },
    });
  };

  const handleDelete = async (id: string, driverName: string) => {
    const ok = await confirm({
      title: "Hapus Membership?",
      message: `Membership "${driverName}" akan dihapus permanen.`,
      confirmLabel: "Hapus",
      danger: true,
    });
    if (!ok) return;

    await runAction({
      loading: "Menghapus membership...",
      success: "Membership berhasil dihapus",
      action: async () => {
        const result = await deleteMembership(id);
        if (result.error) throw new Error(result.error);
        refetch();
      },
    });
  };

  return (
    <div style={{ padding: "28px 32px", position: "relative" }}>
      <ActionOverlay state={overlay} />
      <ConfirmDialog
        open={confirmOpen}
        options={confirmOptions}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <PageHeader
        title="Membership"
        subtitle={`${memberships.length} record membership`}
        icon={CreditCard}
        action={
          <button onClick={openAdd} style={addBtnStyle}>
            <Plus size={15} /> Tambah Membership
          </button>
        }
      />

      {error && (
        <div style={{ background: "var(--red-glow)", border: "1px solid var(--red)", borderRadius: 8, padding: "12px 16px", marginBottom: 16, color: "var(--red)", fontSize: 13 }}>
          Gagal memuat data: {error}
        </div>
      )}

      <div className="animate-fade-in delay-1" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Membership", value: memberships.length, color: "var(--blue)" },
          { label: "Lunas", value: memberships.filter((m) => m.statusPembayaran === "Lunas").length, color: "var(--green)" },
          { label: "Belum / Lewat Tempo", value: memberships.filter((m) => m.statusPembayaran !== "Lunas").length, color: "var(--red)" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px" }}>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, marginTop: 4, fontFamily: "JetBrains Mono, monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="animate-fade-in delay-2" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "Lunas", "Belum Bayar", "Lewat Jatuh Tempo"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              style={{
                padding: "6px 14px", borderRadius: 8, border: "1px solid",
                borderColor: filterStatus === f ? "var(--amber)" : "var(--border)",
                background: filterStatus === f ? "var(--amber-glow)" : "transparent",
                color: filterStatus === f ? "var(--amber)" : "var(--text-secondary)",
                fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Outfit, sans-serif",
              }}
            >
              {f === "all" ? "Semua" : f}
            </button>
          ))}
        </div>
        <div style={{ position: "relative", width: 250 }}>
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

      <div className="animate-fade-in delay-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 48, color: "var(--text-secondary)" }}>
            <Loader2 size={20} /> Memuat membership...
          </div>
        ) : (
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Driver</th>
                <th>Jenis</th>
                <th>Tgl Mulai</th>
                <th>Selesai Awal</th>
                <th>Hari Izin</th>
                <th>Selesai Final</th>
                <th>Nominal</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Tgl Bayar</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredMemberships.map((m) => {
                const driverName = driverMap[m.id] ?? drivers.find((d) => d.id === m.driverId)?.nama ?? "—";
                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%",
                          background: "var(--amber-glow)", border: "1px solid rgba(245,158,11,0.2)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, color: "var(--amber)",
                        }}>
                          {driverName.charAt(0)}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{driverName}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${m.jenisDriver === "ANJEM" ? "badge-anjem" : "badge-jastip"}`}>
                        {m.jenisDriver}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{formatDate(m.tanggalMulai)}</td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{formatDate(m.tanggalSelesaiAwal)}</td>
                    <td>
                      {m.hariIzin > 0 ? (
                        <span className="status-badge badge-belum">+{m.hariIzin} hari</span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{formatDate(m.tanggalSelesaiFinal)}</td>
                    <td>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, fontWeight: 600, color: "var(--green)" }}>
                        {formatRupiah(m.nominal)}
                      </span>
                    </td>
                    <td><StatusBadge status={m.statusPembayaran} /></td>
                    <td style={{ fontSize: 12, color: m.statusPembayaran === "Lewat Jatuh Tempo" ? "var(--red)" : "var(--text-secondary)" }}>
                      {m.deadlinePembayaran ? formatDate(m.deadlinePembayaran) : "—"}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {m.tanggalPembayaran ? formatDate(m.tanggalPembayaran) : <span style={{ color: "var(--text-muted)" }}>Belum</span>}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                        {m.statusPembayaran !== "Lunas" && (
                          <button style={markPaidBtn} onClick={() => handleMarkPaid(m.id, driverName)}>Tandai Lunas</button>
                        )}
                        <button style={editBtnStyle} onClick={() => openEdit(m)}>Edit</button>
                        <button style={deleteBtnStyle} onClick={() => handleDelete(m.id, driverName)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && memberships.length > 0 && filteredMemberships.length === 0 && (
          <div style={{ textAlign: "center", padding: 48, color: "var(--text-secondary)" }}>
            Tidak ada membership yang cocok dengan pencarian "{searchQuery}".
          </div>
        )}
        {!loading && memberships.length === 0 && (
          <div style={{ textAlign: "center", padding: 48, color: "var(--text-secondary)" }}>
            Belum ada membership. Jalankan seed.sql di Supabase atau tambah baru.
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit Membership" : "Tambah / Perpanjang Membership"} width={540}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {!editingId && (
            <div style={{
              background: "var(--blue-glow)", border: "1px solid rgba(59,130,246,0.25)",
              borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5,
            }}>
              <strong style={{ color: "var(--blue)" }}>Lifecycle driver:</strong> Membership baru otomatis mengaktifkan driver.
              Pilih <strong>Belum Bayar</strong> untuk aktif kembali (deadline H+3 dari tanggal mulai).
              Pilih <strong>Lunas</strong> jika driver sudah bayar di muka.
            </div>
          )}
          {formError && (
            <div style={{ background: "var(--red-glow)", border: "1px solid var(--red)", borderRadius: 8, padding: "10px 12px", color: "var(--red)", fontSize: 13 }}>
              {formError}
            </div>
          )}
          <FormField label="Driver">
            <select
              value={form.driverId}
              onChange={(e) => {
                const d = drivers.find((dr) => dr.id === e.target.value);
                // Set default jenis dari data driver, tapi bisa diubah manual di field Jenis Driver
                setForm({ ...form, driverId: e.target.value, jenisDriver: d?.jenisDriver ?? "ANJEM" });
              }}
              style={inputStyle}
            >
              <option value="">Pilih driver</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.nama}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Jenis Driver">
            <select
              value={form.jenisDriver}
              onChange={(e) => setForm({ ...form, jenisDriver: e.target.value as "ANJEM" | "JASTIP" })}
              style={inputStyle}
            >
              <option value="ANJEM">ANJEM (Antar Jemput)</option>
              <option value="JASTIP">JASTIP (Jasa Titip)</option>
            </select>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
              Pilihan ini akan memperbarui jenis driver di tabel driver secara otomatis
            </p>
          </FormField>
          <FormField label="Tanggal Mulai">
            <input
              type="date"
              value={form.tanggalMulai}
              onChange={(e) => {
                const mulai = e.target.value;
                setForm({
                  ...form,
                  tanggalMulai: mulai,
                  tanggalSelesaiAwal: calcSelesaiAwal(mulai),
                });
              }}
              style={inputStyle}
            />
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label={`Selesai Awal (H+${MEMBERSHIP_PERIOD_DAYS})`}>
              <div style={readonlyDateStyle}>
                {selesaiAwal ? formatDate(selesaiAwal) : "—"}
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                Otomatis dihitung {MEMBERSHIP_PERIOD_DAYS} hari inklusif (mulai + 13 hari)
              </p>
            </FormField>
            <FormField label="Selesai Final">
              <div style={{ ...readonlyDateStyle, borderColor: "var(--amber)", color: "var(--amber)" }}>
                {selesaiFinal ? formatDate(selesaiFinal) : "—"}
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                {form.hariIzin > 0
                  ? `+${form.hariIzin} hari izin ditambahkan`
                  : "Sama dengan selesai awal jika tanpa izin"}
              </p>
            </FormField>
          </div>
          <FormField label="Hari Izin">
            <input
              type="number"
              min={0}
              value={form.hariIzin}
              onChange={(e) => setForm({ ...form, hariIzin: Math.max(0, Number(e.target.value) || 0) })}
              style={inputStyle}
            />
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
              Setiap hari izin otomatis memperpanjang tanggal selesai final
            </p>
          </FormField>
          <FormField label="Nominal Membership">
            <input type="number" placeholder="40000" value={form.nominal} onChange={(e) => setForm({ ...form, nominal: e.target.value })} style={inputStyle} />
          </FormField>
          <FormField label="Status Pembayaran">
            <select value={form.statusPembayaran} onChange={(e) => setForm({ ...form, statusPembayaran: e.target.value as PaymentStatus })} style={inputStyle}>
              <option value="Belum Bayar">Belum Bayar — aktif kembali, tagih H+3</option>
              <option value="Lunas">Lunas — sudah bayar</option>
              {editingId && <option value="Lewat Jatuh Tempo">Lewat Jatuh Tempo</option>}
            </select>
            {form.tanggalMulai && form.statusPembayaran === "Belum Bayar" && (
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                Deadline pembayaran: {formatDate(addDaysISO(form.tanggalMulai, 3))} (driver tetap Aktif)
              </p>
            )}
          </FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setShowModal(false)} style={cancelBtnStyle}>Batal</button>
            <button onClick={handleSave} style={addBtnStyle}>Simpan</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px",
  background: "var(--bg-elevated)", border: "1px solid var(--border)",
  borderRadius: 8, color: "var(--text-primary)", fontSize: 13,
  fontFamily: "Outfit, sans-serif", outline: "none",
};

const addBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8,
  background: "var(--amber)", color: "#000",
  padding: "9px 16px", borderRadius: 8, border: "none",
  fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "Outfit, sans-serif",
};

const cancelBtnStyle: React.CSSProperties = {
  padding: "9px 16px", background: "transparent", color: "var(--text-secondary)",
  border: "1px solid var(--border)", borderRadius: 8, fontWeight: 500, fontSize: 13,
  cursor: "pointer", fontFamily: "Outfit, sans-serif",
};

const markPaidBtn: React.CSSProperties = {
  padding: "4px 10px", background: "var(--green-glow)", color: "var(--green)",
  border: "1px solid rgba(16,185,129,0.3)", borderRadius: 6, fontSize: 11,
  fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif",
};

const editBtnStyle: React.CSSProperties = {
  padding: "4px 10px", background: "var(--blue-glow)", color: "var(--blue)",
  border: "1px solid rgba(59,130,246,0.3)", borderRadius: 6, fontSize: 11,
  fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif",
};

const readonlyDateStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  fontFamily: "JetBrains Mono, monospace",
};

const deleteBtnStyle: React.CSSProperties = {
  padding: "4px 10px", background: "var(--red-glow)", color: "var(--red)",
  border: "1px solid rgba(220,38,38,0.3)", borderRadius: 6, fontSize: 11,
  fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif",
};
