"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Race = {
  id: number;
  title: string;
  race_date: string;
  city: string | null;
  country: string | null;
};

type RaceOption = {
  id: number;
  label: string;
  distance_km: number;
};

type ParticipationRaw = {
  race_id: number;
  wants_to_participate: boolean;
  registered: boolean;
  paid: boolean;
  status: any;
  option_id: number | null;
  // Supabase bywa uparty: czasem zwraca obiekt, czasem tablicę
  races: Race | Race[] | null;
  race_options: RaceOption | RaceOption[] | null;
};

function asOne<T>(x: T | T[] | null | undefined): T | null {
  if (!x) return null;
  return Array.isArray(x) ? (x[0] ?? null) : x;
}

function fmtDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

export default function RunnerPage() {
  const params = useParams<{ id?: string }>();
  const runnerId = params?.id ?? "";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [profile, setProfile] = useState<any>(null);
  const [parts, setParts] = useState<ParticipationRaw[]>([]);

  const stats = useMemo(() => {
    // Suma km tylko z ukończonych (status == completed) i mających distance_km
    let kmCompleted = 0;

    // Udziały (wants_to_participate)
    let planned = 0;

    // Ukończone
    let completed = 0;

    for (const p of parts) {
      if (p.wants_to_participate) planned++;

      const st = String(p.status ?? "").toLowerCase();
      if (st === "completed") completed++;

      const opt = asOne(p.race_options);
      if (st === "completed" && opt?.distance_km) kmCompleted += Number(opt.distance_km);
    }

    return { planned, completed, kmCompleted };
  }, [parts]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        if (!runnerId) {
          setErr("Brak ID zawodnika w URL.");
          return;
        }

        // Profil
        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("id,display_name,team")
          .eq("id", runnerId)
          .maybeSingle();

        if (profErr) throw new Error("profiles: " + profErr.message);
        if (!prof) {
          setErr("Nie znaleziono zawodnika.");
          return;
        }
        setProfile(prof);

        // Biegi zawodnika (participations + join races + join race_options)
        // Uwaga: PostgREST czasem zwraca embed jako tablicę, więc typujemy to luźno i normalizujemy.
        const { data, error } = await supabase
          .from("participations")
          .select(
            `
            race_id,
            wants_to_participate,
            registered,
            paid,
            status,
            option_id,
            races ( id, title, race_date, city, country ),
            race_options ( id, label, distance_km )
          `
          )
          .eq("user_id", runnerId);

        if (error) throw new Error("participations: " + error.message);

        const clean = (data ?? []) as unknown as ParticipationRaw[];

        // sort: najbliższe na górze (po dacie biegu)
        clean.sort((a, b) => {
          const ra = asOne(a.races);
          const rb = asOne(b.races);
          const da = ra?.race_date ?? "9999-12-31";
          const db = rb?.race_date ?? "9999-12-31";
          return da.localeCompare(db);
        });

        setParts(clean);
      } catch (e: any) {
        setErr(e?.message ?? "Nieznany błąd");
      } finally {
        setLoading(false);
      }
    })();
  }, [runnerId]);

  if (loading) {
    return (
      <main style={{ maxWidth: 900, margin: "40px auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
        <a href="/">← Powrót</a>
        <p style={{ marginTop: 12 }}>Ładowanie…</p>
      </main>
    );
  }

  if (err) {
    return (
      <main style={{ maxWidth: 900, margin: "40px auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
        <a href="/">← Powrót</a>
        <h1 style={{ marginTop: 12 }}>Błąd</h1>
        <p style={{ color: "crimson" }}>{err}</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <a href="/">← Powrót</a>

      <h1 style={{ marginTop: 12 }}>{profile?.display_name ?? "Zawodnik"}</h1>
      <p style={{ color: "#666" }}>Drużyna: {profile?.team ?? "—"}</p>

      <section style={{ marginTop: 14, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 12 }}>
          <div style={{ color: "#666" }}>Zadeklarowane biegi</div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{stats.planned}</div>
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 12 }}>
          <div style={{ color: "#666" }}>Ukończone</div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{stats.completed}</div>
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 12 }}>
          <div style={{ color: "#666" }}>Km ukończone (z zapisów)</div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{stats.kmCompleted.toFixed(1)} km</div>
        </div>
      </section>

      <h2 style={{ marginTop: 18 }}>Biegi</h2>

      <div style={{ display: "grid", gap: 10 }}>
        {parts.length === 0 && <p style={{ color: "#777" }}>Brak biegów.</p>}

        {parts.map((p, idx) => {
          const r = asOne(p.races);
          const opt = asOne(p.race_options);

          return (
            <div
              key={idx}
              style={{
                border: "1px solid #eee",
                borderRadius: 14,
                padding: 12,
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div style={{ minWidth: 260 }}>
                <div style={{ fontWeight: 900 }}>
                  {r ? (
                    <a href={`/races/${r.id}`} style={{ textDecoration: "none", color: "#111" }}>
                      {r.title}
                    </a>
                  ) : (
                    <span>Nieznany bieg (race_id={p.race_id})</span>
                  )}
                </div>
                <div style={{ color: "#666", marginTop: 4 }}>
                  {r?.race_date ? `📅 ${fmtDate(r.race_date)}` : "📅 ?"} · 📍 {[r?.city, r?.country].filter(Boolean).join(", ") || "—"}
                </div>
                <div style={{ color: "#666", marginTop: 4 }}>
                  Dystans: <strong>{opt?.label ?? "—"}</strong> {opt?.distance_km ? `(${opt.distance_km} km)` : ""}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid #eee", fontSize: 12, color: "#555" }}>
                  status: {String(p.status ?? "planned")}
                </span>
                <span style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid #eee", fontSize: 12, color: "#555" }}>
                  {p.registered ? "zapisany" : "niezapisany"}
                </span>
                <span style={{ padding: "6px 10px", borderRadius: 999, border: "1px solid #eee", fontSize: 12, color: "#555" }}>
                  {p.paid ? "opłacony" : "nieopłacony"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
