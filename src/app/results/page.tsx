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
        .select("time_seconds, races(title), race_options(label), profiles(display_name, team)")
        .order("time_seconds", { ascending: true });
      if (data) setResults(data);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const formatTime = (s: number) => ${Math.floor(s / 60)}:;

  if (loading) return <div style={{ color: "#fff", padding: 50, textAlign: "center" }}>Wczytywanie rankingu...</div>;

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: 40 }}>🏆 RANKING TEAMOWY</h1>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #333", color: "#00d4ff" }}>
              <th style={{ padding: 15 }}>Biegacz</th>
              <th style={{ padding: 15 }}>Bieg / Dystans</th>
              <th style={{ padding: 15 }}>Czas</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #222" }}>
                <td style={{ padding: 15 }}>
                  <strong>{r.profiles?.display_name}</strong>
                  {r.profiles?.team === "KART light" && (
                    <span style={{ marginLeft: 8, fontSize: "0.6rem", background: "#00ff88", color: "#000", padding: "2px 5px", borderRadius: 4, fontWeight: "bold" }}>LIGHT</span>
                  )}
                </td>
                <td style={{ padding: 15 }}>{r.races?.title}<br/><small style={{opacity: 0.5}}>{r.race_options?.label}</small></td>
                <td style={{ padding: 15, color: "#00ff00", fontWeight: "bold" }}>{formatTime(r.time_seconds)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
