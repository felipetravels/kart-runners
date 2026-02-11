"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function RacesPage() {
  const [races, setRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRaces() {
      const { data } = await supabase.from("races").select("*").order("race_date", { ascending: false });
      setRaces(data || []);
      setLoading(false);
    }
    fetchRaces();
  }, []);

  if (loading) return <div style={{ paddingTop: "180px", textAlign: "center", color: "#fff" }}>Ładowanie...</div>;

  return (
    <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a" }}>
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px 40px", color: "#fff" }}>
        <header style={{ marginBottom: 40 }}>
          <Link href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 900, fontSize: "1.1rem" }}>
            ← POWRÓT DO STARTU
          </Link>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginTop: 25, color: "#fff" }}>KALENDARZ BIEGÓW</h1>
        </header>

        <div style={{ display: "grid", gap: "25px" }}>
          {races.map((race) => (
            <div key={race.id} style={{ background: "rgba(255,255,255,0.03)", padding: "25px", borderRadius: "15px", border: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.3rem", color: "#00d4ff" }}>{race.title}</h2>
                <p style={{ color: "#888", margin: "5px 0 0" }}>{race.race_date} • {race.location}</p>
              </div>
              {/* KLUCZOWY LINK: */}
              <Link href={`/races/${race.id}`} style={{ color: "#fff", border: "1px solid #444", padding: "8px 15px", borderRadius: "5px", textDecoration: "none" }}>
                SZCZEGÓŁY
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}