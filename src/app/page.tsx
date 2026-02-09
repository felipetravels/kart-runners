"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RaceCard from "./components/RaceCard";

export default function HomePage() {
  const [races, setRaces] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_km: 0, top_runners: [] as any[] });
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const [r, k, t, rec] = await Promise.all([
        supabase.from("races").select("*").order("race_date", { ascending: true }),
        supabase.from("v_total_team_km").select("total_km").maybeSingle(),
        supabase.from("v_top_runners_km").select("*").limit(3),
        supabase.from("race_results").select("time_seconds, profiles(display_name), race_options(distance_km)")
      ]);
      if (r.data) setRaces(r.data);
      setStats({ total_km: k.data?.total_km || 0, top_runners: t.data || [] });
      if (rec.data) setRecords(rec.data);
      setLoading(false);
    }
    fetch();
  }, []);

  const now = new Date().toISOString().split("T")[0];
  const upcoming = races.filter(r => r.race_date >= now);
  const past = races.filter(r => r.race_date < now).reverse();

  if (loading) return <div style={{ padding: 100, textAlign: "center", fontWeight: 900 }}>LOADING...</div>;

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "60px" }}>
        <div style={statB}><span>TOTAL KM</span><div style={val}>{stats.total_km} km</div></div>
        <div style={statB}><span>TOP RUNNERS</span>
          {stats.top_runners.map((r, i) => <div key={i} style={rank}>{i+1}. {r.display_name} ({r.total_km}km)</div>)}
        </div>
      </div>

      <h2 style={secH}>UPCOMING RACES</h2>
      <div style={grid}>{upcoming.map(r => <RaceCard key={r.id} race={r} />)}</div>

      <h2 style={{...secH, marginTop: 80, opacity: 0.5}}>PAST RACES</h2>
      <div style={grid}>{past.map(r => <RaceCard key={r.id} race={r} />)}</div>
    </main>
  );
}
const statB = { background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "20px", border: "1px solid #333" };
const val = { fontSize: "2.5rem", fontWeight: 900, color: "#00d4ff" };
const rank = { fontSize: "0.9rem", marginTop: 5, fontWeight: 700 };
const secH = { fontSize: "1rem", letterSpacing: "3px", borderBottom: "1px solid #333", paddingBottom: 15, marginBottom: 30, fontWeight: 900 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" };
