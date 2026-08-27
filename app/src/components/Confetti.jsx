import React from "react";
import { PILLAR, GOLD, GREEN } from "../tokens";

/* Twelve pieces out of the circle a task was just ticked in.

   They leave in a ring but not evenly, and they carry different sizes, shapes
   and spins, because a perfectly regular burst reads as a loading spinner. The
   whole thing is gone in under a second: the reward is meant to be caught out
   of the corner of your eye, not waited out. */
const PIECES = [
  [-30, -18, 8], [-14, -30, 6], [4, -34, 5], [22, -26, 7],
  [34, -8, 6], [32, 12, 5], [18, 26, 7], [0, 32, 6],
  [-18, 27, 5], [-32, 10, 7], [-24, -4, 4], [26, -2, 4],
];

export default function Confetti({ pillar, spread = 1 }) {
  const c = PILLAR[pillar].c;
  return (
    <span style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }} aria-hidden>
      {PIECES.map(([x, y, s], i) => {
        const bar = i % 3 === 1;
        const dx = x * spread;
        const dy = y * spread;
        const size = s * Math.min(spread, 2.4);
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: bar ? size * 0.5 : size * 0.7,
              height: bar ? size : size * 0.7,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              borderRadius: bar ? 1.5 : "50%",
              background: i % 4 === 0 ? GOLD : i % 4 === 2 ? GREEN : c,
              "--dx": dx + "px",
              "--dy": dy + "px",
              "--rot": (i % 2 ? 1 : -1) * (120 + i * 22) + "deg",
              animation: "confettiOut .72s cubic-bezier(.16,.7,.3,1) forwards",
              animationDelay: (i % 4) * 26 + "ms",
            }}
          />
        );
      })}
    </span>
  );
}
