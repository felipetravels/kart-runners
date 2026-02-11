"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function RacesContent() {
  const searchParams = useSearchParams();
  const raceId = searchParams.get("id");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (raceId) {
          const { data: race, error } = await supabase
            .from("races")
            .select("*")
            .eq("id", raceId)
            .single();
          if (error) throw error;
          setData(race);
        } else {
          const { data: races, error } = await supabase
            .from("races")
            .select("*")
            .order("race_date", { ascending: false });
          if (error) throw error;
          setData(races);
        }
      } catch (err) {
        console.error("Błąd:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [raceId]);

  if (loading) return <div style={{ paddingTop: "200px", textAlign: "center", color: "#fff" }}>Ładowanie danych...</div>;

  // WIDOK SZCZEGÓŁÓW
  if (raceId && data && !Array.isArray(data)) {
    return (
      <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
        <main style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
          <Link href="/races" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 900, fontSize: "1.1rem" }}>
            ← POWRÓT DO LISTY
          </Link>
          <div style={{ marginTop: "40px", padding: "40px", border: "1px solid #333", borderRadius: "20px", background: "rgba(255,255,255,0.05)" }}>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "20px", color: "#fff" }}>{data.title}</h1>
            <div style={{ fontSize: "1.2rem", lineHeight: "1.6", color: "#ccc" }}>
              <p>📅 <strong>DATA:</strong> {data.race_date}</p>
              <p>📍 <strong>MIEJSCE:</strong> {data.location}</p>
              <p>🏃 <strong>OPIS:</strong> {data.description || "Brak dodatkowych informacji"}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // WIDOK LISTY
  return (
    <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px 40px" }}>
        <header style={{ marginBottom: 40 }}>
          <Link href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 900, fontSize: "1.1rem" }}>
            ← POWRÓT DO STARTU
          </Link>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginTop: 25 }}>KALENDARZ BIEGÓW</h1>
        </header>
        <div style={{ display: "grid", gap: "20px" }}>
          {Array.isArray(data) && data.map((race) => (
            <div key={race.id} style={{ background: "rgba(255,255,255,0.03)", padding: "25px", borderRadius: "15px", border: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.3rem", color: "#00d4ff" }}>{race.title}</h2>
                <p style={{ color: "#888", margin: "5px 0 0" }}>{race.race_date} • {race.location}</p>
              </div>
              <Link href={`/races?id=${race.id}`} style={{ color: "#fff", border: "1px solid #444", padding: "8px 15px", borderRadius: "5px", textDecoration: "none" }}>
                SZCZEGÓŁY
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function RacesPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: "200px", textAlign: "center", color: "#fff" }}>Inicjalizacja...</div>}>
      <RacesContent />
    </Suspense>
  );
}