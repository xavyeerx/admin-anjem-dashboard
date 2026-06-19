"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useCabang } from "@/lib/context/CabangContext";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const cabang = useCabang();

  return (
    <>
      <div
        className={`sidebar-overlay${sidebarOpen ? "" : " hidden"}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Fixed hamburger topbar — rendered outside content flow so position:fixed works cleanly */}
      <div className="mobile-topbar">
        <button
          className="mobile-topbar-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Buka menu navigasi"
        >
          <Menu size={20} />
        </button>
        <img src={cabang.logo_url ?? "/logo-sidebar.png"} alt="ANJEM" style={{ height: 32, objectFit: "contain" }} />
      </div>

      <Sidebar isMobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <main className="mobile-page-offset" style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
          {children}
        </main>
      </div>
    </>
  );
}
