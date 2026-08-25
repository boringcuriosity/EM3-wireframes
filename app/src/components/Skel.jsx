import React from "react";
import { BG_SUNK, LINE } from "../tokens";

/* A number that is on its way. Sized like the thing it stands in for, so
   nothing jumps when the real value lands. */
export default function Skel({ w = 46, h = 15, style }) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: w,
        height: h,
        borderRadius: 5,
        background: "linear-gradient(90deg, " + BG_SUNK + " 0%, " + LINE + " 50%, " + BG_SUNK + " 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.3s linear infinite",
        ...style,
      }}
    />
  );
}
