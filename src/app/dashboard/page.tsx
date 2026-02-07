"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // formularz dodawania biegu
  const [title, setTitle] = useState("");
  const [raceDate, setRaceDate] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [signupUrl, setSignupUrl] = useState("");
  const [description, setDescription] = useState("");

  // dystanse (warianty)
  const [opt1Label, setOpt1Label] = useState("5 km");
  const [opt1Km, setOpt1Km] = useState("5");
  const [opt2Label, setOpt2Label] = useState("10.5 km");
  const [opt2Km, setOpt2Km] = useState("10.5");

  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
      setLoadingUser(false);
    })();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function toNumberKm(s: string) {
    const normalized = s.replace(",", ".").trim();
    const n = Number(normalized);
    return Number.isFinite(n) ? n : NaN;
  }

  async function addRace(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!userId) {
      setMsg("Musisz być zalogowany.");
      return;
    }

    if (!title.trim()) {
      setMsg("Podaj nazwę biegu.");
      return;
    }

    if (!raceDate) {
      setMsg("Podaj datę biegu.");
      return;
    }

    setBusy(true);
    try {
      // 1) dodaj bieg
      const { data: raceRow, error: raceErr } = await supabase
        .from("races")
        .insert({
          title: title.trim(),
          race_date: raceDate,
          city: city.trim() || null,
          country: country.trim() || null,
          signup_url: signupUrl.trim() || null,
          description: description.trim() || null,
          created_by: userId,
        })
        .select("id")
        .single();

      if (raceErr) {
        setMsg("Błąd dodawania biegu: " + raceErr.message);
        return;
      }

      const raceId = raceRow.id as number;

      // 2) dodaj dystanse (warianty)
      const d1 = toNumberKm(opt1Km);
      const d2 = toNumberKm(opt2Km);

      const opts = [
        {
          race_id: raceId,
          label: opt1Label.trim(),
          distance_km: d1,
          sort_order: 1,
        },
        {
          race_id: raceId,
          label: opt2Label.trim(),
          distance_km: d2,
          sort_order: 2,
        },
      ].filter((o) => o.label && Number.isFinite(o.distance_km) && o.distance_km > 0);

      if (opts.length > 0) {
        const { error: optErr } = await supabase.from("race_options").insert(opts);
        if (optErr) {
          setMsg("Bieg dodany, ale błąd dodawania dystansów: " + optErr.message);
          return;
        }
      }

      // wyczyść formularz
      setTitle("");
      setRaceDate("");
      setCity("");
      setCountry("");
      setSignupUrl("");
      setDescription("");

      setMsg(`Dodano bieg ✅ (id=${raceId})`);

      // przejście od razu do szczegółów biegu
      window.location.href = `/races/${raceId}`;
    } finally {
      setBusy(false);
    }
  }

  if (loadingUser) {
    return <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>Ładowanie…</main>;
  }

  if (!userId) {
    return (
      <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
        <h1>Panel</h1>
        <p>Tu wpuszczamy tylko zalogowanych.</p>
        <a href="/login">Zaloguj się</a>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <h1 style={{ margin: 0 }}>Panel KART</h1>
          <p style={{ marginTop: 8, color: "#555" }}>Dodawanie biegów i zarządzanie.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="/">Strona</a>
          <button onClick={logout}>Wyloguj</button>
        </div>
      </header>

      <section style={{ marginTop: 18, border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
        <h2 style={{ marginTop: 0 }}>Dodaj bieg</h2>

        <form onSubmit={addRace} style={{ display: "grid", gap: 10 }}>
          <label>
            Nazwa biegu
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: "100%", padding: 10 }}
              placeholder="np. Bieg Walentynkowy"
            />
          </label>

          <label>
            Data
            <input
              type="date"
              value={raceDate}
              onChange={(e) => setRaceDate(e.target.value)}
              required
              style={{ width: "100%", padding: 10 }}
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label>
              Miasto
              <input value={city} onChange={(e) => setCity(e.target.value)} style={{ width: "100%", padding: 10 }} />
            </label>
            <label>
              Kraj
              <input value={country} onChange={(e) => setCountry(e.target.value)} style={{ width: "100%", padding: 10 }} />
            </label>
          </div>

          <label>
            Link do zapisów
            <input value={signupUrl} onChange={(e) => setSignupUrl(e.target.value)} style={{ width: "100%", padding: 10 }} />
          </label>

          <label>
            Opis
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ width: "100%", padding: 10 }} />
          </label>

          <div style={{ borderTop: "1px dashed #ddd", paddingTop: 10 }}>
            <strong>Warianty dystansu</strong>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              <label>
                Dystans 1 (label)
                <input value={opt1Label} onChange={(e) => setOpt1Label(e.target.value)} style={{ width: "100%", padding: 10 }} />
              </label>
              <label>
                Dystans 1 (km)
                <input value={opt1Km} onChange={(e) => setOpt1Km(e.target.value)} style={{ width: "100%", padding: 10 }} />
              </label>

              <label>
                Dystans 2 (label)
                <input value={opt2Label} onChange={(e) => setOpt2Label(e.target.value)} style={{ width: "100%", padding: 10 }} />
              </label>
              <label>
                Dystans 2 (km)
                <input value={opt2Km} onChange={(e) => setOpt2Km(e.target.value)} style={{ width: "100%", padding: 10 }} />
              </label>
            </div>
          </div>

          <button type="submit" disabled={busy} style={{ padding: 12, borderRadius: 12 }}>
            {busy ? "Dodaję…" : "Dodaj bieg"}
          </button>

          {msg && <p style={{ margin: 0, color: msg.startsWith("Błąd") ? "crimson" : "green" }}>{msg}</p>}
        </form>
      </section>
    </main>
  );
}
