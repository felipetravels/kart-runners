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

  const [myStatus, setMyStatus] = useState({
    wants_to_participate: true,
    registered: false,
    paid: false
  });

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        setLoading(false);
      }
    }
    checkUser();
  }, [router]);

  const addOptionField = () => setOptions([...options, { label: "", distance_km: "" }]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: race, error: raceError } = await supabase
      .from("races")
      .insert([raceData])
      .select()
      .single();

    if (raceError) {
      alert("Błąd dodawania biegu: " + raceError.message);
      setLoading(false);
      return;
    }

    const optionsToInsert = options
      .filter(o => o.label !== "" && o.distance_km !== "")
      .map((o, index) => ({
        race_id: race.id,
        label: o.label,
        distance_km: parseFloat(o.distance_km.toString()) || 0,
        sort_order: index
      }));

    if (optionsToInsert.length > 0) {
      await supabase.from("race_options").insert(optionsToInsert);
    }

    await supabase.from("participations").insert([{
      user_id: user.id,
      race_id: race.id,
      ...myStatus
    }]);

    alert("Bieg dodany pomyślnie!");
    router.push("/");
  };

  if (loading) return <div style={{ color: "white", padding: 50, textAlign: "center" }}>Ładowanie...</div>;

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px", color: "#fff" }}>
      <header style={{ marginBottom: 30 }}>
        <a href="/" style={{ color: "#00d4ff", textDecoration: "none", fontSize: "0.9rem" }}>← Wróć</a>
        <h1 style={{ fontSize: "2.5rem", marginTop: 10 }}>Dodaj nowe wydarzenie</h1>
      </header>

      <form onSubmit={handleSave} style={{ display: "grid", gap: 30 }}>
        <section style={sectionStyle}>
          <h3 style={h3Style}>1. Informacje podstawowe</h3>
          <div style={gridStyle}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>Nazwa wydarzenia</label>
              <input required placeholder="np. Bieg Walentynkowy" style={inputStyle} 
                value={raceData.title} onChange={e => setRaceData({...raceData, title: e.target.value})} />
            </div>
            <div>
              <label style={labelStyle}>Data (kliknij ikonę kalendarza)</label>
              <input type="date" required style={inputStyle} 
                value={raceData.race_date} onChange={e => setRaceData({...raceData, race_date: e.target.value})} />
            </div>
            <div>
              <label style={labelStyle}>Miasto</label>
              <input placeholder="np. Kraków" style={inputStyle} 
                value={raceData.city} onChange={e => setRaceData({...raceData, city: e.target.value})} />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>Opis i koszt</label>
              <textarea placeholder="Opisz bieg..." style={{...inputStyle, minHeight: 120}} 
                value={raceData.description} onChange={e => setRaceData({...raceData, description: e.target.value})} />
            </div>
          </div>
        </section>

        <section style={sectionStyle}>
          <h3 style={h3Style}>2. Dystanse</h3>
          {options.map((opt, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <input placeholder="np. 10 KM" style={{...inputStyle, flex: 2}} 
                value={opt.label} onChange={e => {
                  const newOpts = [...options];
                  newOpts[i].label = e.target.value;
                  setOptions(newOpts);
                }} />
              <input type="number" step="0.1" placeholder="KM" style={{...inputStyle, flex: 1}} 
                value={opt.distance_km} onChange={e => {
                  const newOpts = [...options];
                  newOpts[i].distance_km = e.target.value;
                  setOptions(newOpts);
                }} />
            </div>
          ))}
          <button type="button" onClick={addOptionField} style={secondaryBtnStyle}>+ Dodaj kolejny dystans</button>
        </section>

        <section style={sectionStyle}>
          <h3 style={h3Style}>3. Twój status</h3>
          <div style={{ display: "flex", gap: 20 }}>
            <label style={checkLabelStyle}><input type="checkbox" checked={myStatus.wants_to_participate} onChange={e => setMyStatus({...myStatus, wants_to_participate: e.target.checked})} /> Udział</label>
            <label style={checkLabelStyle}><input type="checkbox" checked={myStatus.registered} onChange={e => setMyStatus({...myStatus, registered: e.target.checked})} /> Zapisany</label>
            <label style={checkLabelStyle}><input type="checkbox" checked={myStatus.paid} onChange={e => setMyStatus({...myStatus, paid: e.target.checked})} /> Opłacone</label>
          </div>
        </section>

        <button type="submit" style={mainBtnStyle}>OPUBLIKUJ BIEG</button>
      </form>
    </main>
  );
}

const sectionStyle: React.CSSProperties = { background: "rgba(255,255,255,0.05)", padding: 25, borderRadius: 20 };
const h3Style: React.CSSProperties = { marginTop: 0, color: "#00d4ff", fontSize: "1rem", marginBottom: 20 };
const gridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 };
const labelStyle: React.CSSProperties = { display: "block", marginBottom: 8, fontSize: "0.85rem", opacity: 0.6 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #333", background: "#000", color: "#fff", boxSizing: "border-box" };
const checkLabelStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" };
const secondaryBtnStyle: React.CSSProperties = { background: "rgba(255,255,255,0.05)", border: "1px dashed #444", color: "#aaa", padding: "10px", borderRadius: "10px", cursor: "pointer", width: "100%" };
const mainBtnStyle: React.CSSProperties = { padding: "20px", background: "#00d4ff", color: "#000", border: "none", borderRadius: "15px", fontWeight: "bold", cursor: "pointer" };