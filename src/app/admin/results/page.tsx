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
    const { data } = await supabase
      .from("race_results")
      .select(`
        id,
        time_seconds,
        user_id,
        races ( title ),
        race_options ( label ),
        profiles ( display_name )
      `)
      .order("race_results_created_at", { ascending: false });

    if (data) setResults(data);
    setLoading(false);
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć ten wynik? Tej operacji nie da się cofnąć.")) return;

    const { error } = await supabase
      .from("race_results")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Błąd: " + error.message);
    } else {
      setResults(results.filter(r => r.id !== id));
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading) return <div style={{ color: "#fff", padding: 50, textAlign: "center" }}>Ładowanie wszystkich wyników...</div>;

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px", color: "#fff" }}>
      <h1 style={{ fontWeight: 900, fontSize: "2rem", marginBottom: 30, color: "#ff4444" }}>Moderacja Wyników</h1>
      
      <div style={{ display: "grid", gap: 15 }}>
        {results.length > 0 ? results.map((res) => (
          <div key={res.id} style={rowStyle}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold" }}>{res.profiles?.display_name || "Nieznany"}</div>
              <div style={{ fontSize: "0.8rem", opacity: 0.5 }}>{res.races?.title} | {res.race_options?.label}</div>
            </div>
            <div style={{ textAlign: "right", marginRight: 20 }}>
              <div style={{ fontWeight: "bold", color: "#00ff00" }}>{formatTime(res.time_seconds)}</div>
            </div>
            <button 
              onClick={() => handleDelete(res.id)} 
              style={deleteBtnStyle}
            >
              USUŃ
            </button>
          </div>
        )) : (
          <p style={{ opacity: 0.5 }}>Brak wyników w bazie.</p>
        )}
      </div>
    </main>
  );
}

const rowStyle = { 
  display: "flex", 
  alignItems: "center", 
  background: "rgba(255,255,255,0.05)", 
  padding: "15px 20px", 
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.05)"
};

const deleteBtnStyle = { 
  background: "#ff4444", 
  color: "#fff", 
  border: "none", 
  padding: "8px 15px", 
  borderRadius: "8px", 
  cursor: "pointer", 
  fontWeight: "bold",
  fontSize: "0.75rem"
};