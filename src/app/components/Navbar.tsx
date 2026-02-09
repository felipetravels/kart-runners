"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      padding: "15px 40px", 
      background: "#000", 
      borderBottom: "1px solid #222", 
      position: "sticky", 
      top: 0, 
      zIndex: 100 
    }}>
      <a href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 900, fontSize: "1.4rem", letterSpacing: "-1px" }}>
        KART <span style={{ color: "#00d4ff" }}>RUNNERS</span>
      </a>
      
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <a href="/" style={navItem}>Biegi</a>
        {user && <a href="/profile" style={{ ...navItem, color: "#00ff00" }}>Mój Profil</a>}
        {user && <a href="/dashboard" style={navItem}>+ Dodaj Bieg</a>}
        
        {user ? (
          <button onClick={() => supabase.auth.signOut().then(() => router.push("/login"))} style={btnLog}>
            Wyloguj
          </button>
        ) : (
          <a href="/login" style={btnLog}>Zaloguj</a>
        )}
      </div>
    </nav>
  );
}

const navItem = { color: "#fff", textDecoration: "none", fontSize: "0.85rem", fontWeight: "bold", opacity: 0.8 };
const btnLog = { background: "#fff", color: "#000", padding: "8px 16px", borderRadius: "10px", textDecoration: "none", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "0.85rem" };