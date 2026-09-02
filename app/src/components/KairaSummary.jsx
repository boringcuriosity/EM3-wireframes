import React from "react";
import { useWF } from "../state";
import { INDIGO, MIND_C, TEXT_2, BG, BORDER, SH_SM } from "../tokens";

/* Kaira's read on the day.

   She sits between the scores and the tasks and that position is her job: the
   scores say where you stand, the rows say what to do, and she is the only
   thing that can say which task moves which score. Anything that does not join
   those two halves is a wasted line.

   She talks about the pillar in the big bubble, never another one, because a
   card whose halves disagree is worse than one that says less. The line is
   derived in `state.jsx` off the same hero the bubbles read, so the two can
   never come apart.

   Unsigned, and unnamed. Her hexagon is the only mark on it: putting a label
   over the line spends a row saying who is talking, which the shape already
   does, and there is one voice on this card anyway. */
export default function KairaSummary() {
  const { kairaLine } = useWF();
  if (!kairaLine) return null;

  return (
    <div
      style={{
        background: BG,
        border: "1px solid " + BORDER,
        borderRadius: 16,
        boxShadow: SH_SM,
        padding: "13px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <Outline />
      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: TEXT_2, lineHeight: 1.55 }}>
        {kairaLine}
      </span>
    </div>
  );
}

/* The hexagon as an outline rather than a solid.

   Drawn in SVG because a clip-path has no edge to stroke, so the gradient
   would have needed two stacked shapes and a background colour to fake the
   hole. The gradient is the one `KairaFab` already wears, indigo into teal,
   so she is the same mark wherever she turns up. */
function Outline({ size = 19 }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size * 1.09}
      viewBox="0 0 100 109"
      style={{ flexShrink: 0, marginTop: 1, display: "block" }}
    >
      <defs>
        <linearGradient id="kairaEdge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={INDIGO} />
          <stop offset="100%" stopColor={MIND_C} />
        </linearGradient>
      </defs>
      {/* Inset by half the stroke, so the edge is not clipped by the viewBox. */}
      <polygon
        points="50,5 89,28 89,81 50,104 11,81 11,28"
        fill="none"
        stroke="url(#kairaEdge)"
        strokeWidth="9"
        strokeLinejoin="round"
      />
    </svg>
  );
}
