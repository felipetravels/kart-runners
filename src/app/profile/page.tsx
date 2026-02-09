"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({ display_name: "", team: "", avatar_url: "" });

  useEffect(() => {
    async function getProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/login"; return; }
      setUser(session.user);
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (data) setProfile({ display_name: data.display_name || "", team: data.team || "KART", avatar_url: data.avatar_url || "" });
      setLoading(false);
    }
    getProfile();
  }, []);

  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      // BLOKADA 2MB
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 2) {
        alert("Zdjęcie jest za duże! Max 2MB. Twoje ma: " + fileSizeMB.toFixed(2) + "MB");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
      setProfile({ ...profile, avatar_url: publicUrl });
      alert("Profilówka zmieniona!");
    } catch (e: any) { alert(e.message); } finally { setUploading(false); }
  };

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: 20, color: "#fff" }}>
      <h1 style={{ fontWeight: 900, fontSize: "2.5rem", marginBottom: 30 }}>PROFIL</h1>
      <div style={cardS}>
        <div style={avatarCircle}>
          {profile.avatar_url ? <img src={profile.avatar_url} style={imgS} /> : "BRAK"}
        </div>
        <label style={uploadBtn}>
          {uploading ? "SŁAŃSKO..." : "WYBIERZ FOTO (MAX 2MB)"}
          <input type="file" accept="image/*" onChange={uploadAvatar} style={{display:"none"}} />
        </label>
      </div>
      <div style={{marginTop: 30, display: "flex", flexDirection: "column", gap: 15}}>
        <input style={inS} value={profile.display_name} onChange={e => setProfile({...profile, display_name: e.target.value})} />
        <button style={saveBtn} onClick={async () => {
           await supabase.from("profiles").update({ display_name: profile.display_name }).eq("id", user.id);
           alert("Zapisano!");
        }}>ZAPISZ DANE</button>
      </div>
    </main>
  );
}
const cardS = { background: "rgba(255,255,255,0.05)", padding: 40, borderRadius: 24, textAlign: "center" as const, border: "1px solid #333" };
const avatarCircle = { width: 150, height: 150, borderRadius: "50%", background: "#222", margin: "0 auto 20px", overflow: "hidden", border: "4px solid #00d4ff", display: "flex", alignItems: "center", justifyContent: "center" };
const imgS = { width: "100%", height: "100%", objectFit: "cover" as const };
const uploadBtn = { background: "#ffaa00", color: "#000", padding: "10px 20px", borderRadius: 10, fontWeight: 900, cursor: "pointer", fontSize: "0.8rem" };
const inS = { background: "#111", border: "1px solid #333", padding: 15, borderRadius: 12, color: "#fff" };
const saveBtn = { background: "#00d4ff", color: "#000", padding: 15, borderRadius: 12, fontWeight: 900, border: "none" };
