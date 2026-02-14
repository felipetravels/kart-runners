"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function EditRaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raceId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  
  // Dane formularza
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [link, setLink] = useState("");
  
  // Obsługa wielu dystansów (jako lista stringów)
  const [distances, setDistances] = useState<string[]>([""]); 

  // Pobieranie danych przy edycji
  useEffect(() => {
    async function fetchRace() {
      if (!raceId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("races")
        .select("*")
        .eq("id", raceId)
        .single();

      if (data) {
        setTitle(data.title);
        setDate(data.race_date);
        setLocation(data.location);
        setLink(data.results_link || "");
        
        // Jeśli w opisie są dystanse oddzielone " / ", rozbijamy je na tablicę
        if (data.description && data.description.includes("/")) {
           setDistances(data.description.split(" / "));
        } else if (data.description) {
           setDistances([data.description]);
        } else {
           setDistances([""]);
        }
      }
      setLoading(false);
    }
    fetchRace();
  }, [raceId]);

  // Logika dodawania/usuwania pól dystansu
  const handleDistanceChange = (index: number, value: string) => {
    const newDistances = [...distances];
    newDistances[index] = value;
    setDistances(newDistances);
  };

  const addDistanceField = () => {
    setDistances([...distances, ""]);
  };

  const removeDistanceField = (index: number) => {
    const newDistances = distances.filter((_, i) => i !== index);
    setDistances(newDistances.length ? newDistances : [""]);
  };

  // --- GŁÓWNA FUNKCJA ZAPISU ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Sklejamy dystanse w jeden string do bazy (np. "5km / 10km")
    const finalDescription = distances.filter(d => d.trim() !== "").join(" / ");

    const raceData = {
      title,
      race_date: date,
      location,
      description: finalDescription,
      results_link: link,
    };

    try {
      if (raceId) {
        // --- TRYB EDYCJI (Bez wysyłania nowego pusha) ---
        const { error } = await supabase
          .from("races")
          .update(raceData)
          .eq("id", raceId);
        if (error) throw error;
        alert("Bieg zaktualizowany pomyślnie!");
      } else {
        // --- TRYB DODAWANIA (Z Auto-Pushem) ---
        const { data: newRace, error } = await supabase
          .from("races")
          .insert([raceData])
          .select()
          .single();
          
        if (error) throw error;

        // AUTOMATYCZNY PUSH W TLE
        try {
            await fetch("/api/send-push", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "🏆 NOWY BIEG: " + title,
                    body: `Data: ${date}. Dystans: ${finalDescription}. Zapisz się!`,
                    url: `/races?id=${newRace.id}`
                })
            });
            console.log("Push wysłany automatycznie.");
        } catch (pushErr) {
            console.error("Błąd wysyłania pusha (ale bieg dodano):", pushErr);
        }

        alert("Bieg dodany! Powiadomienie push zostało wysłane do użytkowników.");
      }
      
      router.push("/races"); // Powrót do listy
    } catch (err: any) {
      alert("Błąd zapisu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <main style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px 60px" }}>
        
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", marginBottom: "20px" }}>
          ← Anuluj
        </button>

        <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "30px", color: "#00d4ff" }}>
          {raceId ? "EDYTUJ BIEG" : "DODAJ NOWY BIEG"}
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* TYTUŁ */}
          <div>
            <label style={labelStyle}>NAZWA WYDARZENIA</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="np. Półmaraton Warszawski" style={inputStyle} />
          </div>

          {/* DATA */}
          <div>
            <label style={labelStyle}>DATA</label>
            <input required type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
          </div>

          {/* LOKALIZACJA */}
          <div>
            <label style={labelStyle}>LOKALIZACJA</label>
            <input required type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="np. Warszawa" style={inputStyle} />
          </div>

          {/* DYSTANSE (Dynamiczna lista) */}
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "10px", border: "1px solid #333" }}>
            <label style={{ ...labelStyle, color: "#00d4ff" }}>DYSTANSE (Możesz dodać wiele)</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
              {distances.map((dist, index) => (
                <div key={index} style={{ display: "flex", gap: "10px" }}>
                  <input 
                    type="text" 
                    value={dist} 
                    onChange={e => handleDistanceChange(index, e.target.value)}
                    placeholder="np. 10km"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  {distances.length > 1 && (
                    <button type="button" onClick={() => removeDistanceField(index)} style={removeBtnStyle}>Usuń</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addDistanceField} style={addBtnStyle}>+ DODAJ KOLEJNY DYSTANS</button>
            </div>
            <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "10px" }}>
              Zostaną zapisane jako: {distances.filter(d => d).join(" / ")}
            </p>
          </div>

          {/* LINK */}
          <div>
            <label style={labelStyle}>LINK DO WYNIKÓW (Opcjonalne)</label>
            <input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." style={inputStyle} />
          </div>

          {/* PRZYCISK ZAPISU */}
          <button type="submit" disabled={loading} style={{
              marginTop: "20px", padding: "15px", borderRadius: "10px", border: "none",
              background: loading ? "#555" : "#00d4ff", color: "#000", fontWeight: 900, fontSize: "1.1rem", cursor: loading ? "wait" : "pointer"
            }}>
            {loading ? "ZAPISYWANIE..." : (raceId ? "ZAKTUALIZUJ" : "ZAPISZ I WYŚLIJ PUSH")}
          </button>

        </form>
      </main>
    </div>
  );
}

const labelStyle = { display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "#aaa", fontWeight: "bold" };
const inputStyle = { width: "100%", padding: "12px", background: "#111", border: "1px solid #444", borderRadius: "8px", color: "#fff", fontSize: "1rem" };
const addBtnStyle = { background: "transparent", border: "1px dashed #00d4ff", color: "#00d4ff", padding: "10px", borderRadius: "5px", cursor: "pointer", fontSize: "0.9rem", width: "100%" };
const removeBtnStyle = { background: "#c0392b", border: "none", color: "#fff", padding: "0 15px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" };

export default function EditRacePage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: "200px", textAlign: "center", color: "#fff" }}>Ładowanie formularza...</div>}>
      <EditRaceContent />
    </Suspense>
  );
}