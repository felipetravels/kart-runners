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
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* HEADER - Transparentny, korzysta z tła body z globals.css */}
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/logo-kart.png" alt="KART" style={{ height: "60px", marginRight: "20px" }} />
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: 0, lineHeight: 0.9, color: "#fff" }}>Kraków Airport</h1>
            <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: 0, lineHeight: 0.9, color: "#00d4ff" }}>Running Team</h1>
          </div>
        </div>
        
        <div style={userBoxStyle}>
          <div style={{ fontWeight: 900, fontSize: "1.2rem", color: "#fff" }}>Filip</div>
          <Link href="/logout" style={{ fontSize: "0.8rem", color: "#ff4d4d", textDecoration: "none", fontWeight: 700 }}>Wyloguj się</Link>
        </div>
      </header>

      {/* MAIN CONTENT - Odsunięty od góry, by navbar nie zasłaniał */}
      <main style={mainContentStyle}>
        <div style={{ display: "flex", gap: "80px", marginBottom: "60px" }}>
          <div style={{ flex: 1 }}>
            <p style={labelStyle}>WSPÓLNE KILOMETRY</p>
            <h2 style={{ fontSize: "6rem", fontWeight: 900, color: "#00d4ff", margin: 0 }}>{stats.total_km.toFixed(1)} km</h2>
          </div>
          <div style={{ flex: 1 }}>
            <p style={labelStyle}>TOP 3 DYSTANS (KM)</p>
            <div style={topBoxStyle}>
               <div style={{ display: "flex", justifyContent: "space-between" }}>
                 <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>1. Krzysiek</span>
                 <span style={{ color: "#00d4ff", fontWeight: 900, fontSize: "1.1rem" }}>{stats.total_km.toFixed(1)} km</span>
               </div>
            </div>
          </div>
        </div>

        <section style={{ marginBottom: "60px" }}>
          <h3 style={sectionTitleStyle}>REKORDY EKIPY (TOP 3)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "25px" }}>
            {['5 KM', '10 KM', 'PÓŁMARATON', 'MARATON'].map(d => (
              <div key={d} style={yellowRecordCard}>
                <div style={{ color: "#f1c40f", fontWeight: 900, fontSize: "1rem" }}>{d}</div>
                <div style={{ fontSize: "0.8rem", color: "#444", marginTop: "10px", fontWeight: 700 }}>Brak wyników</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "4rem", fontWeight: 900, letterSpacing: "-2px", color: "#fff" }}>BIEGI</h2>
          <Link href="/races?action=add" style={addBtnStyle}>+ DODAJ BIEG</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "30px" }}>
          {active.map(r => (
            <div key={r.id} style={raceCardStyle}>
              <span style={{ color: "#00d4ff", fontWeight: 900, fontSize: "1rem" }}>{r.race_date}</span>
              <h4 style={{ fontSize: "2rem", fontWeight: 900, margin: "15px 0", lineHeight: 1, color: "#fff" }}>{r.title}</h4>
              
              <div style={{ marginTop: "20px", borderTop: "1px solid #222", paddingTop: "20px" }}>
                <span style={{ fontSize: "0.8rem", color: "#444", fontWeight: 900 }}>ZAPISANI:</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                  {r.participation?.map((p:any, i:number) => (
                    <span key={i} style={{ fontSize: "0.9rem", color: "#bbb", fontWeight: 700 }}>{p.profiles?.display_name}{i < r.participation.length - 1 ? "," : ""}</span>
                  ))}
                </div>
              </div>
              <Link href={`/races?id=${r.id}&action=edit`} style={{ display: "block", marginTop: "30px", color: "#00d4ff", fontWeight: 900, textDecoration: "none" }}>EDYTUJ / SZCZEGÓŁY →</Link>
            </div>
          ))}
        </div>
      </main>

      <footer style={footerStyle}>
        <p>developed by felipetravels</p>
        <p style={{ fontSize: "0.6rem", marginTop: "10px", color: "#222" }}>powered by Kraków Airport</p>
      </footer>
    </div>
  );
}

const headerStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "60px 80px", position: "relative", zIndex: 10 };
const userBoxStyle: React.CSSProperties = { border: "2px solid #00d4ff", borderRadius: "20px", padding: "12px 40px", textAlign: "right" as "right", background: "rgba(0,0,0,0.5)" };
const mainContentStyle: React.CSSProperties = { maxWidth: "1200px", margin: "0 auto", padding: "0 80px", position: "relative", zIndex: 1 };
const labelStyle = { color: "#444", fontWeight: 900, fontSize: "0.8rem", letterSpacing: "2px" };
const topBoxStyle: React.CSSProperties = { background: "rgba(255,255,255,0.02)", padding: "25px", borderRadius: "20px", border: "1px solid #1a1a1a", marginTop: "15px" };
const yellowRecordCard: React.CSSProperties = { background: "rgba(0,0,0,0.4)", padding: "25px", borderRadius: "20px", border: "1px solid #222", borderLeft: "8px solid #f1c40f" };
const sectionTitleStyle = { color: "#00d4ff", fontWeight: 900, fontSize: "1.1rem", marginBottom: "25px", letterSpacing: "2px" };
const raceCardStyle: React.CSSProperties = { background: "rgba(255,255,255,0.03)", padding: "40px", borderRadius: "30px", border: "1px solid #1a1a1a", backdropFilter: "blur(10px)" };
const addBtnStyle: React.CSSProperties = { background: "#00d4ff", color: "#000", padding: "15px 40px", borderRadius: "15px", fontWeight: 900, textDecoration: "none" };
const footerStyle: React.CSSProperties = { textAlign: "center" as "center", marginTop: "150px", paddingBottom: "50px", color: "#333", fontWeight: 900, fontSize: "0.8rem" };
