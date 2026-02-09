"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      padding: "15px 20px", 
      background: "#000", 
      borderBottom: "1px solid #222", 
      position: "sticky", 
      top: 0, 
      zIndex: 1000 
    }}>
      <a href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
        {/* Poprawiona nazwa pliku na logo-kart.png */}
        <img 
          src="/logo-kart.png" 
          alt="KART Logo" 
          style={{ height: "45px", width: "auto", objectFit: "contain" }} 
          onError={(e) => e.currentTarget.style.display = 'none'}
        />
        <span style={{ color: "#fff", fontWeight: 900, fontSize: "1.2rem", letterSpacing: "1px" }}>
          KART <span style={{ color: "#00d4ff" }}>RUNNERS</span>
        </span>
      </a>
      
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <a href="/runners" style={linkStyle}>EKIPA</a>
        <a href="/logistics" style={linkStyle}>LOGISTYKA</a>
        <a href="/results" style={linkStyle}>RANKING</a>
        {user ? (
          <a href="/profile" style={{ ...linkStyle, color: "#00d4ff", border: "1px solid #00d4ff", padding: "6px 14px", borderRadius: "10px" }}>PROFIL</a>
        ) : (
          <a href="/login" style={{ ...linkStyle, background: "#fff", color: "#000", padding: "6px 14px", borderRadius: "10px" }}>ZALOGUJ</a>
        )}
      </div>
    </nav>
  );
}
const linkStyle = { color: "#fff", textDecoration: "none", fontSize: "0.75rem", fontWeight: "bold" as const, letterSpacing: "1px" };
