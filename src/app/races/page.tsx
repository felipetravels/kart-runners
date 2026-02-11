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
      if (raceId) {
        // POBIERANIE POJEDYNCZEGO BIEGU
        const { data: race } = await supabase
          .from("races")
          .select("*")
          .eq("id", raceId)
          .single();
        setData(race);
      } else {
        // POBIERANIE LISTY BIEGÓW
        const { data: races } = await supabase
          .from("races")
          .select("*")
          .order("race_date", { ascending: false });
        setData(races);
      }
      setLoading(false);
    }
    fetchData();
  }, [raceId]);

  if (loading) return <div style={{ paddingTop: "200px", textAlign: "center", color: "#fff" }}>Ładowanie danych...</div>;

  // WIDOK SZCZEGÓŁÓW BIEGU
  if (raceId && data && !Array.isArray(data)) {
    return (
      <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
        <main style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px 60px" }}>
          <Link href="/races" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 900, fontSize: "1.1rem" }}>
            ← POWRÓT DO LISTY
          </Link>
          <div style={{ 
            marginTop: "40px", padding: "40px", border: "1px solid #333", 
            borderRadius: "20px", background: "rgba(255,255,255,0.05)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)" 
          }}>
            <span style={{ color: "#00d4ff", fontWeight: 900, letterSpacing: "2px", fontSize: "0.8rem" }}>SZCZEGÓŁY WYDARZENIA</span>
            <h1 style={{ fontSize: "3rem", fontWeight: 900, margin: "15px 0 25px", lineHeight: 1.1 }}>{data.title}</h1>
            <div style={{ display: "grid", gap: "20px", fontSize: "1.2rem", color: "#ddd" }}>
              <p>📅 <strong>DATA:</strong> {data.race_date}</p>
              <p>📍 <strong>MIEJSCE:</strong> {data.location}</p>
              <p>🏃 <strong>DYSTANS / OPIS:</strong> {data.description || "Brak szczegółowych danych"}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // WIDOK LISTY BIEGÓW
  return (
    <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a" }}>
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px 60px", color: "#fff" }}>
        <header style={{ marginBottom: 50 }}>
          <Link href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 900, fontSize: "1.1rem" }}>
            ← POWRÓT DO STARTU
          </Link>
          <h1 style={{ fontSize: "3rem", fontWeight: 900, marginTop: 25, letterSpacing: "-1px" }}>KALENDARZ BIEGÓW</h1>
        </header>
        <div style={{ display: "grid", gap: "20px" }}>
          {(data as any[])?.map((race) => (
            <div key={race.id} style={{ 
              background: "rgba(255,255,255,0.03)", padding: "30px", borderRadius: "15px", 
              border: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center" 
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.4rem", color: "#00d4ff", fontWeight: 800 }}>{race.title}</h2>
                <p style={{ color: "#888", margin: "8px 0 0", fontSize: "1rem" }}>{race.race_date} • {race.location}</p>
              </div>
              <Link href={`/races?id=${race.id}`} style={{ 
                color: "#000", background: "#fff", padding: "10px 20px", borderRadius: "8px", 
                textDecoration: "none", fontWeight: 800, fontSize: "0.9rem" 
              }}>
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