import React from "react";

/* Five-petal lotus, drawn to match the lucide API (size, color, strokeWidth)
   so it drops into any place a lucide icon goes. One petal path, placed five
   times: upright centre, a mid pair, and a wider shallower outer pair, all
   fanning from the same base point. */

const PETAL = "M0 0 C -4.6 -4.2, -4.8 -10.6, 0 -15 C 4.8 -10.6, 4.6 -4.2, 0 0 Z";

const PLACEMENTS = [
  "translate(12 20) rotate(-78) scale(.66 .70)",
  "translate(12 20) rotate(78) scale(.66 .70)",
  "translate(12 20) rotate(-40) scale(.82 .90)",
  "translate(12 20) rotate(40) scale(.82 .90)",
  "translate(12 20) scale(.95 1)",
];

export default function LotusIcon({ size = 24, color = "currentColor", strokeWidth = 2, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {PLACEMENTS.map((t, i) => (
        <path key={i} d={PETAL} fill="none" transform={t} />
      ))}
    </svg>
  );
}
