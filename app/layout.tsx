import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "ANJEM Admin Dashboard",
  description: "Admin Management System for ANJEM UGM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-theme="light">
      <body style={{ display: "flex", minHeight: "100vh", background: "var(--bg-deep)" }}>
        <ThemeProvider>
          <Sidebar />
          <main style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
