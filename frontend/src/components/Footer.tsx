export default function Footer() {
  return (
    <footer style={{
      backgroundColor: "var(--color-nuit)",
      color: "var(--color-menthe)",
      padding: "48px 24px 32px",
      marginTop: "auto",
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

        {/* Logo + tagline */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "20px", fontWeight: 500, color: "white" }}>AKAL</div>
          <div className="tifinagh" style={{ fontSize: "12px", color: "var(--color-menthe)", marginTop: "2px" }}>
            ⴰⴽⴰⵍ • La Terre
          </div>
          <p style={{ fontSize: "13px", color: "var(--color-menthe)", marginTop: "8px", maxWidth: "280px" }}>
            Plateforme d'intelligence agronomique et foncière au Maroc.
          </p>
        </div>

        {/* Séparateur */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "12px"
        }}>
          <span style={{ fontSize: "11px", color: "var(--color-tertiaire)" }}>
            © 2026 AKAL — Société Marocaine d'Ingénierie Immobilière
          </span>
          <span style={{ fontSize: "11px", color: "var(--color-tertiaire)" }}>
            EIGSI Casablanca
          </span>
        </div>

      </div>
    </footer>
  );
}
