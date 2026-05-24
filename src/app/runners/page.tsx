"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RunnersPage() {
  const [runners, setRunners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRunners() {
      // 1. Pobieramy wszystkich zawodników z ich przypisaniem do drużyny
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, display_name, team");

      // 2. Pobieramy wszystkie pomyślnie zakończone biegi z przypisanymi dystansami
      const { data: resultsData } = await supabase
        .from("race_results")
        .select(`
          profiles ( id ),
          race_options ( distance_km )
        `);

      if (profilesData) {
        // 3. Łączymy dane i obliczamy statystyki dla każdego biegacza
        const enrichedRunners = profilesData.map(profile => {
          let totalKm = 0;
          let racesCount = 0;

          if (resultsData) {
            // Szukamy wyników należących do tego konkretnego profilu
            const userResults = resultsData.filter(r => {
              const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
              return p?.id === profile.id;
            });

            racesCount = userResults.length;
            
            // Sumujemy kilometry
            userResults.forEach(r => {
              const opts = Array.isArray(r.race_options) ? r.race_options[0] : r.race_options;
              totalKm += Number(opts?.distance_km || 0);
            });
          }

          return {
            ...profile,
            totalKm,
            racesCount
          };
        });

        // 4. Sortujemy listę po kilometrach (malejąco), a przy remisie alfabetycznie
        enrichedRunners.sort((a, b) => b.totalKm - a.totalKm || (a.display_name || "").localeCompare(b.display_name || ""));
        setRunners(enrichedRunners);
      }
      setLoading(false);
    }
    fetchRunners();
  }, []);

  const kartMain = runners.filter(r => r.team === "KART" || !r.team);
  const kartLight = runners.filter(r => r.team === "KART light");

  if (loading) return <div style={{ color: "#fff", padding: "50px", textAlign: "center" }}>Wczytywanie ekipy...</div>;

  return (
    <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      <h1 style={{ fontWeight: 900, textAlign: "center", marginBottom: "40px", fontSize: "2.5rem" }}>EKIPA KART</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
        {/* KOLUMNA KART */}
        <div>
          <h2 style={{ color: "#00d4ff", fontSize: "1.2rem", marginBottom: "15px", borderBottom: "2px solid #00d4ff", paddingBottom: "5px" }}>
            KART ({kartMain.length})
          </h2>
          <div style={listContainer}>
            {kartMain.map((r, i) => (
              <div key={i} style={itemStyle}>
                <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#666", fontSize: "0.8rem", width: "20px" }}>{i + 1}.</span>
                  {r.display_name}
                </div>
                <div style={statsStyle}>
                  <span>{r.racesCount} {r.racesCount === 1 ? "start" : (r.racesCount > 1 && r.racesCount < 5 ? "starty" : "startów")}</span>
                  <span style={{ color: "#00d4ff", fontWeight: 900, width: "65px", textAlign: "right" }}>
                    {r.totalKm % 1 === 0 ? r.totalKm : r.totalKm.toFixed(1)} km
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KOLUMNA KART LIGHT */}
        <div>
          <h2 style={{ color: "#00ff88", fontSize: "1.2rem", marginBottom: "15px", borderBottom: "2px solid #00ff88", paddingBottom: "5px" }}>
            KART light ({kartLight.length})
          </h2>
          <div style={listContainer}>
            {kartLight.map((r, i) => (
              <div key={i} style={itemStyle}>
                <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#666", fontSize: "0.8rem", width: "20px" }}>{i + 1}.</span>
                  {r.display_name} 
                  <span style={tagStyle}>LIGHT</span>
                </div>
                <div style={statsStyle}>
                  <span>{r.racesCount} {r.racesCount === 1 ? "start" : (r.racesCount > 1 && r.racesCount < 5 ? "starty" : "startów")}</span>
                  <span style={{ color: "#00ff88", fontWeight: 900, width: "65px", textAlign: "right" }}>
                    {r.totalKm % 1 === 0 ? r.totalKm : r.totalKm.toFixed(1)} km
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

const listContainer = { background: "#111", borderRadius: "15px", border: "1px solid #222", overflow: "hidden" };
const itemStyle = { padding: "15px", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center" };
const tagStyle = { fontSize: "0.6rem", background: "#00ff88", color: "#000", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" };
const statsStyle = { display: "flex", gap: "15px", fontSize: "0.8rem", color: "#aaa", alignItems: "center" };
