"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup" | "magic" | "reset">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) window.location.href = "/";
    })();
  }, []);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setMsg("Błąd logowania: " + error.message);
        return;
      }
      window.location.href = "/";
    } finally {
      setBusy(false);
    }
  }

  async function doSignup(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) {
        setMsg("Błąd rejestracji: " + error.message);
        return;
      }

      setMsg(
        "Konto utworzone ✅ Jeśli w Supabase masz włączone potwierdzanie maila, sprawdź Spam/Oferty. Na dev najprościej wyłączyć email confirmations."
      );
      setMode("login");
    } finally {
      setBusy(false);
    }
  }

  async function doMagic(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: "http://localhost:3000/" },
      });
      if (error) {
        setMsg("Błąd magic link: " + error.message);
        return;
      }
      setMsg("Link wysłany ✅ Sprawdź maila (i Spam).");
    } finally {
      setBusy(false);
    }
  }

  async function doReset(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: "http://localhost:3000/reset-password",
      });
      if (error) {
        setMsg("Błąd resetu hasła: " + error.message);
        return;
      }
      setMsg("Mail do resetu wysłany ✅ Sprawdź skrzynkę i Spam.");
    } finally {
      setBusy(false);
    }
  }

  const onSubmit =
    mode === "login" ? doLogin : mode === "signup" ? doSignup : mode === "magic" ? doMagic : doReset;

  return (
    <main style={{ maxWidth: 520, margin: "50px auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <a href="/">← Powrót</a>

      <h1 style={{ marginTop: 14 }}>Logowanie</h1>
      <p style={{ color: "#555" }}>Hasło, magic link i reset. Cywilizacja, ale bez przesady.</p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        {(["login", "signup", "magic", "reset"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setMsg(null);
            }}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: mode === m ? "#111" : "white",
              color: mode === m ? "white" : "#111",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {m === "login" ? "Login" : m === "signup" ? "Rejestracja" : m === "magic" ? "Magic link" : "Reset hasła"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} style={{ marginTop: 14, display: "grid", gap: 10, border: "1px solid #eee", borderRadius: 16, padding: 14 }}>
        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            style={{ width: "100%", padding: 10, marginTop: 6 }}
            placeholder="twoj@mail.com"
          />
        </label>

        {mode !== "magic" && mode !== "reset" && (
          <label>
            Hasło
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                style={{ flex: 1, padding: 10 }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd", cursor: "pointer" }}
              >
                {showPassword ? "Ukryj" : "Pokaż"}
              </button>
            </div>
          </label>
        )}

        <button type="submit" disabled={busy} style={{ padding: 12, borderRadius: 12, fontWeight: 900, cursor: "pointer" }}>
          {busy
            ? "Chwila…"
            : mode === "login"
              ? "Zaloguj"
              : mode === "signup"
                ? "Utwórz konto"
                : mode === "magic"
                  ? "Wyślij link"
                  : "Wyślij reset"}
        </button>

        {mode === "login" && (
          <button
            type="button"
            onClick={() => {
              setMode("reset");
              setMsg(null);
            }}
            style={{ padding: 10, borderRadius: 12, border: "1px solid #ddd", cursor: "pointer", background: "white" }}
          >
            Nie pamiętam hasła
          </button>
        )}

        {msg && <div style={{ color: msg.startsWith("Błąd") ? "crimson" : "green" }}>{msg}</div>}
      </form>

      <div style={{ marginTop: 12, color: "#666", fontSize: 13, lineHeight: 1.4 }}>
        Jeśli maile nie dochodzą: na dev wyłącz “email confirmations”, a docelowo ustaw SMTP w Supabase.
      </div>
    </main>
  );
}
