"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return (h > 0 ? h.toString().padStart(2,'0')+":" : "") + m.toString().padStart(2,'0')+":" + sec.toString().padStart(2,'0');
  };

  useEffect(() => {
    supabase.from("race_results")
      .select("*, profiles(display_name, avatar_url), races(title), race_options(label)")
      .order("time_seconds", { ascending: true })
      .then(({ data }) => setResults(data || []));
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 20, color: "#fff" }}>
      <h1 style={{ fontWeight: 900, fontSize: "2.5rem", marginBottom: 30 }}>RANKING</h1>
      {results.map((res, i) => (
        <div key={i} style={resRow}>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <div style={smallAv}>
               {res.profiles?.avatar_url ? <img src={res.profiles.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} /> : "🏃"}
            </div>
            <div>
              <div style={{ fontWeight: 900 }}>{res.profiles?.display_name}</div>
              <div style={{ fontSize: "0.7rem", opacity: 0.5 }}>{res.races?.title}</div>
            </div>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#00ff88" }}>{formatTime(res.time_seconds)}</div>
        </div>
      ))}
    </main>
  );
}
const resRow = { display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", padding: 15, borderRadius: 15, marginBottom: 10, border: "1px solid #222" };
const smallAv = { width: 40, height: 40, borderRadius: "50%", background: "#333", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" };
