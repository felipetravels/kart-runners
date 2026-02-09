"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [dist, setDist] = useState("");

  const setSmartDist = (val: string) => setDist(val);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    const { data: race, error: rErr } = await supabase.from("races").insert([{ title, race_date: date, city: "Kraków" }]).select().single();
    if (race) {
      await supabase.from("race_options").insert([{ race_id: race.id, label: dist + " km", distance_km: parseFloat(dist), sort_order: 1 }]);
      alert("Bieg dodany!");
      window.location.href = "/";
    }
  };

  return (
    <main style={{ maxWidth: 500, margin: "40px auto", padding: 20, color: "#fff" }}>
      <h1 style={{ fontWeight: 900 }}>DODAJ BIEG</h1>
      <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <input placeholder="Nazwa biegu" onChange={e => setTitle(e.target.value)} style={inS} />
        <input type="date" onChange={e => setDate(e.target.value)} style={inS} />
        <div>
          <label style={{ fontSize: "0.8rem", opacity: 0.5 }}>Dystans (km):</label>
          <input value={dist} onChange={e => setDist(e.target.value)} style={inS} />
          <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
            {["5", "10", "21.097", "42.195"].map(d => (
              <button key={d} type="button" onClick={() => setSmartDist(d)} style={chipS}>{d === "21.097" ? "Pół" : d === "42.195" ? "Mara" : d + "k"}</button>
            ))}
          </div>
        </div>
        <button type="submit" style={btnS}>UTWÓRZ</button>
      </form>
    </main>
  );
}
const inS = { background: "#111", border: "1px solid #222", padding: 12, borderRadius: 10, color: "#fff", width: "100%" };
const chipS = { background: "#333", color: "#fff", border: "none", padding: "5px 10px", borderRadius: 5, fontSize: "0.7rem", cursor: "pointer" };
const btnS = { background: "#00d4ff", color: "#000", padding: 15, borderRadius: 10, fontWeight: "bold", border: "none" };
