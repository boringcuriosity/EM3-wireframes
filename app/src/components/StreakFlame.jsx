import React, { useEffect, useState } from "react";
import { GOLD, GOLD_DEEP, RULE } from "../tokens";

/* The day's streak as a flame that fills from the bottom. The silhouette is a
   clip path on the wrapper, so the fill is an ordinary div growing inside it
   and animates like any other height. An outline of the same shape sits on
   top, which is what keeps it reading as an icon rather than a blob. */

// Lucide's flame, with its inner tongue. Drawn rather than approximated so the
// small sizes still look like a flame.
const FLAME =
  "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4z";

export default function StreakFlame({ size = 24, fraction = 0, from = null, delay = 0, outline = true }) {
  // Start at `from` and run up to `fraction`, so the rise is visible rather
  // than already over by the time anyone looks.
  const [shown, setShown] = useState(from === null ? fraction : from);

  useEffect(() => {
    if (from === null) {
      setShown(fraction);
      return;
    }
    setShown(from);
    const t = setTimeout(() => setShown(fraction), 80 + delay);
    return () => clearTimeout(t);
  }, [fraction, from, delay]);

  const scale = size / 24;

  return (
    <span
      style={{
        display: "inline-block",
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        lineHeight: 0,
      }}
    >
      <span
        style={{
          display: "block",
          position: "absolute",
          top: 0,
          left: 0,
          width: 24,
          height: 24,
          transform: "scale(" + scale + ")",
          transformOrigin: "top left",
          clipPath: 'path("' + FLAME + '")',
        }}
      >
        <span style={{ position: "absolute", inset: 0, background: RULE, opacity: 0.5 }} />
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: Math.round(shown * 100) + "%",
            background: GOLD,
            transition: "height .9s cubic-bezier(.32,.72,0,1)",
          }}
        />
      </span>

      {outline && (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          style={{ position: "absolute", top: 0, left: 0 }}
          aria-hidden
        >
          <path
            d={FLAME}
            stroke={shown > 0 ? GOLD_DEEP : RULE}
            strokeWidth="1.4"
            strokeLinejoin="round"
            style={{ transition: "stroke .5s ease" }}
          />
        </svg>
      )}
    </span>
  );
}
