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
        const { data: prof } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
        if (prof) setUserName(prof.display_name);
      }
      const { data: totalData } = await supabase.from("v_total_team_km").select("total_km").single();
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

  const now = new Date().toISOString().split('T')[0];
  const futureRaces = races.filter(r => r.race_date >= now);

  return (
    <div style={{ background: "#000" }}>
      {/* HERO SECTION */}
      <section style={{ height: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url('/hero.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div style={{ textAlign: "center", zIndex: 10 }}>
          <h1 style={{ fontSize: "5rem", fontWeight: 900, margin: 0, lineHeight: 0.8 }}>KRAKÓW AIRPORT</h1>
          <h1 style={{ fontSize: "5rem", fontWeight: 900, margin: 0, color: "#00d4ff" }}>RUNNING TEAM</h1>
          <Link href="/profile" style={{ display: "inline-block", marginTop: "30px", padding: "15px 40px", border: "2px solid #00d4ff", color: "#fff", textDecoration: "none", fontWeight: 900, borderRadius: "10px" }}>
            {userName ? userName.toUpperCase() : "TWÓJ PROFIL"}
          </Link>
        </div>
      </section>

      {/* STATS SECTION */}
      <main style={{ maxWidth: "1200px", margin: "-100px auto 0", position: "relative", zIndex: 20, padding: "0 20px" }}>
        <section style={{ display: "flex", gap: "30px", marginBottom: "60px" }}>
          <div style={statCard}>
            <p style={labelS}>WSPÓLNE KILOMETRY</p>
            <h2 style={{ fontSize: "4rem", color: "#00d4ff", margin: 0 }}>{totalKm.toFixed(1)} km</h2>
          </div>
          <div style={statCard}>
            <p style={labelS}>TOP 3 DYSTANS</p>
            {overallLeaderboard.map((u, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "5px" }}>
                <span>{u.display_name}</span><span>{u.total_km.toFixed(1)} km</span>
              </div>
            ))}
          </div>
        </section>

        <h2 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "30px" }}>NADCHODZĄCE BIEGI</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "25px", paddingBottom: "100px" }}>
          {futureRaces.map(r => (
            <Link href={`/races/${r.id}`} key={r.id} style={{ textDecoration: "none" }}>
              <div style={raceCard}>
                <span style={{ color: "#00d4ff", fontWeight: 900 }}>{r.race_date}</span>
                <h3 style={{ fontSize: "1.8rem", margin: "10px 0", color: "#fff" }}>{r.title}</h3>
                <p style={{ color: "#666", fontSize: "0.8rem" }}>{r.location}</p>
              </div>
            </Link>
          ))}
        </div>

        <footer style={{ textAlign: "center", padding: "60px 0", borderTop: "1px solid #111" }}>
          <p style={{ color: "#444", fontSize: "0.7rem", letterSpacing: "2px" }}>DESIGNED BY FELIPETRAVELS</p>
          <img src="/krk-airport-logo.png" alt="Logo" style={{ height: "80px", marginTop: "20px", filter: "brightness(0.5)" }} />
        </footer>
      </main>
    </div>
  );
}

const statCard = { flex: 1, background: "rgba(10,10,10,0.9)", padding: "40px", borderRadius: "20px", border: "1px solid #222", backdropFilter: "blur(10px)" };
const raceCard = { background: "#111", padding: "30px", borderRadius: "20px", border: "1px solid #222" };
const labelS = { color: "#444", fontWeight: 900, fontSize: "0.7rem", letterSpacing: "2px" };