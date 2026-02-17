"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RaceMyResult({ raceId, options }: { raceId: any, options: any[] }) {
  const [h, setH] = useState("0");
  const [m, setM] = useState("0");
  const [s, setS] = useState("0");
  const [selectedOption, setSelectedOption] = useState("");

  const handleSave = async () => {
    // Konwersja na liczby, aby uniknąć błędów tekstowych
    const hours = parseInt(h) || 0;
    const minutes = parseInt(m) || 0;
    const seconds = parseInt(s) || 0;

    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    
    if (totalSeconds <= 0) return alert("Wpisz poprawny czas!");
    if (!selectedOption) return alert("Wybierz dystans z listy!");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return alert("Musisz być zalogowany, aby zapisać wynik!");

    const { error } = await supabase.from("race_results").insert([{
      race_id: raceId,
      user_id: session.user.id,
      option_id: selectedOption,
      time_seconds: totalSeconds
    }]);

    if (!error) {
      alert("Wynik został zapisany!");
      window.location.reload();
    } else {
      alert("Błąd zapisu: " + error.message);
    }
  };

  return (
    <section style={{ background: "rgba(0,212,255,0.05)", padding: 25, borderRadius: 24, border: "1px solid rgba(0,212,255,0.3)" }}>
      <h3 style={{ marginTop: 0, color: "#00d4ff", fontSize: "1.1rem", textTransform: "uppercase" }}>Mój Wynik</h3>
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <div style={{ flex: 1 }}>
          <label style={labelS}>Godz.</label>
          <input type="number" min="0" value={h} onChange={e => setH(e.target.value)} style={inputS} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelS}>Min.</label>
          <input type="number" min="0" max="59" value={m} onChange={e => setM(e.target.value)} style={inputS} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelS}>Sek.</label>
          <input type="number" min="0" max="59" value={s} onChange={e => setS(e.target.value)} style={inputS} />
        </div>
      </div>
      <div style={{ marginBottom: 15 }}>
        <label style={labelS}>Wybierz dystans</label>
        <select value={selectedOption} onChange={e => setSelectedOption(e.target.value)} style={inputS}>
          <option value="">-- Wybierz dystans --</option>
          {options.map(o => (
            <option key={o.id} value={o.id}>{o.label} ({o.distance_km} km)</option>
          ))}
        </select>
      </div>
      <button onClick={handleSave} style={btnS}>ZAPISZ WYNIK</button>
    </section>
  );
}

const labelS = { fontSize: "0.7rem", opacity: 0.6, display: "block", marginBottom: 5, fontWeight: "bold", color: "#fff" };
const inputS = { background: "#000", border: "1px solid #333", padding: "12px", borderRadius: 12, color: "#fff", width: "100%", outline: "none" };
const btnS = { background: "#00d4ff", color: "#000", border: "none", padding: "14px", borderRadius: 12, fontWeight: "900", width: "100%", cursor: "pointer", marginTop: "10px", letterSpacing: "1px" };