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
      // Jeśli params.id nie istnieje, Next.js nie powinien tu nawet trafić
      if (!params || !params.id) return;

      const { data, error } = await supabase
        .from("races")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Błąd pobierania:", error);
      }
      setRace(data);
      setLoading(false);
    }
    fetchRace();
  }, [params]);

  if (loading) return <div style={{ paddingTop: "200px", textAlign: "center", color: "#fff" }}>Ładowanie szczegółów...</div>;
  
  if (!race) return (
    <div style={{ paddingTop: "200px", textAlign: "center", color: "#fff" }}>
      <h1>Nie znaleziono biegu</h1>
      <Link href="/races" style={{ color: "#00d4ff" }}>Powrót do listy</Link>
    </div>
  );

  return (
    <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
        <Link href="/races" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 900 }}>
          ← POWRÓT DO LISTY
        </Link>
        
        <div style={{ marginTop: "40px", padding: "40px", border: "1px solid #333", borderRadius: "20px", background: "rgba(255,255,255,0.05)" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: 900, marginBottom: "20px", color: "#fff" }}>{race.title}</h1>
          
          <div style={{ fontSize: "1.2rem", lineHeight: "1.8", color: "#ccc" }}>
            <p><strong>📅 DATA:</strong> {race.race_date}</p>
            <p><strong>📍 MIEJSCE:</strong> {race.location}</p>
            <p><strong>🏃 DYSTANS:</strong> {race.description || "Brak danych"}</p>
          </div>
        </div>
      </main>
    </div>
  );
}