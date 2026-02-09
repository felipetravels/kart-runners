"use client";

export default function HomeLeaderboards({ results }: { results: any[] }) {
  if (!results || results.length === 0) return <p style={{ opacity: 0.5 }}>Brak wyników do wyświetlenia rankingu.</p>;

  // Grupowanie wyników według dystansu (np. "5 KM", "10 KM")
  const grouped: Record<string, any[]> = {};
  results.forEach(res => {
    const label = res.race_options?.label || "Inne";
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(res);
  });

  const formatTime = (s: number) => {
    if (!s) return "0:00";
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
      {Object.entries(grouped).map(([label, group]) => {
        // Sortujemy grupę od najlepszego czasu (najmniejsza liczba sekund)
        const top3 = [...group]
          .sort((a, b) => (a.time_seconds || 0) - (b.time_seconds || 0))
          .slice(0, 3);

        return (
          <div key={label} style={{ 
            background: "rgba(255,255,255,0.03)", 
            padding: 20, 
            borderRadius: 24, 
            border: "1px solid rgba(255,255,255,0.08)" 
          }}>
            <h3 style={{ 
              margin: "0 0 15px 0", 
              color: "#00d4ff", 
              fontSize: "0.8rem", 
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}>
              Ranking: {label}
            </h3>
            
            <div style={{ display: "grid", gap: 10 }}>
              {top3.map((r, i) => (
                <div key={i} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  fontSize: "0.95rem" 
                }}>
                  <span style={{ opacity: 0.8 }}>
                    {i + 1}. {r.profiles?.display_name || "Zawodnik"}
                  </span>
                  <span style={{ 
                    fontWeight: "bold", 
                    color: i === 0 ? "#ffd700" : "#fff" // Złoty kolor dla pierwszego miejsca
                  }}>
                    {formatTime(r.time_seconds)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}