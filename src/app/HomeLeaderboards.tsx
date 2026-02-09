"use client";

export default function HomeLeaderboards({ results }: { results: any[] }) {
  if (!results || results.length === 0) return <p style={{ opacity: 0.5 }}>Brak danych.</p>;

  const grouped: Record<string, any[]> = {};
  results.forEach(res => {
    const label = res.race_options?.label || "Inne";
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(res);
  });

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {Object.entries(grouped).map(([label, group]) => {
        // Filtrujemy tylko wyniki większe niż 0 i sortujemy
        const top3 = [...group]
          .filter(r => r.time_seconds > 0)
          .sort((a, b) => a.time_seconds - b.time_seconds)
          .slice(0, 3);

        return (
          <div key={label} style={{ background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
            <h4 style={{ margin: "0 0 15px 0", color: "#00d4ff", fontSize: "0.8rem", textTransform: "uppercase" }}>{label}</h4>
            {top3.map((r, i) => {
              const tempo = r.race_options?.distance_km 
                ? (r.time_seconds / 60 / r.race_options.distance_km).toFixed(2) 
                : null;
              
              return (
                <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < top3.length - 1 ? "1px solid #222" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold" }}>{i + 1}. {r.profiles?.display_name || "Zawodnik"}</span>
                    <span style={{ color: "#00ff00", fontWeight: 900 }}>{formatTime(r.time_seconds)}</span>
                  </div>
                  {tempo && <div style={{ fontSize: "0.7rem", opacity: 0.4, textAlign: "right" }}>{tempo} min/km</div>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}