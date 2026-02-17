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
      <body className={inter.className} style={{ background: "#0a0a0a", color: "#fff", margin: 0, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <OneSignalSetup />
        {/* JEDYNY NAVBAR W APLIKACJI */}
        <nav style={{ 
          display: "flex", justifyContent: "space-between", alignItems: "center", 
          padding: "10px 40px", background: "rgba(0,0,0,0.95)", borderBottom: "1px solid #222",
          position: "fixed", top: 0, width: "100%", zIndex: 2000, boxSizing: "border-box", backdropFilter: "blur(15px)"
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "20px", textDecoration: "none" }}>
            <img src="/logo-kart.png" alt="KART" style={{ height: "60px" }} /> {/* Zmniejszyłem logo, by navbar był smuklejszy */}
            <span style={{ fontWeight: 900, color: "#fff", letterSpacing: "1px", fontSize: "1.2rem", lineHeight: 1 }}>
              KRAKÓW AIRPORT<br/>
              <span style={{ color: "#00d4ff" }}>RUNNING TEAM</span>
            </span>
          </Link>
          
          <div style={{ display: "flex", alignItems: "center", gap: "35px" }}>
            <Link href="/runners" style={navLink}>EKIPA</Link>
            <Link href="/logistics" style={navLink}>LOGISTYKA</Link>
            <Link href="/results" style={navLink}>WYNIKI</Link>
            
            <div style={{ display: "flex", alignItems: "center", gap: "15px", borderLeft: "1px solid #333", paddingLeft: "25px" }}>
              {userName && <span style={{ fontSize: "0.9rem", color: "#00d4ff", fontWeight: 900 }}>Cześć, {userName}!</span>}
              <Link href="/profile" style={{ 
                background: "#00d4ff", color: "#000", padding: "8px 18px", borderRadius: "5px", 
                textDecoration: "none", fontWeight: 900, fontSize: "0.8rem" 
              }}>PROFIL</Link>
            </div>
          </div>
        </nav>

        {/* GŁÓWNA TREŚĆ */}
        <div style={{ flex: 1, paddingTop: "100px" }}>{children}</div>

        {/* PRZYWRÓCONA STOPKA */}
        <footer style={{ padding: "40px", borderTop: "1px solid #222", textAlign: "center", fontSize: "0.8rem", color: "#666", background: "#050505" }}>
          © 2026 Kraków Airport Running Team | Designed for KART
        </footer>
      </body>
    </html>
  );
}

const navLink = { color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" };