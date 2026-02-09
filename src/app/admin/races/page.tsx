"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminRacesPage() {
  const [races, setRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRaces();
  }, []);

  async function fetchRaces() {
    setLoading(true);
    const { data } = await supabase.from("races").select("*").order("race_date", { ascending: false });
    if (data) setRaces(data);
    setLoading(false);
  }

  const handleDeleteRace = async (id: number) => {
    if (!confirm("UWAGA: Usunięcie biegu usunie też wszystkie przypisane do niego dystanse i wyniki!")) return;
    const { error } = await supabase.from("races").delete().eq("id", id);
    if (error) alert("Błąd: " + error.message);
    else setRaces(races.filter(r => r.id !== id));
  };

  if (loading) return <div style={{ color: "#fff", padding: 50, textAlign: "center" }}>Wczytywanie...</div>;

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px", color: "#fff" }}>
      <h1 style={{ fontWeight: 900, color: "#00d4ff", marginBottom: 30 }}>Zarządzaj Biegami</h1>
      <div style={{ display: "grid", gap: 15 }}>
        {races.map((race) => (
          <div key={race.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#111", padding: 20, borderRadius: 15, border: "1px solid #222" }}>
            <div>
              <div style={{ fontWeight: "bold" }}>{race.title}</div>
              <div style={{ fontSize: "0.8rem", opacity: 0.5 }}>{race.city} | {race.race_date}</div>
            </div>
            <button onClick={() => handleDeleteRace(race.id)} style={{ background: "none", color: "#ff4444", border: "1px solid #ff4444", padding: "8px 15px", borderRadius: 10, cursor: "pointer", fontWeight: "bold" }}>
              USUŃ
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}