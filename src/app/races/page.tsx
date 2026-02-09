import { supabase } from "@/lib/supabaseClient";
import ParticipationCard from "./ParticipationCard";
import RaceMyResult from "@/app/RaceMyResult";

export const dynamic = "force-dynamic";

export default async function RaceDetailsPage(props: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await props.searchParams;
  const raceId = params.id ? Number(params.id) : null;

  if (!raceId || isNaN(raceId)) {
    return <main style={{ color: "#fff", textAlign: "center", padding: 100 }}>Błędne ID biegu.</main>;
  }

  const [raceRes, optionsRes, resultsRes] = await Promise.all([
    supabase.from("races").select("*").eq("id", raceId).single(),
    supabase.from("race_options").select("*").eq("race_id", raceId).order("sort_order"),
    supabase.from("race_results")
      .select("time_seconds, user_id, option_id, profiles(display_name, team)")
      .eq("race_id", raceId)
  ]);

  const race = raceRes.data;
  const options = optionsRes.data || [];
  const allResults = resultsRes.data || [];

  if (!race) return <main style={{ color: "#fff", textAlign: "center", padding: 100 }}>Nie znaleziono biegu.</main>;

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      <header style={{ marginBottom: 40 }}>
        <a href="/" style={{ color: "#00d4ff", textDecoration: "none" }}>← POWRÓT</a>
        <h1 style={{ fontSize: "3rem", margin: "10px 0" }}>{race.title}</h1>
        <p style={{ opacity: 0.7 }}>📍 {race.city} | 📅 {race.race_date}</p>
      </header>

      <div style={{ display: "grid", gap: 30 }}>
        <section style={{ background: "rgba(255,255,255,0.05)", padding: 25, borderRadius: 20 }}>{race.description}</section>
        <ParticipationCard raceId={race.id} options={options} />
        <RaceMyResult raceId={race.id} options={options} />

        <section style={{ background: "rgba(255,255,255,0.05)", padding: 25, borderRadius: 20 }}>
          <h3 style={{ marginTop: 0, color: "#00d4ff" }}>Wyniki teamu</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {allResults.sort((a, b) => a.time_seconds - b.time_seconds).map((res: any, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #222" }}>
                <span>
                  {i + 1}. <strong>{res.profiles?.display_name}</strong>
                  {res.profiles?.team === "KART light" && (
                    <span style={{ marginLeft: 8, fontSize: "0.6rem", background: "#00ff88", color: "#000", padding: "2px 5px", borderRadius: 4, fontWeight: "bold" }}>LIGHT</span>
                  )}
                </span>
                <span style={{ fontWeight: "bold", color: "#00ff00" }}>{formatTime(res.time_seconds)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
