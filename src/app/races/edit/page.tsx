"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

function RaceEditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raceId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    race_date: "",
    location: "",
    description: "",
    results_link: ""
  });

  useEffect(() => {
    if (!raceId) return;
    async function getRace() {
      setLoading(true);
      const { data } = await supabase.from("races").select("*").eq("id", raceId).single();
      if (data) setFormData({
        title: data.title || "",
        race_date: data.race_date || "",
        location: data.location || "",
        description: data.description || "",
        results_link: data.results_link || ""
      });
      setLoading(false);
    }
    getRace();
  }, [raceId]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (raceId) {
        await supabase.from("races").update(formData).eq("id", raceId);
      } else {
        const { data: newRace } = await supabase.from("races").insert([formData]).select().single();
        if (newRace) {
          fetch("/api/send-push", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "🏆 NOWY BIEG: " + formData.title,
              body: `Data: ${formData.race_date}. Miejsce: ${formData.location}.`,
              url: `/races?id=${newRace.id}`
            })
          }).catch(() => {});
        }
      }
      router.push("/races");
    } catch (err) {
      alert("Błąd zapisu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", color: "#fff", paddingLeft: "20px", paddingRight: "20px" }}>
      <main style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h1 style={{ color: "#00d4ff", fontSize: "2rem", marginBottom: "30px" }}>
          {raceId ? "EDYTUJ BIEG" : "DODAJ NOWY BIEG"}
        </h1>
        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <input required placeholder="NAZWA" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={inp} />
          <div style={{ display: "flex", gap: "10px" }}>
            <input required type="date" value={formData.race_date} onChange={e => setFormData({...formData, race_date: e.target.value})} style={inp} />
            <input required placeholder="KM" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={inp} />
          </div>
          <input required placeholder="MIEJSCE" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={inp} />
          <input placeholder="LINK DO WYNIKÓW" value={formData.results_link} onChange={e => setFormData({...formData, results_link: e.target.value})} style={inp} />
          
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: "15px", background: "#00d4ff", border: "none", fontWeight: 900, cursor: "pointer" }}>
              {loading ? "ZAPISYWANIE..." : "ZAPISZ BIEG"}
            </button>
            <Link href="/races" style={{ flex: 1, padding: "15px", background: "#333", color: "#fff", textAlign: "center", textDecoration: "none", fontWeight: 900 }}>
              ANULUJ
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

const inp = { width: "100%", padding: "12px", background: "#111", border: "1px solid #333", borderRadius: "8px", color: "#fff" };

export default function Page() {
  return <Suspense><RaceEditForm /></Suspense>;
}