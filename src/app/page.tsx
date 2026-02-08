import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

type TeamFilter = "all" | "KART" | "KART light";

function normalizeTeam(input: string | undefined): TeamFilter {
  if (input === "KART") return "KART";
  if (input === "KART light") return "KART light";
  return "all";
}

export default async function Home({
  searchParams,
}: {
  searchParams: { team?: string };
}) {
  const team = normalizeTeam(searchParams.team);
  const today = new Date().toISOString().slice(0, 10);

  const { data: races, error } = await supabase
    .from("races")
    .select(
      `
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
      ),
      participations (
        wants_to_participate,
        profiles (
          display_name,
          team
        )
      )
    `
    )
    .gte("race_date", today)
    .order("race_date", { ascending: true });

  return (
    <main style={{ padding: 0 }}>
      <section style={{ marginBottom: 16 }}>
        <h1 style={{ marginTop: 0 }}>Nadchodzące biegi</h1>
        <p style={{ opacity: 0.85 }}>
          Najbliższe na górze. Publiczne rankingi znajdziesz w zakładce{" "}
          <a href="/stats"><strong>Statystyki</strong></a>.
        </p>
      </section>

      <nav style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <a
          href="/?team=all"
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.18)",
            textDecoration: "none",
            fontWeight: team === "all" ? 800 : 500,
            color: "inherit",
          }}
        >
          Wszyscy
        </a>
        <a
          href="/?team=KART"
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.18)",
            textDecoration: "none",
            fontWeight: team === "KART" ? 800 : 500,
            color: "inherit",
          }}
        >
          KART
        </a>
        <a
          href="/?team=KART%20light"
          style={{
            padding: "8px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.18)",
            textDecoration: "none",
            fontWeight: team === "KART light" ? 800 : 500,
            color: "inherit",
          }}
        >
          KART light
        </a>
      </nav>

      {error && (
        <p style={{ color: "crimson", marginTop: 16 }}>
          Błąd pobierania biegów: {error.message}
        </p>
      )}

      <section style={{ marginTop: 18, display: "grid", gap: 12 }}>
        {(races ?? []).map((r: any) => {
          const options = (r.race_options ?? [])
            .slice()
            .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((o: any) => `${o.label} (${Number(o.distance_km)} km)`);

          const participantsAll = (r.participations ?? []).filter(
            (p: any) => p?.wants_to_participate === true
          );

          const participantsFiltered =
            team === "all"
              ? participantsAll
              : participantsAll.filter((p: any) => p?.profiles?.team === team);

          const top5 = participantsFiltered
            .map((p: any) => p?.profiles?.display_name)
            .filter(Boolean)
            .slice(0, 5);

          const detailsHref = `/races?id=${r.id}`;

          return (
            <article
              key={r.id}
              style={{ border: "1px solid rgba(255,255,255,0.16)", borderRadius: 14, padding: 14 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <a
                    href={detailsHref}
                    style={{ fontSize: 18, fontWeight: 900, color: "inherit", textDecoration: "none" }}
                  >
                    {r.title}
                  </a>

                  <div style={{ marginTop: 6, opacity: 0.9 }}>
                    <strong>{r.race_date}</strong>
                    {" · "}
                    {[r.city, r.country].filter(Boolean).join(", ")}
                  </div>

                  {options.length > 0 && (
                    <div style={{ marginTop: 6, opacity: 0.85 }}>
                      Dystanse: {options.join(" | ")}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
                  <a href={detailsHref}>Szczegóły</a>
                  {r.signup_url && (
                    <a href={r.signup_url} target="_blank" rel="noreferrer">
                      Zapisy
                    </a>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 10, opacity: 0.9 }}>
                <strong>Zadeklarowani</strong>
                {team !== "all" ? ` (${team})` : ""}:{" "}
                {top5.length > 0 ? top5.join(", ") : "brak"}
                {participantsFiltered.length > 5 ? ` +${participantsFiltered.length - 5}` : ""}
              </div>
            </article>
          );
        })}

        {(races ?? []).length === 0 && (
          <p style={{ opacity: 0.85 }}>Brak nadchodzących biegów.</p>
        )}
      </section>
    </main>
  );
}
