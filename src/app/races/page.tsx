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
  const raceId = rawId ? parseInt(rawId) : null;

  if (!raceId || isNaN(raceId)) {
    return (
      <main style={{ padding: "100px 20px", textAlign: "center", color: "#fff" }}>
        <h1 style={{ color: "#ff4444" }}>Błąd: Nieprawidłowe ID ({rawId || "brak"})</h1>
        <a href="/" style={{ color: "#00d4ff", textDecoration: "none" }}>← Wróć do listy</a>
      </main>
    );
  }

  // Pobieramy dane biegu
  const { data: race, error: raceError } = await supabase
    .from("races")
    .select("*")
    .eq("id", raceId)
    .single();

  if (raceError || !race) {
    return (
      <main style={{ padding: "100px 20px", textAlign: "center", color: "#fff" }}>
        <h1 style={{ color: "#ff4444" }}>Bieg nieodnaleziony</h1>
        <p>Możliwy brak uprawnień lub bieg o ID {raceId} nie istnieje.</p>
        <a href="/" style={{ color: "#00d4ff", textDecoration: "none" }}>← Spróbuj ponownie</a>
      </main>
    );
  }

  // Pobieramy opcje dystansów
  const { data: options } = await supabase
    .from("race_options")
    .select("*")
    .eq("race_id", raceId)
    .order("sort_order", { ascending: true });

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      <header style={{ marginBottom: 40 }}>
        <a href="/" style={{ color: "#00d4ff", textDecoration: "none", fontWeight: "bold" }}>← POWRÓT</a>
        <h1 style={{ fontSize: "3rem", margin: "20px 0 10px" }}>{race.title}</h1>
        <p style={{ opacity: 0.7 }}>📍 {race.city} | 📅 {race.race_date}</p>
      </header>

      <div style={{ display: "grid", gap: 30 }}>
        <section style={{ background: "rgba(255,255,255,0.05)", padding: 25, borderRadius: 20 }}>
          <h2 style={{ marginTop: 0 }}>Opis</h2>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.7" }}>{race.description}</p>
        </section>

        <ParticipationCard raceId={race.id} options={options || []} />
        <RaceMyResult raceId={race.id} options={options || []} />
      </div>
    </main>
  );
}