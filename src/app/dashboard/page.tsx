"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useRef, useState } from "react";

type Suggestion = {
  id: number;
  title: string;
  race_date: string;
  city: string | null;
  country: string | null;
};

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

function norm(s: string) {
  return s.trim().toLowerCase();
}

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);

  // formularz dodania biegu
  const [title, setTitle] = useState("");
  const [raceDate, setRaceDate] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [signupUrl, setSignupUrl] = useState("");

  // dystanse (2 opcje jak u Ciebie)
  const [opt1Label, setOpt1Label] = useState("5 km");
  const [opt1Km, setOpt1Km] = useState("5");
  const [opt2Label, setOpt2Label] = useState("10.5 km");
  const [opt2Km, setOpt2Km] = useState("10.5");

  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // autocomplete
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggLoading, setSuggLoading] = useState(false);
  const [suggErr, setSuggErr] = useState<string | null>(null);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    })();
  }, []);

  // sugestie na podstawie tytułu
  useEffect(() => {
    const q = query.trim();
    setSuggErr(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.length < 2) {
      setSuggestions([]);
      setSuggLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setSuggLoading(true);
        const { data, error } = await supabase
          .from("races")
          .select("id,title,race_date,city,country")
          .ilike("title", `%${q}%`)
          .order("race_date", { ascending: false })
          .limit(6);

        if (error) throw new Error(error.message);
        setSuggestions((data ?? []) as any);
      } catch (e: any) {
        setSuggErr(e?.message ?? "Błąd sugestii");
      } finally {
        setSuggLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const dupCandidate = useMemo(() => {
    // jeżeli tytuł + data są identyczne z sugestią
    const t = norm(title);
    const d = raceDate.trim();
    if (!t || !d) return null;

    return suggestions.find((s) => norm(s.title) === t && s.race_date === d) ?? null;
  }, [title, raceDate, suggestions]);

  async function addRace() {
    setMsg(null);

    if (!userId) {
      setMsg("Musisz być zalogowany, żeby dodawać biegi.");
      return;
    }

    if (!title.trim() || !raceDate.trim()) {
      setMsg("Podaj nazwę i datę biegu.");
      return;
    }

    // blokada duplikatu
    if (dupCandidate) {
      setMsg(`Ten bieg już istnieje: "${dupCandidate.title}" (${fmtDate(dupCandidate.race_date)}). Kliknij w sugestię.`);
      return;
    }

    setBusy(true);
    try {
      // 1) utwórz bieg
      const { data: inserted, error: insErr } = await supabase
        .from("races")
        .insert({
          title: title.trim(),
          race_date: raceDate,
          city: city.trim() || null,
          country: country.trim() || null,
          signup_url: signupUrl.trim() || null,
        })
        .select("id")
        .maybeSingle();

      if (insErr) throw new Error("Dodanie biegu: " + insErr.message);

      const newId = (inserted as any)?.id as number | undefined;
      if (!newId) throw new Error("Nie udało się odczytać id nowego biegu.");

      // 2) opcje dystansów (jeśli podane)
      const opts: any[] = [];

      const km1 = Number(opt1Km);
      if (opt1Label.trim() && Number.isFinite(km1) && km1 > 0) {
        opts.push({ race_id: newId, label: opt1Label.trim(), distance_km: km1, sort_order: 1 });
      }

      const km2 = Number(opt2Km);
      if (opt2Label.trim() && Number.isFinite(km2) && km2 > 0) {
        opts.push({ race_id: newId, label: opt2Label.trim(), distance_km: km2, sort_order: 2 });
      }

      if (opts.length > 0) {
        const { error: optErr } = await supabase.from("race_options").insert(opts);
        if (optErr) throw new Error("Dystanse: " + optErr.message);
      }

      setMsg(`Dodano bieg ✅ (id=${newId})`);
      window.location.href = `/races/${newId}`;
    } catch (e: any) {
      setMsg(e?.message ?? "Błąd dodawania");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <a href="/">← Powrót</a>
      <h1 style={{ marginTop: 12 }}>Panel</h1>

      {!userId && (
        <div style={{ padding: 12, border: "1px solid #ffd2d2", borderRadius: 12, background: "#fff5f5", color: "#a10000" }}>
          Musisz się zalogować, żeby dodawać biegi. <a href="/login">Logowanie</a>
        </div>
      )}

      <section style={{ marginTop: 16, border: "1px solid #eee", borderRadius: 16, padding: 14 }}>
        <h2 style={{ marginTop: 0 }}>Dodaj bieg</h2>

        <label style={{ display: "block", marginTop: 10 }}>
          Nazwa biegu
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setQuery(e.target.value); // ten sam string do wyszukiwania
            }}
            placeholder='np. "Bieg Walentynkowy"'
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>

        {/* Sugestie */}
        <div style={{ marginTop: 8 }}>
          {suggLoading && <div style={{ color: "#666" }}>Szukam podobnych…</div>}
          {suggErr && <div style={{ color: "crimson" }}>Błąd sugestii: {suggErr}</div>}

          {suggestions.length > 0 && (
            <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
              {suggestions.map((s) => (
                <a
                  key={s.id}
                  href={`/races/${s.id}`}
                  style={{
                    display: "block",
                    padding: 10,
                    textDecoration: "none",
                    color: "#111",
                    borderTop: "1px solid #f2f2f2",
                    background: dupCandidate?.id === s.id ? "#fff7db" : "white",
                  }}
                  title="Kliknij, żeby przejść do istniejącego biegu"
                >
                  <strong>{s.title}</strong>{" "}
                  <span style={{ color: "#666" }}>
                    · {s.race_date ? fmtDate(s.race_date) : "?"} · {[s.city, s.country].filter(Boolean).join(", ")}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr", marginTop: 10 }}>
          <label>
            Data
            <input value={raceDate} onChange={(e) => setRaceDate(e.target.value)} type="date" style={{ width: "100%", padding: 10, marginTop: 6 }} />
          </label>

          <label>
            Link do zapisów
            <input value={signupUrl} onChange={(e) => setSignupUrl(e.target.value)} placeholder="opcjonalnie" style={{ width: "100%", padding: 10, marginTop: 6 }} />
          </label>

          <label>
            Miasto
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="np. Kraków" style={{ width: "100%", padding: 10, marginTop: 6 }} />
          </label>

          <label>
            Kraj
            <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="np. PL" style={{ width: "100%", padding: 10, marginTop: 6 }} />
          </label>
        </div>

        <h3 style={{ marginTop: 16 }}>Dystanse (2 opcje)</h3>

        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "2fr 1fr", marginTop: 6 }}>
          <label>
            Dystans 1 (label)
            <input value={opt1Label} onChange={(e) => setOpt1Label(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }} />
          </label>
          <label>
            km
            <input value={opt1Km} onChange={(e) => setOpt1Km(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }} />
          </label>

          <label>
            Dystans 2 (label)
            <input value={opt2Label} onChange={(e) => setOpt2Label(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }} />
          </label>
          <label>
            km
            <input value={opt2Km} onChange={(e) => setOpt2Km(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }} />
          </label>
        </div>

        <button
          onClick={addRace}
          disabled={!userId || busy}
          style={{ marginTop: 14, padding: 12, borderRadius: 12, fontWeight: 900, cursor: "pointer" }}
          title={!userId ? "Zaloguj się" : ""}
        >
          {busy ? "Dodaję…" : "Dodaj bieg"}
        </button>

        {msg && <p style={{ marginTop: 10, color: msg.startsWith("Błąd") ? "crimson" : "#111" }}>{msg}</p>}
      </section>
    </main>
  );
}
