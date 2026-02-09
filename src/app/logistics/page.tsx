"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LogisticsPage() {
  const [data, setData] = useState<any[]>([]);
  const [races, setRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogistics() {
      const [r, p] = await Promise.all([
        supabase.from("races").select("*").order("race_date", { ascending: true }),
        supabase.from("v_participation_details").select("*, profiles(avatar_url)")
      ]);
      setRaces(r.data || []);
      setData(p.data || []);
      setLoading(false);
    }
    fetchLogistics();
  }, []);

  const now = new Date().toISOString().split("T")[0];
  
  // Wyciągamy unikalnych biegaczy razem z ich avatarami
  const runners = Array.from(new Set(data.map(d => d.display_name))).map(name => {
    const entry = data.find(d => d.display_name === name);
    return {
      name: name,
      avatar: entry?.profiles?.avatar_url
    };
  });

  if (loading) return <div style={{ padding: 100, textAlign: "center", color: "#fff" }}>WCZYTYWANIE...</div>;

  return (
    <main style={{ padding: "40px 20px", color: "#fff", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ fontWeight: 900, fontSize: "2.5rem", marginBottom: 30 }}>LOGISTYKA</h1>
      <div style={{ overflowX: "auto", background: "rgba(20,20,20,0.8)", padding: 20, borderRadius: 24, border: "1px solid #333" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thS}>ZAWODNIK</th>
              {races.map(r => (
                <th key={r.id} style={{ ...thS, color: r.race_date < now ? "#666" : "#00d4ff", minWidth: "140px" }}>
                  {r.title}<br/><span style={{fontSize: "0.6rem", opacity: 0.5}}>{r.race_date}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {runners.map(runner => (
              <tr key={runner.name} style={{ borderBottom: "1px solid #222" }}>
                <td style={{ ...tdS, display: "flex", alignItems: "center", gap: "12px", fontWeight: 900 }}>
                  <div style={avS}>
                    {runner.avatar ? (
                      <img src={runner.avatar} style={{width:"100%", height:"100%", objectFit:"cover"}} />
                    ) : (
                      <span style={{opacity: 0.5}}>🏃</span>
                    )}
                  </div>
                  {runner.name}
                </td>
                {races.map(r => {
                  // Szukamy uczestnictwa po nazwie wyświetlanej i ID biegu
                  const p = data.find(d => d.display_name === runner.name && d.race_id === r.id);
                  const isPast = r.race_date < now;
                  
                  return (
                    <td key={r.id} style={{ ...tdS, textAlign: "center", opacity: isPast ? 0.3 : 1 }}>
                      {p ? (
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                          <span title="Zapisany" style={{ color: p.is_registered ? "#00ff88" : "#ff4444", fontSize: "1.4rem" }}>●</span>
                          <span title="Opłacony" style={{ color: p.is_paid ? "#00ff88" : "#ff4444", fontSize: "1.4rem" }}>●</span>
                        </div>
                      ) : (
                        <span style={{opacity: 0.2}}>-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{marginTop: 20, fontSize: "0.8rem", opacity: 0.5}}>
         Legenda: <span style={{color: "#00ff88"}}>●</span> Tak / <span style={{color: "#ff4444"}}>●</span> Nie | Pierwsza kropka: Zapisany, Druga: Opłacony
      </div>
    </main>
  );
}

const thS = { padding: "15px", textAlign: "left" as const, fontSize: "0.75rem", borderBottom: "2px solid #333" };
const tdS = { padding: "15px", fontSize: "0.85rem" };
const avS = { width: 35, height: 35, borderRadius: "50%", background: "#222", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #444" };
