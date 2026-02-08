"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";

type Team = "" | "KART" | "KART light";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [team, setTeam] = useState<Team>("");
  const [teamChangedAt, setTeamChangedAt] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();

  const canChangeTeam = useMemo(() => {
    if (!teamChangedAt) return true;
    const d = new Date(teamChangedAt);
    return d.getFullYear() !== currentYear;
  }, [teamChangedAt, currentYear]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg(null);

      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id ?? null;

      setUserId(uid);
      setEmail(u.user?.email ?? null);

      if (!uid) {
        setLoading(false);
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name, team, team_changed_at")
        .eq("id", uid)
        .single();

      setDisplayName(prof?.display_name ?? "");
      setTeam((prof?.team ?? "") as Team);
      setTeamChangedAt(prof?.team_changed_at ?? null);

      setLoading(false);
    })();
  }, []);

  async function saveProfile() {
    setMsg(null);

    if (!userId) {
      setMsg("Musisz być zalogowany.");
      return;
    }

    if (!displayName.trim()) {
      setMsg("Ustaw nazwę (display name).");
      return;
    }

    // jeśli team zmieniany, a nie wolno w tym roku -> blokada
    // (porównujemy z tym, co jest już w bazie: teamChangedAt)
    // Prosto: jeśli teamChangedAt jest w tym roku i user chce zmienić team, blokujemy.
    // Jeśli teamChangedAt jest null albo z innego roku, pozwalamy i ustawiamy team_changed_at=now() jeśli team się zmieni.
    const { data: existing } = await supabase
      .from("profiles")
      .select("team, team_changed_at")
      .eq("id", userId)
      .single();

    const oldTeam = (existing?.team ?? "") as Team;
    const oldChangedAt = existing?.team_changed_at ? new Date(existing.team_changed_at) : null;

    const changingTeam = oldTeam !== team && team !== "";

    if (changingTeam && oldChangedAt && oldChangedAt.getFullYear() === currentYear) {
      setMsg("Zmiana drużyny możliwa tylko raz w roku kalendarzowym.");
      return;
    }

    const payload: any = {
      display_name: displayName.trim(),
      team: team || null,
    };

    if (changingTeam) {
      payload.team_changed_at = new Date().toISOString();
    }

    const { error } = await supabase.from("profiles").update(payload).eq("id", userId);

    if (error) {
      setMsg(`Błąd zapisu: ${error.message}`);
      return;
    }

    setTeamChangedAt(payload.team_changed_at ?? teamChangedAt);
    setMsg("Zapisano ✅");
  }

  if (loading) {
    return (
      <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
        Ładowanie…
      </main>
    );
  }

  if (!userId) {
    return (
      <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
        <h1>Dashboard</h1>
        <p>Musisz być zalogowany.</p>
        <a href="/login">Zaloguj się</a>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <a href="/" style={{ display: "inline-block", marginBottom: 14 }}>← Wróć</a>

      <h1 style={{ marginTop: 0 }}>Ustawienia profilu</h1>
      <p style={{ color: "#555" }}>Email: <strong>{email}</strong></p>

      <section style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Twoje imię / ksywa (display name)
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
            placeholder="np. Filip"
          />
        </label>

        <div style={{ height: 10 }} />

        <label style={{ display: "grid", gap: 6 }}>
          Drużyna
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value as Team)}
            disabled={!canChangeTeam}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          >
            <option value="">(wybierz)</option>
            <option value="KART">KART</option>
            <option value="KART light">KART light</option>
          </select>
        </label>

        <p style={{ color: "#555", marginTop: 10 }}>
          Zmiana drużyny: {canChangeTeam ? "możliwa" : "zablokowana do końca roku"}.
        </p>

        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={saveProfile} style={{ padding: "10px 12px", borderRadius: 12 }}>
            Zapisz
          </button>

          <a href="/" style={{ alignSelf: "center" }}>Wróć na listę biegów</a>
        </div>

        {msg && <p style={{ marginTop: 12, color: msg.startsWith("Błąd") ? "crimson" : "green" }}>{msg}</p>}
      </section>
    </main>
  );
}
