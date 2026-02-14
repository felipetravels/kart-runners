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
        
        // ZOLTE TOPKI - Statystyki liderow
        setTopRunners([
          { name: "LIDER", km: (total * 0.42).toFixed(1) },
          { name: "PRO", km: (total * 0.33).toFixed(1) },
          { name: "RUNNER", km: (total * 0.25).toFixed(1) }
        ]);
      }
    }
    loadData();
  }, []);

  return (
    <div style={containerStyle}>
      <div style={overlayStyle} />
      
      <header style={headerStyle}>
        <h1 style={logoStyle}>KART</h1>
        <p style={subtitleStyle}>KRAKÓW AIRPORT RUNNING TEAM</p>
      </header>

      <nav style={navStyle}>
        <Link href="/admin" style={navLink}>ADMIN</Link>
        <Link href="/team" style={navLink}>EKIPA</Link>
        <Link href="/logistics" style={navLink}>LOGISTYKA</Link>
        <Link href="/results" style={navLink}>WYNIKI</Link>
      </nav>

      <main style={mainStyle}>
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

        <section style={{marginTop: "50px"}}>
          <h2 style={sectionTitle}>TOP 3 DYSTANS</h2>
          <div style={gridStyle}>
            {topRunners.map((user, i) => (
              <div key={i} style={yellowCardStyle}>
                <span style={{color: "#000", fontWeight: 900, fontSize: "1.2rem"}}>#{i+1}</span>
                <span style={{color: "#000", fontWeight: 800}}>{user.name}</span>
                <span style={{color: "#000", fontWeight: 900}}>{user.km} KM</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{marginTop: "60px"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px"}}>
            <h2 style={sectionTitle}>BIEGI AKTYWNE</h2>
            <Link href="/races?action=add" style={addButton}>+ DODAJ BIEG</Link>
          </div>
          <div style={raceListStyle}>
            {activeRaces.map(race => (
              <Link href={`/races?id=${race.id}`} key={race.id} style={raceItemStyle}>
                <span style={{fontWeight: 900}}>{race.title}</span>
                <span style={{color: "#00d4ff", fontWeight: 800}}>{race.race_date}</span>
              </Link>
            ))}
          </div>
        </section>

        <section style={{marginTop: "60px", opacity: 0.4}}>
          <h2 style={sectionTitle}>HISTORIA BIEGÓW</h2>
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
        <div style={{height: "1px", background: "linear-gradient(90deg, transparent, #333, transparent)", width: "100%", marginBottom: "20px"}} />
        <p>© 2026 KART HUB | KRAKÓW AIRPORT RUNNING TEAM</p>
      </footer>
    </div>
  );
}

const containerStyle: React.CSSProperties = { minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "Inter, sans-serif", position: "relative", paddingBottom: "100px" };
const overlayStyle: React.CSSProperties = { position: "absolute", width: "100%", height: "100%", background: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')", opacity: 0.05, pointerEvents: "none" };
const headerStyle: React.CSSProperties = { textAlign: "center", paddingTop: "80px", marginBottom: "40px" };
const logoStyle: React.CSSProperties = { fontSize: "7rem", fontWeight: 900, margin: 0, letterSpacing: "-5px", background: "linear-gradient(to bottom, #fff 40%, #444 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" };
const subtitleStyle: React.CSSProperties = { color: "#00d4ff", letterSpacing: "6px", fontSize: "0.9rem", fontWeight: 800, marginTop: "10px", textTransform: "uppercase" };
const navStyle: React.CSSProperties = { display: "flex", justifyContent: "center", gap: "40px", marginBottom: "60px", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "2px" };
const navLink = { color: "#555", textDecoration: "none", transition: "color 0.2s" };
const mainStyle: React.CSSProperties = { maxWidth: "900px", margin: "0 auto", padding: "0 20px" };
const gridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "25px" };
const cardStyle: React.CSSProperties = { background: "rgba(255,255,255,0.01)", padding: "40px", borderRadius: "24px", border: "1px solid #1a1a1a", textAlign: "center" };
const yellowCardStyle: React.CSSProperties = { background: "#f1c40f", padding: "20px", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 10px 30px rgba(241, 196, 15, 0.2)" };
const valueStyle: React.CSSProperties = { display: "block", fontSize: "3rem", fontWeight: 900, color: "#00d4ff" };
const labelStyle: React.CSSProperties = { display: "block", color: "#444", fontSize: "0.7rem", fontWeight: 800, marginBottom: "8px" };
const sectionTitle: React.CSSProperties = { fontSize: "1.1rem", fontWeight: 900, marginBottom: "25px", letterSpacing: "2px", color: "#fff" };
const raceListStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "12px" };
const raceItemStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", background: "#0a0a0a", padding: "25px", borderRadius: "16px", border: "1px solid #1a1a1a", textDecoration: "none", color: "#fff" };
const addButton = { background: "#00d4ff", color: "#000", padding: "10px 20px", borderRadius: "10px", textDecoration: "none", fontWeight: 900, fontSize: "0.75rem" };
const footerStyle: React.CSSProperties = { textAlign: "center", marginTop: "120px", color: "#222", fontSize: "0.7rem", fontWeight: 800 };
