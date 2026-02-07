import { supabase } from "@/lib/supabaseClient";
import ParticipationCard from "./ParticipationCard";

export const dynamic = "force-dynamic";

function parseRaceId(raw: unknown) {
  // Next czasem potrafi dać string, czasem tablicę stringów (edge przypadki), czasem undefined.
  const value = Array.isArray(raw) ? raw[0] : raw;

  const rawStr = typeof value === "string" ? value : String(value ?? "");
  const cleaned = decodeURIComponent(rawStr).trim();

  // wyciągnij pierwszą sensowną liczbę z tekstu (na wypadek "1?x=..." albo " 1 ")
  const match = cleaned.match(/\d+/);
  const id = match ? parseInt(match[0], 10) : NaN;

  return { rawStr, cleaned, id, ok: Number.isFinite(id) && id > 0 };
}

export default async function RacePage({ params }: { params: { id: any } }) {
  const parsed = parseRaceId(params?.id);

  if (!parsed.ok) {
    return (
      <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
        <h1>Błędne ID biegu</h1>
        <p>To jest debug (żebyśmy nie strzelali w ciemno):</p>
        <pre style={{ background: "#f6f6f6", padding: 12, borderRadius: 12, overflowX: "auto" }}>
{JSON.stringify(
  {
    params_id_raw: params?.id,
    rawStr: parsed.rawStr,
    cleaned: parsed.cleaned,
    parsedId: parsed.id,
  },
  null,
  2
)}
        </pre>
        <p>
          Poprawny adres wygląda tak: <code>/races/1</code> albo <code>/races/2</code>.
        </p>
        <a href="/">← Wróć</a>
      </main>
    );
  }

  const raceId = parsed.id;

  const { data: race, error } = await supabase
    .from("races")
    .select(
      `
      id,title,race_date,city,country,signup_url,description,
      race_options(id,label,distance_km,sort_order),
      participations(
        user_id,status,wants_to_participate,registered,paid,option_id,
        profiles(id,display_name,team)
      )
    `
    )
    .eq("id", raceId)
    .single();

  if (error || !race) {
    return (
      <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
        <h1>Nie znaleziono biegu</h1>
        <p>raceId = <strong>{raceId}</strong></p>
        <p style={{ color: "crimson" }}>{error?.message}</p>
        <a href="/">← Wróć</a>
      </main>
    );
  }

  const options = (race.race_options ?? [])
    .slice()
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const declared = (race.participations ?? [])
    .filter((p: any) => p?.wants_to_participate === true)
    .slice(0, 50);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <a href="/" style={{ display: "inline-block", marginBottom: 14 }}>
        ← Wróć
      </a>

      <header style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
        <h1 style={{ marginTop: 0 }}>{race.title}</h1>

        <div style={{ marginTop: 6 }}>
          <strong>{race.race_date}</strong>
          {" · "}
          {[race.city, race.country].filter(Boolean).join(", ")}
        </div>

        {options.length > 0 && (
          <div style={{ marginTop: 8, color: "#555" }}>
            <strong>Dystanse:</strong>{" "}
            {options.map((o: any) => `${o.label} (${Number(o.distance_km)} km)`).join(" | ")}
          </div>
        )}

        {race.description && <p style={{ marginTop: 10 }}>{race.description}</p>}

        <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {race.signup_url && (
            <a href={race.signup_url} target="_blank" rel="noreferrer">
              Zapisy
            </a>
          )}
          <a href="/login">Login</a>
          <a href="/dashboard">Dodaj bieg</a>
        </div>
      </header>

      <ParticipationCard raceId={raceId} options={options as any} />

      <section style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
        <h2 style={{ marginTop: 0 }}>Zadeklarowani (max 50)</h2>

        {declared.length === 0 ? (
          <p style={{ color: "#555" }}>Na razie nikt się nie zadeklarował.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {declared
              .map((p: any) => ({
                name: p?.profiles?.display_name ?? "Runner",
                team: p?.profiles?.team ?? "",
                status: p?.status ?? "",
              }))
              .sort((a: any, b: any) => a.name.localeCompare(b.name))
              .map((x: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "baseline",
                    borderBottom: "1px solid #eee",
                    paddingBottom: 6,
                  }}
                >
                  <strong>{x.name}</strong>
                  <span style={{ color: "#777" }}>{x.team}</span>
                  <span style={{ marginLeft: "auto", color: "#555" }}>{x.status}</span>
                </div>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}
