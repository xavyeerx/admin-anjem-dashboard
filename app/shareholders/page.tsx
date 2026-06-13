"use client";

import { useState } from "react";
import { ChevronRight, Plus, Settings, ArrowRight, Loader2 } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/data";
import { useShareholders, updateShareholders } from "@/lib/hooks/useShareholders";
import { useTransfers, createTransfer, deleteTransfer } from "@/lib/hooks/useTransfers";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import ActionOverlay from "@/components/ActionOverlay";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useActionFeedback } from "@/lib/hooks/useActionFeedback";

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

export default function ShareholdersPage() {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    nominal: "",
    keterangan: "Bagi Hasil",
  });

  const { overlay, confirmOpen, confirmOptions, confirm, handleConfirm, handleCancel, runAction } = useActionFeedback();

  const { data: shData, loading: shLoading, refetch: refetchSh } = useShareholders();
  const { data: transfers, loading: trLoading, refetch: refetchTr } = useTransfers();

  const shareholders = shData?.shareholders ?? [];
  const summary      = shData?.summary;
  const labaBersih   = summary?.laba_bersih ?? 0;

  // Ambil dua shareholder utama
  const sh1 = shareholders[0];
  const sh2 = shareholders[1];

  // Shareholder Bintang (index 1 atau cari by nama)
  const bintang = shareholders.find((s) => s.nama === "Bintang") ?? sh2;
  const diki    = shareholders.find((s) => s.nama === "Diki") ?? sh1;

  // State untuk konfigurasi
  const [configPcts, setConfigPcts] = useState<Record<string, number>>({});
  const getPct = (sh: typeof sh1) => configPcts[sh?.id ?? ""] ?? sh?.persentase ?? 0;

  const totalTransfer   = summary?.total_transfer_bintang ?? 0;
  const hakBintang      = bintang?.hak ?? 0;
  const sisaBintang     = bintang?.sisa ?? (hakBintang - totalTransfer);

  const isLoading = shLoading || trLoading;

  const handleSaveConfig = async () => {
    const updates = shareholders.map((s) => ({
      id: s.id,
      persentase: configPcts[s.id] ?? s.persentase,
    }));
    const totalPct = updates.reduce((s, u) => s + u.persentase, 0);
    if (totalPct !== 100) return;

    setShowConfigModal(false);
    await runAction({
      loading: "Menyimpan konfigurasi...",
      success: "Konfigurasi persentase disimpan",
      action: async () => {
        const result = await updateShareholders(updates);
        if (result.error) throw new Error(result.error);
        refetchSh();
        setConfigPcts({});
      },
    });
  };

  const handleSaveTransfer = async () => {
    if (!transferForm.nominal || Number(transferForm.nominal) <= 0) return;
    setShowTransferModal(false);
    await runAction({
      loading: "Menyimpan transfer...",
      success: "Transfer berhasil dicatat",
      action: async () => {
        const result = await createTransfer({
          tanggal: transferForm.tanggal,
          nominal: Number(transferForm.nominal),
          keterangan: transferForm.keterangan,
        });
        if (result.error) throw new Error(result.error);
        refetchTr();
        refetchSh();
        setTransferForm({ tanggal: new Date().toISOString().split("T")[0], nominal: "", keterangan: "Bagi Hasil" });
      },
    });
  };

  const handleDeleteTransfer = async (id: string, keterangan: string) => {
    const ok = await confirm({
      title: "Hapus Transfer?",
      message: `"${keterangan}" akan dihapus permanen.`,
      confirmLabel: "Hapus",
      danger: true,
    });
    if (!ok) return;
    await runAction({
      loading: "Menghapus transfer...",
      success: "Transfer dihapus",
      action: async () => {
        const result = await deleteTransfer(id);
        if (result.error) throw new Error(result.error);
        refetchTr();
        refetchSh();
      },
    });
  };

  if (isLoading) {
    return (
      <div style={{ padding: "28px 32px", display: "flex", alignItems: "center", gap: 12, color: "var(--text-secondary)" }}>
        <Loader2 size={20} className="action-overlay-spin" /> Memuat data shareholder...
      </div>
    );
  }

  const totalConfigPct = shareholders.reduce((s, sh) => s + (configPcts[sh.id] ?? sh.persentase), 0);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1000, position: "relative" }}>
      <ActionOverlay state={overlay} />
      <ConfirmDialog open={confirmOpen} options={confirmOptions} onConfirm={handleConfirm} onCancel={handleCancel} />

      <PageHeader
        title="Shareholder"
        subtitle="Konfigurasi dan distribusi profit shareholder (data real-time)"
        icon={ChevronRight}
        action={
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowConfigModal(true)} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "var(--bg-card)", color: "var(--text-primary)",
              padding: "9px 14px", borderRadius: 8, border: "1px solid var(--border)",
              fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "Outfit, sans-serif",
            }}>
              <Settings size={14} /> Konfigurasi
            </button>
            <button onClick={() => setShowTransferModal(true)} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "var(--amber)", color: "#000",
              padding: "9px 14px", borderRadius: 8, border: "none",
              fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "Outfit, sans-serif",
            }}>
              <Plus size={14} /> Catat Transfer
            </button>
          </div>
        }
      />

      {/* Profit Distribution */}
      <div className="animate-fade-in delay-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Flow card */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "24px", gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Distribusi Profit</h2>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Otomatis dihitung dari laba bersih</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 20px", textAlign: "center", minWidth: 160 }}>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Laba Bersih</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: labaBersih >= 0 ? "var(--green)" : "var(--red)", fontFamily: "JetBrains Mono, monospace" }}>
                {formatRupiah(labaBersih)}
              </div>
            </div>

            <ArrowRight size={20} color="var(--text-muted)" />

            {/* Diki */}
            {diki && (
              <div style={{ background: "var(--purple-glow)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 10, padding: "16px 20px", flex: 1, minWidth: 160 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--purple)" }}>{diki.nama}</div>
                    <div style={{ fontSize: 11, color: "rgba(124,58,237,0.7)" }}>Shareholder {diki.persentase}%</div>
                  </div>
                  <div style={{ background: "rgba(124,58,237,0.2)", color: "var(--purple)", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                    {diki.persentase}%
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--purple)", fontFamily: "JetBrains Mono, monospace" }}>
                  {formatRupiah(diki.hak)}
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
              <div style={{ width: 1, height: 20, background: "var(--border)" }} />
              <div style={{ width: 1, height: 20, background: "var(--border)" }} />
            </div>

            {/* Bintang */}
            {bintang && (
              <div style={{ background: "var(--cyan-glow)", border: "1px solid rgba(8,145,178,0.25)", borderRadius: 10, padding: "16px 20px", flex: 1, minWidth: 160 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--cyan)" }}>{bintang.nama}</div>
                    <div style={{ fontSize: 11, color: "rgba(8,145,178,0.7)" }}>Shareholder {bintang.persentase}%</div>
                  </div>
                  <div style={{ background: "rgba(8,145,178,0.2)", color: "var(--cyan)", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                    {bintang.persentase}%
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--cyan)", fontFamily: "JetBrains Mono, monospace" }}>
                  {formatRupiah(bintang.hak)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ringkasan Transfer Bintang */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            Ringkasan Transfer — {bintang?.nama ?? "Bintang"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Hak",            value: hakBintang,    color: "var(--cyan)" },
              { label: "Sudah Transfer", value: totalTransfer, color: "var(--green)" },
              { label: "Sisa",           value: sisaBintang,   color: sisaBintang > 0 ? "var(--amber)" : "var(--green)" },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg-elevated)", borderRadius: 8 }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{row.label}</span>
                <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "JetBrains Mono, monospace", color: row.color }}>
                  {formatRupiah(row.value)}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Progress Transfer</span>
              <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>
                {hakBintang > 0 ? Math.round((totalTransfer / hakBintang) * 100) : 0}%
              </span>
            </div>
            <div style={{ height: 6, background: "var(--bg-elevated)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99,
                background: "linear-gradient(90deg, var(--green), var(--cyan))",
                width: `${hakBintang > 0 ? Math.min((totalTransfer / hakBintang) * 100, 100) : 0}%`,
                transition: "width 0.8s ease",
              }} />
            </div>
          </div>
        </div>

        {/* Transfer Log */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px", overflow: "hidden" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            Riwayat Transfer ke {bintang?.nama ?? "Bintang"}
          </h2>
          {!transfers || (transfers as { id: string }[]).length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Belum ada riwayat transfer.</p>
          ) : (
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Nominal</th>
                  <th>Keterangan</th>
                  <th style={{ textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {(transfers as { id: string; tanggal: string; nominal: number; keterangan: string }[]).map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{formatDate(t.tanggal)}</td>
                    <td>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, fontWeight: 600, color: "var(--green)" }}>
                        {formatRupiah(t.nominal)}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t.keterangan}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => handleDeleteTransfer(t.id, t.keterangan)}
                        style={{
                          padding: "4px 10px", background: "var(--red-glow)", color: "var(--red)",
                          border: "1px solid rgba(220,38,38,0.3)", borderRadius: 6, fontSize: 11,
                          fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif",
                        }}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Config Modal */}
      <Modal open={showConfigModal} onClose={() => setShowConfigModal(false)} title="Konfigurasi Persentase Saham">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--bg-elevated)", borderRadius: 8, padding: "12px 14px", border: "1px solid var(--border)", fontSize: 12, color: "var(--amber)" }}>
            ⚠ Total persentase harus 100%. Perubahan akan disimpan ke database.
          </div>
          {shareholders.map((sh) => (
            <FormField key={sh.id} label={`${sh.nama} (%)`}>
              <input
                type="number" min={0} max={100}
                value={configPcts[sh.id] ?? sh.persentase}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  const newPcts = { ...configPcts, [sh.id]: val };
                  // Auto-adjust lainnya jika hanya 2 shareholder
                  if (shareholders.length === 2) {
                    const otherId = shareholders.find((s) => s.id !== sh.id)?.id;
                    if (otherId) newPcts[otherId] = 100 - val;
                  }
                  setConfigPcts(newPcts);
                }}
                style={inputStyle}
              />
            </FormField>
          ))}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "8px 12px",
            background: totalConfigPct === 100 ? "var(--green-glow)" : "var(--red-glow)",
            borderRadius: 8,
            border: `1px solid ${totalConfigPct === 100 ? "rgba(5,150,105,0.3)" : "rgba(220,38,38,0.3)"}`,
          }}>
            <span style={{ fontSize: 12, color: totalConfigPct === 100 ? "var(--green)" : "var(--red)" }}>
              Total: {totalConfigPct}%
            </span>
            <span style={{ fontSize: 11, color: totalConfigPct === 100 ? "var(--green)" : "var(--red)" }}>
              {totalConfigPct === 100 ? "✓ Valid" : "✗ Harus 100%"}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setShowConfigModal(false)} style={cancelBtnStyle}>Batal</button>
            <button onClick={handleSaveConfig} disabled={totalConfigPct !== 100} style={{
              padding: "9px 16px",
              background: totalConfigPct === 100 ? "var(--amber)" : "var(--bg-elevated)",
              color: totalConfigPct === 100 ? "#000" : "var(--text-muted)",
              border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13,
              cursor: totalConfigPct === 100 ? "pointer" : "not-allowed",
              fontFamily: "Outfit, sans-serif",
            }}>
              Simpan
            </button>
          </div>
        </div>
      </Modal>

      {/* Transfer Modal */}
      <Modal open={showTransferModal} onClose={() => setShowTransferModal(false)} title={`Catat Transfer ke ${bintang?.nama ?? "Bintang"}`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ padding: "12px", background: "var(--cyan-glow)", borderRadius: 8, border: "1px solid rgba(8,145,178,0.2)" }}>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Sisa yang harus ditransfer:</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--cyan)", fontFamily: "JetBrains Mono, monospace" }}>
              {formatRupiah(sisaBintang)}
            </div>
          </div>
          <FormField label="Tanggal Transfer">
            <input type="date" style={inputStyle} value={transferForm.tanggal}
              onChange={(e) => setTransferForm({ ...transferForm, tanggal: e.target.value })} />
          </FormField>
          <FormField label="Nominal Transfer">
            <input type="number" placeholder="20000" style={inputStyle} value={transferForm.nominal}
              onChange={(e) => setTransferForm({ ...transferForm, nominal: e.target.value })} />
          </FormField>
          <FormField label="Keterangan">
            <input type="text" style={inputStyle} value={transferForm.keterangan}
              onChange={(e) => setTransferForm({ ...transferForm, keterangan: e.target.value })} />
          </FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setShowTransferModal(false)} style={cancelBtnStyle}>Batal</button>
            <button onClick={handleSaveTransfer} style={{
              padding: "9px 16px", background: "var(--amber)", color: "#000",
              border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13,
              cursor: "pointer", fontFamily: "Outfit, sans-serif",
            }}>
              Simpan Transfer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
