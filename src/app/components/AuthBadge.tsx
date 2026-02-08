"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function AuthBadge() {
  const [data, setData] = useState<{ email?: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();
        
        setData({ 
          email: user.email, 
          name: profile?.display_name 
        });
      } else {
        setData(null);
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  if (loading) return <span style={{ color: "#00d4ff" }}>Ładowanie...</span>;

  if (!data) {
    return (
      <a href="/login" style={{ 
        background: "#00d4ff", color: "#000", padding: "12px 25px", 
        borderRadius: "10px", fontWeight: "900", textDecoration: "none" 
      }}>
        ZALOGUJ SIĘ
      </a>
    );
  }

  return (
    <div style={{ textAlign: "right", minWidth: "150px" }}>
      <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>Cześć,</div>
      <div style={{ fontWeight: "900", fontSize: "1.2rem", color: "#fff" }}>
        {data.name || data.email?.split('@')[0] || "Biegaczu"}
      </div>
      <button 
        onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}
        style={{ background: "none", border: "none", color: "#ff4444", cursor: "pointer", padding: "5px 0", fontWeight: "bold", fontSize: "0.8rem" }}
      >
        Wyloguj się
      </button>
    </div>
  );
}