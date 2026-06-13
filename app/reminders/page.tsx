"use client";

import { BellRing, AlertTriangle, Clock, PauseCircle, Phone, Loader2 } from "lucide-react";
import { formatDate, formatRupiah } from "@/lib/data";
import { useDashboardStats } from "@/lib/hooks/useDashboard";
import PageHeader from "@/components/PageHeader";

interface ReminderSectionProps {
  title: string;
  color: string;
  icon: React.ElementType;
  children: React.ReactNode;
  count: number;
}

function ReminderSection({ title, color, icon: Icon, children, count }: ReminderSectionProps) {
  return (
    <div style={{
      background: "var(--bg-card)", border: `1px solid ${color}25`,
      borderRadius: "var(--radius)", overflow: "hidden", marginBottom: 16,
    }}>
      <div style={{
        background: `${color}0d`, padding: "14px 20px",
        borderBottom: `1px solid ${color}20`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${color}20`, border: `1px solid ${color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={16} color={color} />
        </div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color, flex: 1 }}>{title}</h2>
        <span style={{
          background: color, color: "#fff",
          fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
        }}>
          {count}
        </span>
      </div>
      <div style={{ padding: "12px 16px" }}>{children}</div>
    </div>
  );
}

function DriverCard({ nama, jenisDriver, noWA, detail, urgencyColor, isPulse }: {
  nama: string; jenisDriver: string; noWA: string | null;
  detail: React.ReactNode; urgencyColor: string; isPulse?: boolean;
}) {
  return (
    <div style={{
      background: "var(--bg-elevated)", border: `1px solid ${urgencyColor}20`,
      borderRadius: 10, padding: "14px 16px", marginBottom: 10,
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: `${urgencyColor}15`, border: `1px solid ${urgencyColor}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 15, fontWeight: 800, color: urgencyColor, flexShrink: 0,
      }}>
        {nama.charAt(0)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{nama}</span>
          <span style={{
            background: jenisDriver === "ANJEM" ? "var(--purple-glow)" : "var(--cyan-glow)",
            color: jenisDriver === "ANJEM" ? "var(--purple)" : "var(--cyan)",
            border: `1px solid ${jenisDriver === "ANJEM" ? "rgba(124,58,237,0.3)" : "rgba(8,145,178,0.3)"}`,
            fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99,
          }}>
            {jenisDriver}
          </span>
          {isPulse && (
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: urgencyColor, display: "inline-block",
              animation: "pulse-amber 2s ease-in-out infinite",
            }} />
          )}
        </div>
        <div style={{ marginTop: 3 }}>{detail}</div>
      </div>
      {noWA && (
        <a
          href={`https://wa.me/${noWA.replace(/^0/, "62")}`}
          target="_blank" rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(37,211,102,0.3)",
            background: "rgba(37,211,102,0.1)", color: "#25d366",
            fontSize: 12, fontWeight: 600, textDecoration: "none", flexShrink: 0,
          }}
        >
          <Phone size={12} /> WA
        </a>
      )}
    </div>
  );
}

export default function RemindersPage() {
  const { data: stats, loading, error } = useDashboardStats();

  const lewatTempo  = stats?.reminders.lewat_jatuh_tempo ?? [];
  const belumBayar  = stats?.reminders.belum_bayar ?? [];
  const menunggu    = stats?.reminders.menunggu_konfirmasi ?? [];
  const offSementara = stats?.reminders.off_sementara ?? [];

  function daysAgo(dateStr: string | null): number {
    if (!dateStr) return 0;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  }
  function daysLeft(dateStr: string | null): number {
    if (!dateStr) return 0;
    return Math.floor((new Date(dateStr).getTime() - Date.now()) / 86400000);
  }

  const total = lewatTempo.length + belumBayar.length + menunggu.length;

  if (loading) {
    return (
      <div style={{ padding: "28px 32px", display: "flex", alignItems: "center", gap: 12, color: "var(--text-secondary)" }}>
        <Loader2 size={20} className="action-overlay-spin" /> Memuat reminder...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "28px 32px", color: "var(--red)" }}>Gagal memuat: {error}</div>
    );
  }

  return (
    <div style={{ padding: "28px 32px", maxWidth: 860 }}>
      <PageHeader
        title="Reminder Center"
        subtitle="Halaman prioritas — semua yang butuh tindakan admin (data real-time)"
        icon={BellRing}
      />

      {total === 0 && lewatTempo.length === 0 ? (
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
          padding: "60px 40px", textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--green)", marginBottom: 8 }}>Semua Bersih!</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Tidak ada driver yang perlu tindakan saat ini.</p>
        </div>
      ) : (
        <>
          {/* Lewat Jatuh Tempo */}
          <ReminderSection title="🚨 Lewat Jatuh Tempo" color="var(--red)" icon={AlertTriangle} count={lewatTempo.length}>
            {lewatTempo.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: 13, padding: "8px 0" }}>Tidak ada driver lewat jatuh tempo.</p>
            ) : lewatTempo.map((r) => (
              <DriverCard
                key={r.membership_id}
                nama={r.driver?.nama ?? "—"}
                jenisDriver={r.driver?.jenis_driver ?? "ANJEM"}
                noWA={r.driver?.no_whatsapp ?? null}
                urgencyColor="var(--red)"
                isPulse
                detail={
                  <div style={{ display: "flex", gap: 12, marginTop: 2, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 600 }}>
                      Terlambat {r.days_overdue} hari
                    </span>
                    {r.deadline && (
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        Deadline: {formatDate(r.deadline)}
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: "var(--green)", fontFamily: "JetBrains Mono, monospace" }}>
                      {formatRupiah(r.nominal)}
                    </span>
                  </div>
                }
              />
            ))}
          </ReminderSection>

          {/* Belum Bayar */}
          <ReminderSection title="⏳ Belum Bayar" color="var(--amber)" icon={Clock} count={belumBayar.length}>
            {belumBayar.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: 13, padding: "8px 0" }}>Semua driver aktif sudah membayar.</p>
            ) : belumBayar.map((r) => {
              const dl = daysLeft(r.deadline);
              return (
                <DriverCard
                  key={r.membership_id}
                  nama={r.driver?.nama ?? "—"}
                  jenisDriver={r.driver?.jenis_driver ?? "ANJEM"}
                  noWA={r.driver?.no_whatsapp ?? null}
                  urgencyColor="var(--amber)"
                  isPulse
                  detail={
                    <div style={{ display: "flex", gap: 12, marginTop: 2, flexWrap: "wrap" }}>
                      {r.deadline && (
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                          Deadline: {formatDate(r.deadline)}
                        </span>
                      )}
                      {dl >= 0
                        ? <span style={{ fontSize: 12, color: "var(--amber)", fontWeight: 600 }}>Sisa {dl} hari</span>
                        : <span style={{ fontSize: 12, color: "var(--red)" }}>Sudah lewat!</span>
                      }
                      <span style={{ fontSize: 12, color: "var(--green)", fontFamily: "JetBrains Mono, monospace" }}>
                        {formatRupiah(r.nominal)}
                      </span>
                    </div>
                  }
                />
              );
            })}
          </ReminderSection>

          {/* Menunggu Konfirmasi */}
          <ReminderSection title="🟡 Menunggu Konfirmasi" color="var(--blue)" icon={Clock} count={menunggu.length}>
            {menunggu.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: 13, padding: "8px 0" }}>Tidak ada driver menunggu konfirmasi.</p>
            ) : menunggu.map((d) => (
              <DriverCard
                key={d.driver_id}
                nama={d.nama}
                jenisDriver="ANJEM"
                noWA={null}
                urgencyColor="var(--blue)"
                detail={
                  <span style={{ fontSize: 12, color: "var(--blue)", fontWeight: 600 }}>Masa aktif sudah habis</span>
                }
              />
            ))}
          </ReminderSection>

          {/* Off Sementara */}
          <ReminderSection title="🔵 Off Sementara" color="#64748b" icon={PauseCircle} count={offSementara.length}>
            {offSementara.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: 13, padding: "8px 0" }}>Tidak ada driver off sementara.</p>
            ) : offSementara.map((d) => (
              <DriverCard
                key={d.driver_id}
                nama={d.nama}
                jenisDriver="ANJEM"
                noWA={null}
                urgencyColor="#64748b"
                detail={
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Driver sedang off sementara</span>
                }
              />
            ))}
          </ReminderSection>
        </>
      )}
    </div>
  );
}
