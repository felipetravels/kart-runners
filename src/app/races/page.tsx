"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

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

  if (loading) return <div style={{ padding: 100, textAlign: "center", color: "#fff" }}>Ładowanie...</div>;

  return (
    <main style={{ 
      paddingTop: "160px", 
      maxWidth: 1000, 
      margin: "0 auto", 
      paddingLeft: "20px", 
      paddingRight: "20px", 
      paddingBottom: "40px", 
      color: "#fff" 
    }}>
      <header style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <a href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 900 }}>← POWRÓT</a>
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginTop: 20, color: "#fff" }}>WSZYSTKIE BIEGI</h1>
      </header>

      <div style={{ display: "grid", gap: "20px" }}>
        {races.map((race) => (
          <div key={race.id} style={{ background: "#111", padding: "20px", borderRadius: "15px", border: "1px solid #333" }}>
            <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{race.title}</h2>
            <p style={{ color: "#888", fontSize: "0.9rem" }}>{race.race_date} - {race.location}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
