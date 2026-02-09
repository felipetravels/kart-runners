"use client";
export default function RaceCard({ race }: { race: any }) {
  return (
    <div style={{
      background: "rgba(15,15,15,0.8)",
      backdropFilter: "blur(10px)",
      borderRadius: "24px",
      border: "1px solid #333",
      overflow: "hidden",
      height: "100%",
      display: "flex",
      flexDirection: "column"
    }}>
      <div style={{ 
        width: "100%", height: "180px", 
        backgroundImage: `url(${race.image_url || 'https://images.unsplash.com/photo-1530549387074-d562495b46ed?w=800'})`,
        backgroundSize: "cover", backgroundPosition: "center" 
      }} />
      <div style={{ padding: "25px", flex: 1, display: "flex", flexDirection: "column" }}>
        <span style={{ color: "#00d4ff", fontWeight: "bold", fontSize: "0.75rem" }}>{race.race_date}</span>
        <h3 style={{ margin: "10px 0", fontSize: "1.4rem", fontWeight: 900 }}>{race.title}</h3>
        <p style={{ opacity: 0.6, fontSize: "0.9rem" }}>📍 {race.city}</p>
        <div style={{ marginTop: "auto", paddingTop: "20px" }}>
          <a href={"/races?id=" + race.id} style={{
            background: "#00d4ff", color: "#000", padding: "10px 20px", borderRadius: "10px", 
            textDecoration: "none", fontWeight: "bold", display: "inline-block"
          }}>DETAILS →</a>
        </div>
      </div>
    </div>
  );
}
