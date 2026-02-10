"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ParticipationCard from "./ParticipationCard";
import RaceMyResult from "@/app/RaceMyResult";

function RaceDetailsContent() {
  const searchParams = useSearchParams();
  const raceId = searchParams.get("id");
  const [race, setRace] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!raceId) return;
      const [u, r, o, res] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from("races").select("*").eq("id", raceId).single(),
        supabase.from("race_options").select("*").eq("race_id", raceId).order("sort_order"),
        supabase.from("race_results").select("*, profiles(display_name, avatar_url), race_options(distance_km)").eq("race_id", raceId)
      ]);
      setUser(u.data.session?.user ?? null);
      setRace(r.data);
      setOptions(o.data || []);
      setResults(res.data || []);
      setLoading(false);
    }
    fetch();
  }, [raceId]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return (h > 0 ? h.toString().padStart(2,'0')+":" : "") + m.toString().padStart(2,'0')+":" + sec.toString().padStart(2,'0');
  };

  if (loading) return <div style={{ padding: 100, textAlign: "center", color: "#fff", fontWeight: 900 }}>ŁADOWANIE...</div>;

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      <header style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <a href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 900 }}>← POWRÓT</a>
          {user && (
            <a href={`/races/edit?id=${raceId}`} style={{ background: "rgba(255,170,0,0.1)", color: "#ffaa00", border: "2px solid #ffaa00", padding: "10px 20px", borderRadius: "12px", textDecoration: "none", fontWeight: 900 }}>✎ EDYTUJ BIEG</a>
          )}
        </div>
        <h1 style={{ fontSize: "3.5rem", fontWeight: 900, margin: "25px 0" }}>{race?.title}</h1>
        <p style={{ opacity: 0.7, fontSize: "1.2rem" }}>📍 {race?.city} | 📅 {race?.race_date}</p>
      </header>

      <div style={{ display: "grid", gap: 35 }}>
        {/* TU BYŁ BŁĄD - Teraz typy się zgadzają */}
        <ParticipationCard raceId={raceId || ""} options={options} />
        <RaceMyResult raceId={raceId || ""} options={options} />
        
        <section style={{ background: "rgba(25,25,25,0.85)", padding: "40px", borderRadius: "28px", border: "1px solid #333" }}>
          <h3 style={{ color: "#00d4ff", marginTop: 0, marginBottom: 25, fontWeight: 900 }}>WYNIKI EKIPY</h3>
          {results.length > 0 ? results.sort((a,b) => a.time_seconds - b.time_seconds).map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", borderBottom: "1px solid #222" }}>
              <span style={{ fontWeight: 900 }}>{r.profiles?.display_name}</span>
              <span style={{ color: "#00ff88", fontWeight: 900 }}>{formatTime(r.time_seconds)}</span>
            </div>
          )) : <p style={{opacity: 0.5}}>Brak wyników.</p>}
        </section>
      </div>
    </main>
  );
}

export default function RaceDetailsPage() { return <Suspense><RaceDetailsContent /></Suspense>; }
