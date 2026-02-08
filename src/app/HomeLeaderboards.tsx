"use client";

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function HomeLeaderboards({ results }: { results: any[] }) {
  const getTop3 = (label: string) => {
    return results
      .filter(r => r.race_options?.label.toLowerCase().includes(label.toLowerCase()))
      .sort((a, b) => a.finish_time_seconds - b.finish_time_seconds)
      .slice(0, 3);
  };

  const rankings = [
    { title: "5 KM", key: "5k" },
    { title: "10 KM", key: "10k" },
    { title: "Półmaraton", key: "półmaraton" },
    { title: "Maraton", key: "maraton" },
  ];

  return (
    <div style={{ display: "grid", gap: 15 }}>
      {rankings.map(rank => {
        const top = getTop3(rank.key);
        return (
          <div key={rank.key} style={{ background: "rgba(255,255,255,0.05)", padding: 15, borderRadius: 15, border: "1px solid rgba(255,255,255,0.1)" }}>
            <h4 style={{ margin: "0 0 10px 0", color: "#00d4ff", fontSize: "0.8rem" }}>{rank.title}</h4>
            {top.length > 0 ? top.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: 5 }}>
                <span style={{ opacity: 0.9 }}>{i+1}. {r.profiles?.display_name}</span>
                <span style={{ fontWeight: 700 }}>{fmtTime(r.finish_time_seconds)}</span>
              </div>
            )) : <div style={{ opacity: 0.3, fontSize: "0.8rem" }}>Brak wyników</div>}
          </div>
        );
      })}
    </div>
  );
}