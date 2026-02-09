"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ totalKm: 0, raceCount: 0 });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/login");
        return;
      }
      setUser(authUser);

      // 1. Pobierz dane profilu
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();
      setProfile(profileData);

      // 2. Pobierz wyniki użytkownika
      const { data: userResults } = await supabase
        .from("race_results")
        .select(`
          finish_time_seconds,
          races ( title, race_date ),
          race_options ( label, distance_km )
        `)
        .eq("user_id", authUser.id);

      if (userResults) {
        const castedResults = userResults as any[];
        setResults(castedResults);
        
        // Obliczanie sumy kilometrów z poprawionym typowaniem
        const total = castedResults.reduce((acc, curr) => {
          const km = curr.race_options?.distance_km || 0;
          return acc + km;
        }, 0);
        
        setStats({ totalKm: total, raceCount: castedResults.length });
      }
      setLoading(false);
    }
    loadProfileData();
  }, [router]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) return <div style={{ color: "#fff", padding: 50, textAlign: "center" }}>Ładowanie profilu...</div>;

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      {/* NAGŁÓWEK PROFILU */}
      <section style={{ display: "flex", alignItems: "center", gap: 30, marginBottom: 50 }}>
        <div style={{ 
          width: 100, height: 100, borderRadius: "50%", 
          background: "linear-gradient(135deg, #00d4ff, #0055ff)", 
          display: "flex", alignItems: "center", justifyContent: "center", 
          fontSize: "2.5rem", fontWeight: 900, color: "#000" 
        }}>
          {profile?.display_name?.charAt(0).toUpperCase() || "?"}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: 900 }}>{profile?.display_name}</h1>
          <p style={{ margin: "5px 0", opacity: 0.6, fontSize: "1.1rem" }}>
            Drużyna: <span style={{ color: "#00d4ff" }}>{profile?.team || "Brak"}</span>
          </p>
          <p style={{ margin: 0, opacity: 0.4, fontSize: "0.9rem" }}>{user?.email}</p>
        </div>
      </section>

      {/* KARTY STATYSTYK */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 50 }}>
        <div style={statCardStyle}>
          <span style={statLabelStyle}>Całkowity dystans</span>
          <div style={statValueStyle}>{stats.totalKm.toFixed(1)} <span style={{ fontSize: "1rem" }}>KM</span></div>
        </div>
        <div style={statCardStyle}>
          <span style={statLabelStyle}>Ukończone biegi</span>
          <div style={statValueStyle}>{stats.raceCount}</div>
        </div>
      </div>

      {/* HISTORIA WYNIKÓW */}
      <section>
        <h2 style={{ fontSize: "1.8rem", marginBottom: 25, borderBottom: "1px solid #333", paddingBottom: 10 }}>Twoje Starty</h2>
        {results.length > 0 ? (
          <div style={{ display: "grid", gap: 15 }}>
            {results.map((res, i) => (
              <div key={i} style={resultRowStyle}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{res.races?.title}</div>
                  <div style={{ opacity: 0.5, fontSize: "0.85rem" }}>
                    {res.races?.race_date} | {res.race_options?.label || "Dystans"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#00ff00" }}>
                    {formatTime(res.finish_time_seconds)}
                  </div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.5 }}>
                    {res.race_options?.distance_km 
                      ? (res.finish_time_seconds / 60 / res.race_options.distance_km).toFixed(2) 
                      : "0.00"} min/km
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ opacity: 0.5, textAlign: "center", padding: 40 }}>Nie dodałeś jeszcze żadnych wyników.</p>
        )}
      </section>
    </main>
  );
}

const statCardStyle: React.CSSProperties = { background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.1)" };
const statLabelStyle: React.CSSProperties = { display: "block", opacity: 0.5, fontSize: "0.9rem", textTransform: "uppercase", marginBottom: 10 };
const statValueStyle: React.CSSProperties = { fontSize: "3rem", fontWeight: 900 };
const resultRowStyle: React.CSSProperties = { background: "rgba(255,255,255,0.03)", padding: "20px 25px", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(255,255,255,0.05)" };