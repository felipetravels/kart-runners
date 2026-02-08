import { supabase } from "@/lib/supabaseClient";
import ParticipationCard from "./ParticipationCard";
import RaceMyResult from "@/app/RaceMyResult";

export const dynamic = "force-dynamic";

export default async function RaceDetailsPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const raceId = searchParams?.id;

  // 1. Sprawdzamy czy ID jest w URL
  if (!raceId) {
    return (
      <main style={{ padding: "100px 20px", textAlign: "center", color: "#fff" }}>
        <h1 style={{ color: "#ff4444" }}>Błąd: Brak ID biegu</h1>
        <p>Upewnij się, że adres URL zawiera parametr ?id=</p>
        <a href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: "bold" }}>← Wróć do listy biegów</a>
      </main>
    );
  }

  // 2. Pobieramy dane samego biegu z tabeli 'races'
  const { data: race, error: raceError } = await supabase
    .from("races")
    .select("*")
    .eq("id", raceId)
    .single();

  // Jeśli błąd w bazie lub brak rekordu
  if (raceError || !race) {
    return (
      <main style={{ padding: "100px 20px", textAlign: "center", color: "#fff" }}>
        <h1 style={{ color: "#ff4444" }}>Nie znaleziono biegu</h1>
        <p>Bieg o ID {raceId} prawdopodobnie nie istnieje w bazie danych.</p>
        {raceError && (
          <pre style={{ background: "#222", padding: 20, borderRadius: 10, display: "inline-block", textAlign: "left", marginTop: 20 }}>
            {JSON.stringify(raceError, null, 2)}
          </pre>
        )}
        <br /><br />
        <a href="/" style={{ color: "#00d4ff", textDecoration: "none" }}>← Wróć do strony głównej</a>
      </main>
    );
  }

  // 3. Pobieramy opcje dystansów z tabeli 'race_options'
  const { data: raceOptions } = await supabase
    .from("race_options")
    .select("*")
    .eq("race_id", raceId)
    .order("sort_order", { ascending: true });

  const options = raceOptions || [];

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      {/* NAGŁÓWEK */}
      <header style={{ marginBottom: 40 }}>
        <a href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: "bold", fontSize: "0.9rem" }}>
          ← POWRÓT DO LISTY
        </a>
        <h1 style={{ fontSize: "3.5rem", margin: "20px 0 10px", fontWeight: 900, lineHeight: 1.1 }}>
          {race.title}
        </h1>
        <div style={{ fontSize: "1.2rem", opacity: 0.8, display: "flex", gap: 15 }}>
          <span>📍 {race.city || "Lokalizacja do ustalenia"}</span>
          <span>📅 {race.race_date}</span>
        </div>
      </header>

      {/* TREŚĆ BIEGU */}
      <div style={{ display: "grid", gap: 40 }}>
        <section>
          <h2 style={{ borderBottom: "1px solid #333", paddingBottom: 10, marginBottom: 20, fontSize: "1.8rem" }}>
            O wydarzeniu
          </h2>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", fontSize: "1.1rem", opacity: 0.9 }}>
            {race.description || "Brak opisu dla tego wydarzenia."}
          </p>
        </section>

        {/* WYNIKI UŻYTKOWNIKA (JEŚLI ZALOGOWANY) */}
        <section style={{ background: "rgba(255,255,255,0.05)", padding: 30, borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)" }}>
           <RaceMyResult raceId={race.id} options={options} />
        </section>

        {/* LISTA UCZESTNIKÓW */}
        <ParticipationCard raceId={race.id} options={options} />
      </div>
    </main>
  );
}