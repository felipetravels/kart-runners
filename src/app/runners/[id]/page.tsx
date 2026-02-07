"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname } from "next/navigation";

type ProfileRow = {
  display_name: string | null;
  team: string | null;
};

type ParticipationRow = {
  race_id: number;
  wants_to_participate: boolean | null;
  registered: boolean | null;
  paid: boolean | null;
  status: string | null;
  option_id: number | null;

  races: {
    id: number;
    title: string;
    race_date: string;
    city: string | null;
    country: string | null;
  } | null;

  race_options: {
    id: number;
    label: string;
    distance_km: number | null;
  } | null;
};

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

function safeKm(n: number | null | undefined) {
  return Number.isFinite(Number(n)) ? Number(n) : 0;
}

function badgeStyle(bg: string, border: string) {
  return {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: bg,
    border: `1px solid ${border}`,
    fontWeight: 800,
    fontSize: 12,
  } as const;
}

export default function RunnerProfilePage() {
  const params = useParams<{ id?: string }>();
  const pathname = usePathname();

  const runnerId = params?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [rows, setRows] = useState<ParticipationRow[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        if (!runnerId) {
          setErr(`Brak id zawodnika w URL. pathname="${pathname}"`);
          return;
        }

        // 1) profil
        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("display_name,team")
          .eq("id", runnerId)
          .maybeSingle();

        if (profErr) throw new Error("profiles: " + profErr.message);

        // 2) biegi zawodnika (participations + join races + join race_options)
        const { data: parts, error: partErr } = await supabase
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

        if (partErr) throw new Error("participations: " + partErr.message);

        const clean = (parts ?? []) as ParticipationRow[];

        // sortujemy po dacie biegu (najbliższe na górze)
        clean.sort((a, b) => {
          const da = a.races?.race_date ?? "9999-12-31";
          const db = b.races?.race_date ?? "9999-12-31";
          return da.localeCompare(db);
        });

        setProfile(prof ?? null);
        setRows(clean);
      } catch (e: any) {
        setErr(e?.message ?? "Nieznany błąd");
      } finally {
        setLoading(false);
      }
    })();
  }, [runnerId, pathname]);

  const stats = useMemo(() => {
    const wants = rows.filter((r) => !!r.wants_to_participate);
    const registered = rows.filter((r) => !!r.registered);
    const paid = rows.filter((r) => !!r.paid);

    const completed = rows.filter((r) => (r.status ?? "").toLowerCase() === "completed");
    const planned = rows.filter((r) => (r.status ?? "").toLowerCase() !== "completed");

    const totalKmAll = wants.reduce((sum, r) => sum + safeKm(r.race_options?.distance_km), 0);
    const totalKmCompleted = completed.reduce((sum, r) => sum + safeKm(r.race_options?.distance_km), 0);
    const totalKmPlanned = planned
      .filter((r) => !!r.wants_to_participate)
      .reduce((sum, r) => sum + safeKm(r.race_options?.distance_km), 0);

    return {
      countAll: rows.length,
      countWants: wants.length,
      countRegistered: registered.length,
      countPaid: paid.length,
      countCompleted: completed.length,
      totalKmAll,
      totalKmCompleted,
      totalKmPlanned,
    };
  }, [rows]);

  const displayName = profile?.display_name?.trim() || "Runner";
  const team = profile?.team || "—";

  return (
    <main
      style={{
        background: "#0b0b0f",
        minHeight: "100vh",
        color: "white",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "26px 16px" }}>
        <a href="/" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>
          ← Powrót
        </a>

        <div style={{ marginTop: 16 }}>
          <h1 style={{ margin: 0, fontSize: 40, letterSpacing: -1 }}>{displayName}</h1>
          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span style={badgeStyle("rgba(255,255,255,0.10)", "rgba(255,255,255,0.18)")}>
              Drużyna: {team}
            </span>
            <span style={badgeStyle("rgba(255,255,255,0.08)", "rgba(255,255,255,0.14)")}>
              Zawodnik ID: {runnerId ?? "?"}
            </span>
          </div>
          <p style={{ marginTop: 12, color: "rgba(255,255,255,0.75)", maxWidth: 850 }}>
            “Mini Strava”: lista biegów, deklaracje, statusy i kilometry liczone z wybranego dystansu.
          </p>
        </div>

        {loading && <p style={{ marginTop: 20, color: "rgba(255,255,255,0.75)" }}>Ładowanie profilu…</p>}

        {err && (
          <div
            style={{
              marginTop: 18,
              padding: 14,
              borderRadius: 14,
              background: "rgba(255,0,0,0.10)",
              border: "1px solid rgba(255,0,0,0.25)",
            }}
          >
            <strong>Błąd:</strong> {err}
          </div>
        )}

        {!loading && !err && (
          <>
            {/* STATY */}
            <section
              style={{
                marginTop: 18,
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              <div
                style={{
                  borderRadius: 18,
                  padding: 14,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div style={{ color: "rgba(255,255,255,0.75)" }}>Biegi łącznie</div>
                <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>{stats.countAll}</div>
                <div style={{ color: "rgba(255,255,255,0.70)", marginTop: 6 }}>
                  Chcę: <strong>{stats.countWants}</strong> · Zapisany: <strong>{stats.countRegistered}</strong> · Opłacony:{" "}
                  <strong>{stats.countPaid}</strong>
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  padding: 14,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div style={{ color: "rgba(255,255,255,0.75)" }}>Kilometry (deklarowane)</div>
                <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>
                  {stats.totalKmAll.toFixed(1)} km
                </div>
                <div style={{ color: "rgba(255,255,255,0.70)", marginTop: 6 }}>
                  Planowane: <strong>{stats.totalKmPlanned.toFixed(1)} km</strong>
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  padding: 14,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div style={{ color: "rgba(255,255,255,0.75)" }}>Ukończone</div>
                <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>{stats.countCompleted}</div>
                <div style={{ color: "rgba(255,255,255,0.70)", marginTop: 6 }}>
                  Km ukończone: <strong>{stats.totalKmCompleted.toFixed(1)} km</strong>
                </div>
              </div>
            </section>

            {/* LISTA BIEGÓW */}
            <section style={{ marginTop: 18 }}>
              <h2 style={{ margin: "18px 0 10px", fontSize: 22 }}>Biegi zawodnika</h2>

              {rows.length === 0 && (
                <p style={{ color: "rgba(255,255,255,0.7)" }}>
                  Brak biegów. To może być sportowiec “mentalny” albo po prostu jeszcze nic nie dodał.
                </p>
              )}

              <div style={{ display: "grid", gap: 12 }}>
                {rows.map((r) => {
                  const race = r.races;
                  const opt = r.race_options;

                  const wants = !!r.wants_to_participate;
                  const reg = !!r.registered;
                  const paid = !!r.paid;

                  const status = (r.status ?? "planned").toLowerCase();

                  return (
                    <div
                      key={`${r.race_id}-${r.option_id ?? "noopt"}`}
                      style={{
                        borderRadius: 18,
                        padding: 14,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ color: "rgba(255,255,255,0.8)" }}>
                            {race?.race_date ? `📅 ${formatDate(race.race_date)}` : "📅 ?"}
                            {" · "}
                            {race ? (
                              <a href={`/races/${race.id}`} style={{ color: "white", textDecoration: "none", fontWeight: 900 }}>
                                {race.title}
                              </a>
                            ) : (
                              <span style={{ fontWeight: 900 }}>Bieg</span>
                            )}
                          </div>

                          <div style={{ marginTop: 6, color: "rgba(255,255,255,0.7)" }}>
                            📍 {[race?.city, race?.country].filter(Boolean).join(", ") || "Brak lokalizacji"}
                          </div>

                          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span style={badgeStyle("rgba(255,255,255,0.08)", "rgba(255,255,255,0.14)")}>
                              Dystans: {opt?.label ?? "—"}{opt?.distance_km != null ? ` (${opt.distance_km} km)` : ""}
                            </span>

                            <span style={badgeStyle(wants ? "rgba(34,197,94,0.20)" : "rgba(255,255,255,0.06)", wants ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.12)")}>
                              {wants ? "Chcę" : "Nie"}
                            </span>

                            <span style={badgeStyle(reg ? "rgba(59,130,246,0.20)" : "rgba(255,255,255,0.06)", reg ? "rgba(59,130,246,0.35)" : "rgba(255,255,255,0.12)")}>
                              {reg ? "Zapisany" : "Nie zapisany"}
                            </span>

                            <span style={badgeStyle(paid ? "rgba(245,158,11,0.20)" : "rgba(255,255,255,0.06)", paid ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.12)")}>
                              {paid ? "Opłacony" : "Nieopłacony"}
                            </span>

                            <span style={badgeStyle(status === "completed" ? "rgba(168,85,247,0.22)" : "rgba(255,255,255,0.06)", status === "completed" ? "rgba(168,85,247,0.38)" : "rgba(255,255,255,0.12)")}>
                              Status: {status}
                            </span>
                          </div>
                        </div>

                        <div style={{ textAlign: "right", minWidth: 180 }}>
                          <div style={{ color: "rgba(255,255,255,0.75)" }}>Km (z dystansu)</div>
                          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>
                            {safeKm(opt?.distance_km).toFixed(1)} km
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
