"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [team, setTeam] = useState("KART");
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, team")
      .eq("id", session.user.id)
      .single();

    if (data) {
      setUser(session.user);
      setDisplayName(data.display_name || "");
      setTeam(data.team || "KART");
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        team: team,
      })
      .eq("id", user.id);

    if (error) {
      alert("Błąd zapisu: " + error.message);
    } else {
      alert("Profil zaktualizowany!");
    }
    setSaving(false);
  }

  if (loading) return <div style={containerStyle}>Ładowanie profilu...</div>;

  return (
    <main style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontWeight: 900, fontSize: "2rem", marginBottom: "10px" }}>Twój Profil</h1>
        <p style={{ opacity: 0.5, marginBottom: "30px" }}>Zarządzaj swoimi danymi biegacza</p>

        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Imię / Nick</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={inputStyle}
            placeholder="Jak mamy Cię wyświetlać?"
          />
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label style={labelStyle}>Wybierz Drużynę</label>
          <div style={{ display: "flex", gap: "10px" }}>
            {["KART", "KART light"].map((t) => (
              <button
                key={t}
                onClick={() => setTeam(t)}
                style={{
                  ...teamBtnStyle,
                  border: team === t ? "2px solid #00d4ff" : "1px solid #333",
                  background: team === t ? "rgba(0, 212, 255, 0.1)" : "transparent",
                  color: team === t ? "#00d4ff" : "#fff",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving} 
          style={{
            ...saveBtnStyle,
            opacity: saving ? 0.5 : 1,
            cursor: saving ? "not-allowed" : "pointer"
          }}
        >
          {saving ? "Zapisywanie..." : "ZAPISZ ZMIANY"}
        </button>
      </div>
    </main>
  );
}

// STYLE
const containerStyle: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "40px 20px",
  color: "#fff",
  minHeight: "80vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center"
};

const cardStyle: React.CSSProperties = {
  background: "#111",
  padding: "40px",
  borderRadius: "30px",
  border: "1px solid #222",
  boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontSize: "0.8rem",
  textTransform: "uppercase",
  letterSpacing: "1px",
  opacity: 0.6
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "15px",
  background: "#000",
  border: "1px solid #333",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "1rem",
  outline: "none"
};

const teamBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: "12px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "0.9rem",
  transition: "all 0.2s ease"
};

const saveBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "18px",
  background: "#fff",
  color: "#000",
  border: "none",
  borderRadius: "15px",
  fontWeight: "900",
  fontSize: "1rem",
  letterSpacing: "1px"
};