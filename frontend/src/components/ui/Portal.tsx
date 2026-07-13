"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

const emptySubscribe = () => () => {};

// Monte ses enfants directement dans document.body (utile pour les modales,
// au-dessus de tout empilement de z-index existant). Le rendu est différé
// au client (document n'existe pas côté serveur).
export default function Portal({ children }: { children: ReactNode }) {
  const monte = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!monte) return null;
  return createPortal(children, document.body);
}
