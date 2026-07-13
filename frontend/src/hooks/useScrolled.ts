"use client";

import { useEffect, useState } from "react";

// true dès que la page a défilé au-delà du seuil (px). Listener passif.
export function useScrolled(seuil = 12) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > seuil);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [seuil]);

  return scrolled;
}
