"use client";

import type { CSSProperties, ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

type Props = {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
  className?: string;
};

// Enveloppe de confort pour un reveal-on-scroll cohérent (opacity + translateY).
export default function Reveal({ children, delay = 0, style, className }: Props) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity var(--duration-slow) var(--ease-premium), transform var(--duration-slow) var(--ease-premium)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
