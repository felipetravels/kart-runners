import { supabase } from "@/lib/supabaseClient";
import ParticipationCard from "./ParticipationCard";
import RaceMyResult from "@/app/RaceMyResult";

export const dynamic = "force-dynamic";

export default async function RaceDetailsPage({ searchParams }: { searchParams: { id?: string } }) {
  const raceId = searchParams?.id;

  if (!raceId) {
    return <div style={{ padding: 50, textAlign: "center" }}>Błąd: Brak ID biegu w adresie URL.</div>;
  }

  // Pobieramy dane biegu
  const { data: race, error } = await supabase
    .from("races")
    .select(`*`)
    .eq("id", raceId)
    .single();

  if (error || !race) {
    return (
      <div style={{ padding: 50, textAlign: "center" }}>
        <h1>Nie znaleziono biegu!</h1>
        <p>Baza danych zwróciła: {error?.message || "Brak rekordu"}</p>
        <a href="/" style={{ color: "#00d4ff" }}>Wróć do listy</a>
      </div>
    );
  }

  // Pobieramy opcje dystansów osobnym zapytaniem (bezpieczniej)
  const { data: raceOptions } = await supabase
    .from("race_options")
    .select("*")
    .eq("race_id", raceId)
    .order("sort_order", { ascending: true });

  const options = raceOptions || [];

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <header style={{ marginBottom: 40 }}>
        <a href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: "bold" }}>← POWRÓT DO LISTY</a>
        <h1 style={{ fontSize: "3.5rem", margin: "20px 0 10px" }}>{race.title}</h1>
        <p style={{ fontSize: "1.2rem", opacity: 0.8 }}>📍 {race.city || "Lokalizacja do ustalenia"}, {race.country || ""} | 📅 {race.race_date}</p>
      </header>

      <div style={{ display: "grid", gap: 40 }}>
        <article>
          <h3 style={{ borderBottom: "1px solid #333", paddingBottom: 10 }}>O wydarzeniu</h3>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", fontSize: "1.1rem" }}>
            {race.description || "Brak opisu dla tego biegu."}
          </p>
        </article>

        <section style={{ background: "rgba(255,255,255,0.05)", padding: 30, borderRadius: 20 }}>
           <RaceMyResult raceId={race.id} options={options} />
        </section>

        <ParticipationCard raceId={race.id} options={options} />
      </div>
    </main>
  );
}