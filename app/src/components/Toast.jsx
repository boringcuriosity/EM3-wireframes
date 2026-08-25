import React, { useEffect } from "react";
import { useWF } from "../state";
import { Check } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BORDER, GOLD, GOLD_TINT, GOLD_LINE, GOLD_DEEP, SH_LG } from "../tokens";

/* One confirmation, dropping in from the top of whatever screen you landed
   back on. Light, like the rest of the app, so it reads as part of the page
   rather than as a system alert. It dismisses itself, and tapping it dismisses
   it sooner. */
export default function Toast() {
  const { toast, setToast } = useWF();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3400);
    return () => clearTimeout(t);
  }, [toast, setToast]);

  if (!toast) return null;

  return (
    <div
      onClick={() => setToast(null)}
      role="status"
      aria-live="polite"
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        top: 52,
        zIndex: 62,
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: BG,
        border: "1px solid " + BORDER,
        borderRadius: 16,
        padding: "12px 14px",
        boxShadow: SH_LG,
        cursor: "pointer",
        animation: "toastDown .38s cubic-bezier(.32,.72,0,1) both",
      }}
    >
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          flexShrink: 0,
          background: GREEN,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Check size={16} color="#fff" strokeWidth={3} />
      </span>

      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: TEXT }}>
          {toast.title}
        </span>
        {toast.line && (
          <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2 }}>
            {toast.line}
          </span>
        )}
      </span>

      {toast.coins > 0 && (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: GOLD_TINT,
            border: "1px solid " + GOLD_LINE,
            borderRadius: 999,
            padding: "4px 10px 4px 8px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              background: GOLD,
              clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: GOLD_DEEP }}>+{toast.coins}</span>
        </span>
      )}
    </div>
  );
}
