"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RaceCard from "./components/RaceCard";

export default function HomePage() {
  const [races, setRaces] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  useEffect(() => {
    fetchRaces();
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchRaces() {
    setLoading(true);
    const { data } = await supabase.from("races").select("*").order("race_date", { ascending: true });
    if (data) setRaces(data);
    setLoading(false);
  }

  const now = new Date().toISOString().split("T")[0];
  const upcomingRaces = races.filter((r) => r.race_date >= now);
  const pastRaces = races.filter((r) => r.race_date < now);

  if (loading) return <div style={{ color: "#fff", padding: "50px", textAlign: "center", background: "#000", minHeight: "100vh" }}>Wczytywanie...</div>;

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", color: "#fff", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>BIEGI</h1>
          <p style={{ opacity: 0.5 }}>Kalendarz startów ekipy KART</p>
        </div>
        {user ? (
          <a href="/dashboard" style={addBtnStyle}>+ DODAJ BIEG</a>
        ) : (
          <div style={{ fontSize: "0.8rem", opacity: 0.4 }}>Zaloguj się, aby dodać bieg</div>
        )}
      </div>
      <section>
        <h2 style={sectionTitleStyle}>Nadchodzące</h2>
        <div style={gridStyle}>
          {upcomingRaces.length > 0 ? (
            upcomingRaces.map((race) => <RaceCard key={race.id} race={race} />)
          ) : (
            <p style={{ opacity: 0.3, padding: "20px" }}>Brak zaplanowanych biegów...</p>
          )}
        </div>
      </section>
      <section style={{ marginTop: "60px" }}>
        <h2 style={{ ...sectionTitleStyle, opacity: 0.5 }}>Minione</h2>
        <div style={gridStyle}>
          {pastRaces.map((race) => <RaceCard key={race.id} race={race} />)}
        </div>
      </section>
    </main>
  );
}

const gridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" };
const sectionTitleStyle: React.CSSProperties = { fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "2px", borderBottom: "1px solid #222", paddingBottom: "10px", marginBottom: "20px", color: "#00d4ff", fontWeight: "bold" };
const addBtnStyle: React.CSSProperties = { background: "#00d4ff", color: "#000", padding: "14px 28px", borderRadius: "12px", textDecoration: "none", fontWeight: "900", fontSize: "0.9rem", boxShadow: "0 8px 20px rgba(0, 212, 255, 0.4)" };
