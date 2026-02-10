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
    <html lang="pl" style={{scrollBehavior: "smooth"}}>
      <body className={inter.className} style={{ background: "#0a0a0a", color: "#fff", margin: 0 }}>
        <OneSignalSetup />
        <nav style={{ 
          display: "flex", justifyContent: "space-between", alignItems: "center", 
          padding: "10px 40px", background: "rgba(0,0,0,0.9)", borderBottom: "1px solid #222",
          position: "fixed", top: 0, width: "100%", zIndex: 1000, boxSizing: "border-box", backdropFilter: "blur(15px)"
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "20px", textDecoration: "none" }}>
            <img src="/logo-kart.png" alt="KART" style={{ height: "125px" }} />
            <span style={{ fontWeight: 900, color: "#fff", letterSpacing: "3px", fontSize: "1.4rem" }}>KART TEAM</span>
          </Link>
          
          <div style={{ display: "flex", alignItems: "center", gap: "35px" }}>
            <Link href="/#ekipa" style={{ color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}>EKIPA</Link>
            <Link href="/logistics" style={{ color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}>LOGISTYKA</Link>
            <Link href="/#wyniki" style={{ color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}>WYNIKI</Link>
            <Link href="/profile" style={{ 
              background: "#00d4ff", color: "#000", padding: "8px 15px", borderRadius: "5px", 
              textDecoration: "none", fontWeight: 900, fontSize: "0.8rem" 
            }}>PROFIL / ZALOGUJ</Link>
          </div>
        </nav>
        <div style={{ paddingTop: "0px" }}>{children}</div>
      </body>
    </html>
  );
}
