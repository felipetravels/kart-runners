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

  if (loading) return <p style={{color: "#666"}}>Ladowanie listy startowej...</p>;

  return (
    <div style={{ marginTop: "40px", padding: "30px", background: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid #222" }}>
      <h3 style={{ color: "#00d4ff", marginBottom: "20px", fontWeight: 900 }}>LISTA STARTOWA</h3>
      {participants.length === 0 ? (
        <p style={{ color: "#444" }}>Brak zapisanych osob na ten bieg.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {participants.map((p, i) => (
            <li key={i} style={{ padding: "12px 0", borderBottom: "1px solid #111", color: "#eee", fontWeight: 600 }}>
              {p.profiles?.display_name || "Anonimowy biegacz"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
