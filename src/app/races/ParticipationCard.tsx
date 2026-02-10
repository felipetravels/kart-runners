"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ParticipationCard({ raceId }: { raceId: string }) {
  const [status, setStatus] = useState({ is_registered: false, is_paid: false, is_cheering: false });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchStatus() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      setUser(session.user);

      const { data } = await supabase
        .from("participation")
        .select("*")
        .eq("race_id", raceId)
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data) setStatus({ is_registered: data.is_registered, is_paid: data.is_paid, is_cheering: data.is_cheering });
      setLoading(false);
    }
    fetchStatus();
  }, [raceId]);

  const toggle = async (field: string, val: boolean) => {
    if (!user) return;
    const newStatus = { ...status, [field]: val };
    setStatus(newStatus);

    const { error } = await supabase
      .from("participation")
      .upsert({ 
        user_id: user.id, 
        race_id: raceId, 
        [field]: val,
        display_name: user.user_metadata?.display_name || user.email // Backup name
      }, { onConflict: "user_id,race_id" });
    
    if (error) console.error("Błąd zapisu:", error);
  };

  if (loading) return null;

  return (
    <section style={cardS}>
      <h3 style={{ color: "#00d4ff", marginTop: 0 }}>TWÓJ STATUS</h3>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <label style={lab}><input type="checkbox" checked={status.is_registered} onChange={e => toggle("is_registered", e.target.checked)} /> ZAPISANY</label>
        <label style={lab}><input type="checkbox" checked={status.is_paid} onChange={e => toggle("is_paid", e.target.checked)} /> OPŁACONY</label>
        <label style={lab}><input type="checkbox" checked={status.is_cheering} onChange={e => toggle("is_cheering", e.target.checked)} /> CHEERUJĘ</label>
      </div>
    </section>
  );
}
const cardS = { background: "rgba(255,255,255,0.05)", padding: 30, borderRadius: 24, border: "1px solid #333" };
const lab = { display: "flex", alignItems: "center", gap: "10px", fontWeight: 900, cursor: "pointer" };
