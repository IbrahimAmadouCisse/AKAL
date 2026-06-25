export default function Home() {
  return (
    <main className="min-h-screen p-16">
      <h1 style={{ color: "var(--color-foret)", fontSize: "28px", fontWeight: 500 }}>
        AKAL • <span className="tifinagh">ⴰⴽⴰⵍ</span>
      </h1>
      <p style={{ color: "var(--color-secondaire)", marginTop: "8px" }}>
        Plateforme d'intelligence agronomique et foncière
      </p>

      <div style={{ marginTop: "40px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button className="btn-primary">Bouton Primary</button>
        <button className="btn-secondary">Bouton Secondary</button>
        <button className="btn-accent">Bouton Accent</button>
        <button className="btn-ghost">Bouton Ghost</button>
      </div>

      <div style={{ marginTop: "24px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <span className="badge-melkia">Melkia</span>
        <span className="badge-soulaliya">Soulaliya</span>
        <span className="badge-guich">Guich</span>
        <span className="badge-habous">Habous</span>
        <span className="badge-immatricule">Immatriculé</span>
      </div>

      <div className="card" style={{ marginTop: "24px", padding: "24px", maxWidth: "320px" }}>
        <h3 style={{ color: "var(--color-foret)", fontSize: "18px", fontWeight: 500 }}>
          Carte test
        </h3>
        <p style={{ color: "var(--color-secondaire)", fontSize: "14px", marginTop: "8px" }}>
          Ombre, hover et border-radius AKAL
        </p>
      </div>

      <div style={{ marginTop: "24px", maxWidth: "320px" }}>
        <input className="input" placeholder="Input test — focus pour voir la bordure verte" />
      </div>
    </main>
  );
}
