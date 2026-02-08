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
    return <main style={{ padding: 20 }}><h1>Nie znaleziono biegu</h1></main>;
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: race, error } = await supabase
    .from("races")
    .select(`
      *,
      race_options (*)
    `)
    .eq("id", raceId)
    .single();

  if (error || !race) {
    return <main style={{ padding: 20 }}><h1>Błąd pobierania danych</h1></main>;
  }

  const options: Option[] = (race.race_options || []).sort(
    (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  // Pobieramy rolę użytkownika, aby sprawdzić czy jest adminem
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "20px" }}>
      <header style={{ marginBottom: 30 }}>
        <a href="/" style={{ opacity: 0.7, textDecoration: "none" }}>← Powrót</a>
        <h1 style={{ fontSize: "2.5rem", margin: "10px 0" }}>{race.title}</h1>
        <p>{race.race_date} | {race.city}, {race.country}</p>
      </header>

      <div style={{ display: "grid", gap: 40 }}>
        <section>
          <h3>O biegu</h3>
          <p style={{ whiteSpace: "pre-wrap", opacity: 0.9 }}>{race.description || "Brak opisu."}</p>
        </section>

        <section style={{ background: "rgba(255,255,255,0.05)", padding: 20, borderRadius: 12 }}>
          <RaceMyResult raceId={race.id} options={options} />
        </section>

        <ParticipationCard raceId={race.id} options={options} />

        {isAdmin && (
          <section style={{ border: "1px solid crimson", padding: 20, borderRadius: 12 }}>
            <h3 style={{ color: "crimson", marginTop: 0 }}>Panel Administratora</h3>
            {/* TUTAJ POPRAWIONE: Dodany onChanged */}
            <AdminRacePanel race={race} onChanged={() => {}} />
          </section>
        )}
      </div>
    </main>
  );
}