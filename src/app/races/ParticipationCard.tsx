"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ParticipationCard({ raceId }: { raceId: string }) {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchParticipants() {
      // 1. Naprawiona nazwa tabeli: participations (z 's' na końcu)
      // 2. Pobieramy display_name oraz statusy opłat/rejestracji bezpośrednio z tabeli
      const { data, error } = await supabase
        .from("participations")
        .select(`
          user_id,
          display_name,
          is_registered,
          is_paid
        `)
        .eq("race_id", raceId);

      if (!error && data) {
        setParticipants(data);
      } else if (error) {
        console.error("Błąd pobierania uczestników:", error);
      }
      setLoading(false);
    }
    fetchParticipants();
  }, [raceId]);

  if (loading) return <p style={{color: "#666", fontWeight: 700}}>Ładowanie listy startowej...</p>;

  return (
    <div style={{ width: "100%" }}>
      {participants.length === 0 ? (
        <p style={{ color: "#666", fontWeight: 700, fontSize: "0.9rem" }}>Brak zapisanych osób na ten bieg.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {participants.map((p, i) => (
            <li key={i} style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "15px 0", 
              borderBottom: "1px solid #111", 
              color: "#eee", 
              fontWeight: 700 
            }}>
              <span>{p.display_name || "Biegacz"}</span>
              
              {/* Odznaki statusu obok imienia */}
              <div style={{ display: "flex", gap: "8px" }}>
                {p.is_registered && (
                  <span style={{ fontSize: "0.65rem", background: "#222", color: "#aaa", padding: "4px 8px", borderRadius: "6px", fontWeight: 900 }}>ZAPISANY</span>
                )}
                {p.is_paid && (
                  <span style={{ fontSize: "0.65rem", background: "#00d4ff", color: "#000", padding: "4px 8px", borderRadius: "6px", fontWeight: 900 }}>OPŁACONY</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}