"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";

type StatRow = {
  races: { id: number; title: string; race_date: string };
  race_options: { distance_km: number } | null;
};

function yearRange(y: number) {
  return { from: `${y}-01-01`, to: `${y}-12-31` };
}

export default function HomeStats() {
  const year = new Date().getFullYear();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState<string>("");

  const [rows, setRows] = useState<StatRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);

      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id ?? null;
      setUserId(uid);

      if (!uid) {
        setLoading(false);
        return;
      }

      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", uid)
        .single();

      if (!profErr) setName(prof?.display_name ?? "");

      const { from, to } = yearRange(year);

      const { data, error } = await supabase
        .from("participations")
        .select(
          `
          races!inner(id,title,race_date),
          race_options(distance_km)
        `
        )
        .eq("user_id", uid)
        .eq("wants_to_participate", true)
        .gte("races.race_date", from)
        .lte("races.race_date", to);

      if (error) {
        setErr(error.message);
        setRows([]);
        setLoading(false);
        return;
      }

      setRows((data ?? []) as any);
      setLoading(false);
    })();
  }, [year]);

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
      <section style={{ marginBottom: 16 }}>
        <div style={{ opacity: 0.75 }}>Ładuję Twoje statystyki…</div>
      </section>
    );
  }

  if (!userId) {
    return (
      <section style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Twoje statystyki ({year})</h2>
        <p style={{ marginTop: 6 }}>Zaloguj się, żeby zobaczyć sumę km i Top 3 w roku.</p>
        <a href="/login">Zaloguj się</a>
      </section>
    );
  }

  if (err) {
    return (
      <section style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Twoje statystyki ({year})</h2>
        <p style={{ color: "crimson" }}>Błąd pobierania statystyk: {err}</p>
      </section>
    );
  }

  const hello = name || "Runner";

  return (
    <section style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>Twoje statystyki ({year})</h2>
          <div style={{ opacity: 0.85 }}>Cześć, {hello}. Liczymy tylko bieżący rok kalendarzowy.</div>
        </div>

        <div style={{ fontWeight: 900, fontSize: 18 }}>
          Suma: {totalKm.toFixed(0)} km
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Top 3 dystanse:</strong>{" "}
        {top3.length === 0 ? (
          <span style={{ opacity: 0.8 }}>brak (zaznacz “Chcę wziąć udział” przy biegach)</span>
        ) : (
          <ol style={{ margin: "8px 0 0 18px" }}>
            {top3.map((r, idx) => (
              <li key={idx}>
                <a href={`/races?id=${r.races.id}`}>{r.races.title}</a>{" "}
                ({r.race_options?.distance_km ?? 0} km) – {r.races.race_date}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href="/dashboard">Ustaw profil</a>
        <a href={`/people?id=${userId}`}>Mój profil (pełne staty)</a>
      </div>
    </section>
  );
}
