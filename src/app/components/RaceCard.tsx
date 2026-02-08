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
  if (!dateStr) return "";
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
    <div style={{
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: 24,
      padding: 25,
      boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
      transition: "transform 0.2s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", alignItems: "start" }}>
        <div style={{ flex: 1, minWidth: "250px" }}>
          <div style={{
            display: "inline-block",
            padding: "6px 14px",
            borderRadius: 999,
            background: "rgba(0,212,255,0.15)",
            border: "1px solid rgba(0,212,255,0.3)",
            color: "#00d4ff",
            fontWeight: 800,
            fontSize: "0.85rem",
            marginBottom: 15
          }}>
            📅 {race.race_date ? formatDate(race.race_date) : "Data do ustalenia"}
          </div>

          <h2 style={{ margin: "0 0 10px 0", fontSize: "1.6rem", fontWeight: 900, lineHeight: 1.2 }}>
            {race.title}
          </h2>

          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", marginBottom: 20 }}>
            📍 {[race.city, race.country].filter(Boolean).join(", ") || "Lokalizacja do ustalenia"}
          </div>

          {/* LISTA UCZESTNIKÓW (KÓŁKA) */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", marginLeft: 10 }}>
              {race.participants?.slice(0, 5).map((p, i) => (
                <div
                  key={i}
                  title={p.name}
                  style={{
                    width: 35,
                    height: 35,
                    borderRadius: "50%",
                    background: p.team === "KART LIGHT" ? "#00ff00" : "#00d4ff",
                    color: "#000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    border: "3px solid #111",
                    marginLeft: -10,
                    cursor: "default"
                  }}
                >
                  {initials(p.name)}
                </div>
              ))}
            </div>
            {race.participants?.length > 0 && (
              <span style={{ fontSize: "0.85rem", opacity: 0.5, marginLeft: 5 }}>
                +{race.participants.length} osób
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
          {/* POPRAWIONY LINK: Używa ?id= zamiast /id */}
          <a
            href={`/races?id=${race.id}`}
            style={{
              padding: "12px 24px",
              borderRadius: 14,
              background: "#fff",
              color: "#000",
              textDecoration: "none",
              fontWeight: 900,
              fontSize: "0.9rem",
              textAlign: "center",
              minWidth: "120px"
            }}
          >
            SZCZEGÓŁY →
          </a>
          
          {race.signup_url && (
            <a
              href={race.signup_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "10px 15px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
                textDecoration: "none",
                fontSize: "0.8rem",
                fontWeight: "bold",
                textAlign: "center",
                width: "100%"
              }}
            >
              Zapisy zewnętrzne
            </a>
          )}
        </div>
      </div>
    </div>
  );
}