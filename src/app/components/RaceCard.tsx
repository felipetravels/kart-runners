"use client";
import React from "react";

export default function RaceCard({ race }: { race: any }) {
  // Jeśli bieg nie ma zdjęcia w bazie, używamy Twojego hero.png z folderu public
  const imageToShow = race.image_url || "/hero.png";

  return (
    <div style={{
      background: "#111",
      borderRadius: "20px",
      border: "1px solid #222",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: "100%"
    }}>
      <div style={{ 
        width: "100%", 
        height: "160px", 
        backgroundImage: `url(${imageToShow})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative"
      }}>
        <div style={{ 
          position: "absolute", 
          bottom: 0, 
          left: 0, 
          right: 0, 
          height: "80%", 
          background: "linear-gradient(to top, #111, transparent)" 
        }} />
      </div>
      
      <div style={{ padding: "20px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "0.7rem", color: "#00d4ff", fontWeight: "bold", marginBottom: "5px" }}>
          {race.race_date}
        </div>
        <h3 style={{ margin: 0, fontWeight: 900, fontSize: "1.3rem", color: "#fff" }}>{race.title}</h3>
        <p style={{ margin: "5px 0", opacity: 0.6, fontSize: "0.85rem", color: "#fff" }}>📍 {race.city}</p>
        
        <div style={{ marginTop: "auto", paddingTop: "20px" }}>
           <a href={"/races?id=" + race.id} style={{
             display: "inline-block",
             textDecoration: "none",
             color: "#000",
             background: "#00d4ff",
             padding: "8px 18px",
             borderRadius: "10px",
             fontSize: "0.8rem",
             fontWeight: "900"
           }}>SZCZEGÓŁY →</a>
        </div>
      </div>
    </div>
  );
}
