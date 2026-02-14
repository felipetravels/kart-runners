"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <div style={{ minHeight: "100vh", padding: "200px 60px 60px", position: "relative" }}>
      <header style={{ position: "fixed", top: 0, left: 0, width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "40px 60px", background: "rgba(5,5,5,0.9)", backdropFilter: "blur(15px)", zIndex: 100, borderBottom: "1px solid #1a1a1a" }}>
        <Link href="/" style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff", textDecoration: "none" }}>← KART</Link>
        <div style={{ fontWeight: 900, color: "#00d4ff", letterSpacing: "2px" }}>PROFIL ZAWODNIKA</div>
      </header>
      <main style={{ maxWidth: "800px", margin: "0 auto", background: "rgba(255,255,255,0.02)", padding: "50px", borderRadius: "30px", border: "1px solid #1a1a1a" }}>
        <h1 style={{ fontSize: "3.5rem", fontWeight: 900, color: "#fff", marginBottom: "10px" }}>FILIP</h1>
        <p style={{ color: "#00d4ff", fontWeight: 700, marginBottom: "40px" }}>Kraków Airport Running Team Member</p>
        <div style={{ color: "#666", padding: "20px", border: "1px dashed #333", borderRadius: "15px", textAlign: "center" as "center" }}>
          Sekcja edycji danych w przygotowaniu.
        </div>
      </main>
    </div>
  );
}
