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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: prof } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
          if (prof) setUserName(prof.display_name);
        }
        const { data: totalData } = await supabase.from("v_total_team_km").select("total_km").single();
        if (totalData) setTotalKm(totalData.total_km);
        const { data: leaderData } = await supabase.from("v_top_runners_km").select("*").limit(3);
        if (leaderData) setOverallLeaderboard(leaderData);
        const { data: recordsData } = await supabase.from("v_top_times_by_distance").select("*");
        if (recordsData) setDistanceRecords(recordsData);
        const { data: racesData } = await supabase.from("races").select("*").order("race_date", { ascending: true });
        const { data: partData } = await supabase.from("participations").select(`race_id, display_name`).eq('is_paid', true);
        if (racesData) {
          const combined = racesData.map(race => ({ ...race, paidParticipants: partData?.filter(p => p.race_id === race.id) || [] }));
          setRaces(combined);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
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
    <div style={{ minHeight: "100vh", backgroundColor: "#000", color: "#fff", backgroundImage: "linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url('/hero.png')", backgroundSize: "cover", backgroundAttachment: "fixed" }}>
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 20px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "40px 0", marginBottom: "40px" }}>
          <div>
            <h1 style={{ fontSize: "3.5rem", fontWeight: 900, margin: 0, color: "#fff", lineHeight: 0.85 }}>Kraków Airport</h1>
            <h1 style={{ fontSize: "3.5rem", fontWeight: 900, margin: 0, color: "#00d4ff", lineHeight: 0.85 }}>Running Team</h1>
          </div>
          <Link href="/profile" style={{ border: "2px solid #00d4ff", borderRadius: "15px", padding: "10px 30px", background: "rgba(0,0,0,0.6)", color: "#fff", textDecoration: "none", fontWeight: 900 }}>{userName ? userName.toUpperCase() : "PROFIL"}</Link>
        </header>
        {/* ... reszta sekcji statystyk i biegów pozostaje bez zmian ... */}
        <footer style={{ marginTop: "120px", textAlign: "center", borderTop: "1px solid #111", paddingTop: "60px", paddingBottom: "40px" }}>
           <p style={{ color: "#444", fontSize: "0.7rem", fontWeight: 900, letterSpacing: "2px", marginBottom: "20px" }}>designed by felipetravels</p>
           <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px", marginBottom: "30px" }}>
             <p style={{ color: "#666", fontSize: "0.8rem", fontWeight: 700 }}>powered by</p>
             <img src="/krk-airport-logo.png" alt="Kraków Airport" style={{ height: "100px", width: "auto" }} />
           </div>
           <p style={{ color: "#333", fontSize: "0.7rem", fontWeight: 700 }}>© {currentYear} Kraków Airport Running Team | All rights reserved</p>
        </footer>
      </main>
    </div>
  );
}
const labelS = { color: "#444", fontWeight: 900, letterSpacing: "3px", marginBottom: "20px", fontSize: "0.8rem" };
const topBoxS = { background: "rgba(255,255,255,0.03)", padding: "25px", borderRadius: "20px", border: "1px solid #111" };
const cardS = { background: "rgba(255,255,255,0.04)", padding: "40px", borderRadius: "30px", border: "1px solid #111" };
const addBtnS = { background: "#00d4ff", color: "#000", padding: "12px 25px", borderRadius: "10px", fontWeight: 900, textDecoration: "none", fontSize: "0.8rem" };