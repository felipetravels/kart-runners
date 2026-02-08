// Wewnątrz komponentu RaceCard, znajdź przycisk "Szczegóły" i zmień href:
<a
  href={`/races?id=${race.id}`} // Zmienione z /races/${race.id}
  style={{
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: 14,
    background: "white",
    color: "black",
    textDecoration: "none",
    fontWeight: 900,
  }}
>
  Szczegóły →
</a>