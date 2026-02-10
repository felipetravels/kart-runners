import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import OneSignalSetup from "@/components/OneSignalSetup";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kart Runners Hub",
  description: "Panel logistyczny ekipy Kraków Airport",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className={inter.className} style={{ background: "#0a0a0a", color: "#fff", margin: 0 }}>
        <OneSignalSetup />
        <nav style={{ 
          display: "flex", justifyContent: "space-between", alignItems: "center", 
          padding: "15px 40px", background: "rgba(0,0,0,0.85)", borderBottom: "1px solid #222",
          position: "fixed", top: 0, width: "100%", zIndex: 1000, boxSizing: "border-box", backdropFilter: "blur(12px)"
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <img src="/logo-kart.png" alt="KART" style={{ height: "35px" }} />
            <span style={{ fontWeight: 900, color: "#fff", letterSpacing: "2px", fontSize: "1.1rem" }}>HUB</span>
          </Link>
          <div style={{ display: "flex", gap: "35px" }}>
            <Link href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "1px" }}>EKIPA</Link>
            <Link href="/logistics" style={{ color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "1px" }}>LOGISTYKA</Link>
            <Link href="/results" style={{ color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "1px" }}>WYNIKI</Link>
          </div>
        </nav>
        <div style={{ paddingTop: "0px" }}>{children}</div>
      </body>
    </html>
  );
}
