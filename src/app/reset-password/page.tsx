"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // redirectTo musi wskazywać na nową stronę, którą zaraz stworzymy
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      alert("Błąd: " + error.message);
    } else {
      setMessage("Instrukcje resetowania hasła zostały wysłane na Twój e-mail. Sprawdź też SPAM!");
    }
    setLoading(false);
  };

  return (
    <main style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontWeight: 900, fontSize: "1.8rem", marginBottom: "10px" }}>Reset hasła</h1>
        <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "20px" }}>
          Wpisz swój e-mail, a wyślemy Ci link do ustawienia nowego hasła.
        </p>

        {message ? (
          <div style={{ color: "#00d4ff", fontWeight: 700, marginBottom: "20px" }}>{message}</div>
        ) : (
          <form onSubmit={handleReset} style={{ display: "grid", gap: "15px" }}>
            <input
              type="email"
              placeholder="Twój e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? "WYSYŁANIE..." : "WYŚLIJ LINK"}
            </button>
          </form>
        )}

        <div style={{ marginTop: "25px" }}>
          <Link href="/login" style={{ color: "#00d4ff", textDecoration: "none", fontSize: "0.8rem" }}>
            ← Powrót do logowania
          </Link>
        </div>
      </div>
    </main>
  );
}

const containerStyle: React.CSSProperties = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#000", padding: "20px" };
const cardStyle: React.CSSProperties = { background: "#111", padding: "40px", borderRadius: "25px", width: "100%", maxWidth: "400px", border: "1px solid #222", textAlign: "center", color: "#fff" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #333", background: "#000", color: "#fff", fontSize: "1rem", boxSizing: "border-box" };
const btnStyle: React.CSSProperties = { width: "100%", padding: "16px", background: "#fff", color: "#000", border: "none", borderRadius: "12px", fontWeight: 900, cursor: "pointer" };