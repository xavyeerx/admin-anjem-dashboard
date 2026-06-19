import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANJEM Admin Dashboard",
  description: "Admin Management System for ANJEM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-theme="light">
      <body style={{ minHeight: "100vh", background: "var(--bg-deep)" }}>
        {children}
      </body>
    </html>
  );
}
