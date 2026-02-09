"use client";
import React from "react";

export default function RaceCard({ race }: { race: any }) {
  return (
    <div style={{
      background: "#111",
      padding: "20px",
      borderRadius: "20px",
      border: "1px solid #222",
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    }}>
      <div style={{ fontSize: "0.7rem", color: "#00d4ff", fontWeight: "bold", textTransform: "uppercase" }}>
        {race.race_date}
      </div>
      <h3 style={{ margin: 0, fontWeight: 900, fontSize: "1.2rem" }}>{race.title}</h3>
      <p style={{ margin: 0, opacity: 0.6, fontSize: "0.9rem" }}>{race.city}</p>
      <div style={{ marginTop: "10px" }}>
         <a href={"/races?id=" + race.id} style={{
           textDecoration: "none",
           color: "#fff",
           fontSize: "0.8rem",
           fontWeight: "bold",
           borderBottom: "1px solid #00d4ff"
         }}>SZCZEGÓŁY →</a>
      </div>
    </div>
  );
}
