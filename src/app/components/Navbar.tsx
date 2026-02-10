"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
  }, []);

  // TWOJA SUPERMOC
  const isAdmin = user?.email === "filip.cialowicz@gmail.com";

  return (
    <nav style={{ 
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "30px 50px", background: "rgba(0,0,0,0.9)", backdropFilter: "blur(10px)",
      borderBottom: "1px solid #333", position: "sticky", top: 0, zIndex: 1000 
    }}>
      <a href="/" style={{ display: "flex", alignItems: "center", gap: "25px", textDecoration: "none" }}>
        <img src="/logo-kart.png" alt="KART" style={{ height: "125px", width: "auto" }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: "2.2rem", lineHeight: 1 }}>KART</span>
            <span style={{ color: "#00d4ff", fontWeight: 900, fontSize: "1.5rem", lineHeight: 1 }}>RUNNERS</span>
        </div>
      </a>
      
      <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
        <a href="/runners" style={l}>EKIPA</a>
        <a href="/logistics" style={l}>LOGISTYKA</a>
        <a href="/results" style={l}>RANKING</a>
        
        {/* WIDOCZNE TYLKO DLA CIEBIE */}
        {isAdmin && (
          <a href="/admin" style={{ ...l, color: "#ffaa00", border: "1px solid #ffaa00", padding: "5px 10px", borderRadius: "8px" }}>⚙️ ADMIN</a>
        )}

        {user ? (
          <a href="/profile" style={btn}>PROFIL</a>
        ) : (
          <a href="/login" style={{...btn, background: "#fff", color: "#000"}}>ZALOGUJ</a>
        )}
      </div>
    </nav>
  );
}
const l = { color: "#fff", textDecoration: "none", fontSize: "1rem", fontWeight: 900, letterSpacing: "1px" };
const btn = { color: "#00d4ff", border: "2px solid #00d4ff", padding: "10px 25px", borderRadius: "12px", textDecoration: "none", fontWeight: 900, fontSize: "0.9rem" };
