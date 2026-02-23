"use client";
import { useEffect, useState, use as useReact } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import RaceMyResult from "@/app/RaceMyResult";
import ParticipationCard from "@/app/races/ParticipationCard"; // Zakładam, że ten plik tam jest

export default function RaceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: raceId } = useReact(params);
  const [race, setRace] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [participation, setParticipation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!raceId) return;
      const { data: { user } } = await supabase.auth.getUser();

      const { data: raceData } = await supabase.from("races").select("*").eq("id", raceId).single();
      const { data: optData } = await supabase.from("race_options").select("*").eq("race_id", raceId);
      
      if (user) {
        const { data: pData } = await supabase.from("participations").select("*").eq("race_id", raceId).eq("user_id", user.id).maybeSingle();
        setParticipation(pData);
      }

      setRace(raceData);
      setOptions(optData || []);
      setLoading(false);
    }
    fetchData();
  }, [raceId]);

  const updateStatus = async (field: string, value: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Zaloguj się!");

    const payload = { [field]: value, race_id: raceId, user_id: user.id, display_name: "Zawodnik" };
    
    if (participation) {
      await supabase.from("participations").update({ [field]: value }).eq("id", participation.id);
    } else {
      await supabase.from("participations").insert([payload]);
    }
    window.location.reload();
  };

  if (loading) return <div style={{ color: "#fff", padding: "100px", textAlign: "center" }}>Ładowanie...</div>;
  if (!race) return <div style={{ color: "#fff", padding: "100px", textAlign: "center" }}>Bieg nie istnieje.</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", paddingTop: "60px" }}>
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
          <div>
            <Link href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 700 }}>← POWRÓT</Link>
            <h1 style={{ fontSize: "3.5rem", fontWeight: 900, marginTop: "15px", color: "#00d4ff", lineHeight: 1 }}>{race.title}</h1>
            <p style={{ color: "#666", fontWeight: 700, marginTop: "10px" }}>{race.race_date} | {race.location}</p>
            {race.website_url && <a href={race.website_url} target="_blank" style={{ color: "#00d4ff", fontSize: "0.8rem" }}>Link do zapisów →</a>}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href={`/admin/races?id=${race.id}&action=copy`} style={btnS}>KOPIUJ</Link>
            <Link href={`/admin/races?id=${race.id}&action=edit`} style={{ ...btnS, background: "#f39c12" }}>EDYTUJ</Link>
          </div>
        </div>

        <div style={{ display: "flex", gap: "30px", background: "#050505", padding: "25px", borderRadius: "20px", border: "1px solid #111", marginBottom: "40px" }}>
          <label style={checkS}><input type="checkbox" checked={participation?.is_interested || false} onChange={e => updateStatus("is_interested", e.target.checked)} /> CHCĘ WZIĄĆ UDZIAŁ</label>
          <label style={checkS}><input type="checkbox" checked={participation?.is_registered || false} onChange={e => updateStatus("is_registered", e.target.checked)} /> ZAREJESTROWANY</label>
          <label style={checkS}><input type="checkbox" checked={participation?.is_paid || false} onChange={e => updateStatus("is_paid", e.target.checked)} /> OPŁACONE</label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "40px" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "30px", borderRadius: "25px", border: "1px solid #111" }}>
            <h3 style={{ fontSize: "0.8rem", color: "#444", fontWeight: 900, marginBottom: "20px" }}>TWOJE WYNIKI</h3>
            <RaceMyResult raceId={race.id} options={options} />
          </div>
          <div>
            <h3 style={{ fontSize: "0.8rem", color: "#444", fontWeight: 900, marginBottom: "20px" }}>LISTA STARTOWA</h3>
            <ParticipationCard raceId={race.id} />
          </div>
        </div>
      </main>
    </div>
  );
}

const btnS = { padding: "10px 20px", background: "#333", color: "#fff", borderRadius: "10px", textDecoration: "none", fontSize: "0.75rem", fontWeight: 900 };
const checkS = { display: "flex", alignItems: "center", gap: "10px", fontSize: "0.75rem", fontWeight: 900, cursor: "pointer" };