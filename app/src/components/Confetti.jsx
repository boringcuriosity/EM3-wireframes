import React from "react";
import { PILLAR, GOLD } from "../tokens";

/* Eight pieces out of the circle a task was just ticked in.

   Deliberately small and deliberately quick. A full screen celebration is
   right once a day, not thirteen times, so this is the size of a reaction:
   you see it if you are looking at the row, and it is gone before it can get
   in the way of the next tap. */
const PIECES = [
  [-16, -14], [0, -20], [16, -14], [22, 2],
  [16, 16], [0, 21], [-16, 15], [-22, 1],
];

export default function Confetti({ pillar }) {
  const c = PILLAR[pillar].c;
  return (
    <span style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden>
      {PIECES.map(([dx, dy], i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: i % 2 ? 3 : 4,
            height: i % 2 ? 5 : 4,
            marginLeft: -2,
            marginTop: -2,
            borderRadius: i % 2 ? 1 : "50%",
            background: i % 3 === 0 ? GOLD : c,
            "--dx": dx + "px",
            "--dy": dy + "px",
            animation: "confettiOut .58s cubic-bezier(.22,.7,.3,1) forwards",
            animationDelay: i * 12 + "ms",
          }}
        />
      ))}
    </span>
  );
}
