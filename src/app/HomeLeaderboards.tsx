"use client";

export default function HomeLeaderboards({ results }: { results: any[] }) {
  if (!results || results.length === 0) return <p style={{ opacity: 0.5 }}>Brak wyników do wyświetlenia rankingu.</p>;

  // Grupowanie po dystansie (np. "5 KM")
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
          .sort((a, b) => a.finish_time_seconds - b.finish_time_seconds)
          .slice(0, 3);

        return (
          <div key={label} style={{ background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
            <h3 style={{ margin: "0 0 15px 0", color: "#00d4ff", fontSize: "0.9rem", textTransform: "uppercase" }}>{label}</h3>
            {top3.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: "0.95rem" }}>
                <span>{i + 1}. {r.profiles?.display_name}</span>
                <span style={{ fontWeight: "bold" }}>
                  {Math.floor(r.finish_time_seconds / 60)}:{(r.finish_time_seconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}