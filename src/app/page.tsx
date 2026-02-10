"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RaceCard from "./components/RaceCard";

export default function HomePage() {
  const [races, setRaces] = useState<any[]>([]);
  const [participation, setParticipation] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_km: 0, top_runners: [] as any[] });
  
  const [showAdmin, setShowAdmin] = useState(false);
  const [newRace, setNewRace] = useState({ title: "", date: "", distance: "", type: "road" });
  const [loading, setLoading] = useState(true);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return (h > 0 ? h.toString().padStart(2,"0")+":" : "") + m.toString().padStart(2,"0")+":" + sec.toString().padStart(2,"0");
  };

  const calculatePace = (seconds: number, distanceKm: number) => {
    if (!distanceKm || distanceKm <= 0) return "";
    const totalMinutes = seconds / 60;
    const paceDecimal = totalMinutes / distanceKm;
    const paceMin = Math.floor(paceDecimal);
    const paceSec = Math.round((paceDecimal - paceMin) * 60);
    return `${paceMin}:${paceSec.toString().padStart(2, "0")} /km`;
  };

  async function fetchAll() {
    const [r, p, prof, rec, res, k, t] = await Promise.all([
      supabase.from("races").select("*").order("race_date", { ascending: true }),
      supabase.from("participations").select("*"), 
      supabase.from("profiles").select("id, display_name"),
      supabase.from("race_results").select("time_seconds, profiles(display_name), race_options(distance_km)"), 
      supabase.from("race_results").select("user_id, race_id"),
      supabase.from("v_total_team_km").select("total_km").maybeSingle(),
      supabase.from("v_top_runners_km").select("*").limit(3)
    ]);
    setRaces(r.data || []);
    setParticipation(p.data || []);
    setProfiles(prof.data || []);
    setRecords(rec.data || []);
    setResults(res.data || []);
    setStats({ total_km: k.data?.total_km || 0, top_runners: t.data || [] });
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, []);

  const handleAddRace = async () => {
    if (!newRace.title || !newRace.date || !newRace.distance) return alert("Wypełnij pola!");
    const { error } = await supabase.from("races").insert([{
      title: newRace.title,
      race_date: newRace.date,
      race_type: newRace.type,
      location: "TBA",
      description: `Dystans: ${newRace.distance} km`
    }]);

    if (!error) {
      alert("Bieg dodany!");
      setNewRace({ title: "", date: "", distance: "", type: "road" });
      setShowAdmin(false);
      fetchAll();
      try {
        await fetch("/api/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Nowy bieg w kalendarzu! 🏃",
            message: `Pojawił się nowy bieg: ${newRace.title}. Sprawdź szczegóły!`,
            url: "https://kart-runners.vercel.app"
          })
        });
      } catch (err) { console.error(err); }
    }
  };

  const getName = (userId: string) => profiles.find(u => u.id === userId)?.display_name || "Zawodnik";
  const now = new Date().toISOString().split("T")[0];
  const upcoming = races.filter(r => r.race_date >= now);
  const past = races.filter(r => r.race_date < now).sort((a,b) => b.race_date.localeCompare(a.race_date));

  if (loading) return <div style={{ padding: 100, textAlign: "center" }}>ŁADOWANIE...</div>;

  return (
    <main>
      {/* HERO SECTION Z LOGOTYPAMI I TŁEM */}
      <div style={{ 
        height: "60vh", 
        background: "linear-gradient(rgba(0,0,0,0.6), rgba(10,10,10,1)), url('https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070') center/cover",
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        textAlign: "center",
        padding: "0 20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30, marginBottom: 20 }}>
          <div style={{ fontSize: "4rem", fontWeight: 900, letterSpacing: "-2px" }}>KART<span style={{color: "#00d4ff"}}>RUNNERS</span></div>
          <div style={{ width: "2px", height: "60px", background: "#333" }}></div>
          <img src="https://www.krakowairport.pl/images/logo.png" alt="Kraków Airport" style={{ height: "50px", filter: "brightness(0) invert(1)" }} />
        </div>
        <p style={{ fontSize: "1.2rem", color: "#888", maxWidth: "600px", fontWeight: 500 }}>Oficjalny hub biegowy ekipy Kraków Airport. Śledź starty, logistykę i rekordy.</p>
      </div>

      <div style={{ maxWidth: "1400px", margin: "-100px auto 0", padding: "0 20px 100px", position: "relative", zIndex: 10 }}>
        {/* STATYSTYKI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px", marginBottom: "60px" }}>
          <div style={statB}>
            <span style={lab}>TOTAL KM EKIPY</span>
            <div style={{ fontSize: "3.5rem", fontWeight: 900, color: "#00d4ff" }}>{stats.total_km} km</div>
          </div>
          <div style={statB}>
            <span style={lab}>TOP RUNNERS (KM)</span>
            {stats.top_runners.map((r, i) => (
              <div key={i} style={{ fontSize: "1.1rem", marginTop: 8, fontWeight: 900 }}>
                {i+1}. {r.display_name} <span style={{color: "#00ff88"}}>{r.total_km}km</span>
              </div>
            ))}
          </div>
        </div>

        {/* REKORDY */}
        <h2 style={secH}>TEAM RECORDS (TOP 3)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", marginBottom: "60px" }}>
          {[5, 10, 21.097, 42.195].map(dist => (
            <div key={dist} style={{ ...statB, borderLeft: "6px solid #ffaa00" }}>
              <span style={{ fontWeight: 900, color: "#ffaa00", fontSize: "1rem", letterSpacing: "2px" }}>{dist === 21.097 ? "HM" : dist === 42.195 ? "M" : dist + " KM"}</span>
              <div style={{ marginTop: 20 }}>
                {records.filter(rec => rec.race_options?.distance_km === dist).sort((a,b) => a.time_seconds - b.time_seconds).slice(0,3).map((r, i) => (
                  <div key={i} style={{ fontSize: "1rem", display: "flex", justifyContent: "space-between", marginBottom: 8, fontWeight: 900 }}>
                    <span>{i+1}. {r.profiles?.display_name}</span>
                    <div style={{textAlign: "right"}}>
                      <span style={{ display: "block" }}>{formatTime(r.time_seconds)}</span>
                      <span style={{ fontSize: "0.75rem", color: "#888" }}>{calculatePace(r.time_seconds, dist)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* LISTA BIEGÓW */}
        <h2 style={secH}>NADCHODZĄCE STARTY</h2>
        <div style={grid}>
          {upcoming.map(r => {
            const racePaid = participation.filter(p => p.race_id === r.id && p.is_paid === true);
            return (
              <div key={r.id} style={{display: "flex", flexDirection: "column", gap: 10}}>
                <RaceCard race={r} />
                <div style={pBox}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={lab}>OPŁACILI: {racePaid.length}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {racePaid.map(p => <span key={p.user_id} style={wBadge}>{getName(p.user_id)}</span>)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ADMIN PANEL */}
        <div style={{ marginTop: 100, textAlign: "center" }}>
          <button onClick={() => setShowAdmin(!showAdmin)} style={btnAdmin}>{showAdmin ? "ZAMKNIJ PANEL" : "DODAJ BIEG (ADMIN)"}</button>
          {showAdmin && (
            <div style={{ marginTop: 30, background: "#111", padding: 30, borderRadius: 15, display: "inline-block", textAlign: "left", border: "1px solid #333" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 15, width: "300px" }}>
                <input placeholder="Nazwa Biegu" value={newRace.title} onChange={e => setNewRace({...newRace, title: e.target.value})} style={inputS} />
                <input type="date" value={newRace.date} onChange={e => setNewRace({...newRace, date: e.target.value})} style={inputS} />
                <input placeholder="Dystans (km)" type="number" value={newRace.distance} onChange={e => setNewRace({...newRace, distance: e.target.value})} style={inputS} />
                <button onClick={handleAddRace} style={btnSave}>ZAPISZ I WYŚLIJ PUSH</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const statB = { background: "rgba(25,25,25,0.9)", padding: "40px", borderRadius: "24px", border: "1px solid #333" };
const lab = { fontSize: "0.7rem", opacity: 0.5, letterSpacing: "2px", fontWeight: 900 };
const secH = { fontSize: "1.2rem", letterSpacing: "5px", borderBottom: "3px solid #00d4ff", paddingBottom: 15, fontWeight: 900, color: "#00d4ff", marginBottom: 30 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "35px" };
const pBox = { background: "rgba(255,255,255,0.03)", padding: "15px", borderRadius: "15px", border: "1px solid #222" };
const wBadge = { background: "#222", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700 };
const inputS = { background: "#000", border: "1px solid #333", color: "#fff", padding: "10px", borderRadius: "5px" };
const btnAdmin = { background: "transparent", border: "1px solid #444", color: "#888", padding: "10px 20px", cursor: "pointer" };
const btnSave = { background: "#00d4ff", color: "#000", border: "none", padding: "12px", borderRadius: 5, fontWeight: "bold", cursor: "pointer" };
