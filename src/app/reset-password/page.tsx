"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (pw.length < 8) return setErr("Hasło musi mieć minimum 8 znaków.");
    if (pw !== pw2) return setErr("Hasła nie są takie same.");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);

    if (error) return setErr(error.message);

    setMsg("Hasło ustawione. Możesz się zalogować.");
  }

  return (
    <main style={{ padding: 0 }}>
      <section style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>Ustaw nowe hasło</h1>
        <p style={{ opacity: 0.85 }}>
          Ten ekran działa po kliknięciu linku resetu z maila.
        </p>

        <form onSubmit={save} style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <label>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Nowe hasło</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type={show ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="minimum 8 znaków"
              />
              <button type="button" onClick={() => setShow((v) => !v)}>
                {show ? "Ukryj" : "Pokaż"}
              </button>
            </div>
          </label>

          <label>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Powtórz hasło</div>
            <input
              type={show ? "text" : "password"}
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              placeholder="powtórz"
            />
          </label>

          <button disabled={loading} type="submit">
            {loading ? "Zapisuję…" : "Zapisz hasło"}
          </button>

          {msg && <div style={{ color: "var(--success)" }}>{msg}</div>}
          {err && <div style={{ color: "crimson" }}>{err}</div>}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/login">Wróć do logowania</a>
            <a href="/">Strona główna</a>
          </div>
        </form>
      </section>
    </main>
  );
}
