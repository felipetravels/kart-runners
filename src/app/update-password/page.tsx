"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      alert("Błąd: " + error.message);
    } else {
      alert("Hasło zostało pomyślnie zmienione! Możesz się teraz zalogować.");
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <main style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontWeight: 900, fontSize: "1.8rem", marginBottom: "10px" }}>Nowe hasło</h1>
        <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "20px" }}>Wpisz swoje nowe hasło poniżej.</p>

        <form onSubmit={handleUpdate} style={{ display: "grid", gap: "15px" }}>
          <input
            type="password"
            placeholder="Nowe hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
            minLength={6}
          />
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "ZAPISYWANIE..." : "USTAW NOWE HASŁO"}
          </button>
        </form>
      </div>
    </main>
  );
}

const containerStyle: React.CSSProperties = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#000", padding: "20px" };
const cardStyle: React.CSSProperties = { background: "#111", padding: "40px", borderRadius: "25px", width: "100%", maxWidth: "400px", border: "1px solid #222", textAlign: "center", color: "#fff" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #333", background: "#000", color: "#fff", fontSize: "1rem", boxSizing: "border-box" };
const btnStyle: React.CSSProperties = { width: "100%", padding: "16px", background: "#fff", color: "#000", border: "none", borderRadius: "12px", fontWeight: 900, cursor: "pointer" };