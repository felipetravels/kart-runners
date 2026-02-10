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
            message: `Pojawił się nowy bieg: ${newRace.title}`,
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

  if (loading) return <div style={{ padding: 100, textAlign: "center", color: "#fff" }}>ŁADOWANIE...</div>;

  return (
    <main>
      <div style={{ 
        height: "80vh", 
        background: "linear-gradient(rgba(0,0,0,0.3), rgba(10,10,10,1)), url('/hero.png') center/cover",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ textAlign: "center" }}>
            <img src="/logo-kart.png" alt="KART" style={{ height: "125px" }} />
            <div style={{ fontWeight: 900, letterSpacing: "5px", marginTop: "10px", color: "#fff", fontSize: "1.2rem" }}>KART TEAM</div>
          </div>
          <div style={{ width: "2px", height: "120px", background: "rgba(255,255,255,0.2)" }}></div>
          <img src="/krk-airport-logo.png" alt="Kraków Airport" style={{ height: "80px" }} />
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "-120px auto 0", padding: "0 20px 60px", position: "relative" }}>
        {/* STATYSTYKI I REKORDY */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px", marginBottom: "40px" }}>
          <div style={statB}><span style={lab}>TOTAL KM</span><div style={{ fontSize: "3.5rem", fontWeight: 900, color: "#00d4ff" }}>{stats.total_km} km</div></div>
          <div style={statB}><span style={lab}>TOP RUNNERS</span>
            {stats.top_runners.map((r, i) => <div key={i} style={{ fontSize: "1.1rem", marginTop: 8, fontWeight: 900 }}>{i+1}. {r.display_name} <span style={{color: "#00ff88"}}>{r.total_km}km</span></div>)}
          </div>
        </div>

        {/* DODAWANIE BIEGU */}
        <div style={{marginBottom: 60}}>
           <button onClick={() => setShowAdmin(!showAdmin)} style={btnAdmin}>{showAdmin ? "ANULUJ" : "+ DODAJ NOWY BIEG"}</button>
           {showAdmin && (
             <div style={{ marginTop: 20, background: "#111", padding: "25px", borderRadius: "15px", border: "1px solid #333", display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "flex-end" }}>
                <div><label style={lab}>NAZWA</label><input value={newRace.title} onChange={e => setNewRace({...newRace, title: e.target.value})} style={inputS} /></div>
                <div><label style={lab}>DATA</label><input type="date" value={newRace.date} onChange={e => setNewRace({...newRace, date: e.target.value})} style={inputS} /></div>
                <div><label style={lab}>KM</label><input type="number" value={newRace.distance} onChange={e => setNewRace({...newRace, distance: e.target.value})} style={inputS} /></div>
                <button onClick={handleAddRace} style={btnSave}>ZAPISZ I WYŚLIJ PUSH</button>
             </div>
           )}
        </div>

        <h2 style={secH}>NADCHODZĄCE STARTY</h2>
        <div style={grid}>
          {upcoming.map(r => (
            <div key={r.id} style={{display: "flex", flexDirection: "column", gap: 10}}>
              <RaceCard race={r} />
              <div style={pBox}>
                <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: 10, fontWeight: 900 }}>OPŁACILI:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {participation.filter(p => p.race_id === r.id && p.is_paid).map(p => <span key={p.user_id} style={wBadge}>{getName(p.user_id)}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 style={{...secH, marginTop: 100, opacity: 0.5}}>ARCHIWUM BIEGÓW</h2>
        <div style={grid}>
          {past.map(r => (
            <div key={r.id} style={{display: "flex", flexDirection: "column", gap: 10, opacity: 0.7}}>
              <RaceCard race={r} />
              <div style={pBox}>
                <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: 10, fontWeight: 900 }}>UCZESTNICY:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {participation.filter(p => p.race_id === r.id && p.is_paid).map(p => <span key={p.user_id} style={wBadge}>{getName(p.user_id)}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STOPKA MADE BY FELIPE TRAVELS */}
      <footer style={{ borderTop: "1px solid #222", padding: "60px 20px", textAlign: "center", marginTop: "40px", background: "#050505" }}>
        <img src="/logo-kart.png" alt="KART" style={{ height: "100px", marginBottom: "20px", opacity: 0.8 }} />
        <p style={{ color: "#666", fontSize: "0.9rem", letterSpacing: "1px" }}>
          MADE BY <span style={{ color: "#fff", fontWeight: 900 }}>FELIPE TRAVELS</span>
        </p>
        <p style={{ color: "#444", fontSize: "0.8rem", marginTop: "10px" }}>
          ALL RIGHTS RESERVED {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}

const statB = { background: "rgba(25,25,25,0.9)", padding: "40px", borderRadius: "24px", border: "1px solid #333" };
const lab = { fontSize: "0.6rem", opacity: 0.5, letterSpacing: "2px", fontWeight: 900, display: "block", marginBottom: "5px" };
const secH = { fontSize: "1.2rem", letterSpacing: "5px", borderBottom: "3px solid #00d4ff", paddingBottom: 15, fontWeight: 900, color: "#00d4ff", marginBottom: 30 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "35px" };
const pBox = { background: "rgba(255,255,255,0.03)", padding: "15px", borderRadius: "15px", border: "1px solid #222" };
const wBadge = { background: "#222", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700 };
const inputS = { background: "#000", border: "1px solid #333", color: "#fff", padding: "10px", borderRadius: "5px" };
const btnAdmin = { background: "#00d4ff", border: "none", color: "#000", padding: "12px 24px", borderRadius: "8px", fontWeight: 900, cursor: "pointer" };
const btnSave = { background: "#00ff88", color: "#000", border: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" };
