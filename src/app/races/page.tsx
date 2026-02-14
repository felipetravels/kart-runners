"use client";
import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function RacesContent() {
  const searchParams = useSearchParams();
  const raceId = searchParams.get("id");
  const action = searchParams.get("action");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", race_date: "", location: "", description: "" });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (raceId) {
          const { data: r } = await supabase.from("races").select("*").eq("id", raceId).single();
          if (r) {
            setData(r);
            setForm({ 
              title: r.title || "", 
              race_date: r.race_date || "", 
              location: r.location || "", 
              description: r.description || "" 
            });
          }
        } else {
          const { data: rs } = await supabase.from("races").select("*").order("race_date", { ascending: false });
          setData(rs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [raceId, action]);

  const handleSave = async () => {
    setLoading(true);
    if (action === "edit" && raceId) {
      await supabase.from("races").update(form).eq("id", raceId);
    } else {
      const { data: newRace } = await supabase.from("races").insert([form]).select().single();
      if (newRace) {
        fetch("/api/send-push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            title: "🏃 NOWY BIEG: " + form.title, 
            body: `${form.race_date} - ${form.location}`, 
            url: `/races?id=${newRace.id}` 
          })
        }).catch(() => {});
      }
    }
    window.location.href = "/races";
  };

  if (loading) return <div style={{ paddingTop: "200px", textAlign: "center", color: "#fff" }}>ŁADOWANIE...</div>;

  if (action === "add" || action === "edit") {
    return (
      <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", padding: "0 20px" }}>
        <main style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h1 style={{ color: "#00d4ff", fontWeight: 900 }}>{action === "edit" ? "EDYTUJ BIEG" : "DODAJ NOWY BIEG"}</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "30px" }}>
            <input placeholder="NAZWA" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={inp} />
            <input type="date" value={form.race_date} onChange={e => setForm({...form, race_date: e.target.value})} style={inp} />
            <input placeholder="KM" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={inp} />
            <input placeholder="MIEJSCE" value={form.location} onChange={e => setForm({...form, location: e.target.value})} style={inp} />
            <button onClick={handleSave} style={{ background: "#00d4ff", color: "#000", padding: "18px", border: "none", fontWeight: 900, borderRadius: "10px", cursor: "pointer" }}>ZAPISZ BIEG</button>
            <Link href="/races" style={{ textAlign: "center", color: "#666", textDecoration: "none" }}>ANULUJ</Link>
          </div>
        </main>
      </div>
    );
  }

  if (raceId && data && !Array.isArray(data)) {
    return (
      <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", padding: "0 20px" }}>
        <main style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Link href="/races" style={{ color: "#00d4ff", fontWeight: 900, textDecoration: "none" }}>← POWRÓT</Link>
          <h1 style={{ fontSize: "3rem", fontWeight: 900, marginTop: "20px" }}>{data.title}</h1>
          <p style={{ fontSize: "1.2rem", color: "#888" }}>📅 {data.race_date} | 📍 {data.location} | 🏃 {data.description}</p>
          <Link href={`/races?id=${data.id}&action=edit`} style={{ display: "inline-block", marginTop: "20px", padding: "10px 20px", background: "#222", color: "#fff", borderRadius: "8px", textDecoration: "none", border: "1px solid #333" }}>EDYTUJ</Link>
        </main>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", padding: "0 20px" }}>
      <main style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900 }}>KALENDARZ</h1>
          <Link href="/races?action=add" style={{ background: "#00d4ff", color: "#000", padding: "12px 25px", borderRadius: "10px", fontWeight: 900, textDecoration: "none" }}>+ DODAJ BIEG</Link>
        </div>
        <div style={{ display: "grid", gap: "15px" }}>
          {Array.isArray(data) && data.map((race: any) => (
            <Link href={`/races?id=${race.id}`} key={race.id} style={{ textDecoration: "none", background: "rgba(255,255,255,0.03)", padding: "25px", borderRadius: "15px", border: "1px solid #1a1a1a", display: "block" }}>
              <h2 style={{ color: "#fff", margin: 0 }}>{race.title}</h2>
              <p style={{ color: "#666", margin: "5px 0 0" }}>{race.race_date} • {race.location}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

const inp = { width: "100%", padding: "15px", background: "#111", border: "1px solid #333", borderRadius: "10px", color: "#fff", boxSizing: "border-box" as "border-box" };

export default function Page() {
  return <Suspense fallback={<div>Inicjalizacja...</div>}><RacesContent /></Suspense>;
}