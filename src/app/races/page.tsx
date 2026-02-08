import { supabase } from "@/lib/supabaseClient";
import ParticipationCard from "./ParticipationCard";
import AdminRacePanel from "./AdminRacePanel";
import RaceMyResult from "@/app/RaceMyResult";

export const dynamic = "force-dynamic";

type Option = {
  id: number;
  label: string;
  distance_km: number;
  sort_order: number;
};

export default async function RaceDetailsPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const raceId = searchParams.id ? parseInt(searchParams.id) : null;

  if (!raceId) {
    return (
      <main style={{ padding: 20 }}>
        <h1>Nie znaleziono biegu</h1>
        <p>Brak poprawnego ID biegu w adresie URL.</p>
        <a href="/">Powrót do strony głównej</a>
      </main>
    );
  }

  // Pobieranie danych o biegu
  const { data: race, error } = await supabase
    .from("races")
    .select(`
      id,
      title,
      race_date,
      city,
      country,
      signup_url,
      description,
      race_options (
        id,
        label,
        distance_km,
        sort_order
      )
    `)
    .eq("id", raceId)
    .single();

  if (error || !race) {
    return (
      <main style={{ padding: 20 }}>
        <h1>Błąd</h1>
        <p>Nie udało się pobrać danych biegu: {error?.message || "Bieg nie istnieje"}.</p>
        <a href="/">Powrót do strony głównej</a>
      </main>
    );
  }

  const options: Option[] = (race.race_options || []).sort(
    (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  return (
    <main style={{ padding: 0 }}>
      <header style={{ marginBottom: 24 }}>
        <a href="/" style={{ textDecoration: "none", fontSize: "0.9rem", opacity: 0.8 }}>
          ← Wróć do listy
        </a>
        <h1 style={{ marginTop: 12, marginBottom: 8 }}>{race.title}</h1>
        <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
          {race.race_date} {" · "} {race.city}, {race.country}
        </div>
      </header>

      <section style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr", maxWidth: 800 }}>
        {/* Opis biegu */}
        <article style={{ lineHeight: 1.6, whiteSpace: "pre-wrap", opacity: 0.9 }}>
          {race.description || "Brak opisu dla tego wydarzenia."}
        </article>

        {/* Link do zapisów */}
        {race.signup_url && (
          <div>
            <a 
              href={race.signup_url} 
              target="_blank" 
              rel="noreferrer"
              style={{
                display: "inline-block",
                padding: "10px 20px",
                backgroundColor: "#fff",
                color: "#000",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: "bold"
              }}
            >
              Oficjalna strona i zapisy
            </a>
          </div>
        )}

        <hr style={{ border: "0", borderTop: "1px solid rgba(255,255,255,0.1)", width: "100%" }} />

        {/* Sekcja deklaracji startu - TUTAJ BYŁ BŁĄD, DODAŁEM options */}
        <ParticipationCard raceId={race.id} options={options} />

        {/* Sekcja dodawania wyniku (po biegu) */}
        <RaceMyResult raceId={race.id} options={options} />

        {/* Panel administracyjny (widoczny tylko dla uprawnionych) */}
        <AdminRacePanel raceId={race.id} />
      </section>
    </main>
  );
}