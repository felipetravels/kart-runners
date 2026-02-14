"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function HomePage() {
  const [stats, setStats] = useState({ total_km: 0, count: 0 });
  const [races, setRaces] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("races").select("*, participation(status, profiles(display_name))").order("race_date", { ascending: true });
      if (data) {
        setRaces(data);
        const total = data.reduce((acc: number, r: any) => {
          const dist = parseFloat(r.description?.replace(/[^\d.]/g, "") || "0");
          return acc + (isNaN(dist) ? 0 : dist);
        }, 0);
        setStats({ total_km: total, count: data.length });
      }
    }
    load();
  }, []);

  const now = new Date().toISOString().split('T')[0];
  const active = races.filter(r => r.race_date >= now);

  return (
    <div style={containerStyle}>
      {/* PRAWDZIWE TŁO HERO */}
      <div style={heroImageStyle} />
      <div style={darkOverlay} />
      
      {/* TRANSPARENTNY NAVBAR - NIE ZASŁANIA TREŚCI */}
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/logo-kart.png" alt="KART" style={{ height: "60px", marginRight: "20px" }} />
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900, margin: 0, lineHeight: 1, color: "#fff" }}>Kraków Airport</h1>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900, margin: 0, lineHeight: 1, color: "#00d4ff" }}>Running Team</h1>
          </div>
        </div>
        
        <nav style={navLinksStyle}>
          <Link href="/team" style={navLink}>EKIPA</Link>
          <Link href="/logistics" style={navLink}>LOGISTYKA</Link>
          <Link href="/results" style={navLink}>WYNIKI</Link>
          <div style={userBadge}>
            <span style={{ fontSize: "0.7rem", color: "#888", display: "block" }}>Cześć, Filip!</span>
            <Link href="/profile" style={{ color: "#00d4ff", fontWeight: 900, textDecoration: "none", fontSize: "0.9rem" }}>PROFIL</Link>
          </div>
        </nav>
      </header>

      <main style={mainContentStyle}>
        <div style={{ display: "flex", gap: "60px", marginBottom: "60px" }}>
          <div style={{ flex: 1 }}>
            <p style={labelStyle}>WSPÓLNE KILOMETRY</p>
            <h2 style={{ fontSize: "5rem", fontWeight: 900, color: "#00d4ff", margin: 0 }}>{stats.total_km.toFixed(1)} km</h2>
          </div>
          <div style={{ flex: 1 }}>
            <p style={labelStyle}>TOP 3 DYSTANS (KM)</p>
            <div style={topBoxStyle}>
               <div style={{ display: "flex", justifyContent: "space-between" }}>
                 <span style={{ fontWeight: 700 }}>1. artur.staniszewski1</span>
                 <span style={{ color: "#00d4ff", fontWeight: 900 }}>{stats.total_km.toFixed(1)} km</span>
               </div>
            </div>
          </div>
        </div>

        <section style={{ marginBottom: "60px" }}>
          <h3 style={sectionTitleStyle}>REKORDY EKIPY (TOP 3)</h3>
          <div style={recordsGridStyle}>
            {['5 KM', '10 KM', 'PÓŁMARATON', 'MARATON'].map(d => (
              <div key={d} style={yellowCardStyle}>
                <div style={{ color: "#f1c40f", fontWeight: 900, fontSize: "0.8rem" }}>{d}</div>
                <div style={{ fontSize: "0.7rem", color: "#444", marginTop: "10px", fontWeight: 700 }}>1. artur.staniszewski1</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: "-1px" }}>BIEGI</h2>
          <Link href="/races?action=add" style={addBtnStyle}>+ DODAJ BIEG</Link>
        </div>

        <div style={racesGridStyle}>
          {active.map(r => (
            <div key={r.id} style={raceCardStyle}>
              <span style={{ color: "#00d4ff", fontWeight: 900, fontSize: "0.8rem" }}>{r.race_date}</span>
              <h4 style={{ fontSize: "1.5rem", fontWeight: 900, margin: "10px 0" }}>{r.title}</h4>
              <p style={{ fontSize: "0.8rem", color: "#666" }}>{r.location}</p>
              
              <div style={participationBox}>
                <span style={{ fontSize: "0.7rem", color: "#444", fontWeight: 900 }}>ZAPISANI:</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
                  {r.participation?.map((p:any, i:number) => (
                    <span key={i} style={tagStyle}>{p.profiles?.display_name}</span>
                  ))}
                </div>
              </div>
              
              <Link href={`/races?id=${r.id}&action=edit`} style={detailsLinkStyle}>SZCZEGÓŁY →</Link>
            </div>
          ))}
        </div>
      </main>

      <footer style={footerStyle}>
        <p style={{ margin: 0 }}>developed by felipetravels</p>
        <p style={{ fontSize: "0.6rem", marginTop: "5px", color: "#333" }}>powered by Kraków Airport</p>
      </footer>
    </div>
  );
}

// STYLIZACJA ZGODNA ZE ZDJĘCIEM
const containerStyle: React.CSSProperties = { minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "Inter, sans-serif", position: "relative" };
const heroImageStyle: React.CSSProperties = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "url('/hero.jpg')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.2, zIndex: 0 };
const darkOverlay: React.CSSProperties = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(to bottom, rgba(5,5,5,0.4), #050505)", zIndex: 1 };

const headerStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "40px 60px", position: "relative", zIndex: 10 };
const navLinksStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "30px" };
const navLink = { color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "1px" };
const userBadge = { border: "1px solid #333", padding: "10px 20px", borderRadius: "10px", background: "rgba(0,0,0,0.6)" };

const mainContentStyle: React.CSSProperties = { maxWidth: "1200px", margin: "0 auto", padding: "0 60px", position: "relative", zIndex: 2 };
const labelStyle = { color: "#444", fontWeight: 900, fontSize: "0.7rem", letterSpacing: "2px", marginBottom: "10px" };
const topBoxStyle: React.CSSProperties = { background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "15px", border: "1px solid #1a1a1a" };

const sectionTitleStyle = { color: "#00d4ff", fontWeight: 900, fontSize: "0.9rem", marginBottom: "20px", letterSpacing: "2px" };
const recordsGridStyle = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" };
const yellowCardStyle: React.CSSProperties = { background: "rgba(0,0,0,0.6)", padding: "20px", borderRadius: "15px", borderLeft: "5px solid #f1c40f", border: "1px solid #222", borderLeftWidth: "6px" };

const racesGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "25px" };
const raceCardStyle: React.CSSProperties = { background: "rgba(255,255,255,0.03)", padding: "30px", borderRadius: "25px", border: "1px solid #1a1a1a", backdropFilter: "blur(10px)" };
const participationBox = { marginTop: "20px", paddingTop: "15px", borderTop: "1px solid #222" };
const tagStyle = { background: "rgba(0,212,255,0.1)", color: "#00d4ff", padding: "2px 8px", borderRadius: "5px", fontSize: "0.65rem", fontWeight: 700 };
const addBtnStyle: React.CSSProperties = { background: "#00d4ff", color: "#000", padding: "12px 25px", borderRadius: "10px", fontWeight: 900, textDecoration: "none", fontSize: "0.8rem" };
const detailsLinkStyle = { display: "block", marginTop: "20px", color: "#00d4ff", fontWeight: 900, textDecoration: "none", fontSize: "0.8rem" };
const footerStyle: React.CSSProperties = { textAlign: "center" as "center", padding: "100px 0 40px", color: "#222", fontWeight: 800, fontSize: "0.7rem", position: "relative", zIndex: 2 };
