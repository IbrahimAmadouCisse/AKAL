"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useScrolled } from "@/hooks/useScrolled";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolled(12);

  // Ferme le drawer mobile à l'échap.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      height: scrolled ? "56px" : "64px",
      backgroundColor: scrolled ? "rgba(255,255,255,0.92)" : "white",
      borderBottom: "1px solid var(--color-bordure)",
      backdropFilter: scrolled ? "blur(12px)" : "blur(0px)",
      boxShadow: scrolled ? "0 4px 20px rgba(27,58,45,0.06)" : "none",
      transition: `height var(--duration-base) var(--ease-premium),
                   background-color var(--duration-base) var(--ease-premium),
                   box-shadow var(--duration-base) var(--ease-premium)`,
    }}>
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 24px",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "20px", fontWeight: 500, color: "var(--color-foret)", lineHeight: 1 }}>
            AKAL
          </span>
          <span className="tifinagh" style={{ fontSize: "12px", color: "var(--color-tertiaire)", lineHeight: 1.2 }}>
            ⴰⴽⴰⵍ
          </span>
        </Link>

        {/* Liens desktop */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }} className="hidden-mobile">
          <Link href="/parcelles" style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--color-secondaire)",
            textDecoration: "none",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--color-foret)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--color-secondaire)")}
          >
            Parcelles
          </Link>
          <Link href="/carte" style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--color-secondaire)",
            textDecoration: "none",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--color-foret)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--color-secondaire)")}
          >
            Carte
          </Link>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Bouton hamburger — visible uniquement en mobile */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label="Menu de navigation"
            className="hidden-desktop"
            style={{
              width: "36px",
              height: "36px",
              padding: 0,
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "var(--color-foret)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </button>
          <Link href="/publier">
            <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "13px" }}>
              Publier une annonce
            </button>
          </Link>
          <Link href="/connexion">
            <button className="btn-ghost" style={{ padding: "8px 16px", fontSize: "13px" }}>
              Connexion
            </button>
          </Link>
        </div>

      </div>

      {/* Drawer mobile */}
      {menuOpen && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
            className="hidden-desktop"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(27,58,45,0.35)",
              zIndex: 49,
            }}
          />
          <div
            id="menu-mobile"
            className="hidden-desktop"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 51,
              backgroundColor: "white",
              borderTop: "1px solid var(--color-bordure)",
              boxShadow: "var(--shadow-float)",
              padding: "8px 24px 20px",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            <Link href="/parcelles" onClick={() => setMenuOpen(false)} style={menuLinkStyle}>
              Parcelles
            </Link>
            <Link href="/carte" onClick={() => setMenuOpen(false)} style={menuLinkStyle}>
              Carte
            </Link>
            <div style={{ height: "1px", backgroundColor: "var(--color-bordure)", margin: "8px 0" }} />
            <Link href="/publier" onClick={() => setMenuOpen(false)} style={menuLinkStyle}>
              Publier une annonce
            </Link>
            <Link href="/connexion" onClick={() => setMenuOpen(false)} style={menuLinkStyle}>
              Connexion
            </Link>
          </div>
        </>
      )}
    </nav>
  );
}

const menuLinkStyle: React.CSSProperties = {
  padding: "12px 4px",
  fontSize: "15px",
  fontWeight: 500,
  color: "var(--color-texte)",
  textDecoration: "none",
};
