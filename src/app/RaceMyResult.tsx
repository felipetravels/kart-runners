"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RaceMyResult({ raceId, options }: { raceId: any, options: any[] }) {
  const [h, setH] = useState("0");
  const [m, setM] = useState("0");
  const [s, setS] = useState("0");
  const [selectedOption, setSelectedOption] = useState("");

  const handleSave = async () => {
    const totalSeconds = (parseInt(h) * 3600) + (parseInt(m) * 60) + parseInt(s);
    if (totalSeconds <= 0 || !selectedOption) return alert("Wpisz czas i wybierz dystans!");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return alert("Musisz być zalogowany!");

    const { error } = await supabase.from("race_results").insert([{
      race_id: raceId,
      user_id: session.user.id,
      option_id: selectedOption,
      time_seconds: totalSeconds
    }]);

    if (!error) {
      alert("Wynik zapisany!");
      window.location.reload();
    }
  };

  return (
    <section style={{ background: "rgba(0,212,255,0.1)", padding: 25, borderRadius: 20, border: "1px solid #00d4ff" }}>
      <h3 style={{ marginTop: 0, color: "#00d4ff" }}>Mój Wynik</h3>
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <div style={{ flex: 1 }}>
          <label style={labelS}>Godz.</label>
          <input type="number" value={h} onChange={e => setH(e.target.value)} style={inputS} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelS}>Min.</label>
          <input type="number" value={m} onChange={e => setM(e.target.value)} style={inputS} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelS}>Sek.</label>
          <input type="number" value={s} onChange={e => setS(e.target.value)} style={inputS} />
        </div>
      </div>
      <select value={selectedOption} onChange={e => setSelectedOption(e.target.value)} style={{ ...inputS, marginBottom: 15 }}>
        <option value="">Wybierz dystans...</option>
        {options.map(o => <option key={o.id} value={o.id}>{o.label} ({o.distance_km} km)</option>)}
      </select>
      <button onClick={handleSave} style={btnS}>ZAPISZ WYNIK</button>
    </section>
  );
}
const labelS = { fontSize: "0.7rem", opacity: 0.5, display: "block", marginBottom: 5 };
const inputS = { background: "#000", border: "1px solid #333", padding: 10, borderRadius: 8, color: "#fff", width: "100%" };
const btnS = { background: "#00ff88", color: "#000", border: "none", padding: "12px", borderRadius: 8, fontWeight: "bold", width: "100%", cursor: "pointer" };
