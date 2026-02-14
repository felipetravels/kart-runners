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
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    fetchData();
  }, [raceId, action]);

  const handleSave = async () => {
    setLoading(true);
    const { data: newRace, error } = await supabase
      .from("races")
      .upsert(action === "edit" ? { ...form, id: raceId } : form)
      .select()
      .single();

    if (!error && newRace && action !== "edit") {
      fetch("/api/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: "NOWY BIEG: " + form.title, 
          body: `${form.race_date} - ${form.location}`, 
          url: `/races?id=${newRace.id}` 
        })
      }).catch(() => {});
    }
    window.location.href = "/races";
  };

  if (loading) return <div style={{ paddingTop: "200px", textAlign: "center", color: "#fff", fontFamily: "sans-serif" }}>LADOWANIE...</div>;

  if (action === "add" || action === "edit") {
    return (
      <div style={containerStyle}>
        <main style={{ maxWidth: "600px", margin: "0 auto", width: "100%" }}>
          <h1 style={{ color: "#00d4ff", fontWeight: 900, fontSize: "2rem", marginBottom: "30px" }}>{action === "edit" ? "EDYTUJ BIEG" : "NOWY BIEG"}</h1>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <input placeholder="NAZWA BIEGU" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={inp} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <input type="date" value={form.race_date} onChange={e => setForm({...form, race_date: e.target.value})} style={inp} />
              <input placeholder="DYSTANS (KM)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={inp} />
            </div>
            <input placeholder="LOKALIZACJA" value={form.location} onChange={e => setForm({...form, location: e.target.value})} style={inp} />
            <button onClick={handleSave} style={btnMain}>ZAPISZ W KALENDARZU</button>
            <Link href="/races" style={{ textAlign: "center", color: "#666", textDecoration: "none", fontWeight: 700 }}>ANULUJ</Link>
          </div>
        </main>
      </div>
    );
  }

  if (raceId && data && !Array.isArray(data)) {
    return (
      <div style={containerStyle}>
        <main style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
          <Link href="/races" style={{ color: "#00d4ff", fontWeight: 900, textDecoration: "none" }}>← POWROT DO LISTY</Link>
          <div style={{ marginTop: "40px", padding: "40px", background: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid #222" }}>
            <h1 style={{ fontSize: "3.5rem", fontWeight: 900, margin: 0, color: "#fff" }}>{data.title}</h1>
            <div style={{ display: "flex", gap: "30px", marginTop: "20px", color: "#888", fontWeight: 700, fontSize: "1.1rem" }}>
              <span>DATA: {data.race_date}</span>
              <span>MIEJSCE: {data.location}</span>
              <span>DYSTANS: {data.description}</span>
            </div>
          </div>
          <div style={{ marginTop: "30px", display: "flex", gap: "15px" }}>
            <Link href={`/races?id=${data.id}&action=edit`} style={{ padding: "12px 25px", background: "#f39c12", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>EDYTUJ DANE</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <main style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "50px" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: 900, margin: 0, color: "#fff" }}>KALENDARZ</h1>
          <Link href="/races?action=add" style={btnAdd}>+ DODAJ BIEG</Link>
        </div>
        <div style={{ display: "grid", gap: "20px" }}>
          {Array.isArray(data) && data.map((race: any) => (
            <Link href={`/races?id=${race.id}`} key={race.id} style={raceCard}>
              <div>
                <h2 style={{ color: "#00d4ff", margin: 0, fontSize: "1.6rem" }}>{race.title}</h2>
                <p style={{ color: "#666", margin: "8px 0 0", fontWeight: 700 }}>{race.race_date} • {race.location} • {race.description}</p>
              </div>
              <span style={{ color: "#333", fontWeight: 900 }}>WIECEJ →</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

const containerStyle: React.CSSProperties = { minHeight: "100vh", background: "#050505", color: "#fff", paddingTop: "180px", paddingLeft: "20px", paddingRight: "20px", fontFamily: "sans-serif" };
const inp: React.CSSProperties = { width: "100%", padding: "18px", background: "#111", border: "1px solid #333", borderRadius: "12px", color: "#fff", fontSize: "1rem", boxSizing: "border-box" };
const btnMain = { width: "100%", padding: "20px", background: "#00d4ff", color: "#000", border: "none", borderRadius: "12px", fontWeight: 900, fontSize: "1.1rem", cursor: "pointer", boxShadow: "0 10px 30px rgba(0, 212, 255, 0.3)" };
const btnAdd = { padding: "12px 25px", background: "#00d4ff", color: "#000", borderRadius: "10px", fontWeight: 900, textDecoration: "none", fontSize: "1rem" };
const raceCard = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "30px", background: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid #1a1a1a", textDecoration: "none", transition: "border 0.2s" };

export default function Page() { return <Suspense fallback={<div>Ladowanie...</div>}><RacesContent /></Suspense>; }
