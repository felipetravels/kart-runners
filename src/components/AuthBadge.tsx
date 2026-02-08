"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function AuthBadge() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setEmail(data.user?.email ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <a className="nav-link" href="/login">Logowanie</a>;
  }

  if (!email) {
    return <a className="nav-link" href="/login">Logowanie</a>;
  }

  return (
    <div style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
      <span style={{ fontWeight: 900, opacity: 0.95 }}>Cześć, {email}</span>
      <button
        type="button"
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/";
        }}
      >
        Wyloguj
      </button>
    </div>
  );
}
