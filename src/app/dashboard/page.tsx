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
      // 1. Dodajemy bieg z przypisaniem twórcy (created_by)
      const { data: race, error: rErr } = await supabase
        .from("races")
        .insert([{ 
          title, 
          race_date: date, 
          city, 
          description: "",
          created_by: user.id // Naprawa błędu NOT-NULL
        }])
        .select()
        .single();

      if (rErr) throw rErr;

      // 2. Dodajemy domyślny dystans
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
      alert("Błąd bazy: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 500, margin: "40px auto", padding: 20, color: "#fff" }}>
      <h1 style={{ fontWeight: 900, marginBottom: 20 }}>DODAJ NOWY BIEG</h1>
      <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <div style={group}>
          <label style={lab}>Nazwa zawodów</label>
          <input placeholder="np. Maraton Warszawski" value={title} onChange={e => setTitle(e.target.value)} style={inS} />
        </div>
        
        <div style={group}>
          <label style={lab}>Data</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inS} />
        </div>

        <div style={group}>
          <label style={lab}>Dystans (km)</label>
          <input placeholder="np. 5 lub 21.097" value={dist} onChange={e => setDist(e.target.value)} style={inS} />
          <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
            {["5", "10", "21.097", "42.195"].map(d => (
              <button key={d} type="button" onClick={() => setDist(d)} style={chip}>{d}k</button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} style={{...btn, opacity: loading ? 0.5 : 1}}>
          {loading ? "TWORZENIE..." : "UTWÓRZ WYDARZENIE"}
        </button>
      </form>
    </main>
  );
}

const group = { display: "flex", flexDirection: "column" as const, gap: 5 };
const lab = { fontSize: "0.7rem", opacity: 0.5, textTransform: "uppercase" as const };
const inS = { background: "#111", border: "1px solid #333", padding: 12, borderRadius: 10, color: "#fff" };
const chip = { background: "#222", color: "#fff", border: "1px solid #444", padding: "5px 10px", borderRadius: 5, fontSize: "0.7rem", cursor: "pointer" };
const btn = { background: "#00d4ff", color: "#000", padding: 15, borderRadius: 10, fontWeight: "bold", border: "none", cursor: "pointer", marginTop: 10 };
