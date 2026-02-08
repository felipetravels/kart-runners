import { supabase } from "@/lib/supabaseClient";
import ParticipationCard from "./ParticipationCard";
import RaceMyResult from "@/app/RaceMyResult";

export const dynamic = "force-dynamic";

export default async function RaceDetailsPage({ searchParams }: { searchParams: { id?: string } }) {
  const raceId = searchParams?.id;

  // 1. Sprawdzamy czy ID w ogóle dotarło
  if (!raceId) {
    return <div style={{ padding: 50 }}>Błąd: Brak ID biegu w adresie URL.</div>;
  }

  // 2. Pobieramy dane i sprawdzamy co zwraca baza
  const { data: race, error } = await supabase
    .from("races")
    .select(`
      *,
      race_options (*)
    `)
    .eq("id", raceId)
    .single();

  // 3. JEŚLI JEST BŁĄD - WYŚWIETL GO
  if (error) {
    return (
      <div style={{ padding: 50 }}>
        <h1>Błąd Supabase!</h1>
        <pre style={{ background: "#222", padding: 20 }}>{JSON.stringify(error, null, 2)}</pre>
        <p>Sprawdź czy tabela 'races' ma rekord o ID: {raceId}</p>
        <a href="/">Wróć do strony głównej</a>
      </div>
    );
  }

  if (!race) {
    return <div style={{ padding: 50 }}>Bieg o ID {raceId} nie istnieje w bazie.</div>;
  }

  const options = (race.race_options || []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <header style={{ marginBottom: 40 }}>
        <a href="/" style={{ color: "#00d4ff", textDecoration: "none" }}>← Powrót do listy</a>
        <h1 style={{ fontSize: "3.5rem", margin: "20px 0 10px" }}>{race.title}</h1>
        <p style={{ fontSize: "1.2rem", opacity: 0.8 }}>📍 {race.city}, {race.country} | 📅 {race.race_date}</p>
      </header>

      <div style={{ display: "grid", gap: 40 }}>
        <section>
          <h2 style={{ borderBottom: "1px solid #333", paddingBottom: 10 }}>O wydarzeniu</h2>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.7", fontSize: "1.1rem" }}>
            {race.description || "Brak opisu dla tego biegu."}
          </p>
        </section>

        <div style={{ background: "rgba(255,255,255,0.05)", padding: 30, borderRadius: 20 }}>
           <RaceMyResult raceId={race.id} options={options} />
        </div>

        <ParticipationCard raceId={race.id} options={options} />
      </div>
    </main>
  );
}