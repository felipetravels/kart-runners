"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RaceCard from "./components/RaceCard";

export default function HomePage() {
  const [races, setRaces] = useState<any[]>([]);
  const [participation, setParticipation] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_km: 0, top_runners: [] as any[] });
  const [loading, setLoading] = useState(true);

  // FORMATOWANIE CZASU
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return (h > 0 ? h.toString().padStart(2,"0")+":" : "") + m.toString().padStart(2,"0")+":" + sec.toString().padStart(2,"0");
  };

  // OBLICZANIE TEMPA (np. 4:30 /km)
  const calculatePace = (seconds: number, distanceKm: number) => {
    if (!distanceKm || distanceKm <= 0) return "";
    const totalMinutes = seconds / 60;
    const paceDecimal = totalMinutes / distanceKm;
    const paceMin = Math.floor(paceDecimal);
    const paceSec = Math.round((paceDecimal - paceMin) * 60);
    return `${paceMin}:${paceSec.toString().padStart(2, "0")} /km`;
  };

  useEffect(() => {
    async function fetchAll() {
      const [r, p, prof, rec, res, k, t] = await Promise.all([
        supabase.from("races").select("*").order("race_date", { ascending: true }),
        supabase.from("participations").select("*"), 
        supabase.from("profiles").select("id, display_name"),
        supabase.from("race_results").select("time_seconds, profiles(display_name), race_options(distance_km)"), 
        supabase.from("race_results").select("user_id, race_id"),
        supabase.from("v_total_team_km").select("total_km").maybeSingle(),
        supabase.from("v_top_runners_km").select("*").limit(3)
      ]);

      setRaces(r.data || []);
      setParticipation(p.data || []);
      setProfiles(prof.data || []);
      setRecords(rec.data || []);
      setResults(res.data || []);
      setStats({ total_km: k.data?.total_km || 0, top_runners: t.data || [] });
      setLoading(false);
    }
    fetchAll();
  }, []);

  const now = new Date().toISOString().split("T")[0];
  const upcoming = races.filter(r => r.race_date >= now);
  const past = races.filter(r => r.race_date < now).sort((a,b) => b.race_date.localeCompare(a.race_date));

  const getName = (userId: string) => {
    const user = profiles.find(u => u.id === userId);
    return user ? user.display_name : "Zawodnik";
  };

  if (loading) return <div style={{ padding: 100, textAlign: "center", color: "#fff" }}>ŁADOWANIE...</div>;

  return (
    <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      
      {/* STATYSTYKI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px", marginBottom: "40px" }}>
        <div style={statB}>
          <span style={lab}>TOTAL KM EKIPY</span>
          <div style={{ fontSize: "3.5rem", fontWeight: 900, color: "#00d4ff" }}>{stats.total_km} km</div>
        </div>
        <div style={statB}>
          <span style={lab}>TOP RUNNERS (KM)</span>
          {stats.top_runners.map((r, i) => (
            <div key={i} style={{ fontSize: "1.1rem", marginTop: 8, fontWeight: 900 }}>
              {i+1}. {r.display_name} <span style={{color: "#00ff88"}}>{r.total_km}km</span>
            </div>
          ))}
        </div>
      </div>

      {/* REKORDY + TEMPO */}
      <h2 style={secH}>TEAM RECORDS (TOP 3)</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", marginBottom: "60px" }}>
        {[5, 10, 21.097, 42.195].map(dist => (
          <div key={dist} style={{ ...statB, borderLeft: "6px solid #ffaa00" }}>
            <span style={{ fontWeight: 900, color: "#ffaa00", fontSize: "1rem", letterSpacing: "2px" }}>{dist === 21.097 ? "HM" : dist === 42.195 ? "M" : dist + " KM"}</span>
            <div style={{ marginTop: 20 }}>
              {records.filter(rec => rec.race_options?.distance_km === dist).sort((a,b) => a.time_seconds - b.time_seconds).slice(0,3).map((r, i) => (
                <div key={i} style={{ fontSize: "1rem", display: "flex", justifyContent: "space-between", marginBottom: 8, fontWeight: 900 }}>
                  <span>{i+1}. {r.profiles?.display_name}</span>
                  <div style={{textAlign: "right"}}>
                    <span style={{ display: "block", fontVariantNumeric: "tabular-nums" }}>{formatTime(r.time_seconds)}</span>
                    <span style={{ fontSize: "0.75rem", color: "#888" }}>{calculatePace(r.time_seconds, dist)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* NADCHODZĄCE STARTY */}
      <h2 style={secH}>NADCHODZĄCE STARTY</h2>
      <div style={grid}>
        {upcoming.map(r => {
          const racePaid = participation.filter(p => p.race_id === r.id && p.is_paid === true);
          return (
            <div key={r.id} style={{display: "flex", flexDirection: "column", gap: 10}}>
              <RaceCard race={r} />
              <div style={pBox}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={lab}>OPŁACILI:</span>
                  <span style={{fontSize: "1.8rem", fontWeight: 900, color: "#00d4ff"}}>{racePaid.length}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {racePaid.map(p => {
                    const hasFinished = results.some(res => res.user_id === p.user_id && res.race_id === r.id);
                    return <span key={p.user_id} style={hasFinished ? fBadge : wBadge}>{hasFinished && "🏅 "}{getName(p.user_id)}</span>;
                  })}
                  {racePaid.length === 0 && <span style={{fontSize: "0.8rem", opacity: 0.3}}>Lista pusta</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ARCHIWUM */}
      <h2 style={{...secH, marginTop: 80, opacity: 0.6, borderColor: "#666", color: "#aaa"}}>ARCHIWUM BIEGÓW</h2>
      <div style={grid}>
        {past.map(r => {
          const racePaid = participation.filter(p => p.race_id === r.id && p.is_paid === true);
          return (
            <div key={r.id} style={{display: "flex", flexDirection: "column", gap: 10, opacity: 0.7}}>
              <RaceCard race={r} />
              <div style={pBox}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={lab}>OPŁACILI:</span>
                  <span style={{fontSize: "1.5rem", fontWeight: 900, color: "#888"}}>{racePaid.length}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {racePaid.map(p => {
                    const hasFinished = results.some(res => res.user_id === p.user_id && res.race_id === r.id);
                    return <span key={p.user_id} style={hasFinished ? fBadge : wBadge}>{hasFinished && "🏅 "}{getName(p.user_id)}</span>;
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
