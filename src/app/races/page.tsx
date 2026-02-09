import { supabase } from "@/lib/supabaseClient";
import ParticipationCard from "./ParticipationCard";
import RaceMyResult from "@/app/RaceMyResult";

export const dynamic = "force-dynamic";

// W nowych wersjach Next.js searchParams to Promise
export default async function RaceDetailsPage(props: {
  searchParams: Promise<{ id?: string }>;
}) {
  // 1. Czekamy na odebranie parametrów z URL
  const params = await props.searchParams;
  const rawId = params.id;
  
  // Konwersja na liczbę
  const raceId = rawId ? Number(rawId) : null;

  // 2. Jeśli ID nadal jest puste lub nie jest liczbą
  if (raceId === null || isNaN(raceId)) {
    return (
      <main style={{ padding: "100px 20px", textAlign: "center", color: "#fff" }}>
        <h1 style={{ color: "#ff4444" }}>Błąd: Nie odczytano ID</h1>
        <p>System otrzymał: "{rawId || "całkowitą pustkę"}"</p>
        <p style={{ opacity: 0.5, fontSize: "0.9rem" }}>Upewnij się, że link to: /races?id={rawId || "LICZBA"}</p>
        <br />
        <a href="/" style={{ color: "#00d4ff", fontWeight: "bold", textDecoration: "none" }}>← WRÓĆ DO LISTY</a>
      </main>
    );
  }

  // 3. Pobieramy dane biegu z Supabase
  const { data: race, error: raceError } = await supabase
    .from("races")
    .select("*")
    .eq("id", raceId)
    .single();

  // 4. Jeśli błąd bazy danych
  if (raceError || !race) {
    return (
      <main style={{ padding: "100px 20px", textAlign: "center", color: "#fff" }}>
        <h1 style={{ color: "#ff4444" }}>Bieg #{raceId} nie istnieje</h1>
        <div style={{ background: "#111", padding: "20px", borderRadius: "15px", display: "inline-block", textAlign: "left", marginTop: "20px", border: "1px solid #333" }}>
          <p><strong>Błąd bazy:</strong> {raceError?.message || "Brak rekordu w tabeli races"}</p>
          <p><strong>Kod:</strong> {raceError?.code || "N/A"}</p>
        </div>
        <br /><br />
        <a href="/" style={{ color: "#00d4ff", textDecoration: "none" }}>← WRÓĆ NA STRONĘ GŁÓWNĄ</a>
      </main>
    );
  }

  // 5. Pobieramy dystanse
  const { data: options } = await supabase
    .from("race_options")
    .select("*")
    .eq("race_id", race.id)
    .order("sort_order", { ascending: true });

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      <header style={{ marginBottom: 40 }}>
        <a href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: "bold", fontSize: "0.9rem" }}>
          ← POWRÓT DO LISTY
        </a>
        <h1 style={{ fontSize: "3rem", margin: "20px 0 10px", fontWeight: 900, lineHeight: 1.1 }}>
          {race.title}
        </h1>
        <div style={{ fontSize: "1.1rem", opacity: 0.7 }}>
          📍 {race.city || "Lokalizacja nieznana"} | 📅 {race.race_date}
        </div>
      </header>

      <div style={{ display: "grid", gap: 30 }}>
        <section style={{ background: "rgba(255,255,255,0.03)", padding: "25px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <h2 style={{ marginTop: 0, fontSize: "1.3rem", color: "#00d4ff", textTransform: "uppercase" }}>Opis wydarzenia</h2>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.7", opacity: 0.9 }}>
            {race.description || "Brak dodatkowego opisu dla tego biegu."}
          </p>
        </section>

        {/* Sekcje interaktywne */}
        <ParticipationCard raceId={race.id} options={options || []} />
        
        <div style={{ background: "rgba(0,212,255,0.05)", padding: "25px", borderRadius: "20px", border: "1px solid rgba(0,212,255,0.1)" }}>
          <RaceMyResult raceId={race.id} options={options || []} />
        </div>
      </div>
    </main>
  );
}