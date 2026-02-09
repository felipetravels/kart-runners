"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RaceCard from "./components/RaceCard";

export default function HomePage() {
  const [races, setRaces] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_km: 0, top_runners: [] });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // 1. Sesja
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      // 2. Biegi
      const { data: racesData } = await supabase.from("races").select("*").order("race_date", { ascending: true });
      if (racesData) setRaces(racesData);

      // 3. Statystyki (Suma KM i Top 3 z widoków SQL)
      const [kmRes, topRes] = await Promise.all([
        supabase.from("v_total_team_km").select("total_km").single(),
        supabase.from("v_top_runners_km").select("*").limit(3)
      ]);

      setStats({
        total_km: kmRes.data?.total_km || 0,
        top_runners: topRes.data || []
      });

      setLoading(false);
    };

    fetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const now = new Date().toISOString().split("T")[0];
  const upcomingRaces = races.filter((r) => r.race_date >= now);
  const pastRaces = races.filter((r) => r.race_date < now);

  if (loading) return <div style={{ color: "#fff", padding: "50px", textAlign: "center", background: "#000", minHeight: "100vh" }}>Wczytywanie panelu...</div>;

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", color: "#fff" }}>
      
      {/* STATYSTYKI TOP */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <div style={statCardStyle}>
          <span style={statLabelStyle}>WSPÓLNE KILOMETRY</span>
          <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#00d4ff" }}>{stats.total_km} km</div>
        </div>
        <div style={statCardStyle}>
          <span style={statLabelStyle}>TOP 3 BIEGACZY</span>
          {stats.top_runners.map((r: any, i) => (
            <div key={i} style={{ fontSize: "0.9rem", marginTop: "5px" }}>
              {i+1}. {r.display_name} ({r.total_km} km)
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, margin: 0 }}>BIEGI</h1>
          <p style={{ opacity: 0.5 }}>Ekipa KART</p>
        </div>
        {user && (
          <a href="/dashboard" style={addBtnStyle}>+ DODAJ BIEG</a>
        )}
      </div>

      <section>
        <h2 style={sectionTitleStyle}>Nadchodzące</h2>
        <div style={gridStyle}>
          {upcomingRaces.map((race) => <RaceCard key={race.id} race={race} />)}
        </div>
      </section>

      <section style={{ marginTop: "60px" }}>
        <h2 style={{ ...sectionTitleStyle, opacity: 0.5 }}>Minione</h2>
        <div style={gridStyle}>
          {pastRaces.map((race) => <RaceCard key={race.id} race={race} />)}
        </div>
      </section>
    </main>
  );
}

const statCardStyle: React.CSSProperties = { background: "#111", padding: "25px", borderRadius: "20px", border: "1px solid #222" };
const statLabelStyle: React.CSSProperties = { fontSize: "0.7rem", opacity: 0.5, letterSpacing: "1px" };
const gridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" };
const sectionTitleStyle: React.CSSProperties = { fontSize: "0.8rem", textTransform: "uppercase", color: "#00d4ff", borderBottom: "1px solid #222", paddingBottom: "10px", marginBottom: "20px" };
const addBtnStyle: React.CSSProperties = { background: "#00d4ff", color: "#000", padding: "14px 28px", borderRadius: "12px", textDecoration: "none", fontWeight: "900", boxShadow: "0 8px 20px rgba(0, 212, 255, 0.4)" };
