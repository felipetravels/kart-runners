"use client";

function fmtTime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function HomeLeaderboards({ results }: { results: any[] }) {
  const getTop3 = (label: string) => {
    return (results || [])
      .filter(r => {
        const distLabel = r.race_options?.label?.toLowerCase() || "";
        return distLabel.includes(label.toLowerCase());
      })
      .sort((a, b) => a.finish_time_seconds - b.finish_time_seconds)
      .slice(0, 3);
  };

  const rankings = [
    { title: "TOP 3 - 5 KM", key: "5k" },
    { title: "TOP 3 - 10 KM", key: "10k" },
    { title: "TOP 3 - PÓŁMARATON", key: "półmaraton" },
    { title: "TOP 3 - MARATON", key: "maraton" },
  ];

  return (
    <div style={{ display: "grid", gap: 15 }}>
      {rankings.map(rank => {
        const top = getTop3(rank.key);
        return (
          <div key={rank.key} style={{ 
            background: "rgba(255,255,255,0.05)", 
            padding: 15, 
            borderRadius: 15, 
            border: "1px solid rgba(255,255,255,0.1)" 
          }}>
            <h4 style={{ margin: "0 0 10px 0", color: "#00d4ff", fontSize: "0.75rem", letterSpacing: "1px" }}>
              {rank.title}
            </h4>
            {top.length > 0 ? top.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 6 }}>
                <span style={{ opacity: 0.9 }}>{i+1}. {r.profiles?.display_name || "Zawodnik"}</span>
                <span style={{ fontWeight: 700, color: "#00ff00" }}>{fmtTime(r.finish_time_seconds)}</span>
              </div>
            )) : (
              <div style={{ opacity: 0.3, fontSize: "0.75rem" }}>Brak wyników</div>
            )}
          </div>
        );
      })}
    </div>
  );
}