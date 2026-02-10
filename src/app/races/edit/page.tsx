"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function EditRaceContent() {
  const searchParams = useSearchParams();
  const raceId = searchParams.get("id");
  const [race, setRace] = useState({ title: "", race_date: "", city: "", event_url: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUserAndFetch() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/login"; return; }
      
      if (raceId) {
        const { data } = await supabase.from("races").select("*").eq("id", raceId).single();
        if (data) setRace(data);
      }
      setLoading(false);
    }
    checkUserAndFetch();
  }, [raceId]);

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    const { error } = await supabase.from("races").update(race).eq("id", raceId);
    if (error) alert(error.message);
    else {
      alert("Zmiany zapisane pomyślnie!");
      window.location.href = `/races?id=${raceId}`;
    }
  };

  if (loading) return <div style={{ padding: 100, textAlign: "center", color: "#fff", fontWeight: 900 }}>ŁADOWANIE...</div>;

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: 20, color: "#fff" }}>
      <header style={{ marginBottom: 30 }}>
        <a href={`/races?id=${raceId}`} style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 900 }}>← POWRÓT DO SZCZEGÓŁÓW</a>
        <h1 style={{ fontWeight: 900, marginTop: 15, color: "#ffaa00" }}>POPRAW DANE BIEGU</h1>
      </header>
      <form onSubmit={handleUpdate} style={formS}>
        <div style={group}><label style={lab}>NAZWA ZAWODÓW</label><input value={race.title} onChange={e => setRace({...race, title: e.target.value})} style={inS} /></div>
        <div style={group}><label style={lab}>DATA</label><input type="date" value={race.race_date} onChange={e => setRace({...race, race_date: e.target.value})} style={{...inS, colorScheme: "dark"}} /></div>
        <div style={group}><label style={lab}>MIASTO</label><input value={race.city} onChange={e => setRace({...race, city: e.target.value})} style={inS} /></div>
        <div style={group}><label style={lab}>LINK DO WYDARZENIA (URL)</label><input placeholder="https://..." value={race.event_url || ""} onChange={e => setRace({...race, event_url: e.target.value})} style={inS} /></div>
        <button type="submit" style={btnS}>ZAPISZ ZMIANY</button>
      </form>
    </main>
  );
}
const formS = { display: "flex", flexDirection: "column" as const, gap: 20, background: "rgba(255,255,255,0.05)", padding: 40, borderRadius: 24, border: "1px solid #333" };
const group = { display: "flex", flexDirection: "column" as const, gap: 8 };
const lab = { fontSize: "0.75rem", opacity: 0.6, fontWeight: 900 };
const inS = { background: "#000", border: "1px solid #444", padding: "15px", borderRadius: "12px", color: "#fff", width: "100%" };
const btnS = { background: "#ffaa00", color: "#000", padding: "18px", borderRadius: "14px", fontWeight: 900, border: "none", cursor: "pointer" };

export default function EditRacePage() { return <Suspense><EditRaceContent /></Suspense>; }
