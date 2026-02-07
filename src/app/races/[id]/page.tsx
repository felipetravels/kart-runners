"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname } from "next/navigation";

function fmtDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
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

function parseTimeToSeconds(input: string): number | null {
  // Akceptuje: "mm:ss" albo "hh:mm:ss"
  const t = input.trim();
  if (!t) return null;
  const parts = t.split(":").map((x) => x.trim());
  if (parts.length < 2 || parts.length > 3) return null;

  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isFinite(n) || n < 0)) return null;

  if (parts.length === 2) {
    const [m, s] = nums;
    if (s >= 60) return null;
    return Math.floor(m * 60 + s);
  }

  const [h, m, s] = nums;
  if (m >= 60 || s >= 60) return null;
  return Math.floor(h * 3600 + m * 60 + s);
}

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function RaceDetailsPage() {
  const params = useParams<{ id?: string }>();
  const pathname = usePathname();

  const rawId = params?.id;
  const raceId = useMemo(() => Number(rawId), [rawId]);

  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [race, setRace] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // deklaracja udziału
  const [wants, setWants] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [paid, setPaid] = useState(false);
  const [optionId, setOptionId] = useState<string>("");

  const [msg, setMsg] = useState<string | null>(null);

  // wyniki (race_results)
  const [myTime, setMyTime] = useState("");
  const [myNotes, setMyNotes] = useState("");
  const [myPhotoFile, setMyPhotoFile] = useState<File | null>(null);
  const [markCompleted, setMarkCompleted] = useState(true);

  const [myResultId, setMyResultId] = useState<number | null>(null);
  const [myPhotoUrl, setMyPhotoUrl] = useState<string | null>(null);

  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [savingResult, setSavingResult] = useState(false);

  const [raceResults, setRaceResults] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErrorText(null);

        if (!rawId) {
          setErrorText(`Brak parametru "id" w URL. pathname="${pathname}"`);
          return;
        }

        if (!Number.isFinite(raceId)) {
          setErrorText(`Nieprawidłowe ID w URL: "${rawId}" (pathname="${pathname}")`);
          return;
        }

        const { data: userData } = await supabase.auth.getUser();
        setUserId(userData.user?.id ?? null);

        // Bieg
        const { data: raceData, error: raceErr } = await supabase
          .from("races")
          .select("*")
          .eq("id", raceId)
          .maybeSingle();

        if (raceErr) {
          setErrorText(`Błąd pobierania biegu: ${raceErr.message}`);
          return;
        }
        if (!raceData) {
          setErrorText(`Nie znaleziono biegu o id=${raceId}.`);
          return;
        }
        setRace(raceData);

        // Dystanse
        const { data: optData, error: optErr } = await supabase
          .from("race_options")
          .select("*")
          .eq("race_id", raceId)
          .order("sort_order", { ascending: true });

        if (optErr) {
          setErrorText(`Błąd pobierania dystansów: ${optErr.message}`);
          return;
        }
        setOptions(optData ?? []);

        // Uczestnicy (deklaracje)
        const { data: partData, error: partErr } = await supabase
          .from("participations")
          .select("user_id,wants_to_participate,registered,paid,option_id,status,profiles(display_name,team)")
          .eq("race_id", raceId);

        if (partErr) {
          setErrorText(`Błąd pobierania uczestników: ${partErr.message}`);
          return;
        }
        setParticipants(partData ?? []);

        // Moja deklaracja (jeśli istnieje)
        const uid = userData.user?.id;
        if (uid) {
          const mine = (partData ?? []).find((p: any) => p.user_id === uid);
          if (mine) {
            setWants(!!mine.wants_to_participate);
            setRegistered(!!mine.registered);
            setPaid(!!mine.paid);
            setOptionId(mine.option_id ? String(mine.option_id) : "");
          }
        }

        // Wyniki biegu (race_results + profile)
        const { data: rr, error: rrErr } = await supabase
          .from("race_results")
          .select("id,race_id,user_id,option_id,time_seconds,notes,photo_url,created_at,profiles(display_name,team)")
          .eq("race_id", raceId)
          .order("time_seconds", { ascending: true });

        if (rrErr) {
          // Wyniki są dodatkiem, nie blokujemy całej strony
          console.error(rrErr);
        } else {
          setRaceResults(rr ?? []);
        }

        // Mój wynik (jeśli istnieje)
        if (uid) {
          const { data: mineRes, error: mineResErr } = await supabase
            .from("race_results")
            .select("id,time_seconds,notes,photo_url,option_id")
            .eq("race_id", raceId)
            .eq("user_id", uid)
            .maybeSingle();

          if (mineResErr) {
            console.error(mineResErr);
          } else if (mineRes) {
            setMyResultId(mineRes.id);
            setMyTime(fmtTime(mineRes.time_seconds));
            setMyNotes(mineRes.notes ?? "");
            setMyPhotoUrl(mineRes.photo_url ?? null);

            // Jeśli wynik ma option_id, ustawiamy jako domyślne
            if (mineRes.option_id) setOptionId(String(mineRes.option_id));
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [rawId, raceId, pathname]);

  async function refreshParticipantsAndResults() {
    // uczestnicy
    const { data: partData } = await supabase
      .from("participations")
      .select("user_id,wants_to_participate,registered,paid,option_id,status,profiles(display_name,team)")
      .eq("race_id", raceId);

    setParticipants(partData ?? []);

    // wyniki
    const { data: rr } = await supabase
      .from("race_results")
      .select("id,race_id,user_id,option_id,time_seconds,notes,photo_url,created_at,profiles(display_name,team)")
      .eq("race_id", raceId)
      .order("time_seconds", { ascending: true });

    setRaceResults(rr ?? []);
  }

  async function saveMyParticipation() {
    setMsg(null);

    if (!userId) {
      setMsg("Musisz być zalogowany, żeby się dopisać.");
      return;
    }

    const { error } = await supabase.from("participations").upsert({
      user_id: userId,
      race_id: raceId,
      wants_to_participate: wants,
      registered,
      paid,
      option_id: optionId ? Number(optionId) : null,
      status: "planned",
    });

    if (error) {
      setMsg("Błąd zapisu: " + error.message);
      return;
    }

    setMsg("Zapisano ✅");
    await refreshParticipantsAndResults();
  }

  async function uploadPhotoIfAny(uid: string): Promise<string | null> {
    if (!myPhotoFile) return myPhotoUrl ?? null;

    const ext = myPhotoFile.name.split(".").pop() || "jpg";
    const safeName = myPhotoFile.name.replace(/[^\w.\-]+/g, "_");
    const path = `${raceId}/${uid}/${Date.now()}_${safeName}`;

    const { error: upErr } = await supabase.storage.from("race-photos").upload(path, myPhotoFile, {
      cacheControl: "3600",
      upsert: false,
    });

    if (upErr) {
      throw new Error("Upload zdjęcia: " + upErr.message);
    }

    const { data } = supabase.storage.from("race-photos").getPublicUrl(path);
    return data.publicUrl ?? null;
  }

  async function saveMyResult() {
    setResultMsg(null);

    if (!userId) {
      setResultMsg("Musisz być zalogowany, żeby dodać wynik.");
      return;
    }

    const secs = parseTimeToSeconds(myTime);
    if (!secs) {
      setResultMsg('Podaj czas jako "mm:ss" albo "hh:mm:ss" (np. 24:15 albo 1:32:10).');
      return;
    }

    if (!optionId) {
      setResultMsg("Wybierz dystans (żeby wynik trafił do odpowiedniego rankingu).");
      return;
    }

    setSavingResult(true);
    try {
      const photoUrl = await uploadPhotoIfAny(userId);

      // upsert wyniku
      const payload = {
        race_id: raceId,
        user_id: userId,
        option_id: Number(optionId),
        time_seconds: secs,
        notes: myNotes.trim() || null,
        photo_url: photoUrl,
      };

      const { data, error } = await supabase.from("race_results").upsert(payload).select("id").maybeSingle();

      if (error) {
        setResultMsg("Błąd zapisu wyniku: " + error.message);
        return;
      }

      setMyResultId((data as any)?.id ?? myResultId ?? null);
      setMyPhotoUrl(photoUrl);
      setMyPhotoFile(null);

      // opcjonalnie: ustaw status completed w participation
      if (markCompleted) {
        const { error: updErr } = await supabase
          .from("participations")
          .update({ status: "completed" })
          .eq("race_id", raceId)
          .eq("user_id", userId);

        // jeśli enum ma inne wartości, tu wyskoczy błąd i pokażemy go (bez psucia wyniku)
        if (updErr) {
          setResultMsg(`Wynik zapisany ✅, ale nie udało się ustawić statusu completed: ${updErr.message}`);
          await refreshParticipantsAndResults();
          return;
        }
      }

      setResultMsg("Wynik zapisany ✅");
      await refreshParticipantsAndResults();
    } catch (e: any) {
      setResultMsg(e?.message ?? "Nieznany błąd zapisu wyniku");
    } finally {
      setSavingResult(false);
    }
  }

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <a href="/">← Powrót</a>

      <div style={{ marginTop: 12, padding: 12, border: "1px dashed #bbb", borderRadius: 12, color: "#555" }}>
        <strong>Debug routera:</strong>
        <div>pathname: {pathname}</div>
        <div>params.id: {String(rawId)}</div>
        <div>raceId (Number): {String(raceId)}</div>
      </div>

      {loading && <p style={{ marginTop: 18 }}>Ładowanie…</p>}

      {errorText && (
        <>
          <h1 style={{ marginTop: 18 }}>Coś nie zadziałało</h1>
          <p style={{ color: "crimson" }}>{errorText}</p>
        </>
      )}

      {!loading && !errorText && race && (
        <>
          <h1 style={{ marginTop: 18 }}>{race.title}</h1>
          <p style={{ color: "#555" }}>
            📅 {race.race_date ? fmtDate(race.race_date) : "?"} · 📍 {[race.city, race.country].filter(Boolean).join(", ") || "Brak lokalizacji"}
          </p>

          {race.signup_url && (
            <p>
              <a href={race.signup_url} target="_blank" rel="noreferrer">
                Link do zapisów
              </a>
            </p>
          )}

          <hr style={{ margin: "18px 0" }} />

          {/* Twoja deklaracja */}
          <section style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
            <h2 style={{ marginTop: 0 }}>Twoja deklaracja</h2>

            {!userId && (
              <p style={{ color: "crimson" }}>
                Musisz się zalogować, żeby się dopisać. <a href="/login">Logowanie</a>
              </p>
            )}

            <label style={{ display: "block", marginTop: 10 }}>
              Wybierz dystans:
              <select
                value={optionId}
                onChange={(e) => setOptionId(e.target.value)}
                style={{ display: "block", marginTop: 6, padding: 10, width: "100%" }}
              >
                <option value="">(nie wybrano)</option>
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              <label>
                <input type="checkbox" checked={wants} onChange={(e) => setWants(e.target.checked)} /> Chcę wziąć udział
              </label>
              <label>
                <input type="checkbox" checked={registered} onChange={(e) => setRegistered(e.target.checked)} /> Zapisany
              </label>
              <label>
                <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} /> Opłacony
              </label>
            </div>

            <button onClick={saveMyParticipation} style={{ marginTop: 14, padding: 12, borderRadius: 12 }}>
              Zapisz deklarację
            </button>

            {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
          </section>

          {/* Dodaj wynik */}
          <section style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
            <h2 style={{ marginTop: 0 }}>Dodaj wynik po biegu</h2>

            {!userId && <p style={{ color: "crimson" }}>Zaloguj się, żeby dodać wynik.</p>}

            <div style={{ display: "grid", gap: 10 }}>
              <label>
                Czas (mm:ss albo hh:mm:ss)
                <input
                  value={myTime}
                  onChange={(e) => setMyTime(e.target.value)}
                  placeholder="np. 24:15 lub 1:32:10"
                  style={{ width: "100%", padding: 10, marginTop: 6 }}
                />
              </label>

              <label>
                Notatki
                <textarea
                  value={myNotes}
                  onChange={(e) => setMyNotes(e.target.value)}
                  placeholder="Jak poszło, jak się czułeś, warunki, cokolwiek..."
                  rows={4}
                  style={{ width: "100%", padding: 10, marginTop: 6 }}
                />
              </label>

              <label>
                Zdjęcie (opcjonalnie)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMyPhotoFile(e.target.files?.[0] ?? null)}
                  style={{ width: "100%", marginTop: 6 }}
                />
              </label>

              {myPhotoUrl && (
                <div style={{ color: "#555" }}>
                  Masz już zapisane zdjęcie:{" "}
                  <a href={myPhotoUrl} target="_blank" rel="noreferrer">
                    podgląd ↗
                  </a>
                </div>
              )}

              <label>
                <input type="checkbox" checked={markCompleted} onChange={(e) => setMarkCompleted(e.target.checked)} /> Ustaw status w
                deklaracji na <strong>completed</strong>
              </label>

              <button
                onClick={saveMyResult}
                disabled={!userId || savingResult}
                style={{ padding: 12, borderRadius: 12 }}
              >
                {savingResult ? "Zapisuję…" : myResultId ? "Zaktualizuj wynik" : "Zapisz wynik"}
              </button>

              {resultMsg && <p style={{ margin: 0 }}>{resultMsg}</p>}
            </div>
          </section>

          {/* Uczestnicy */}
          <section style={{ marginTop: 18 }}>
            <h2>Uczestnicy ({participants.filter((p) => p.wants_to_participate).length})</h2>

            <div style={{ display: "grid", gap: 10 }}>
              {participants
                .filter((p) => p.wants_to_participate)
                .map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: 12,
                      padding: 10,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <a href={`/runners/${p.user_id}`} style={{ textDecoration: "none" }}>
                      <strong style={{ color: "#111" }}>{p.profiles?.display_name ?? "Runner"}</strong>
                      <span style={{ marginLeft: 10, color: "#666" }}>{p.profiles?.team}</span>
                    </a>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span
                        title="status"
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          border: "1px solid #ddd",
                          color: "#555",
                          fontSize: 12,
                        }}
                      >
                        {String(p.status ?? "planned")}
                      </span>

                      <div
                        title={p.profiles?.display_name ?? "Runner"}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: "#f2f2f2",
                          border: "1px solid #ddd",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontWeight: 800,
                          color: "#333",
                        }}
                      >
                        {initials(p.profiles?.display_name ?? "Runner")}
                      </div>
                    </div>
                  </div>
                ))}

              {participants.filter((p) => p.wants_to_participate).length === 0 && <p style={{ color: "#777" }}>Brak zadeklarowanych.</p>}
            </div>
          </section>

          {/* Wyniki */}
          <section style={{ marginTop: 18 }}>
            <h2>Wyniki (czas)</h2>
            {raceResults.length === 0 && <p style={{ color: "#777" }}>Brak wyników. Po biegu każdy może dodać swój czas, zdjęcie i notatki.</p>}

            <div style={{ display: "grid", gap: 10 }}>
              {raceResults.slice(0, 20).map((r: any, idx: number) => (
                <div
                  key={r.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    padding: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 900 }}>
                      #{idx + 1}{" "}
                      <a href={`/runners/${r.user_id}`} style={{ textDecoration: "none" }}>
                        {r.profiles?.display_name ?? "Runner"}
                      </a>{" "}
                      <span style={{ color: "#777" }}>({r.profiles?.team ?? "—"})</span>
                    </div>
                    {r.notes && <div style={{ color: "#555", marginTop: 4 }}>{r.notes}</div>}
                    {r.photo_url && (
                      <div style={{ marginTop: 4 }}>
                        <a href={r.photo_url} target="_blank" rel="noreferrer">
                          zdjęcie ↗
                        </a>
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#777", fontSize: 12 }}>czas</div>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>{fmtTime(r.time_seconds)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
