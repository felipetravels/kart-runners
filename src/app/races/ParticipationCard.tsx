"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type Props = {
  raceId: number;
  options: any[];
};

export default function ParticipationCard({ raceId, options }: Props) {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState({
    wants_to_participate: false,
    registered: false,
    paid: false,
    option_id: ""
  });

  useEffect(() => {
    async function loadStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from("participations")
        .select("*")
        .eq("race_id", raceId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setStatus({
          wants_to_participate: !!data.wants_to_participate,
          registered: !!data.registered,
          paid: !!data.paid,
          option_id: data.option_id?.toString() || ""
        });
      }
      setLoading(false);
    }
    loadStatus();
  }, [raceId]);

  const saveStatus = async (newStatus: any) => {
    if (!userId) return alert("Musisz być zalogowany!");
    
    const { error } = await supabase.from("participations").upsert({
      user_id: userId,
      race_id: raceId,
      wants_to_participate: newStatus.wants_to_participate,
      registered: newStatus.registered,
      paid: newStatus.paid,
      option_id: newStatus.option_id ? parseInt(newStatus.option_id) : null
    }, { onConflict: 'user_id,race_id' });

    if (error) {
      console.error("Błąd zapisu statusu:", error);
      alert("Błąd zapisu: " + error.message);
    } else {
      setStatus(newStatus);
    }
  };

  if (loading) return <div style={{ color: "#aaa" }}>Ładowanie statusu...</div>;
  if (!userId) return <div style={{ padding: 20, background: "rgba(255,255,255,0.05)", borderRadius: 15 }}>Zaloguj się, aby zarządzać udziałem.</div>;

  return (
    <section style={{ background: "rgba(255,255,255,0.05)", padding: 25, borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)" }}>
      <h3 style={{ marginTop: 0, color: "#00d4ff" }}>Twoja deklaracja</h3>
      
      <div style={{ display: "grid", gap: 15 }}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <label style={checkStyle}>
            <input type="checkbox" checked={status.wants_to_participate} 
              onChange={e => saveStatus({...status, wants_to_participate: e.target.checked})} />
            Chcę wziąć udział
          </label>
          <label style={checkStyle}>
            <input type="checkbox" checked={status.registered} 
              onChange={e => saveStatus({...status, registered: e.target.checked})} />
            Zapisany(-a)
          </label>
          <label style={checkStyle}>
            <input type="checkbox" checked={status.paid} 
              onChange={e => saveStatus({...status, paid: e.target.checked})} />
            Opłacone
          </label>
        </div>

        <div style={{ marginTop: 10 }}>
          <label style={{ display: "block", marginBottom: 8, fontSize: "0.9rem", opacity: 0.7 }}>Wybierz swój dystans:</label>
          <select 
            value={status.option_id} 
            onChange={e => saveStatus({...status, option_id: e.target.value})}
            style={selectStyle}
          >
            <option value="">-- Wybierz z listy --</option>
            {options && options.map(opt => (
              <option key={opt.id} value={opt.id.toString()}>
                {opt.label} ({opt.distance_km} km)
              </option>
            ))}
          </select>
          {options.length === 0 && <p style={{ fontSize: "0.8rem", color: "#ff4444" }}>Brak zdefiniowanych dystansów dla tego biegu.</p>}
        </div>
      </div>
    </section>
  );
}

const checkStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" };
const selectStyle: React.CSSProperties = { width: "100%", padding: "12px", borderRadius: "10px", background: "#000", color: "#fff", border: "1px solid #444" };