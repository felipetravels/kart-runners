"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ParticipationCard from "./ParticipationCard";
import RaceMyResult from "@/app/RaceMyResult";

function RaceDetailsContent() {
  const searchParams = useSearchParams();
  const raceId = searchParams.get("id");
  
  const [race, setRace] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: "", race_date: "", city: "", description: "" });
  const [newDistLabel, setNewDistLabel] = useState("");
  const [newDistKm, setNewDistKm] = useState("");

  const fetchData = async () => {
    if (!raceId) return;
    const [uRes, rRes, oRes, resRes] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from("races").select("*").eq("id", raceId).single(),
      supabase.from("race_options").select("*").eq("race_id", raceId).order("sort_order"),
      supabase.from("race_results").select("*, profiles(display_name, team), race_options(distance_km)").eq("race_id", raceId)
    ]);

    setUser(uRes.data.session?.user ?? null);
    if (rRes.data) {
      setRace(rRes.data);
      setEditData({ title: rRes.data.title, race_date: rRes.data.race_date, city: rRes.data.city || "", description: rRes.data.description || "" });
    }
    setOptions(oRes.data || []);
    setResults(resRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [raceId]);

  const handleSave = async () => {
    await supabase.from("races").update(editData).eq("id", raceId);
    setIsEditing(false);
    fetchData();
  };

  const handleAddOption = async () => {
    if (!newDistLabel || !newDistKm) return;
    const { error } = await supabase.from("race_options").insert([
      { race_id: raceId, label: newDistLabel, distance_km: parseFloat(newDistKm), sort_order: options.length + 1 }
    ]);
    if (!error) {
      setNewDistLabel("");
      setNewDistKm("");
      fetchData();
    }
  };

  const handleDuplicate = async () => {
    const { data, error } = await supabase.from("races").insert([{
      title: editData.title + " (Kopia)",
      race_date: editData.race_date,
      city: editData.city,
      description: editData.description
    }]).select().single();
    if (!error && data) window.location.href = `/races?id=${data.id}`;
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0 ? `${h}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}` : `${m}:${sec.toString().padStart(2,'0')}`;
  };

  const calcPace = (s: number, km: number) => {
    if (!km) return "--:--";
    const totalMin = (s / 60) / km;
    const min = Math.floor(totalMin);
    const sec = Math.round((totalMin - min) * 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading) return <div style={{ color: "#fff", padding: 100, textAlign: "center" }}>Wczytywanie...</div>;

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      <header style={{ marginBottom: 40, borderBottom: "1px solid #222", paddingBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <a href="/" style={{ color: "#00d4ff", textDecoration: "none" }}>← POWRÓT</a>
          {user && !isEditing && <button onClick={() => setIsEditing(true)} style={btn}>EDYTUJ / DYSTANSE</button>}
        </div>

        {isEditing ? (
          <div style={{ background: "#111", padding: 20, borderRadius: 15, display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} style={inS} placeholder="Nazwa" />
            <input type="date" value={editData.race_date} onChange={e => setEditData({...editData, race_date: e.target.value})} style={inS} />
            
            <div style={{ borderTop: "1px solid #333", paddingTop: 10, marginTop: 10 }}>
              <p style={{ fontSize: "0.8rem", color: "#00ff88" }}>+ DODAJ DYSTANS (OPCJE TRASY):</p>
              <div style={{ display: "flex", gap: 5 }}>
                <input placeholder="np. Bieg 5km" value={newDistLabel} onChange={e => setNewDistLabel(e.target.value)} style={inS} />
                <input placeholder="km (np 5)" value={newDistKm} onChange={e => setNewDistKm(e.target.value)} style={inS} />
                <button onClick={handleAddOption} style={{...btn, background: "#00ff88"}}>DODAJ</button>
              </div>
              <div style={{ marginTop: 10, fontSize: "0.7rem", opacity: 0.5 }}>
                Istniejące: {options.map(o => `${o.label} (${o.distance_km}km)`).join(", ")}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
              <button onClick={handleSave} style={{...btn, background: "#00d4ff"}}>ZAPISZ</button>
              <button onClick={handleDuplicate} style={{...btn, background: "#ffaa00"}}>KOPIUJ</button>
              <button onClick={() => setIsEditing(false)} style={{...btn, background: "#444"}}>ANULUJ</button>
            </div>
          </div>
        ) : (
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900 }}>{race.title}</h1>
        )}
      </header>

      <div style={{ display: "grid", gap: 30 }}>
        <ParticipationCard raceId={race.id} options={options} />
        <RaceMyResult raceId={race.id} options={options} />
        
        <section style={{ background: "#111", padding: 25, borderRadius: 20 }}>
          <h3 style={{ color: "#00d4ff", marginTop: 0 }}>Wyniki</h3>
          {results.sort((a,b) => a.time_seconds - b.time_seconds).map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #222" }}>
              <span>{i+1}. {r.profiles?.display_name} {r.profiles?.team === "KART light" && <span style={tag}>LIGHT</span>}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#00ff88", fontWeight: "bold" }}>{formatTime(r.time_seconds)}</div>
                <div style={{ fontSize: "0.7rem", opacity: 0.5 }}>{calcPace(r.time_seconds, r.race_options?.distance_km)} min/km</div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
const inS = { background: "#000", border: "1px solid #333", padding: 10, borderRadius: 8, color: "#fff", width: "100%" };
const btn = { background: "#00d4ff", color: "#000", border: "none", padding: "8px 15px", borderRadius: 8, fontWeight: "bold", cursor: "pointer" };
const tag = { fontSize: "0.6rem", background: "#00ff88", color: "#000", padding: "2px 5px", borderRadius: 4, marginLeft: 5 };

export default function RaceDetailsPage() { return <Suspense><RaceDetailsContent /></Suspense>; }
