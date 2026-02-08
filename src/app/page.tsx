import { supabase } from "@/lib/supabaseClient";
import { RaceCard } from "./components/RaceCard";
import HomeStats from "./HomeStats";
import HomeLeaderboards from "./HomeLeaderboards";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const today = new Date().toISOString().split("T")[0];

  // 1. Pobieramy biegi i ich uczestników (do RaceCard)
  const { data: racesRaw } = await supabase
    .from("races")
    .select(`
      id, title, race_date, city, country, signup_url,
      race_options ( id, label, distance_km ),
      participations ( user_id, profiles ( display_name, team ) )
    `)
    .eq("is_deleted", false)
    .gte("race_date", today)
    .order("race_date", { ascending: true });

  // Mapujemy dane dla RaceCard (bo Supabase zwraca zagnieżdżone obiekty)
  const races = (racesRaw || []).map(r => ({
    ...r,
    options: r.race_options || [],
    participants: (r.participations || []).map((p: any) => ({
      user_id: p.user_id,
      name: p.profiles?.display_name || "Zawodnik",
      team: p.profiles?.team || ""
    }))
  }));

  // 2. Pobieramy WSZYSTKIE wyniki do Top 3 i Total KM
  const { data: allResults } = await supabase
    .from("race_results")
    .select(`
      finish_time_seconds,
      profiles ( display_name ),
      races ( title ),
      race_options ( label, distance_km )
    `);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "20px" }}>
      <HomeStats results={allResults || []} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 40, marginTop: 40 }}>
        <section>
          <h2 style={{ marginBottom: 20 }}>Nadchodzące biegi</h2>
          <div style={{ display: "grid", gap: 20 }}>
            {races.length > 0 ? (
              races.map(r => <RaceCard key={r.id} race={r} />)
            ) : (
              <p style={{ opacity: 0.5 }}>Brak zaplanowanych biegów.</p>
            )}
          </div>
        </section>

        <aside>
          <h2 style={{ marginBottom: 20 }}>Rankingi TOP 3</h2>
          <HomeLeaderboards results={allResults || []} />
        </aside>
      </div>
    </main>
  );
}