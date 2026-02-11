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

  if (loading) return <div style={{ paddingTop: "180px", textAlign: "center", color: "#fff" }}>Ładowanie szczegółów...</div>;
  if (!race) return <div style={{ paddingTop: "180px", textAlign: "center", color: "#fff" }}>Nie znaleziono biegu.</div>;

  return (
    <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px 40px" }}>
        <Link href="/races" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 900, fontSize: "1.1rem" }}>
          ← POWRÓT DO LISTY
        </Link>
        <div style={{ marginTop: "30px", background: "rgba(255,255,255,0.05)", padding: "40px", borderRadius: "20px", border: "1px solid #333" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "20px" }}>{race.title}</h1>
          <div style={{ display: "grid", gap: "15px", fontSize: "1.1rem", color: "#ccc" }}>
            <p>📅 <strong>DATA:</strong> {race.race_date}</p>
            <p>📍 <strong>MIEJSCE:</strong> {race.location}</p>
            <p>🏃 <strong>DYSTANS:</strong> {race.description || "Brak danych"}</p>
          </div>
        </div>
      </main>
    </div>
  );
}