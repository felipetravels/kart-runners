"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AddRacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [raceData, setRaceData] = useState({
    title: "",
    race_date: "",
    city: "",
    country: "Polska",
    description: "",
    signup_url: ""
  });

  const [options, setOptions] = useState([{ label: "", distance_km: "" }]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
      else {
        setUser(user);
        setLoading(false);
      }
    });
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    // 1. Dodaj bieg
    const { data: race, error: raceError } = await supabase
      .from("races")
      .insert([{ ...raceData, created_by: user.id }])
      .select().single();

    if (raceError) {
      alert("Błąd: " + raceError.message);
      setLoading(false);
      return;
    }

    // 2. Dodaj dystanse
    const opts = options
      .filter(o => o.label && o.distance_km)
      .map((o, i) => ({
        race_id: race.id,
        label: o.label,
        distance_km: parseFloat(o.distance_km),
        sort_order: i
      }));

    if (opts.length > 0) {
      await supabase.from("race_options").insert(opts);
    }

    alert("Bieg dodany!");
    router.push("/");
  };

  if (loading) return <div style={{ color: "#fff", padding: 50, textAlign: "center" }}>Inicjalizacja panelu...</div>;

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: "0 20px", color: "#fff" }}>
      <h1 style={{ fontWeight: 900, fontSize: "2rem", marginBottom: 30 }}>Nowy Bieg</h1>
      <form onSubmit={handleSave} style={{ display: "grid", gap: 20 }}>
        <input required placeholder="Nazwa biegu" style={inputStyle} onChange={e => setRaceData({...raceData, title: e.target.value})} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
          <input type="date" required style={inputStyle} onChange={e => setRaceData({...raceData, race_date: e.target.value})} />
          <input placeholder="Miasto" style={inputStyle} onChange={e => setRaceData({...raceData, city: e.target.value})} />
        </div>
        <textarea placeholder="Opis wydarzenia..." style={{ ...inputStyle, minHeight: 100 }} onChange={e => setRaceData({...raceData, description: e.target.value})} />
        
        <div style={{ background: "rgba(255,255,255,0.05)", padding: 20, borderRadius: 15 }}>
          <p style={{ margin: "0 0 10px 0", fontSize: "0.8rem", opacity: 0.5 }}>DYSTANSE</p>
          {options.map((opt, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <input placeholder="np. 10km" style={inputStyle} onChange={e => {
                const n = [...options]; n[i].label = e.target.value; setOptions(n);
              }} />
              <input type="number" step="0.1" placeholder="KM" style={{ ...inputStyle, width: 80 }} onChange={e => {
                const n = [...options]; n[i].distance_km = e.target.value; setOptions(n);
              }} />
            </div>
          ))}
          <button type="button" onClick={() => setOptions([...options, { label: "", distance_km: "" }])} style={btnSecondary}>+ Dodaj dystans</button>
        </div>

        <button type="submit" disabled={loading} style={btnPrimary}>OPUBLIKUJ WYDARZENIE</button>
      </form>
    </main>
  );
}

const inputStyle = { width: "100%", padding: "12px", borderRadius: "10px", background: "#111", border: "1px solid #333", color: "#fff", boxSizing: "border-box" as const };
const btnPrimary = { padding: "15px", background: "#00d4ff", color: "#000", border: "none", borderRadius: "12px", fontWeight: "900", cursor: "pointer" };
const btnSecondary = { background: "none", border: "1px dashed #444", color: "#888", padding: "10px", borderRadius: "10px", cursor: "pointer", width: "100%" };