"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function HomePage() {
  const [totalKm, setTotalKm] = useState(0);
  const [races, setRaces] = useState<any[]>([]);
  const [distanceRecords, setDistanceRecords] = useState<any[]>([]);
  const [overallLeaderboard, setOverallLeaderboard] = useState<any[]>([]);
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
        const { data: partData } = await supabase.from("participations").select(`race_id, display_name`).eq('is_paid', true);

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

  // Funkcja obliczająca tempo (min/km)
  const calculatePace = (seconds: number, distClass: string) => {
    let dist = 0;
    if (distClass === "5K") dist = 5;
    else if (distClass === "10K") dist = 10;
    else if (distClass === "HALF") dist = 21.0975;
    else if (distClass === "MARATHON") dist = 42.195;
    
    if (dist === 0 || !seconds) return null;
    const paceTotalSecs = seconds / dist;
    const mins = Math.floor(paceTotalSecs / 60);
    const secs = Math.round(paceTotalSecs % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000", color: "#fff", backgroundImage: "linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url('/hero.png')", backgroundSize: "cover", backgroundAttachment: "fixed" }}>
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 20px" }}>
        
        {/* STATYSTYKI ZESPOŁU */}
        <section style={{ display: "flex", gap: "40px", flexWrap: "wrap", marginBottom: "80px" }}>
          <div style={{ flex: 1, minWidth: "300px" }}>
            <p style={labelS}>WSPÓLNE KILOMETRY</p>
            <h2 style={{ fontSize: "5.5rem", fontWeight: 900, color: "#00d4ff", margin: 0, lineHeight: 1 }}>{totalKm.toFixed(1)} km</h2>
          </div>
          <div style={{ flex: 1, minWidth: "300px" }}>
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

        {/* REKORDY Z TEMPEM */}
        <section style={{ marginBottom: "80px" }}>
          <p style={labelS}>REKORDY NA DYSTANSACH (TOP 3)</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            {[
              { key: "5K", label: "5K" },
              { key: "10K", label: "10K" },
              { key: "HALF", label: "Półmaraton" },
              { key: "MARATHON", label: "Maraton" }
            ].map(dist => (
              <div key={dist.key} style={topBoxS}>
                <h4 style={{ color: "#00d4ff", margin: "0 0 15px 0", letterSpacing: "1px" }}>{dist.label}</h4>
                {distanceRecords
                  .filter(r => r.distance_class === dist.key)
                  .slice(0, 3)
                  .map((r, i) => (
                    <div key={i} style={{ marginBottom: "10px", paddingBottom: "5px", borderBottom: "1px solid #222" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                        <span>{r.display_name}</span>
                        <span style={{ fontWeight: 800 }}>{r.time_formatted}</span>
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#666", textAlign: "right" }}>
                        Tempo: {calculatePace(r.time_seconds, dist.key)} min/km
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </section>

        {/* BIEGI NADCHODZĄCE */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "3rem", fontWeight: 900, margin: 0 }}>BIEGI</h2>
          <Link href="/admin/races" style={addBtnS}>+ ZARZĄDZAJ / DODAJ</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "30px", marginBottom: "60px" }}>
          {futureRaces.map(r => (
            <Link href={`/races/${r.id}`} key={r.id} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={cardS}>
                <span style={{ color: "#00d4ff", fontWeight: 900 }}>{r.race_date}</span>
                <h3 style={{ fontSize: "2rem", fontWeight: 900, margin: "10px 0", color: "#fff" }}>{r.title}</h3>
                <div style={{ borderTop: "1px solid #222", marginTop: "20px", paddingTop: "20px" }}>
                  <p style={{ fontSize: "0.7rem", color: "#444", fontWeight: 900, marginBottom: "10px" }}>OPŁACILI START:</p>
                  {r.paidParticipants.map((p: any, i: number) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "0.8rem" }}>
                      <span>{p.display_name}</span>
                      <span style={{ color: "#00ff88", fontWeight: 900 }}>OK</span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* BIEGI PRZESZŁE */}
        {pastRaces.length > 0 && (
          <>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "30px", color: "#444" }}>BIEGI MINIONE</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "30px", opacity: 0.6 }}>
              {pastRaces.map(r => (
                <Link href={`/races/${r.id}`} key={r.id} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={cardS}>
                    <span style={{ color: "#666", fontWeight: 900 }}>{r.race_date}</span>
                    <h3 style={{ fontSize: "1.8rem", fontWeight: 900, margin: "10px 0", color: "#fff" }}>{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* LOGO NA DOLE */}
        <div style={{ marginTop: "100px", textAlign: "center", borderTop: "1px solid #111", paddingTop: "50px" }}>
           <img src="/logo-kart.png" alt="Kraków Airport Running Team" style={{ height: "80px", opacity: 0.3 }} />
        </div>
      </main>
    </div>
  );
}

const labelS = { color: "#444", fontWeight: 900, letterSpacing: "3px", marginBottom: "20px", fontSize: "0.8rem" };
const topBoxS = { background: "rgba(255,255,255,0.03)", padding: "25px", borderRadius: "20px", border: "1px solid #111" };
const cardS = { background: "rgba(255,255,255,0.04)", padding: "40px", borderRadius: "30px", border: "1px solid #111" };
const addBtnS = { background: "#00d4ff", color: "#000", padding: "12px 25px", borderRadius: "10px", fontWeight: 900, textDecoration: "none", fontSize: "0.8rem" };