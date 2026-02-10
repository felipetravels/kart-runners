"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      padding: "20px", 
      background: "rgba(0,0,0,0.8)", 
      borderBottom: "1px solid #333",
      position: "sticky",
      top: 0,
      zIndex: 1000
    }}>
      <Link href="/" style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff", textDecoration: "none", letterSpacing: "2px" }}>
        KART<span style={{color: "#00d4ff"}}>RUNNERS</span>
      </Link>
      <div style={{ display: "flex", gap: "20px" }}>
        <Link href="/" style={{ color: "#ccc", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}>START</Link>
        <Link href="/logistics" style={{ color: "#ccc", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}>LOGISTYKA</Link>
      </div>
    </nav>
  );
}
