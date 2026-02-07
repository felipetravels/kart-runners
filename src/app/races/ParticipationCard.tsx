"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Option = {
  id: number;
  label: string;
  distance_km: number;
  sort_order: number | null;
};

type ParticipationRow = {
  user_id: string;
  race_id: number;
  option_id: number | null;
  status: "planned" | "maybe" | "completed";
  wants_to_participate: boolean;
  registered: boolean;
  paid: boolean;
};

export default function ParticipationCard({
  raceId,
  options,
}: {
  raceId: number;
  options: Option[];
}) {
  const router = useRouter();

  const sortedOptions = useMemo(
    () => (options ?? []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [options]
  );

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  const [optionId, setOptionId] = useState<number | "">("");
  const [status, setStatus] = useState<"planned" | "maybe" | "completed">("planned");
  const [wants, setWants] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [paid, setPaid] = useState(false);

  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg(null);

      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id ?? null;
      setUserId(uid);

      if (!uid) {
        setLoading(false);
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", uid)
        .single();

      setDisplayName(prof?.display_name ?? null);

      const { data: part } = await supabase
        .from("participations")
        .select("user_id,race_id,option_id,status,wants_to_participate,registered,paid")
        .eq("user_id", uid)
        .eq("race_id", raceId)
        .maybeSingle();

      if (part) {
        const p = part as ParticipationRow;
        setStatus(p.status ?? "planned");
        setWants(p.wants_to_participate ?? true);
        setRegistered(p.registered ?? false);
        setPaid(p.paid ?? false);
        setOptionId(p.option_id ?? "");
      } else {
        setOptionId(sortedOptions[0]?.id ?? "");
      }

      setLoading(false);
    })();
  }, [raceId, sortedOptions]);

  async function save() {
    setMsg(null);

    if (!userId) {
      setMsg("Musisz być zalogowany.");
      return;
    }

    setSaving(true);

    const payload = {
      user_id: userId,
      race_id: raceId,
      option_id: optionId === "" ? null : optionId,
      status,
      wants_to_participate: wants,
      registered,
      paid,
    };

    const { error } = await supabase.from("participations").upsert(payload);

    setSaving(false);

    if (error) {
      setMsg(`Błąd zapisu: ${error.message}`);
      return;
    }

    setMsg("Zapisano ✅");
    router.refresh();
  }

  if (loading) {
    return (
      <section style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
        Ładowanie Twojego udziału…
      </section>
    );
  }

  if (!userId) {
    return (
      <section style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
        <h2 style={{ marginTop: 0 }}>Mój udział</h2>
        <p style={{ color: "#555" }}>Żeby się dopisać i zaznaczać checkboxy, musisz się zalogować.</p>
        <a href="/login">Zaloguj się</a>
      </section>
    );
  }

  return (
    <section style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>Mój udział</h2>
          <div style={{ color: "#555" }}>Cześć{displayName ? `, ${displayName}` : ""}.</div>
        </div>

        <button onClick={save} disabled={saving} style={{ padding: "10px 12px", borderRadius: 12 }}>
          {saving ? "Zapisuję…" : "Zapisz"}
        </button>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Wybór dystansu
          <select
            value={optionId}
            onChange={(e) => setOptionId(e.target.value === "" ? "" : Number(e.target.value))}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          >
            {sortedOptions.length === 0 ? (
              <option value="">Brak opcji dystansu</option>
            ) : (
              <>
                <option value="">(nie wybrano)</option>
                {sortedOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label} ({Number(o.distance_km)} km)
                  </option>
                ))}
              </>
            )}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          >
            <option value="planned">planned (będę)</option>
            <option value="maybe">maybe (może)</option>
            <option value="completed">completed (ukończone)</option>
          </select>
        </label>

        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="checkbox" checked={wants} onChange={(e) => setWants(e.target.checked)} />
          Chcę wziąć udział
        </label>

        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="checkbox" checked={registered} onChange={(e) => setRegistered(e.target.checked)} />
          Zapisany
        </label>

        <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
          Opłacony
        </label>

        {msg && <p style={{ margin: 0, color: msg.startsWith("Błąd") ? "crimson" : "green" }}>{msg}</p>}
      </div>
    </section>
  );
}
