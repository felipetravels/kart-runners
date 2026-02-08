"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";
import ParticipationCard from "./ParticipationCard";

type Option = {
  id: number;
  label: string;
  distance_km: number;
  sort_order: number | null;
};

export default function RacePage() {
  const [href, setHref] = useState("(loading...)");
  const [search, setSearch] = useState("(loading...)");
  const [idRaw, setIdRaw] = useState<string | null>(null);

  useEffect(() => {
    const h = window.location.href;
    const s = window.location.search;
    const params = new URLSearchParams(s);
    const id = params.get("id");

    setHref(h);
    setSearch(s);
    setIdRaw(id);
  }, []);

  const raceId = useMemo(() => {
    if (!idRaw) return null;
    const m = idRaw.trim().match(/^\d+$/);
    if (!m) return null;
    const n = Number(idRaw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [idRaw]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [race, setRace] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setErr(null);

      if (!raceId) {
        setRace(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
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

      if (error) {
        setErr(error.message);
        setRace(null);
        setLoading(false);
        return;
      }

      setRace(data);
      setLoading(false);
    })();
  }, [raceId]);

  const Debug = () => (
    <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 12, background: "#f7f7f7", marginBottom: 14, fontSize: 13 }}>
      <div style={{ fontWeight: 900 }}>RACES DEBUG (client)</div>
      <div>href: <code>{href}</code></div>
      <div>search: <code>{search}</code></div>
      <div>idRaw: <code>{String(idRaw)}</code></div>
      <div>raceId: <code>{String(raceId)}</code></div>
      {err && <div style={{ color: "crimson" }}>Supabase error: {err}</div>}
    </div>
  );

  if (loading) {
    return (
      <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
        <Debug />
        Ładowanie…
      </main>
    );
  }

  if (!raceId) {
    return (
      <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
        <Debug />
        <h1>Brak ID biegu</h1>
        <p>Wejdź na przykład na <code>/races?id=1</code>.</p>
        <a href="/">← Wróć</a>
      </main>
    );
  }

  if (!race) {
    return (
      <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
        <Debug />
        <h1>Nie udało się wczytać biegu</h1>
        <p>Jeśli w debug masz raceId, a tu nadal pustka, to patrz na “Supabase error”.</p>
        <a href="/">← Wróć</a>
      </main>
    );
  }

  const options: Option[] = (race.race_options ?? [])
    .slice()
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const declared = (race.participations ?? [])
    .filter((p: any) => p?.wants_to_participate === true)
    .slice(0, 50);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <Debug />

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
            {options.map((o) => `${o.label} (${Number(o.distance_km)} km)`).join(" | ")}
          </div>
        )}

        {race.description && <p style={{ marginTop: 10 }}>{race.description}</p>}

        <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {race.signup_url && (
            <a href={race.signup_url} target="_blank" rel="noreferrer">
              Zapisy
            </a>
          )}
          <a href="/dashboard">Dodaj bieg</a>
        </div>
      </header>

      {/* checkboxy i zapis udziału */}
      <ParticipationCard raceId={raceId} options={options} />

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
