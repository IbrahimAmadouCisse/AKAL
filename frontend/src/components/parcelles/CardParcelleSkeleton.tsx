// Reprend exactement les dimensions de CardParcelle (ratio photo 70%, mêmes
// zones) pour éviter tout saut de layout (CLS) à la bascule skeleton <-> card.

function Block({ style }: { style: React.CSSProperties }) {
  return (
    <div
      style={{
        borderRadius: "4px",
        backgroundColor: "var(--color-skeleton-base)",
        backgroundImage: `linear-gradient(90deg, transparent, var(--color-skeleton-shine), transparent)`,
        backgroundSize: "200% 100%",
        animation: "skeleton-pulse 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export default function CardParcelleSkeleton() {
  return (
    <article className="card" style={{ overflow: "hidden" }} aria-hidden="true">
      <div style={{ position: "relative", width: "100%", paddingBottom: "70%" }}>
        <Block style={{ position: "absolute", inset: 0, borderRadius: 0 }} />
      </div>
      <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Block style={{ height: "14px", width: "78%" }} />
        <Block style={{ height: "11px", width: "50%" }} />
        <div style={{ display: "flex", gap: "6px" }}>
          <Block style={{ height: "18px", width: "48px", borderRadius: "999px" }} />
          <Block style={{ height: "18px", width: "64px", borderRadius: "999px" }} />
          <Block style={{ height: "18px", width: "56px", borderRadius: "999px" }} />
        </div>
        <Block style={{ height: "6px", width: "100%", borderRadius: "999px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "2px" }}>
          <Block style={{ height: "16px", width: "90px" }} />
          <Block style={{ height: "16px", width: "56px" }} />
        </div>
      </div>
    </article>
  );
}
