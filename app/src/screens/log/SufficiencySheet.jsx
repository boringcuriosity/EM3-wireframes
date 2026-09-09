import React from "react";
import { X } from "lucide-react";
import { GREEN, GREEN_DEEP, GREEN_WASH, TEXT, TEXT_2, MUTED, BG, BG_ALT, BORDER } from "../../tokens";

/* What the number on the hexagon actually is, opened from the info dot above it.

   A percentage with no rule behind it reads as a grade. This says the rule in
   the order somebody asks it: what is being counted, how the four become one
   figure, and why a real day starts the morning in single digits. */

const FOUR = [
  { label: "Protein", line: "Keeps hunger away for hours." },
  { label: "Carbs", line: "Your steadiest energy through the day." },
  { label: "Fats", line: "What your body needs to absorb half its vitamins." },
  { label: "Fibre", line: "Slows the rise after a meal and feeds your gut." },
];

export default function SufficiencySheet({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 49,
        background: "rgba(31,38,48,0.42)",
        display: "flex",
        alignItems: "flex-end",
        animation: "scrimIn .24s ease both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="suff-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxHeight: "88%",
          overflowY: "auto",
          background: BG,
          borderRadius: "26px 26px 0 0",
          padding: "22px 22px 26px",
          boxShadow: "0 -12px 40px rgba(31,38,48,0.22)",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div id="suff-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: 21, color: TEXT, lineHeight: 1.25 }}>
              What sufficiency means
            </div>
            <div style={{ fontSize: 12.5, color: MUTED, marginTop: 5, lineHeight: 1.55 }}>
              Not whether you ate too much. Whether your day gave your body enough.
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 30, height: 30, borderRadius: "50%", border: "1px solid " + BORDER,
              background: BG_ALT, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            <X size={15} color={MUTED} strokeWidth={2.2} />
          </button>
        </div>

        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.9, margin: "22px 0 10px" }}>
          THE FOUR THINGS WE COUNT
        </div>
        {FOUR.map((n) => (
          <div
            key={n.label}
            style={{
              background: BG_ALT, border: "1px solid " + BORDER, borderRadius: 12,
              padding: "10px 12px", marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>{n.label}</span>
            <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2, lineHeight: 1.5 }}>{n.line}</div>
          </div>
        ))}

        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.9, margin: "20px 0 10px" }}>
          HOW IT IS WORKED OUT
        </div>
        <div
          style={{
            background: GREEN_WASH, border: "1px solid " + BORDER, borderRadius: 14,
            padding: "14px 14px 15px",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: GREEN_DEEP, lineHeight: 1.35 }}>
            Each of the four, measured against your target for the day, then averaged.
          </div>
          <div style={{ fontSize: 12, color: TEXT_2, marginTop: 8, lineHeight: 1.6 }}>
            Nothing counts past its target, so a second helping of rice cannot cover for protein you did not eat. That is why the fastest way to lift the number is usually the one that is furthest behind.
          </div>
        </div>

        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.9, margin: "20px 0 10px" }}>
          WHY IT STARTS LOW
        </div>
        <div style={{ fontSize: 12.5, color: TEXT_2, lineHeight: 1.6 }}>
          It is a running total, not a verdict. One meal in, most of your day is still ahead of you, so the number is small by design. It climbs with every meal you log and only settles when your day is done.
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%", marginTop: 22, padding: "13px 0", borderRadius: 12, border: "none",
            background: GREEN, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
