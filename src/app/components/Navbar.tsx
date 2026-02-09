"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
  }, []);

  return (
    <nav style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      padding: "25px 40px", 
      background: "rgba(0,0,0,0.95)", 
      borderBottom: "1px solid #333", 
      position: "sticky", 
      top: 0, 
      zIndex: 1000 
    }}>
      <a href="/" style={{ display: "flex", alignItems: "center", gap: "15px", textDecoration: "none" }}>
        <img src="/logo-kart.png" alt="KART" style={{ height: "70px", width: "auto" }} />
      </a>
      
      <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
        <a href="/runners" style={l}>EKIPA</a>
        <a href="/logistics" style={l}>LOGISTYKA</a>
        <a href="/results" style={l}>RANKING</a>
        {user ? (
          <a href="/profile" style={btn}>PROFIL</a>
        ) : (
          <a href="/login" style={{...btn, background: "#fff", color: "#000"}}>LOGIN</a>
        )}
      </div>
    </nav>
  );
}
const l = { color: "#fff", textDecoration: "none", fontSize: "0.85rem", fontWeight: "bold", letterSpacing: "1px" };
const btn = { color: "#00d4ff", border: "2px solid #00d4ff", padding: "8px 20px", borderRadius: "12px", textDecoration: "none", fontWeight: "bold", fontSize: "0.8rem" };
