"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type Options = {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
};

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

// Révèle un élément quand il entre dans le viewport (IntersectionObserver).
// Respecte prefers-reduced-motion : dans ce cas, visible=true immédiatement.
export function useReveal<T extends HTMLElement>({
  threshold = 0.15,
  rootMargin = "0px 0px -80px 0px",
  once = true,
}: Options = {}) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once, reducedMotion]);

  return { ref, visible: visible || reducedMotion };
}
