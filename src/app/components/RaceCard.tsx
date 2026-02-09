"use client";

type Participant = { user_id: string; name: string; team: string };
type Option = { id: number; label: string };

function initials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
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

  // Debugowanie: sprawdzamy w konsoli przeglądarki, czy ID istnieje
  console.log("Renderowanie karty dla ID:", race.id);

  return (
    <div style={{
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: 24,
      padding: 25,
      marginBottom: 20
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#00d4ff", fontWeight: "bold", fontSize: "0.9rem", marginBottom: 10 }}>
            📅 {race.race_date || "Data do ustalenia"}
          </div>
          <h2 style={{ margin: "0 0 10px 0", fontSize: "1.6rem", fontWeight: 900 }}>{race.title}</h2>
          <div style={{ opacity: 0.6, marginBottom: 20 }}>
            📍 {race.city || "Lokalizacja"}, {race.country || "Polska"}
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", marginLeft: 10 }}>
              {race.participants?.slice(0, 5).map((p, i) => (
                <div key={i} title={p.name} style={{
                  width: 32, height: 32, borderRadius: "50%", background: "#00d4ff", color: "#000",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem",
                  fontWeight: "bold", border: "2px solid #111", marginLeft: -10
                }}>
                  {initials(p.name)}
                </div>
              ))}
            </div>
            {race.participants?.length > 0 && <span style={{ fontSize: "0.85rem", opacity: 0.5 }}>+{race.participants.length}</span>}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* KLUCZOWA ZMIANA: Wymuszamy poprawne ID w linku */}
          <a 
            href={`/races?id=${race.id}`} 
            style={{
              padding: "14px 28px", 
              background: "#fff", 
              color: "#000",
              borderRadius: "14px", 
              textDecoration: "none", 
              fontWeight: "900", 
              textAlign: "center",
              boxShadow: "0 4px 15px rgba(255,255,255,0.1)"
            }}
          >
            SZCZEGÓŁY →
          </a>
        </div>
      </div>
    </div>
  );
}