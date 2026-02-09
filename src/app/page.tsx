"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RaceCard from "./components/RaceCard";

export default function HomePage() {
  const [races, setRaces] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_km: 0, top_runners: [] as any[] });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function init() {
      // 1. Najpierw sesja i biegi (to musi działać zawsze)
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      const { data: rData } = await supabase.from("races").select("*").order("race_date", { ascending: true });
      if (rData) setRaces(rData);
      setLoading(false); // Wyłączamy ladowanie już tutaj!

      // 2. Statystyki dociągamy "po cichu"
      try {
        const { data: kmData } = await supabase.from("v_total_team_km").select("total_km").maybeSingle();
        const { data: topData } = await supabase.from("v_top_runners_km").select("*").limit(3);
        setStats({
          total_km: kmData?.total_km || 0,
          top_runners: topData || []
        });
      } catch (e) {
        console.log("Statystyki jeszcze nie gotowe");
      }
    }
    init();
  }, []);

  if (loading) return <div style={{ background: "#000", color: "#fff", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>STARTOWANIE...</div>;

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", color: "#fff" }}>
      {/* STATYSTYKI - TYLKO JEŚLI SĄ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <div style={cardStyle}>
          <span style={labelStyle}>SUMA KM</span>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "#00d4ff" }}>{stats.total_km || 0} km</div>
        </div>
        <div style={cardStyle}>
          <span style={labelStyle}>TOP BIEGACZE</span>
          {stats.top_runners.map((r, i) => (
            <div key={i} style={{ fontSize: "0.8rem", marginTop: 5 }}>{i+1}. {r.display_name} ({r.total_km} km)</div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900 }}>BIEGI</h1>
        {user && <a href="/dashboard" style={btnStyle}>+ DODAJ</a>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {races.map(r => <RaceCard key={r.id} race={r} />)}
      </div>
    </main>
  );
}

const cardStyle = { background: "#111", padding: "20px", borderRadius: "15px", border: "1px solid #222" };
const labelStyle = { fontSize: "0.7rem", opacity: 0.5 };
const btnStyle = { background: "#00d4ff", color: "#000", padding: "10px 20px", borderRadius: "10px", textDecoration: "none", fontWeight: "bold" };
