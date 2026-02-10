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
        supabase.from("participations").select("*") // ZMIANA NA MNOGĄ
      ]);
      setRaces(r.data || []);
      setProfiles(p.data || []);
      setParticipation(part.data || []);
      setLoading(false);
    }
    fetchAll();
  }, []);

  if (loading) return <div style={{ padding: 100, textAlign: "center", color: "#fff" }}>ŁADOWANIE...</div>;

  return (
    <main style={{ padding: "40px 20px", color: "#fff", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ fontWeight: 900, fontSize: "2.5rem", marginBottom: 30 }}>LOGISTYKA</h1>
      <div style={{marginBottom: 20, padding: 15, background: "rgba(255,255,255,0.05)", borderRadius: 12, display: "inline-flex", gap: 20, fontSize: "0.8rem"}}>
        <span><span style={{color: "#ffff00"}}>●</span> Chcę</span>
        <span><span style={{color: "#00d4ff"}}>●</span> Zapisany</span>
        <span><span style={{color: "#00ff88"}}>●</span> Opłacony</span>
      </div>
      <div style={{ overflowX: "auto", background: "rgba(20,20,20,0.85)", padding: 25, borderRadius: 24, border: "1px solid #333" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{padding: "15px", textAlign: "left", borderBottom: "1px solid #444"}}>ZAWODNIK</th>
              {races.map(r => <th key={r.id} style={{padding: "15px", minWidth: "120px", fontSize: "0.7rem", borderBottom: "1px solid #444", color: "#00d4ff"}}>{r.title}</th>)}
            </tr>
          </thead>
          <tbody>
            {profiles.map(runner => (
              <tr key={runner.id} style={{ borderBottom: "1px solid #222" }}>
                <td style={{ padding: "15px", fontWeight: 900, display: "flex", alignItems: "center", gap: 10 }}>
                   <div style={{width: 30, height: 30, borderRadius: "50%", background: "#333", overflow: "hidden"}}>
                      {runner.avatar_url ? <img src={runner.avatar_url} style={{width:"100%", height:"100%", objectFit:"cover"}}/> : null}
                   </div>
                   {runner.display_name}
                </td>
                {races.map(r => {
                  const p = participation.find(part => part.user_id === runner.id && part.race_id === r.id);
                  if (!p || (!p.is_cheering && !p.is_registered && !p.is_paid)) return <td key={r.id} style={{ textAlign: "center", opacity: 0.1 }}>-</td>;
                  return (
                    <td key={r.id} style={{ textAlign: "center", padding: "15px" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                        <span title="Chcę" style={{ color: p.is_cheering ? "#ffff00" : "#333", fontSize: "1.2rem" }}>●</span>
                        <span title="Zapisany" style={{ color: p.is_registered ? "#00d4ff" : "#333", fontSize: "1.2rem" }}>●</span>
                        <span title="Opłacony" style={{ color: p.is_paid ? "#00ff88" : "#333", fontSize: "1.2rem" }}>●</span>
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
