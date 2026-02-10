"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RaceCard from "./components/RaceCard";

export default function HomePage() {
  const [races, setRaces] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_km: 0, top_runners: [] as any[] });
  const [participation, setParticipation] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return (h > 0 ? h.toString().padStart(2,'0')+":" : "") + m.toString().padStart(2,'0')+":" + sec.toString().padStart(2,'0');
  };

  useEffect(() => {
    async function fetchAll() {
      const [r, k, t, p, res, rec] = await Promise.all([
        supabase.from("races").select("*").order("race_date", { ascending: true }),
        supabase.from("v_total_team_km").select("total_km").maybeSingle(),
        supabase.from("v_top_runners_km").select("*").limit(3),
        supabase.from("participation").select("*, profiles(display_name)").eq("is_paid", true),
        supabase.from("race_results").select("user_id, race_id"),
        supabase.from("race_results").select("time_seconds, profiles(display_name), race_options(distance_km)")
      ]);

      setRaces(r.data || []);
      setStats({ total_km: k.data?.total_km || 0, top_runners: t.data || [] });
      setParticipation(p.data || []);
      setResults(res.data || []);
      setRecords(rec.data || []);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const now = new Date().toISOString().split("T")[0];
  const upcoming = races.filter(r => r.race_date >= now);

  if (loading) return <div style={{ padding: 100, textAlign: "center", fontWeight: 900, color: "#fff" }}>WCZYTYWANIE...</div>;

  return (
    <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      
      {/* ŻÓŁTE REKORDY - FUNKCJA KRYTYCZNA */}
      <h2 style={secH}>TEAM RECORDS (TOP 3)</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", marginBottom: "60px" }}>
        {[5, 10, 21.097, 42.195].map(dist => (
          <div key={dist} style={{ ...statB, borderLeft: "6px solid #ffaa00" }}>
            <span style={{ fontWeight: 900, color: "#ffaa00", fontSize: "1rem", letterSpacing: "2px" }}>{dist === 21.097 ? "HALF MARATHON" : dist === 42.195 ? "MARATHON" : dist + " KM"}</span>
            <div style={{ marginTop: 20 }}>
              {records.filter(rec => rec.race_options?.distance_km === dist).sort((a,b) => a.time_seconds - b.time_seconds).slice(0,3).map((r, i) => (
                <div key={i} style={{ fontSize: "1rem", display: "flex", justifyContent: "space-between", marginBottom: 8, fontWeight: 900 }}>
                  <span>{i+1}. {r.profiles?.display_name}</span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatTime(r.time_seconds)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2 style={secH}>NADCHODZĄCE STARTY</h2>
      <div style={grid}>
        {upcoming.map(r => {
          const racePaid = participation.filter(p => p.race_id === r.id);
          return (
            <div key={r.id} style={{display:"flex", flexDirection:"column", gap:12}}>
              <RaceCard race={r} />
              <div style={participationBox}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={lab}>OPŁACILI:</span>
                  <span style={countNum}>{racePaid.length}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {racePaid.map(p => {
                    const hasFinished = results.some(res => res.user_id === p.user_id && res.race_id === r.id);
                    return <span key={p.user_id} style={hasFinished ? finishedBadge : waitingBadge}>{hasFinished && "🏅 "}{p.profiles?.display_name}</span>;
                  })}
                  {racePaid.length === 0 && <span style={{fontSize: "0.7rem", opacity: 0.3}}>Lista pusta</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
const statB = { background: "rgba(25,25,25,0.85)", padding: "40px", borderRadius: "24px", border: "1px solid #333" };
const lab = { fontSize: "0.7rem", opacity: 0.5, letterSpacing: "2px", fontWeight: 900 };
const secH = { fontSize: "1.2rem", letterSpacing: "5px", borderBottom: "3px solid #00d4ff", paddingBottom: 15, fontWeight: 900, color: "#00d4ff", marginBottom: 30 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "35px" };
const participationBox = { background: "rgba(255,255,255,0.03)", padding: "15px", borderRadius: "15px", border: "1px solid #222" };
const countNum = { fontSize: "1.8rem", fontWeight: 900, color: "#00d4ff" };
const waitingBadge = { background: "#222", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700, border: "1px solid #444" };
const finishedBadge = { background: "rgba(0,255,136,0.15)", color: "#00ff88", padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 900, border: "1px solid #00ff88" };
