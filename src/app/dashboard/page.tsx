"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type Team = "KART" | "KART light";

function isTeam(v: any): v is Team {
  return v === "KART" || v === "KART light";
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState<string>("Runner");
  const [team, setTeam] = useState<Team>("KART");

  // bieg
  const [title, setTitle] = useState("");
  const [raceDate, setRaceDate] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [signupUrl, setSignupUrl] = useState("");
  const [description, setDescription] = useState("");

  // opcje dystansu (min. 1)
  const [opt1Label, setOpt1Label] = useState("5 km");
  const [opt1Dist, setOpt1Dist] = useState("5");
  const [opt2Label, setOpt2Label] = useState("10.5 km");
  const [opt2Dist, setOpt2Dist] = useState("10.5");

  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;

      setUserId(uid);

      if (!uid) {
        setLoading(false);
        return;
      }

      const { data: prof, error } = await supabase
        .from("profiles")
        .select("display_name, team")
        .eq("id", uid)
        .single();

      if (!error && prof) {
        setDisplayName(prof.display_name ?? "Runner");
        if (isTeam(prof.team)) setTeam(prof.team);
      }

      setLoading(false);
    })();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function updateTeam(newTeam: Team) {
    if (!userId) return;
    setTeam(newTeam);
    await supabase.from("profiles").update({ team: newTeam }).eq("id", userId);
    setMsg(`Ustawiono drużynę: ${newTeam}`);
  }

  async function addRace(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!userId) {
      setMsg("Musisz być zalogowany.");
      return;
    }

    const d1 = Number(opt1Dist.replace(",", "."));
    if (!Number.isFinite(d1) || d1 <= 0) {
      setMsg("Opcja 1: dystans musi być > 0.");
      return;
    }

    const hasOpt2 = opt2Label.trim().length > 0 && opt2Dist.trim().length > 0;
    const d2 = hasOpt2 ? Number(opt2Dist.replace(",", ".")) : null;
    if (hasOpt2 && (!Number.isFinite(d2!) || d2! <= 0)) {
      setMsg("Opcja 2: dystans musi być > 0.");
      return;
    }

    // 1) dodaj bieg i weź id
    const { data: raceRows, error: raceErr } = await supabase
      .from("races")
      .insert({
        title,
        race_date: raceDate,
        city: city || null,
        country: country || null,
        signup_url: signupUrl || null,
        description: description || null,
        created_by: userId,
      })
      .select("id")
      .limit(1);

    if (raceErr || !raceRows?.[0]?.id) {
      setMsg(`Błąd dodawania biegu: ${raceErr?.message ?? "unknown"}`);
      return;
    }

    const raceId = raceRows[0].id as number;

    // 2) dodaj opcje dystansu
    const optionsPayload: any[] = [
      { race_id: raceId, label: opt1Label.trim(), distance_km: d1, sort_order: 1 },
    ];

    if (hasOpt2) {
      optionsPayload.push({
        race_id: raceId,
        label: opt2Label.trim(),
        distance_km: d2!,
        sort_order: 2,
      });
    }

    const { error: optErr } = await supabase.from("race_options").insert(optionsPayload);

    if (optErr) {
      setMsg(`Bieg dodany, ale opcje dystansu nie: ${optErr.message}`);
      return;
    }

    // 3) opcjonalnie: automatycznie zadeklaruj dodającego jako uczestnika (wants_to_participate = true)
    // Domyślnie wpiszemy go jako "planned" i wybór dystansu = opcja 1
    // Najpierw pobierz id opcji 1:
    const { data: opt1Row } = await supabase
      .from("race_options")
      .select("id")
      .eq("race_id", raceId)
      .order("sort_order", { ascending: true })
      .limit(1);

    const opt1Id = opt1Row?.[0]?.id ?? null;

    await supabase.from("participations").upsert({
      user_id: userId,
      race_id: raceId,
      option_id: opt1Id,
      status: "planned",
      wants_to_participate: true,
      registered: false,
      paid: false,
    });

    setTitle("");
    setRaceDate("");
    setCity("");
    setCountry("");
    setSignupUrl("");
    setDescription("");
    setMsg("Dodano bieg ✅ (i automatycznie dopisano Cię jako uczestnika)");
  }

  if (loading) {
    return <main style={{ maxWidth: 820, margin: "40px auto", padding: 16 }}>Ładowanie…</main>;
  }

  if (!userId) {
    return (
      <main style={{ maxWidth: 820, margin: "40px auto", padding: 16 }}>
        <h1>Dodaj bieg</h1>
        <p>Musisz być zalogowany.</p>
        <a href="/login">Zaloguj się</a>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 920, margin: "40px auto", padding: 16 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Dodaj bieg</h1>
          <p style={{ marginTop: 8, color: "#555" }}>
            Tu dodajesz nowe biegi. Strona główna pokaże je od razu.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700 }}>Cześć, {displayName}</div>
            <div style={{ fontSize: 12, color: "#666" }}>Zalogowany</div>
          </div>
          <button onClick={logout} style={{ padding: "10px 12px", borderRadius: 12 }}>
            Wyloguj
          </button>
        </div>
      </header>

      <section style={{ marginTop: 12, border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <strong>Twoja drużyna:</strong>

          <button
            onClick={() => updateTeam("KART")}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid #ddd",
              fontWeight: team === "KART" ? 700 : 400,
            }}
          >
            KART
          </button>

          <button
            onClick={() => updateTeam("KART light")}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid #ddd",
              fontWeight: team === "KART light" ? 700 : 400,
            }}
          >
            KART light
          </button>

          <a href="/" style={{ marginLeft: "auto" }}>
            Wróć na stronę
          </a>
        </div>
      </section>

      <section style={{ marginTop: 18, border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
        <form onSubmit={addRace} style={{ display: "grid", gap: 10 }}>
          <label>
            Nazwa biegu
            <input value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: "100%", padding: 10, marginTop: 6 }} />
          </label>

          <label>
            Data
            <input type="date" value={raceDate} onChange={(e) => setRaceDate(e.target.value)} required style={{ width: "100%", padding: 10, marginTop: 6 }} />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label>
              Miasto
              <input value={city} onChange={(e) => setCity(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }} />
            </label>
            <label>
              Kraj
              <input value={country} onChange={(e) => setCountry(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }} />
            </label>
          </div>

          <label>
            Link do zapisów
            <input value={signupUrl} onChange={(e) => setSignupUrl(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6 }} />
          </label>

          <label>
            Opis (opcjonalnie)
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ width: "100%", padding: 10, marginTop: 6 }} />
          </label>

          <div style={{ borderTop: "1px solid #eee", paddingTop: 10 }}>
            <strong>Warianty dystansu</strong>
            <p style={{ marginTop: 6, color: "#555" }}>
              Minimum jedna opcja. Druga opcja jest opcjonalna (np. 5 km i 10.5 km).
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 10 }}>
              <input value={opt1Label} onChange={(e) => setOpt1Label(e.target.value)} placeholder="np. 5 km" style={{ padding: 10 }} />
              <input value={opt1Dist} onChange={(e) => setOpt1Dist(e.target.value)} placeholder="5" style={{ padding: 10 }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 10, marginTop: 10 }}>
              <input value={opt2Label} onChange={(e) => setOpt2Label(e.target.value)} placeholder="np. 10.5 km" style={{ padding: 10 }} />
              <input value={opt2Dist} onChange={(e) => setOpt2Dist(e.target.value)} placeholder="10.5" style={{ padding: 10 }} />
            </div>
          </div>

          <button type="submit" style={{ padding: 12, borderRadius: 12 }}>
            Dodaj bieg
          </button>

          {msg && <p style={{ margin: 0, color: msg.startsWith("Błąd") ? "crimson" : "#2b7" }}>{msg}</p>}
        </form>
      </section>
    </main>
  );
}
