"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

function RaceEditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raceId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState(""); 
  const [link, setLink] = useState("");

  useEffect(() => {
    async function fetchRace() {
      if (!raceId) return;
      setLoading(true);
      const { data } = await supabase.from("races").select("*").eq("id", raceId).single();
      if (data) {
        setTitle(data.title || "");
        setDate(data.race_date || "");
        setLocation(data.location || "");
        setDistance(data.description || "");
        setLink(data.results_link || "");
      }
      setLoading(false);
    }
    fetchRace();
  }, [raceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const raceData = { title, race_date: date, location, description: distance, results_link: link };

    try {
      if (raceId) {
        await supabase.from("races").update(raceData).eq("id", raceId);
      } else {
        const { data: newRace } = await supabase.from("races").insert([raceData]).select().single();
        if (newRace) {
          fetch("/api/send-push", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "🏆 NOWY BIEG: " + title,
              body: `Data: ${date}. Miejsce: ${location}. Dystans: ${distance}.`,
              url: `/races?id=${newRace.id}`
            })
          }).catch(console.error);
        }
      }
      router.push("/races");
    } catch (err) {
      alert("Błąd zapisu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <main style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px 60px" }}>
        <h1 style={{ color: "#00d4ff", fontWeight: 900, fontSize: "2rem", marginBottom: "30px" }}>
          {raceId ? "EDYTUJ BIEG" : "DODAJ NOWY BIEG"}
        </h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#888", marginBottom: "8px" }}>NAZWA WYDARZENIA</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} 
                   style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #333", borderRadius: "8px", color: "#fff" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#888", marginBottom: "8px" }}>DATA</label>
              <input required type="date" value={date} onChange={e => setDate(e.target.value)} 
                     style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #333", borderRadius: "8px", color: "#fff" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "#888", marginBottom: "8px" }}>KM (DYSTANS)</label>
              <input required value={distance} onChange={e => setDistance(e.target.value)} placeholder="np. 5km / 10km" 
                     style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #333", borderRadius: "8px", color: "#fff" }} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#888", marginBottom: "8px" }}>LOKALIZACJA</label>
            <input required value={location} onChange={e => setLocation(e.target.value)} 
                   style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #333", borderRadius: "8px", color: "#fff" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#888", marginBottom: "8px" }}>LINK DO WYNIKÓW</label>
            <input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..."
                   style={{ width: "100%", padding: "12px", background: "#111", border: "1px solid #333", borderRadius: "8px", color: "#fff" }} />
          </div>
          <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: "15px", background: "#00d4ff", color: "#000", border: "none", borderRadius: "10px", fontWeight: 900, cursor: "pointer" }}>
              {loading ? "ZAPISYWANIE..." : "ZAPISZ BIEG"}
            </button>
            <Link href="/races" style={{ flex: 1, padding: "15px", background: "#333", color: "#fff", borderRadius: "10px", fontWeight: 900, textDecoration: "none", textAlign: "center" }}>
              ANULUJ
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function EditRacePage() {
  return <Suspense fallback={<div style={{paddingTop:"200px", textAlign:"center"}}>Ładowanie...</div>}><RaceEditContent /></Suspense>;
}