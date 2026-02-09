"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav style={{ display: "flex", justifyContent: "space-between", padding: "20px 40px", background: "#000", borderBottom: "1px solid #222", position: "sticky", top: 0, zIndex: 100 }}>
      <a href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 900, fontSize: "1.2rem" }}>KART RUNNERS</a>
      <div style={{ display: "flex", gap: 25, alignItems: "center" }}>
        <a href="/" style={navItem}>Wydarzenia</a>
        {user && <a href="/profile" style={{ ...navItem, color: "#00ff00" }}>Mój Profil</a>}
        {user && <a href="/dashboard" style={navItem}>Dodaj Bieg</a>}
        {user ? (
          <button onClick={() => supabase.auth.signOut().then(() => router.push("/login"))} style={btnLog}>Wyloguj</button>
        ) : (
          <a href="/login" style={btnLog}>Zaloguj</a>
        )}
      </div>
    </nav>
  );
}
const navItem = { color: "#fff", textDecoration: "none", fontSize: "0.9rem", fontWeight: "bold" };
const btnLog = { background: "#fff", color: "#000", padding: "8px 15px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", border: "none", cursor: "pointer" };