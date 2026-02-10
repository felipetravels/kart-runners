"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({ display_name: "", team: "", avatar_url: "" });
  const [stats, setStats] = useState({ total_km: 0, total_starts: 0 });
  const [distStats, setDistStats] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return (h > 0 ? h.toString().padStart(2,'0')+":" : "") + m.toString().padStart(2,'0')+":" + sec.toString().padStart(2,'0');
  };

  useEffect(() => {
    async function getFullData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/login"; return; }
      const u = session.user;
      setUser(u);

      const [prof, res] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", u.id).single(),
        supabase.from("race_results").select("*, races(title, race_date, city), race_options(distance_km, label)").eq("user_id", u.id)
      ]);

      if (prof.data) setProfile(prof.data);
      
      if (res.data) {
        const data = res.data;
        setStats({
          total_km: data.reduce((acc, r) => acc + (r.race_options?.distance_km || 0), 0),
          total_starts: data.length
        });

        // Obliczanie PB i liczby biegów per dystans
        const distances = [5, 10, 21.097, 42.195];
        const dStats = distances.map(d => {
          const filtered = data.filter(r => r.race_options?.distance_km === d);
          const best = filtered.length > 0 ? Math.min(...filtered.map(r => r.time_seconds)) : null;
          return { dist: d, count: filtered.length, pb: best };
        });
        setDistStats(dStats);
        
        // Historia startów od najstarszych
        setHistory(data.sort((a, b) => new Date(a.races.race_date).getTime() - new Date(b.races.race_date).getTime()));
      }
      setLoading(false);
    }
    getFullData();
  }, []);

  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;
      if (file.size / (1024 * 1024) > 2) { alert("Max 2MB!"); return; }

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;
      await supabase.storage.from("avatars").upload(filePath, file);
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (e: any) { alert(e.message); } finally { setUploading(false); }
  };

  const saveProfile = async () => {
    await supabase.from("profiles").update({ display_name: profile.display_name, team: profile.team }).eq("id", user.id);
    alert("Profil zaktualizowany!");
  };

  if (loading) return <div style={{ padding: 100, textAlign: "center", color: "#fff" }}>WCZYTYWANIE STATYSTYK...</div>;

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px", color: "#fff" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 30 }}>
        
        {/* LEWA KOLUMNA: DANE I FOTO */}
        <section style={cardS}>
          <div style={avatarCircle}>
            {profile.avatar_url ? <img src={profile.avatar_url} style={imgS} /> : "🏃"}
          </div>
          <label style={uploadBtn}>
            {uploading ? "WGRYWANIE..." : "ZMIEŃ ZDJĘCIE"}
            <input type="file" accept="image/*" onChange={uploadAvatar} style={{display:"none"}} />
          </label>

          <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 15, textAlign: "left" }}>
            <label style={lab}>NAZWA ZAWODNIKA</label>
            <input style={inS} value={profile.display_name} onChange={e => setProfile({...profile, display_name: e.target.value})} />
            
            <label style={lab}>DRUŻYNA</label>
            <select style={inS} value={profile.team} onChange={e => setProfile({...profile, team: e.target.value})}>
              <option value="KART">TEAM KART</option>
              <option value="KART light">TEAM KART LIGHT</option>
            </select>
            
            <button style={saveBtn} onClick={saveProfile}>ZAPISZ ZMIANY</button>
          </div>
        </section>

        {/* PRAWA KOLUMNA: STATYSTYKI */}
        <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ ...cardS, display: "flex", justifyContent: "space-around" }}>
            <div style={{textAlign:"center"}}><span style={lab}>TOTAL KM</span><div style={val}>{stats.total_km.toFixed(1)}</div></div>
            <div style={{textAlign:"center"}}><span style={lab}>STARTY</span><div style={val}>{stats.total_starts}</div></div>
          </div>

          <div style={cardS}>
            <h3 style={{marginTop:0, fontSize:"1rem", borderBottom:"1px solid #333", paddingBottom:10}}>REKORDY ŻYCIOWE (PB)</h3>
            <table style={{width:"100%", marginTop:15}}>
              <thead><tr style={{fontSize:"0.7rem", opacity:0.5}}><th align="left">DYSTANS</th><th align="center">BIEGI</th><th align="right">BEST</th></tr></thead>
              <tbody>
                {distStats.map(ds => (
                  <tr key={ds.dist} style={{borderBottom:"1px solid #222"}}>
                    <td style={{padding:"10px 0", fontWeight:900}}>{ds.dist === 21.097 ? "HM" : ds.dist === 42.195 ? "M" : ds.dist + "k"}</td>
                    <td align="center">{ds.count}</td>
                    <td align="right" style={{color:"#00ff88", fontWeight:900}}>{ds.pb ? formatTime(ds.pb) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* HISTORIA STARTÓW */}
      <section style={{ ...cardS, marginTop: 30 }}>
        <h3 style={{marginTop:0, fontSize:"1rem", borderBottom:"1px solid #333", paddingBottom:10}}>MOJA HISTORIA STARTÓW (OD NAJSTARSZYCH)</h3>
        <div style={{marginTop:15}}>
          {history.map((h, i) => (
            <div key={i} style={{display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #222", fontSize:"0.9rem"}}>
              <span><span style={{opacity:0.5, marginRight:10}}>{h.races.race_date}</span> <strong>{h.races.title}</strong></span>
              <span style={{color:"#00d4ff", fontWeight:900}}>{formatTime(h.time_seconds)}</span>
            </div>
          ))}
          {history.length === 0 && <div style={{opacity:0.5, textAlign:"center", padding:20}}>Brak zarejestrowanych biegów.</div>}
        </div>
      </section>
    </main>
  );
}

const cardS = { background: "rgba(25,25,25,0.85)", backdropFilter: "blur(15px)", padding: "30px", borderRadius: "24px", border: "1px solid #333" };
const avatarCircle = { width: 120, height: 120, borderRadius: "50%", background: "#111", margin: "0 auto 20px", overflow: "hidden", border: "3px solid #00d4ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize:"2rem" };
const imgS = { width: "100%", height: "100%", objectFit: "cover" as const };
const uploadBtn = { background: "#ffaa00", color: "#000", padding: "8px 15px", borderRadius: "10px", fontWeight: 900, cursor: "pointer", fontSize: "0.7rem", display: "inline-block" };
const lab = { fontSize: "0.65rem", opacity: 0.5, letterSpacing: "1px", fontWeight: 900, textTransform: "uppercase" as const };
const inS = { background: "#000", border: "1px solid #333", padding: "12px", borderRadius: "10px", color: "#fff", width: "100%" };
const saveBtn = { background: "#00d4ff", color: "#000", padding: "12px", borderRadius: "10px", fontWeight: 900, border: "none", marginTop: 10, cursor: "pointer" };
const val = { fontSize: "2.5rem", fontWeight: 900, color: "#00d4ff" };
