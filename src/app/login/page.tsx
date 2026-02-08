"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false); // Przełącznik logowanie/rejestracja
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Pola formularza
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [team, setTeam] = useState("KART"); // Domyślnie KART

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    if (isSignUp) {
      // --- REJESTRACJA ---
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMsg(`Błąd: ${error.message}`);
      } else if (data.user) {
        // TUTAJ: Dodajemy dodatkowe dane do tabeli profiles
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            { 
              id: data.user.id, 
              display_name: displayName, 
              team: team 
            }
          ]);

        if (profileError) {
          setMsg(`Konto utworzone, ale błąd profilu: ${profileError.message}`);
        } else {
          setMsg("Konto utworzone! Możesz się zalogować.");
          setIsSignUp(false);
        }
      }
    } else {
      // --- LOGOWANIE ---
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMsg(`Błąd: ${error.message}`);
      } else {
        router.push("/");
        router.refresh();
      }
    }
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 400, margin: "40px auto", padding: 20, background: "rgba(255,255,255,0.05)", borderRadius: 20 }}>
      <h1>{isSignUp ? "Dołącz do KART" : "Logowanie"}</h1>
      
      <form onSubmit={handleAuth} style={{ display: "grid", gap: 15 }}>
        {isSignUp && (
          <>
            <label>
              Imię i Nazwisko
              <input 
                required 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                placeholder="np. Jan Kowalski"
                style={inputStyle}
              />
            </label>
            <label>
              Drużyna
              <select 
                value={team} 
                onChange={(e) => setTeam(e.target.value)} 
                style={inputStyle}
              >
                <option value="KART">KART (Kraków Airport Running Team)</option>
                <option value="KART LIGHT">KART LIGHT</option>
              </select>
            </label>
          </>
        )}

        <label>
          Email
          <input 
            type="email" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={inputStyle} 
          />
        </label>

        <label>
          Hasło
          <input 
            type="password" 
            required 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={inputStyle} 
          />
        </label>

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Chwileczkę..." : isSignUp ? "Zarejestruj się" : "Zaloguj"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 20 }}>
        <button 
          onClick={() => setIsSignUp(!isSignUp)} 
          style={{ background: "none", border: "none", color: "#00d4ff", cursor: "pointer", textDecoration: "underline" }}
        >
          {isSignUp ? "Masz już konto? Zaloguj się" : "Nie masz konta? Zarejestruj się"}
        </button>
      </p>

      {msg && <p style={{ textAlign: "center", color: msg.includes("Błąd") ? "crimson" : "#00ff00" }}>{msg}</p>}
    </main>
  );
}

// Proste style
const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  borderRadius: "8px",
  border: "1px solid #444",
  background: "#222",
  color: "#fff"
};

const buttonStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  background: "#fff",
  color: "#000",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "10px"
};