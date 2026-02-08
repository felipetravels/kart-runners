"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";

type Option = {
  id: number;
  label: string;
  distance_km: number;
};

function parseTimeToSeconds(input: string): number | null {
  const s = input.trim();
  if (!s) return null;

  // jeśli ktoś wpisze same sekundy np 2800
  if (/^\d+$/.test(s)) {
    const v = Number(s);
    return Number.isFinite(v) && v > 0 ? v : null;
  }

  const parts = s.split(":").map((p) => p.trim());
  if (parts.length === 2) {
    const mm = Number(parts[0]);
    const ss = Number(parts[1]);
    if (!Number.isFinite(mm) || !Number.isFinite(ss)) return null;
    if (mm < 0 || ss < 0 || ss >= 60) return null;
    return mm * 60 + ss;
  }

  if (parts.length === 3) {
    const hh = Number(parts[0]);
    const mm = Number(parts[1]);
    const ss = Number(parts[2]);
    if (!Number.isFinite(hh) || !Number.isFinite(mm) || !Number.isFinite(ss)) return null;
    if (hh < 0 || mm < 0 || ss < 0 || mm >= 60 || ss >= 60) return null;
    return hh * 3600 + mm * 60 + ss;
  }

  return null;
}

function fmtTime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function RaceMyResult({
  raceId,
  options,
}: {
  raceId: number;
  options: Option[];
}) {
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);

  const [optionId, setOptionId] = useState<number | "">("");
  const [timeStr, setTimeStr] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const [existingSeconds, setExistingSeconds] = useState<number | null>(null);

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const seconds = useMemo(() => parseTimeToSeconds(timeStr), [timeStr]);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data, error } = await supabase.auth.getUser();

      if (error) {
        setUid(null);
        setLoading(false);
        return;
      }

      setUid(data.user?.id ?? null);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setErr(null);
      setMsg(null);

      if (!uid) return;
      if (optionId === "") return;

      const { data, error } = await supabase
        .from("race_results")
        .select("finish_time_seconds,note")
        .eq("user_id", uid)
        .eq("race_id", raceId)
        .eq("option_id", optionId)
        .maybeSingle();

      if (error) {
        setErr(error.message);
        return;
      }

      if (!data) {
        setExistingSeconds(null);
        setTimeStr("");
        setNote("");
        return;
      }

      setExistingSeconds(data.finish_time_seconds ?? null);

      if (data.finish_time_seconds) {
        setTimeStr(fmtTime(data.finish_time_seconds));
      } else {
        setTimeStr("");
      }

      setNote(data.note ?? "");
    })();
  }, [uid, optionId, raceId]);

  async function save() {
    setErr(null);
    setMsg(null);

    if (!uid) return setErr("Zaloguj się, żeby dodać wynik.");
    if (optionId === "") return setErr("Wybierz dystans.");
    if (!seconds) return setErr("Wpisz czas w formacie MM:SS lub HH:MM:SS (np. 47:12).");

    const payload = {
      user_id: uid,
      race_id: raceId,
      option_id: optionId,
      finish_time_seconds: seconds,
      note: note.trim() ? note.trim() : null,
    };

    const { error } = await supabase
      .from("race_results")
      .upsert(payload, { onConflict: "user_id,race_id,option_id" });

    if (error) return setErr(error.message);

    setMsg("Zapisano wynik.");
  }

  if (loading) {
    return (
      <section style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Mój wynik</h2>
        <div>Ładowanie…</div>
      </section>
    );
  }

  return (
    <section style={{ marginTop: 16 }}>
      <h2 style={{ marginTop: 0 }}>Mój wynik</h2>

      {!uid ? (
        <div style={{ opacity: 0.85 }}>
          Zaloguj się, żeby dodać swój czas po biegu. <a href="/login">Logowanie</a>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
          <label>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Dystans</div>
            <select
              value={optionId}
              onChange={(e) => setOptionId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">(wybierz)</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label} ({Number(o.distance_km)} km)
                </option>
              ))}
            </select>
          </label>

          <label>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Czas (MM:SS lub HH:MM:SS)</div>
            <input
              placeholder="np. 47:12"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
            />
            {seconds ? (
              <div style={{ opacity: 0.8, marginTop: 6 }}>
                Rozpoznano: <strong>{fmtTime(seconds)}</strong>
              </div>
            ) : (
              <div style={{ opacity: 0.7, marginTop: 6 }}>
                Przykład: 5 km w 24:30, 10 km w 49:10
              </div>
            )}
          </label>

          <label>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Notatka (opcjonalnie)</div>
            <input
              placeholder="np. PB / trudna trasa / wiatr"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <button onClick={save}>{existingSeconds ? "Zapisz zmiany" : "Dodaj wynik"}</button>

          {existingSeconds !== null && (
            <div style={{ opacity: 0.85 }}>
              Aktualnie zapisany czas: <strong>{fmtTime(existingSeconds)}</strong>
            </div>
          )}

          {msg && <div style={{ color: "var(--success)" }}>{msg}</div>}
          {err && <div style={{ color: "crimson" }}>{err}</div>}
        </div>
      )}
    </section>
  );
}
