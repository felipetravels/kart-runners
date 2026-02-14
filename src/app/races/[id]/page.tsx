"use client";
import { useEffect, useState, use } from "react";
// Import relatywny, aby na pewno trafił do src/lib/supabaseClient
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";
import ParticipationCard from "../ParticipationCard";

interface Race {
  id: string;
  title: string;
  race_date: string;
  location: string;
  description: string;
}

export default function RaceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Rozwiązanie problemu asynchronicznych params w nowym Next.js
  const resolvedParams = use(params);
  const raceId = resolvedParams.id;

  const [race, setRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRace() {
      if (!raceId) return;
      const { data, error } = await supabase
        .from("races")
        .select("*")
        .eq("id", raceId)
        .single();

      if (!error && data) {
        setRace(data);
      }
      setLoading(false);
    }
    fetchRace();
  }, [raceId]);

  if (loading) return <div style={{ paddingTop: "200px", textAlign: "center", color: "#fff" }}>Ładowanie...</div>;

  if (!race) {
    return (
      <div style={{ paddingTop: "200px", textAlign: "center", color: "#fff" }}>
        <h1>Nie znaleziono biegu</h1>
        <Link href="/races" style={{ color: "#00d4ff" }}>Powrót do listy</Link>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <Link href="/races" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 900 }}>
            ← POWRÓT DO LISTY
          </Link>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link 
              href={`/races?id=${race.id}&action=edit`} 
              style={{ padding: "10px 20px", background: "#f39c12", color: "#fff", borderRadius: "5px", textDecoration: "none", fontWeight: "bold" }}
            >
              EDYTUJ
            </Link>
          </div>
        </div>

        <div style={{ padding: "40px", border: "1px solid #222", borderRadius: "20px", background: "rgba(255,255,255,0.02)", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: 900, marginBottom: "20px", color: "#fff" }}>{race.title}</h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", color: "#888" }}>
            <p>📅 <strong>DATA:</strong> {race.race_date}</p>
            <p>📍 <strong>MIEJSCE:</strong> {race.location}</p>
            <p>🏃 <strong>DYSTANS:</strong> {race.description}</p>
          </div>
        </div>

        <ParticipationCard raceId={race.id} />
      </main>
    </div>
  );
}