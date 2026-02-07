"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Supabase po wejściu z linka resetu ustawia sesję recovery automatem.
    // Jeśli nie ma sesji, updateUser się nie powiedzie i pokaże błąd.
  }, []);

  async function setNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMsg("Błąd ustawiania hasła: " + error.message);
        return;
      }
      setMsg("Hasło ustawione ✅ Możesz się zalogować.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 520, margin: "50px auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <a href="/login">← Do logowania</a>

      <h1 style={{ marginTop: 14 }}>Ustaw nowe hasło</h1>
      <p style={{ color: "#555" }}>To działa tylko, jeśli wszedłeś tu z maila resetu.</p>

      <form onSubmit={setNewPassword} style={{ marginTop: 14, display: "grid", gap: 10, border: "1px solid #eee", borderRadius: 16, padding: 14 }}>
        <label>
          Nowe hasło
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={show ? "text" : "password"}
              required
              style={{ flex: 1, padding: 10 }}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd", cursor: "pointer" }}
            >
              {show ? "Ukryj" : "Pokaż"}
            </button>
          </div>
        </label>

        <button type="submit" disabled={busy} style={{ padding: 12, borderRadius: 12, fontWeight: 900, cursor: "pointer" }}>
          {busy ? "Ustawiam…" : "Ustaw hasło"}
        </button>

        {msg && <div style={{ color: msg.startsWith("Błąd") ? "crimson" : "green" }}>{msg}</div>}
      </form>
    </main>
  );
}
