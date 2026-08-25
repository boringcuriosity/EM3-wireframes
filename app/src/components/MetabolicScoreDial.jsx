import React from "react";
import { Lock } from "lucide-react";
import { TEXT, MUTED, BG, LINE, GOLD, MIND_C, MOVE_C, GREEN, RULE } from "../tokens";

/* The metabolic score dial, as the live app draws it: one ring in four parts,
   each part a score of its own. Rendered here at sheet size and unfilled,
   because a person meeting it for the first time has not taken it yet and a
   number on screen would be a number they never earned. */

export const SCORE_PARTS = [
  { id: "profile", label: "Profile", hint: "age, sex, body", c: MOVE_C },
  { id: "wellness", label: "Wellness", hint: "how you feel", c: MIND_C },
  { id: "habit", label: "Habit", hint: "what you log daily", c: GOLD },
  { id: "biomarker", label: "Biomarker", hint: "labs and devices", c: GREEN, locked: true },
];

const R = 46;
const C = 56;

// Screen angles: 0 is right and they run clockwise, so the ring opens at the
// bottom, exactly like the dial on the Measure screen.
const pt = (a) => [
  C + R * Math.cos((a * Math.PI) / 180),
  C + R * Math.sin((a * Math.PI) / 180),
];
const arc = (a0, a1) => {
  const [x0, y0] = pt(a0);
  const [x1, y1] = pt(a1);
  return `M ${x0} ${y0} A ${R} ${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
};

const SPAN = 270 / SCORE_PARTS.length;

export default function MetabolicScoreDial() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ position: "relative", width: 112, height: 112, flexShrink: 0 }}>
        <svg width="112" height="112" viewBox="0 0 112 112">
          {SCORE_PARTS.map((p, i) => {
            const a0 = 135 + i * SPAN + 3;
            const a1 = 135 + (i + 1) * SPAN - 3;
            return (
              <path
                key={p.id}
                d={arc(a0, a1)}
                fill="none"
                stroke={p.c}
                strokeWidth="9"
                strokeLinecap="round"
                // Nothing is measured yet, so the ring shows its shape and its
                // colours at a whisper rather than claiming a reading.
                opacity={p.locked ? 0.18 : 0.32}
                strokeDasharray={p.locked ? "3 5" : undefined}
              />
            );
          })}
        </svg>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: BG,
              border: "1px solid " + LINE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lock size={15} color={RULE} />
          </span>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 7 }}>
        {SCORE_PARTS.map((p) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: p.c,
                flexShrink: 0,
                opacity: p.locked ? 0.4 : 1,
              }}
            />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: TEXT }}>{p.label}</span>
            <span style={{ fontSize: 10, color: MUTED }}>{p.hint}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
