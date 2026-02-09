"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [dist, setDist] = useState("");
  const [city, setCity] = useState("Kraków");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = "/login"; return; }
      setUser(session?.user);
    });
  }, []);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    if (!title || !date || !dist || !user) { alert("Wypełnij wymagane pola!"); return; }
    setLoading(true);
    
    // Budujemy obiekt danych dynamicznie
    const raceData: any = { 
      title, 
      race_date: date, 
      city, 
      created_by: user.id 
    };
    
    // Dodajemy link tylko jeśli nie jest pusty (zakładając że kolumna już jest w DB)
    if (link) { raceData.event_url = link; }

    try {
      const { data: race, error: rErr } = await supabase
        .from("races")
        .insert([raceData])
        .select()
        .single();
      
      if (rErr) throw rErr;

      if (race) {
        await supabase.from("race_options").insert([{ 
          race_id: race.id, 
          label: dist + " km", 
          distance_km: parseFloat(dist.replace(",", ".")), 
          sort_order: 1 
        }]);
      }
      alert("Bieg dodany pomyślnie!");
      window.location.href = "/";
    } catch (err: any) { 
      console.error(err);
      alert("Błąd bazy danych: " + err.message + "\n\nUpewnij się, że dodałeś kolumnę event_url w SQL Editorze Supabase!"); 
    } finally { setLoading(false); }
  };

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: 20, color: "#fff" }}>
      <h1 style={{ fontWeight: 900, fontSize: "2.5rem", marginBottom: 30, color: "#00d4ff" }}>NOWY BIEG</h1>
      <form onSubmit={handleAdd} style={formS}>
        <div style={group}><label style={lab}>NAZWA ZAWODÓW *</label><input value={title} onChange={e => setTitle(e.target.value)} style={inS} required /></div>
        <div style={group}><label style={lab}>DATA STARTU *</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={{...inS, colorScheme: "dark"}} required /></div>
        <div style={group}>
          <label style={lab}>DYSTANS GŁÓWNY (KM) *</label>
          <input value={dist} onChange={e => setDist(e.target.value)} style={inS} required />
          <div style={{display:"flex", gap:8, marginTop:10}}>
            {["5", "10", "21.097", "42.195"].map(d => <button key={d} type="button" onClick={() => setDist(d)} style={chip}>{d}k</button>)}
          </div>
        </div>
        <div style={group}><label style={lab}>MIASTO</label><input value={city} onChange={e => setCity(e.target.value)} style={inS} /></div>
        <div style={group}><label style={lab}>LINK DO WYDARZENIA (OPCJONALNIE)</label><input placeholder="https://..." value={link} onChange={e => setLink(e.target.value)} style={inS} /></div>
        <button type="submit" disabled={loading} style={btnS}>{loading ? "TWORZENIE..." : "DODAJ BIEG"}</button>
      </form>
    </main>
  );
}
const formS = { display: "flex", flexDirection: "column" as const, gap: 20, background: "rgba(255,255,255,0.05)", padding: 40, borderRadius: 24, border: "1px solid #333" };
const group = { display: "flex", flexDirection: "column" as const, gap: 8 };
const lab = { fontSize: "0.75rem", opacity: 0.6, fontWeight: 900 };
const inS = { background: "#000", border: "1px solid #444", padding: "15px", borderRadius: "12px", color: "#fff", width: "100%" };
const chip = { background: "#222", color: "#00d4ff", border: "1px solid #00d4ff", padding: "6px 12px", borderRadius: "8px", fontSize: "0.75rem", cursor: "pointer", fontWeight: 900 };
const btnS = { background: "#00d4ff", color: "#000", padding: "18px", borderRadius: "14px", fontWeight: 900, border: "none", cursor: "pointer", fontSize: "1rem" };
