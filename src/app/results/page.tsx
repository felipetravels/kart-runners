"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const h = hours > 0 ? hours.toString().padStart(2, '0') + ":" : "";
    const m = minutes.toString().padStart(2, '0') + ":";
    const s = seconds.toString().padStart(2, '0');
    return h + m + s;
  };

  useEffect(() => {
    async function fetchResults() {
      const { data } = await supabase.from("race_results")
        .select("*, profiles(display_name), races(title, race_date), race_options(distance_km, label)")
        .order("time_seconds", { ascending: true });
      setResults(data || []);
      setLoading(false);
    }
    fetchResults();
  }, []);

  if (loading) return <div style={{ padding: 100, textAlign: "center", color: "#fff" }}>WCZYTYWANIE...</div>;

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      <h1 style={{ fontWeight: 900, fontSize: "2.5rem", marginBottom: 30 }}>RANKING WYNIKÓW</h1>
      <div style={{ display: "grid", gap: 15 }}>
        {results.map((res, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.05)", padding: 25, borderRadius: 20, border: "1px solid #333", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: "1.2rem", color: "#00d4ff" }}>{res.profiles?.display_name}</div>
              <div style={{ fontSize: "0.85rem", opacity: 0.6 }}>{res.races?.title} — {res.race_options?.label}</div>
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#00ff88", fontVariantNumeric: "tabular-nums" }}>
              {formatTime(res.time_seconds)}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
