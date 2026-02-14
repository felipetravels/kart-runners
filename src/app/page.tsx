"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function HomePage() {
  const [stats, setStats] = useState({ total_km: 0, count: 0 });
  const [activeRaces, setActiveRaces] = useState<any[]>([]);
  const [pastRaces, setPastRaces] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: races } = await supabase.from("races").select("*, participation(user_id, status, profiles(display_name))").order("race_date", { ascending: true });
      if (races) {
        const now = new Date().toISOString().split('T')[0];
        setActiveRaces(races.filter(r => r.race_date >= now));
        setPastRaces(races.filter(r => r.race_date < now).reverse());

        const total = races.reduce((acc: number, r: any) => {
          const dist = parseFloat(r.description?.replace(/[^\d.]/g, "") || "0");
          return acc + (isNaN(dist) ? 0 : dist);
        }, 0);
        setStats({ total_km: total, count: races.length });
      }
    }
    loadData();
  }, []);

  return (
    <div style={containerStyle}>
      {/* HERO IMAGE BACKGROUND */}
      <div style={heroBgStyle} />
      <div style={overlayStyle} />
      
      <header style={headerStyle}>
        <h1 style={logoStyle}>KART</h1>
        <p style={subtitleStyle}>KRAKÓW AIRPORT RUNNING TEAM</p>
        <nav style={navStyle}>
          <Link href="/admin" style={navLink}>ADMIN</Link>
          <Link href="/team" style={navLink}>EKIPA</Link>
          <Link href="/logistics" style={navLink}>LOGISTYKA</Link>
          <Link href="/results" style={navLink}>WYNIKI</Link>
        </nav>
      </header>

      <main style={mainStyle}>
        <section style={gridStyle}>
          <div style={cardStyle}>
            <span style={labelStyle}>SUMA PRZEBIEGNIĘTYCH KM</span>
            <span style={valueStyle}>{stats.total_km.toFixed(1)} KM</span>
          </div>
          <div style={cardStyle}>
            <span style={labelStyle}>WSPÓLNE STARTY</span>
            <span style={valueStyle}>{stats.count}</span>
          </div>
        </section>

        {/* RANKINGI TOP 3 */}
        <section style={{marginTop: "50px"}}>
          <h2 style={sectionTitle}>TOP 3 ZAWODNIKÓW (KM)</h2>
          <div style={gridStyle}>
            {['LIDER', 'WICELIDER', 'SPRINTER'].map((name, i) => (
              <div key={i} style={yellowCardStyle}>
                <span style={{fontWeight: 900}}>#{i+1} {name}</span>
                <span style={{fontWeight: 900}}>{(stats.total_km * (0.4 - i*0.1)).toFixed(1)} KM</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{marginTop: "40px"}}>
          <h2 style={sectionTitle}>TOP 3 DYSTANSE</h2>
          <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px"}}>
            {['5KM', '10KM', 'HM', 'M'].map(dist => (
              <div key={dist} style={distCardStyle}>
                <div style={{color: "#f1c40f", fontSize: "0.8rem", fontWeight: 900}}>{dist}</div>
                <div style={{fontSize: "0.7rem", color: "#666"}}>1. ZAWODNIK<br/>2. ZAWODNIK<br/>3. ZAWODNIK</div>
              </div>
            ))}
          </div>
        </section>

        {/* BIEGI AKTYWNE + ZAWODNICY */}
        <section style={{marginTop: "60px"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
            <h2 style={sectionTitle}>BIEGI AKTYWNE</h2>
            <Link href="/races?action=add" style={addButton}>+ DODAJ BIEG</Link>
          </div>
          {activeRaces.map(race => (
            <div key={race.id} style={raceBoxStyle}>
              <Link href={`/races?id=${race.id}`} style={{textDecoration: "none", color: "#fff", display: "flex", justifyContent: "space-between"}}>
                <span style={{fontWeight: 900, fontSize: "1.2rem"}}>{race.title}</span>
                <span style={{color: "#00d4ff", fontWeight: 800}}>{race.race_date}</span>
              </Link>
              <div style={participantListStyle}>
                <span style={{color: "#444", marginRight: "10px"}}>OPŁACENI:</span>
                {race.participation?.filter((p:any) => p.status === 'opłacony').map((p:any, i:number) => (
                  <span key={i} style={tagStyle}>{p.profiles?.display_name}</span>
                )) || <span style={{color: "#222"}}>Brak opłaconych zgłoszeń</span>}
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer style={footerStyle}>
        <p style={{fontSize: "0.8rem", color: "#555"}}>developed by felipetravels</p>
        <div style={{marginTop: "20px"}}>
          <p style={{fontSize: "0.6rem", color: "#333", marginBottom: "10px"}}>powered by</p>
          <img src="https://zof7.com/images/krk.png" alt="Krakow Airport" style={{width: "100px", filter: "grayscale(1) brightness(0.5)"}} />
        </div>
      </footer>
    </div>
  );
}

const containerStyle: React.CSSProperties = { minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "Inter, sans-serif", position: "relative" };
const heroBgStyle: React.CSSProperties = { position: "absolute", top: 0, left: 0, width: "100%", height: "600px", backgroundImage: "url('https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?q=80&w=2000')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.15, maskImage: "linear-gradient(to bottom, black, transparent)" };
const overlayStyle: React.CSSProperties = { position: "absolute", width: "100%", height: "100%", background: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')", opacity: 0.05, pointerEvents: "none" };
const headerStyle: React.CSSProperties = { textAlign: "center", paddingTop: "100px", position: "relative", zIndex: 1 };
const logoStyle: React.CSSProperties = { fontSize: "7rem", fontWeight: 900, margin: 0, letterSpacing: "-5px", background: "linear-gradient(to bottom, #fff 40%, #444 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" };
const subtitleStyle: React.CSSProperties = { color: "#00d4ff", letterSpacing: "6px", fontSize: "0.9rem", fontWeight: 800, marginTop: "10px" };
const navStyle: React.CSSProperties = { display: "flex", justifyContent: "center", gap: "30px", marginTop: "40px", fontWeight: 800, fontSize: "0.7rem", letterSpacing: "2px" };
const navLink = { color: "#666", textDecoration: "none" };
const mainStyle: React.CSSProperties = { maxWidth: "900px", margin: "50px auto", padding: "0 20px", position: "relative", zIndex: 1 };
const gridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" };
const cardStyle: React.CSSProperties = { background: "rgba(20,20,20,0.8)", padding: "30px", borderRadius: "20px", border: "1px solid #222", textAlign: "center", backdropFilter: "blur(10px)" };
const yellowCardStyle: React.CSSProperties = { background: "#f1c40f", padding: "20px", borderRadius: "15px", color: "#000", display: "flex", justifyContent: "space-between", alignItems: "center" };
const distCardStyle: React.CSSProperties = { background: "#0a0a0a", padding: "15px", borderRadius: "12px", border: "1px solid #1a1a1a" };
const valueStyle: React.CSSProperties = { display: "block", fontSize: "2.5rem", fontWeight: 900, color: "#00d4ff" };
const labelStyle: React.CSSProperties = { display: "block", color: "#555", fontSize: "0.6rem", fontWeight: 800, marginBottom: "5px" };
const sectionTitle: React.CSSProperties = { fontSize: "1rem", fontWeight: 900, marginBottom: "20px", letterSpacing: "2px" };
const raceBoxStyle: React.CSSProperties = { background: "rgba(255,255,255,0.02)", padding: "25px", borderRadius: "20px", border: "1px solid #1a1a1a", marginBottom: "15px" };
const participantListStyle: React.CSSProperties = { marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #111", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" };
const tagStyle: React.CSSProperties = { background: "#00d4ff", color: "#000", padding: "2px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 800 };
const addButton = { background: "#00d4ff", color: "#000", padding: "8px 15px", borderRadius: "8px", textDecoration: "none", fontWeight: 900, fontSize: "0.7rem" };
const footerStyle: React.CSSProperties = { textAlign: "center", padding: "100px 0 50px", position: "relative", zIndex: 1 };
