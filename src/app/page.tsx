"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function HomePage() {
  const [stats, setStats] = useState({ total_km: 0, count: 0 });
  const [races, setRaces] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from("races").select("*, participation(status, km_done, profiles(display_name))").order("race_date", { ascending: true });
      if (data) {
        setRaces(data);
        const total = data.reduce((acc, r) => acc + (r.participation?.reduce((pAcc: any, p: any) => pAcc + (p.km_done || 0), 0) || 0), 0);
        setStats({ total_km: total, count: data.length });
      }
    }
    loadData();
  }, []);

  const now = new Date().toISOString().split('T')[0];
  const active = races.filter(r => r.race_date >= now);
  const past = races.filter(r => r.race_date < now).reverse();

  return (
    <div style={{ minHeight: "100vh", padding: "0 60px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "60px 0" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/logo-kart.png" alt="KART" style={{ height: "60px", marginRight: "20px" }} />
          <div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 900, margin: 0, color: "#fff", lineHeight: 0.9 }}>Kraków Airport</h1>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 900, margin: 0, color: "#00d4ff", lineHeight: 0.9 }}>Running Team</h1>
          </div>
        </div>
        <div style={{ border: "2px solid #00d4ff", borderRadius: "20px", padding: "12px 40px", textAlign: "right", background: "rgba(0,0,0,0.5)" }}>
          <div style={{ fontWeight: 900, fontSize: "1.4rem", color: "#fff" }}>Filip</div>
          <Link href="/profile" style={{ fontSize: "0.8rem", color: "#00d4ff", textDecoration: "none", fontWeight: 800 }}>PROFIL</Link>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "40px auto 0" }}>
        <section style={{ display: "flex", gap: "80px", marginBottom: "80px" }}>
          <div style={{ flex: 1 }}>
            <p style={labelStyle}>WSPÓLNE KILOMETRY</p>
            <h2 style={{ fontSize: "6rem", fontWeight: 900, color: "#00d4ff", margin: 0, lineHeight: 1 }}>{stats.total_km.toFixed(1)} km</h2>
          </div>
          <div style={{ flex: 1 }}>
            <p style={labelStyle}>TOP 3 DYSTANS (KM)</p>
            <div style={topBoxStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem" }}>
                <span style={{ fontWeight: 700 }}>1. artur.staniszewski1</span>
                <span style={{ color: "#00d4ff", fontWeight: 900 }}>{stats.total_km.toFixed(1)} km</span>
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: "60px" }}>
          <h3 style={labelStyle}>REKORDY EKIPY</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "25px" }}>
            {['5 KM', '10 KM', 'PÓŁMARATON', 'MARATON'].map(d => (
              <div key={d} style={yellowCardStyle}>
                <div style={{ color: "#f1c40f", fontWeight: 900, fontSize: "1rem" }}>{d}</div>
                <div style={{ fontSize: "0.8rem", color: "#444", marginTop: "10px", fontWeight: 700 }}>Brak wyników</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "4rem", fontWeight: 900, color: "#fff", letterSpacing: "-2px" }}>BIEGI</h2>
          <Link href="/races?action=add" style={addButtonStyle}>+ DODAJ BIEG</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "30px" }}>
          {active.map(r => (
            <div key={r.id} style={raceCardStyle}>
              <span style={{ color: "#00d4ff", fontWeight: 900, fontSize: "1rem" }}>{r.race_date}</span>
              <h4 style={{ fontSize: "2rem", fontWeight: 900, margin: "10px 0", color: "#fff", lineHeight: 1 }}>{r.title}</h4>
              <div style={{ borderTop: "1px solid #222", marginTop: "20px", paddingTop: "20px" }}>
                <p style={{ fontSize: "0.8rem", color: "#444", fontWeight: 900, marginBottom: "12px" }}>OPŁACENI / WYNIKI:</p>
                {r.participation?.map((p:any, i:number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "0.9rem" }}>
                    <span style={{ color: p.status === 'opłacony' ? '#fff' : '#666' }}>{p.profiles?.display_name}</span>
                    <span style={{ color: "#00d4ff", fontWeight: 700 }}>{p.km_done || 0} KM</span>
                  </div>
                ))}
              </div>
              <Link href={`/races?id=${r.id}&action=edit`} style={{ display: "block", marginTop: "25px", color: "#00d4ff", fontWeight: 900, textDecoration: "none" }}>SZCZEGÓŁY →</Link>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ textAlign: "center", marginTop: "150px", paddingBottom: "60px" }}>
        <p style={{ color: "#333", fontWeight: 900, fontSize: "0.8rem", margin: 0 }}>developed by felipetravels</p>
        <div style={{ marginTop: "20px" }}>
          <p style={{ fontSize: "0.6rem", color: "#222", marginBottom: "10px", fontWeight: 800 }}>powered by</p>
          <img src="/krk-airport-logo.png" alt="Kraków Airport" style={{ width: "100px", opacity: 0.5 }} />
        </div>
      </footer>
    </div>
  );
}

const labelStyle = { color: "#444", fontWeight: 900, fontSize: "0.8rem", letterSpacing: "2px", marginBottom: "15px" };
const topBoxStyle = { background: "rgba(255,255,255,0.02)", padding: "25px", borderRadius: "20px", border: "1px solid #1a1a1a", marginTop: "15px" };
const yellowCardStyle = { background: "rgba(0,0,0,0.4)", padding: "25px", borderRadius: "20px", border: "1px solid #222", borderLeft: "8px solid #f1c40f" };
const raceCardStyle = { background: "rgba(255,255,255,0.03)", padding: "40px", borderRadius: "30px", border: "1px solid #1a1a1a" };
const addButtonStyle = { background: "#00d4ff", color: "#000", padding: "15px 40px", borderRadius: "15px", fontWeight: 900, textDecoration: "none" };
