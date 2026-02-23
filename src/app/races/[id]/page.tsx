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
      const { data: rD } = await supabase.from("races").select("*").eq("id", raceId).single();
      const { data: oD } = await supabase.from("race_options").select("*").eq("race_id", raceId);
      if (user) {
        const { data: pD } = await supabase.from("participations").select("*").eq("race_id", raceId).eq("user_id", user.id).maybeSingle();
        setParticipation(pD);
      }
      setRace(rD); setOptions(oD || []); setLoading(false);
    }
    fetchData();
  }, [raceId]);

  const updateStatus = async (field: string, value: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Zaloguj się!");
    setParticipation((p: any) => ({ ...p, [field]: value }));
    try {
      if (participation?.id) {
        await supabase.from("participations").update({ [field]: value }).eq("id", participation.id);
      } else {
        const { data } = await supabase.from("participations").insert([{ race_id: raceId, user_id: user.id, [field]: value, display_name: "Zawodnik" }]).select().single();
        setParticipation(data);
      }
      setTimeout(() => window.location.reload(), 400);
    } catch (e) { console.error(e); window.location.reload(); }
  };

  if (loading || !race) return <div style={{ color: "#fff", padding: "100px", textAlign: "center" }}>Ładowanie...</div>;

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "50px" }}>
        <div><Link href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: 700 }}>← POWRÓT</Link><h1 style={{ fontSize: "3.5rem", fontWeight: 900, color: "#00d4ff", margin: "15px 0" }}>{race.title}</h1><p style={{ color: "#666" }}>{race.race_date} | {race.location}</p></div>
        <div style={{ display: "flex", gap: "10px" }}><Link href={`/admin/races?id=${race.id}&action=copy`} style={btnS}>KOPIUJ</Link><Link href={`/admin/races?id=${race.id}&action=edit`} style={{ ...btnS, background: "#f39c12" }}>EDYTUJ</Link></div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", background: "#111", padding: "30px", borderRadius: "25px", border: "1px solid #222", marginBottom: "50px" }}>
        <label style={checkS}><input type="checkbox" checked={!!participation?.is_cheering} onChange={e => updateStatus("is_cheering", e.target.checked)} /> CHCĘ WZIĄĆ UDZIAŁ</label>
        <label style={checkS}><input type="checkbox" checked={!!participation?.is_registered} onChange={e => updateStatus("is_registered", e.target.checked)} /> ZAREJESTROWANY</label>
        <label style={checkS}><input type="checkbox" checked={!!participation?.is_paid} onChange={e => updateStatus("is_paid", e.target.checked)} /> OPŁACONE</label>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "40px" }}>
        <div style={boxS}><p style={labelS}>TWOJE WYNIKI</p><RaceMyResult raceId={race.id} options={options} /></div>
        <div style={boxS}><p style={labelS}>LISTA STARTOWA</p><ParticipationCard raceId={race.id} /></div>
      </div>
    </main>
  );
}
const btnS = { padding: "12px 25px", background: "#333", color: "#fff", borderRadius: "10px", textDecoration: "none", fontSize: "0.8rem", fontWeight: 900 };
const checkS = { display: "flex", alignItems: "center", gap: "12px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" };
const boxS = { background: "#080808", padding: "40px", borderRadius: "30px", border: "1px solid #111" };
const labelS = { color: "#444", fontWeight: 900, fontSize: "0.75rem", letterSpacing: "3px", marginBottom: "25px" };