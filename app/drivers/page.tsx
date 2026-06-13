"use client";

import { useState } from "react";
import { Users, Plus, Search, Phone, Calendar, Filter, Loader2 } from "lucide-react";
import { type Driver, type OperationalStatus, type DriverType, formatDate } from "@/lib/data";
import { fromDriverRow, toDriverPayload } from "@/lib/mappers";
import { useDrivers, createDriver, updateDriver, deleteDriver } from "@/lib/hooks/useDrivers";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import ActionOverlay from "@/components/ActionOverlay";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useActionFeedback } from "@/lib/hooks/useActionFeedback";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "Semua", value: "all" },
  { label: "Aktif", value: "Aktif" },
  { label: "Menunggu Konfirmasi", value: "Menunggu Konfirmasi" },
  { label: "Off Sementara", value: "Off Sementara" },
  { label: "Keluar", value: "Keluar" },
];

const TYPE_FILTERS: { label: string; value: string }[] = [
  { label: "Semua", value: "all" },
  { label: "ANJEM", value: "ANJEM" },
  { label: "JASTIP", value: "JASTIP" },
];

const emptyForm = {
  nama: "",
  noWhatsApp: "",
  jenisDriver: "ANJEM" as DriverType,
  statusOperasional: "Aktif" as OperationalStatus,
  catatan: "",
  tanggalBergabung: "",
};

export default function DriversPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    overlay, confirmOpen, confirmOptions, confirm,
    handleConfirm, handleCancel, runAction,
  } = useActionFeedback();

  const { data: rows, loading, error, refetch } = useDrivers({
    status: statusFilter !== "all" ? statusFilter : undefined,
    jenis: typeFilter !== "all" ? typeFilter : undefined,
    q: search || undefined,
  });

  const drivers: Driver[] = (rows ?? []).map(fromDriverRow);

  const counts = {
    all: drivers.length,
    Aktif: drivers.filter((d) => d.statusOperasional === "Aktif").length,
    "Menunggu Konfirmasi": drivers.filter((d) => d.statusOperasional === "Menunggu Konfirmasi").length,
    "Off Sementara": drivers.filter((d) => d.statusOperasional === "Off Sementara").length,
    Keluar: drivers.filter((d) => d.statusOperasional === "Keluar").length,
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (driver: Driver) => {
    setEditingId(driver.id);
    setForm({
      nama: driver.nama,
      noWhatsApp: driver.noWhatsApp,
      jenisDriver: driver.jenisDriver,
      statusOperasional: driver.statusOperasional,
      catatan: driver.catatan,
      tanggalBergabung: driver.tanggalBergabung,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nama.trim()) {
      setFormError("Nama wajib diisi");
      return;
    }
    setFormError(null);
    const payload = toDriverPayload(form);
    const isEdit = Boolean(editingId);
    setShowModal(false);

    try {
      await runAction({
        loading: isEdit ? "Menyimpan driver..." : "Menambahkan driver...",
        success: isEdit ? "Driver berhasil diperbarui" : "Driver berhasil ditambahkan",
        action: async () => {
          const result = isEdit
            ? await updateDriver(editingId!, payload)
            : await createDriver(payload);
          if (result.error) throw new Error(result.error);
          refetch();
        },
      });
    } catch {
      setShowModal(true);
    }
  };

  const handleDelete = async (driver: Driver) => {
    const ok = await confirm({
      title: "Hapus Driver?",
      message: `Driver "${driver.nama}" dan semua datanya akan dihapus permanen.`,
      confirmLabel: "Hapus",
      danger: true,
    });
    if (!ok) return;

    await runAction({
      loading: "Menghapus driver...",
      success: "Driver berhasil dihapus",
      action: async () => {
        const result = await deleteDriver(driver.id);
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
        title="Manajemen Driver"
        subtitle={`${drivers.length} driver terdaftar`}
        icon={Users}
        action={
          <button onClick={openAdd} style={saveBtnStyle}>
            <Plus size={15} /> Tambah Driver
          </button>
        }
      />

      {error && (
        <div style={{ background: "var(--red-glow)", border: "1px solid var(--red)", borderRadius: 8, padding: "12px 16px", marginBottom: 16, color: "var(--red)", fontSize: 13 }}>
          Gagal memuat data: {error}
        </div>
      )}

      <div className="animate-fade-in delay-1" style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", padding: "16px 20px",
        marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
      }}>
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
          <input
            type="text"
            placeholder="Cari nama driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 34 }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              style={{
                padding: "6px 12px", borderRadius: 8, border: "1px solid",
                borderColor: statusFilter === f.value ? "var(--amber)" : "var(--border)",
                background: statusFilter === f.value ? "var(--amber-glow)" : "transparent",
                color: statusFilter === f.value ? "var(--amber)" : "var(--text-secondary)",
                fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Outfit, sans-serif",
              }}
            >
              {f.label} ({counts[f.value as keyof typeof counts] ?? 0})
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              style={{
                padding: "6px 12px", borderRadius: 8, border: "1px solid",
                borderColor: typeFilter === f.value ? "var(--purple)" : "var(--border)",
                background: typeFilter === f.value ? "var(--purple-glow)" : "transparent",
                color: typeFilter === f.value ? "var(--purple)" : "var(--text-secondary)",
                fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Outfit, sans-serif",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-fade-in delay-2" style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", overflow: "hidden",
      }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 48, color: "var(--text-secondary)" }}>
            <Loader2 size={20} className="animate-spin" /> Memuat driver...
          </div>
        ) : (
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Jenis</th>
                <th>Status Operasional</th>
                <th>WhatsApp</th>
                <th>Bergabung</th>
                <th>Catatan</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <DriverRow key={driver.id} driver={driver} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        )}
        {!loading && drivers.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-secondary)" }}>
            <Filter size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <p>Belum ada driver. Jalankan seed.sql di Supabase atau tambah driver baru.</p>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit Driver" : "Tambah Driver Baru"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {formError && (
            <div style={{ background: "var(--red-glow)", border: "1px solid var(--red)", borderRadius: 8, padding: "10px 12px", color: "var(--red)", fontSize: 13 }}>
              {formError}
            </div>
          )}
          <FormField label="Nama Lengkap">
            <input type="text" placeholder="Nama driver" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} style={inputStyle} />
          </FormField>
          <FormField label="Nomor WhatsApp">
            <input type="text" placeholder="08xxxxxxxxxx" value={form.noWhatsApp} onChange={(e) => setForm({ ...form, noWhatsApp: e.target.value })} style={inputStyle} />
          </FormField>
          <FormField label="Jenis Driver">
            <select value={form.jenisDriver} onChange={(e) => setForm({ ...form, jenisDriver: e.target.value as DriverType })} style={inputStyle}>
              <option value="ANJEM">Driver ANJEM</option>
              <option value="JASTIP">Driver JASTIP</option>
            </select>
          </FormField>
          <FormField label="Status Operasional">
            <select value={form.statusOperasional} onChange={(e) => setForm({ ...form, statusOperasional: e.target.value as OperationalStatus })} style={inputStyle}>
              <option value="Aktif">Aktif</option>
              <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
              <option value="Off Sementara">Off Sementara</option>
              <option value="Keluar">Keluar</option>
            </select>
          </FormField>
          <FormField label="Tanggal Bergabung">
            <input type="date" value={form.tanggalBergabung} onChange={(e) => setForm({ ...form, tanggalBergabung: e.target.value })} style={inputStyle} />
          </FormField>
          <FormField label="Catatan">
            <textarea placeholder="Catatan tambahan..." value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button onClick={() => setShowModal(false)} style={cancelBtnStyle}>Batal</button>
            <button onClick={handleSave} style={saveBtnStyle}>
              {editingId ? "Simpan Perubahan" : "Simpan Driver"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DriverRow({ driver, onEdit, onDelete }: { driver: Driver; onEdit: (d: Driver) => void; onDelete: (d: Driver) => void }) {
  return (
    <tr>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: driver.jenisDriver === "ANJEM" ? "var(--purple-glow)" : "var(--cyan-glow)",
            border: `1px solid ${driver.jenisDriver === "ANJEM" ? "rgba(139,92,246,0.3)" : "rgba(6,182,212,0.3)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700,
            color: driver.jenisDriver === "ANJEM" ? "var(--purple)" : "var(--cyan)",
            flexShrink: 0,
          }}>
            {driver.nama.charAt(0)}
          </div>
          <span style={{ fontWeight: 500 }}>{driver.nama}</span>
        </div>
      </td>
      <td>
        <span className={`status-badge ${driver.jenisDriver === "ANJEM" ? "badge-anjem" : "badge-jastip"}`}>
          {driver.jenisDriver}
        </span>
      </td>
      <td><StatusBadge status={driver.statusOperasional} /></td>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 12 }}>
          <Phone size={12} />
          {driver.noWhatsApp || "—"}
        </div>
      </td>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 12 }}>
          <Calendar size={12} />
          {formatDate(driver.tanggalBergabung)}
        </div>
      </td>
      <td style={{ color: "var(--text-secondary)", fontSize: 12, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {driver.catatan || "—"}
      </td>
      <td style={{ textAlign: "center" }}>
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          <ActionBtn label="Edit" color="var(--blue)" onClick={() => onEdit(driver)} />
          <ActionBtn label="Hapus" color="var(--red)" onClick={() => onDelete(driver)} />
        </div>
      </td>
    </tr>
  );
}

function ActionBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "4px 10px", borderRadius: 6, border: `1px solid ${color}30`,
        background: `${color}15`, color, fontSize: 11, fontWeight: 600,
        cursor: "pointer", fontFamily: "Outfit, sans-serif", transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = `${color}30`; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = `${color}15`; }}
    >
      {label}
    </button>
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

const saveBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "9px 20px", background: "var(--amber)", color: "#000",
  border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13,
  cursor: "pointer", fontFamily: "Outfit, sans-serif",
};

const cancelBtnStyle: React.CSSProperties = {
  padding: "9px 16px", background: "transparent", color: "var(--text-secondary)",
  border: "1px solid var(--border)", borderRadius: 8, fontWeight: 500, fontSize: 13,
  cursor: "pointer", fontFamily: "Outfit, sans-serif",
};
