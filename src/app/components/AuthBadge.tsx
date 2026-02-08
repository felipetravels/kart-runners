"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function AuthBadge() {
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
        setName(data?.display_name || user.email?.split("@")[0]);
      }
      setLoading(false);
    }
    getProfile();

    const { data: sub } = supabase.auth.onAuthStateChange(() => getProfile());
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return null;
  if (!name) return <a href="/login" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>Logowanie</a>;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
      <span style={{ fontWeight: 800 }}>Cześć, {name}</span>
      <button onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}
              style={{ background: "none", border: "1px solid #444", color: "white", padding: "5px 10px", borderRadius: 8, cursor: "pointer" }}>
        Wyloguj
      </button>
    </div>
  );
}