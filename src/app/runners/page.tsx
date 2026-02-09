"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RunnersPage() {
  const [runners, setRunners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRunners() {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, team")
        .order("display_name", { ascending: true });
      if (data) setRunners(data);
      setLoading(false);
    }
    fetchRunners();
  }, []);

  const kartMain = runners.filter(r => r.team === "KART" || !r.team);
  const kartLight = runners.filter(r => r.team === "KART light");

  if (loading) return <div style={{ color: "#fff", padding: "50px", textAlign: "center" }}>Wczytywanie ekipy...</div>;

  const sectionStyle: React.CSSProperties = { background: "#111", padding: "20px", borderRadius: "20px", border: "1px solid #222" };
  const nameStyle: React.CSSProperties = { padding: "10px", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between" };

  return (
    <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      <h1 style={{ fontWeight: 900, textAlign: "center", marginBottom: "40px" }}>EKIPA KART</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
        {/* KART MAIN */}
        <div>
          <h2 style={{ color: "#00d4ff", fontSize: "1rem", marginBottom: "15px" }}>KART ({kartMain.length})</h2>
          <div style={sectionStyle}>
            {kartMain.map((r, i) => (
              <div key={i} style={nameStyle}>
                <span>{r.display_name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* KART LIGHT */}
        <div>
          <h2 style={{ color: "#00ff88", fontSize: "1rem", marginBottom: "15px" }}>KART light ({kartLight.length})</h2>
          <div style={sectionStyle}>
            {kartLight.map((r, i) => (
              <div key={i} style={nameStyle}>
                <span>{r.display_name}</span>
                <span style={{ fontSize: "0.6rem", background: "#00ff88", color: "#000", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>LIGHT</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
