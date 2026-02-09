"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RaceCard from "./components/RaceCard";

export default function HomePage() {
  const [races, setRaces] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    
    async function fetchRaces() {
      const { data } = await supabase.from("races").select("*").order("race_date", { ascending: true });
      if (data) setRaces(data);
      setLoading(false);
    }

    fetchRaces();
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const now = new Date().toISOString().split("T")[0];
  const upcomingRaces = races.filter((r) => r.race_date >= now);
  const pastRaces = races.filter((r) => r.race_date < now);

  if (loading) return <div style={{ color: "#fff", padding: "50px", textAlign: "center", minHeight: "100vh", background: "#000" }}>Wczytywanie...</div>;

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, margin: 0 }}>BIEGI</h1>
          <p style={{ opacity: 0.5 }}>Ekipa KART</p>
        </div>
        {user && (
          <a href="/dashboard" style={{ background: "#00d4ff", color: "#000", padding: "12px 24px", borderRadius: "12px", textDecoration: "none", fontWeight: "900" }}>+ DODAJ BIEG</a>
        )}
      </div>
      <section>
        <h2 style={{ color: "#00d4ff", fontSize: "0.8rem", letterSpacing: "2px", borderBottom: "1px solid #222", paddingBottom: "10px" }}>NADCHODZĄCE</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", marginTop: "20px" }}>
          {upcomingRaces.map(race => <RaceCard key={race.id} race={race} />)}
        </div>
      </section>
      <section style={{ marginTop: "40px" }}>
        <h2 style={{ color: "#555", fontSize: "0.8rem", letterSpacing: "2px", borderBottom: "1px solid #222", paddingBottom: "10px" }}>MINIONE</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", marginTop: "20px", opacity: 0.6 }}>
          {pastRaces.map(race => <RaceCard key={race.id} race={race} />)}
        </div>
      </section>
    </main>
  );
}
