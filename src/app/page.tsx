"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function HomePage() {
  const [stats, setStats] = useState({ total_km: 0, count: 0 });
  const [races, setRaces] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("races").select("*, participation(status, km_done, profiles(display_name))").order("race_date", { ascending: true });
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
    <div style={{ minHeight: "100vh", padding: "0 60px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "60px 0" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/logo-kart.png" alt="KART" style={{ height: "60px", marginRight: "20px" }} />
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: 0, color: "#fff", lineHeight: 0.9 }}>Kraków Airport</h1>
            <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: 0, color: "#00d4ff", lineHeight: 0.9 }}>Running Team</h1>
          </div>
        </div>
        <div style={{ border: "2px solid #00d4ff", borderRadius: "20px", padding: "12px 40px", textAlign: "right" as "right", background: "rgba(0,0,0,0.5)" }}>
          <div style={{ fontWeight: 900, fontSize: "1.3rem", color: "#fff" }}>Filip</div>
          <Link href="/profile" style={{ fontSize: "0.8rem", color: "#00d4ff", textDecoration: "none", fontWeight: 700, marginRight: "15px" }}>PROFIL</Link>
          <Link href="/logout" style={{ fontSize: "0.8rem", color: "#ff4d4d", textDecoration: "none", fontWeight: 700 }}>Wyloguj się</Link>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "40px auto 0" }}>
        <div style={{ display: "flex", gap: "80px", marginBottom: "60px" }}>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#444", fontWeight: 900, fontSize: "0.8rem", letterSpacing: "2px" }}>WSPÓLNE KILOMETRY</p>
            <h2 style={{ fontSize: "6rem", fontWeight: 900, color: "#00d4ff", margin: 0 }}>{stats.total_km.toFixed(1)} km</h2>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#444", fontWeight: 900, fontSize: "0.8rem", letterSpacing: "2px" }}>TOP 3 DYSTANS (KM)</p>
            <div style={{ background: "rgba(255,255,255,0.02)", padding: "25px", borderRadius: "20px", border: "1px solid #1a1a1a", marginTop: "15px" }}>
               <div style={{ display: "flex", justifyContent: "space-between" }}>
                 <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>1. Krzysiek</span>
                 <span style={{ color: "#00d4ff", fontWeight: 900, fontSize: "1.1rem" }}>{stats.total_km.toFixed(1)} km</span>
               </div>
            </div>
          </div>
        </div>

        <h3 style={{ color: "#00d4ff", fontWeight: 900, fontSize: "1.1rem", marginBottom: "25px", letterSpacing: "2px" }}>REKORDY EKIPY</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "25px", marginBottom: "80px" }}>
          {['5 KM', '10 KM', 'PÓŁMARATON', 'MARATON'].map(d => (
            <div key={d} style={{ background: "rgba(0,0,0,0.4)", padding: "25px", borderRadius: "20px", border: "1px solid #222", borderLeft: "8px solid #f1c40f" }}>
              <div style={{ color: "#f1c40f", fontWeight: 900, fontSize: "1rem" }}>{d}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "4rem", fontWeight: 900, color: "#fff", letterSpacing: "-2px" }}>BIEGI</h2>
          <Link href="/races?action=add" style={{ background: "#00d4ff", color: "#000", padding: "15px 40px", borderRadius: "15px", fontWeight: 900, textDecoration: "none" }}>+ DODAJ BIEG</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "30px" }}>
          {active.map(r => (
            <div key={r.id} style={{ background: "rgba(255,255,255,0.03)", padding: "40px", borderRadius: "30px", border: "1px solid #1a1a1a" }}>
              <span style={{ color: "#00d4ff", fontWeight: 900, fontSize: "1rem" }}>{r.race_date}</span>
              <h4 style={{ fontSize: "2rem", fontWeight: 900, margin: "15px 0", color: "#fff", lineHeight: 1 }}>{r.title}</h4>
              <div style={{ borderTop: "1px solid #222", marginTop: "20px", paddingTop: "20px" }}>
                <p style={{ fontSize: "0.8rem", color: "#444", fontWeight: 900, marginBottom: "15px" }}>WYNIKI ZAWODNIKÓW:</p>
                {r.participation?.map((p:any, i:number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem", color: "#bbb", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 700 }}>{p.profiles?.display_name}</span>
                    <span style={{ color: "#00d4ff", fontWeight: 900 }}>{p.km_done || 0} KM</span>
                  </div>
                ))}
              </div>
              <Link href={`/races?id=${r.id}&action=edit`} style={{ display: "block", marginTop: "30px", color: "#00d4ff", fontWeight: 900, textDecoration: "none" }}>SZCZEGÓŁY →</Link>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ textAlign: "center" as "center", marginTop: "150px", paddingBottom: "60px" }}>
        <p style={{ color: "#333", fontWeight: 900, fontSize: "0.8rem", margin: 0 }}>developed by felipetravels</p>
        <div style={{ marginTop: "20px" }}>
          <p style={{ fontSize: "0.6rem", color: "#222", marginBottom: "10px", fontWeight: 800 }}>powered by</p>
          <img src="https://zof7.com/images/krk.png" alt="Kraków Airport" style={{ width: "100px", opacity: 0.3 }} />
        </div>
      </footer>
    </div>
  );
}
