"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import HomeLeaderboards from "./HomeLeaderboards";

export default function HomePage() {
  const [totalKm, setTotalKm] = useState(0);
  const [races, setRaces] = useState<any[]>([]);
  const [distanceRecords, setDistanceRecords] = useState<any[]>([]);
  const [overallLeaderboard, setOverallLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Pobieranie sumy kilometrów
        const { data: totalData } = await supabase.from("v_total_team_km").select("total_km").single();
        if (totalData) setTotalKm(totalData.total_km);

        // 2. Top 3 biegaczy
        const { data: leaderData } = await supabase.from("v_top_runners_km").select("*").limit(3);
        if (leaderData) setOverallLeaderboard(leaderData);

        // 3. Rekordy na dystansach - pobieranie z widoku SQL
        const { data: recordsData } = await supabase.from("v_top_times_by_distance").select("*");
        if (recordsData) setDistanceRecords(recordsData);

        // 4. Nadchodzące biegi i opłaceni uczestnicy z tabeli participations
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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000", padding: "0 20px" }}>
      <main style={{ maxWidth: "1200px", margin: "0 auto", paddingTop: "40px" }}>
        
        {/* STATYSTYKI ZESPOŁU */}
        <section style={{ display: "flex", gap: "40px", flexWrap: "wrap", marginBottom: "60px" }}>
          <div style={{ flex: 1, minWidth: "300px" }}>
            <p style={labelS}>WSPÓLNE KILOMETRY</p>
            <h2 style={{ fontSize: "5.5rem", fontWeight: 900, color: "#00d4ff", margin: 0 }}>{totalKm.toFixed(1)} km</h2>
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

        {/* REKORDY NA DYSTANSACH - Synchronizacja z v_top_times_by_distance */}
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
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "8px" }}>
                      <span>{r.display_name}</span>
                      <span style={{ fontWeight: 800 }}>{r.time_seconds ? `${Math.floor(r.time_seconds / 3600)}h ${Math.floor((r.time_seconds % 3600) / 60)}m` : "---"}</span>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </section>

        {/* LISTA BIEGÓW */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "4rem", fontWeight: 900, margin: 0 }}>BIEGI</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "30px", paddingBottom: "100px" }}>
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
      </main>
    </div>
  );
}

const labelS = { color: "#444", fontWeight: 900, letterSpacing: "3px", marginBottom: "20px", fontSize: "0.8rem" };
const topBoxS = { background: "rgba(255,255,255,0.03)", padding: "25px", borderRadius: "20px", border: "1px solid #111" };
const cardS = { background: "rgba(255,255,255,0.04)", padding: "40px", borderRadius: "30px", border: "1px solid #111" };