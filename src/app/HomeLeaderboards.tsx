"use client";

export default function HomeLeaderboards({ results }: { results: any[] }) {
  if (!results || results.length === 0) return <p style={{ opacity: 0.5 }}>Brak danych.</p>;

  const grouped: Record<string, any[]> = {};
  results.forEach(res => {
    const label = res.race_options?.label || "Inne";
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(res);
  });

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {Object.entries(grouped).map(([label, group]) => {
        const top3 = [...group]
          .filter(r => r.time_seconds > 0) // Ignorujemy puste czasy
          .sort((a, b) => a.time_seconds - b.time_seconds)
          .slice(0, 3);

        return (
          <div key={label} style={{ background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
            <h4 style={{ margin: "0 0 10px 0", color: "#00d4ff", fontSize: "0.8rem" }}>{label}</h4>
            {top3.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.9rem" }}>
                <span>{r.profiles?.display_name || "Zawodnik"}</span>
                <span style={{ fontWeight: "bold" }}>
                  {Math.floor(r.time_seconds / 60)}:{(r.time_seconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}