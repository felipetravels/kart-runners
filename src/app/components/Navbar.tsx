"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Sprawdzenie sesji przy załadowaniu
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Słuchanie zmian w sesji (logowanie/wylogowanie)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

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
      {/* LOGO I TYTUŁ */}
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 15, textDecoration: "none" }}>
        <img 
          src="/logo.png?v=1.2" 
          alt="KART Logo" 
          style={{ height: "40px", width: "auto" }} 
          onError={(e) => (e.currentTarget.style.display = 'none')} 
        />
        <span style={{ color: "#fff", fontWeight: 900, fontSize: "1.4rem", letterSpacing: "-1px" }}>
          KART <span style={{ color: "#00d4ff" }}>RUNNERS</span>
        </span>
      </a>
      
      {/* LINKI NAWIGACYJNE */}
      <div style={{ display: "flex", gap: 25, alignItems: "center" }}>
        <a href="/" style={navItem}>Biegi</a>
        
        {user && (
          <>
            <a href="/profile" style={{ ...navItem, color: "#00ff00" }}>Mój Profil</a>
            
            {/* PANEL ADMINA - widoczny dla zalogowanych */}
            <div style={{ display: "flex", gap: 15, padding: "0 15px", borderLeft: "1px solid #333" }}>
              <a href="/admin/races" style={{ ...navItem, color: "#ff4444" }}>Zarządzaj Biegami</a>
              <a href="/admin/results" style={{ ...navItem, opacity: 0.6 }}>Wyniki</a>
            </div>
            
            <a href="/dashboard" style={navItem}>+ Dodaj</a>
          </>
        )}
        
        {user ? (
          <button onClick={handleLogout} style={btnLog}>
            Wyloguj
          </button>
        ) : (
          <a href="/login" style={btnLog}>Zaloguj</a>
        )}
      </div>
    </nav>
  );
}

const navItem: React.CSSProperties = { 
  color: "#fff", 
  textDecoration: "none", 
  fontSize: "0.85rem", 
  fontWeight: "bold", 
  opacity: 0.8,
  transition: "0.2s"
};

const btnLog: React.CSSProperties = { 
  background: "#fff", 
  color: "#000", 
  padding: "8px 18px", 
  borderRadius: "10px", 
  textDecoration: "none", 
  fontWeight: "900", 
  border: "none", 
  cursor: "pointer", 
  fontSize: "0.85rem" 
};