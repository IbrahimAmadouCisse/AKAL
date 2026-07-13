import { useId } from "react";

type Props = {
  color?: string;
  className?: string;
};

// Motif discret de parcelles irrégulières vues du ciel (cadastre stylisé).
// Purement décoratif — aria-hidden, pas d'interaction.
export default function ParcelGrid({ color = "var(--color-topo-line-invert)", className }: Props) {
  const patternId = `parcel-grid-${useId()}`;

  return (
    <svg
      aria-hidden="true"
      className={className}
      width="100%"
      height="100%"
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id={patternId} width="160" height="160" patternUnits="userSpaceOnUse">
          <path d="M0 0 H160 V160 H0 Z M60 0 V70 H0 M60 0 H160 M60 70 H160 M0 70 V160 M60 70 V160 M110 70 V160 M110 70 H160"
            fill="none" stroke={color} strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
