"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [races, setRaces] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [tab, setTab] = useState("races");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email !== "filip.cialowicz@gmail.com") {
        window.location.href = "/";
      }
      setUser(session?.user);
    });
    
    supabase.from("races").select("*").order("race_date", { ascending: false }).then(({ data }) => setRaces(data || []));
    supabase.from("profiles").select("*").order("display_name").then(({ data }) => setProfiles(data || []));
  }, []);

  const deleteUser = async (id: string) => {
    if (!confirm("UWAGA: Czy na pewno chcesz całkowicie usunąć tego zawodnika?")) return;
    // Uwaga: Usuwamy profil. W pełnej wersji wymaga to też usunięcia z Auth, ale tu czyścimy profil bazy.
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) alert(error.message);
    else setProfiles(profiles.filter(p => p.id !== id));
  };

  if (!user) return null;

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", padding: 20, color: "#fff" }}>
      <h1 style={{ fontWeight: 900, color: "#ffaa00", fontSize: "2.5rem" }}>PANEL ADMINA</h1>
      
      <div style={{ display: "flex", gap: 20, margin: "30px 0" }}>
        <button onClick={() => setTab("races")} style={tab === "races" ? activeTab : inactiveTab}>BIEGI</button>
        <button onClick={() => setTab("users")} style={tab === "users" ? activeTab : inactiveTab}>ZAWODNICY</button>
      </div>

      {tab === "races" ? (
        <div style={{ display: "grid", gap: 15 }}>
          {races.map(r => (
            <div key={r.id} style={rowS}>
              <div><div style={{fontWeight:900}}>{r.title}</div><div style={{fontSize:"0.8rem", opacity:0.5}}>{r.race_date}</div></div>
              <a href={`/admin/edit?id=${r.id}`} style={btnB}>EDYTUJ</a>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 15 }}>
          {profiles.map(p => (
            <div key={p.id} style={rowS}>
              <div style={{display:"flex", alignItems:"center", gap:15}}>
                <div style={avS}>{p.avatar_url ? <img src={p.avatar_url} style={{width:"100%", height:"100%", objectFit:"cover"}} /> : "🏃"}</div>
                <div><div style={{fontWeight:900}}>{p.display_name}</div><div style={{fontSize:"0.8rem", opacity:0.5}}>{p.email}</div></div>
              </div>
              <button onClick={() => deleteUser(p.id)} style={{ background: "#ff4444", color: "#fff", border: "none", padding: "8px 15px", borderRadius: 8, fontWeight: 900, cursor: "pointer" }}>USUŃ</button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
const rowS = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "rgba(255,255,255,0.05)", borderRadius: 15, border: "1px solid #333" };
const activeTab = { background: "#ffaa00", color: "#000", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: 900, cursor: "pointer" };
const inactiveTab = { background: "transparent", color: "#fff", border: "1px solid #333", padding: "10px 20px", borderRadius: 10, cursor: "pointer" };
const btnB = { background: "#00d4ff", color: "#000", padding: "8px 15px", borderRadius: 8, textDecoration: "none", fontWeight: 900, fontSize: "0.8rem" };
const avS = { width: 40, height: 40, borderRadius: "50%", background: "#333", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" };
