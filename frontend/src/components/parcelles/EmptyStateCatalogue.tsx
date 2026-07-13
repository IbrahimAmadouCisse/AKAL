type Props = {
  onReinitialiser: () => void;
};

// Illustration monochrome inline (trait, cohérente avec Icons.tsx) — pas de
// clipart. Évoque une parcelle vide et une recherche sans résultat.
export default function EmptyStateCatalogue({ onReinitialiser }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "72px 20px",
        textAlign: "center",
      }}
    >
      <svg
        width="140"
        height="110"
        viewBox="0 0 140 110"
        fill="none"
        aria-hidden="true"
        style={{ color: "var(--color-menthe)" }}
      >
        <rect x="14" y="20" width="80" height="70" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="M14 50 H94 M54 20 V90 M14 68 H54" stroke="currentColor" strokeWidth="2" />
        <circle cx="112" cy="70" r="18" stroke="var(--color-tertiaire)" strokeWidth="2.5" />
        <line x1="125" y1="83" x2="136" y2="94" stroke="var(--color-tertiaire)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <p style={{ fontSize: "15px", color: "var(--color-secondaire)", maxWidth: "280px", margin: 0 }}>
        Aucune parcelle ne correspond à ces critères pour le moment.
      </p>
      <button type="button" className="btn-secondary" onClick={onReinitialiser}>
        Réinitialiser les filtres
      </button>
    </div>
  );
}
