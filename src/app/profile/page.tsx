"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <div style={{ minHeight: "100vh", padding: "180px 60px 60px" }}>
      <header style={{ position: "fixed", top: 0, left: 0, width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "40px 60px", background: "rgba(5,5,5,0.9)", backdropFilter: "blur(15px)", zIndex: 100 }}>
        <Link href="/" style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff", textDecoration: "none" }}>← KART</Link>
        <div style={{ fontWeight: 900, color: "#00d4ff" }}>PROFIL ZAWODNIKA</div>
      </header>
      <main style={{ maxWidth: "800px", margin: "0 auto", background: "rgba(255,255,255,0.02)", padding: "50px", borderRadius: "30px", border: "1px solid #1a1a1a" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: 900, color: "#fff" }}>FILIP</h1>
        <p style={{ color: "#bbb" }}>Dane profilowe są bezpieczne. Build pomyślny.</p>
      </main>
    </div>
  );
}
