"use client";
import { useEffect, useState, use } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";
import RaceMyResult from "../../RaceMyResult";

export default function RaceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const raceId = resolvedParams.id;

  const [race, setRace] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!raceId) return;
      // Pobieranie danych biegu zgodnie ze strukturą races
      const { data: raceData } = await supabase.from("races").select("*").eq("id", raceId).single();
      const { data: optData } = await supabase.from("race_options").select("*").eq("race_id", raceId);
      
      if (raceData) setRace(raceData);
      if (optData) setOptions(optData);
      setLoading(false);
    }
    fetchData();
  }, [raceId]);

  if (loading) return <div style={{ padding: "100px", textAlign: "center", color: "#fff" }}>Ładowanie...</div>;
  if (!race) return <div style={{ padding: "100px", textAlign: "center", color: "#fff" }}>Nie znaleziono biegu.</div>;

  return (
    <div style={{ paddingTop: "50px", minHeight: "100vh", background: "#0a0a0a" }}>
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        <Link href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 700 }}>← POWRÓT</Link>
        <h1 style={{ fontSize: "3rem", fontWeight: 900, marginTop: "20px", color: "#fff" }}>{race.title}</h1>
        <p style={{ color: "#666", marginBottom: "40px" }}>{race.race_date} | {race.location}</p>
        
        {/* Formularz wpisywania wyniku */}
        <RaceMyResult raceId={race.id} options={options} />
      </main>
    </div>
  );
}