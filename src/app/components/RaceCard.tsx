"use client";
export default function RaceCard({ race }: { race: any }) {
  return (
    <div style={{
      background: "rgba(20,20,20,0.8)", backdropFilter: "blur(10px)",
      borderRadius: "20px", border: "1px solid #333", padding: "25px",
      transition: "transform 0.2s"
    }}>
      <span style={{ color: "#00d4ff", fontWeight: 900, fontSize: "0.8rem" }}>{race.race_date}</span>
      <h3 style={{ margin: "10px 0", fontSize: "1.3rem", fontWeight: 900 }}>{race.title}</h3>
      <p style={{ opacity: 0.6, fontSize: "0.9rem", marginBottom: "20px" }}>📍 {race.city}</p>
      <a href={"/races?id=" + race.id} style={{
        background: "#00d4ff", color: "#000", padding: "10px 20px", borderRadius: "10px", 
        textDecoration: "none", fontWeight: 900, display: "inline-block", fontSize: "0.8rem"
      }}>DETAILS →</a>
    </div>
  );
}
