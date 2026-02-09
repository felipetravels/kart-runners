"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [races, setRaces] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email !== "filip.cialowicz@gmail.com") {
        window.location.href = "/";
      }
      setUser(session?.user);
    });
    supabase.from("races").select("*").order("race_date", { ascending: false }).then(({ data }) => setRaces(data || []));
  }, []);

  const deleteRace = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten bieg i wszystkie wyniki?")) return;
    await supabase.from("races").delete().eq("id", id);
    setRaces(races.filter(r => r.id !== id));
  };

  if (!user) return null;

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", padding: 20, color: "#fff" }}>
      <h1 style={{ fontWeight: 900, color: "#ffaa00" }}>PANEL ADMINA (SUPERMOCE)</h1>
      <div style={{ marginTop: 40 }}>
        <h2>Zarządzaj Biegami</h2>
        {races.map(r => (
          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: 15, background: "#111", marginBottom: 10, borderRadius: 10 }}>
            <span>{r.title} ({r.race_date})</span>
            <button onClick={() => deleteRace(r.id)} style={{ background: "#ff4444", color: "#fff", border: "none", padding: "5px 10px", borderRadius: 5, fontWeight: "bold", cursor: "pointer" }}>USUŃ</button>
          </div>
        ))}
      </div>
    </main>
  );
}
