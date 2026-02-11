"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";

type Row = {
  race_id: number;
  option_id: number | null;
  wants_to_participate: boolean;
  status: string;
  registered: boolean;
  paid: boolean;
  races: {
    id: number;
    title: string;
    race_date: string;
    city: string | null;
    country: string | null;
  };
  race_options: {
    id: number;
    label: string;
    distance_km: number;
  } | null;
};

function yearRange(y: number) {
  const from = `${y}-01-01`;
  const to = `${y}-12-31`;
  return { from, to };
}

export default function PersonPage() {
  const [href, setHref] = useState("");
  const [personId, setPersonId] = useState<string | null>(null);

  useEffect(() => {
    const h = window.location.href;
    setHref(h);
    const id = new URLSearchParams(window.location.search).get("id");
    setPersonId(id);
  }, []);

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [profile, setProfile] = useState<any>(null);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      setErr(null);

      if (!personId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("id, display_name, team")
        .eq("id", personId)
        .single();

      if (profErr) {
        setErr(profErr.message);
        setLoading(false);
        return;
      }

      setProfile(prof);

      const { from, to } = yearRange(year);

      const { data, error } = await supabase
        .from("participations")
        .select(
          `
          race_id, option_id, wants_to_participate, status, registered, paid,
          races!inner(id, title, race_date, city, country),
          race_options(id, label, distance_km)
        `
        )
        .eq("user_id", personId)
        .eq("wants_to_participate", true)
        .gte("races.race_date", from)
        .lte("races.race_date", to);

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      setRows((data ?? []) as any);
      setLoading(false);
    })();
  }, [personId, year]);

  const totalKm = useMemo(() => {
    return rows.reduce((sum, r) => sum + (r.race_options?.distance_km ?? 0), 0);
  }, [rows]);

  const top3 = useMemo(() => {
    return rows
      .slice()
      .sort((a, b) => (b.race_options?.distance_km ?? 0) - (a.race_options?.distance_km ?? 0))
      .slice(0, 3);
  }, [rows]);

  if (loading) {
    return (
      <main style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
        Ĺadowanie profiluâ€¦
      </main>
    );
  }

  if (!personId) {
    return (
      <main style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
        <h1>Wybierz zawodnika z listy</h1>
        <p>Aby zobaczyć statystyki, wróć do listy ekipy. jak <code>/people?id=UUID</code>.</p>
        <div style={{ color: "#666" }}>URL: <code>{href}</code></div>
        <a href="/">â† WrĂłÄ‡</a>
      </main>
    );
  }

  if (err) {
    return (
      <main style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
        <h1>BĹ‚Ä…d</h1>
        <p style={{ color: "crimson" }}>{err}</p>
        <a href="/">â† WrĂłÄ‡</a>
      </main>
    );
  }

  const name = profile?.display_name || "Runner";

  return (
    <main style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
      <a href="/" style={{ display: "inline-block", marginBottom: 14 }}>â† WrĂłÄ‡</a>

      <header style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
        <h1 style={{ marginTop: 0, marginBottom: 6 }}>{name}</h1>
        <div style={{ color: "#555" }}>
          DruĹĽyna: <strong>{profile?.team ?? "brak"}</strong>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <label>
            Rok:{" "}
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>

          <div style={{ marginLeft: "auto", fontWeight: 800 }}>
            Suma km ({year}): {totalKm.toFixed(0)} km
          </div>
        </div>
      </header>

      <section style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
        <h2 style={{ marginTop: 0 }}>Top 3 (najdĹ‚uĹĽsze w {year})</h2>

        {top3.length === 0 ? (
          <p style={{ color: "#555" }}>Brak deklaracji w tym roku.</p>
        ) : (
          <ol>
            {top3.map((r, idx) => (
              <li key={idx}>
                <a href={`/races?id=${r.races.id}`}>{r.races.title}</a>{" "}
                ({r.race_options?.distance_km ?? 0} km) â€“ {r.races.race_date}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
        <h2 style={{ marginTop: 0 }}>Biegi w {year}</h2>

        {rows.length === 0 ? (
          <p style={{ color: "#555" }}>Brak biegĂłw w tym roku.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {rows
              .slice()
              .sort((a, b) => a.races.race_date.localeCompare(b.races.race_date))
              .map((r, idx) => (
                <div key={idx} style={{ borderBottom: "1px solid #eee", paddingBottom: 8 }}>
                  <div style={{ fontWeight: 800 }}>
                    <a href={`/races?id=${r.races.id}`}>{r.races.title}</a>
                  </div>
                  <div style={{ color: "#555" }}>
                    {r.races.race_date} Â· {[r.races.city, r.races.country].filter(Boolean).join(", ")}
                  </div>
                  <div style={{ color: "#555" }}>
                    Dystans: <strong>{r.race_options?.label ?? "?"}</strong> ({r.race_options?.distance_km ?? 0} km)
                    {" Â· "}Zapisany: {r.registered ? "tak" : "nie"}
                    {" Â· "}OpĹ‚acony: {r.paid ? "tak" : "nie"}
                    {" Â· "}Status: {r.status}
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}
