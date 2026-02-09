"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RaceCard from "./components/RaceCard";

export default function HomePage() {
  const [races, setRaces] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_km: 0, top_runners: [] as any[] });
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0 ? `${h}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}` : `${m}:${sec.toString().padStart(2,'0')}`;
  };

  const fetchData = async () => {
    // 1. Sesja i Biegi
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    const { data: rData } = await supabase.from("races").select("*").order("race_date", { ascending: true });
    if (rData) setRaces(rData);
    setLoading(false);

    // 2. Statystyki ogólne
    const { data: kmData } = await supabase.from("v_total_team_km").select("total_km").maybeSingle();
    const { data: topData } = await supabase.from("v_top_runners_km").select("*").limit(3);
    setStats({ total_km: kmData?.total_km || 0, top_runners: topData || [] });

    // 3. Rekordy na dystansach (Top 3 dla 5, 10, HM, M)
    const targetDistances = [5, 10, 21.097, 42.195];
    const { data: recData } = await supabase
      .from("race_results")
      .select("time_seconds, profiles(display_name), race_options(distance_km, label)")
      .in("race_options.distance_km", targetDistances);

    if (recData) {
      setRecords(recData);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getTopForDist = (dist: number) => {
    return records
      .filter(r => r.race_options?.distance_km === dist)
      .sort((a, b) => a.time_seconds - b.time_seconds)
      .slice(0, 3);
  };

  if (loading) return <div style={{ background: "#000", color: "#fff", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>STARTOWANIE...</div>;

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", color: "#fff" }}>
      
      {/* STATYSTYKI OGÓLNE */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <div style={cardStyle}>
          <span style={labelStyle}>WSPÓLNE KILOMETRY</span>
          <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#00d4ff" }}>{stats.total_km} km</div>
        </div>
        <div style={cardStyle}>
          <span style={labelStyle}>TOP 3 DYSTANS (KM)</span>
          {stats.top_runners.map((r, i) => (
            <div key={i} style={{ fontSize: "0.9rem", marginTop: 5, display: "flex", justifyContent: "space-between" }}>
              <span>{i+1}. {r.display_name}</span>
              <span style={{color: "#00ff88"}}>{r.total_km} km</span>
            </div>
          ))}
        </div>
      </div>

      {/* REKORDY NA DYSTANSACH */}
      <h2 style={sectionTitleStyle}>REKORDY EKIPY (TOP 3)</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "50px" }}>
        {[
          { label: "5 KM", val: 5 },
          { label: "10 KM", val: 10 },
          { label: "PÓŁMARATON", val: 21.097 },
          { label: "MARATON", val: 42.195 }
        ].map(d => (
          <div key={d.val} style={{ ...cardStyle, borderLeft: "4px solid #ffaa00" }}>
            <span style={{ fontWeight: "bold", color: "#ffaa00", fontSize: "0.8rem" }}>{d.label}</span>
            <div style={{ marginTop: 10 }}>
              {getTopForDist(d.val).length > 0 ? getTopForDist(d.val).map((r, i) => (
                <div key={i} style={{ fontSize: "0.8rem", display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span>{i+1}. {r.profiles?.display_name}</span>
                  <span style={{ fontWeight: "bold" }}>{formatTime(r.time_seconds)}</span>
                </div>
              )) : <span style={{ opacity: 0.3, fontSize: "0.7rem" }}>Brak wyników</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900 }}>BIEGI</h1>
        {user && <a href="/dashboard" style={btnStyle}>+ DODAJ BIEG</a>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {races.map(r => <RaceCard key={r.id} race={r} />)}
      </div>
    </main>
  );
}

const cardStyle = { background: "#111", padding: "20px", borderRadius: "15px", border: "1px solid #222" };
const labelStyle = { fontSize: "0.7rem", opacity: 0.5, letterSpacing: "1px" };
const sectionTitleStyle = { fontSize: "0.8rem", color: "#00d4ff", letterSpacing: "2px", marginBottom: "20px", borderBottom: "1px solid #222", paddingBottom: "10px" };
const btnStyle = { background: "#00d4ff", color: "#000", padding: "12px 24px", borderRadius: "12px", textDecoration: "none", fontWeight: "bold" };
