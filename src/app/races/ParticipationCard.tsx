"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ParticipationCardProps {
  raceId: string;
  options?: any[];
}

export default function ParticipationCard({ raceId }: ParticipationCardProps) {
  const [status, setStatus] = useState({ is_registered: false, is_paid: false, is_cheering: false });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchStatus() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      setUser(session.user);

      // ZMIANA: participations (liczba mnoga)
      const { data } = await supabase
        .from("participations")
        .select("*")
        .eq("race_id", raceId)
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data) setStatus({ 
        is_registered: data.is_registered || false, 
        is_paid: data.is_paid || false, 
        is_cheering: data.is_cheering || false 
      });
      setLoading(false);
    }
    fetchStatus();
  }, [raceId]);

  const toggle = async (field: string, val: boolean) => {
    if (!user) { alert("Zaloguj się!"); return; }
    
    const newStatus = { ...status, [field]: val };
    setStatus(newStatus);

    // ZMIANA: participations (liczba mnoga)
    const { error } = await supabase
      .from("participations")
      .upsert({ 
        user_id: user.id, 
        race_id: raceId, 
        is_cheering: newStatus.is_cheering,
        is_registered: newStatus.is_registered,
        is_paid: newStatus.is_paid,
        display_name: user.user_metadata?.display_name || user.email 
      }, { onConflict: "user_id,race_id" });
    
    if (error) {
      console.error("Błąd zapisu:", error);
      // alert("Błąd zapisu! Sprawdź SQL w Supabase."); 
    }
  };

  if (loading) return null;

  return (
    <section style={{ background: "rgba(255,255,255,0.05)", padding: 30, borderRadius: 24, border: "1px solid #333" }}>
      <h3 style={{ color: "#00d4ff", marginTop: 0, fontSize: "1.2rem", fontWeight: 900 }}>TWOJE ZGŁOSZENIE</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: 20 }}>
        <label style={lab}><input type="checkbox" checked={status.is_cheering} onChange={e => toggle("is_cheering", e.target.checked)} style={chk} /> <span style={{color: status.is_cheering ? "#ffff00" : "#888"}}>1. CHCĘ POBIEC</span></label>
        <label style={lab}><input type="checkbox" checked={status.is_registered} onChange={e => toggle("is_registered", e.target.checked)} style={chk} /> <span style={{color: status.is_registered ? "#00d4ff" : "#888"}}>2. ZAPISANY</span></label>
        <label style={lab}><input type="checkbox" checked={status.is_paid} onChange={e => toggle("is_paid", e.target.checked)} style={chk} /> <span style={{color: status.is_paid ? "#00ff88" : "#888"}}>3. OPŁACONY</span></label>
      </div>
    </section>
  );
}
const lab = { display: "flex", alignItems: "center", gap: "15px", fontWeight: 900, cursor: "pointer", fontSize: "1rem" };
const chk = { width: "24px", height: "24px", cursor: "pointer", accentColor: "#00d4ff" };
