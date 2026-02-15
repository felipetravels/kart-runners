"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function HomePage() {
  const [totalKm, setTotalKm] = useState(0);
  const [races, setRaces] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Pobieramy całkowity dystans zespołu
        const { data: totalData } = await supabase
          .from("v_total_team_km")
          .select("total_km")
          .single();
        if (totalData) setTotalKm(totalData.total_km);

        // 2. Pobieramy ranking zawodników (Topki)
        const { data: leaderData } = await supabase
          .from("v_user_totals")
          .select("*")
          .order("total_km", { ascending: false })
          .limit(3);
        if (leaderData) setLeaderboard(leaderData);

        // 3. Pobieramy biegi
        const { data: racesData } = await supabase
          .from("races")
          .select("*")
          .order("race_date", { ascending: true });

        // 4. Pobieramy uczestników z imionami
        const { data: partData } = await supabase
          .from("participations")
          .select(`
            race_id,
            is_paid,
            profiles (
              display_name
            )
          `);

        if (racesData) {
          const combined = racesData.map(race => ({
            ...race,
            participants: partData?.filter(p => p.race_id === race.id && p.is_paid === true) || []
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
      backgroundImage: "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url('/hero.png')", 
      backgroundSize: "cover", 
      backgroundAttachment: "fixed",
      backgroundColor: "#000",
      color: "#fff" 
    }}>
      {/* HEADER - Przywrócone Menu i Logo */}
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: "40px 0",
        marginBottom: "60px"
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/logo-kart.png" alt="KART" style={{ height: "125px", marginRight: "30px" }} />
          <div>
            <h1 style={{ fontSize: "3.5rem", fontWeight: 900, margin: 0, color: "#fff", lineHeight: 0.85 }}>Kraków Airport</h1>
            <h1 style={{ fontSize: "3.5rem", fontWeight: 900, margin: 0, color: "#00d4ff", lineHeight: 0.85 }}>Running Team</h1>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "50px" }}>
          <nav style={{ display: "flex", gap: "30px", fontWeight: 900, fontSize: "1rem", textTransform: "uppercase", letterSpacing: "1px" }}>
            <Link href="/ekipa" style={{ color: "#fff", textDecoration: "none" }}>Ekipa</Link>
            <Link href="/logistyka" style={{ color: "#fff", textDecoration: "none" }}>Logistyka</Link>
            <Link href="/wyniki" style={{ color: "#fff", textDecoration: "none" }}>Wyniki</Link>
          </nav>
          
          <div style={{ border: "2px solid #00d4ff", borderRadius: "20px", padding: "15px 40px", background: "rgba(0,0,0,0.6)", textAlign: "right" }}>
            <div style={{ fontWeight: 900, fontSize: "1.4rem", color: "#fff" }}>Filip</div>
            <Link href="/profile" style={{ fontSize: "0.9rem", color: "#00d4ff", textDecoration: "none", fontWeight: 800 }}>PROFIL</Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", paddingTop: "40px" }}>
        
        {/* STATYSTYKI I TOPKA */}
        <section style={{ display: "flex", gap: "80px", marginBottom: "80px" }}>
          <div style={{ flex: 1 }}>
            <p style={labelStyle}>WSPÓLNE KILOMETRY</p>
            <h2 style={{ fontSize: "6.5rem", fontWeight: 900, color: "#00d4ff", margin: 0, lineHeight: 1 }}>
              {totalKm.toFixed(1)} km
            </h2>
          </div>
          <div style={{ flex: 1 }}>
            <p style={labelStyle}>TOP 3 DYSTANS (KM)</p>
            <div style={topBoxStyle}>
              {leaderboard.map((user, index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", fontSize: "1.3rem", marginBottom: index !== leaderboard.length - 1 ? "15px" : 0 }}>
                  <span style={{ fontWeight: 700 }}>{index + 1}. {user.display_name}</span>
                  <span style={{ color: "#00d4ff", fontWeight: 900 }}>{user.total_km.toFixed(1)} km</span>
                </div>
              ))}
              {leaderboard.length === 0 && <span style={{ color: "#444" }}>Brak wyników</span>}
            </div>
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "50px" }}>
          <h2 style={{ fontSize: "4.5rem", fontWeight: 900, color: "#fff", margin: 0 }}>BIEGI</h2>
          <Link href="/races?action=add" style={addBtnStyle}>+ DODAJ BIEG</Link>
        </div>

        {/* LISTA BIEGÓW NADCHODZĄCYCH */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "30px" }}>
          {futureRaces.map(r => (
            <div key={r.id} style={cardStyle}>
              <span style={{ color: "#00d4ff", fontWeight: 900, fontSize: "1.1rem" }}>{r.race_date}</span>
              <h4 style={{ fontSize: "2.3rem", fontWeight: 900, margin: "10px 0", color: "#fff", lineHeight: 1 }}>{r.title}</h4>
              <div style={{ borderTop: "1px solid #333", marginTop: "20px", paddingTop: "20px" }}>
                <p style={{ fontSize: "0.8rem", color: "#bbb", fontWeight: 900, marginBottom: "15px" }}>UCZESTNICY (OPŁACONE):</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {r.participants?.map((p:any, i:number) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>
                        {p.profiles?.display_name || "Zawodnik"}
                      </span>
                      <span style={{ background: "#00d4ff", color: "#000", fontSize: "0.6rem", fontWeight: 900, padding: "2px 8px", borderRadius: "4px" }}>OPŁACONE</span>
                    </div>
                  ))}
                  {r.participants?.length === 0 && <span style={{ color: "#444" }}>Brak opłaconych startów</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MINIONE BIEGI */}
        {pastRaces.length > 0 && (
          <div style={{ marginTop: "120px" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 900, color: "#fff", marginBottom: "30px" }}>MINIONE BIEGI</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "30px", opacity: 0.6 }}>
              {pastRaces.map(r => (
                <div key={r.id} style={cardStyle}>
                  <span style={{ color: "#666", fontWeight: 900 }}>{r.race_date}</span>
                  <h4 style={{ fontSize: "1.8rem", fontWeight: 900, margin: "10px 0", color: "#fff" }}>{r.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer style={{ textAlign: "center", marginTop: "150px", paddingBottom: "80px" }}>
        <img src="/krk-airport-logo.png" alt="Kraków Airport" style={{ height: "100px", opacity: 0.4, marginBottom: "20px" }} />
        <p style={{ color: "#444", fontWeight: 900, fontSize: "1rem" }}>developed by felipetravels</p>
      </footer>
    </div>
  );
}

const labelStyle = { color: "#444", fontWeight: 900, fontSize: "1rem", letterSpacing: "3px", marginBottom: "20px" };
const topBoxStyle = { background: "rgba(255,255,255,0.03)", padding: "35px", borderRadius: "25px", border: "1px solid #1a1a1a" };
const cardStyle = { background: "rgba(255,255,255,0.04)", padding: "45px", borderRadius: "35px", border: "1px solid #1a1a1a", backdropFilter: "blur(10px)" };
const addBtnStyle = { background: "#00d4ff", color: "#000", padding: "18px 45px", borderRadius: "15px", fontWeight: 900, textDecoration: "none", fontSize: "1.1rem" };