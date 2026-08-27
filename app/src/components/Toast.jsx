import React, { useEffect } from "react";
import { useWF } from "../state";
import { Check } from "lucide-react";
import Confetti from "./Confetti";
import { GREEN, TEXT, MUTED, BG, BORDER, GOLD, GOLD_TINT, GOLD_LINE, GOLD_DEEP, SH_LG, PILLAR } from "../tokens";

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

  /* A task that finished on another screen gets the moment its row would have
     given it: the pillar's colour, a check that draws itself, and the same
     twelve pieces of confetti. An ordinary confirmation stays plain green, so
     the two never blur into one another. */
  const p = toast.task ? PILLAR[toast.task] : null;

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
        background: p ? "linear-gradient(180deg, " + p.w + " 0%, " + BG + " 62%)" : BG,
        border: "1px solid " + (p ? p.t : BORDER),
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
          background: p ? p.c : GREEN,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          animation: p ? "taskPop .6s cubic-bezier(.34,1.56,.64,1) .1s both" : undefined,
        }}
      >
        {p && (
          <>
            <span
              aria-hidden
              style={{
                position: "absolute",
                inset: -4,
                borderRadius: "50%",
                border: "2px solid " + p.c,
                animation: "haloOut .9s cubic-bezier(.22,.7,.3,1) .18s forwards",
              }}
            />
            <Confetti pillar={toast.task} spread={1.35} />
          </>
        )}
        {p ? <DrawnCheck /> : <Check size={16} color="#fff" strokeWidth={3} />}
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

/* The tick, drawn rather than dropped in. Same stroke the diary row uses. */
function DrawnCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden style={{ position: "relative", zIndex: 3 }}>
      <path
        d="M3.6 8.4 L6.6 11.2 L12.4 4.9"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="16"
        strokeDashoffset="16"
        style={{ animation: "checkDraw .42s cubic-bezier(.65,0,.35,1) .26s forwards" }}
      />
    </svg>
  );
}
