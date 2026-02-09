"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LogisticsPage() {
  const [data, setData] = useState<{races: any[], users: any[], participation: any[]}>({ races: [], users: [], participation: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogistics() {
      const { data: races } = await supabase.from("races").select("id, title").order("race_date");
      const { data: users } = await supabase.from("profiles").select("id, display_name");
      const { data: part } = await supabase.from("race_participation").select("*");
      
      setData({ races: races || [], users: users || [], participation: part || [] });
      setLoading(false);
    }
    fetchLogistics();
  }, []);

  if (loading) return <div style={{ color: "#fff", padding: 50, textAlign: "center" }}>Wczytywanie tabeli...</div>;

  return (
    <main style={{ padding: "40px 20px", color: "#fff", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontWeight: 900, marginBottom: 30 }}>TABELA LOGISTYCZNA</h1>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 10, borderBottom: "2px solid #333" }}>BIEG / ZAWODNIK</th>
              {data.users.map(u => (
                <th key={u.id} style={{ padding: 10, borderBottom: "2px solid #333", whiteSpace: "nowrap" }}>{u.display_name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.races.map(race => (
              <tr key={race.id} style={{ borderBottom: "1px solid #222" }}>
                <td style={{ padding: 10, fontWeight: "bold", color: "#00d4ff" }}>{race.title}</td>
                {data.users.map(u => {
                  const p = data.participation.find(item => item.race_id === race.id && item.user_id === u.id);
                  return (
                    <td key={u.id} style={{ textAlign: "center", padding: 10 }}>
                      {p ? (
                        <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                          <span title="Chce startować" style={{ color: p.wants_to_start ? "#00ff88" : "#333" }}>●</span>
                          <span title="Zapisany" style={{ color: p.is_registered ? "#00d4ff" : "#333" }}>●</span>
                          <span title="Opłacony" style={{ color: p.is_paid ? "#ffaa00" : "#333" }}>●</span>
                        </div>
                      ) : <span style={{ opacity: 0.1 }}>-</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 20, fontSize: "0.7rem", opacity: 0.5, display: "flex", gap: "15px" }}>
        <span><span style={{ color: "#00ff88" }}>●</span> CHCE STARTOWAĆ</span>
        <span><span style={{ color: "#00d4ff" }}>●</span> ZAPISANY</span>
        <span><span style={{ color: "#ffaa00" }}>●</span> OPŁACONY</span>
      </div>
    </main>
  );
}
