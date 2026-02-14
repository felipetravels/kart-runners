"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

function EditRaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raceId = searchParams.get("id"); // Sprawdza czy edytujemy (id w URL) czy dodajemy nowy

  const [loading, setLoading] = useState(false);
  
  // Pola formularza
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [link, setLink] = useState("");
  
  // Lista dystansów (zamiast jednego pola tekstowego)
  const [distances, setDistances] = useState<string[]>([""]); 

  // POBIERANIE DANYCH (Tylko przy edycji)
  useEffect(() => {
    async function fetchRace() {
      if (!raceId) return;
      setLoading(true);
      const { data } = await supabase.from("races").select("*").eq("id", raceId).single();

      if (data) {
        setTitle(data.title);
        setDate(data.race_date);
        setLocation(data.location);
        setLink(data.results_link || "");
        
        // Jeśli w bazie jest "5km / 10km", rozbijamy to na dwa pola edycji
        if (data.description && data.description.includes(" / ")) {
           setDistances(data.description.split(" / "));
        } else if (data.description) {
           setDistances([data.description]);
        }
      }
      setLoading(false);
    }
    fetchRace();
  }, [raceId]);

  // OBSŁUGA LISTY DYSTANSÓW
  const handleDistanceChange = (index: number, value: string) => {
    const newDistances = [...distances];
    newDistances[index] = value;
    setDistances(newDistances);
  };
  const addDistanceField = () => setDistances([...distances, ""]);
  const removeDistanceField = (index: number) => {
    const newDistances = distances.filter((_, i) => i !== index);
    setDistances(newDistances.length ? newDistances : [""]);
  };

  // ZAPIS BIEGU
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Sklejamy dystanse w jeden tekst do bazy (np. "5km / 10km")
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
        // --- EDYCJA (Aktualizujemy rekord, NIE wysyłamy pusha) ---
        const { error } = await supabase.from("races").update(raceData).eq("id", raceId);
        if (error) throw error;
        alert("Zapisano zmiany w biegu!");
      } else {
        // --- NOWY BIEG (Dodajemy rekord + Auto Push) ---
        const { data: newRace, error } = await supabase.from("races").insert([raceData]).select().single();
        if (error) throw error;

        // AUTOMATYCZNY PUSH W TLE (Użytkownik tego nie widzi)
        try {
            await fetch("/api/send-push", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "🏆 NOWY BIEG: " + title,
                    body: `Data: ${date}. Dystanse: ${finalDescription}. Zapisz się!`,
                    url: `/races?id=${newRace.id}`
                })
            });
            console.log("Push wysłany automatycznie.");
        } catch (pushErr) {
            console.error("Błąd wysyłki pusha (ale bieg dodano):", pushErr);
        }

        alert("Bieg dodany pomyślnie! Powiadomienie wysłane do uczestników.");
      }
      
      router.push("/races"); // Powrót na listę
    } catch (err: any) {
      alert("Błąd zapisu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: "180px", minHeight: "100vh", background: "#0a0a0a", color: "#fff" }}>
      <main style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px 60px" }}>
        
        <div style={{ marginBottom: 30 }}>
          <Link href="/races" style={{ color: "#888", textDecoration: "none" }}>← Anuluj i wróć</Link>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#00d4ff", marginTop: 10 }}>
            {raceId ? "EDYTUJ BIEG" : "DODAJ NOWY BIEG"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div>
            <label style={l}>NAZWA WYDARZENIA</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="np. Półmaraton Warszawski" style={i} />
          </div>

          <div>
            <label style={l}>DATA</label>
            <input required type="date" value={date} onChange={e => setDate(e.target.value)} style={i} />
          </div>

          <div>
            <label style={l}>LOKALIZACJA</label>
            <input required value={location} onChange={e => setLocation(e.target.value)} placeholder="np. Warszawa" style={i} />
          </div>

          {/* DYNAMICZNA LISTA DYSTANSÓW */}
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "10px", border: "1px solid #333" }}>
            <label style={{...l, color: "#00d4ff"}}>DYSTANSE (np. 5km, 10km)</label>
            {distances.map((dist, idx) => (
              <div key={idx} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <input value={dist} onChange={e => handleDistanceChange(idx, e.target.value)} placeholder="np. 10km" style={{...i, flex: 1}} />
                {distances.length > 1 && (
                    <button type="button" onClick={() => removeDistanceField(idx)} style={{background:"#c0392b", border:"none", color:"#fff", borderRadius:5, padding: "0 15px", cursor:"pointer", fontWeight:"bold"}}>USUŃ</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addDistanceField} style={{background:"transparent", border:"1px dashed #00d4ff", color:"#00d4ff", width:"100%", padding:10, cursor:"pointer"}}>+ DODAJ KOLEJNY DYSTANS</button>
          </div>

          <div>
            <label style={l}>LINK DO STRONY / WYNIKÓW (Opcjonalne)</label>
            <input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." style={i} />
          </div>

          <button type="submit" disabled={loading} style={{
              marginTop: 20, padding: 15, borderRadius: 10, border: "none",
              background: loading ? "#555" : "#00d4ff", color: "#000", fontWeight: 900, fontSize: "1.1rem", cursor: loading ? "wait" : "pointer"
            }}>
            {loading ? "ZAPISYWANIE..." : (raceId ? "ZAPISZ ZMIANY" : "DODAJ BIEG (AUTO-PUSH)")}
          </button>

        </form>
      </main>
    </div>
  );
}

// Proste style inline
const l = { display: "block", marginBottom: 5, fontSize: "0.8rem", color: "#aaa", fontWeight: "bold" };
const i = { width: "100%", padding: 12, background: "#111", border: "1px solid #444", borderRadius: 8, color: "#fff", fontSize: "1rem" };

export default function EditRacePage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: "200px", textAlign: "center", color: "#fff" }}>Ładowanie formularza...</div>}>
      <EditRaceContent />
    </Suspense>
  );
}