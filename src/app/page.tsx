"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function HomePage() {
  const [totalKm, setTotalKm] = useState(0);
  const [races, setRaces] = useState<any[]>([]);
  const [overallLeaderboard, setOverallLeaderboard] = useState<any[]>([]);
  const [distanceRecords, setDistanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: totalData } = await supabase.from("v_total_team_km").select("total_km").single();
        if (totalData) setTotalKm(totalData.total_km);

        const { data: leaderData } = await supabase.from("v_top_runners_km").select("*").limit(3);
        if (leaderData) setOverallLeaderboard(leaderData);

        const { data: recordsData } = await supabase.from("v_top_times_by_distance").select("*");
        if (recordsData) setDistanceRecords(recordsData);

        const { data: racesData } = await supabase.from("races").select("*").order("race_date", { ascending: true });
        const { data: partData } = await supabase.from("participations").select(`race_id, is_paid, profiles(display_name)`).eq('is_paid', true);

        if (racesData) {
          const combined = racesData.map(race => ({
            ...race,
            paidParticipants: partData?.filter(p => p.race_id === race.id) || []
          }));
          setRaces(combined);
        }
      } catch (err) {
        console.error("Błąd ładowania danych:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const now = new Date().toISOString().split('T')[0];
  const futureRaces = races.filter(r => r.race_date >= now);
  const pastRaces = races.filter(r => r.race_date < now).reverse();

  return (
    <div style={{ 
      minHeight: "100vh", 
      padding: "0 60px", 
      backgroundColor: "#000", 
      color: "#fff",
      // Przywrócenie zdjęcia w tle z przyciemnieniem 85%
      backgroundImage: "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url('/hero.png')",
      backgroundSize: "cover", 
      backgroundPosition: "center",
      backgroundAttachment: "fixed" // Tło zostaje w miejscu podczas przewijania
    }}>
      {/* HEADER - Logo 125px i Navbar */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "40px 0", height: "125px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/logo-kart.png" alt="KART" style={{ height: "125px", marginRight: "30px" }} />
          <div>
            <h1 style={{ fontSize: "3.5rem", fontWeight: 900, margin: 0, color: "#fff", lineHeight: 0.85 }}>Kraków Airport</h1>
            <h1 style={{ fontSize: "3.5rem", fontWeight: 900, margin: 0, color: "#00d4ff", lineHeight: 0.85 }}>Running Team</h1>
          </div>
        </div>
        <nav style={{ display: "flex", gap: "30px", fontWeight: 900, textTransform: "uppercase", alignItems: "center" }}>
          <Link href="/ekipa" style={{ color: "#fff", textDecoration: "none" }}>Ekipa</Link>
          <Link href="/logistyka" style={{ color: "#fff", textDecoration: "none" }}>Logistyka</Link>
          <Link href="/wyniki" style={{ color: "#fff", textDecoration: "none" }}>Wyniki</Link>
          <Link href="/profile" style={{ border: "2px solid #00d4ff", borderRadius: "15px", padding: "10px 30px", background: "rgba(0,0,0,0.6)", color: "#fff", textDecoration: "none" }}>FILIP</Link>
        </nav>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", paddingTop: "80px" }}>
        {/* STATYSTYKI ZESPOŁU I TOPKA OGÓLNA */}
        <section style={{ display: "flex", gap: "80px", marginBottom: "80px" }}>
          <div style={{ flex: 1 }}>
            <p style={labelS}>WSPÓLNE KILOMETRY</p>
            <h2 style={{ fontSize: "6.5rem", fontWeight: 900, color: "#00d4ff", margin: 0, lineHeight: 1 }}>{totalKm.toFixed(1)} km</h2>
          </div>
          <div style={{ flex: 1 }}>
            <p style={labelS}>TOP 3 DYSTANS CAŁKOWITY</p>
            <div style={topBoxS}>
              {overallLeaderboard.map((u, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span>{i+1}. {u.display_name}</span>
                  <span style={{ color: "#00d4ff", fontWeight: 900 }}>{u.total_km.toFixed(1)} km</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REKORDY NA DYSTANSACH */}
        <section style={{ marginBottom: "80px" }}>
          <p style={labelS}>REKORDY NA DYSTANSACH (TOP 3)</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "25px" }}>
            {["5K", "10K", "21K"].map(dist => (
              <div key={dist} style={topBoxS}>
                <h4 style={{ color: "#00d4ff", margin: "0 0 15px 0", letterSpacing: "1px" }}>{dist}</h4>
                {distanceRecords.filter(r => r.distance_class === dist).slice(0, 3).map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", marginBottom: "8px" }}>
                    <span>{r.display_name}</span>
                    <span style={{ fontWeight: 800 }}>{r.time_formatted}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "4rem", fontWeight: 900, margin: 0 }}>BIEGI</h2>
          <Link href="/races/manage" style={addBtnS}>+ ZARZĄDZAJ</Link>
        </div>

        {/* LISTA BIEGÓW */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "30px" }}>
          {futureRaces.map(r => (
            <Link href={`/races/manage?id=${r.id}`} key={r.id} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={cardS}>
                <span style={{ color: "#00d4ff", fontWeight: 900 }}>{r.race_date}</span>
                <h3 style={{ fontSize: "2.3rem", fontWeight: 900, margin: "10px 0" }}>{r.title}</h3>
                <div style={{ borderTop: "1px solid #333", marginTop: "20px", paddingTop: "20px" }}>
                  <p style={{ fontSize: "0.8rem", color: "#666", fontWeight: 900, marginBottom: "12px" }}>OPŁACILI START:</p>
                  {r.paidParticipants.map((p: any, i: number) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontWeight: 700 }}>{p.profiles?.display_name}</span>
                      <span style={{ color: "#00d4ff", fontWeight: 900, fontSize: "0.7rem" }}>OK</span>
                    </div>
                  ))}
                  {r.paidParticipants.length === 0 && <span style={{ color: "#444" }}>Oczekiwanie na wpłaty</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer style={{ textAlign: "center", marginTop: "150px", paddingBottom: "80px", borderTop: "1px solid #111", paddingTop: "60px" }}>
        <img src="/krk-airport-logo.png" alt="Kraków Airport" style={{ height: "100px", opacity: 0.4, marginBottom: "20px" }} />
        <p style={{ color: "#444", fontWeight: 900, fontSize: "1rem" }}>developed by felipetravels</p>
      </footer>
    </div>
  );
}

// Konfiguracja stylów jako stałe - bezpieczne i czyste
const labelS = { color: "#444", fontWeight: 900, letterSpacing: "3px", marginBottom: "20px" };
const topBoxS = { background: "rgba(255,255,255,0.03)", padding: "30px", borderRadius: "25px", border: "1px solid #1a1a1a" };
const cardS = { background: "rgba(255,255,255,0.04)", padding: "45px", borderRadius: "35px", border: "1px solid #1a1a1a", backdropFilter: "blur(10px)", cursor: "pointer" };
const addBtnS = { background: "#00d4ff", color: "#000", padding: "18px 45px", borderRadius: "15px", fontWeight: 900, textDecoration: "none" };