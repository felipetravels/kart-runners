"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function getProfileData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Pobierz dane profilu
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        setProfile(profileData);

        // 2. Pobierz statystyki indywidualne z widoku v_user_totals
        const { data: statsData } = await supabase
          .from("v_user_totals")
          .select("*")
          .eq("id", user.id)
          .single();
        
        setStats(statsData);
      } catch (error) {
        console.error("Błąd ładowania profilu:", error);
      } finally {
        setLoading(false);
      }
    }
    getProfileData();
  }, []);

  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload do Storage
      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Aktualizacja linku w tabeli profiles
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      
      setProfile({ ...profile, avatar_url: publicUrl });
      alert("Zdjęcie zaktualizowane!");
    } catch (error) {
      alert("Błąd uploadu!");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div style={{ color: "#fff", padding: "100px", textAlign: "center" }}>Ładowanie profilu...</div>;

  return (
    <div style={{ 
      minHeight: "100vh", padding: "0 60px", backgroundColor: "#000", color: "#fff",
      backgroundImage: "linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.9)), url('/hero.png')",
      backgroundSize: "cover", backgroundAttachment: "fixed"
    }}>
      <header style={{ height: "125px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", color: "#00d4ff", fontWeight: 900 }}>← POWRÓT</Link>
        <h1 style={{ fontSize: "2rem", margin: 0, fontWeight: 900 }}>TWÓJ PROFIL</h1>
        <div style={{ width: "100px" }}></div>
      </header>

      <main style={{ maxWidth: "1000px", margin: "60px auto", display: "grid", gridTemplateColumns: "300px 1fr", gap: "60px" }}>
        {/* LEWA KOLUMNA: ZDJĘCIE */}
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
          <label style={{ 
            background: "#00d4ff", color: "#000", padding: "12px 25px", borderRadius: "10px", 
            fontWeight: 900, cursor: "pointer", display: "inline-block" 
          }}>
            {uploading ? "WGRYWANIE..." : "ZMIEŃ ZDJĘCIE"}
            <input type="file" accept="image/*" onChange={uploadAvatar} disabled={uploading} style={{ display: "none" }} />
          </label>
        </div>

        {/* PRAWA KOLUMNA: DANE I STATYSTYKI */}
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

          <div style={{ ...statBoxS, marginTop: "30px" }}>
            <p style={labelS}>TWOJE REKORDY (PB)</p>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
              <div><span style={{ color: "#444" }}>5K:</span> <strong style={{ marginLeft: "10px" }}>--:--</strong></div>
              <div><span style={{ color: "#444" }}>10K:</span> <strong style={{ marginLeft: "10px" }}>--:--</strong></div>
              <div><span style={{ color: "#444" }}>21K:</span> <strong style={{ marginLeft: "10px" }}>--:--</strong></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const statBoxS = { background: "rgba(255,255,255,0.03)", padding: "30px", borderRadius: "20px", border: "1px solid #1a1a1a" };
const labelS = { color: "#444", fontWeight: 900, fontSize: "0.8rem", letterSpacing: "2px", margin: 0 };
const valS = { fontSize: "2.5rem", fontWeight: 900, color: "#00d4ff", margin: "10px 0 0 0" };