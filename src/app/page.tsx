"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function HomePage() {
  const [stats, setStats] = useState({ total_km: 0, count: 0 });

  useEffect(() => {
    async function getStats() {
      const { data: races } = await supabase.from("races").select("description");
      if (races) {
        const total = races.reduce((acc, r) => {
          const dist = parseFloat(r.description?.replace(/[^\d.]/g, "") || "0");
          return acc + (isNaN(dist) ? 0 : dist);
        }, 0);
        setStats({ total_km: total, count: races.length });
      }
    }
    getStats();
  }, []);

  return (
    <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", color: "#fff", textAlign: "center" }}>
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
        <h1 style={{ fontSize: "4rem", fontWeight: 900, marginBottom: "10px", letterSpacing: "-2px" }}>KART</h1>
        <p style={{ color: "#00d4ff", fontSize: "1.2rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>
          Kraków Airport Running Team
        </p>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "50px" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "40px 20px", borderRadius: "24px", border: "1px solid #222" }}>
            <span style={{ display: "block", fontSize: "3.5rem", fontWeight: 900, color: "#00d4ff" }}>{stats.count}</span>
            <span style={{ fontSize: "0.75rem", color: "#666", fontWeight: 800 }}>WSPÓLNYCH BIEGÓW</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "40px 20px", borderRadius: "24px", border: "1px solid #222" }}>
            <span style={{ display: "block", fontSize: "3.5rem", fontWeight: 900, color: "#00d4ff" }}>{stats.total_km.toFixed(0)}</span>
            <span style={{ fontSize: "0.75rem", color: "#666", fontWeight: 800 }}>PRZEBIEGNIĘTYCH KM</span>
          </div>
        </div>

        <div style={{ marginTop: "60px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          <Link href="/races" style={{ width: "100%", maxWidth: "400px", padding: "20px", background: "#00d4ff", color: "#000", borderRadius: "12px", textDecoration: "none", fontWeight: 900, fontSize: "1.1rem" }}>
            OTWÓRZ KALENDARZ BIEGÓW
          </Link>
        </div>
      </main>
    </div>
  );
}