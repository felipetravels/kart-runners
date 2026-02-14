"use client";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function RacesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const raceId = searchParams.get("id");
  const action = searchParams.get("action");
  const [form, setForm] = useState({ 
    title: "", 
    race_date: "", 
    location: "", 
    description: "", 
    second_dist: "", 
    link: "" 
  });

  useEffect(() => {
    if (raceId && (action === "edit" || action === "copy")) {
      async function loadRace() {
        const { data } = await supabase.from("races").select("*").eq("id", raceId).single();
        if (data) {
          // Jeśli kopiujemy, usuwamy ID, aby stworzyć nowy rekord
          const formData = { ...data };
          if (action === "copy") delete formData.id;
          setForm(formData);
        }
      }
      loadRace();
    }
  }, [raceId, action]);

  const handleSave = async () => {
    const { error } = await supabase.from("races").upsert({ 
      ...form, 
      id: action === "copy" ? undefined : (raceId || undefined) 
    });
    if (!error) router.push("/");
  };

  const handleDelete = async () => {
    if (confirm("Czy na pewno chcesz usunąć ten bieg?")) {
      await supabase.from("races").delete().eq("id", raceId);
      router.push("/");
    }
  };

  if (action === "add" || action === "edit" || action === "copy") {
    return (
      <div style={{minHeight: "100vh", background: "#050505", color: "#fff", padding: "60px 20px", fontFamily: "Inter, sans-serif"}}>
        <div style={{maxWidth: "600px", margin: "0 auto"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px"}}>
            <h1 style={{color: "#00d4ff", fontWeight: 900, fontSize: "1.8rem", margin: 0}}>
              {action === "add" ? "NOWY BIEG" : action === "copy" ? "KOPIUJ BIEG" : "EDYTUJ BIEG"}
            </h1>
            <button onClick={() => router.push("/")} style={backBtn}>POWRÓT</button>
          </div>

          <div style={formBox}>
            <label style={lab}>NAZWA WYDARZENIA</label>
            <input style={inp} value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="np. Grand Prix Krakowa" />
            
            <label style={lab}>DATA (KALENDARZ)</label>
            <input type="date" style={inp} value={form.race_date} onChange={e => setForm({...form, race_date: e.target.value})} />
            
            <label style={lab}>DYSTANS GŁÓWNY (KM)</label>
            <input style={inp} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="np. 10" />
            
            <label style={lab}>DRUGI DYSTANS (OPCJONALNIE)</label>
            <input style={inp} value={form.second_dist} onChange={e => setForm({...form, second_dist: e.target.value})} placeholder="np. 5" />
            
            <label style={lab}>LOKALIZACJA</label>
            <input style={inp} value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="np. Kraków, Błonia" />
            
            <label style={lab}>LINK DO ZAPISÓW / INFO</label>
            <input style={inp} value={form.link} onChange={e => setForm({...form, link: e.target.value})} placeholder="https://..." />

            <div style={{display: "flex", gap: "10px", marginTop: "20px"}}>
              <button onClick={handleSave} style={saveBtn}>ZAPISZ ZMIANY</button>
              {raceId && action === "edit" && (
                <>
                  <button onClick={() => router.push(`/races?id=${raceId}&action=copy`)} style={copyBtn}>KOPIUJ</button>
                  <button onClick={handleDelete} style={delBtn}>USUŃ</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div style={{color: "#fff", padding: "100px", textAlign: "center"}}>Brak wybranego działania. <Link href="/" style={{color: "#00d4ff"}}>Wróć do strony głównej</Link></div>;
}

const formBox = { background: "rgba(255,255,255,0.02)", padding: "30px", borderRadius: "20px", border: "1px solid #1a1a1a" };
const lab = { display: "block", color: "#444", fontSize: "0.65rem", fontWeight: 800, marginBottom: "8px", letterSpacing: "1px" };
const inp = { width: "100%", padding: "15px", background: "#0a0a0a", border: "1px solid #222", borderRadius: "10px", color: "#fff", marginBottom: "20px", fontSize: "0.9rem" };
const backBtn = { background: "transparent", color: "#666", border: "1px solid #333", padding: "8px 20px", borderRadius: "8px", fontWeight: 800, cursor: "pointer" };
const saveBtn = { flex: 2, padding: "15px", background: "#00d4ff", color: "#000", border: "none", borderRadius: "10px", fontWeight: 900, cursor: "pointer" };
const copyBtn = { flex: 1, padding: "15px", background: "#f1c40f", color: "#000", border: "none", borderRadius: "10px", fontWeight: 900, cursor: "pointer" };
const delBtn = { flex: 1, padding: "15px", background: "#ff4d4d", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 900, cursor: "pointer" };

export default function Page() { return <Suspense><RacesContent /></Suspense>; }
