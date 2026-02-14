"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function HomePage() {
  const [stats, setStats] = useState({ total_km: 0, count: 0 });
  const [activeRaces, setActiveRaces] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: races } = await supabase.from("races").select("*").order("race_date", { ascending: true });
      if (races) {
        setActiveRaces(races);
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
      <div style={heroImageStyle} />
      
      {/* TOP BAR */}
      <header style={headerStyle}>
        <div style={logoArea}>
          <img src="/logo-kart.png" alt="KART" style={{height: "50px", marginRight: "15px"}} />
          <div>
            <h1 style={logoTitle}>Kraków Airport</h1>
            <h2 style={logoSubtitle}>Running Team</h2>
          </div>
        </div>
        <div style={userBoxStyle}>
          <span style={{fontWeight: 900, fontSize: "1.1rem"}}>Filip</span>
          <Link href="/logout" style={{fontSize: "0.7rem", color: "#ff4d4d", textDecoration: "none"}}>Wyloguj się</Link>
        </div>
      </header>

      <main style={mainStyle}>
        {/* TOP STATS */}
        <div style={{display: "flex", gap: "40px", marginBottom: "40px"}}>
          <section style={{flex: 1}}>
            <p style={labelStyle}>WSPÓLNE KILOMETRY</p>
            <h3 style={bigStatStyle}>{stats.total_km.toFixed(1)} km</h3>
          </section>
          <section style={{flex: 1}}>
            <p style={labelStyle}>TOP 3 DYSTANS (KM)</p>
            <div style={topListStyle}>
              <div style={{display: "flex", justifyContent: "space-between"}}>
                <span>1. artur.staniszewski1</span>
                <span style={{color: "#00d4ff"}}>{stats.total_km.toFixed(1)} km</span>
              </div>
            </div>
          </section>
        </div>

        {/* REKORDY EKIPY */}
        <section style={{marginBottom: "50px"}}>
          <h4 style={sectionHeaderStyle}>REKORDY EKIPY (TOP 3)</h4>
          <div style={recordsGrid}>
            {[
              { label: "5 KM", name: "1. artur.staniszewski1", time: "19:37" },
              { label: "10 KM", name: "Brak wyników", time: "" },
              { label: "PÓŁMARATON", name: "Brak wyników", time: "" },
              { label: "MARATON", name: "Brak wyników", time: "" }
            ].map((rec, i) => (
              <div key={i} style={yellowRecordCard}>
                <div style={yellowLabel}>{rec.label}</div>
                <div style={{display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginTop: "10px", fontWeight: 700}}>
                  <span>{rec.name}</span>
                  <span>{rec.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BIEGI */}
        <section>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px"}}>
            <h2 style={{fontSize: "2.5rem", fontWeight: 900, letterSpacing: "2px"}}>BIEGI</h2>
            <Link href="/races?action=add" style={addBtnStyle}>+ DODAJ BIEG</Link>
          </div>
          <div style={racesGrid}>
            {activeRaces.map(race => (
              <div key={race.id} style={raceCardStyle}>
                <span style={{color: "#00d4ff", fontSize: "0.8rem", fontWeight: 800}}>{race.race_date}</span>
                <h5 style={{fontSize: "1.3rem", fontWeight: 900, margin: "10px 0"}}>{race.title}</h5>
                <p style={{fontSize: "0.8rem", color: "#aaa"}}>{race.location}</p>
                <Link href={`/races?id=${race.id}`} style={detailsLink}>SZCZEGÓŁY →</Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer style={footerStyle}>
        <p>developed by felipetravels</p>
        <p style={{fontSize: "0.6rem", marginTop: "5px", color: "#444"}}>powered by Kraków Airport</p>
      </footer>
    </div>
  );
}

// CSS-in-JS (Odzwierciedlenie zdjęcia)
const containerStyle: React.CSSProperties = { minHeight: "100vh", background: "#0c1117", color: "#fff", fontFamily: "Inter, sans-serif", padding: "40px", position: "relative", overflowX: "hidden" };
const heroImageStyle: React.CSSProperties = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "url('https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2000')", backgroundSize: "cover", opacity: 0.1, zIndex: 0, pointerEvents: "none" };

const headerStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "80px", position: "relative", zIndex: 1 };
const logoArea = { display: "flex", alignItems: "center" };
const logoTitle = { fontSize: "1.8rem", fontWeight: 900, margin: 0, lineHeight: 1 };
const logoSubtitle = { fontSize: "1.8rem", fontWeight: 900, margin: 0, color: "#00d4ff", lineHeight: 1 };

const userBoxStyle: React.CSSProperties = { border: "2px solid #00d4ff", borderRadius: "15px", padding: "10px 30px", textAlign: "right", background: "rgba(0,0,0,0.5)" };

const mainStyle: React.CSSProperties = { maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 };
const labelStyle = { color: "#666", fontWeight: 800, fontSize: "0.7rem", letterSpacing: "1px", marginBottom: "10px" };
const bigStatStyle = { fontSize: "4rem", fontWeight: 900, color: "#00d4ff", margin: 0 };
const topListStyle = { background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "20px", border: "1px solid #222", fontSize: "0.9rem", fontWeight: 700 };

const sectionHeaderStyle = { color: "#00d4ff", fontWeight: 900, fontSize: "1rem", marginBottom: "20px" };
const recordsGrid = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" };
const yellowRecordCard: React.CSSProperties = { background: "rgba(0,0,0,0.4)", padding: "20px", borderRadius: "15px", borderLeft: "5px solid #f1c40f", border: "1px solid #333", borderLeftWidth: "6px", borderLeftColor: "#f1c40f" };
const yellowLabel = { color: "#f1c40f", fontWeight: 900, fontSize: "0.8rem" };

const racesGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "25px" };
const raceCardStyle: React.CSSProperties = { background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "25px", border: "1px solid #1a1a1a", backdropFilter: "blur(10px)" };
const addBtnStyle = { background: "#00d4ff", color: "#000", padding: "12px 25px", borderRadius: "12px", textDecoration: "none", fontWeight: 900, fontSize: "0.8rem" };
const detailsLink = { display: "block", marginTop: "20px", color: "#00d4ff", textDecoration: "none", fontWeight: 900, fontSize: "0.8rem" };

const footerStyle: React.CSSProperties = { textAlign: "center", marginTop: "100px", color: "#333", fontWeight: 800, fontSize: "0.7rem" };
