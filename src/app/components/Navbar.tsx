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
      padding: "15px 20px", 
      background: "#000", 
      borderBottom: "1px solid #222", 
      position: "sticky", 
      top: 0, 
      zIndex: 9999,
      flexWrap: "wrap",
      gap: "10px"
    }}>
      <a href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 900, fontSize: "1.1rem" }}>
        KART <span style={{ color: "#00d4ff" }}>RUNNERS</span>
      </a>
      
      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <a href="/runners" style={navLink}>EKIPA</a>
        <a href="/logistics" style={navLink}>LOGISTYKA</a>
        <a href="/results" style={navLink}>RANKING</a>
        
        {user ? (
          <a href="/profile" style={{ ...navLink, color: "#00d4ff", border: "1px solid #00d4ff", padding: "4px 10px", borderRadius: "8px" }}>PROFIL</a>
        ) : (
          <a href="/login" style={{ ...navLink, background: "#fff", color: "#000", padding: "4px 10px", borderRadius: "8px" }}>ZALOGUJ</a>
        )}
      </div>
    </nav>
  );
}

const navLink = { 
  color: "#fff", 
  textDecoration: "none", 
  fontSize: "0.75rem", 
  fontWeight: "bold",
  textTransform: "uppercase" as const
};
