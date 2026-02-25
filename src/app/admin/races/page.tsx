"use client";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function AdminRacesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const editId = searchParams.get("id");
  const action = searchParams.get("action");

  const [races, setRaces] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    race_date: "",
    description: "", 
    city: "",
    signup_url: "",
  });
  
  const [selectedDistances, setSelectedDistances] = useState<string[]>([]);
  const [customDistance, setCustomDistance] = useState("");
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
        description: raceData.description || "",
        city: raceData.city || "",
        signup_url: raceData.signup_url || "",
      });
    }
    
    if (optData) {
      const newSelected = new Set<string>();
      let customVal = "";

      optData.forEach(o => {
        const km = Number(o.distance_km);
        if (km === 5) newSelected.add("5K");
        else if (km === 10) newSelected.add("10K");
        else if (km >= 21 && km <= 21.1) newSelected.add("HALF");
        else if (km >= 42 && km <= 42.2) newSelected.add("MARATHON");
        else {
          newSelected.add("OTHER");
          customVal = o.label;
        }
      });
      
      setSelectedDistances(Array.from(newSelected));
      if (customVal) setCustomDistance(customVal);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Musisz być zalogowany, aby dodawać biegi.");

      let currentRaceId = editId;

      const payloadToSave: any = {
        title: formData.title,
        race_date: formData.race_date,
        city: formData.city,
        description: formData.description,
        signup_url: formData.signup_url,
      };

      if (action === "edit" && editId) {
        const { error: updateError } = await supabase.from("races").update(payloadToSave).eq("id", editId);
        if (updateError) throw new Error("Błąd aktualizacji biegu: " + updateError.message);
      } else {
        payloadToSave.created_by = user.id;
        const { data: newRace, error: insertError } = await supabase.from("races").insert([payloadToSave]).select().single();
        if (insertError) throw new Error("Błąd tworzenia biegu: " + insertError.message);
        currentRaceId = newRace.id;
      }

      if (currentRaceId) {
        await supabase.from("race_options").delete().eq("race_id", currentRaceId);
        
        if (selectedDistances.length > 0) {
          const optionsToInsert = selectedDistances.map(d => {
            let finalLabel = d;
            let parsedKm = 0;

            if (d === "5K") { finalLabel = "5 km"; parsedKm = 5.0; }
            else if (d === "10K") { finalLabel = "10 km"; parsedKm = 10.0; }
            else if (d === "HALF") { finalLabel = "Półmaraton"; parsedKm = 21.097; }
            else if (d === "MARATHON") { finalLabel = "Maraton"; parsedKm = 42.195; }
            else if (d === "OTHER") {
              finalLabel = customDistance || "Inny dystans";
              const numMatch = finalLabel.replace(',', '.').match(/[\d.]+/);
              parsedKm = numMatch ? parseFloat(numMatch[0]) : 0;
            }

            return {
              race_id: currentRaceId,
              label: finalLabel,
              distance_km: parsedKm
            };
          });
          
          const { error: optionsError } = await supabase.from("race_options").insert(optionsToInsert);
          if (optionsError) {
            throw new Error("Błąd podczas zapisywania dystansów: " + optionsError.message + " | " + optionsError.details);
          }
        }
      }

      alert(action === "edit" ? "Zaktualizowano bieg i dystanse!" : "Dodano nowy bieg wraz z dystansami!");
      
      setFormData({ title: "", race_date: "", description: "", city: "", signup_url: "" });
      setSelectedDistances([]);
      setCustomDistance("");
      router.push("/admin/races");
      fetchRaces();

    } catch (error: any) {
      alert("UWAGA BŁĄD: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Na pewno chcesz usunąć ten bieg? Ta akcja jest nieodwracalna!")) return;
    await supabase.from("race_options").delete().eq("race_id", id);
    await supabase.from("participations").delete().eq("race_id", id);
    await supabase.from("races").delete().eq("id", id);
    fetchRaces();
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "#00d4ff" }}>Zarządzaj Biegami</h1>
        <Link href="/" style={{ color: "#666", textDecoration: "none", fontWeight: 900 }}>← POWRÓT</Link>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "#111", padding: "40px", borderRadius: "25px", border: "1px solid #222", marginBottom: "60px" }}>
        <h2 style={{ marginBottom: "25px", fontSize: "1.5rem" }}>
          {action === "edit" ? "Edytuj bieg" : action === "copy" ? "Skopiuj bieg" : "Dodaj nowy bieg"}
        </h2>
        
        <div style={{ display: "grid", gap: "20px" }}>
          <input required placeholder="Nazwa biegu (np. 10. Bieg Walentynkowy)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={inputS} />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <input required type="date" value={formData.race_date} onChange={e => setFormData({...formData, race_date: e.target.value})} style={{ ...inputS, colorScheme: "dark" }} />
            <input required placeholder="Miasto" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={inputS} />
          </div>
          
          <input placeholder="Lokalizacja / Opis (np. Park Lotników, Kraków)" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={inputS} />
          <input placeholder="Link do strony WWW / zapisów (opcjonalnie)" value={formData.signup_url} onChange={e => setFormData({...formData, signup_url: e.target.value})} style={inputS} />
          
          <div style={{ marginTop: "10px", padding: "20px", background: "#050505", borderRadius: "15px", border: "1px solid #1a1a1a" }}>
            <p style={{ fontWeight: 900, fontSize: "0.85rem", color: "#666", marginBottom: "15px", letterSpacing: "1px" }}>DOSTĘPNE DYSTANSE:</p>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
              {availableDistances.map(d => (
                <label key={d} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "0.9rem", fontWeight: 700 }}>
                  <input type="checkbox" checked={selectedDistances.includes(d)} onChange={() => handleDistanceToggle(d)} /> {d}
                </label>
              ))}
            </div>
            
            {selectedDistances.includes("OTHER") && (
              <div style={{ marginTop: "15px" }}>
                <input 
                  type="text" 
                  required
                  placeholder="Wpisz niestandardowy dystans (np. 15K, Ultra, Bieg z psem)" 
                  value={customDistance} 
                  onChange={e => setCustomDistance(e.target.value)} 
                  style={{ ...inputS, background: "#111", border: "1px solid #00d4ff" }} 
                />
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
            {action === "edit" || action === "copy" ? (
              <button type="button" onClick={() => { router.push("/admin/races"); setFormData({title:"", race_date:"", description:"", city:"", signup_url:""}); setSelectedDistances([]); setCustomDistance(""); }} style={btnCancelS}>
                ANULUJ
              </button>
            ) : <div/>}
            <button type="submit" disabled={loading} style={btnS}>
              {loading ? "Zapisywanie..." : action === "edit" ? "ZAPISZ ZMIANY" : "DODAJ BIEG"}
            </button>
          </div>
        </div>
      </form>

      <h2 style={{ marginBottom: "20px", fontSize: "1.5rem" }}>Baza biegów</h2>
      <div style={{ display: "grid", gap: "15px" }}>
        {races.map(r => (
          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#050505", padding: "20px", borderRadius: "15px", border: "1px solid #111" }}>
            <div>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "1.2rem" }}>{r.title}</h3>
              <p style={{ margin: 0, color: "#666", fontSize: "0.8rem", marginTop: "5px" }}>{r.city} | {r.race_date}</p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Link href={`/admin/races?id=${r.id}&action=copy`} style={btnCopyS}>KOPIUJ</Link>
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
const btnCopyS = { background: "#444", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "8px", fontWeight: 900, cursor: "pointer", fontSize: "0.7rem", textDecoration: "none" };