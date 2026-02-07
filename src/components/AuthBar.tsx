"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type Profile = {
  display_name: string | null;
};

export default function AuthBar() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    const user = data.user ?? null;

    setUserEmail(user?.email ?? null);

    if (user?.id) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

      setDisplayName((prof as Profile | null)?.display_name ?? null);
    } else {
      setDisplayName(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "center", color: "#666" }}>
        Ładowanie…
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <a href="/login">Zaloguj się</a>
      </div>
    );
  }

  const name = displayName || userEmail;

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ fontWeight: 700 }}>Cześć, {name}</div>
      <a href="/dashboard">Dodaj bieg</a>
      <button onClick={signOut} style={{ padding: "8px 10px", borderRadius: 10 }}>
        Wyloguj
      </button>
    </div>
  );
}
