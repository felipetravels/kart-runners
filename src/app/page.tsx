"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RaceCard from "./components/RaceCard";

export default function HomePage() {
  const [races, setRaces] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_km: 0, top_runners: [] as any[] });
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    const [racesRes, kmRes, topRes] = await Promise.all([
      supabase.from("races").select("*").order("race_date", { ascending: true }),
      supabase.from("v_total_team_km").select("total_km").maybeSingle(),
      supabase.from("v_top_runners_km").select("*").limit(3)
    ]);

    if (racesRes.data) setRaces(racesRes.data);
    setStats({
      total_km: kmRes.data?.total_km || 0,
      top_runners: topRes.data || []
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => fetchAllData());
    return () => subscription.unsubscribe();
  }, []);

  const now = new Date().toISOString().split("T")[0];
  const upcoming = races.filter(r => r.race_date >= now);
  const past = races.filter(r => r.race_date < now);

  if (loading) return <div style={{ color: "#fff", padding: 50, textAlign: "center", background: "#000", minHeight: "100vh" }}>Wczytywanie...</div>;

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", color: "#fff" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <div style={card}>
          <span style={label}>WSPÓLNE KILOMETRY</span>
          <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#00d4ff" }}>{stats.total_km} km</div>
        </div>
        <div style={card}>
          <span style={label}>TOP 3 BIEGACZY</span>
          {stats.top_runners.length > 0 ? stats.top_runners.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
              <span>{i+1}. {r.display_name}</span>
              <span style={{ color: "#00ff88", fontWeight: "bold" }}>{r.total_km} km</span>
            </div>
          )) : <div style={{ opacity: 0.3, fontSize: "0.8rem" }}>Brak danych o dystansach</div>}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900 }}>KALENDARZ</h1>
        <a href="/dashboard" style={btn}>+ DODAJ BIEG</a>
      </div>

      <section>
        <h2 style={sectionH}>NADCHODZĄCE</h2>
        <div style={grid}>{upcoming.map(r => <RaceCard key={r.id} race={r} />)}</div>
      </section>

      <section style={{ marginTop: 50 }}>
        <h2 style={{ ...sectionH, opacity: 0.5 }}>MINIONE</h2>
        <div style={grid}>{past.map(r => <RaceCard key={r.id} race={r} />)}</div>
      </section>
    </main>
  );
}

const card = { background: "#111", padding: "20px", borderRadius: "15px", border: "1px solid #222" };
const label = { fontSize: "0.7rem", opacity: 0.5 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" };
const sectionH = { fontSize: "0.8rem", color: "#00d4ff", borderBottom: "1px solid #222", paddingBottom: 10, marginBottom: 20 };
const btn = { background: "#00d4ff", color: "#000", padding: "10px 20px", borderRadius: "10px", textDecoration: "none", fontWeight: "bold" };
