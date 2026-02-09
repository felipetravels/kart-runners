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

  return (
    <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px", color: "#fff" }}>
      <h1 style={{ fontWeight: 900, textAlign: "center", marginBottom: "40px", fontSize: "2.5rem" }}>EKIPA KART</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
        <div>
          <h2 style={{ color: "#00d4ff", fontSize: "1.2rem", marginBottom: "15px", borderBottom: "2px solid #00d4ff", paddingBottom: "5px" }}>KART ({kartMain.length})</h2>
          <div style={listContainer}>
            {kartMain.map((r, i) => (
              <div key={i} style={itemStyle}>{r.display_name}</div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ color: "#00ff88", fontSize: "1.2rem", marginBottom: "15px", borderBottom: "2px solid #00ff88", paddingBottom: "5px" }}>KART light ({kartLight.length})</h2>
          <div style={listContainer}>
            {kartLight.map((r, i) => (
              <div key={i} style={itemStyle}>
                {r.display_name} <span style={tagStyle}>LIGHT</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

const listContainer = { background: "#111", borderRadius: "15px", border: "1px solid #222", overflow: "hidden" };
const itemStyle = { padding: "15px", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center" };
const tagStyle = { fontSize: "0.6rem", background: "#00ff88", color: "#000", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" };
