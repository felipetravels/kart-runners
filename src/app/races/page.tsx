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
  
  // Stan edycji
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: "", race_date: "", city: "", description: "" });

  const fetchData = async () => {
    if (!raceId) return;
    const [uRes, rRes, oRes, resRes] = await Promise.all([
      supabase.auth.getSession(),
      supabase.from("races").select("*").eq("id", raceId).single(),
      supabase.from("race_options").select("*").eq("race_id", raceId).order("sort_order"),
      supabase.from("race_results").select("time_seconds, user_id, option_id, profiles(display_name, team)").eq("race_id", raceId)
    ]);

    setUser(uRes.data.session?.user ?? null);
    if (rRes.data) {
      setRace(rRes.data);
      setEditData({ title: rRes.data.title, race_date: rRes.data.race_date, city: rRes.data.city, description: rRes.data.description || "" });
    }
    setOptions(oRes.data || []);
    setResults(resRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [raceId]);

  const handleSave = async () => {
    const { error } = await supabase.from("races").update(editData).eq("id", raceId);
    if (!error) {
      setIsEditing(false);
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
    
    if (!error && data) {
      alert("Utworzono duplikat! Przenoszę do nowej edycji...");
      window.location.href = `/races?id=${data.id}`;
    }
  };

  if (loading) return <div style={{ color: "#fff", padding: 100, textAlign: "center" }}>Wczytywanie...</div>;
  if (!race) return <div style={{ color: "#fff", padding: 100, textAlign: "center" }}>Nie znaleziono biegu.</div>;

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      <header style={{ marginBottom: 40, borderBottom: "1px solid #222", paddingBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <a href="/" style={{ color: "#00d4ff", textDecoration: "none", fontSize: "0.8rem" }}>← POWRÓT</a>
          {user && !isEditing && (
            <button onClick={() => setIsEditing(true)} style={adminBtnStyle}>EDYTUJ BIEG</button>
          )}
        </div>

        {isEditing ? (
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: "10px" }}>
            <input value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} style={inputStyle} />
            <input type="date" value={editData.race_date} onChange={e => setEditData({...editData, race_date: e.target.value})} style={inputStyle} />
            <input value={editData.city} onChange={e => setEditData({...editData, city: e.target.value})} style={inputStyle} />
            <textarea value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} style={{...inputStyle, minHeight: 100}} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSave} style={{...adminBtnStyle, background: "#00ff88", color: "#000"}}>ZAPISZ ZMIANY</button>
              <button onClick={handleDuplicate} style={{...adminBtnStyle, background: "#ffaa00", color: "#000"}}>DUPLIKUJ JAKO NOWY</button>
              <button onClick={() => setIsEditing(false)} style={{...adminBtnStyle, background: "#444"}}>ANULUJ</button>
            </div>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: "3rem", margin: "10px 0", fontWeight: 900 }}>{race.title}</h1>
            <p style={{ opacity: 0.7 }}>📍 {race.city} | 📅 {race.race_date}</p>
          </>
        )}
      </header>

      <div style={{ display: "grid", gap: 30 }}>
        {!isEditing && <section style={{ background: "rgba(255,255,255,0.05)", padding: 25, borderRadius: 20 }}>{race.description}</section>}
        
        <ParticipationCard raceId={race.id} options={options} />
        <RaceMyResult raceId={race.id} options={options} />

        <section style={{ background: "rgba(255,255,255,0.05)", padding: 25, borderRadius: 20 }}>
          <h3 style={{ marginTop: 0, color: "#00d4ff" }}>Wyniki teamu</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {results.sort((a, b) => a.time_seconds - b.time_seconds).map((res: any, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #222" }}>
                <span>
                  {i + 1}. <strong>{res.profiles?.display_name}</strong>
                  {res.profiles?.team === "KART light" && (
                    <span style={{ marginLeft: 8, fontSize: "0.6rem", background: "#00ff88", color: "#000", padding: "2px 5px", borderRadius: 4, fontWeight: "bold" }}>LIGHT</span>
                  )}
                </span>
                <span style={{ fontWeight: "bold", color: "#00ff00" }}>{formatTime(res.time_seconds)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

const inputStyle = { background: "#111", border: "1px solid #333", padding: "10px", borderRadius: "8px", color: "#fff", width: "100%" };
const adminBtnStyle = { background: "#00d4ff", color: "#000", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "0.7rem" };

export default function RaceDetailsPage() {
  return (
    <Suspense fallback={<div style={{color: "#fff", textAlign: "center", padding: 100}}>Ładowanie...</div>}>
      <RaceDetailsContent />
    </Suspense>
  );
}
