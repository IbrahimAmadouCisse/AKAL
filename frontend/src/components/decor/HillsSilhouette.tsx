type Props = {
  className?: string;
};

// Silhouettes de collines superposées — évoque le paysage agricole marocain.
// Positionné en bas d'un conteneur `position: relative; overflow: hidden`.
export default function HillsSilhouette({ className }: Props) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: "140px", pointerEvents: "none" }}
    >
      <path
        d="M0 140 C 180 60, 340 180, 520 110 S 860 40, 1050 120 S 1200 90, 1200 90 V 200 H 0 Z"
        fill="rgba(255,255,255,0.04)"
      />
      <path
        d="M0 170 C 220 110, 420 200, 640 150 S 960 90, 1200 160 V 200 H 0 Z"
        fill="rgba(255,255,255,0.07)"
      />
    </svg>
  );
}
