"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState({ h: "0", m: "0", s: "0" });

  useEffect(() => {
    getProfileData();
  }, []);

  async function getProfileData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return (window.location.href = "/login");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      
      setProfile(profileData || { display_name: user.email?.split('@')[0] });

      const { data: statsData } = await supabase
        .from("v_user_totals")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      
      setStats(statsData);

      const { data: resultsData } = await supabase
        .from("race_results")
        .select(`
          id,
          time_seconds,
          races ( title, race_date ),
          race_options ( label, distance_km )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (resultsData) setResults(resultsData);
    } catch (error) {
      console.error("Błąd ładowania profilu:", error);
    } finally {
      setLoading(false);
    }
  }

  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !file) return;

      const fileExt = file.name.split('.').pop();
      // Unikalna nazwa pliku za każdym razem
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // 1. Wgrywanie do Storage
      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Pobranie adresu publicznego
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);

      // 3. Twardy zapis w tabeli profiles
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          avatar_url: publicUrl, 
          display_name: profile?.display_name || user.email?.split('@')[0] 
        });

      if (dbError) throw dbError;
      
      // 4. Aktualizacja stanu z "cache busterem" (timestamp), żeby wymusić odświeżenie foto
      setProfile((prev: any) => ({ ...prev, avatar_url: `${publicUrl}?t=${Date.now()}` }));
      alert("Zdjęcie zaktualizowane pomyślnie!");
    } catch (error: any) {
      alert("Błąd: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const secondsToHMS = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return { h: h.toString(), m: m.toString(), s: s.toString() };
  };

  const startEdit = (result: any) => {
    setEditingId(result.id);
    setEditTime(secondsToHMS(result.time_seconds));
  };

  const handleUpdate = async (id: string) => {
    const totalSeconds = (parseInt(editTime.h) * 3600) + (parseInt(editTime.m) * 60) + parseInt(editTime.s);
    const { error } = await supabase.from("race_results").update({ time_seconds: totalSeconds }).eq("id", id);
    if (error) alert("Błąd: " + error.message);
    else { setEditingId(null); getProfileData(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć ten wynik?")) return;
    const { error } = await supabase.from("race_results").delete().eq("id", id);
    if (error) alert("Błąd: " + error.message);
    else getProfileData();
  };

  // Obliczanie rekordów życiowych
  const records: Record<string, number> = {};
  results.forEach(res => {
    const label = res.race_options?.label || "Inny";
    if (!records[label] || res.time_seconds < records[label]) records[label] = res.time_seconds;
  });

  if (loading) return <div style={{ color: "#fff", padding: "100px", textAlign: "center" }}>Ładowanie danych profilu...</div>;

  return (
    <div style={{ 
      minHeight: "100vh", padding: "0 60px 100px 60px", backgroundColor: "#000", color: "#fff",
      backgroundImage: "linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url('/hero.png')",
      backgroundSize: "cover", backgroundAttachment: "fixed"
    }}>
      <header style={{ height: "125px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", color: "#00d4ff", fontWeight: 900 }}>← POWRÓT</Link>
        <h1 style={{ fontSize: "2rem", margin: 0, fontWeight: 900 }}>TWÓJ PROFIL</h1>
        <div style={{ width: "100px" }}></div>
      </header>

      <main style={{ maxWidth: "1000px", margin: "60px auto", display: "grid", gridTemplateColumns: "300px 1fr", gap: "60px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            width: "300px", height: "300px", borderRadius: "30px", backgroundColor: "#111", 
            border: "2px solid #00d4ff", overflow: "hidden", marginBottom: "20px",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ color: "#333", fontSize: "5rem" }}>👤</span>
            )}
          </div>
          <label style={{ background: "#00d4ff", color: "#000", padding: "12px 25px", borderRadius: "10px", fontWeight: 900, cursor: "pointer", display: "inline-block" }}>
            {uploading ? "WGRYWANIE..." : "ZMIEŃ ZDJĘCIE"}
            <input type="file" accept="image/*" onChange={uploadAvatar} disabled={uploading} style={{ display: "none" }} />
          </label>
        </div>

        <div>
          <h2 style={{ fontSize: "4rem", fontWeight: 900, margin: "0 0 10px 0", lineHeight: 1 }}>{profile?.display_name || "Zawodnik"}</h2>
          <p style={{ color: "#444", fontWeight: 900, letterSpacing: "2px", marginBottom: "40px" }}>KRAKÓW AIRPORT RUNNING TEAM</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
            <div style={statBoxS}>
              <p style={labelS}>ŁĄCZNY DYSTANS</p>
              <h3 style={valS}>{stats?.total_km?.toFixed(1) || "0.0"} km</h3>
            </div>
            <div style={statBoxS}>
              <p style={labelS}>LICZBA BIEGÓW</p>
              <h3 style={valS}>{stats?.race_count || "0"}</h3>
            </div>
          </div>

          <div style={{ ...statBoxS, marginTop: "30px", marginBottom: "50px" }}>
            <p style={labelS}>TWOJE REKORDY (PB)</p>
            {Object.keys(records).length === 0 ? (
              <div style={{ marginTop: "15px", color: "#666" }}>Brak rekordów. Dodaj swój pierwszy wynik!</div>
            ) : (
              <div style={{ gridGap: "10px", marginTop: "15px", display: "grid" }}>
                {Object.entries(records).map(([label, timeSec]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#aaa" }}>{label}:</span> 
                    <strong style={{ color: "#00d4ff" }}>{secondsToHMS(timeSec).h}h {secondsToHMS(timeSec).m}m {secondsToHMS(timeSec).s}s</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          <h3 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "20px", color: "#00d4ff" }}>HISTORIA STARTÓW</h3>
          <div style={{ display: "grid", gap: "15px" }}>
            {results.map((res) => (
              <div key={res.id} style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "15px", border: "1px solid #1a1a1a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px", flexWrap: "wrap" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "1.1rem" }}>{res.races?.title}</h4>
                    <p style={{ margin: "5px 0", color: "#666", fontSize: "0.85rem" }}>{res.races?.race_date} | Dystans: {res.race_options?.label}</p>
                  </div>
                  {editingId !== res.id && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#00d4ff" }}>{secondsToHMS(res.time_seconds).h}h {secondsToHMS(res.time_seconds).m}m {secondsToHMS(res.time_seconds).s}s</div>
                      <div style={{ marginTop: "10px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button onClick={() => startEdit(res)} style={btnSmallS}>EDYTUJ</button>
                        <button onClick={() => handleDelete(res.id)} style={{ ...btnSmallS, color: "#ff4444" }}>USUŃ</button>
                      </div>
                    </div>
                  )}
                </div>
                {editingId === res.id && (
                  <div style={{ marginTop: "20px", padding: "20px", background: "#050505", borderRadius: "10px", border: "1px solid #00d4ff" }}>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                      <input type="number" value={editTime.h} onChange={e => setEditTime({...editTime, h: e.target.value})} style={inputEditS} />
                      <input type="number" value={editTime.m} onChange={e => setEditTime({...editTime, m: e.target.value})} style={inputEditS} />
                      <input type="number" value={editTime.s} onChange={e => setEditTime({...editTime, s: e.target.value})} style={inputEditS} />
                    </div>
                    <button onClick={() => handleUpdate(res.id)} style={btnSaveS}>ZAPISZ</button>
                    <button onClick={() => setEditingId(null)} style={btnCancelS}>ANULUJ</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

const statBoxS = { background: "rgba(255,255,255,0.03)", padding: "30px", borderRadius: "20px", border: "1px solid #1a1a1a" };
const labelS = { color: "#444", fontWeight: 900, fontSize: "0.8rem", letterSpacing: "2px", margin: 0 };
const valS = { fontSize: "2.5rem", fontWeight: 900, color: "#00d4ff", margin: "10px 0 0 0" };
const inputEditS = { width: "100%", padding: "10px", background: "#000", border: "1px solid #333", color: "#fff", borderRadius: "8px" };
const btnSmallS = { background: "none", border: "none", color: "#00d4ff", fontWeight: 900, cursor: "pointer", fontSize: "0.7rem" };
const btnSaveS = { background: "#00d4ff", color: "#000", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 900, cursor: "pointer" };
const btnCancelS = { background: "#222", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 900, cursor: "pointer", marginLeft: "10px" };