"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

/**
 * REVISION: 2.0.1 - CACHE BREAKER
 * Przywrócenie pełnej funkcjonalności formularza biegów.
 */

function RaceEditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raceId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    race_date: "",
    location: "",
    description: "", // Tutaj zapisujemy KM / Dystans
    results_link: ""
  });

  useEffect(() => {
    if (!raceId) return;
    async function fetchRaceData() {
      setLoading(true);
      const { data, error } = await supabase
        .from("races")
        .select("*")
        .eq("id", raceId)
        .single();
      
      if (data && !error) {
        setFormData({
          title: data.title || "",
          race_date: data.race_date || "",
          location: data.location || "",
          description: data.description || "",
          results_link: data.results_link || ""
        });
      }
      setLoading(false);
    }
    fetchRaceData();
  }, [raceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (raceId) {
        // EDYCJA
        const { error } = await supabase
          .from("races")
          .update(formData)
          .eq("id", raceId);
        if (error) throw error;
        alert("Zmiany zostały zapisane.");
      } else {
        // DODAWANIE NOWEGO + AUTO PUSH
        const { data: newRace, error } = await supabase
          .from("races")
          .insert([formData])
          .select()
          .single();
        
        if (error) throw error;

        // Cicha wysyłka powiadomienia push w tle
        if (newRace) {
          fetch("/api/send-push", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "🏃 NOWY BIEG: " + formData.title,
              body: `${formData.race_date} - ${formData.location}. Dystans: ${formData.description}. Zapisz się!`,
              url: `/races?id=${newRace.id}`
            })
          }).catch(() => console.log("Push skip"));
        }
        alert("Bieg został dodany do kalendarza.");
      }
      router.push("/races");
      router.refresh();
    } catch (err: any) {
      alert("Wystąpił błąd: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", color: "#fff", paddingLeft: "20px", paddingRight: "20px" }}>
      <main style={{ maxWidth: "600px", margin: "0 auto", paddingBottom: "100px" }}>
        
        <div style={{ borderBottom: "1px solid #222", marginBottom: "40px", paddingBottom: "20px" }}>
          <h1 style={{ color: "#00d4ff", fontSize: "2.5rem", fontWeight: 900, margin: 0 }}>
            {raceId ? "EDYTUJ WYDARZENIE" : "KREATOR WYDARZENIA"}
          </h1>
          <p style={{ color: "#666", marginTop: "10px" }}>Wypełnij dane poniżej, aby zaktualizować kalendarz.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
          
          <div>
            <label style={labelStyle}>NAZWA BIEGU / WYDARZENIA</label>
            <input 
              required 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              placeholder="np. Maraton Warszawski"
              style={inputStyle} 
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={labelStyle}>DATA</label>
              <input 
                required 
                type="date" 
                value={formData.race_date} 
                onChange={e => setFormData({...formData, race_date: e.target.value})} 
                style={inputStyle} 
              />
            </div>
            <div>
              <label style={labelStyle}>DYSTANS (KM)</label>
              <input 
                required 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="np. 5km / 10km"
                style={inputStyle} 
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>LOKALIZACJA</label>
            <input 
              required 
              value={formData.location} 
              onChange={e => setFormData({...formData, location: e.target.value})} 
              placeholder="np. Kraków, Błonia"
              style={inputStyle} 
            />
          </div>

          <div>
            <label style={labelStyle}>LINK DO ZAPISÓW / WYNIKÓW</label>
            <input 
              type="url" 
              value={formData.results_link} 
              onChange={e => setFormData({...formData, results_link: e.target.value})} 
              placeholder="https://..."
              style={inputStyle} 
            />
          </div>

          <div style={{ display: "flex", gap: "15px", marginTop: "30px" }}>
            <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                flex: 2, padding: "18px", background: "#00d4ff", color: "#000", 
                border: "none", borderRadius: "12px", fontWeight: 900, fontSize: "1rem", cursor: "pointer" 
              }}
            >
              {loading ? "PRZETWARZANIE..." : "ZAPISZ I AKTUALIZUJ"}
            </button>
            
            <Link 
              href="/races" 
              style={{ 
                flex: 1, padding: "18px", background: "#1a1a1a", color: "#fff", 
                textAlign: "center", textDecoration: "none", borderRadius: "12px", 
                fontWeight: 700, border: "1px solid #333" 
              }}
            >
              ANULUJ
            </Link>
          </div>

        </form>
      </main>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: "0.8rem", color: "#888", marginBottom: "8px", fontWeight: 700 };
const inputStyle = { width: "100%", padding: "14px", background: "#111", border: "1px solid #333", borderRadius: "10px", color: "#fff", fontSize: "1rem", boxSizing: "border-box" as "border-box" };

export default function EditRacePage() {
  return (
    <Suspense fallback={<div style={{paddingTop: "200px", textAlign: "center", color: "#fff"}}>Ładowanie formularza...</div>}>
      <RaceEditContent />
    </Suspense>
  );
}