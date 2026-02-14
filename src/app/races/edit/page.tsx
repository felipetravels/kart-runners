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
  const [distance, setDistance] = useState(""); // Pole KM ze screena
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

    const raceData = {
      title,
      race_date: date,
      location,
      description: distance,
      results_link: link
    };

    try {
      if (raceId) {
        await supabase.from("races").update(raceData).eq("id", raceId);
      } else {
        const { data: newRace } = await supabase.from("races").insert([raceData]).select().single();
        
        // AUTO-PUSH (Wysyła się sam po dodaniu biegu)
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
      <main style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>
        <h1 style={{ color: "#00d4ff", fontWeight: 900 }}>{raceId ? "EDYTUJ BIEG" : "DODAJ NOWY BIEG"}</h1>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px", marginTop: "40px" }}>
          <div>
            <label style={labelStyle}>NAZWA</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={labelStyle}>DATA</label>
              <input required type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>KM (DYSTANS)</label>
              <input required value={distance} onChange={e => setDistance(e.target.value)} placeholder="np. 5km / 10km" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>LOKALIZACJA</label>
            <input required value={location} onChange={e => setLocation(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>LINK DO WYNIKÓW</label>
            <input type="url" value={link} onChange={e => setLink(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button type="submit" disabled={loading} style={saveBtnStyle}>
              {loading ? "ZAPISYWANIE..." : "ZAPISZ BIEG"}
            </button>
            <Link href="/races" style={cancelBtnStyle}>ANULUJ</Link>
          </div>
        </form>
      </main>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: "0.8rem", color: "#888", marginBottom: "5px" };
const inputStyle = { width: "100%", padding: "12px", background: "#111", border: "1px solid #333", borderRadius: "8px", color: "#fff" };
const saveBtnStyle = { flex: 1, padding: "15px", background: "#00d4ff", color: "#000", border: "none", borderRadius: "8px", fontWeight: 900, cursor: "pointer" };
const cancelBtnStyle = { flex: 1, padding: "15px", background: "#333", color: "#fff", textAlign: "center", textDecoration: "none", borderRadius: "8px", fontWeight: 900 };

export default function EditRacePage() {
  return <Suspense><RaceEditContent /></Suspense>;
}