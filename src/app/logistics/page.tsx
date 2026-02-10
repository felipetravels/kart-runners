"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LogisticsPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [races, setRaces] = useState<any[]>([]);
  const [participation, setParticipation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const [r, p, part] = await Promise.all([
        supabase.from("races").select("*").order("race_date", { ascending: true }),
        supabase.from("profiles").select("*").order("display_name"),
        supabase.from("participation").select("*")
      ]);
      setRaces(r.data || []);
      setProfiles(p.data || []);
      setParticipation(part.data || []);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const now = new Date().toISOString().split("T")[0];

  if (loading) return <div style={{ padding: 100, textAlign: "center", color: "#fff", fontWeight: 900 }}>ŁADOWANIE...</div>;

  return (
    <main style={{ padding: "40px 20px", color: "#fff", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ fontWeight: 900, fontSize: "2.5rem", marginBottom: 30 }}>LOGISTYKA</h1>
      <div style={{ overflowX: "auto", background: "rgba(20,20,20,0.85)", padding: 25, borderRadius: 24, border: "1px solid #333" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thS}>ZAWODNIK</th>
              {races.map(r => <th key={r.id} style={{ ...thS, color: r.race_date < now ? "#666" : "#00d4ff", minWidth: "150px" }}>{r.title}<br/><span style={{fontSize: "0.6rem", opacity: 0.5}}>{r.race_date}</span></th>)}
            </tr>
          </thead>
          <tbody>
            {profiles.map(runner => (
              <tr key={runner.id} style={{ borderBottom: "1px solid #222" }}>
                <td style={{ ...tdS, display: "flex", alignItems: "center", gap: "15px", fontWeight: 900 }}>
                  <div style={avS}>{runner.avatar_url ? <img src={runner.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} /> : "🏃"}</div>
                  {runner.display_name}
                </td>
                {races.map(r => {
                  const p = participation.find(part => part.user_id === runner.id && part.race_id === r.id);
                  return (
                    <td key={r.id} style={{ ...tdS, textAlign: "center", opacity: r.race_date < now ? 0.3 : 1 }}>
                      {p ? (
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                          <span style={{ color: p.is_registered ? "#00ff88" : "#ff4444", fontSize: "1.5rem" }}>●</span>
                          <span style={{ color: p.is_paid ? "#00ff88" : "#ff4444", fontSize: "1.5rem" }}>●</span>
                        </div>
                      ) : <span style={{opacity: 0.1}}>-</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
const thS = { padding: "20px 15px", textAlign: "left" as const, fontSize: "0.75rem", borderBottom: "2px solid #333" };
const tdS = { padding: "18px 15px", fontSize: "0.9rem" };
const avS = { width: 40, height: 40, borderRadius: "50%", background: "#111", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #444" };
