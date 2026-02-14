"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ParticipationCard from "./ParticipationCard";

function RacesContent() {
  const searchParams = useSearchParams();
  const raceId = searchParams.get("id");
  const isAdding = searchParams.get("action") === "add";
  const isEditing = searchParams.get("action") === "edit";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Stan formularza (tylko do dodawania/edycji)
  const [form, setForm] = useState({ title: "", race_date: "", location: "", description: "" });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      if (raceId) {
        const { data: r } = await supabase.from("races").select("*").eq("id", raceId).single();
        setData(r);
        if (isEditing && r) setForm({ title: r.title, race_date: r.race_date, location: r.location, description: r.description });
      } else {
        const { data: rs } = await supabase.from("races").select("*").order("race_date", { ascending: false });
        setData(rs);
      }
      setLoading(false);
    }
    fetchData();
  }, [raceId, isEditing]);

  const handleSave = async () => {
    setLoading(true);
    if (isEditing && raceId) {
      await supabase.from("races").update(form).eq("id", raceId);
    } else {
      const { data: newRace } = await supabase.from("races").insert([form]).select().single();
      if (newRace) {
        fetch("/api/send-push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "🏆 NOWY BIEG: " + form.title, body: `Data: ${form.race_date}. Zapraszamy!`, url: `/races?id=${newRace.id}` })
        });
      }
    }
    window.location.href = "/races";
  };

  if (loading) return <div style={{ paddingTop: "200px", textAlign: "center" }}>ŁADOWANIE...</div>;

  // FORMULARZ DODAWANIA / EDYCJI
  if (isAdding || isEditing) {
    return (
      <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", padding: "0 20px" }}>
        <main style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h1 style={{ color: "#00d4ff", fontWeight: 900 }}>{isEditing ? "EDYTUJ BIEG" : "DODAJ NOWY BIEG"}</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "30px" }}>
            <input placeholder="NAZWA" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={inp} />
            <input type="date" value={form.race_date} onChange={e => setForm({...form, race_date: e.target.value})} style={inp} />
            <input placeholder="KM / DYSTANS" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={inp} />
            <input placeholder="MIEJSCE" value={form.location} onChange={e => setForm({...form, location: e.target.value})} style={inp} />
            <button onClick={handleSave} style={{ background: "#00d4ff", color: "#000", padding: "15px", border: "none", fontWeight: 900, borderRadius: "8px", cursor: "pointer" }}>ZAPISZ BIEG</button>
            <Link href="/races" style={{ textAlign: "center", color: "#888" }}>ANULUJ</Link>
          </div>
        </main>
      </div>
    );
  }

  // SZCZEGÓŁY
  if (raceId && data && !Array.isArray(data)) {
    return (
      <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", padding: "0 20px" }}>
        <main style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Link href="/races" style={{ color: "#00d4ff", fontWeight: 900 }}>← POWRÓT</Link>
            <Link href={`/races?id=${data.id}&action=edit`} style={{ color: "#f39c12", fontWeight: 900 }}>EDYTUJ</Link>
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: 900 }}>{data.title}</h1>
          <p>📅 {data.race_date} | 📍 {data.location} | 🏃 {data.description}</p>
          <ParticipationCard raceId={data.id} />
        </main>
      </div>
    );
  }

  // LISTA
  return (
    <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", padding: "0 20px" }}>
      <main style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900 }}>KALENDARZ</h1>
          <Link href="/races?action=add" style={{ background: "#00d4ff", color: "#000", padding: "10px 20px", borderRadius: "8px", fontWeight: 900, textDecoration: "none" }}>+ DODAJ BIEG</Link>
        </div>
        <div style={{ display: "grid", gap: "20px", marginTop: "30px" }}>
          {Array.isArray(data) && data.map((race: any) => (
            <Link href={`/races?id=${race.id}`} key={race.id} style={{ textDecoration: "none", background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "10px", display: "block", border: "1px solid #222" }}>
              <h2 style={{ color: "#00d4ff", margin: 0 }}>{race.title}</h2>
              <p style={{ color: "#888", margin: 0 }}>{race.race_date} • {race.location}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

const inp = { width: "100%", padding: "12px", background: "#111", border: "1px solid #333", borderRadius: "8px", color: "#fff" };

export default function Page() {
  return <Suspense><RacesContent /></Suspense>;
}