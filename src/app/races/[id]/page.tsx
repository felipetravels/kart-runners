"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // To jest kluczowe do pobrania ID z URL
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function RaceDetailPage() {
  const params = useParams();
  const [race, setRace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRace() {
      // Sprawdzamy czy mamy ID w adresie URL
      if (!params?.id) return;

      const { data } = await supabase
        .from("races")
        .select("*")
        .eq("id", params.id)
        .single(); // .single() zapewnia, że pobieramy JEDEN bieg, a nie listę

      setRace(data);
      setLoading(false);
    }
    fetchRace();
  }, [params]);

  // Padding 180px żeby navbar nie zasłaniał komunikatu ładowania
  if (loading) return <div style={{ paddingTop: "180px", textAlign: "center", color: "#fff" }}>Ładowanie...</div>;
  if (!race) return <div style={{ paddingTop: "180px", textAlign: "center", color: "#fff" }}>Nie znaleziono biegu.</div>;

  return (
    <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px 40px" }}>
        <Link href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 900, fontSize: "1.1rem" }}>
          ← POWRÓT
        </Link>
        
        <div style={{ marginTop: "40px", padding: "40px", border: "1px solid #333", borderRadius: "20px", background: "rgba(255,255,255,0.05)" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: 900, marginBottom: "20px", lineHeight: 1.1 }}>{race.title}</h1>
          
          <div style={{ fontSize: "1.2rem", lineHeight: "1.8", color: "#ccc" }}>
            <p><strong>📅 DATA:</strong> {race.race_date}</p>
            <p><strong>📍 MIEJSCE:</strong> {race.location}</p>
            <p><strong>🏃 DYSTANS:</strong> {race.description || "Brak danych"}</p>
          </div>

          {race.results_link && (
            <div style={{ marginTop: "30px" }}>
              <a href={race.results_link} target="_blank" style={{ 
                background: "#00d4ff", color: "#000", padding: "15px 30px", 
                borderRadius: "10px", fontWeight: 900, textDecoration: "none", display: "inline-block" 
              }}>
                ZOBACZ WYNIKI OFICJALNE
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}