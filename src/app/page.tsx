"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function HomePage() {
  const [stats, setStats] = useState({ total_km: 0 });
  const [races, setRaces] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
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
    loadData();
  }, []);

  const now = new Date().toISOString().split('T')[0];
  const futureRaces = races.filter(r => r.race_date >= now);
  const pastRaces = races.filter(r => r.race_date < now).reverse();

  return (
    <div style={{ minHeight: "100vh", padding: "0 60px" }}>
      {/* HEADER - Logo 125px */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "40px 0" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/logo-kart.png" alt="KART" style={{ height: "125px", marginRight: "30px" }} />
          <div>
            <h1 style={{ fontSize: "3.5rem", fontWeight: 900, margin: 0, color: "#fff", lineHeight: 0.85 }}>Kraków Airport</h1>
            <h1 style={{ fontSize: "3.5rem", fontWeight: 900, margin: 0, color: "#00d4ff", lineHeight: 0.85 }}>Running Team</h1>
          </div>
        </div>
        <div style={{ border: "2px solid #00d4ff", borderRadius: "20px", padding: "20px 50px", textAlign: "right", background: "rgba(0,0,0,0.5)" }}>
          <div style={{ fontWeight: 900, fontSize: "1.8rem", color: "#fff" }}>Filip</div>
          <Link href="/profile" style={{ fontSize: "1rem", color: "#00d4ff", textDecoration: "none", fontWeight: 800 }}>PROFIL</Link>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "80px auto 0" }}>
        {/* STATYSTYKI */}
        <section style={{ display: "flex", gap: "80px", marginBottom: "80px" }}>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#444", fontWeight: 900, fontSize: "0.9rem", letterSpacing: "2px", marginBottom: "15px" }}>WSPÓLNE KILOMETRY</p>
            <h2 style={{ fontSize: "6rem", fontWeight: 900, color: "#00d4ff", margin: 0, lineHeight: 1 }}>{stats.total_km.toFixed(1)} km</h2>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#444", fontWeight: 900, fontSize: "0.9rem", letterSpacing: "2px", marginBottom: "15px" }}>TOP 3 DYSTANS (KM)</p>
            <div style={{ background: "rgba(255,255,255,0.02)", padding: "30px", borderRadius: "20px", border: "1px solid #1a1a1a" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem" }}>
                <span style={{ fontWeight: 700 }}>1. artur.staniszewski1</span>
                <span style={{ color: "#00d4ff", fontWeight: 900 }}>{stats.total_km.toFixed(1)} km</span>
              </div>
            </div>
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "4rem", fontWeight: 900, color: "#fff", letterSpacing: "-2px" }}>BIEGI</h2>
          <Link href="/races?action=add" style={{ background: "#00d4ff", color: "#000", padding: "20px 50px", borderRadius: "15px", fontWeight: 900, textDecoration: "none", fontSize: "1.1rem" }}>+ DODAJ BIEG</Link>
        </div>

        {/* BIEGI NADCHODZĄCE */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "30px" }}>
          {futureRaces.map(r => (
            <div key={r.id} style={{ background: "rgba(255,255,255,0.03)", padding: "40px", borderRadius: "30px", border: "1px solid #1a1a1a" }}>
              <span style={{ color: "#00d4ff", fontWeight: 900, fontSize: "1.1rem" }}>{r.race_date}</span>
              <h4 style={{ fontSize: "2.2rem", fontWeight: 900, margin: "10px 0", color: "#fff", lineHeight: 1 }}>{r.title}</h4>
              <p style={{ color: "#00d4ff", fontWeight: 800, fontSize: "1.2rem" }}>{r.description} KM</p>
              
              <div style={{ borderTop: "1px solid #222", marginTop: "20px", paddingTop: "20px" }}>
                <p style={{ fontSize: "0.85rem", color: "#444", fontWeight: 900, marginBottom: "15px" }}>OPŁACILI:</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  {r.participation?.filter((p:any) => p.status === 'opłacony').map((p:any, i:number) => (
                    <span key={i} style={{ color: "#fff", fontWeight: 700 }}>{p.profiles?.display_name}</span>
                  ))}
                </div>
              </div>
              <Link href={`/races?id=${r.id}&action=edit`} style={{ display: "block", marginTop: "30px", color: "#00d4ff", fontWeight: 900, textDecoration: "none" }}>SZCZEGÓŁY →</Link>
            </div>
          ))}
        </div>

        {/* BIEGI MINIONE */}
        {pastRaces.length > 0 && (
          <div style={{ marginTop: "100px" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 900, color: "#fff", marginBottom: "30px" }}>MINIONE BIEGI</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "30px", opacity: 0.6 }}>
              {pastRaces.map(r => (
                <div key={r.id} style={{ background: "rgba(255,255,255,0.03)", padding: "40px", borderRadius: "30px", border: "1px solid #1a1a1a" }}>
                  <span style={{ color: "#666", fontWeight: 900 }}>{r.race_date}</span>
                  <h4 style={{ fontSize: "1.8rem", fontWeight: 900, margin: "10px 0", color: "#fff" }}>{r.title}</h4>
                  <p style={{ color: "#00d4ff", fontWeight: 900 }}>WYNIK: {r.participation?.reduce((acc:number, p:any) => acc + (p.km_done || 0), 0)} KM</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer style={{ textAlign: "center", marginTop: "150px", paddingBottom: "60px" }}>
        <p style={{ color: "#333", fontWeight: 900, fontSize: "0.9rem", margin: 0 }}>developed by felipetravels</p>
        <div style={{ marginTop: "20px" }}>
          <p style={{ fontSize: "0.7rem", color: "#222", marginBottom: "10px", fontWeight: 800 }}>powered by</p>
          <img src="/krk-airport-logo.png" alt="Kraków Airport" style={{ height: "100px", opacity: 0.5, width: "auto" }} />
        </div>
      </footer>
    </div>
  );
}