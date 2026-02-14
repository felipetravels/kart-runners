"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ParticipationCard({ raceId }: { raceId: string }) {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchParticipants() {
      const { data, error } = await supabase
        .from("participation")
        .select(`
          user_id,
          profiles ( display_name )
        `)
        .eq("race_id", raceId);

      if (!error && data) {
        setParticipants(data);
      }
      setLoading(false);
    }
    fetchParticipants();
  }, [raceId]);

  if (loading) return <p>Ladowanie listy startowej...</p>;

  return (
    <div style={{ marginTop: "20px", padding: "20px", background: "rgba(255,255,255,0.05)", borderRadius: "10px" }}>
      <h3 style={{ color: "#00d4ff", marginBottom: "15px" }}>LISTA STARTOWA</h3>
      {participants.length === 0 ? (
        <p style={{ color: "#666" }}>Brak zapisanych osob.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {participants.map((p, i) => (
            <li key={i} style={{ padding: "8px 0", borderBottom: "1px solid #222" }}>
              {p.profiles?.display_name || "Anonimowy biegacz"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}