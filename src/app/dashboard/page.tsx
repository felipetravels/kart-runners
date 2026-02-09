"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [city, setCity] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("races").insert([{ title, race_date: date, city }]);
    if (!error) {
      alert("Dodano bieg!");
      window.location.href = "/";
    }
  };

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: 20, color: "#fff" }}>
      <h1 style={{ fontWeight: 900 }}>NOWY BIEG</h1>
      <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <input placeholder="Nazwa biegu" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} required />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} required />
        <input placeholder="Miasto" value={city} onChange={e => setCity(e.target.value)} style={inputStyle} required />
        <button type="submit" style={btnStyle}>DODAJ DO KALENDARZA</button>
      </form>
    </main>
  );
}
const inputStyle = { background: "#111", border: "1px solid #222", padding: 15, borderRadius: 10, color: "#fff" };
const btnStyle = { background: "#00ff88", color: "#000", padding: 15, borderRadius: 10, fontWeight: "bold", border: "none", cursor: "pointer" };
