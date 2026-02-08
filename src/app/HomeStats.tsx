"use client";

export default function HomeStats({ results }: { results: any[] }) {
  const currentYear = new Date().getFullYear();
  
  const totalKm = results.reduce((acc, r) => {
    const raceYear = new Date(r.races?.race_date).getFullYear();
    if (raceYear === currentYear) {
      return acc + (r.race_options?.distance_km || 0);
    }
    return acc;
  }, 0);

  return (
    <section style={{ background: "linear-gradient(90deg, #004e92, #000428)", padding: "40px", borderRadius: 20, textAlign: "center" }}>
      <h3 style={{ margin: 0, opacity: 0.7, fontSize: "0.9rem" }}>WSPÓLNIE W {currentYear} PRZEBIEGLIŚMY</h3>
      <div style={{ fontSize: "4rem", fontWeight: 900 }}>{totalKm.toFixed(1)} KM</div>
    </section>
  );
}