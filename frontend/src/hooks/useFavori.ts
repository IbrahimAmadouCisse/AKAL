"use client";

import { useState } from "react";
import { useToast } from "@/components/toast/ToastProvider";

// Mutualise l'état favori (utilisé dans CardParcelle et FicheParcelle) et
// notifie l'utilisateur via un toast au changement.
export function useFavori(titre: string, initial = false) {
  const [favori, setFavori] = useState(initial);
  const { showToast } = useToast();

  const toggle = () => {
    setFavori((v) => {
      const next = !v;
      showToast(next ? `${titre} ajoutée aux favoris` : `${titre} retirée des favoris`, "success");
      return next;
    });
  };

  return { favori, toggle };
}
