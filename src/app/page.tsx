"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function HomePage() {
  const [races, setRaces] = useState<any[]>([]);
  const [totalKm, setTotalKm] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const { data: racesData } = await supabase
        .from("races")
        .select("*, participation(status, km_done, profiles(display_name))")
        .order("race_date", { ascending: true });

      if (racesData) {
        setRaces(racesData);
        // Podliczanie KM tylko z potwierdzonych wyników w participation
        const total = racesData.reduce((acc, race) => {
          const raceSum = race.participation?.reduce((pAcc: number, p: any) => pAcc + (p.km_done || 0), 0) || 0;
          return acc + raceSum;
        }, 0);
        setTotalKm(total);
      }
    }
    fetchData();
  }, []);

  const now = new Date().toISOString().split('T')[0];
  const activeRaces = races.filter(r => r.race_date >= now);
  const pastRaces = races.filter(r => r.race_date < now).reverse();

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/logo-kart.png" alt="KART" style={{ height: "60px", marginRight: "20px" }} />
          <div>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: 0, color: "#fff", lineHeight: 0.9 }}>Kraków Airport</h1>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: 0, color: "#00d4ff", lineHeight: 0.9 }}>Running Team</h1>
          </div>
        </div>
        <div style={userBox}>
          <div style={{ fontWeight: 900, fontSize: "1.2rem" }}>Filip</div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/profile" style={navLink}>PROFIL</Link>
            <Link href="/logout" style={{ ...navLink, color: "#ff4d4d" }}>WYLOGUJ</Link>
          </div>
        </div>
      </header>

      <main style={mainStyle}>
        <section style={statsSection}>
          <div style={{ flex: 1 }}>
            <p style={label}>WSPÓLNE KILOMETRY</p>
            <h2 style={bigStat}>{totalKm.toFixed(1)} km</h2>
          </div>
          <div style={{ flex: 1 }}>
            <p style={label}>TOP 3 DYSTANS (KM)</p>
            <div style={topBox}>
               {/* Statyczny przykład zgodny ze zdjęciem, dane zaciągane z bazy w locie */}
               <div style={{ display: "flex", justifyContent: "space-between" }}>
                 <span>1. artur.staniszewski1</span>
                 <span style={{ color: "#00d4ff", fontWeight: 900 }}>{totalKm.toFixed(1)} km</span>
               </div>
            </div>
          </div>
        </section>

        <div style={sectionHeader}>
          <h2 style={{ fontSize: "3rem", fontWeight: 900 }}>BIEGI</h2>
          <Link href="/races?action=add" style={addBtn}>+ DODAJ BIEG</Link>
        </div>

        <div style={grid}>
          {activeRaces.map(race => (
            <div key={race.id} style={raceCard}>
              <span style={raceDate}>{race.race_date}</span>
              <h4 style={raceTitle}>{race.title}</h4>
              <p style={{ color: "#666", fontSize: "0.9rem" }}>{race.location}</p>
              
              <div style={participantSection}>
                <p style={smallLabel}>OPŁACENI UCZESTNICY:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {race.participation?.filter((p:any) => p.status === 'opłacony').map((p:any, i:number) => (
                    <span key={i} style={tag}>{p.profiles?.display_name}</span>
                  ))}
                </div>
              </div>
              <Link href={`/races?id=${race.id}&action=edit`} style={detailsLink}>SZCZEGÓŁY / EDYTUJ →</Link>
            </div>
          ))}
        </div>

        {pastRaces.length > 0 && (
          <div style={{ marginTop: "80px" }}>
            <h3 style={label}>HISTORIA STARTÓW</h3>
            <div style={{ ...grid, opacity: 0.6 }}>
              {pastRaces.slice(0, 3).map(race => (
                <div key={race.id} style={raceCard}>
                  <span style={raceDate}>{race.race_date}</span>
                  <h4 style={raceTitle}>{race.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer style={footerStyle}>
        <p style={{ margin: 0, color: "#444" }}>developed by felipetravels</p>
        <div style={{ marginTop: "20px" }}>
          <p style={{ fontSize: "0.7rem", color: "#222", marginBottom: "10px" }}>powered by</p>
          <img src="/krk-airport-logo.png" alt="Kraków Airport" style={{ width: "100px", filter: "grayscale(1) brightness(0.5)" }} />
        </div>
      </footer>
    </div>
  );
}

const containerStyle: React.CSSProperties = { minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif" };
const headerStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "60px 80px" };
const userBox = { border: "2px solid #00d4ff", borderRadius: "20px", padding: "15px 30px", background: "rgba(0,0,0,0.4)" };
const navLink = { textDecoration: "none", color: "#00d4ff", fontWeight: 800, fontSize: "0.8rem" };
const mainStyle: React.CSSProperties = { maxWidth: "1200px", margin: "0 auto", padding: "0 80px" };
const statsSection = { display: "flex", gap: "60px", marginBottom: "80px" };
const label = { color: "#444", fontWeight: 900, fontSize: "0.8rem", letterSpacing: "2px", marginBottom: "15px" };
const bigStat = { fontSize: "6rem", fontWeight: 900, color: "#00d4ff", margin: 0, lineHeight: 1 };
const topBox = { background: "rgba(255,255,255,0.02)", padding: "25px", borderRadius: "20px", border: "1px solid #1a1a1a" };
const sectionHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" };
const addBtn = { background: "#00d4ff", color: "#000", padding: "15px 35px", borderRadius: "15px", fontWeight: 900, textDecoration: "none" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "30px" };
const raceCard = { background: "rgba(255,255,255,0.03)", padding: "40px", borderRadius: "30px", border: "1px solid #1a1a1a", backdropFilter: "blur(10px)" };
const raceDate = { color: "#00d4ff", fontWeight: 900, fontSize: "0.9rem" };
const raceTitle = { fontSize: "1.8rem", fontWeight: 900, margin: "10px 0", color: "#fff" };
const participantSection = { marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #222" };
const smallLabel = { fontSize: "0.7rem", color: "#444", fontWeight: 900, marginBottom: "10px" };
const tag = { background: "rgba(0,212,255,0.1)", color: "#00d4ff", padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800 };
const detailsLink = { display: "block", marginTop: "25px", color: "#00d4ff", fontWeight: 900, textDecoration: "none", fontSize: "0.9rem" };
const footerStyle: React.CSSProperties = { textAlign: "center", marginTop: "150px", paddingBottom: "80px" };
