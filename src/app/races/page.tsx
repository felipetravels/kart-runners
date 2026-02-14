"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ParticipationCard from "./ParticipationCard"; 

function RacesContent() {
  const searchParams = useSearchParams();
  const raceId = searchParams.get("id");
  const router = useRouter();

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

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten bieg?")) return;
    const { error } = await supabase.from("races").delete().eq("id", id);
    if (error) alert("Błąd: " + error.message);
    else window.location.href = "/races";
  };

  const handleCopy = async (race: any) => {
    const { id, created_at, ...raceData } = race;
    const { data: inserted, error } = await supabase
      .from("races")
      .insert([{ ...raceData, title: `${race.title} (KOPIA)` }])
      .select()
      .single();

    if (error) alert("Błąd kopiowania");
    else router.push(`/races?id=${inserted.id}`);
  };

  if (loading) return <div style={{ paddingTop: "200px", textAlign: "center", color: "#fff" }}>Ładowanie danych...</div>;

  // WIDOK SZCZEGÓŁÓW BIEGU
  if (raceId && data && !Array.isArray(data)) {
    return (
      <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
        <main style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px 60px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            <Link href="/races" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 900 }}>
              ← POWRÓT DO LISTY
            </Link>
            <div style={{ display: "flex", gap: "10px" }}>
               {/* LINK DO EDYCJI - SPRAWDZONY */}
               <Link href={`/races/edit?id=${data.id}`} style={{
                  padding: "10px 20px", background: "#f39c12", color: "#fff", borderRadius: "5px", textDecoration: "none", fontWeight: "bold"
               }}>
                 EDYTUJ
               </Link>
               <button onClick={() => handleCopy(data)} style={{
                  padding: "10px 20px", background: "#3498db", color: "#fff", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: "bold"
               }}>
                 KOPIUJ
               </button>
               <button onClick={() => handleDelete(data.id)} style={{
                  padding: "10px 20px", background: "#c0392b", color: "#fff", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: "bold"
               }}>
                 USUŃ
               </button>
            </div>
          </div>

          <div style={{ padding: "40px", border: "1px solid #333", borderRadius: "20px", background: "rgba(255,255,255,0.05)", marginBottom: "40px" }}>
            <h1 style={{ fontSize: "3rem", fontWeight: 900, marginBottom: "20px" }}>{data.title}</h1>
            <p>📅 <strong>DATA:</strong> {data.race_date}</p>
            <p>📍 <strong>MIEJSCE:</strong> {data.location}</p>
            <p>🏃 <strong>DYSTANS:</strong> {data.description}</p>
          </div>

          <ParticipationCard raceId={data.id} />
        </main>
      </div>
    );
  }

  // WIDOK LISTY BIEGÓW
  return (
    <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px 40px" }}>
        <header style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Link href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 900 }}>← POWRÓT</Link>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginTop: 15 }}>KALENDARZ BIEGÓW</h1>
          </div>
          {/* PRZYCISK DODAWANIA - USTAWIONY NA /edit DLA SPÓJNOŚCI */}
          <Link href="/races/edit" style={{ 
            background: "#00d4ff", color: "#000", padding: "12px 24px", borderRadius: "8px", 
            fontWeight: 900, textDecoration: "none" 
          }}>
            + DODAJ NOWY BIEG
          </Link>
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
    <Suspense fallback={<div style={{ paddingTop: "200px", textAlign: "center" }}>Inicjalizacja...</div>}>
      <RacesContent />
    </Suspense>
  );
}