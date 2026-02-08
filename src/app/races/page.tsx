"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";
import ParticipationCard from "./ParticipationCard";
import AdminRacePanel from "./AdminRacePanel";
import RaceMyResult from "../RaceMyResult";

type Option = {
  id: number;
  label: string;
  distance_km: number;
  sort_order: number | null;
};

export default function RacePage() {
  const [idRaw, setIdRaw] = useState<string | null>(null);
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const dbg = params.get("debug");
    setIdRaw(id);
    setDebug(dbg === "1");
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

  async function loadRace() {
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
  }

  useEffect(() => {
    loadRace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceId]);

  const Debug = () => (
    <div style={{ border: "1px solid rgba(255,255,255,0.18)", borderRadius: 14, padding: 12, marginBottom: 14 }}>
      <div style={{ fontWeight: 900 }}>DEBUG</div>
      <div>idRaw: <code>{String(idRaw)}</code></div>
      <div>raceId: <code>{String(raceId)}</code></div>
      {err && <div style={{ color: "crimson" }}>Supabase error: {err}</div>}
    </div>
  );

  if (loading) {
    return (
      <main style={{ padding: 0 }}>
        {debug && <Debug />}
        <section>Ładowanie…</section>
      </main>
    );
  }

  if (!raceId) {
    return (
      <main style={{ padding: 0 }}>
        {debug && <Debug />}
        <section>
          <h1 style={{ marginTop: 0 }}>Brak ID biegu</h1>
          <p>Wejdź na przykład na <code>/races?id=1</code>.</p>
          <a href="/">← Wróć</a>
        </section>
      </main>
    );
  }

  if (err) {
    return (
      <main style={{ padding: 0 }}>
        {debug && <Debug />}
        <section>
          <h1 style={{ marginTop: 0 }}>Błąd</h1>
          <p style={{ color: "crimson" }}>{err}</p>
          <a href="/">← Wróć</a>
        </section>
      </main>
    );
  }

  if (!race) {
    return (
      <main style={{ padding: 0 }}>
        {debug && <Debug />}
        <section>
          <h1 style={{ marginTop: 0 }}>Nie znaleziono biegu</h1>
          <a href="/">← Wróć</a>
        </section>
      </main>
    );
  }

  const options: Option[] = (race.race_options ?? [])
    .slice()
    .sort((a: Option, b: Option) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <main style={{ padding: 0 }}>
      {debug && <Debug />}

      <section>
        <h1 style={{ marginTop: 0 }}>{race.title}</h1>
        <div style={{ opacity: 0.9 }}>
          <strong>{race.race_date}</strong> · {[race.city, race.country].filter(Boolean).join(", ")}
        </div>

        {options.length > 0 && (
          <div style={{ marginTop: 8, opacity: 0.85 }}>
            Dystanse: {options.map((o) => `${o.label} (${Number(o.distance_km)} km)`).join(" | ")}
          </div>
        )}

        <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/">← Wróć</a>
          {race.signup_url && (
            <a href={race.signup_url} target="_blank" rel="noreferrer">
              Zapisy
            </a>
          )}
        </div>
      </section>

      {/* MÓJ UDZIAŁ */}
      <ParticipationCard race={race} options={options} onSaved={loadRace} />

      {/* MÓJ WYNIK (czas po biegu) */}
      <RaceMyResult
        raceId={race.id}
        options={options.map((o) => ({ id: o.id, label: o.label, distance_km: o.distance_km }))}
      />

      {/* ADMIN */}
      <AdminRacePanel race={race} onSaved={loadRace} />
    </main>
  );
}
