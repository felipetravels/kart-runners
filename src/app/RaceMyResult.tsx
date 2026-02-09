"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type Props = {
  raceId: number;
  options: any[];
};

export default function RaceMyResult({ raceId, options: initialOptions }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [options, setOptions] = useState(initialOptions || []);
  const [optionId, setOptionId] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const [showAddOption, setShowAddOption] = useState(false);
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionKm, setNewOptionKm] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
    setOptions(initialOptions || []);
  }, [initialOptions]);

  const handleAddOption = async () => {
    if (!newOptionLabel || !newOptionKm) return alert("Podaj nazwę i KM!");
    setLoading(true);
    
    const { data, error } = await supabase
      .from("race_options")
      .insert([{ 
        race_id: raceId, 
        label: newOptionLabel, 
        distance_km: parseFloat(newOptionKm),
        sort_order: options.length 
      }])
      .select()
      .single();

    if (error) {
      alert("Błąd bazy: " + error.message);
      setLoading(false);
    } else {
      setOptions([...options, data]);
      setOptionId(data.id.toString());
      setShowAddOption(false);
      setNewOptionLabel("");
      setNewOptionKm("");
      setLoading(false);
    }
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !optionId) return alert("Wybierz dystans!");

    setLoading(true);
    const totalSeconds = (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);

    // KLUCZOWA ZMIANA: onConflict musi pasować do kolumn w bazie
    const { error } = await supabase.from("race_results").upsert({
      user_id: userId,
      race_id: raceId,
      option_id: parseInt(optionId),
      finish_time_seconds: totalSeconds
    }, { 
      onConflict: 'user_id,race_id,option_id' 
    });

    setLoading(false);
    if (error) {
      alert("Błąd zapisu: " + error.message);
    } else {
      setMessage("✅ Wynik zapisany!");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (!userId) return null;

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
        <h3 style={{ margin: 0, color: "#00d4ff" }}>Twój wynik</h3>
        <button 
          onClick={() => setShowAddOption(!showAddOption)}
          type="button"
          style={{ background: "none", border: "1px solid #444", color: "#888", padding: "5px 10px", borderRadius: 8, fontSize: "0.7rem", cursor: "pointer" }}
        >
          {showAddOption ? "Anuluj" : "+ Dodaj brakujący dystans"}
        </button>
      </div>

      {showAddOption && (
        <div style={{ background: "rgba(255,255,255,0.05)", padding: 15, borderRadius: 10, marginBottom: 20, display: "flex", gap: 10 }}>
          <input placeholder="Nazwa (np. 5 KM)" style={inputStyle} value={newOptionLabel} onChange={e => setNewOptionLabel(e.target.value)} />
          <input type="number" placeholder="KM" style={{...inputStyle, width: 80}} value={newOptionKm} onChange={e => setNewOptionKm(e.target.value)} />
          <button type="button" onClick={handleAddOption} disabled={loading} style={{...btnStyle, background: "#00d4ff", padding: "10px 15px"}}>
            {loading ? "..." : "DODAJ"}
          </button>
        </div>
      )}

      <form onSubmit={handleSaveResult} style={{ display: "grid", gap: 15 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: "150px" }}>
            <label style={labelSmall}>Wybierz dystans</label>
            <select required value={optionId} onChange={e => setOptionId(e.target.value)} style={inputStyle}>
              <option value="">-- Wybierz --</option>
              {options.map(o => (
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
          {loading ? "ŁADOWANIE..." : (message || "ZAPISZ MOJEGO FINISZA")}
        </button>
      </form>
    </section>
  );
}

const labelSmall: React.CSSProperties = { fontSize: "0.75rem", opacity: 0.5, marginBottom: 5, display: "block" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "12px", borderRadius: "10px", background: "#000", color: "#fff", border: "1px solid #333", boxSizing: "border-box" };
const btnStyle: React.CSSProperties = { padding: "15px", borderRadius: "12px", border: "none", background: "#00ff00", color: "#000", fontWeight: "900", cursor: "pointer" };