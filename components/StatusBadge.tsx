"use client";

type Status =
  | "Aktif"
  | "Menunggu Konfirmasi"
  | "Off Sementara"
  | "Keluar"
  | "Lunas"
  | "Belum Bayar"
  | "Lewat Jatuh Tempo";

const STATUS_CLASS: Record<Status, string> = {
  "Aktif":               "badge-aktif",
  "Menunggu Konfirmasi": "badge-menunggu",
  "Off Sementara":       "badge-off",
  "Keluar":              "badge-keluar",
  "Lunas":               "badge-lunas",
  "Belum Bayar":         "badge-belum",
  "Lewat Jatuh Tempo":   "badge-lewat",
};

const DOT_VAR: Record<Status, string> = {
  "Aktif":               "var(--badge-aktif-fg)",
  "Menunggu Konfirmasi": "var(--badge-menunggu-fg)",
  "Off Sementara":       "var(--badge-off-fg)",
  "Keluar":              "var(--badge-keluar-fg)",
  "Lunas":               "var(--badge-lunas-fg)",
  "Belum Bayar":         "var(--badge-belum-fg)",
  "Lewat Jatuh Tempo":   "var(--badge-lewat-fg)",
};

export default function StatusBadge({ status }: { status: Status }) {
  const cls = STATUS_CLASS[status] ?? "badge-keluar";
  const dot = DOT_VAR[status] ?? "var(--text-muted)";

  return (
    <span className={`status-badge ${cls}`}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: dot,
        display: "inline-block",
        flexShrink: 0,
      }} />
      {status}
    </span>
  );
}
