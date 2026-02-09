import { supabase } from "@/lib/supabaseClient";
import ParticipationCard from "./ParticipationCard";
import RaceMyResult from "@/app/RaceMyResult";

export const dynamic = "force-dynamic";

export default async function RaceDetailsPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const rawId = searchParams?.id;
  
  // Konwersja na int8 (Number)
  const raceId = rawId ? Number(rawId) : null;

  // 1. Walidacja ID
  if (raceId === null || isNaN(raceId)) {
    return (
      <main style={{ padding: "100px 20px", textAlign: "center", color: "#fff" }}>
        <h1 style={{ color: "#ff4444" }}>Błąd: Nieprawidłowe ID</h1>
        <p>URL nie zawiera poprawnej liczby ID. Otrzymano: "{rawId}"</p>
        <a href="/" style={{ color: "#00d4ff", fontWeight: "bold" }}>← Wróć do listy</a>
      </main>
    );
  }

  // 2. Pobieramy dane z tabeli races
  const { data: race, error: raceError } = await supabase
    .from("races")
    .select("*")
    .eq("id", raceId)
    .single();

  // 3. Obsługa błędów pobierania
  if (raceError || !race) {
    return (
      <main style={{ padding: "100px 20px", textAlign: "center", color: "#fff" }}>
        <h1 style={{ color: "#ff4444" }}>Bieg nieodnaleziony</h1>
        <div style={{ background: "#111", padding: "30px", borderRadius: "15px", display: "inline-block", textAlign: "left", marginTop: "20px", border: "1px solid #333" }}>
          <p><strong>Status:</strong> Błąd bazy danych</p>
          <p><strong>Szukane ID (int8):</strong> {raceId}</p>
          <p><strong>Komunikat błędu:</strong> {raceError?.message || "Brak danych w rekordzie"}</p>
          <p><strong>Kod błędu:</strong> {raceError?.code || "N/A"}</p>
          <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "10px" }}>
            Podpowiedź: Jeśli komunikat to "PGRST116", rekord nie istnieje.<br />
            Jeśli błąd dotyczy "Policy" lub jest pusty, sprawdź uprawnienia RLS.
          </p>
        </div>
        <br /><br />
        <a href="/" style={{ color: "#00d4ff", textDecoration: "none" }}>← Wróć do strony głównej</a>
      </main>
    );
  }

  // 4. Pobieramy opcje (dystanse)
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
        <h1 style={{ fontSize: "3.5rem", margin: "20px 0 10px", fontWeight: 900, lineHeight: 1.1 }}>
          {race.title}
        </h1>
        <div style={{ fontSize: "1.2rem", opacity: 0.8 }}>
          📍 {race.city || "Lokalizacja do ustalenia"} | 📅 {race.race_date}
        </div>
      </header>

      <div style={{ display: "grid", gap: 40 }}>
        <section style={{ background: "rgba(255,255,255,0.03)", padding: "30px", borderRadius: "20px" }}>
          <h2 style={{ marginTop: 0, fontSize: "1.5rem", color: "#00d4ff" }}>Opis wydarzenia</h2>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", fontSize: "1.1rem", opacity: 0.9 }}>
            {race.description || "Brak opisu dla tego wydarzenia."}
          </p>
        </section>

        {/* Komponenty udziału i wyników */}
        <ParticipationCard raceId={race.id} options={options || []} />
        <RaceMyResult raceId={race.id} options={options || []} />
      </div>
    </main>
  );
}