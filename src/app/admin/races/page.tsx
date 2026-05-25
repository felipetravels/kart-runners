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
  
  const [raceOptions, setRaceOptions] = useState<{label: string, distance_km: number}[]>([]);
  const [customLabel, setCustomLabel] = useState("");
  const [customKm, setCustomKm] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchRaces();
    checkAdminStatus();
    if (editId) {
      loadRace(editId, action);
    }
  }, [editId, action]);

  async function checkAdminStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const email = user.email?.toLowerCase() || "";
      if (email.includes("filip.cialowicz") || email.includes("filip")) {
        setIsAdmin(true);
      }
    }
  }

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
      setRaceOptions(optData.map(o => ({
        label: o.label,
        distance_km: Number(o.distance_km)
      })));
    }
  }

  const addPreset = (label: string, distance_km: number) => {
    if (!raceOptions.find(o => o.label === label)) {
      setRaceOptions([...raceOptions, { label, distance_km }]);
    }
  };

  const addCustom = () => {
    if (customLabel) {
      const km = parseFloat(customKm.replace(',', '.')) || 0;
      if (!raceOptions.find(o => o.label === customLabel)) {
        setRaceOptions([...raceOptions, { label: customLabel, distance_km: km }]);
        setCustomLabel("");
        setCustomKm("");
      }
    }
  };

  const removeOption = (labelToRemove: string) => {
    setRaceOptions(raceOptions.filter(o => o.label !== labelToRemove));
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
        
        if (raceOptions.length > 0) {
          const optionsToInsert = raceOptions.map(o => ({
            race_id: currentRaceId,
            label: o.label,
            distance_km: o.distance_km
          }));
          
          const { error: optionsError } = await supabase.from("race_options").insert(optionsToInsert);
          if (optionsError) {
            throw new Error("Błąd podczas zapisywania dystansów: " + optionsError.message);
          }
        }
      }

      alert(action === "edit" ? "Zaktualizowano bieg i dystanse!" : "Dodano nowy bieg wraz z dystansami!");
      
      setFormData({ title: "", race_date: "", description: "", city: "", signup_url: "" });
      setRaceOptions([]);
      setCustomLabel("");
      setCustomKm("");
      router.push("/admin/races");
      fetchRaces();

    } catch (error: any) {
      alert("UWAGA BŁĄD: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      alert("Błąd: Tylko administrator (Filip) posiada uprawnienia do usuwania biegów.");
      return;
    }
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
            
            <p style={{ fontWeight: 900, fontSize: "0.85rem", color: "#666", marginBottom: "15px", letterSpacing: "1px" }}>WYBRANE DYSTANSE DLA BIEGU:</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "25px" }}>
              {raceOptions.length === 0 && <span style={{ color: "#444", fontSize: "0.9rem", fontWeight: 700 }}>Brak dystansów. Dodaj je poniżej.</span>}
              {raceOptions.map((opt, i) => (
                <div key={i} style={{ background: "#00d4ff", color: "#000", padding: "8px 15px", borderRadius: "8px", fontWeight: 900, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "10px" }}>
                  {opt.label} ({opt.distance_km} km)
                  <button type="button" onClick={() => removeOption(opt.label)} style={{ background: "transparent", border: "none", color: "#000", cursor: "pointer", fontWeight: 900, padding: "0 5px", fontSize: "1rem" }}>✕</button>
                </div>
              ))}
            </div>

            <p style={{ fontWeight: 900, fontSize: "0.85rem", color: "#666", marginBottom: "15px", letterSpacing: "1px" }}>SZYBKIE DODAWANIE:</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "25px" }}>
              <button type="button" onClick={() => addPreset("5 km", 5)} style={presetBtnS}>+ 5 km</button>
              <button type="button" onClick={() => addPreset("10 km", 10)} style={presetBtnS}>+ 10 km</button>
              <button type="button" onClick={() => addPreset("Półmaraton", 21.097)} style={presetBtnS}>+ Półmaraton</button>
              <button type="button" onClick={() => addPreset("Maraton", 42.195)} style={presetBtnS}>+ Maraton</button>
            </div>
            
            <p style={{ fontWeight: 900, fontSize: "0.85rem", color: "#666", marginBottom: "15px", letterSpacing: "1px" }}>LUB DODAJ INNY (NIESTANDARDOWY):</p>
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <input 
                placeholder="Nazwa (np. Ultra)" 
                value={customLabel} 
                onChange={e => setCustomLabel(e.target.value)} 
                style={{ ...inputS, flex: 2, background: "#111", border: "1px solid #333" }} 
              />
              <input 
                placeholder="Kilometry (np. 50.5)" 
                type="number" step="0.01" 
                value={customKm} 
                onChange={e => setCustomKm(e.target.value)} 
                style={{ ...inputS, flex: 1, background: "#111", border: "1px solid #333" }} 
              />
              <button type="button" onClick={addCustom} style={{ ...btnS, flex: 1, padding: "10px", borderRadius: "10px" }}>DODAJ DO LISTY</button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
            {action === "edit" || action === "copy" ? (
              <button type="button" onClick={() => { router.push("/admin/races"); setFormData({title:"", race_date:"", description:"", city:"", signup_url:""}); setRaceOptions([]); }} style={btnCancelS}>
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
              {isAdmin && (
                <button onClick={() => handleDelete(r.id)} style={btnDelS}>USUŃ</button>
              )}
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
const presetBtnS = { background: "#222", color: "#fff", border: "1px solid #333", padding: "8px 15px", borderRadius: "8px", fontWeight: 900, cursor: "pointer", fontSize: "0.8rem" };
const btnCancelS = { background: "#333", color: "#fff", padding: "12px 30px", borderRadius: "10px", fontWeight: 900, border: "none", cursor: "pointer", fontSize: "0.8rem" };
const btnDelS = { background: "transparent", color: "#ff4444", border: "1px solid #ff4444", padding: "10px 15px", borderRadius: "8px", fontWeight: 900, cursor: "pointer", fontSize: "0.7rem" };
const btnEditS = { background: "#333", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "8px", fontWeight: 900, cursor: "pointer", fontSize: "0.7rem", textDecoration: "none" };
const btnCopyS = { background: "#444", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "8px", fontWeight: 900, cursor: "pointer", fontSize: "0.7rem", textDecoration: "none" };
