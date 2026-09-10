import React from "react";
import { INDIGO, MIND_C } from "../tokens";

/* Kaira's hexagon, as an outline rather than a solid.

   Drawn in SVG because a clip-path has no edge to stroke, so the gradient
   would have needed two stacked shapes and a background colour to fake the
   hole. Indigo into teal, the same gradient the FAB wears, so she is the same
   mark wherever she turns up.

   One gradient id for every copy on the page. Two SVGs declaring the same id
   is technically a duplicate, and every browser resolves it to the first,
   which is the right answer here because they are the same gradient. Making
   them unique would mean a counter or a hook for no visible difference. */
export default function KairaMark({ size = 19 }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size * 1.09}
      viewBox="0 0 100 109"
      style={{ flexShrink: 0, display: "block" }}
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
