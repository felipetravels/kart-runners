"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  // Dane profilu
  const [displayName, setDisplayName] = useState("");
  const [team, setTeam] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalKm: 0, raceCount: 0 });

  useEffect(() => {
    async function loadAll() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return router.push("/login");
      setUser(authUser);

      const { data: prof } = await supabase.from("profiles").select("*").eq("id", authUser.id).single();
      if (prof) {
        setDisplayName(prof.display_name || "");
        setTeam(prof.team || "");
      }

      const { data: res } = await supabase
        .from("race_results")
        .select(`finish_time_seconds, races(title, race_date), race_options(label, distance_km)`)
        .eq("user_id", authUser.id);

      if (res) {
        const casted = res as any[];
        setResults(casted);
        const total = casted.reduce((acc, curr) => acc + (curr.race_options?.distance_km || 0), 0);
        setStats({ totalKm: total, raceCount: casted.length });
      }
      setLoading(false);
    }
    loadAll();
  }, [router]);

  const handleUpdate = async () => {
    setLoading(true);
    await supabase.from("profiles").update({ display_name: displayName, team }).eq("id", user.id);
    setEditing(false);
    setLoading(false);
  };

  if (loading) return <div style={{ color: "#fff", padding: 50, textAlign: "center" }}>Synchronizacja...</div>;

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      <section style={{ background: "rgba(255,255,255,0.05)", padding: 40, borderRadius: 30, marginBottom: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div>
            {editing ? (
              <div style={{ display: "grid", gap: 10 }}>
                <input style={inputStyle} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Twoje imię" />
                <select style={inputStyle} value={team} onChange={e => setTeam(e.target.value)}>
                  <option value="KART">KART</option>
                  <option value="KART LIGHT">KART LIGHT</option>
                </select>
                <button onClick={handleUpdate} style={btnSaveStyle}>ZAPISZ ZMIANY</button>
              </div>
            ) : (
              <>
                <h1 style={{ fontSize: "3rem", margin: 0, fontWeight: 900 }}>{displayName || "Zawodnik"}</h1>
                <p style={{ fontSize: "1.2rem", color: "#00d4ff" }}>Team: {team || "Nieprzypisany"}</p>
                <button onClick={() => setEditing(true)} style={btnEditStyle}>Edytuj profil</button>
              </>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "4rem", fontWeight: 900, color: "#fff" }}>{stats.totalKm.toFixed(1)}<span style={{ fontSize: "1.5rem" }}>KM</span></div>
            <p style={{ opacity: 0.5 }}>{stats.raceCount} ukończonych biegów</p>
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: 20 }}>Historia Twoich Startów</h2>
        <div style={{ display: "grid", gap: 15 }}>
          {results.map((r, i) => (
            <div key={i} style={rowStyle}>
              <span><strong>{r.races?.title}</strong> ({r.race_options?.label})</span>
              <span style={{ color: "#00ff00", fontWeight: "bold" }}>
                {Math.floor(r.finish_time_seconds / 60)}:{(r.finish_time_seconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

const inputStyle = { background: "#000", border: "1px solid #333", color: "#fff", padding: "10px", borderRadius: "10px" };
const btnSaveStyle = { background: "#00ff00", color: "#000", border: "none", padding: "10px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" };
const btnEditStyle = { background: "none", border: "1px solid #444", color: "#888", padding: "5px 15px", borderRadius: "8px", marginTop: 10, cursor: "pointer" };
const rowStyle = { background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 15, display: "flex", justifyContent: "space-between" };