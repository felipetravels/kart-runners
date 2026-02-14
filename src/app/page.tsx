"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function HomePage() {
  const [stats, setStats] = useState({ total_km: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getStats() {
      const { data: races } = await supabase.from("races").select("description");
      if (races) {
        const total = races.reduce((acc, r) => {
          const dist = parseFloat(r.description?.replace("km", "") || "0");
          return acc + (isNaN(dist) ? 0 : dist);
        }, 0);
        setStats({ total_km: total, count: races.length });
      }
      setLoading(false);
    }
    getStats();
  }, []);

  return (
    <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", color: "#fff", textAlign: "center" }}>
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
        <h1 style={{ fontSize: "4rem", fontWeight: 900, marginBottom: "10px" }}>KART</h1>
        <p style={{ color: "#00d4ff", fontSize: "1.2rem", fontWeight: 700, letterSpacing: "2px" }}>KRAKÓW AIRPORT RUNNING TEAM</p>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "50px" }}>
          <div style={statBox}>
            <span style={statVal}>{stats.count}</span>
            <span style={statLab}>WSPÓLNYCH BIEGÓW</span>
          </div>
          <div style={statBox}>
            <span style={statVal}>{stats.total_km.toFixed(0)}</span>
            <span style={statLab}>PRZEBIEGNIĘTYCH KM</span>
          </div>
        </div>

        <div style={{ marginTop: "60px", display: "flex", justifyContent: "center", gap: "20px" }}>
          <Link href="/races" style={mainBtn}>KALENDARZ BIEGÓW</Link>
          <Link href="/results" style={{ ...mainBtn, background: "transparent", border: "2px solid #00d4ff", color: "#00d4ff" }}>WYNIKI EKIPY</Link>
        </div>
      </main>
    </div>
  );
}

const statBox = { background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "20px", border: "1px solid #222" };
const statVal = { display: "block", fontSize: "3rem", fontWeight: 900, color: "#00d4ff" };
const statLab = { fontSize: "0.8rem", color: "#888", fontWeight: 700 };
const mainBtn = { padding: "18px 35px", background: "#00d4ff", color: "#000", borderRadius: "10px", textDecoration: "none", fontWeight: 900, fontSize: "1.1rem" };