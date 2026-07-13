"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReveal } from "./useReveal";

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReducedMotionServerSnapshot() {
  return false;
}

// Anime un nombre de 0 vers `value` quand l'élément entre dans le viewport.
// Respecte prefers-reduced-motion (valeur finale affichée directement).
export function useCountUp(value: number, durationMs = 1200) {
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.6 });
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!visible || started.current || reducedMotion) return;
    started.current = true;

    const start = performance.now();
    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    let frame: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setDisplay(Math.round(value * easeOutExpo(t)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, value, durationMs, reducedMotion]);

  return { ref, display: reducedMotion ? value : display };
}
