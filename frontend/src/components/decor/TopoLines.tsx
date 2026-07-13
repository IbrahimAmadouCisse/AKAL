import { useId } from "react";

type Props = {
  color?: string;
  className?: string;
};

// Motif discret de lignes topographiques (courbes de niveau), évoquant la
// cartographie agricole. Purement décoratif — aria-hidden, pas d'interaction.
export default function TopoLines({ color = "var(--color-topo-line)", className }: Props) {
  const patternId = `topo-lines-${useId()}`;

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
        <pattern id={patternId} width="220" height="140" patternUnits="userSpaceOnUse">
          <path
            d="M-20 100 C 30 60, 70 140, 120 90 S 220 60, 260 100"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
          />
          <path
            d="M-20 60 C 20 20, 80 100, 130 50 S 230 20, 260 60"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
          />
          <path
            d="M-20 20 C 40 -10, 60 50, 110 10 S 210 -10, 260 20"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
