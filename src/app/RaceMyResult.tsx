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
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);

    const { error } = await supabase.from("race_results").upsert({
      user_id: userId,
      race_id: raceId,
      option_id: parseInt(optionId),
      finish_time_seconds: totalSeconds
    });

    if (error) alert("Błąd zapisu czasu: " + error.message);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (!userId) return null;

  return (
    <section>
      <h3 style={{ marginTop: 0 }}>Twój wynik</h3>
      <form onSubmit={handleSaveResult} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: "150px" }}>
          <label style={{ fontSize: "0.8rem", opacity: 0.6 }}>Dystans</label>
          <select required value={optionId} onChange={e => setOptionId(e.target.value)} style={inputStyle}>
            <option value="">Wybierz...</option>
            {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
        <div style={{ width: "80px" }}>
          <label style={{ fontSize: "0.8rem", opacity: 0.6 }}>Minuty</label>
          <input type="number" required placeholder="MM" value={minutes} onChange={e => setMinutes(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ width: "80px" }}>
          <label style={{ fontSize: "0.8rem", opacity: 0.6 }}>Sekundy</label>
          <input type="number" required placeholder="SS" max="59" value={seconds} onChange={e => setSeconds(e.target.value)} style={inputStyle} />
        </div>
        <button type="submit" style={btnStyle}>
          {saved ? "ZAPISANO!" : "ZAPISZ CZAS"}
        </button>
      </form>
    </section>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "10px", borderRadius: "8px", background: "#111", color: "#fff", border: "1px solid #444", marginTop: "5px" };
const btnStyle: React.CSSProperties = { padding: "12px 20px", borderRadius: "8px", border: "none", background: "#00ff00", color: "#000", fontWeight: "bold", cursor: "pointer" };