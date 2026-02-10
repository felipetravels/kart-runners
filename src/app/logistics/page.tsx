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

  if (loading) return <div style={{ padding: 100, textAlign: "center", color: "#fff" }}>WCZYTYWANIE...</div>;

  return (
    <main style={{ padding: "40px 20px", color: "#fff", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ fontWeight: 900, fontSize: "2.5rem", marginBottom: 30 }}>LOGISTYKA</h1>
      <div style={{ overflowX: "auto", background: "rgba(20,20,20,0.85)", padding: 25, borderRadius: 24, border: "1px solid #333" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{padding: "15px", textAlign: "left"}}>ZAWODNIK</th>
              {races.map(r => <th key={r.id} style={{padding: "15px", minWidth: "120px", fontSize: "0.7rem"}}>{r.title}</th>)}
            </tr>
          </thead>
          <tbody>
            {profiles.map(runner => (
              <tr key={runner.id} style={{ borderBottom: "1px solid #222" }}>
                <td style={{ padding: "15px", fontWeight: 900 }}>{runner.display_name}</td>
                {races.map(r => {
                  const p = participation.find(part => part.user_id === runner.id && part.race_id === r.id);
                  return (
                    <td key={r.id} style={{ textAlign: "center", padding: "15px" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <span style={{ color: p?.is_registered ? "#00ff88" : "#ff4444" }}>●</span>
                        <span style={{ color: p?.is_paid ? "#00ff88" : "#ff4444" }}>●</span>
                      </div>
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
