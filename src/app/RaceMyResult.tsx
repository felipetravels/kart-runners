"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type Props = {
  raceId: number;
  options: any[];
};

export default function RaceMyResult({ raceId, options }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [optionId, setOptionId] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return alert("Zaloguj się!");
    if (!optionId) return alert("Wybierz dystans!");

    setLoading(true);
    const totalSeconds = (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);

    const { error } = await supabase.from("race_results").upsert({
      user_id: userId,
      race_id: raceId,
      option_id: parseInt(optionId),
      finish_time_seconds: totalSeconds
    }, { onConflict: 'user_id,race_id,option_id' });

    setLoading(false);
    if (error) {
      alert("Błąd: " + error.message);
    } else {
      setMessage("✅ Wynik zapisany!");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (!userId) return null;

  return (
    <section>
      <h3 style={{ marginTop: 0, color: "#00d4ff" }}>Twój czas</h3>
      <form onSubmit={handleSaveResult} style={{ display: "grid", gap: 15 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: "150px" }}>
            <label style={labelSmall}>Dystans</label>
            <select required value={optionId} onChange={e => setOptionId(e.target.value)} style={inputStyle}>
              <option value="">-- Wybierz dystans --</option>
              {options && options.map(o => (
                <option key={o.id} value={o.id.toString()}>{o.label} ({o.distance_km}km)</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelSmall}>Minuty</label>
            <input type="number" required placeholder="min" value={minutes} onChange={e => setMinutes(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelSmall}>Sekundy</label>
            <input type="number" required max="59" placeholder="sek" value={seconds} onChange={e => setSeconds(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? "ZAPISYWANIE..." : (message || "ZAPISZ MÓJ WYNIK")}
        </button>
      </form>
    </section>
  );
}

const labelSmall: React.CSSProperties = { fontSize: "0.8rem", opacity: 0.6, display: "block", marginBottom: 5 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "12px", borderRadius: "10px", background: "#000", color: "#fff", border: "1px solid #444", boxSizing: "border-box" };
const btnStyle: React.CSSProperties = { padding: "15px", borderRadius: "10px", border: "none", background: "#00ff00", color: "#000", fontWeight: "900", cursor: "pointer" };