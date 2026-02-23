"use client";
import { useEffect, useState, use } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";
import RaceMyResult from "../../RaceMyResult";
import ParticipationCard from "../ParticipationCard";

export default function RaceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const raceId = resolvedParams.id;

  const [race, setRace] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!raceId) return;
      const { data: raceData } = await supabase.from("races").select("*").eq("id", raceId).single();
      const { data: optData } = await supabase.from("race_options").select("*").eq("race_id", raceId);
      
      if (raceData) setRace(raceData);
      if (optData) setOptions(optData);
      setLoading(false);
    }
    fetchData();
  }, [raceId]);

  if (loading) return <div style={{ padding: "100px", textAlign: "center", color: "#fff" }}>Ładowanie szczegółów biegu...</div>;
  if (!race) return <div style={{ padding: "100px", textAlign: "center", color: "#fff" }}>Bieg nie został znaleziony.</div>;

  return (
    <div style={{ paddingTop: "50px", minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>
        
        {/* NAWIGACJA */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <Link href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 700 }}>← POWRÓT</Link>
          <div style={{ display: "flex", gap: "10px" }}>
             <Link href={`/admin/races?id=${race.id}&action=edit`} style={{ padding: "8px 15px", background: "#f39c12", color: "#fff", borderRadius: "5px", textDecoration: "none", fontSize: "0.7rem", fontWeight: "bold" }}>EDYTUJ BIEG</Link>
          </div>
        </div>

        {/* NAGŁÓWEK BIEGU */}
        <div style={{ marginBottom: "50px" }}>
          <h1 style={{ fontSize: "3.5rem", fontWeight: 900, marginBottom: "10px" }}>{race.title}</h1>
          <div style={{ display: "flex", gap: "20px", color: "#666", fontSize: "0.9rem", fontWeight: "bold", textTransform: "uppercase" }}>
            <span>📅 {race.race_date}</span>
            <span>📍 {race.location}</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px" }}>
          {/* DODAWANIE WYNIKU */}
          <div>
            <RaceMyResult raceId={race.id} options={options} />
          </div>

          {/* LISTA ZAPISANYCH (Z TWOJEGO KOMPONENTU) */}
          <div>
            <ParticipationCard raceId={race.id} />
          </div>
        </div>
      </main>
    </div>
  );
}