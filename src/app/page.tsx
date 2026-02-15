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
        // Pobieramy biegi wraz z relacją participation i profilami
        const { data, error } = await supabase
          .from("races")
          .select(`
            id,
            title,
            race_date,
            description,
            participation (
              km_done,
              status,
              profiles (
                display_name
              )
            )
          `)
          .order("race_date", { ascending: true });

        if (error) throw error;

        if (data) {
          setRaces(data);
          // Liczymy sumę km ze wszystkich biegów i wszystkich uczestników
          const total = data.reduce((acc, race) => {
            const raceSum = race.participation?.reduce((pAcc: number, p: any) => pAcc + (p.km_done || 0), 0) || 0;
            return acc + raceSum;
          }, 0);
          setStats({ total_km: total });
        }
      } catch (err) {
        console.error("Błąd ładowania danych:", err);
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
      {/* HEADER - relative zamiast fixed, żeby nie zasłaniał treści */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "40px 0" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/logo-kart.png" alt="KART" style={{ height: "125px", width: "auto", marginRight: "30px" }} />
          <div>
            <h1 style={{ fontSize: "3.5rem", fontWeight: 900, margin: 0, color: "#fff", lineHeight: 0.85 }}>Kraków Airport</h1>
            <h1 style={{ fontSize: "3.5rem", fontWeight: 900, margin: 0, color: "#00d4ff", lineHeight: 0.85 }}>Running Team</h1>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
           <nav style={{ display: "flex", gap: "25px", fontWeight: 800, fontSize: "0.9rem", color: "#fff", textTransform: "uppercase" }}>
             <span>Ekipa</span>
             <span>Logistyka</span>
             <span>Wyniki</span>
           </nav>
           <div style={{ border: "2px solid #00d4ff", borderRadius: "20px", padding: "15px 40px", textAlign: "right", background: "rgba(0,0,0,0.6)" }}>
             <div style={{ fontWeight: 900, fontSize: "1.4rem", color: "#fff" }}>Filip</div>
             <Link href="/profile" style={{ fontSize: "0.9rem", color: "#00d4ff", textDecoration: "none", fontWeight: 800 }}>PROFIL</Link>
           </div>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "60px auto" }}>
        {/* STATYSTYKI */}
        <section style={{ display: "flex", gap: "80px", marginBottom: "80px" }}>
          <div style={{ flex: 1 }}>
            <p style={labelS}>WSPÓLNE KILOMETRY</p>
            <h2 style={{ fontSize: "6.5rem", fontWeight: 900, color: "#00d4ff", margin: 0, lineHeight: 1 }}>
              {stats.total_km.toFixed(1)} km
            </h2>
          </div>
          <div style={{ flex: 1 }}>
            <p style={labelS}>TOP 3 DYSTANS (KM)</p>
            <div style={topBoxS}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.3rem" }}>
                <span style={{ fontWeight: 700 }}>1. artur.staniszewski1</span>
                <span style={{ color: "#00d4ff", fontWeight: 900 }}>{stats.total_km.toFixed(1)} km</span>
              </div>
            </div>
          </div>
        </section>

        {/* BIEGI SECTION */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "50px" }}>
          <h2 style={{ fontSize: "4.5rem", fontWeight: 900, color: "#fff", margin: 0 }}>BIEGI</h2>
          <Link href="/races?action=add" style={addBtnS}>+ DODAJ BIEG</Link>
        </div>

        {loading ? (
          <p style={{ fontSize: "1.5rem", color: "#444" }}>Ładowanie biegów...</p>
        ) : (
          <>
            {/* NADCHODZĄCE */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "30px" }}>
              {futureRaces.map(r => (
                <div key={r.id} style={cardS}>
                  <span style={{ color: "#00d4ff", fontWeight: 900, fontSize: "1.1rem" }}>{r.race_date}</span>
                  <h4 style={{ fontSize: "2.3rem", fontWeight: 900, margin: "10px 0", color: "#fff", lineHeight: 1 }}>{r.title}</h4>
                  <p style={{ color: "#00d4ff", fontWeight: 800, fontSize: "1.3rem", margin: "5px 0" }}>{r.description} KM</p>
                  
                  <div style={{ borderTop: "1px solid #333", marginTop: "20px", paddingTop: "20px" }}>
                    <p style={{ fontSize: "0.8rem", color: "#555", fontWeight: 900, marginBottom: "12px", letterSpacing: "1px" }}>OPŁACILI:</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {r.participation?.filter((p:any) => p.status === 'opłacony').map((p:any, i:number) => (
                        <span key={i} style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>{p.profiles?.display_name}</span>
                      ))}
                    </div>
                  </div>
                  <Link href={`/races?id=${r.id}&action=edit`} style={{ display: "block", marginTop: "30px", color: "#00d4ff", fontWeight: 900, textDecoration: "none" }}>SZCZEGÓŁY →</Link>
                </div>
              ))}
            </div>

            {/* MINIONE */}
            {pastRaces.length > 0 && (
              <div style={{ marginTop: "120px" }}>
                <h3 style={{ ...labelS, fontSize: "1.5rem", marginBottom: "40px" }}>MINIONE BIEGI</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "30px", opacity: 0.6 }}>
                  {pastRaces.map(r => (
                    <div key={r.id} style={cardS}>
                      <span style={{ color: "#666", fontWeight: 900 }}>{r.race_date}</span>
                      <h4 style={{ fontSize: "2rem", fontWeight: 900, margin: "10px 0", color: "#fff" }}>{r.title}</h4>
                      <p style={{ color: "#00d4ff", fontWeight: 900 }}>WYNIK: {r.participation?.reduce((acc:number, p:any) => acc + (p.km_done || 0), 0).toFixed(1)} KM</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ textAlign: "center", marginTop: "150px", paddingBottom: "80px", borderTop: "1px solid #111", paddingTop: "60px" }}>
        <p style={{ color: "#444", fontWeight: 900, fontSize: "1rem", margin: 0 }}>developed by felipetravels</p>
        <div style={{ marginTop: "30px" }}>
          <p style={{ fontSize: "0.8rem", color: "#333", marginBottom: "15px", fontWeight: 800 }}>powered by</p>
          <img src="/krk-airport-logo.png" alt="Kraków Airport" style={{ height: "100px", opacity: 0.4, width: "auto" }} />
        </div>
      </footer>
    </div>
  );
}

const labelS = { color: "#444", fontWeight: 900, fontSize: "1rem", letterSpacing: "3px", marginBottom: "20px" };
const topBoxS = { background: "rgba(255,255,255,0.03)", padding: "35px", borderRadius: "25px", border: "1px solid #1a1a1a" };
const cardS = { background: "rgba(255,255,255,0.04)", padding: "45px", borderRadius: "35px", border: "1px solid #1a1a1a", backdropFilter: "blur(10px)" };
const addBtnS = { background: "#00d4ff", color: "#000", padding: "18px 45px", borderRadius: "15px", fontWeight: 900, textDecoration: "none", fontSize: "1.1rem" };