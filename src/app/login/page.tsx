"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "err" | "ok" } | null>(null);

  // Pola formularza
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [team, setTeam] = useState("KART");
  
  // Stan pokazywania hasła
  const [showPassword, setShowPassword] = useState(false);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMsg({ text: `Błąd: ${error.message}`, type: "err" });
      } else if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([{ id: data.user.id, display_name: displayName, team: team }]);

        if (profileError) {
          setMsg({ text: `Konto OK, ale błąd profilu: ${profileError.message}`, type: "err" });
        } else {
          setMsg({ text: "Konto utworzone! Możesz się zalogować.", type: "ok" });
          setIsSignUp(false);
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMsg({ text: `Błąd: ${error.message}`, type: "err" });
      } else {
        router.push("/");
        router.refresh();
      }
    }
    setLoading(false);
  }

  // Funkcja Resetu Hasła
  async function handleResetPassword() {
    if (!email) {
      setMsg({ text: "Wpisz swój email, aby zresetować hasło.", type: "err" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) setMsg({ text: error.message, type: "err" });
    else setMsg({ text: "Link do resetu wysłany na email!", type: "ok" });
  }

  return (
    <main style={{ maxWidth: 450, margin: "40px auto", padding: 30, background: "rgba(255,255,255,0.05)", borderRadius: 20, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
      <h1 style={{ textAlign: "center", marginBottom: 30 }}>{isSignUp ? "Dołącz do Teamu" : "Logowanie"}</h1>
      
      <form onSubmit={handleAuth} style={{ display: "grid", gap: 20 }}>
        {isSignUp && (
          <>
            <label style={labelStyle}>
              Imię i Nazwisko
              <input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="np. Filip" style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Drużyna
              <select value={team} onChange={(e) => setTeam(e.target.value)} style={inputStyle}>
                <option value="KART">KART (Kraków Airport Running Team)</option>
                <option value="KART LIGHT">KART LIGHT</option>
              </select>
            </label>
          </>
        )}

        <label style={labelStyle}>
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="twoj@email.com" />
        </label>

        <label style={labelStyle}>
          Hasło
          <div style={{ position: "relative" }}>
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={inputStyle} 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "0.8rem" }}
            >
              {showPassword ? "UKRYJ" : "POKAŻ"}
            </button>
          </div>
        </label>

        {!isSignUp && (
          <button 
            type="button" 
            onClick={handleResetPassword}
            style={{ textAlign: "right", background: "none", border: "none", color: "#888", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}
          >
            Zapomniałem hasła
          </button>
        )}

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "PROSZĘ CZEKAĆ..." : isSignUp ? "ZAREJESTRUJ SIĘ" : "ZALOGUJ SIĘ"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: 25, borderTop: "1px solid #333", paddingTop: 20 }}>
        <button 
          onClick={() => setIsSignUp(!isSignUp)} 
          style={{ background: "none", border: "none", color: "#00d4ff", cursor: "pointer", fontWeight: "bold" }}
        >
          {isSignUp ? "Masz już konto? Zaloguj się" : "Nie masz konta? Zarejestruj się"}
        </button>
      </div>

      {msg && (
        <div style={{ 
          marginTop: 20, padding: 10, borderRadius: 8, textAlign: "center",
          background: msg.type === "err" ? "rgba(255, 0, 0, 0.1)" : "rgba(0, 255, 0, 0.1)",
          color: msg.type === "err" ? "#ff4444" : "#00ff00",
          border: `1px solid ${msg.type === "err" ? "#ff4444" : "#00ff00"}`
        }}>
          {msg.text}
        </div>
      )}
    </main>
  );
}

const labelStyle = { display: "flex", flexDirection: "column", gap: 8, fontWeight: "bold", fontSize: "0.9rem" };
const inputStyle = { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #444", background: "#111", color: "#fff", boxSizing: "border-box" };
const buttonStyle = { padding: "15px", borderRadius: "10px", border: "none", background: "#00d4ff", color: "#000", fontWeight: "900", cursor: "pointer", letterSpacing: "1px" };