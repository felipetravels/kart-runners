"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function HomePage() {
  const [stats, setStats] = useState({ total_km: 0, count: 0 });
  const [activeRaces, setActiveRaces] = useState<any[]>([]);
  const [pastRaces, setPastRaces] = useState<any[]>([]);
  const [topRunners, setTopRunners] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: races } = await supabase.from("races").select("*").order("race_date", { ascending: true });
      
      if (races) {
        const now = new Date().toISOString().split('T')[0];
        setActiveRaces(races.filter(r => r.race_date >= now));
        setPastRaces(races.filter(r => r.race_date < now).reverse());

        const total = races.reduce((acc: number, r: any) => {
          const dist = parseFloat(r.description?.replace(/[^\d.]/g, "") || "0");
          return acc + (isNaN(dist) ? 0 : dist);
        }, 0);
        setStats({ total_km: total, count: races.length });
        
        // Statystyka TOP 3 (Przykładowa logika - można rozbudować o tabelę uczestników)
        setTopRunners([
          { name: "TOP 1", km: (total * 0.4).toFixed(0) },
          { name: "TOP 2", km: (total * 0.3).toFixed(0) },
          { name: "TOP 3", km: (total * 0.2).toFixed(0) }
        ]);
      }
    }
    loadData();
  }, []);

  return (
    <div style={containerStyle}>
      <div style={overlayStyle} />
      
      {/* HEADER / LOGO */}
      <header style={headerStyle}>
        <h1 style={logoStyle}>KART</h1>
        <p style={subtitleStyle}>KRAKÓW AIRPORT RUNNING TEAM</p>
      </header>

      {/* NAV PANEL */}
      <nav style={navStyle}>
        <Link href="/admin" style={navLink}>ADMIN</Link>
        <Link href="/team" style={navLink}>EKIPA</Link>
        <Link href="/logistics" style={navLink}>LOGISTYKA</Link>
        <Link href="/results" style={navLink}>WYNIKI</Link>
      </nav>

      <main style={mainStyle}>
        {/* STATS OVERVIEW */}
        <section style={gridStyle}>
          <div style={cardStyle}>
            <span style={labelStyle}>ŁĄCZNY DYSTANS</span>
            <span style={valueStyle}>{stats.total_km} KM</span>
          </div>
          <div style={cardStyle}>
            <span style={labelStyle}>WSPÓLNE STARTY</span>
            <span style={valueStyle}>{stats.count}</span>
          </div>
        </section>

        {/* TOP RUNNERS */}
        <section style={{marginTop: "40px"}}>
          <h2 style={sectionTitle}>TOP KM</h2>
          <div style={gridStyle}>
            {topRunners.map((user, i) => (
              <div key={i} style={miniCardStyle}>
                <span style={{color: "#00d4ff", fontWeight: 900}}># {i+1}</span>
                <span style={{color: "#fff"}}> {user.name}</span>
                <span style={{color: "#666", fontSize: "0.8rem"}}> {user.km} KM</span>
              </div>
            ))}
          </div>
        </section>

        {/* ACTIVE RACES */}
        <section style={{marginTop: "50px"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <h2 style={sectionTitle}>BIEGI AKTYWNE</h2>
            <Link href="/races?action=add" style={addButton}>+ DODAJ BIEG</Link>
          </div>
          <div style={raceListStyle}>
            {activeRaces.map(race => (
              <Link href={`/races?id=${race.id}`} key={race.id} style={raceItemStyle}>
                <span style={{fontWeight: 900}}>{race.title}</span>
                <span style={{color: "#00d4ff"}}>{race.race_date}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* PAST RACES */}
        <section style={{marginTop: "50px", opacity: 0.6}}>
          <h2 style={sectionTitle}>BIEGI NIEAKTYWNE</h2>
          <div style={raceListStyle}>
            {pastRaces.slice(0, 3).map(race => (
              <div key={race.id} style={raceItemStyle}>
                <span>{race.title}</span>
                <span>{race.race_date}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer style={footerStyle}>
        <div style={{height: "1px", background: "#222", width: "100%", marginBottom: "20px"}} />
        <p>© 2026 KART HUB | KRAKÓW AIRPORT RUNNING TEAM</p>
      </footer>
    </div>
  );
}

const containerStyle: React.CSSProperties = { minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "Inter, sans-serif", position: "relative", paddingBottom: "100px" };
const overlayStyle: React.CSSProperties = { position: "absolute", width: "100%", height: "100%", background: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')", opacity: 0.05, pointerEvents: "none" };
const headerStyle: React.CSSProperties = { textAlign: "center", paddingTop: "80px", marginBottom: "40px" };
const logoStyle: React.CSSProperties = { fontSize: "6rem", fontWeight: 900, margin: 0, letterSpacing: "-4px", background: "linear-gradient(to bottom, #fff 40%, #444 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" };
const subtitleStyle: React.CSSProperties = { color: "#00d4ff", letterSpacing: "5px", fontSize: "0.9rem", fontWeight: 700, marginTop: "10px" };
const navStyle: React.CSSProperties = { display: "flex", justifyContent: "center", gap: "30px", marginBottom: "60px", fontWeight: 800, fontSize: "0.8rem", letterSpacing: "2px" };
const navLink = { color: "#555", textDecoration: "none", transition: "color 0.2s" };
const mainStyle: React.CSSProperties = { maxWidth: "1000px", margin: "0 auto", padding: "0 20px" };
const gridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" };
const cardStyle: React.CSSProperties = { background: "#0a0a0a", padding: "30px", borderRadius: "20px", border: "1px solid #1a1a1a", textAlign: "center" };
const valueStyle: React.CSSProperties = { display: "block", fontSize: "2.5rem", fontWeight: 900, color: "#00d4ff" };
const labelStyle: React.CSSProperties = { display: "block", color: "#444", fontSize: "0.7rem", fontWeight: 800, marginBottom: "5px" };
const sectionTitle: React.CSSProperties = { fontSize: "1.2rem", fontWeight: 900, marginBottom: "20px", letterSpacing: "1px" };
const miniCardStyle: React.CSSProperties = { background: "#080808", padding: "15px 20px", borderRadius: "12px", border: "1px solid #151515", display: "flex", justifyContent: "space-between" };
const raceListStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "10px" };
const raceItemStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", background: "#0a0a0a", padding: "20px", borderRadius: "12px", border: "1px solid #1a1a1a", textDecoration: "none", color: "#fff" };
const addButton = { background: "#00d4ff", color: "#000", padding: "8px 15px", borderRadius: "8px", textDecoration: "none", fontWeight: 900, fontSize: "0.8rem" };
const footerStyle: React.CSSProperties = { textAlign: "center", marginTop: "100px", color: "#333", fontSize: "0.7rem", fontWeight: 800 };
