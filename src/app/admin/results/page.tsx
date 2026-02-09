"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    setLoading(true);
    // Pobieramy wyniki używając lewostronnego złączenia (left join), 
    // aby pokazać wynik nawet jeśli powiązane dane są uszkodzone.
    const { data, error } = await supabase
      .from("race_results")
      .select(`
        id,
        time_seconds,
        user_id,
        races ( title ),
        race_options ( label ),
        profiles ( display_name )
      `)
      .order("id", { ascending: false });

    if (error) {
      console.error("Błąd pobierania danych:", error);
    } else {
      setResults(data || []);
    }
    setLoading(false);
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć ten wynik?")) return;

    const { error } = await supabase
      .from("race_results")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Błąd podczas usuwania: " + error.message);
    } else {
      setResults(results.filter(r => r.id !== id));
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div style={{ color: "#fff", padding: 50, textAlign: "center" }}>Wczytywanie bazy wyników...</div>;

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px", color: "#fff" }}>
      <header style={{ marginBottom: 40, borderBottom: "1px solid #333", paddingBottom: 20 }}>
        <h1 style={{ fontWeight: 900, color: "#ff4444", margin: 0, fontSize: "2.2rem" }}>Panel Moderacji</h1>
        <p style={{ opacity: 0.5, marginTop: 10 }}>Widok wszystkich wyników zapisanych w systemie.</p>
      </header>
      
      <div style={{ display: "grid", gap: 15 }}>
        {results.length > 0 ? results.map((res) => (
          <div key={res.id} style={rowStyle}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold", fontSize: "1.1rem", color: res.profiles?.display_name ? "#fff" : "#ff4444" }}>
                {res.profiles?.display_name || "Brak profilu (ID: " + res.user_id.slice(0,8) + "...)"}
              </div>
              <div style={{ fontSize: "0.85rem", opacity: 0.6, marginTop: 4 }}>
                <strong>Bieg:</strong> {res.races?.title || "Bieg usunięty"} | <strong>Dystans:</strong> {res.race_options?.label || "Nieznany"}
              </div>
            </div>
            <div style={{ textAlign: "right", margin: "0 25px" }}>
              <div style={{ fontWeight: "900", color: "#00ff00", fontSize: "1.3rem" }}>{formatTime(res.time_seconds)}</div>
              <div style={{ fontSize: "0.7rem", opacity: 0.4 }}>ID: {res.id}</div>
            </div>
            <button 
              onClick={() => handleDelete(res.id)} 
              style={deleteBtnStyle}
              onMouseOver={(e) => e.currentTarget.style.background = "#ff4444"}
              onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,68,68,0.1)"}
            >
              USUŃ
            </button>
          </div>
        )) : (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "rgba(255,255,255,0.02)", borderRadius: 30, border: "2px dashed #333" }}>
            <p style={{ fontSize: "1.2rem", opacity: 0.5 }}>Baza wyników jest obecnie pusta.</p>
            <a href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: "bold" }}>← Wróć do strony głównej</a>
          </div>
        )}
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
  background: "rgba(255,68,68,0.1)", 
  color: "#fff", 
  border: "1px solid #ff4444", 
  padding: "10px 20px", 
  borderRadius: "12px", 
  cursor: "pointer", 
  fontWeight: "bold",
  fontSize: "0.8rem",
  transition: "all 0.2s"
};