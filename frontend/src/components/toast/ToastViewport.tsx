"use client";

import { X } from "@/components/icons/Icons";

type Toast = { id: number; message: string; type: "info" | "success" | "error" };

type Props = {
  toasts: Toast[];
  onDismiss: (id: number) => void;
};

const ACCENT: Record<Toast["type"], string> = {
  info: "var(--color-foret)",
  success: "var(--color-prairie)",
  error: "var(--color-terre)",
};

export default function ToastViewport({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        zIndex: 100,
        bottom: "20px",
        right: "20px",
        left: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "10px",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            maxWidth: "360px",
            width: "100%",
            padding: "12px 14px",
            borderRadius: "10px",
            backgroundColor: "white",
            border: "1px solid var(--color-bordure)",
            borderLeft: `3px solid ${ACCENT[t.type]}`,
            boxShadow: "var(--shadow-float)",
            fontSize: "13px",
            color: "var(--color-texte)",
            animation: "toast-in var(--duration-base) var(--ease-premium)",
          }}
        >
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Fermer la notification"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              color: "var(--color-tertiaire)",
              flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
