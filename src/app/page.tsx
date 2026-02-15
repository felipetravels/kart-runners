"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function HomePage() {
  const [stats, setStats] = useState({ total_km: 0 });
  const [races, setRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Pobieramy biegi z tabeli 'races'
        const { data: racesData, error: racesError } = await supabase
          .from("races")
          .select("*")
          .order("race_date", { ascending: true });

        if (racesError) throw racesError;

        // 2. Pobieramy uczestników z tabeli 'participations'
        const { data: partData, error: partError } = await supabase
          .from("participations")
          .select("*");

        if (partError) throw partError;

        if (racesData) {
          // Łączymy dane w kodzie, skoro baza ma problem z relacją
          const combinedData = racesData.map(race => ({
            ...race,
            participations: partData?.filter(p => p.race_id === race.id) || []
          }));

          setRaces(combinedData);

          // Liczymy sumę KM (zakładając, że dystans jest w kolumnie description lub liczymy z wyników)
          // Na razie weźmiemy sumę z Twojego widoku lub policzymy ręcznie:
          const total = partData?.reduce((acc, p) => acc + (parseFloat(p.km_done) || 0), 0) || 0;
          setStats({ total_km: total });
        }
      } catch (err) {
        console.error("Szczegóły błędu:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const now = new Date().toISOString().split('T')[0];
  const futureRaces = races.filter(r => r.race_date >= now);
  const pastRaces = races.filter(r => r.race_date < now).reverse();

  return (
    <div style={{ 
      minHeight: "100vh", 
      padding: "0 60px", 
      backgroundImage: "url('/hero.png')", 
      backgroundSize: "cover", 
      backgroundAttachment: "fixed",
      backgroundColor: "#000",
      color: "#fff" 
    }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "40px 0" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/logo-kart.png" alt="KART" style={{ height: "125px", marginRight: "30px" }} />
          <div>
            <h1 style={{ fontSize: "3.5rem", fontWeight: 900, margin: 0, color: "#fff", lineHeight: 0.85 }}>Kraków Airport</h1>
            <h1 style={{ fontSize: "3.5rem", fontWeight: 900, margin: 0, color: "#00d4ff", lineHeight: 0.85 }}>Running Team</h1>
          </div>
        </div>
        <div style={{ border: "2px solid #00d4ff", borderRadius: "20px", padding: "15px 40px", textAlign: "right", background: "rgba(0,0,0,0.6)" }}>
          <div style={{ fontWeight: 900, fontSize: "1.4rem", color: "#fff" }}>Filip</div>
          <Link href="/profile" style={{ fontSize: "0.9rem", color: "#00d4ff", textDecoration: "none", fontWeight: 800 }}>PROFIL</Link>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "60px auto" }}>
        <section style={{ display: "flex", gap: "80px", marginBottom: "80px" }}>
          <div style={{ flex: 1 }}>
            <p style={labelS}>WSPÓLNE KILOMETRY</p>
            <h2 style={{ fontSize: "6.5rem", fontWeight: 900, color: "#00d4ff", margin: 0, lineHeight: 1 }}>
              {stats.total_km.toFixed(1)} km
            </h2>
          </div>
          <div style={{ flex: 1 }}>
            <p style={labelS}>TOP 1 (KM)</p>
            <div style={topBoxS}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.3rem" }}>
                <span style={{ fontWeight: 700 }}>Artur Staniszewski</span>
                <span style={{ color: "#00d4ff", fontWeight: 900 }}>51.4 km</span>
              </div>
            </div>
          </div>
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "50px" }}>
          <h2 style={{ fontSize: "4.5rem", fontWeight: 900, color: "#fff", margin: 0 }}>BIEGI</h2>
          <Link href="/races?action=add" style={addBtnS}>+ DODAJ BIEG</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "30px" }}>
          {futureRaces.map(r => (
            <div key={r.id} style={cardS}>
              <span style={{ color: "#00d4ff", fontWeight: 900, fontSize: "1.1rem" }}>{r.race_date}</span>
              <h4 style={{ fontSize: "2.3rem", fontWeight: 900, margin: "10px 0", color: "#fff", lineHeight: 1 }}>{r.title}</h4>
              <div style={{ borderTop: "1px solid #333", marginTop: "20px", paddingTop: "20px" }}>
                <p style={{ fontSize: "0.8rem", color: "#555", fontWeight: 900, marginBottom: "12px" }}>UCZESTNICY:</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {r.participations?.map((p:any, i:number) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: p.is_paid ? "#fff" : "#444", fontWeight: 700 }}>{p.display_name}</span>
                      {p.is_paid && <span style={{ color: "#00d4ff", fontSize: "0.8rem" }}>OPŁACONE</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ textAlign: "center", marginTop: "150px", paddingBottom: "80px" }}>
        <img src="/krk-airport-logo.png" alt="Kraków Airport" style={{ height: "100px", opacity: 0.4, marginBottom: "20px" }} />
        <p style={{ color: "#444", fontWeight: 900, fontSize: "1rem" }}>developed by felipetravels</p>
      </footer>
    </div>
  );
}

const labelS = { color: "#444", fontWeight: 900, fontSize: "1rem", letterSpacing: "3px", marginBottom: "20px" };
const topBoxS = { background: "rgba(255,255,255,0.03)", padding: "35px", borderRadius: "25px", border: "1px solid #1a1a1a" };
const cardS = { background: "rgba(255,255,255,0.04)", padding: "45px", borderRadius: "35px", border: "1px solid #1a1a1a", backdropFilter: "blur(10px)" };
const addBtnS = { background: "#00d4ff", color: "#000", padding: "18px 45px", borderRadius: "15px", fontWeight: 900, textDecoration: "none", fontSize: "1.1rem" };