"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [dist, setDist] = useState("");
  const [city, setCity] = useState("Kraków");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        alert("Musisz być zalogowany!");
        window.location.href = "/login";
      }
      setUser(session?.user);
    });
  }, []);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    if (!title || !date || !dist || !user) {
      alert("Wypełnij wszystkie pola!");
      return;
    }

    setLoading(true);
    try {
      // 1. Dodajemy bieg z id twórcy
      const { data: race, error: rErr } = await supabase
        .from("races")
        .insert([{ 
          title, 
          race_date: date, 
          city, 
          description: "",
          created_by: user.id
        }])
        .select()
        .single();

      if (rErr) throw rErr;

      // 2. Dodajemy domyślny dystans (np. 5km)
      if (race) {
        const { error: oErr } = await supabase
          .from("race_options")
          .insert([{ 
            race_id: race.id, 
            label: dist + " km", 
            distance_km: parseFloat(dist.replace(",", ".")), 
            sort_order: 1 
          }]);
        if (oErr) throw oErr;
      }

      alert("Bieg utworzony pomyślnie!");
      window.location.href = "/";
    } catch (err: any) {
      alert("Błąd: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: 20, color: "#fff" }}>
      <h1 style={{ fontWeight: 900, fontSize: "2.5rem", marginBottom: 30, color: "#00d4ff" }}>NOWE WYDARZENIE</h1>
      <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 20, background: "rgba(255,255,255,0.05)", padding: 40, borderRadius: 24, border: "1px solid #333" }}>
        
        <div style={group}>
          <label style={lab}>NAZWA ZAWODÓW</label>
          <input placeholder="np. Maraton Warszawski" value={title} onChange={e => setTitle(e.target.value)} style={inS} />
        </div>
        
        <div style={group}>
          <label style={lab}>DATA STARTU</label>
          {/* NOWOCZESNY KALENDARZ ZWROTNIE STYLIZOWANY */}
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            style={{...inS, colorScheme: "dark", cursor: "pointer"}} 
          />
        </div>

        <div style={group}>
          <label style={lab}>DYSTANS GŁÓWNY (KM)</label>
          <input placeholder="np. 21.1" value={dist} onChange={e => setDist(e.target.value)} style={inS} />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {["5", "10", "21.097", "42.195"].map(d => (
              <button key={d} type="button" onClick={() => setDist(d)} style={chip}>{d}k</button>
            ))}
          </div>
        </div>

        <div style={group}>
          <label style={lab}>MIASTO</label>
          <input value={city} onChange={e => setCity(e.target.value)} style={inS} />
        </div>

        <button type="submit" disabled={loading} style={{...btn, opacity: loading ? 0.5 : 1}}>
          {loading ? "TWORZENIE..." : "UTWÓRZ I POWIADOM EKIPĘ"}
        </button>
      </form>
    </main>
  );
}

const group = { display: "flex", flexDirection: "column" as const, gap: 8 };
const lab = { fontSize: "0.75rem", opacity: 0.6, fontWeight: 900, letterSpacing: "1px" };
const inS = { background: "#000", border: "1px solid #444", padding: "15px", borderRadius: "12px", color: "#fff", fontSize: "1rem", outline: "none" };
const chip = { background: "#222", color: "#00d4ff", border: "1px solid #00d4ff", padding: "6px 12px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 900, cursor: "pointer" };
const btn = { background: "#00d4ff", color: "#000", padding: "18px", borderRadius: "14px", fontWeight: 900, border: "none", cursor: "pointer", marginTop: 10, fontSize: "1rem" };
