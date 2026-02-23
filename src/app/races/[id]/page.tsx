"use client";
import { useEffect, useState, use } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";
import RaceMyResult from "../../RaceMyResult";
import ParticipationCard from "../ParticipationCard";

export default function RaceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const raceId = resolvedParams.id;

  const [race, setRace] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [participation, setParticipation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!raceId) return;
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Dane biegu
      const { data: raceData } = await supabase.from("races").select("*").eq("id", raceId).single();
      // 2. Opcje dystansów
      const { data: optData } = await supabase.from("race_options").select("*").eq("race_id", raceId);
      
      // 3. Status udziału zalogowanego użytkownika
      if (user) {
        const { data: pData } = await supabase.from("participations").select("*").eq("race_id", raceId).eq("user_id", user.id).single();
        setParticipation(pData);
      }

      if (raceData) setRace(raceData);
      if (optData) setOptions(optData);
      setLoading(false);
    }
    fetchData();
  }, [raceId]);

  const toggleStatus = async (field: string, value: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Musisz być zalogowany!");

    if (participation) {
      await supabase.from("participations").update({ [field]: value }).eq("id", participation.id);
    } else {
      const { data } = await supabase.from("participations").insert({
        race_id: raceId,
        user_id: user.id,
        [field]: value,
        display_name: "Użytkownik" // Tu najlepiej pobrać z profilu
      }).select().single();
      setParticipation(data);
    }
    window.location.reload();
  };

  if (loading) return <div style={{ padding: "100px", textAlign: "center", color: "#fff" }}>Ładowanie szczegółów biegu...</div>;
  if (!race) return <div style={{ padding: "100px", textAlign: "center", color: "#fff" }}>Bieg nie został znaleziony.</div>;

  return (
    <div style={{ paddingTop: "50px", minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
        
        {/* NAGŁÓWEK I PRZYCISKI AKCJI */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
          <div>
            <Link href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 700, fontSize: "0.8rem" }}>← POWRÓT</Link>
            <h1 style={{ fontSize: "3.5rem", fontWeight: 900, marginTop: "15px", color: "#00d4ff", lineHeight: 1 }}>{race.title}</h1>
            <p style={{ color: "#666", fontWeight: 700, marginTop: "10px" }}>{race.race_date} | {race.location}</p>
            {race.website_url && (
              <a href={race.website_url} target="_blank" style={{ color: "#00d4ff", fontSize: "0.8rem", textDecoration: "underline" }}>Strona biegu →</a>
            )}
          </div>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href={`/admin/races?id=${race.id}&action=copy`} style={btnAdminS}>KOPIUJ</Link>
            <Link href={`/admin/races?id=${race.id}&action=edit`} style={{ ...btnAdminS, background: "#f39c12" }}>EDYTUJ</Link>
          </div>
        </div>

        {/* STATUSY UDZIAŁU (CHECKBOXY) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "50px", background: "#050505", padding: "30px", borderRadius: "20px", border: "1px solid #111" }}>
          <label style={checkLabelS}>
            <input type="checkbox" checked={participation?.is_interested || false} onChange={(e) => toggleStatus("is_interested", e.target.checked)} />
            CHCE WZIĄĆ UDZIAŁ
          </label>
          <label style={checkLabelS}>
            <input type="checkbox" checked={participation?.is_registered || false} onChange={(e) => toggleStatus("is_registered", e.target.checked)} />
            ZAREJESTROWANY
          </label>
          <label style={checkLabelS}>
            <input type="checkbox" checked={participation?.is_paid || false} onChange={(e) => toggleStatus("is_paid", e.target.checked)} />
            OPŁACONE
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "40px" }}>
          {/* LEWA KOLUMNA: WYNIK */}
          <div>
            <p style={labelS}>TWOJE WYNIKI</p>
            <RaceMyResult raceId={race.id} options={options} />
          </div>

          {/* PRAWA KOLUMNA: LISTA STARTOWA */}
          <div>
            <p style={labelS}>LISTA STARTOWA WYDARZENIA</p>
            <ParticipationCard raceId={race.id} />
          </div>
        </div>
      </main>
    </div>
  );
}

const labelS = { color: "#444", fontWeight: 900, letterSpacing: "2px", marginBottom: "20px", fontSize: "0.8rem" };
const checkLabelS = { display: "flex", alignItems: "center", gap: "10px", fontSize: "0.8rem", fontWeight: 900, cursor: "pointer" };
const btnAdminS = { padding: "8px 20px", background: "#333", color: "#fff", borderRadius: "8px", textDecoration: "none", fontSize: "0.7rem", fontWeight: 900 };