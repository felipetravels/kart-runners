"use client";

type Participant = { user_id: string; name: string; team: string };
type Option = { id: number; label: string };

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

export function RaceCard(props: {
  race: {
    id: number;
    title: string;
    race_date: string;
    city: string | null;
    country: string | null;
    signup_url: string | null;
    options: Option[];
    participants: Participant[];
  };
}) {
  const { race } = props;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 18,
        padding: 16,
        boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ minWidth: 240 }}>
          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.15)",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            📅 {race.race_date ? formatDate(race.race_date) : "?"}
          </div>

          <h2 style={{ margin: "10px 0 6px", fontSize: 22 }}>{race.title}</h2>

          <div style={{ color: "rgba(255,255,255,0.75)" }}>
            📍 {[race.city, race.country].filter(Boolean).join(", ") || "Brak lokalizacji"}
          </div>

          {race.signup_url && (
            <div style={{ marginTop: 10 }}>
              <a href={race.signup_url} target="_blank" rel="noreferrer" style={{ color: "white" }}>
                Link do zapisów ↗
              </a>
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Dystanse</div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {race.options.length > 0 ? (
              race.options.map((o) => (
                <span
                  key={o.id}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    fontSize: 13,
                  }}
                >
                  {o.label}
                </span>
              ))
            ) : (
              <span style={{ color: "rgba(255,255,255,0.6)" }}>Brak</span>
            )}
          </div>

          <div style={{ marginTop: 14, fontWeight: 800 }}>Zadeklarowani ({race.participants.length})</div>

          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {race.participants.slice(0, 5).map((p) => (
              <a
                key={p.user_id}
                href={`/runners/${p.user_id}`}
                title={`${p.name} (${p.team})`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 13,
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  {initials(p.name)}
                </div>
              </a>
            ))}

            {race.participants.length === 0 && <span style={{ color: "rgba(255,255,255,0.6)" }}>Jeszcze nikt.</span>}
          </div>
        </div>

        <div style={{ minWidth: 170, textAlign: "right" }}>
          <a
            href={`/races/${race.id}`}
            style={{
              display: "inline-block",
              padding: "10px 14px",
              borderRadius: 14,
              background: "white",
              color: "black",
              textDecoration: "none",
              fontWeight: 900,
            }}
          >
            Szczegóły →
          </a>
        </div>
      </div>
    </div>
  );
}
