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
    <nav style={{ display: "flex", justifyContent: "space-between", padding: "15px 20px", background: "#000", borderBottom: "1px solid #222", position: "sticky", top: 0, zIndex: 100 }}>
      <a href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 900 }}>KART RUNNERS</a>
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <a href="/runners" style={{ color: "#fff", textDecoration: "none", fontSize: "0.8rem", fontWeight: "bold" }}>EKIPA</a>
        <a href="/logistics" style={{ color: "#fff", textDecoration: "none", fontSize: "0.8rem" }}>LOGISTYKA</a>
        {user ? (
          <a href="/profile" style={{ color: "#00d4ff", textDecoration: "none", fontSize: "0.8rem" }}>PROFIL</a>
        ) : (
          <a href="/login" style={{ color: "#fff", textDecoration: "none", fontSize: "0.8rem" }}>ZALOGUJ</a>
        )}
      </div>
    </nav>
  );
}
