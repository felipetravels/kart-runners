"use client";
import { useEffect, useState, use as useReact } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import RaceMyResult from "@/app/RaceMyResult";
import ParticipationCard from "@/app/races/ParticipationCard";

export default function RaceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: raceId } = useReact(params);
  const [race, setRace] = useState<any>(null);
  const [participation, setParticipation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: raceData } = await supabase.from("races").select("*").eq("id", raceId).single();
      if (user) {
        const { data: pData } = await supabase.from("participations").select("*").eq("race_id", raceId).eq("user_id", user.id).maybeSingle();
        setParticipation(pData);
      }
      setRace(raceData);
      setLoading(false);
    }
    fetchData();
  }, [raceId]);

  const updateStatus = async (field: string, value: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setParticipation((prev: any) => ({ ...prev, [field]: value }));
    if (participation?.id) {
      await supabase.from("participations").update({ [field]: value }).eq("id", participation.id);
    } else {
      const { data } = await supabase.from("participations").insert([{ race_id: raceId, user_id: user.id, [field]: value, display_name: "Zawodnik" }]).select().single();
      setParticipation(data);
    }
    setTimeout(() => window.location.reload(), 300);
  };

  if (loading || !race) return null;

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "140px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
        <div>
          <Link href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 700 }}>← POWRÓT</Link>
          <h1 style={{ fontSize: "3rem", fontWeight: 900, color: "#00d4ff", margin: "10px 0" }}>{race.title}</h1>
          <p style={{ color: "#666" }}>{race.race_date} | {race.location}</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href={`/admin/races?id=${race.id}&action=copy`} style={btnS}>KOPIUJ</Link>
          <Link href={`/admin/races?id=${race.id}&action=edit`} style={{ ...btnS, background: "#f39c12" }}>EDYTUJ</Link>
        </div>
      </div>

      <div style={{ display: "flex", gap: "30px", background: "#111", padding: "20px", borderRadius: "15px", marginBottom: "40px" }}>
        <label style={checkS}><input type="checkbox" checked={!!participation?.is_cheering} onChange={e => updateStatus("is_cheering", e.target.checked)} /> CHCĘ WZIĄĆ UDZIAŁ</label>
        <label style={checkS}><input type="checkbox" checked={!!participation?.is_registered} onChange={e => updateStatus("is_registered", e.target.checked)} /> ZAREJESTROWANY</label>
        <label style={checkS}><input type="checkbox" checked={!!participation?.is_paid} onChange={e => updateStatus("is_paid", e.target.checked)} /> OPŁACONE</label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "40px" }}>
        <div style={boxS}><h3>TWOJE WYNIKI</h3><RaceMyResult raceId={race.id} options={[]} /></div>
        <div style={boxS}><h3>LISTA STARTOWA</h3><ParticipationCard raceId={race.id} /></div>
      </div>
    </main>
  );
}
const btnS = { padding: "10px 20px", background: "#333", color: "#fff", borderRadius: "8px", textDecoration: "none", fontSize: "0.7rem", fontWeight: 900 };
const checkS = { display: "flex", alignItems: "center", gap: "10px", fontSize: "0.8rem", fontWeight: 700 };
const boxS = { background: "#050505", padding: "30px", borderRadius: "20px", border: "1px solid #111" };