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
      padding: "20px", 
      background: "#050505", 
      borderBottom: "1px solid #222", 
      position: "sticky", 
      top: 0, 
      zIndex: 1000 
    }}>
      <a href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 900, fontSize: "1.2rem" }}>
        KART <span style={{ color: "#00d4ff" }}>RUNNERS</span>
      </a>
      
      <div style={{ display: "flex", gap: "20px" }}>
        <a href="/runners" style={linkStyle}>EKIPA</a>
        <a href="/logistics" style={linkStyle}>LOGISTYKA</a>
        <a href="/results" style={linkStyle}>RANKING</a>
        {user ? (
          <a href="/profile" style={{ ...linkStyle, color: "#00d4ff" }}>PROFIL</a>
        ) : (
          <a href="/login" style={linkStyle}>ZALOGUJ</a>
        )}
      </div>
    </nav>
  );
}

const linkStyle = { 
  color: "#fff", 
  textDecoration: "none", 
  fontSize: "0.8rem", 
  fontWeight: "bold" as const,
  letterSpacing: "1px"
};
