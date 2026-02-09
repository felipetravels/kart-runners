import { supabase } from "@/lib/supabaseClient";
import HomeLeaderboards from "./HomeLeaderboards";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Pobieramy wyniki z poprawną nazwą kolumny time_seconds
  const { data: results } = await supabase
    .from("race_results")
    .select(`
      time_seconds,
      option_id,
      race_options ( label, distance_km ),
      profiles ( display_name )
    `);

  const { data: races } = await supabase
    .from("races")
    .select("*")
    .order("race_date", { ascending: false });

  const stats = {
    totalKm: (results as any[])?.reduce((acc, curr) => acc + (curr.race_options?.distance_km || 0), 0) || 0,
    raceCount: races?.length || 0
  };

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      <section style={{ marginBottom: 60, textAlign: "center", background: "linear-gradient(135deg, #00d4ff10, #0055ff10)", padding: "60px 20px", borderRadius: 40, border: "1px solid rgba(0,212,255,0.1)" }}>
        <h1 style={{ fontSize: "4rem", fontWeight: 900, marginBottom: 10, letterSpacing: "-2px" }}>KART RUNNERS</h1>
        <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 30 }}>
          <div>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#00ff00" }}>{stats.totalKm.toFixed(1)}</div>
            <div style={{ opacity: 0.5, fontSize: "0.8rem", textTransform: "uppercase" }}>Kilometrów</div>
          </div>
          <div>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#fff" }}>{stats.raceCount}</div>
            <div style={{ opacity: 0.5, fontSize: "0.8rem", textTransform: "uppercase" }}>Wydarzeń</div>
          </div>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 40 }}>
        <section>
          <h2 style={{ fontSize: "1.8rem", marginBottom: 30 }}>Nadchodzące i minione biegi</h2>
          <div style={{ display: "grid", gap: 20 }}>
            {races?.map(race => (
              <a key={race.id} href={`/races?id=${race.id}`} style={raceCardStyle}>
                <div>
                  <h3 style={{ margin: "0 0 5px 0", fontSize: "1.3rem" }}>{race.title}</h3>
                  <p style={{ margin: 0, opacity: 0.5, fontSize: "0.9rem" }}>📍 {race.city} | 📅 {race.race_date}</p>
                </div>
                <div style={{ background: "#00d4ff", color: "#000", padding: "8px 15px", borderRadius: 10, fontWeight: "bold", fontSize: "0.8rem" }}>SZCZEGÓŁY</div>
              </a>
            ))}
          </div>
        </section>

        <aside>
          <h2 style={{ fontSize: "1.8rem", marginBottom: 30 }}>Top 3 Teamu</h2>
          <HomeLeaderboards results={results || []} />
        </aside>
      </div>
    </main>
  );
}

const raceCardStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "25px", background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)", textDecoration: "none", color: "#fff", transition: "transform 0.2s" };