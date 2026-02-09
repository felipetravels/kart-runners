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
  const [results, setResults] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    async function fetch() {
      if (!raceId) return;
      const [r, o, res] = await Promise.all([
        supabase.from("races").select("*").eq("id", raceId).single(),
        supabase.from("race_options").select("*").eq("race_id", raceId),
        supabase.from("race_results").select("*, profiles(display_name, team), race_options(distance_km)").eq("race_id", raceId)
      ]);
      setRace(r.data);
      setOptions(o.data || []);
      setResults(res.data || []);
    }
    fetch();
  }, [raceId]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0 ? `${h}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}` : `${m}:${sec.toString().padStart(2,'0')}`;
  };

  const calcPace = (s: number, km: number) => {
    if (!km || km === 0) return "--:--";
    const totalMin = (s / 60) / km;
    const min = Math.floor(totalMin);
    const sec = Math.round((totalMin - min) * 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (!race) return null;

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 20, color: "#fff" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 900 }}>{race.title}</h1>
      <p style={{ opacity: 0.6 }}>{race.race_date} | {race.city}</p>
      
      <div style={{ display: "grid", gap: 20, marginTop: 30 }}>
        <ParticipationCard raceId={race.id} options={options} />
        <RaceMyResult raceId={race.id} options={options} />

        <section style={{ background: "#111", padding: 20, borderRadius: 20 }}>
          <h3 style={{ color: "#00d4ff" }}>Wyniki ekipy</h3>
          {results.sort((a,b) => a.time_seconds - b.time_seconds).map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #222" }}>
              <span>{i+1}. {r.profiles?.display_name}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: "bold", color: "#00ff88" }}>{formatTime(r.time_seconds)}</div>
                <div style={{ fontSize: "0.7rem", opacity: 0.5 }}>Tempo: {calcPace(r.time_seconds, r.race_options?.distance_km)} min/km</div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

export default function RaceDetailsPage() {
  return <Suspense><RaceDetailsContent /></Suspense>;
}
