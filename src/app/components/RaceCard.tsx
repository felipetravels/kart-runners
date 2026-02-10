import Link from "next/link";

export default function RaceCard({ race }: { race: any }) {
  return (
    <div style={cardS}>
      <div style={{ marginBottom: 15 }}>
        <span style={dateS}>{race.race_date}</span>
        <h3 style={titleS}>{race.title}</h3>
        <p style={cityS}>📍 {race.city}</p>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Link href={`/races?id=${race.id}`} style={btnP}>SZCZEGÓŁY</Link>
        {race.event_url && (
          <a href={race.event_url} target="_blank" rel="noopener noreferrer" style={btnS}>LINK</a>
        )}
      </div>
    </div>
  );
}
const cardS = { background: "rgba(255,255,255,0.05)", padding: "25px", borderRadius: "20px", border: "1px solid #333", display: "flex", flexDirection: "column" as const, justifyContent: "space-between" };
const dateS = { fontSize: "0.8rem", color: "#00d4ff", fontWeight: 900 };
const titleS = { fontSize: "1.2rem", fontWeight: 900, margin: "5px 0" };
const cityS = { fontSize: "0.85rem", opacity: 0.6 };
const btnP = { flex: 1, textAlign: "center" as const, background: "#00d4ff", color: "#000", padding: "10px", borderRadius: "10px", textDecoration: "none", fontWeight: 900, fontSize: "0.8rem" };
const btnS = { flex: 1, textAlign: "center" as const, background: "transparent", color: "#fff", border: "1px solid #fff", padding: "10px", borderRadius: "10px", textDecoration: "none", fontWeight: 900, fontSize: "0.8rem" };
