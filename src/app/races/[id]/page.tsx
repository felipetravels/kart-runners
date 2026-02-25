"use client";
import { useEffect, useState, use as useReact } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import RaceMyResult from "@/app/RaceMyResult";
import ParticipationCard from "../ParticipationCard";

export default function RaceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: raceId } = useReact(params);
  const [race, setRace] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [participation, setParticipation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

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
    if (isUpdating) return;
    setIsUpdating(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Musisz być zalogowany!");
      setIsUpdating(false);
      return;
    }

    setParticipation((prev: any) => ({ ...prev, [field]: value }));

    try {
      const { data: existingRecord } = await supabase
        .from("participations")
        .select("*")
        .eq("race_id", raceId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingRecord) {
        const { error } = await supabase
          .from("participations")
          .update({ [field]: value })
          .eq("race_id", raceId)
          .eq("user_id", user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("participations")
          .insert([{ 
            race_id: raceId, 
            user_id: user.id, 
            [field]: value,
            display_name: user.email?.split('@')[0] || "Biegacz" 
          }]);
        
        if (error) throw error;
      }
    } catch (err: any) {
      console.error("Błąd zapisu:", err);
      alert("Błąd zapisu: " + err.message);
      setParticipation((prev: any) => ({ ...prev, [field]: !value }));
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div style={{ color: "#fff", padding: "100px", textAlign: "center" }}>Ładowanie szczegółów biegu...</div>;
  if (!race) return <div style={{ color: "#fff", padding: "100px", textAlign: "center" }}>Bieg nie został znaleziony.</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", paddingTop: "60px" }}>
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
          <div>
            <Link href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 700, letterSpacing: "1px" }}>← POWRÓT</Link>
            <h1 style={{ fontSize: "3.5rem", fontWeight: 900, marginTop: "15px", color: "#00d4ff", lineHeight: 1 }}>{race.title}</h1>
            <p style={{ color: "#666", fontWeight: 700, marginTop: "10px", fontSize: "1.1rem" }}>
              {race.race_date} | {race.city} {race.description ? `- ${race.description}` : ""}
            </p>
            {race.signup_url && (
              <a href={race.signup_url} target="_blank" style={{ color: "#00d4ff", fontSize: "0.9rem", textDecoration: "underline", display: "inline-block", marginTop: "10px" }}>
                Strona biegu →
              </a>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href={`/admin/races?id=${race.id}&action=copy`} style={btnS}>KOPIUJ</Link>
            <Link href={`/admin/races?id=${race.id}&action=edit`} style={{ ...btnS, background: "#f39c12" }}>EDYTUJ</Link>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", background: "#050505", padding: "25px", borderRadius: "20px", border: "1px solid #111", marginBottom: "50px", opacity: isUpdating ? 0.6 : 1, transition: "opacity 0.2s" }}>
          <label style={checkS}>
            <input 
              type="checkbox" 
              checked={!!participation?.is_cheering} 
              onChange={e => updateStatus("is_cheering", e.target.checked)} 
              disabled={isUpdating}
            /> CHCĘ WZIĄĆ UDZIAŁ
          </label>
          <label style={checkS}>
            <input 
              type="checkbox" 
              checked={!!participation?.is_registered} 
              onChange={e => updateStatus("is_registered", e.target.checked)} 
              disabled={isUpdating}
            /> ZAREJESTROWANY
          </label>
          <label style={checkS}>
            <input 
              type="checkbox" 
              checked={!!participation?.is_paid} 
              onChange={e => updateStatus("is_paid", e.target.checked)} 
              disabled={isUpdating}
            /> OPŁACONE
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "40px" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "30px", borderRadius: "25px", border: "1px solid #111" }}>
            <h3 style={{ fontSize: "0.8rem", color: "#444", fontWeight: 900, marginBottom: "20px", letterSpacing: "2px" }}>TWOJE WYNIKI</h3>
            <RaceMyResult raceId={race.id} options={options} />
          </div>
          <div>
            <h3 style={{ fontSize: "0.8rem", color: "#444", fontWeight: 900, marginBottom: "20px", letterSpacing: "2px" }}>LISTA STARTOWA</h3>
            <ParticipationCard raceId={race.id} />
          </div>
        </div>
      </main>
    </div>
  );
}

const btnS = { padding: "12px 25px", background: "#333", color: "#fff", borderRadius: "10px", textDecoration: "none", fontSize: "0.8rem", fontWeight: 900 };
const checkS = { display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", fontWeight: 900, cursor: "pointer" };