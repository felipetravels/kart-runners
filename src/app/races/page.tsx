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
    title: "", race_date: "", description: "", second_dist: "", location: "", link: "" 
  });

  useEffect(() => {
    if (raceId && (action === "edit" || action === "copy")) {
      async function load() {
        const { data } = await supabase.from("races").select("*").eq("id", raceId).single();
        if (data) {
          const fData = { ...data };
          if (action === "copy") delete fData.id;
          setForm(fData);
        }
      }
      load();
    }
  }, [raceId, action]);

  const save = async () => {
    const { error } = await supabase.from("races").upsert({ ...form, id: action === "copy" ? undefined : (raceId || undefined) });
    if (!error) router.push("/");
  };

  const remove = async () => {
    if (confirm("Usunąć ten bieg?")) {
      await supabase.from("races").delete().eq("id", raceId);
      router.push("/");
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "100px 20px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", background: "#0a0a0a", padding: "40px", borderRadius: "30px", border: "1px solid #1a1a1a" }}>
        <h2 style={{ color: "#00d4ff", fontWeight: 900, marginBottom: "30px" }}>{action === "edit" ? "EDYTUJ BIEG" : "NOWY BIEG"}</h2>
        
        <label style={lab}>NAZWA BIEGU</label>
        <input style={inp} value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        
        <label style={lab}>DATA (WYBIERZ Z KALENDARZA)</label>
        <input type="date" style={inp} value={form.race_date} onChange={e => setForm({...form, race_date: e.target.value})} />
        
        <label style={lab}>DYSTANS GŁÓWNY (5, 10, 21.1, 42.2)</label>
        <input style={inp} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="np. 21.1" />
        
        <label style={lab}>DRUGI DYSTANS (OPCJONALNIE)</label>
        <input style={inp} value={form.second_dist} onChange={e => setForm({...form, second_dist: e.target.value})} />
        
        <label style={lab}>LINK DO BIEGU</label>
        <input style={inp} value={form.link} onChange={e => setForm({...form, link: e.target.value})} />

        <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
          <button onClick={save} style={btnMain}>ZAPISZ</button>
          {action === "edit" && (
            <>
              <button onClick={() => router.push(`/races?id=${raceId}&action=copy`)} style={btnSec}>KOPIUJ</button>
              <button onClick={remove} style={btnDel}>USUŃ</button>
            </>
          )}
        </div>
        <Link href="/" style={{ display: "block", textAlign: "center", marginTop: "20px", color: "#444", textDecoration: "none" }}>POWRÓT</Link>
      </div>
    </div>
  );
}

const lab = { display: "block", color: "#444", fontWeight: 900, fontSize: "0.7rem", marginBottom: "8px" };
const inp = { width: "100%", padding: "15px", background: "#111", border: "1px solid #222", borderRadius: "12px", color: "#fff", marginBottom: "20px" };
const btnMain = { flex: 2, padding: "15px", background: "#00d4ff", color: "#000", fontWeight: 900, borderRadius: "12px", border: "none" };
const btnSec = { flex: 1, padding: "15px", background: "#f1c40f", color: "#000", fontWeight: 900, borderRadius: "12px", border: "none" };
const btnDel = { flex: 1, padding: "15px", background: "#ff4d4d", color: "#fff", fontWeight: 900, borderRadius: "12px", border: "none" };

export default function Page() { return <Suspense><RacesContent /></Suspense>; }
