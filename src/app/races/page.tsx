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
    const { data, error } = await supabase
      .from("races")
      .select("*")
      .order("race_date", { ascending: false });

    if (error) {
      console.error("Błąd pobierania biegów:", error);
    } else {
      setRaces(data || []);
    }
    setLoading(false);
  }

  const handleDeleteRace = async (id: number) => {
    if (!confirm("UWAGA: Usunięcie biegu usunie też wszystkie przypisane do niego dystanse i wyniki! Kontynuować?")) return;

    const { error } = await supabase
      .from("races")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Błąd: " + error.message);
    } else {
      setRaces(races.filter(r => r.id !== id));
    }
  };

  if (loading) return <div style={{ color: "#fff", padding: 50, textAlign: "center" }}>Wczytywanie biegów...</div>;

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px", color: "#fff" }}>
      <header style={{ marginBottom: 40, borderBottom: "1px solid #333", paddingBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "end" }}>
        <div>
          <h1 style={{ fontWeight: 900, color: "#00d4ff", margin: 0, fontSize: "2.2rem" }}>Zarządzaj Biegami</h1>
          <p style={{ opacity: 0.5, marginTop: 10 }}>Usuwaj wydarzenia i czyść listę.</p>
        </div>
        <a href="/dashboard" style={{ background: "#00d4ff", color: "#000", padding: "10px 20px", borderRadius: "10px", textDecoration: "none", fontWeight: "bold", fontSize: "0.9rem" }}>
          + NOWY BIEG
        </a>
      </header>

      <div style={{ display: "grid", gap: 15 }}>
        {races.length > 0 ? races.map((race) => (
          <div key={race.id} style={rowStyle}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{race.title}</div>
              <div style={{ fontSize: "0.85rem", opacity: 0.6, marginTop: 4 }}>
                📍 {race.city} | 📅 {race.race_date}
              </div>
            </div>
            <button 
              onClick={() => handleDeleteRace(race.id)} 
              style={deleteBtnStyle}
            >
              USUŃ BIEG
            </button>
          </div>
        )) : (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "rgba(255,255,255,0.02)", borderRadius: 30, border: "2px dashed #333" }}>
            <p style={{ fontSize: "1.2rem", opacity: 0.5 }}>Brak biegów w bazie.</p>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: 40, textAlign: "center" }}>
        <a href="/admin/results" style={{ color: "#666", textDecoration: "none", fontSize: "0.9rem" }}>
          Przejdź do moderacji wyników →
        </a>
      </div>
    </main>
  );
}

const rowStyle: React.CSSProperties = { 
  display: "flex", 
  alignItems: "center", 
  background: "#111", 
  padding: "20px 25px", 
  borderRadius: "20px",
  border: "1px solid #222"
};

const deleteBtnStyle: React.CSSProperties = { 
  background: "none", 
  color: "#ff4444", 
  border: "1px solid #ff4444", 
  padding: "10px 20px", 
  borderRadius: "12px", 
  cursor: "pointer", 
  fontWeight: "bold",
  fontSize: "0.8rem"
};