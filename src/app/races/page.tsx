"use client";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function AdminRacesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Zczytujemy parametry URL (np. kiedy klikniesz "EDYTUJ" lub "KOPIUJ" na karcie biegu)
  const editId = searchParams.get("id");
  const action = searchParams.get("action"); // "edit" lub "copy"

  const [races, setRaces] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    race_date: "",
    location: "",
    city: "",
    website_url: "",
  });
  const [selectedDistances, setSelectedDistances] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const availableDistances = ["5K", "10K", "HALF", "MARATHON", "OTHER"];

  useEffect(() => {
    fetchRaces();
    if (editId) {
      loadRace(editId, action);
    }
  }, [editId, action]);

  async function fetchRaces() {
    const { data } = await supabase.from("races").select("*").order("race_date", { ascending: false });
    if (data) setRaces(data);
  }

  async function loadRace(id: string, actionMode: string | null) {
    const { data: raceData } = await supabase.from("races").select("*").eq("id", id).single();
    const { data: optData } = await supabase.from("race_options").select("*").eq("race_id", id);
    
    if (raceData) {
      setFormData({
        title: actionMode === "copy" ? `${raceData.title} (Kopia)` : raceData.title,
        race_date: raceData.race_date || "",
        location: raceData.location || "",
        city: raceData.city || "",
        website_url: raceData.website_url || "",
      });
    }
    if (optData) {
      setSelectedDistances(optData.map(o => o.distance_class));
    }
  }

  const handleDistanceToggle = (dist: string) => {
    setSelectedDistances(prev => 
      prev.includes(dist) ? prev.filter(d => d !== dist) : [...prev, dist]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let currentRaceId = editId;

      if (action === "edit" && editId) {
        // AKTUALIZACJA ISTNIEJĄCEGO BIEGU
        await supabase.from("races").update(formData).eq("id", editId);
      } else {
        // TWORZENIE NOWEGO BIEGU (lub kopiowanie)
        const { data: newRace, error } = await supabase.from("races").insert([formData]).select().single();
        if (error) throw error;
        currentRaceId = newRace.id;
      }

      // AKTUALIZACJA DYSTANSÓW
      if (currentRaceId) {
        // Usuwamy stare opcje dystansów dla tego biegu
        await supabase.from("race_options").delete().eq("race_id", currentRaceId);
        
        // Dodajemy zaznaczone dystanse
        if (selectedDistances.length > 0) {
          const optionsToInsert = selectedDistances.map(d => ({
            race_id: currentRaceId,
            distance_class: d,
            distance_name: d
          }));
          await supabase.from("race_options").insert(optionsToInsert);
        }
      }

      alert(action === "edit" ? "Zaktualizowano bieg!" : "Dodano nowy bieg!");
      
      // Czyszczenie formularza
      setFormData({ title: "", race_date: "", location: "", city: "", website_url: "" });
      setSelectedDistances([]);
      router.push("/admin/races"); // Usunięcie parametrów z URL
      fetchRaces(); // Odświeżenie listy

    } catch (error: any) {
      alert("Wystąpił błąd: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Na pewno chcesz usunąć ten bieg? Ta akcja jest nieodwracalna!")) return;
    
    // Najpierw usuwamy powiązane dane (dystanse, ew. udziały) z powodu kluczy obcych
    await supabase.from("race_options").delete().eq("race_id", id);
    await supabase.from("participations").delete().eq("race_id", id);
    
    // Następnie usuwamy główny rekord
    await supabase.from("races").delete().eq("id", id);
    
    fetchRaces();
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "#00d4ff" }}>Zarządzaj Biegami</h1>
        <Link href="/" style={{ color: "#666", textDecoration: "none", fontWeight: 900 }}>← POWRÓT</Link>
      </div>

      {/* FORMULARZ DODAWANIA / EDYCJI */}
      <form onSubmit={handleSubmit} style={{ background: "#111", padding: "40px", borderRadius: "25px", border: "1px solid #222", marginBottom: "60px" }}>
        <h2 style={{ marginBottom: "25px", fontSize: "1.5rem" }}>
          {action === "edit" ? "Edytuj bieg" : action === "copy" ? "Skopiuj bieg" : "Dodaj nowy bieg"}
        </h2>
        
        <div style={{ display: "grid", gap: "20px" }}>
          <input required placeholder="Nazwa biegu (np. 10. Bieg Walentynkowy)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={inputS} />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <input required type="date" value={formData.race_date} onChange={e => setFormData({...formData, race_date: e.target.value})} style={inputS} />
            <input required placeholder="Miasto" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={inputS} />
          </div>
          
          <input required placeholder="Lokalizacja (np. Park Lotników, Kraków)" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={inputS} />
          <input placeholder="Link do strony WWW / zapisów (opcjonalnie)" value={formData.website_url} onChange={e => setFormData({...formData, website_url: e.target.value})} style={inputS} />
          
          <div style={{ marginTop: "10px", padding: "20px", background: "#050505", borderRadius: "15px", border: "1px solid #1a1a1a" }}>
            <p style={{ fontWeight: 900, fontSize: "0.85rem", color: "#666", marginBottom: "15px", letterSpacing: "1px" }}>DOSTĘPNE DYSTANSE:</p>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {availableDistances.map(d => (
                <label key={d} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 700 }}>
                  <input type="checkbox" checked={selectedDistances.includes(d)} onChange={() => handleDistanceToggle(d)} /> {d}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
            {action === "edit" || action === "copy" ? (
              <button type="button" onClick={() => { router.push("/admin/races"); setFormData({title:"", race_date:"", location:"", city:"", website_url:""}); setSelectedDistances([]); }} style={btnCancelS}>
                ANULUJ
              </button>
            ) : <div/>}
            <button type="submit" disabled={loading} style={btnS}>
              {loading ? "Zapisywanie..." : action === "edit" ? "ZAPISZ ZMIANY" : "DODAJ BIEG"}
            </button>
          </div>
        </div>
      </form>

      {/* LISTA BIEGÓW */}
      <h2 style={{ marginBottom: "20px", fontSize: "1.5rem" }}>Baza biegów</h2>
      <div style={{ display: "grid", gap: "15px" }}>
        {races.map(r => (
          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#050505", padding: "20px", borderRadius: "15px", border: "1px solid #111" }}>
            <div>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "1.2rem" }}>{r.title}</h3>
              <p style={{ margin: 0, color: "#666", fontSize: "0.8rem", marginTop: "5px" }}>{r.city} | {r.race_date}</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link href={`/admin/races?id=${r.id}&action=edit`} style={btnEditS}>EDYTUJ</Link>
              <button onClick={() => handleDelete(r.id)} style={btnDelS}>USUŃ</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminRacesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", paddingTop: "80px" }}>
      {/* Wymagane przez Vercel dla stron używających useSearchParams */}
      <Suspense fallback={<div style={{ padding: "100px", textAlign: "center", color: "#fff" }}>Ładowanie interfejsu...</div>}>
        <AdminRacesContent />
      </Suspense>
    </div>
  );
}

const inputS = { width: "100%", padding: "15px", background: "#050505", border: "1px solid #333", color: "#fff", borderRadius: "10px", fontSize: "0.9rem", boxSizing: "border-box" as const };
const btnS = { background: "#00d4ff", color: "#000", padding: "12px 30px", borderRadius: "10px", fontWeight: 900, border: "none", cursor: "pointer", fontSize: "0.8rem" };
const btnCancelS = { background: "#333", color: "#fff", padding: "12px 30px", borderRadius: "10px", fontWeight: 900, border: "none", cursor: "pointer", fontSize: "0.8rem" };
const btnDelS = { background: "transparent", color: "#ff4444", border: "1px solid #ff4444", padding: "10px 15px", borderRadius: "8px", fontWeight: 900, cursor: "pointer", fontSize: "0.7rem" };
const btnEditS = { background: "#333", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "8px", fontWeight: 900, cursor: "pointer", fontSize: "0.7rem", textDecoration: "none" };