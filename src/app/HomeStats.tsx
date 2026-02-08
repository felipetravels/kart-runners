"use client";

export default function HomeStats({ results }: { results: any[] }) {
  // Obliczamy sumę km ze wszystkich wyników
  const totalKm = results.reduce((acc, r) => {
    const dist = r.race_options?.distance_km || 0;
    return acc + Number(dist);
  }, 0);

  return (
    <section style={{ 
      background: "linear-gradient(90deg, #004e92, #000428)", 
      padding: "40px 20px", 
      borderRadius: 20, 
      textAlign: "center",
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      border: "1px solid rgba(255,255,255,0.1)"
    }}>
      <h3 style={{ margin: 0, opacity: 0.7, fontSize: "0.9rem", letterSpacing: "2px", textTransform: "uppercase" }}>
        Wspólnie przebiegliśmy
      </h3>
      <div style={{ fontSize: "4rem", fontWeight: 900, color: "#fff", marginTop: 10 }}>
        {totalKm.toFixed(1)} <span style={{ fontSize: "1.5rem", opacity: 0.6 }}>KM</span>
      </div>
    </section>
  );
}