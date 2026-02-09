"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [team, setTeam] = useState("KART"); // Domyślny wybór
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // Rejestracja z metadanymi, które Twój Trigger w SQL wyłapie
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            team: team, 
          },
        },
      });
      if (error) alert("Błąd rejestracji: " + error.message);
      else alert("Konto stworzone! Sprawdź email (również SPAM), aby potwierdzić link aktywacyjny.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Błąd logowania: " + error.message);
      else router.push("/");
    }
    setLoading(false);
  };

  return (
    <main style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontWeight: 900, fontSize: "1.8rem", marginBottom: "10px" }}>
          {isSignUp ? "Dołącz do KART" : "Witaj w KART"}
        </h1>
        
        <form onSubmit={handleAuth} style={{ display: "grid", gap: "15px", marginTop: "20px" }}>
          {isSignUp && (
            <>
              <input
                type="text"
                placeholder="Imię / Nick"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={inputStyle}
                required
              />
              <div style={{ textAlign: "left" }}>
                <label style={{ fontSize: "0.7rem", opacity: 0.5, marginBottom: "5px", display: "block" }}>DRUŻYNA:</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  {["KART", "KART light"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTeam(t)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        fontSize: "0.8rem",
                        borderRadius: "10px",
                        border: team === t ? "2px solid #00d4ff" : "1px solid #333",
                        background: team === t ? "rgba(0,212,255,0.1)" : "transparent",
                        color: team === t ? "#00d4ff" : "#fff",
                        cursor: "pointer"
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "PROSZĘ CZEKAĆ..." : isSignUp ? "ZAŁÓŻ KONTO" : "ZALOGUJ SIĘ"}
          </button>
        </form>

        <button 
          onClick={() => setIsSignUp(!isSignUp)} 
          style={{ background: "none", border: "none", color: "#00d4ff", marginTop: "25px", cursor: "pointer", fontSize: "0.8rem" }}
        >
          {isSignUp ? "Masz już konto? Zaloguj się" : "Nie masz konta? Zarejestruj się"}
        </button>
      </div>
    </main>
  );
}

const containerStyle: React.CSSProperties = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#000", padding: "20px" };
const cardStyle: React.CSSProperties = { background: "#111", padding: "30px", borderRadius: "25px", width: "100%", maxWidth: "380px", border: "1px solid #222", textAlign: "center", color: "#fff" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #333", background: "#000", color: "#fff", fontSize: "1rem" };
const btnStyle: React.CSSProperties = { width: "100%", padding: "16px", background: "#fff", color: "#000", border: "none", borderRadius: "12px", fontWeight: "900", cursor: "pointer", marginTop: "10px" };