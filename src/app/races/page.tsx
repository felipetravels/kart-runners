"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ParticipationCard from "./ParticipationCard";
import RaceMyResult from "@/app/RaceMyResult";

function RaceDetailsContent() {
  const searchParams = useSearchParams();
  const raceId = searchParams.get("id");
  const [race, setRace] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!raceId) return;
    const [u, r, o, res] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from("races").select("*").eq("id", raceId).single(),
      supabase.from("race_options").select("*").eq("race_id", raceId).order("sort_order"),
      supabase.from("race_results").select("*, profiles(display_name, avatar_url, team), race_options(distance_km)").eq("race_id", raceId)
    ]);
    setUser(u.data.session?.user ?? null);
    setRace(r.data);
    setOptions(o.data || []);
    setResults(res.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [raceId]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return (h > 0 ? h.toString().padStart(2,'0')+":" : "") + m.toString().padStart(2,'0')+":" + sec.toString().padStart(2,'0');
  };

  if (loading) return <div style={{ padding: 100, textAlign: "center", color: "#fff" }}>LOADING...</div>;

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      <header style={{ marginBottom: 40 }}>
        <a href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 900 }}>← POWRÓT</a>
        <h1 style={{ fontSize: "3rem", fontWeight: 900, margin: "20px 0" }}>{race?.title}</h1>
        <p style={{ opacity: 0.6, fontSize: "1.2rem" }}>📍 {race?.city} | 📅 {race?.race_date}</p>
        {race?.event_url && (
            <a href={race.event_url} target="_blank" style={{ color: "#ffaa00", fontWeight: 900, textDecoration: "none", border: "1px solid #ffaa00", padding: "5px 15px", borderRadius: "8px", fontSize: "0.8rem" }}>WWW WYDARZENIA</a>
        )}
      </header>

      <div style={{ display: "grid", gap: 30 }}>
        <ParticipationCard raceId={race?.id} options={options} />
        <RaceMyResult raceId={race?.id} options={options} />

        <section style={secStyle}>
          <h3 style={{ color: "#00d4ff", marginTop: 0 }}>WYNIKI EKIPY</h3>
          {results.length > 0 ? results.sort((a,b) => a.time_seconds - b.time_seconds).map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", borderBottom: "1px solid #333" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={miniAv}>
                    {r.profiles?.avatar_url ? <img src={r.profiles.avatar_url} style={{width:"100%", height:"100%", objectFit:"cover"}} /> : "🏃"}
                </div>
                <span style={{ fontWeight: 700 }}>{r.profiles?.display_name}</span>
              </div>
              <span style={{ color: "#00ff88", fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{formatTime(r.time_seconds)}</span>
            </div>
          )) : <p style={{opacity: 0.5}}>Brak wyników dla tego biegu.</p>}
        </section>
      </div>
    </main>
  );
}
const secStyle = { background: "rgba(20,20,20,0.8)", backdropFilter: "blur(10px)", padding: 30, borderRadius: 24, border: "1px solid #333" };
const miniAv = { width: 30, height: 30, borderRadius: "50%", background: "#333", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" };

export default function RaceDetailsPage() { return <Suspense><RaceDetailsContent /></Suspense>; }
