import { supabase } from "@/lib/supabaseClient";

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default async function HomeLeaderboards() {
  const year = new Date().getFullYear();

  const { data: topTimes } = await supabase
    .from("v_leaderboard_top_times")
    .select("distance_km,distance_label,display_name,race_title,race_date,finish_time_seconds,rn")
    .order("distance_km", { ascending: true })
    .order("rn", { ascending: true });

  const { data: topKm } = await supabase
    .from("v_leaderboard_top_km_year")
    .select("year,display_name,total_km,rn")
    .eq("year", year)
    .order("rn", { ascending: true });

  const { data: totalKmAll } = await supabase
    .from("v_leaderboard_total_km_year")
    .select("year,total_km_all")
    .eq("year", year)
    .maybeSingle();

  const groups = new Map<number, any[]>();
  (topTimes ?? []).forEach((r: any) => {
    const km = Number(r.distance_km);
    if (!groups.has(km)) groups.set(km, []);
    groups.get(km)!.push(r);
  });

  return (
    <section style={{ marginBottom: 16 }}>
      <h2 style={{ marginTop: 0 }}>Leaderboardy ({year})</h2>

      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ border: "1px solid rgba(255,255,255,0.16)", borderRadius: 14, padding: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Suma km wszystkich</div>
          <div style={{ fontSize: 18, fontWeight: 900 }}>
            {(Number(totalKmAll?.total_km_all ?? 0)).toFixed(0)} km
          </div>
        </div>

        <div style={{ border: "1px solid rgba(255,255,255,0.16)", borderRadius: 14, padding: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Top 3: najwięcej km (w roku)</div>
          {(topKm ?? []).length === 0 ? (
            <div style={{ opacity: 0.8 }}>Brak danych (dodaj wyniki biegów).</div>
          ) : (
            <ol style={{ margin: "8px 0 0 18px" }}>
              {(topKm ?? []).map((r: any) => (
                <li key={r.rn}>
                  <strong>{r.display_name}</strong> – {Number(r.total_km).toFixed(0)} km
                </li>
              ))}
            </ol>
          )}
        </div>

        <div style={{ border: "1px solid rgba(255,255,255,0.16)", borderRadius: 14, padding: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Top 3 czasy dla każdego dystansu</div>

          {groups.size === 0 ? (
            <div style={{ opacity: 0.8 }}>Brak wyników (dodaj czasy w panelu admina).</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {[...groups.entries()].map(([km, rows]) => (
                <div key={km} style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 10 }}>
                  <div style={{ fontWeight: 900 }}>{km} km</div>
                  <ol style={{ margin: "8px 0 0 18px" }}>
                    {rows.slice(0, 3).map((r: any) => (
                      <li key={r.rn}>
                        <strong>{r.display_name ?? "Runner"}</strong> – {fmtTime(Number(r.finish_time_seconds))} ·{" "}
                        {r.race_title} ({r.race_date})
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
