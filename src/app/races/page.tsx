"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function RacesListPage() {
  const [races, setRaces] = useState<any[]>([]);

  useEffect(() => {
    async function getRaces() {
      const { data } = await supabase.from("races").select("*").order("race_date", { ascending: false });
      if (data) setRaces(data);
    }
    getRaces();
  }, []);

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: 900 }}>LISTA BIEGÓW</h1>
        <Link href="/admin/races" style={{ background: "#00d4ff", color: "#000", padding: "12px 25px", borderRadius: "10px", fontWeight: 900, textDecoration: "none" }}>
          + DODAJ NOWY BIEG
        </Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {races.map(r => (
          <Link href={`/races/${r.id}`} key={r.id} style={{ textDecoration: "none" }}>
            <div style={{ background: "#111", padding: "30px", borderRadius: "20px", border: "1px solid #222" }}>
              <span style={{ color: "#00d4ff", fontWeight: 900 }}>{r.race_date}</span>
              <h3 style={{ color: "#fff", margin: "10px 0" }}>{r.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}