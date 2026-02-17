"use client";
import { useEffect, useState, use } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";
import ParticipationCard from "../ParticipationCard";
import RaceMyResult from "@/app/RaceMyResult"; // Importujemy komponent do wyników

interface Race {
  id: string;
  name: string;      // Zmieniono z title na name (częstsze w Twoim API)
  date: string;      // Zmieniono z race_date na date
  location: string;
  description: string;
}

export default function RaceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const raceId = resolvedParams.id;

  const [race, setRace] = useState<any | null>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRaceAndOptions() {
      if (!raceId) return;

      // 1. Pobieramy dane biegu
      const { data: raceData, error: raceError } = await supabase
        .from("races")
        .select("*")
        .eq("id", raceId)
        .single();

      // 2. Pobieramy opcje dystansów (potrzebne dla RaceMyResult)
      const { data: optionsData } = await supabase
        .from("race_options")
        .select("*")
        .eq("race_id", raceId);

      if (!raceError && raceData) {
        setRace(raceData);
        setOptions(optionsData || []);
      }
      setLoading(false);
    }
    fetchRaceAndOptions();
  }, [raceId]);

  if (loading) return <div style={{ paddingTop: "200px", textAlign: "center", color: "#fff" }}>Ładowanie szczegółów biegu...</div>;

  if (!race) {
    return (
      <div style={{ paddingTop: "200px", textAlign: "center", color: "#fff" }}>
        <h1>Nie znaleziono biegu w bazie</h1>
        <p style={{ opacity: 0.5, marginBottom: "20px" }}>ID: {raceId}</p>
        <Link href="/races" style={{ color: "#00d4ff", fontWeight: "bold" }}>← POWRÓT DO LISTY</Link>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "150px", minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px 60px" }}>
        
        {/* NAGŁÓWEK I NAWIGACJA */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <Link href="/races" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 900, fontSize: "0.8rem" }}>
            ← POWRÓT DO LISTY
          </Link>
          <Link 
            href={`/admin/races?id=${race.id}&action=edit`} 
            style={{ padding: "8px 16px", background: "#f39c12", color: "#fff", borderRadius: "8px", textDecoration: "none", fontSize: "0.8rem", fontWeight: "bold" }}
          >
            EDYTUJ BIEG
          </Link>
        </div>

        {/* KARTA GŁÓWNA BIEGU */}
        <div style={{ padding: "40px", border: "1px solid #222", borderRadius: "24px", background: "linear-gradient(145deg, #111, #050505)", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "15px", color: "#fff" }}>{race.name}</h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", color: "#aaa", fontSize: "0.9rem" }}>
            <p><span style={{ color: "#00d4ff" }}>📅 DATA:</span> {race.date || "Do ustalenia"}</p>
            <p><span style={{ color: "#00d4ff" }}>📍 MIEJSCE:</span> {race.location || "Nie podano"}</p>
          </div>
          {race.description && (
            <p style={{ marginTop: "20px", color: "#666", fontSize: "0.85rem", lineHeight: "1.6" }}>{race.description}</p>
          )}
        </div>

        {/* SEKCJA WPISYWANIA WYNIKU (To tutaj Artur i inni dodają czas) */}
        <div style={{ marginBottom: "30px" }}>
          <RaceMyResult raceId={race.id} options={options} />
        </div>

        {/* LISTA UCZESTNIKÓW */}
        <ParticipationCard raceId={race.id} />
        
      </main>
    </div>
  );
}