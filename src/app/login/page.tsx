"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";

type Mode = "magic" | "password";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("magic");

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Cooldown dla magic link (żeby nie wpaść w rate limit)
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const cooldownLeft = useMemo(() => {
    const ms = cooldownUntil - Date.now();
    return ms > 0 ? Math.ceil(ms / 1000) : 0;
  }, [cooldownUntil]);

  useEffect(() => {
    const t = setInterval(() => {
      // wymusza odświeżanie cooldownLeft
      if (cooldownUntil > 0) setCooldownUntil((x) => x);
    }, 500);
    return () => clearInterval(t);
  }, [cooldownUntil]);

  async function sendMagicLink() {
    setMsg(null);
    if (!email) {
      setMsg("Wpisz email.");
      return;
    }
    if (cooldownLeft > 0) {
      setMsg(`Poczekaj ${cooldownLeft}s i spróbuj ponownie.`);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // URL po kliknięciu linku w mailu
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
      },
    });

    setLoading(false);

    if (error) {
      setMsg(`Błąd: ${error.message}`);
      // jeśli limiter, to daj dłuższy cooldown, żebyś nie klikał w ścianę
      if (String(error.message).toLowerCase().includes("rate limit")) {
        setCooldownUntil(Date.now() + 60_000); // 60s
      }
      return;
    }

    // normalny cooldown żeby nie spamować
    setCooldownUntil(Date.now() + 20_000); // 20s
    setMsg("Wysłano link logowania. Sprawdź pocztę (i spam).");
  }

  async function signInPassword() {
    setMsg(null);
    if (!email || pass.length < 6) {
      setMsg("Wpisz email i hasło (min. 6 znaków).");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    setLoading(false);

    if (error) {
      setMsg(`Błąd: ${error.message}`);
      return;
    }

    window.location.href = "/";
  }

  async function signUpPassword() {
    setMsg(null);
    if (!email || pass.length < 6) {
      setMsg("Wpisz email i hasło (min. 6 znaków).");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
    });
    setLoading(false);

    if (error) {
      setMsg(`Błąd: ${error.message}`);
      return;
    }

    setMsg("Konto utworzone. Teraz kliknij „Zaloguj” (hasłem) albo użyj magic link.");
  }

  async function signOut() {
    setMsg(null);
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    window.location.href = "/";
  }

  return (
    <main style={{ maxWidth: 560, margin: "40px auto", padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Zaloguj się</h1>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <button
          onClick={() => setMode("magic")}
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            border: "1px solid #ddd",
            fontWeight: mode === "magic" ? 800 : 400,
          }}
        >
          Magic link
        </button>
        <button
          onClick={() => setMode("password")}
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            border: "1px solid #ddd",
            fontWeight: mode === "password" ? 800 : 400,
          }}
        >
          Hasło (do testów)
        </button>
        <a href="/" style={{ alignSelf: "center" }}>
          Wróć
        </a>
      </div>

      <label style={{ display: "grid", gap: 6, marginTop: 12 }}>
        Email
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="twoj@email.com"
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />
      </label>

      {mode === "password" && (
        <label style={{ display: "grid", gap: 6, marginTop: 12 }}>
          Hasło
          <input
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="min 6 znaków"
            type="password"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </label>
      )}

      {mode === "magic" ? (
        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          <button
            onClick={sendMagicLink}
            disabled={loading || !email || cooldownLeft > 0}
            style={{ padding: "10px 12px", borderRadius: 12 }}
          >
            {loading ? "Wysyłam…" : cooldownLeft > 0 ? `Poczekaj ${cooldownLeft}s` : "Wyślij link logowania"}
          </button>

          <p style={{ margin: 0, color: "#555" }}>
            Uwaga: Supabase ma limity maili. Jak klikasz jak szalony, dostajesz „rate limit exceeded”.
          </p>
        </div>
      ) : (
        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={signInPassword}
            disabled={loading || !email || pass.length < 6}
            style={{ padding: "10px 12px", borderRadius: 12 }}
          >
            {loading ? "…" : "Zaloguj"}
          </button>

          <button
            onClick={signUpPassword}
            disabled={loading || !email || pass.length < 6}
            style={{ padding: "10px 12px", borderRadius: 12 }}
          >
            {loading ? "…" : "Załóż konto"}
          </button>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <button onClick={signOut} disabled={loading} style={{ padding: "8px 10px", borderRadius: 10 }}>
          Wyloguj
        </button>
      </div>

      {msg && (
        <p style={{ marginTop: 12, color: msg.toLowerCase().startsWith("błąd") ? "crimson" : "green" }}>
          {msg}
        </p>
      )}
    </main>
  );
}
