"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function RaceDetailPage() {
  const params = useParams();
  const [race, setRace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRace() {
      if (!params?.id) return;
      const { data } = await supabase
        .from("races")
        .select("*")
        .eq("id", params.id)
        .single();
      setRace(data);
      setLoading(false);
    }
    fetchRace();
  }, [params]);

  if (loading) return <div style={{ padding: "180px 20px", textAlign: "center", color: "#fff" }}>Ładowanie...</div>;
  if (!race) return <div style={{ padding: "180px 20px", textAlign: "center", color: "#fff" }}>Nie znaleziono biegu.</div>;

  return (
    <div style={{ paddingTop: "160px", minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px 40px" }}>
        <Link href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 900, fontSize: "1.1rem" }}>
          ← POWRÓT
        </Link>
        
        <div style={{ marginTop: "30px", background: "rgba(255,255,255,0.05)", padding: "40px", borderRadius: "20px", border: "1px solid #333" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "20px", lineHeight: 1.1 }}>{race.title}</h1>
          
          <div style={{ display: "grid", gap: "15px", fontSize: "1.1rem", color: "#ddd" }}>
            <div>📅 <strong>DATA:</strong> {race.race_date}</div>
            <div>📍 <strong>LOKALIZACJA:</strong> {race.location}</div>
            <div>🏃 <strong>DYSTANS:</strong> {race.description || "Dystans nieznany"}</div>
          </div>

          {race.results_link && (
            <a href={race.results_link} target="_blank" style={{ 
              display: "inline-block", marginTop: "30px", background: "#00d4ff", color: "#000", 
              padding: "12px 24px", borderRadius: "8px", fontWeight: 900, textDecoration: "none" 
            }}>
              ZOBACZ WYNIKI OFICJALNE
            </a>
          )}
        </div>
      </main>
    </div>
  );
}