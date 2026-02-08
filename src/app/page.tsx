import { supabase } from "@/lib/supabaseClient";
import { RaceCard } from "./components/RaceCard";
import HomeStats from "./HomeStats";
import HomeLeaderboards from "./HomeLeaderboards";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 1. Pobieramy WSZYSTKIE biegi z bazy (bez filtrów, żeby na pewno się pokazały)
  const { data: racesRaw, error: racesError } = await supabase
    .from("races")
    .select(`
      id, title, race_date, city, country, signup_url,
      race_options ( id, label, distance_km ),
      participations ( user_id, profiles ( display_name, team ) )
    `)
    .order("race_date", { ascending: true });

  if (racesError) {
    console.error("Błąd Supabase:", racesError.message);
  }

  // Mapujemy dane dla RaceCard
  const races = (racesRaw || []).map(r => ({
    ...r,
    options: r.race_options || [],
    participants: (r.participations || []).map((p: any) => ({
      user_id: p.user_id,
      name: p.profiles?.display_name || "Zawodnik",
      team: p.profiles?.team || ""
    }))
  }));

  // 2. Pobieramy wyniki do statystyk
  const { data: allResults } = await supabase
    .from("race_results")
    .select(`
      finish_time_seconds,
      profiles ( display_name ),
      races ( title, race_date ),
      race_options ( label, distance_km )
    `);

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "20px" }}>
      {/* Sekcja statystyk */}
      <HomeStats results={allResults || []} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 40, marginTop: 40 }}>
        
        {/* LEWA KOLUMNA */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, margin: 0 }}>Biegi Teamu</h2>
            
            {/* PRZYCISK DODAWANIA BIEGU - widoczny dla każdego zalogowanego */}
            <a href="/dashboard" style={{ 
              background: "#00d4ff", 
              color: "#000", 
              padding: "12px 25px", 
              borderRadius: "12px", 
              textDecoration: "none", 
              fontWeight: "900",
              boxShadow: "0 4px 15px rgba(0,212,255,0.4)"
            }}>
              + DODAJ NOWY BIEG
            </a>
          </div>
          
          <div style={{ display: "grid", gap: 25 }}>
            {races.length > 0 ? (
              races.map(r => <RaceCard key={r.id} race={r} />)
            ) : (
              <div style={{ padding: 60, background: "rgba(255,255,255,0.03)", borderRadius: 25, textAlign: "center", border: "1px dashed rgba(255,255,255,0.1)" }}>
                <p style={{ opacity: 0.5, fontSize: "1.2rem" }}>Nie znaleziono żadnych biegów w bazie danych.</p>
                <p style={{ fontSize: "0.9rem", color: "#00d4ff" }}>Upewnij się, że tabela 'races' w Supabase nie jest pusta.</p>
              </div>
            )}
          </div>
        </section>

        {/* PRAWA KOLUMNA */}
        <aside>
          <h2 style={{ marginBottom: 30, fontSize: "1.8rem", fontWeight: 900 }}>TOP 3</h2>
          <HomeLeaderboards results={allResults || []} />
        </aside>
      </div>
    </main>
  );
}