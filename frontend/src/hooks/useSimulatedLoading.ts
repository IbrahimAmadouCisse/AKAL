"use client";

import { useEffect, useRef, useState } from "react";

// Débounce visuel : passe à `loading=true` dès que `dep` change, puis revient
// à `false` après `delayMs`. Simule le temps d'un futur fetch API pour piloter
// un skeleton, sans fabriquer un vrai état réseau.
export function useSimulatedLoading(dep: unknown, delayMs = 350) {
  const [loading, setLoading] = useState(false);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), delayMs);
    return () => clearTimeout(timer);
  }, [dep, delayMs]);

  return loading;
}
