"use client";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function RacesContent() {
  const searchParams = useSearchParams();
  const raceId = searchParams.get("id");
  const action = searchParams.get("action");
  const [form, setForm] = useState({ title: "", race_date: "", location: "", description: "", second_dist: "", link: "" });

  const handleSave = async () => {
    await supabase.from("races").upsert({ ...form, id: raceId || undefined });
    window.location.href = "/races";
  };

  if (action === "add" || action === "edit") {
    return (
      <div style={{minHeight: "100vh", background: "#050505", color: "#fff", padding: "100px 20px"}}>
        <div style={{maxWidth: "600px", margin: "0 auto"}}>
          <h1 style={{color: "#00d4ff", fontWeight: 900, marginBottom: "30px"}}>DODAJ / EDYTUJ BIEG</h1>
          <input placeholder="NAZWA BIEGU" style={inp} value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <input type="date" style={inp} value={form.race_date} onChange={e => setForm({...form, race_date: e.target.value})} />
          <input placeholder="DYSTANS 1 (KM)" style={inp} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <input placeholder="DYSTANS 2 (OPCJONALNIE)" style={inp} value={form.second_dist} onChange={e => setForm({...form, second_dist: e.target.value})} />
          <input placeholder="LOKALIZACJA" style={inp} value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          <input placeholder="LINK DO ZAPISÓW" style={inp} value={form.link} onChange={e => setForm({...form, link: e.target.value})} />
          <button onClick={handleSave} style={btn}>ZAPISZ</button>
        </div>
      </div>
    );
  }
  return <div style={{color: "#fff", padding: "100px"}}>Wybierz bieg z listy na stronie głównej.</div>;
}
const inp = { width: "100%", padding: "15px", background: "#111", border: "1px solid #333", borderRadius: "10px", color: "#fff", marginBottom: "15px" };
const btn = { width: "100%", padding: "15px", background: "#00d4ff", color: "#000", border: "none", borderRadius: "10px", fontWeight: 900 };
export default function Page() { return <Suspense><RacesContent /></Suspense>; }
