"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, CreditCard, BellRing,
  MessageSquare, Wallet, PieChart, Download,
  TrendingUp, X, FileText,
} from "lucide-react";
import { useCabang } from "@/lib/context/CabangContext";

const NAV_ITEMS = [
  { path: "",             label: "Dashboard",      icon: LayoutDashboard, group: "Main" },
  { path: "/drivers",     label: "Driver",          icon: Users,           group: "Operasional" },
  { path: "/membership",  label: "Membership",      icon: CreditCard,      group: "Operasional" },
  { path: "/payments",    label: "Pembayaran",      icon: Wallet,          group: "Operasional" },
  { path: "/reminders",   label: "Reminder Center", icon: BellRing,        group: "Operasional" },
  { path: "/izin",        label: "Izin Driver",     icon: FileText,        group: "Operasional" },
  { path: "/broadcast",   label: "Broadcast",       icon: MessageSquare,   group: "Tools" },
  { path: "/finance",     label: "Keuangan",        icon: PieChart,        group: "Keuangan" },
  { path: "/shareholders",label: "Shareholder",     icon: TrendingUp,      group: "Keuangan" },
  { path: "/export",      label: "Export & Backup", icon: Download,        group: "Tools" },
];

const GROUPS = ["Main", "Operasional", "Keuangan", "Tools"];

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const cabang = useCabang();
  const base = `/${cabang.id}`;

  const navItems = NAV_ITEMS.map(item => ({
    ...item,
    href: `${base}${item.path}`,
  }));

  const grouped = GROUPS.map((g) => ({
    label: g,
    items: navItems.filter((item) => item.group === g),
  }));

  return (
    <aside
      className={`sidebar-nav${isMobileOpen ? " sidebar-open" : ""}`}
      style={{
        width: "var(--sidebar-w)",
        minWidth: "var(--sidebar-w)",
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Logo + Branch badge */}
      <div style={{
        padding: "20px 20px 16px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <img src={cabang.logo_url ?? "/logo-sidebar.png"} alt="ANJEM Logo" style={{ height: 38, objectFit: "contain", flexShrink: 0 }} />
          <div style={{
            fontSize: 11, fontWeight: 700, color: "var(--brand)",
            background: "var(--brand-glow)",
            border: "1px solid var(--brand-border)",
            padding: "2px 8px", borderRadius: 99,
            letterSpacing: "0.04em", whiteSpace: "nowrap",
          }}>
            {cabang.id.toUpperCase()}
          </div>
        </div>
        <button className="sidebar-close-btn" onClick={onMobileClose} aria-label="Tutup menu">
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
        {grouped.map((group) => (
          <div key={group.label} style={{ marginBottom: 6 }}>
            {group.label !== "Main" && (
              <div style={{
                fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                color: "var(--text-muted)", textTransform: "uppercase",
                padding: "10px 10px 4px",
              }}>
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={Icon}
                  isActive={isActive}
                  onNavigate={onMobileClose}
                />
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom user info */}
      <div style={{
        padding: "14px 16px",
        borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "var(--brand-glow)",
          border: "1px solid var(--brand-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700,
          color: "var(--brand)",
          flexShrink: 0,
        }}>
          A
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Admin</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{cabang.nama}</div>
        </div>
      </div>
    </aside>
  );
}

function NavLink({
  href, label, icon: Icon, isActive, onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "9px 10px", borderRadius: 8, marginBottom: 2,
        textDecoration: "none",
        background: isActive
          ? "var(--brand-glow)"
          : hovered
          ? "rgba(0,0,0,0.05)"
          : "transparent",
        color: isActive ? "var(--brand)" : hovered ? "var(--text-primary)" : "var(--text-secondary)",
        fontWeight: isActive ? 600 : 400,
        fontSize: 13.5,
        transition: "all 0.15s ease",
        border: isActive ? "1px solid var(--brand-border)" : "1px solid transparent",
      }}
    >
      <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
      <span style={{ flex: 1 }}>{label}</span>
    </Link>
  );
}
