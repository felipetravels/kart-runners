"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

function fmtTime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function RunnerPage() {
  const params = useParams<{ id?: string }>();
  const runnerId = params?.id ?? "";

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    async function getData() {
      setLoading(true);
      // Pobierz profil
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", runnerId).maybeSingle();
      setProfile(prof);

      // Pobierz wszystkie wyniki tego zawodnika
      const { data: res } = await supabase
        .from("race_results")
        .select(`
          finish_time_seconds,
          race_options ( label, distance_km ),
          races ( title, race_date )
        `)
        .eq("user_id", runnerId);
      
      setResults(res || []);
      setLoading(false);
    }
    if (runnerId) getData();
  }, [runnerId]);

  const stats = useMemo(() => {
    const totalKm = results.reduce((acc, r) => acc + (r.race_options?.distance_km || 0), 0);
    
    const getPB = (dist: string) => {
      const filtered = results.filter(r => r.race_options?.label.toLowerCase().includes(dist.toLowerCase()));
      if (filtered.length === 0) return null;
      return Math.min(...filtered.map(r => r.finish_time_seconds));
    };

    return {
      totalKm,
      pb5k: getPB("5k"),
      pb10k: getPB("10k"),
      pbHM: getPB("półmaraton"),
      pbM: getPB("maraton")
    };
  }, [results]);

  if (loading) return <main style={{ padding: 20 }}>Ładowanie profilu...</main>;

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <header style={{ marginBottom: 30 }}>
        <a href="/" style={{ opacity: 0.6, textDecoration: "none" }}>← Powrót</a>
        <h1 style={{ fontSize: "2.5rem", margin: "10px 0" }}>{profile?.display_name}</h1>
        <p style={{ opacity: 0.8 }}>Team: {profile?.team || "Indywidualnie"}</p>
      </header>

      {/* SUMA KM */}
      <section style={{ background: "linear-gradient(45deg, #111, #222)", padding: 25, borderRadius: 20, marginBottom: 30 }}>
        <div style={{ opacity: 0.7, fontSize: "0.9rem", letterSpacing: 1 }}>TOTAL KM</div>
        <div style={{ fontSize: "3rem", fontWeight: 900 }}>{stats.totalKm.toFixed(1)} km</div>
      </section>

      {/* ŻYCIÓWKI */}
      <h2 style={{ marginBottom: 15 }}>Moje Życiówki</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 15, marginBottom: 40 }}>
        {[
          { label: "5 KM", val: stats.pb5k },
          { label: "10 KM", val: stats.pb10k },
          { label: "HM", val: stats.pbHM },
          { label: "M", val: stats.pbM },
        ].map(pb => (
          <div key={pb.label} style={{ background: "rgba(255,255,255,0.05)", padding: 20, borderRadius: 15, border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ opacity: 0.6, fontSize: "0.8rem" }}>{pb.label}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: pb.val ? "#00ff00" : "#444" }}>
              {pb.val ? fmtTime(pb.val) : "--:--"}
            </div>
          </div>
        ))}
      </div>

      <h2>Historia startów</h2>
      <div style={{ display: "grid", gap: 10 }}>
        {results.sort((a,b) => b.races.race_date.localeCompare(a.races.race_date)).map((r, i) => (
          <div key={i} style={{ padding: 15, background: "rgba(255,255,255,0.03)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{r.races.title}</div>
              <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>{r.races.race_date} · {r.race_options.label}</div>
            </div>
            <div style={{ fontWeight: 900, fontSize: "1.1rem" }}>{fmtTime(r.finish_time_seconds)}</div>
          </div>
        ))}
      </div>
    </main>
  );
}