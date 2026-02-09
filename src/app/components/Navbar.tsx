"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    // 1. Sprawdź sesję przy starcie
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    // 2. Słuchaj zmian w logowaniu
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setDisplayName("");
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(uid: string) {
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", uid)
      .single();
    if (data) setDisplayName(data.display_name);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 40px",
      background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
      position: "sticky",
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
        <a href="/" style={{ 
          fontSize: "1.5rem", 
          fontWeight: 900, 
          color: "#fff", 
          textDecoration: "none",
          letterSpacing: "-1px" 
        }}>
          KART <span style={{ color: "#00d4ff" }}>RUNNERS</span>
        </a>

        {user && (
          <div style={{ display: "flex", gap: 20 }}>
            <a href="/" style={linkStyle}>Wydarzenia</a>
            <a href="/profile" style={{ ...linkStyle, color: "#00ff00" }}>Mój Profil</a>
            <a href="/dashboard" style={linkStyle}>Panel Admina</a>
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {user ? (
          <>
            <span style={{ fontSize: "0.9rem", opacity: 0.7 }}>
              Cześć, <strong style={{ color: "#fff" }}>{displayName || user.email}</strong>
            </span>
            <button onClick={handleLogout} style={logoutBtnStyle}>Wyloguj</button>
          </>
        ) : (
          <a href="/login" style={loginBtnStyle}>Zaloguj się</a>
        )}
      </div>
    </nav>
  );
}

const linkStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.7)",
  textDecoration: "none",
  fontSize: "0.9rem",
  fontWeight: "bold",
  transition: "color 0.2s"
};

const loginBtnStyle: React.CSSProperties = {
  background: "#fff",
  color: "#000",
  padding: "8px 20px",
  borderRadius: "10px",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "0.9rem"
};

const logoutBtnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.1)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.2)",
  padding: "8px 15px",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "0.8rem"
};