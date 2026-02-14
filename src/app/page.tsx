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
        const total = data.reduce((acc: number, r: any) => acc + parseFloat(r.description || "0"), 0);
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

      <main style={{maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1}}>
        <div style={{display: "flex", gap: "40px", marginBottom: "50px"}}>
          <div style={{flex: 1}}>
            <p style={label}>WSPÓLNE KILOMETRY</p>
            <h2 style={{fontSize: "4rem", fontWeight: 900, color: "#00d4ff"}}>{stats.total_km.toFixed(1)} km</h2>
          </div>
          <div style={{flex: 1}}>
            <p style={label}>TOP 3 DYSTANS (KM)</p>
            <div style={topBox}>
               {/* Tu docelowo zaciągamy ranking z bazy */}
               <div style={{display: "flex", justifyContent: "space-between"}}><span>1. Krzysiek</span><span>{stats.total_km.toFixed(1)} km</span></div>
            </div>
          </div>
        </div>

        <section style={{marginBottom: "50px"}}>
          <h3 style={{color: "#00d4ff", fontWeight: 900, marginBottom: "20px"}}>REKORDY EKIPY (TOP 3)</h3>
          <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px"}}>
            {['5 KM', '10 KM', 'PÓŁMARATON', 'MARATON'].map(d => (
              <div key={d} style={yellowCard}><div style={{color: "#f1c40f", fontWeight: 900}}>{d}</div></div>
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
                <span style={{fontSize: "0.7rem", color: "#444"}}>ZAPISANI: </span>
                {r.participation?.map((p:any, i:number) => (
                  <span key={i} style={{fontSize: "0.7rem", color: "#aaa", marginRight: "5px"}}>{p.profiles?.display_name},</span>
                ))}
              </div>
              <Link href={`/races?id=${r.id}`} style={{display: "block", marginTop: "15px", color: "#00d4ff", fontWeight: 900, textDecoration: "none", fontSize: "0.8rem"}}>SZCZEGÓŁY →</Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const containerStyle: React.CSSProperties = { minHeight: "100vh", background: "#0c1117", color: "#fff", fontFamily: "Inter, sans-serif", padding: "40px" };
const heroStyle: React.CSSProperties = { position: "absolute", top: 0, left: 0, width: "100%", height: "500px", backgroundImage: "url('/hero.jpg')", backgroundSize: "cover", opacity: 0.15, zIndex: 0 };
const headerStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "80px", position: "relative", zIndex: 1 };
const userBox = { border: "2px solid #00d4ff", borderRadius: "15px", padding: "10px 25px", textAlign: "right" };
const label = { color: "#666", fontWeight: 800, fontSize: "0.7rem", letterSpacing: "1px" };
const topBox = { background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "15px", border: "1px solid #222" };
const yellowCard = { background: "rgba(0,0,0,0.4)", padding: "20px", borderRadius: "15px", borderLeft: "5px solid #f1c40f", border: "1px solid #333", borderLeftWidth: "6px" };
const raceCard = { background: "rgba(255,255,255,0.05)", padding: "25px", borderRadius: "20px", border: "1px solid #1a1a1a" };
const addBtn = { background: "#00d4ff", color: "#000", padding: "12px 25px", borderRadius: "10px", fontWeight: 900, textDecoration: "none" };
