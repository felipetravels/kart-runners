"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RaceCard from "./components/RaceCard";

export default function HomePage() {
  const [races, setRaces] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_km: 0, top_runners: [] as any[] });
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0 ? `${h}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}` : `${m}:${sec.toString().padStart(2,'0')}`;
  };

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

  const getTopForDist = (dist: number) => {
    return records
      .filter(r => r.race_options?.distance_km === dist)
      .sort((a, b) => a.time_seconds - b.time_seconds)
      .slice(0, 3);
  };

  const now = new Date().toISOString().split("T")[0];
  const upcoming = races.filter(r => r.race_date >= now);
  const past = races.filter(r => r.race_date < now).reverse();

  if (loading) return <div style={{ padding: 100, textAlign: "center", fontWeight: 900, color: "#fff" }}>LOADING...</div>;

  return (
    <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      
      {/* STATYSTYKI OGÓLNE (NIEBIESKIE) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <div style={statB}>
          <span style={lab}>TOTAL KM</span>
          <div style={{ fontSize: "3rem", fontWeight: 900, color: "#00d4ff" }}>{stats.total_km} km</div>
        </div>
        <div style={statB}>
          <span style={lab}>TOP RUNNERS (KM)</span>
          {stats.top_runners.map((r, i) => (
            <div key={i} style={{ fontSize: "1rem", marginTop: 5, fontWeight: 700 }}>
              {i+1}. {r.display_name} <span style={{color: "#00ff88"}}>{r.total_km}km</span>
            </div>
          ))}
        </div>
      </div>

      {/* ŻÓŁTE REKORDY DYSTANSÓW */}
      <h2 style={secH}>TEAM RECORDS (TOP 3)</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "60px" }}>
        {[
          { label: "5 KM", val: 5 },
          { label: "10 KM", val: 10 },
          { label: "HALF MARATHON", val: 21.097 },
          { label: "MARATHON", val: 42.195 }
        ].map(d => (
          <div key={d.val} style={{ ...statB, borderLeft: "5px solid #ffaa00" }}>
            <span style={{ fontWeight: 900, color: "#ffaa00", fontSize: "0.9rem", letterSpacing: "1px" }}>{d.label}</span>
            <div style={{ marginTop: 15 }}>
              {getTopForDist(d.val).length > 0 ? getTopForDist(d.val).map((r, i) => (
                <div key={i} style={{ fontSize: "0.85rem", display: "flex", justifyContent: "space-between", marginBottom: 6, fontWeight: 700 }}>
                  <span>{i+1}. {r.profiles?.display_name}</span>
                  <span style={{ color: "#fff" }}>{formatTime(r.time_seconds)}</span>
                </div>
              )) : <span style={{ opacity: 0.3, fontSize: "0.8rem" }}>No results</span>}
            </div>
          </div>
        ))}
      </div>

      <h2 style={secH}>UPCOMING RACES</h2>
      <div style={grid}>{upcoming.map(r => <RaceCard key={r.id} race={r} />)}</div>

      <h2 style={{...secH, marginTop: 80, opacity: 0.5}}>PAST RACES</h2>
      <div style={grid}>{past.map(r => <RaceCard key={r.id} race={r} />)}</div>
    </main>
  );
}

const statB = { background: "rgba(20,20,20,0.85)", backdropFilter: "blur(10px)", padding: "35px", borderRadius: "24px", border: "1px solid #333" };
const lab = { fontSize: "0.8rem", opacity: 0.5, letterSpacing: "2px", fontWeight: 900 };
const secH = { fontSize: "1.1rem", letterSpacing: "4px", borderBottom: "2px solid #333", paddingBottom: 15, marginBottom: 35, fontWeight: 900, color: "#00d4ff" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" };
