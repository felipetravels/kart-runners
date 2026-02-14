"use client";

import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";

type Race = {
  id: number;
  title: string;
  race_date: string;
  city: string | null;
  country: string | null;
  signup_url: string | null;
  description: string | null;
};

export default function AdminRacePanel({
  race,
  onChanged,
}: {
  race: Race;
  onChanged: () => void;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [title, setTitle] = useState(race.title ?? "");
  const [raceDate, setRaceDate] = useState(race.race_date ?? "");
  const [city, setCity] = useState(race.city ?? "");
  const [country, setCountry] = useState(race.country ?? "");
  const [signupUrl, setSignupUrl] = useState(race.signup_url ?? "");
  const [description, setDescription] = useState(race.description ?? "");

  useEffect(() => {
    (async () => {
      setLoadingRole(true);
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) {
        setIsAdmin(false);
        setLoadingRole(false);
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", uid)
        .single();

      setIsAdmin(prof?.role === "admin");
      setLoadingRole(false);
    })();
  }, [race.id]);

  async function save() {
    setMsg(null);
    setSaving(true);

    const payload = {
      title: title.trim(),
      race_date: raceDate,
      city: city.trim() || null,
      country: country.trim() || null,
      signup_url: signupUrl.trim() || null,
      description: description.trim() || null,
    };

    const { error } = await supabase.from("races").update(payload).eq("id", race.id);

    setSaving(false);

    if (error) {
      setMsg(`Błąd zapisu: ${error.message}`);
      return;
    }

    // Dodanie logu audytowego
    await supabase.from("audit_log").insert({
      action: "update",
      entity: "races",
      entity_id: String(race.id),
      details: payload,
      actor_id: (await supabase.auth.getUser()).data.user?.id ?? null,
    });

    setMsg("Zapisano ✅");
    onChanged();
  }

  async function softDelete() {
    if (!confirm("Na pewno usunąć bieg? (Zostanie on ukryty na stronie)")) return;

    setMsg(null);
    setSaving(true);

    const { data: u } = await supabase.auth.getUser();
    const uid = u.user?.id ?? null;

    const { error } = await supabase
      .from("races")
      .update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: uid })
      .eq("id", race.id);

    setSaving(false);

    if (error) {
      setMsg(`Błąd usuwania: ${error.message}`);
      return;
    }

    await supabase.from("audit_log").insert({
      action: "soft_delete",
      entity: "races",
      entity_id: String(race.id),
      details: { is_deleted: true },
      actor_id: uid,
    });

    window.location.href = "/";
  }

  if (loadingRole) return null;
  if (!isAdmin) return null;

  return (
    <section style={{ marginTop: 24, border: "1px solid rgba(255,255,255,0.2)", borderRadius: 14, padding: 20, backgroundColor: "rgba(255,255,255,0.05)" }}>
      <h2 style={{ marginTop: 0, color: "#ffcc00" }}>Admin: edycja biegu</h2>

      <div style={{ display: "grid", gap: 15 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Tytuł
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #444", background: "#222", color: "#fff" }} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Data
          <input type="date" value={raceDate} onChange={(e) => setRaceDate(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #444", background: "#222", color: "#fff" }} />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            Miasto
            <input value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #444", background: "#222", color: "#fff" }} />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            Kraj
            <input value={country} onChange={(e) => setCountry(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #444", background: "#222", color: "#fff" }} />
          </label>
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          Link do zapisów
          <input value={signupUrl} onChange={(e) => setSignupUrl(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #444", background: "#222", color: "#fff" }} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Opis
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ padding: 10, borderRadius: 10, border: "1px solid #444", background: "#222", color: "#fff" }} />
        </label>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <button 
            onClick={save} 
            disabled={saving} 
            style={{ padding: "10px 20px", borderRadius: 12, backgroundColor: "#00d4ff", color: "#000", fontWeight: "bold", border: "none", cursor: "pointer" }}
          >
            {saving ? "..." : "Zapisz zmiany"}
          </button>

          <button 
            onClick={softDelete} 
            disabled={saving} 
            style={{ padding: "10px 20px", borderRadius: 12, backgroundColor: "transparent", color: "crimson", border: "1px solid crimson", fontWeight: "bold", cursor: "pointer" }}
          >
            Usuń bieg (ukryj)
          </button>
        </div>

        {msg && <p style={{ margin: 0, fontWeight: "bold", color: msg.startsWith("Błąd") ? "crimson" : "#00ff00" }}>{msg}</p>}
      </div>
    </section>
  );
}
