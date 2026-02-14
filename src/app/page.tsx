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
      <div style={heroStyle} />
      
      {/* HEADER - Zwiekszony z-index i padding */}
      <header style={headerStyle}>
        <div style={{display: "flex", alignItems: "center"}}>
          <img src="/logo-kart.png" alt="KART" style={{height: "50px", marginRight: "15px"}} />
          <h1 style={{fontSize: "1.8rem", fontWeight: 900, lineHeight: 1}}>Kraków Airport <span style={{color: "#00d4ff"}}>Running Team</span></h1>
        </div>
        <div style={userBox}>
          <span style={{fontWeight: 900}}>Filip</span><br/>
          <Link href="/logout" style={{fontSize: "0.7rem", color: "#ff4d4d", textDecoration: "none"}}>Wyloguj się</Link>
        </div>
      </header>

      {/* MAIN - Dodany margines górny (marginTop), aby Navbar nie zasłaniał treści */}
      <main style={mainWrapperStyle}>
        <div style={{display: "flex", gap: "40px", marginBottom: "50px"}}>
          <div style={{flex: 1}}>
            <p style={label}>WSPÓLNE KILOMETRY</p>
            <h2 style={{fontSize: "4rem", fontWeight: 900, color: "#00d4ff"}}>{stats.total_km.toFixed(1)} km</h2>
          </div>
          <div style={{flex: 1}}>
            <p style={label}>TOP 3 DYSTANS (KM)</p>
            <div style={topBox}>
               <div style={{display: "flex", justifyContent: "space-between"}}>
                 <span>1. Krzysiek</span>
                 <span style={{color: "#00d4ff"}}>{stats.total_km.toFixed(1)} km</span>
               </div>
            </div>
          </div>
        </div>

        <section style={{marginBottom: "50px"}}>
          <h3 style={{color: "#00d4ff", fontWeight: 900, marginBottom: "20px"}}>REKORDY EKIPY (TOP 3)</h3>
          <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px"}}>
            {['5 KM', '10 KM', 'PÓŁMARATON', 'MARATON'].map(d => (
              <div key={d} style={yellowCard}>
                <div style={{color: "#f1c40f", fontWeight: 900}}>{d}</div>
                <div style={{fontSize: "0.7rem", color: "#444", marginTop: "5px"}}>Brak wyników</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px"}}>
          <h2 style={{fontSize: "2.5rem", fontWeight: 900}}>BIEGI</h2>
          <Link href="/races?action=add" style={addBtn}>+ DODAJ BIEG</Link>
        </div>

        <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "25px"}}>
          {active.map(r => (
            <div key={r.id} style={raceCard}>
              <span style={{color: "#00d4ff", fontWeight: 800, fontSize: "0.8rem"}}>{r.race_date}</span>
              <h4 style={{fontSize: "1.4rem", fontWeight: 900, margin: "10px 0"}}>{r.title}</h4>
              <div style={{marginTop: "10px", borderTop: "1px solid #222", paddingTop: "10px"}}>
                <span style={{fontSize: "0.7rem", color: "#444", fontWeight: 800}}>ZAPISANI: </span>
                <div style={{display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px"}}>
                  {r.participation?.length > 0 ? r.participation.map((p:any, i:number) => (
                    <span key={i} style={{fontSize: "0.7rem", color: "#aaa"}}>{p.profiles?.display_name}{i < r.participation.length - 1 ? "," : ""}</span>
                  )) : <span style={{fontSize: "0.7rem", color: "#333"}}>Brak zgłoszeń</span>}
                </div>
              </div>
              <Link href={`/races?id=${r.id}&action=edit`} style={{display: "block", marginTop: "15px", color: "#00d4ff", fontWeight: 900, textDecoration: "none", fontSize: "0.8rem"}}>EDYTUJ / SZCZEGÓŁY →</Link>
            </div>
          ))}
        </div>
      </main>

      <footer style={footerStyle}>
        <p>developed by felipetravels</p>
        <p style={{fontSize: "0.6rem", marginTop: "5px", color: "#444"}}>powered by Kraków Airport</p>
      </footer>
    </div>
  );
}

const containerStyle: React.CSSProperties = { minHeight: "100vh", background: "#0c1117", color: "#fff", fontFamily: "Inter, sans-serif", padding: "0 40px 40px 40px", position: "relative" };
const heroStyle: React.CSSProperties = { position: "absolute", top: 0, left: 0, width: "100%", height: "600px", backgroundImage: "url('/hero.jpg')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.15, zIndex: 0 };
const headerStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "40px 0", marginBottom: "20px", position: "relative", zIndex: 10 };
const mainWrapperStyle: React.CSSProperties = { maxWidth: "1200px", margin: "40px auto 0 auto", position: "relative", zIndex: 1 };
const userBox: React.CSSProperties = { border: "2px solid #00d4ff", borderRadius: "15px", padding: "10px 25px", textAlign: "right" as "right", background: "rgba(0,0,0,0.3)" };
const label: React.CSSProperties = { color: "#666", fontWeight: 800, fontSize: "0.7rem", letterSpacing: "1px" };
const topBox: React.CSSProperties = { background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "15px", border: "1px solid #222" };
const yellowCard: React.CSSProperties = { background: "rgba(0,0,0,0.4)", padding: "20px", borderRadius: "15px", border: "1px solid #333", borderLeft: "6px solid #f1c40f" };
const raceCard: React.CSSProperties = { background: "rgba(255,255,255,0.05)", padding: "25px", borderRadius: "20px", border: "1px solid #1a1a1a", backdropFilter: "blur(5px)" };
const addBtn: React.CSSProperties = { background: "#00d4ff", color: "#000", padding: "12px 25px", borderRadius: "10px", fontWeight: 900, textDecoration: "none" };
const footerStyle: React.CSSProperties = { textAlign: "center" as "center", marginTop: "100px", color: "#333", fontWeight: 800, fontSize: "0.7rem" };
