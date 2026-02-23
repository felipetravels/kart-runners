"use client";
import { useEffect, useState, use as useReact } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import RaceMyResult from "@/app/RaceMyResult";
import ParticipationCard from "@/app/races/ParticipationCard";

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
        const { data: pData } = await supabase.from("participations")
          .select("*")
          .eq("race_id", raceId)
          .eq("user_id", user.id)
          .maybeSingle();
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
    if (!user) return alert("Musisz być zalogowany!");

    // Optymistyczna aktualizacja UI (żeby od razu było widać kliknięcie)
    setParticipation((prev: any) => ({ ...prev, [field]: value }));

    try {
      if (participation?.id) {
        // Jeśli rekord istnieje - UPDATE
        const { error } = await supabase
          .from("participations")
          .update({ [field]: value })
          .eq("id", participation.id);
        
        if (error) throw error;
      } else {
        // Jeśli rekord nie istnieje - INSERT
        const { data, error } = await supabase
          .from("participations")
          .insert([{ 
            race_id: raceId, 
            user_id: user.id, 
            [field]: value,
            display_name: user.email?.split('@')[0] || "Biegacz" 
          }])
          .select()
          .single();
        
        if (error) throw error;
        setParticipation(data);
      }

      // KLUCZOWE: Czekamy chwilę na propagację danych w Supabase i odświeżamy
      setTimeout(() => {
        window.location.reload();
      }, 300);

    } catch (err: any) {
      console.error("Błąd zapisu:", err);
      alert("Błąd zapisu: " + err.message);
      // W razie błędu przywracamy poprzedni stan w UI
      window.location.reload();
    }
  };

  if (loading) return <div style={{ color: "#fff", padding: "100px", textAlign: "center" }}>Ładowanie szczegółów...</div>;
  if (!race) return <div style={{ color: "#fff", padding: "100px", textAlign: "center" }}>Bieg nie istnieje.</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", paddingTop: "60px" }}>
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
          <div>
            <Link href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 700 }}>← POWRÓT</Link>
            <h1 style={{ fontSize: "3.5rem", fontWeight: 900, marginTop: "15px", color: "#00d4ff", lineHeight: 1 }}>{race.title}</h1>
            <p style={{ color: "#666", fontWeight: 700, marginTop: "10px" }}>{race.race_date} | {race.location}</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href={`/admin/races?id=${race.id}&action=copy`} style={btnS}>KOPIUJ</Link>
            <Link href={`/admin/races?id=${race.id}&action=edit`} style={{ ...btnS, background: "#f39c12" }}>EDYTUJ</Link>
          </div>
        </div>

        {/* STATUSY - ZABEZPIECZONE PRZED ZNIKANIEM */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", background: "#050505", padding: "25px", borderRadius: "20px", border: "1px solid #111", marginBottom: "40px" }}>
          <label style={checkS}>
            <input 
              type="checkbox" 
              checked={!!participation?.is_interested} 
              onChange={e => updateStatus("is_interested", e.target.checked)} 
            /> CHCĘ WZIĄĆ UDZIAŁ
          </label>
          <label style={checkS}>
            <input 
              type="checkbox" 
              checked={!!participation?.is_registered} 
              onChange={e => updateStatus("is_registered", e.target.checked)} 
            /> ZAREJESTROWANY
          </label>
          <label style={checkS}>
            <input 
              type="checkbox" 
              checked={!!participation?.is_paid} 
              onChange={e => updateStatus("is_paid", e.target.checked)} 
            /> OPŁACONE
          </label>
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