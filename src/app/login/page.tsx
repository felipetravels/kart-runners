"use client";

import { supabase } from "@/lib/supabaseClient";
import { useMemo, useState } from "react";

type Mode = "login" | "signup" | "reset";

function validEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const emailOk = useMemo(() => validEmail(email), [email]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!emailOk) return setErr("Wpisz poprawny adres email.");
    if (password.length < 8) return setErr("Hasło musi mieć minimum 8 znaków.");

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) return setErr(error.message);

    setMsg("Zalogowano. Wróć na stronę główną.");
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!emailOk) return setErr("Wpisz poprawny adres email.");
    if (password.length < 8) return setErr("Hasło musi mieć minimum 8 znaków.");

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) return setErr(error.message);

    setMsg("Konto utworzone. Teraz możesz się zalogować.");
    setMode("login");
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!emailOk) return setErr("Wpisz poprawny adres email.");

    setLoading(true);
    const redirectTo = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setLoading(false);

    if (error) return setErr(error.message);

    setMsg("Wysłano maila do resetu hasła. Sprawdź skrzynkę i spam.");
  }

  return (
    <main style={{ padding: 0 }}>
      <section style={{ maxWidth: 520, margin: "0 auto" }}>
        <div
          style={{
            padding: 10,
            borderRadius: 12,
            border: "2px solid rgba(255,255,255,0.22)",
            marginBottom: 10,
            fontWeight: 900,
          }}
        >
          LOGIN v3
        </div>

        <h1 style={{ marginTop: 0 }}>
          {mode === "login"
            ? "Zaloguj się"
            : mode === "signup"
            ? "Załóż konto"
            : "Przypomnij hasło"}
        </h1>

        <p style={{ opacity: 0.85, marginTop: 6 }}>
          {mode === "login" && "Logowanie hasłem. Bez magic linków i bez limitów maili."}
          {mode === "signup" && "Zakładasz konto hasłem. Potem logujesz się hasłem."}
          {mode === "reset" && "Podaj email, a dostaniesz link do ustawienia nowego hasła."}
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErr(null);
              setMsg(null);
            }}
            style={{ fontWeight: mode === "login" ? 900 : 700 }}
          >
            Logowanie
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErr(null);
              setMsg(null);
            }}
            style={{ fontWeight: mode === "signup" ? 900 : 700 }}
          >
            Rejestracja
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("reset");
              setErr(null);
              setMsg(null);
            }}
            style={{ fontWeight: mode === "reset" ? 900 : 700 }}
          >
            Przypomnij hasło
          </button>
        </div>

        <form
          onSubmit={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleReset}
          style={{ display: "grid", gap: 12, marginTop: 16 }}
        >
          <label>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Email</div>
            <input
              type="email"
              placeholder="twoj@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          {mode !== "reset" && (
            <label>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Hasło</div>

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="minimum 8 znaków"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {showPw ? "Ukryj" : "Pokaż"}
                </button>
              </div>
            </label>
          )}

          <button disabled={loading} type="submit">
            {loading
              ? "Chwila…"
              : mode === "login"
              ? "Zaloguj"
              : mode === "signup"
              ? "Załóż konto"
              : "Wyślij link resetu"}
          </button>

          {msg && <div style={{ color: "var(--success)" }}>{msg}</div>}
          {err && <div style={{ color: "crimson" }}>{err}</div>}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
            <a href="/">Wróć na stronę</a>
            <a href="/dashboard">Profil</a>
          </div>
        </form>

        <hr style={{ margin: "18px 0", borderColor: "rgba(255,255,255,0.12)" }} />

        <button
          type="button"
          onClick={async () => {
            setErr(null);
            setMsg(null);
            setLoading(true);
            const { error } = await supabase.auth.signOut();
            setLoading(false);
            if (error) setErr(error.message);
            else setMsg("Wylogowano.");
          }}
        >
          Wyloguj
        </button>
      </section>
    </main>
  );
}
