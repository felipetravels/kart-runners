"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function GlobalResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const { data } = await supabase
        .from("race_results")
        .select(`
          time_seconds,
          races ( title, race_date ),
          race_options ( label, distance_km ),
          profiles ( display_name, team )
        `)
        .order("time_seconds", { ascending: true });
      
      if (data) setResults(data);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading) return <div style={{ color: "#fff", padding: 50, textAlign: "center" }}>Ładowanie tabeli wyników...</div>;

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: 40 }}>🏆 Ranking Teamowy</h1>
      
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #333", color: "#00d4ff" }}>
            <th style={thStyle}>Biegacz</th>
            <th style={thStyle}>Bieg</th>
            <th style={thStyle}>Dystans</th>
            <th style={thStyle}>Czas</th>
            <th style={thStyle}>Tempo</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #222" }}>
              <td style={tdStyle}><strong>{r.profiles?.display_name}</strong><br/><small style={{opacity: 0.5}}>{r.profiles?.team}</small></td>
              <td style={tdStyle}>{r.races?.title}</td>
              <td style={tdStyle}>{r.race_options?.label}</td>
              <td style={{ ...tdStyle, color: "#00ff00", fontWeight: "bold" }}>{formatTime(r.time_seconds)}</td>
              <td style={tdStyle}>{(r.time_seconds / 60 / (r.race_options?.distance_km || 1)).toFixed(2)} min/km</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

const thStyle = { padding: "15px 10px", fontSize: "0.9rem", textTransform: "uppercase" as const };
const tdStyle = { padding: "15px 10px" };