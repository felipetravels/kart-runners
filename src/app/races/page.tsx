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
    return (
      <main style={{ color: "#fff", textAlign: "center", padding: 100 }}>
        <h1 style={{ color: "#ff4444" }}>Błędne ID biegu</h1>
        <a href="/" style={{ color: "#00d4ff" }}>← Wróć do listy</a>
      </main>
    );
  }

  // Pobieramy dane biegu, dystanse i wyniki wszystkich użytkowników (z profilami)
  const [raceRes, optionsRes, resultsRes] = await Promise.all([
    supabase.from("races").select("*").eq("id", raceId).single(),
    supabase.from("race_options").select("*").eq("race_id", raceId).order("sort_order"),
    supabase.from("race_results")
      .select(`
        time_seconds, 
        user_id, 
        option_id, 
        profiles ( display_name, team )
      `)
      .eq("race_id", raceId)
  ]);

  const race = raceRes.data;
  const options = optionsRes.data || [];
  const allResults = (resultsRes.data || []) as any[];

  if (!race) {
    return (
      <main style={{ color: "#fff", textAlign: "center", padding: 100 }}>
        <h1 style={{ color: "#ff4444" }}>Nie znaleziono biegu o ID {raceId}</h1>
        <a href="/" style={{ color: "#00d4ff" }}>← Wróć do listy</a>
      </main>
    );
  }

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      {/* NAGŁÓWEK */}
      <header style={{ marginBottom: 40 }}>
        <a href="/" style={{ color: "#00d4ff", textDecoration: "none", fontSize: "0.9rem", fontWeight: "bold" }}>← POWRÓT DO LISTY</a>
        <h1 style={{ fontSize: "3rem", margin: "15px 0 5px", fontWeight: 900 }}>{race.title}</h1>
        <p style={{ opacity: 0.7, fontSize: "1.1rem" }}>📍 {race.city} | 📅 {race.race_date}</p>
      </header>

      <div style={{ display: "grid", gap: 30 }}>
        {/* OPIS */}
        <section style={boxStyle}>
          <h3 style={h3Style}>O wydarzeniu</h3>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.7", opacity: 0.9 }}>
            {race.description || "Brak dodatkowego opisu."}
          </p>
          {race.signup_url && (
            <a href={race.signup_url} target="_blank" rel="noopener noreferrer" style={{ color: "#00d4ff", textDecoration: "none", display: "inline-block", marginTop: 10 }}>
              Oficjalna strona zapisów →
            </a>
          )}
        </section>

        {/* STATUS I FORMULARZ WYNIKU */}
        <ParticipationCard raceId={race.id} options={options} />
        <div style={{ background: "rgba(0, 212, 255, 0.05)", padding: 25, borderRadius: 24, border: "1px solid rgba(0, 212, 255, 0.1)" }}>
          <RaceMyResult raceId={race.id} options={options} />
        </div>

        {/* TABELA WYNIKÓW WSZYSTKICH */}
        <section style={boxStyle}>
          <h3 style={h3Style}>Wyniki zawodników KART</h3>
          {allResults.length > 0 ? (
            <div style={{ display: "grid", gap: 12 }}>
              {allResults
                .sort((a, b) => a.time_seconds - b.time_seconds)
                .map((res, i) => (
                <div key={i} style={resultRowStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ opacity: 0.3, fontWeight: 900 }}>{i + 1}</span>
                    <div>
                      <div style={{ fontWeight: "bold" }}>{res.profiles?.display_name || "Anonimowy biegacz"}</div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.5 }}>
                        {options.find(o => o.id === res.option_id)?.label || "Dystans"}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "bold", color: "#00ff00", fontSize: "1.2rem" }}>{formatTime(res.time_seconds)}</div>
                    {res.profiles?.team && <div style={{ fontSize: "0.7rem", opacity: 0.5 }}>{res.profiles.team}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ opacity: 0.5, textAlign: "center", padding: "20px 0" }}>Brak zapisanych wyników dla tego biegu.</p>
          )}
        </section>
      </div>
    </main>
  );
}

const boxStyle: React.CSSProperties = { background: "rgba(255,255,255,0.05)", padding: 25, borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)" };
const h3Style: React.CSSProperties = { marginTop: 0, marginBottom: 20, fontSize: "1rem", color: "#00d4ff", textTransform: "uppercase", letterSpacing: "1px" };
const resultRowStyle: React.CSSProperties = { 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center", 
  padding: "12px 15px", 
  background: "rgba(255,255,255,0.02)", 
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.05)"
};