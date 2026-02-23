"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function HomePage() {
  const [totalKm, setTotalKm] = useState(0);
  const [races, setRaces] = useState<any[]>([]);
  const [distanceRecords, setDistanceRecords] = useState<any[]>([]);
  const [overallLeaderboard, setOverallLeaderboard] = useState<any[]>([]);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
        if (prof) setUserName(prof.display_name);
      }
      const { data: totalData } = await supabase.from("v_total_team_km").select("total_km").maybeSingle();
      if (totalData) setTotalKm(totalData.total_km || 0);
      const { data: leaderData } = await supabase.from("v_top_runners_km").select("*").limit(3);
      if (leaderData) setOverallLeaderboard(leaderData);
      const { data: recordsData } = await supabase.from("v_top_times_by_distance").select("*");
      if (recordsData) setDistanceRecords(recordsData);
      const { data: racesData } = await supabase.from("races").select("*").order("race_date", { ascending: true });
      if (racesData) setRaces(racesData);
    }
    loadData();
  }, []);

  const currentYear = new Date().getFullYear();
  const formatTime = (s: any) => {
    const n = Number(s); if (!n || isNaN(n)) return "---";
    const hrs = Math.floor(n / 3600); const mins = Math.floor((n % 3600) / 60); const secs = n % 60;
    return hrs > 0 ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000", backgroundImage: "linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url('/hero.png')", backgroundSize: "cover", backgroundAttachment: "fixed" }}>
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 20px" }}>
        
        <header style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "4.5rem", fontWeight: 900, margin: 0, color: "#fff", textAlign: "center", lineHeight: 0.9 }}>Kraków Airport</h1>
          <h1 style={{ fontSize: "4.5rem", fontWeight: 900, margin: 0, color: "#00d4ff", textAlign: "center", lineHeight: 0.9 }}>Running Team</h1>
          <Link href="/profile" style={{ border: "2px solid #00d4ff", borderRadius: "15px", padding: "12px 35px", background: "rgba(0,0,0,0.6)", color: "#fff", textDecoration: "none", fontWeight: 900, marginTop: "30px" }}>
            {userName ? userName.toUpperCase() : "PROFIL"}
          </Link>
        </header>

        <section style={{ display: "flex", gap: "40px", marginBottom: "80px", flexWrap: "wrap" }}>
          <div style={statCardS}><p style={labelS}>WSPÓLNE KILOMETRY</p><h2 style={{ fontSize: "5rem", color: "#00d4ff", margin: 0 }}>{totalKm.toFixed(1)} km</h2></div>
          <div style={statCardS}><p style={labelS}>TOP 3 DYSTANS</p>{overallLeaderboard.map((u, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}><span>{u.display_name}</span><span style={{ fontWeight: 900, color: "#00d4ff" }}>{u.total_km.toFixed(1)} km</span></div>))}</div>
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "3rem", fontWeight: 900 }}>BIEGI</h2>
          <Link href="/admin/races" style={{ background: "#00d4ff", color: "#000", padding: "12px 25px", borderRadius: "10px", fontWeight: 900, textDecoration: "none" }}>+ DODAJ BIEG</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "30px", marginBottom: "80px" }}>
          {races.filter(r => r.race_date >= new Date().toISOString().split('T')[0]).map(r => (
            <Link href={`/races/${r.id}`} key={r.id} style={{ textDecoration: "none" }}>
              <div style={raceCardS}>
                <span style={{ color: "#00d4ff", fontWeight: 900 }}>{r.race_date}</span>
                <h3 style={{ fontSize: "2rem", margin: "10px 0", color: "#fff" }}>{r.title}</h3>
              </div>
            </Link>
          ))}
        </div>

        <footer style={{ textAlign: "center", borderTop: "1px solid #111", paddingTop: "60px", paddingBottom: "40px" }}>
          <p style={{ color: "#444", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase" }}>designed by felipetravels</p>
          <div style={{ margin: "20px 0" }}>
            <p style={{ color: "#666", fontSize: "0.8rem", fontWeight: 700 }}>powered by</p>
            <img src="/krk-airport-logo.png" alt="Logo" style={{ height: "100px", width: "auto" }} />
          </div>
          <p style={{ color: "#333", fontSize: "0.7rem", fontWeight: 700 }}>© {currentYear} Kraków Airport Running Team | All rights reserved</p>
        </footer>
      </main>
    </div>
  );
}

const statCardS = { flex: 1, minWidth: "300px", background: "rgba(15,15,15,0.95)", padding: "40px", borderRadius: "25px", border: "1px solid #222" };
const raceCardS = { background: "#111", padding: "40px", borderRadius: "25px", border: "1px solid #222" };
const labelS = { color: "#444", fontWeight: 900, fontSize: "0.75rem", letterSpacing: "3px", marginBottom: "20px" };