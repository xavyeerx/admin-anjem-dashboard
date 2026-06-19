"use client";

import { useState } from "react";
import { CalendarOff, Plus, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/data";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import ActionOverlay from "@/components/ActionOverlay";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useActionFeedback } from "@/lib/hooks/useActionFeedback";
import { useIzin, createIzin, deleteIzin } from "@/lib/hooks/useIzin";
import { useDrivers } from "@/lib/hooks/useDrivers";
import { useCabang } from "@/lib/context/CabangContext";
import type { IzinRow } from "@/lib/supabase/types";

type IzinWithDetails = IzinRow & {
  drivers: { id: string; nama: string; jenis_driver: string } | null;
  memberships: {
    id: string;
    tanggal_mulai: string;
    tanggal_selesai_awal: string;
    tanggal_selesai_final: string;
    hari_izin: number;
  } | null;
};

export default function IzinPage() {
  const { id: cabang } = useCabang();
  const [showModal, setShowModal] = useState(false);
  const { data: driverRows, loading: driverLoading } = useDrivers(cabang);
  const drivers = driverRows ?? [];

  const { data: izinData, loading: izinLoading, refetch } = useIzin(cabang);
  const izinRecords = (izinData as IzinWithDetails[] | null) ?? [];

  const { overlay, confirmOpen, confirmOptions, confirm, handleConfirm, handleCancel, runAction } = useActionFeedback();

  const [form, setForm] = useState({
    driverId: "",
    jumlahHari: "",
    alasan: "",
    tanggalInput: new Date().toISOString().split("T")[0],
  });

  const handleSave = async () => {
    if (!form.driverId || !form.jumlahHari) return;
    setShowModal(false);
    await runAction({
      loading: "Menambahkan izin...",
      success: "Izin berhasil ditambahkan dan masa aktif diperpanjang",
      action: async () => {
        const result = await createIzin(cabang, {
          driver_id: form.driverId,
          jumlah_hari: Number(form.jumlahHari),
          alasan: form.alasan,
          tanggal_input: form.tanggalInput,
        });
        if (result.error) throw new Error(result.error);
        refetch();
        setForm({
          driverId: drivers[0]?.id ?? "",
          jumlahHari: "",
          alasan: "",
          tanggalInput: new Date().toISOString().split("T")[0],
        });
      },
    });
  };

  const handleDelete = async (id: string, driverName: string) => {
    const ok = await confirm({
      title: "Hapus Izin?",
      message: `Izin untuk "${driverName}" akan dihapus. Masa aktif akan otomatis dikurangi.`,
      confirmLabel: "Hapus",
      danger: true,
    });
    if (!ok) return;

    await runAction({
      loading: "Menghapus izin...",
      success: "Izin dihapus dan masa aktif disesuaikan",
      action: async () => {
        const result = await deleteIzin(cabang, id);
        if (result.error) throw new Error(result.error);
        refetch();
      },
    });
  };

  void driverLoading;

  return (
    <div style={{ padding: "var(--page-py) var(--page-px)", position: "relative" }}>
      <ActionOverlay state={overlay} />
      <ConfirmDialog open={confirmOpen} options={confirmOptions} onConfirm={handleConfirm} onCancel={handleCancel} />

      <PageHeader
        title="Izin Driver"
        subtitle="Kelola izin dan perpanjangan masa aktif driver"
        icon={CalendarOff}
        action={
          <button onClick={() => {
            if (!form.driverId && drivers.length > 0) {
              setForm(f => ({ ...f, driverId: drivers[0].id }));
            }
            setShowModal(true);
          }} style={addBtnStyle}>
            <Plus size={15} /> Tambah Izin
          </button>
        }
      />

      <div className="animate-fade-in delay-1" style={{
        background: "var(--brand-glow)", border: "1px solid var(--brand-border)",
        borderRadius: "var(--radius)", padding: "14px 18px", marginBottom: 20,
        display: "flex", gap: 14, alignItems: "flex-start",
      }}>
        <CalendarOff size={18} color="var(--brand)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--brand)", marginBottom: 4 }}>Mekanisme Izin</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Setiap hari izin yang ditambahkan akan memperpanjang <strong style={{ color: "var(--text-primary)" }}>Tanggal Selesai Final</strong> membership driver secara otomatis.
          </div>
        </div>
      </div>

      <div className="animate-fade-in delay-2" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Riwayat Izin</h2>
        </div>
        <div className="table-scroll">
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Driver</th>
                <th>Jumlah Hari Izin</th>
                <th>Alasan</th>
                <th>Tanggal Input</th>
                <th>Masa Aktif Setelah Izin</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {izinRecords.map((izin) => {
                const driver = izin.drivers;
                const membership = izin.memberships;
                return (
                  <tr key={izin.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--blue-glow)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--blue)" }}>
                          {driver?.nama?.charAt(0) ?? "?"}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{driver?.nama ?? "—"}</div>
                          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{driver?.jenis_driver ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--blue-glow)", border: "1px solid rgba(59,130,246,0.3)", color: "var(--blue)", padding: "4px 12px", borderRadius: 99, fontSize: 13, fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>
                        +{izin.jumlah_hari} hari
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{izin.alasan || "—"}</td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{formatDate(izin.tanggal_input)}</td>
                    <td>
                      {membership ? (
                        <div style={{ fontSize: 12 }}>
                          <span style={{ color: "var(--text-secondary)" }}>{formatDate(membership.tanggal_mulai)}</span>
                          <span style={{ color: "var(--text-muted)", margin: "0 6px" }}>→</span>
                          <span style={{ color: "var(--green)", fontWeight: 600 }}>{formatDate(membership.tanggal_selesai_final)}</span>
                          <span style={{ color: "var(--blue)", fontSize: 11, marginLeft: 6 }}>(+{membership.hari_izin} hari total)</span>
                        </div>
                      ) : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button style={deleteBtnStyle} onClick={() => handleDelete(izin.id, driver?.nama ?? "Driver")}>Hapus</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {izinLoading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 48, color: "var(--text-secondary)" }}>
            <Loader2 size={20} className="action-overlay-spin" /> Memuat data izin...
          </div>
        )}
        {!izinLoading && izinRecords.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-secondary)", fontSize: 13 }}>
            Belum ada riwayat izin.
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Tambah Izin Driver">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Driver">
            <select value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} style={inputStyle}>
              <option value="">Pilih driver...</option>
              {drivers.filter((d) => d.status_operasional !== "Keluar").map((d) => (
                <option key={d.id} value={d.id}>{d.nama} ({d.jenis_driver})</option>
              ))}
            </select>
          </FormField>
          <FormField label="Jumlah Hari Izin">
            <input type="number" placeholder="e.g. 3" min={1} value={form.jumlahHari} onChange={(e) => setForm({ ...form, jumlahHari: e.target.value })} style={inputStyle} />
          </FormField>
          <FormField label="Alasan Izin">
            <textarea placeholder="Alasan pengambilan izin..." value={form.alasan} onChange={(e) => setForm({ ...form, alasan: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </FormField>
          <FormField label="Tanggal Input">
            <input type="date" value={form.tanggalInput} onChange={(e) => setForm({ ...form, tanggalInput: e.target.value })} style={inputStyle} />
          </FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setShowModal(false)} style={cancelBtnStyle}>Batal</button>
            <button onClick={handleSave} style={addBtnStyle}>Simpan Izin</button>
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
  background: "var(--brand)", color: "#fff",
  padding: "9px 16px", borderRadius: 8, border: "none",
  fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "Outfit, sans-serif",
};

const cancelBtnStyle: React.CSSProperties = {
  padding: "9px 16px", background: "transparent", color: "var(--text-secondary)",
  border: "1px solid var(--border)", borderRadius: 8, fontWeight: 500, fontSize: 13,
  cursor: "pointer", fontFamily: "Outfit, sans-serif",
};

const deleteBtnStyle: React.CSSProperties = {
  padding: "4px 10px", background: "var(--red-glow)", color: "var(--red)",
  border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, fontSize: 11,
  fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif",
};
