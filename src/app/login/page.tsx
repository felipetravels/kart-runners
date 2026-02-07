"use client";

import { supabase } from "@/lib/supabaseClient";
import { useMemo, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const redirectTo = useMemo(() => {
    // działa na Vercel i lokalnie
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/dashboard`;
  }, []);

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSent(false);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setMsg(`Błąd: ${error.message}`);
      return;
    }
    setSent(true);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setMsg("Wylogowano.");
  }

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1>Zaloguj się</h1>

      <p style={{ color: "#555" }}>
        Wpisz maila, dostaniesz link logowania. Tak, to jest prostsze niż hasła, które ludzie i tak zapisują w notatkach.
      </p>

      <form onSubmit={signInWithEmail} style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="twoj@email.com"
            style={{ width: "100%", padding: 12, marginTop: 6 }}
            required
          />
        </label>

        <button type="submit" style={{ padding: 12, width: "100%", borderRadius: 12 }}>
          Wyślij link logowania
        </button>

        {sent && <p style={{ margin: 0, color: "green" }}>Link wysłany. Sprawdź skrzynkę (i spam).</p>}
        {msg && <p style={{ margin: 0, color: msg.startsWith("Błąd") ? "crimson" : "#333" }}>{msg}</p>}
      </form>

      <hr style={{ margin: "24px 0" }} />

      <div style={{ display: "flex", gap: 10 }}>
        <a href="/" style={{ padding: 10, border: "1px solid #ddd", borderRadius: 12, textDecoration: "none" }}>
          Wróć na stronę
        </a>
        <button onClick={signOut} style={{ padding: 10, borderRadius: 12 }}>
          Wyloguj
        </button>
      </div>
      <p style={{ marginTop: 18, fontSize: 12, color: "#999" }}>
  build: 2026-02-07 v2
</p>

    </main>
  );
}
