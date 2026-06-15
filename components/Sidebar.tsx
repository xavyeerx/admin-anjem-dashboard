"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, CreditCard, BellRing,
  MessageSquare, Wallet, PieChart, Download,
  TrendingUp, X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/",            label: "Dashboard",      icon: LayoutDashboard, group: "Main" },
  { href: "/drivers",     label: "Driver",          icon: Users,           group: "Operasional" },
  { href: "/membership",  label: "Membership",      icon: CreditCard,      group: "Operasional" },
  { href: "/payments",    label: "Pembayaran",      icon: Wallet,          group: "Operasional" },
  { href: "/reminders",   label: "Reminder Center", icon: BellRing,        group: "Operasional", badge: "3" },
  { href: "/broadcast",   label: "Broadcast",       icon: MessageSquare,   group: "Tools" },
  { href: "/finance",     label: "Keuangan",        icon: PieChart,        group: "Keuangan" },
  { href: "/shareholders",label: "Shareholder",     icon: TrendingUp,      group: "Keuangan" },
  { href: "/export",      label: "Export & Backup", icon: Download,        group: "Tools" },
];

const GROUPS = ["Main", "Operasional", "Keuangan", "Tools"];

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const grouped = GROUPS.map((g) => ({
    label: g,
    items: NAV_ITEMS.filter((item) => item.group === g),
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
      {/* Logo */}
      <div style={{
        padding: "20px 20px 16px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: isMobileOpen ? "space-between" : "center",
      }}>
        <img src="/logo-sidebar.png" alt="ANJEM Logo" style={{ height: 42, objectFit: "contain" }} />
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
                  badge={item.badge}
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
          background: "linear-gradient(135deg, #dbeafe, #93c5fd)",
          border: "1px solid #93c5fd",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700,
          color: "#1d4ed8",
          flexShrink: 0,
        }}>
          A
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Admin</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>ANJEM UGM</div>
        </div>
      </div>
    </aside>
  );
}

function NavLink({
  href, label, icon: Icon, isActive, badge, onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  badge?: string;
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
          ? "var(--amber-glow)"
          : hovered
          ? "rgba(0,0,0,0.05)"
          : "transparent",
        color: isActive ? "var(--amber)" : hovered ? "var(--text-primary)" : "var(--text-secondary)",
        fontWeight: isActive ? 600 : 400,
        fontSize: 13.5,
        transition: "all 0.15s ease",
        border: isActive ? "1px solid rgba(217,119,6,0.22)" : "1px solid transparent",
      }}
    >
      <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{
          background: "var(--red)",
          color: "#fff",
          fontSize: 10, fontWeight: 700,
          padding: "1px 6px", borderRadius: 99, lineHeight: "18px",
        }}>
          {badge}
        </span>
      )}
    </Link>
  );
}
