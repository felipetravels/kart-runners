"use client";

import { useEffect, useState } from "react";

export default function RacesPage() {
  const [href, setHref] = useState("(loading...)");
  const [search, setSearch] = useState("(loading...)");
  const [idRaw, setIdRaw] = useState<string | null>(null);

  useEffect(() => {
    const h = window.location.href;
    const s = window.location.search; // <- TU siedzi ?id=1
    const params = new URLSearchParams(s);
    const id = params.get("id");

    setHref(h);
    setSearch(s);
    setIdRaw(id);
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 12, background: "#f7f7f7" }}>
        <div style={{ fontWeight: 900 }}>RACES HARD DEBUG v1</div>
        <div>href: <code>{href}</code></div>
        <div>search: <code>{search}</code></div>
        <div>URLSearchParams(id): <code>{String(idRaw)}</code></div>
      </div>

      <p style={{ marginTop: 14 }}>
        Jeśli tutaj <code>id</code> dalej jest <code>null</code>, to znaczy że Twoja przeglądarka finalnie NIE ma
        w URL <code>?id=1</code> (czyli coś Ci to ucina albo wchodzisz nie tam gdzie myślisz).
      </p>

      <a href="/">← Wróć</a>
    </main>
  );
}
