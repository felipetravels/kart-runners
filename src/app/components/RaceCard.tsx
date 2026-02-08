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

// UPEWNIJ SIĘ ŻE JEST "export function RaceCard"
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
    <div style={{
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: 18,
      padding: 16,
      boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ minWidth: 240 }}>
          <div style={{
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.15)",
            fontWeight: 800,
            fontSize: 13,
          }}>
            📅 {race.race_date ? formatDate(race.race_date) : "?"}
          </div>

          <h2 style={{ margin: "10px 0 6px", fontSize: 22 }}>{race.title}</h2>

          <div style={{ color: "rgba(255,255,255,0.75)" }}>
            📍 {[race.city, race.country].filter(Boolean).join(", ") || "Brak lokalizacji"}
          </div>
        </div>

        <div style={{ minWidth: 170, textAlign: "right" }}>
          <a
            href={`/races?id=${race.id}`}
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