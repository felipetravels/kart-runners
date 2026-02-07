"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";
import { RaceCard } from "@/components/RaceCard";

type TeamFilter = "ALL" | "KART" | "KART light";

type TopRace = {
  race_id: number;
  title: string;
  race_date: string;
  declared_count: number;
  completed_count: number;
};

type TopRunnerKm = {
  user_id: string;
  display_name: string | null;
  team: string | null;
  km_completed: number | null;
};

type TotalKmAll = {
  total_km_completed: number | null;
};

type TopTimeRow = {
  distance_class: "5K" | "10K" | "HALF" | "MARATHON";
  display_name: string | null;
  team: string | null;
  race_title: string;
  race_date: string;
  time_seconds: number;
};

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

function fmtTime(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = String(m).padStart(2, "0");
  const rr = String(r).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${rr}` : `${m}:${rr.padStart(2, "0")}`;
}

function cardBox() {
  return {
    borderRadius: 18,
    padding: 14,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.28)",
  } as const;
}

export default function Page() {
  const [teamFilter, setTeamFilter] = useState<TeamFilter>("ALL");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [races, setRaces] = useState<any[]>([]);

  // stats
  const [topRaces, setTopRaces] = useState<TopRace[]>([]);
  const [topRunnersKm, setTopRunnersKm] = useState<TopRunnerKm[]>([]);
  const [totalKm, setTotalKm] = useState<number>(0);
  const [topTimes, setTopTimes] = useState<TopTimeRow[]>([]);

  const topTimesByClass = useMemo(() => {
    const map: Record<string, TopTimeRow[]> = { "5K": [], "10K": [], "HALF": [], "MARATHON": [] };
    for (const r of topTimes) {
      if (!map[r.distance_class]) map[r.distance_class] = [];
      map[r.distance_class].push(r);
    }
    // Top 3 per class
    (Object.keys(map) as (keyof typeof map)[]).forEach((k) => {
      map[k] = map[k].slice(0, 3);
    });
    return map;
  }, [topTimes]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // 1) Dashboard staty (nie zależą od filtra team, bo to "global")
        const [{ data: tr, error: trErr }, { data: tkm, error: tkmErr }, { data: tAll, error: tAllErr }, { data: tt, error: ttErr }] =
          await Promise.all([
            supabase.from("v_top_races_popularity").select("*"),
            supabase.from("v_top_runners_km").select("*"),
            supabase.from("v_total_km_all").select("*").maybeSingle(),
            supabase.from("v_top_times_by_distance").select("*"),
          ]);

        if (trErr) throw new Error("v_top_races_popularity: " + trErr.message);
        if (tkmErr) throw new Error("v_top_runners_km: " + tkmErr.message);
        if (tAllErr) throw new Error("v_total_km_all: " + tAllErr.message);
        if (ttErr) throw new Error("v_top_times_by_distance: " + ttErr.message);

        setTopRaces((tr ?? []) as TopRace[]);
        setTopRunnersKm((tkm ?? []) as TopRunnerKm[]);
        setTotalKm(Number((tAll as TotalKmAll | null)?.total_km_completed ?? 0));
        setTopTimes((tt ?? []) as TopTimeRow[]);

        // 2) Lista biegów + uczestnicy (tu już filtrujemy team)
        const today = new Date().toISOString().slice(0, 10);

        const { data: raceRows, error: raceErr } = await supabase
          .from("races")
          .select("id,title,race_date,city,country,signup_url")
          .gte("race_date", today)
          .order("race_date", { ascending: true })
          .limit(50);

        if (raceErr) throw new Error("races: " + raceErr.message);

        const base = raceRows ?? [];

        const enriched = await Promise.all(
          base.map(async (r) => {
            const { data: opts, error: optErr } = await supabase
              .from("race_options")
              .select("id,label,sort_order")
              .eq("race_id", r.id)
              .order("sort_order", { ascending: true });

            if (optErr) throw new Error("race_options: " + optErr.message);

            const { data: parts, error: partErr } = await supabase
              .from("participations")
              .select("user_id,wants_to_participate,profiles(display_name,team)")
              .eq("race_id", r.id);

            if (partErr) throw new Error("participations: " + partErr.message);

            const filtered =
              teamFilter === "ALL"
                ? (parts ?? [])
                : (parts ?? []).filter((p: any) => p?.profiles?.team === teamFilter);

            const participants = filtered
              .filter((p: any) => p.wants_to_participate)
              .map((p: any) => ({
                user_id: p.user_id,
                name: p.profiles?.display_name ?? "Runner",
                team: p.profiles?.team ?? "?",
              }));

            return { ...r, options: opts ?? [], participants };
          })
        );

        setRaces(enriched);
      } catch (e: any) {
        setErr(e?.message ?? "Nieznany błąd");
      } finally {
        setLoading(false);
      }
    })();
  }, [teamFilter]);

  return (
    <main style={{ background: "#0b0b0f", minHeight: "100vh", color: "white", fontFamily: "system-ui, sans-serif" }}>
      {/* HERO */}
      <section
        style={{
          padding: "56px 16px 34px",
          backgroundImage: "url('/hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.95))" }} />
        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>
          <header style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 44, letterSpacing: -1 }}>KART Runners</h1>
              <p style={{ marginTop: 10, color: "rgba(255,255,255,0.8)", maxWidth: 720 }}>
                Mini Strava: biegi, deklaracje, wyniki i rankingi. Bez korpo-nudy.
              </p>
            </div>
            <nav style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <a
                href="/login"
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  textDecoration: "none",
                }}
              >
                Logowanie
              </a>
              <a
                href="/dashboard"
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "white",
                  color: "black",
                  textDecoration: "none",
                  fontWeight: 900,
                }}
              >
                Panel
              </a>
            </nav>
          </header>

          <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {(["ALL", "KART", "KART light"] as TeamFilter[]).map((t) => (
              <button
                key={t}
                onClick={() => setTeamFilter(t)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontWeight: 900,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: teamFilter === t ? "white" : "rgba(255,255,255,0.08)",
                  color: teamFilter === t ? "black" : "white",
                }}
              >
                {t === "ALL" ? "Wszyscy" : t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px 10px" }}>
        <h2 style={{ margin: "8px 0 12px", fontSize: 20, color: "rgba(255,255,255,0.9)" }}>Dashboard</h2>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <div style={cardBox()}>
            <div style={{ color: "rgba(255,255,255,0.75)" }}>Suma km ukończonych (wszyscy)</div>
            <div style={{ fontSize: 30, fontWeight: 900, marginTop: 8 }}>{Number(totalKm).toFixed(1)} km</div>
            <div style={{ marginTop: 8, color: "rgba(255,255,255,0.65)" }}>Liczone z dystansów w zapisanych biegach.</div>
          </div>

          <div style={cardBox()}>
            <div style={{ color: "rgba(255,255,255,0.75)" }}>Top 3 km (ukończone)</div>
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {topRunnersKm.length === 0 && <div style={{ color: "rgba(255,255,255,0.6)" }}>Brak danych (nikt nie ma statusu completed).</div>}
              {topRunnersKm.map((r, idx) => (
                <div key={r.user_id} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <a href={`/runners/${r.user_id}`} style={{ color: "white", textDecoration: "none", fontWeight: 800 }}>
                    #{idx + 1} {r.display_name ?? "Runner"} <span style={{ color: "rgba(255,255,255,0.6)" }}>({r.team ?? "—"})</span>
                  </a>
                  <div style={{ fontWeight: 900 }}>{Number(r.km_completed ?? 0).toFixed(1)} km</div>
                </div>
              ))}
            </div>
          </div>

          <div style={cardBox()}>
            <div style={{ color: "rgba(255,255,255,0.75)" }}>Top 3 najpopularniejsze biegi</div>
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              {topRaces.length === 0 && <div style={{ color: "rgba(255,255,255,0.6)" }}>Brak danych.</div>}
              {topRaces.map((r) => (
                <div key={r.race_id} style={{ display: "grid", gap: 4 }}>
                  <a href={`/races/${r.race_id}`} style={{ color: "white", textDecoration: "none", fontWeight: 900 }}>
                    {r.title}
                  </a>
                  <div style={{ color: "rgba(255,255,255,0.7)" }}>
                    📅 {r.race_date ? fmtDate(r.race_date) : "?"} · Deklaracje: <strong>{r.declared_count}</strong> · Ukończone:{" "}
                    <strong>{r.completed_count}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {(["5K", "10K", "HALF", "MARATHON"] as const).map((cls) => (
            <div key={cls} style={cardBox()}>
              <div style={{ color: "rgba(255,255,255,0.75)" }}>Top 3 czasy: {cls}</div>
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {(topTimesByClass[cls] ?? []).length === 0 && (
                  <div style={{ color: "rgba(255,255,255,0.6)" }}>Brak wyników (dodajcie czasy po biegu).</div>
                )}
                {(topTimesByClass[cls] ?? []).map((t, idx) => (
                  <div key={`${cls}-${idx}`} style={{ display: "grid", gap: 2 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontWeight: 900 }}>
                        #{idx + 1} {t.display_name ?? "Runner"} <span style={{ color: "rgba(255,255,255,0.6)" }}>({t.team ?? "—"})</span>
                      </div>
                      <div style={{ fontWeight: 900 }}>{fmtTime(t.time_seconds)}</div>
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.7)" }}>
                      {t.race_title} · {t.race_date ? fmtDate(t.race_date) : "?"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTENT */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 16px 60px" }}>
        {loading && <p style={{ color: "rgba(255,255,255,0.75)" }}>Ładowanie…</p>}
        {err && (
          <div style={{ padding: 14, borderRadius: 14, background: "rgba(255,0,0,0.1)", border: "1px solid rgba(255,0,0,0.25)" }}>
            <strong>Błąd:</strong> {err}
          </div>
        )}

        {!loading && !err && races.length === 0 && (
          <p style={{ color: "rgba(255,255,255,0.7)" }}>
            Brak biegów. Dodaj pierwszy w panelu: <a href="/dashboard" style={{ color: "white" }}>/dashboard</a>
          </p>
        )}

        <div style={{ display: "grid", gap: 16 }}>
          {races.map((r) => (
            <RaceCard key={r.id} race={r} />
          ))}
        </div>
      </section>
    </main>
  );
}
