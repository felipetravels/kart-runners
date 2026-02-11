"use client";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import OneSignalSetup from "@/components/OneSignalSetup";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
        if (data) setUserName(data.display_name);
      }
    }
    getProfile();
  }, []);

  return (
    <html lang="pl">
      <body className={inter.className} style={{ background: "#0a0a0a", color: "#fff", margin: 0 }}>
        <OneSignalSetup />
        <nav style={{ 
          display: "flex", justifyContent: "space-between", alignItems: "center", 
          padding: "10px 40px", background: "rgba(0,0,0,0.85)", borderBottom: "1px solid #222",
          position: "fixed", top: 0, width: "100%", zIndex: 1000, boxSizing: "border-box", backdropFilter: "blur(15px)"
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "20px", textDecoration: "none" }}>
            <img src="/logo-kart.png" alt="KART" style={{ height: "125px" }} />
            <span style={{ 
              fontWeight: 900, color: "#fff", letterSpacing: "1px", fontSize: "1.6rem",
              textShadow: "0 0 15px rgba(0,212,255,0.6)", lineHeight: 1
            }}>
              KRAKÓW AIRPORT<br/>
              <span style={{ color: "#00d4ff" }}>RUNNING TEAM</span>
            </span>
          </Link>
          
          <div style={{ display: "flex", alignItems: "center", gap: "35px" }}>
            {/* Poprawione linki do fizycznych podstron */}
            <Link href="/ekipa" style={navLink}>EKIPA</Link>
            <Link href="/logistics" style={navLink}>LOGISTYKA</Link>
            <Link href="/results" style={navLink}>WYNIKI</Link>
            
            <div style={{ display: "flex", alignItems: "center", gap: "15px", borderLeft: "1px solid #333", paddingLeft: "25px" }}>
              {userName && <span style={{ fontSize: "0.9rem", color: "#00d4ff", fontWeight: 700 }}>Cześć, {userName}!</span>}
              <Link href="/profile" style={{ 
                background: "#00d4ff", color: "#000", padding: "8px 18px", borderRadius: "5px", 
                textDecoration: "none", fontWeight: 900, fontSize: "0.8rem" 
              }}>PROFIL</Link>
            </div>
          </div>
        </nav>
        <div style={{ paddingTop: "0px" }}>{children}</div>
      </body>
    </html>
  );
}

const navLink = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "0.9rem",
  transition: "0.2s opacity"
};
