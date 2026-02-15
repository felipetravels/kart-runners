"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function HomePage() {
  const [stats, setStats] = useState({ total_km: 0 });
  const [races, setRaces] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("races")
        .select("*, participation(status, km_done, profiles(display_name))")
        .order("race_date", { ascending: true });

      if (data) {
        setRaces(data);
        const total = data.reduce((acc, r) => {
          const raceSum = r.participation?.reduce((pAcc: number, p: any) => pAcc + (p.km_done || 0), 0) || 0;
          return acc + raceSum;
        }, 0);
        setStats({ total_km: total });
      }
    }
    load();
  }, []);

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
            <p style={labelS}>WSPÓLNE KILOMETRY</p>
            <h2 style={{ fontSize: "6rem", fontWeight: 900, color: "#00d4ff", margin: 0, lineHeight: 1 }}>{stats.total_km.toFixed(1)} km</h2>
          </div>
          <div style={{ flex: 1 }}>
            <p style={labelS}>TOP 3 DYSTANS (KM)</p>
            <div style={topBoxS}>
               <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem" }}>
                 <span style={{ fontWeight: 700 }}>1. artur.staniszewski1</span>
                 <span style={{ color: "#00d4ff", fontWeight: 900 }}>{stats.total_km.toFixed(1)} km</span>
               </div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: "80px" }}>
          <h3 style={labelS}>REKORDY EKIPY</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "25px" }}>
            {['5 KM', '10 KM', 'PÓŁMARATON', 'MARATON'].map(d => (
              <div key={d} style={{ background: "rgba(0,0,0,0.4)", padding: "25px", borderRadius: "20px", border: "1px solid #222", borderLeft: "8px solid #f1c40f" }}>
                <div style={{ color: "#f1c40f", fontWeight: 900, fontSize: "1rem" }}>{d}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "4rem", fontWeight: 900, color: "#fff", letterSpacing: "-2px" }}>BIEGI</h2>
          <Link href="/races?action=add" style={btnS}>+ DODAJ BIEG</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "30px" }}>
          {races.map(r => (
            <div key={r.id} style={cardS}>
              <span style={{ color: "#00d4ff", fontWeight: 900, fontSize: "1rem" }}>{r.race_date}</span>
              <h4 style={{ fontSize: "2.2rem", fontWeight: 900, margin: "10px 0", color: "#fff", lineHeight: 1 }}>{r.title}</h4>
              <p style={{ color: "#555", fontWeight: 700, marginBottom: "20px" }}>{r.location}</p>
              
              <div style={{ borderTop: "1px solid #222", paddingTop: "20px" }}>
                <p style={{ fontSize: "0.75rem", color: "#444", fontWeight: 900, marginBottom: "15px", letterSpacing: "1px" }}>UCZESTNICY I WYNIKI:</p>
                {r.participation?.map((p:any, i:number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "1rem" }}>
                    <span style={{ color: p.status === 'opłacony' ? '#fff' : '#666' }}>{p.profiles?.display_name}</span>
                    <span style={{ color: "#00d4ff", fontWeight: 900 }}>{p.km_done || 0} KM</span>
                  </div>
                ))}
              </div>
              <Link href={`/races?id=${r.id}&action=edit`} style={{ display: "block", marginTop: "30px", color: "#00d4ff", fontWeight: 900, textDecoration: "none" }}>SZCZEGÓŁY →</Link>
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

const labelS = { color: "#444", fontWeight: 900, fontSize: "0.8rem", letterSpacing: "2px", marginBottom: "15px" };
const topBoxS: React.CSSProperties = { background: "rgba(255,255,255,0.02)", padding: "25px", borderRadius: "20px", border: "1px solid #1a1a1a" };
const cardS: React.CSSProperties = { background: "rgba(255,255,255,0.03)", padding: "40px", borderRadius: "30px", border: "1px solid #1a1a1a", backdropFilter: "blur(10px)" };
const btnS: React.CSSProperties = { background: "#00d4ff", color: "#000", padding: "15px 40px", borderRadius: "15px", fontWeight: 900, textDecoration: "none" };
