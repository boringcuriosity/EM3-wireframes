import React, { useEffect, useState } from "react";
import { useWF } from "../state";
import StreakFlame from "./StreakFlame";
import Confetti from "./Confetti";
import { GOLD, GOLD_DEEP, TEXT, BG } from "../tokens";

const WEEK = 7;

/* The whole screen, for two seconds, the moment the last row goes in.

   Everything else about this day is deliberately quiet: small ticks, a small
   card, a small flame in the header. That restraint is what buys this. It runs
   once, on the crossing from an open day to a closed one, and it is the only
   place in the app that takes the screen.

   Dark, because a flame on white is a shape and a flame on ink is a light. */
export default function StreakOverlay() {
  const { streakShown, setStreakBurst } = useWF();
  const day = Math.max(1, streakShown);
  const lit = Math.min(day, WEEK);
  const left = WEEK - lit;

  // The pips light one after another once the flame is up, so the week reads
  // as something being built rather than something already there.
  const [pips, setPips] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setPips(lit), 900);
    return () => clearTimeout(t);
  }, [lit]);

  return (
    <div
      onClick={() => setStreakBurst(false)}
      role="dialog"
      aria-modal="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 80,
        background:
          "radial-gradient(circle at 50% 38%, rgba(205,169,53,.34) 0%, rgba(16,24,40,0) 58%), " + TEXT,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 34px",
        textAlign: "center",
        cursor: "pointer",
        animation: "scrimIn .3s ease both",
      }}
    >
      <div style={{ position: "relative", width: 132, height: 132 }}>
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: -30,
            borderRadius: "50%",
            background: "radial-gradient(circle, " + GOLD + "55 0%, " + GOLD + "00 68%)",
            animation: "glowBreathe 2.6s ease-in-out infinite",
          }}
        />
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "taskPop .7s cubic-bezier(.34,1.56,.64,1) both",
          }}
        >
          {/* Empty, then full. The rise is the reward. */}
          <StreakFlame size={108} fraction={1} from={0} delay={340} />
          <Confetti pillar="measure" spread={3.4} />
        </span>
      </div>

      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 27,
          fontWeight: 600,
          color: BG,
          lineHeight: 1.2,
          marginTop: 26,
          animation: "riseIn .5s cubic-bezier(.32,.72,0,1) .5s both",
        }}
      >
        {day === 1 ? "Day 1 of your streak" : day + " days in a row"}
      </div>
      <div
        style={{
          fontSize: 13.5,
          color: "rgba(255,255,255,.68)",
          lineHeight: 1.55,
          marginTop: 10,
          maxWidth: 260,
          animation: "riseIn .5s cubic-bezier(.32,.72,0,1) .6s both",
        }}
      >
        Everything on today's list is in. Come back tomorrow to keep it alive.
      </div>

      {/* The week, as a chain. Filled behind you, open in front. */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 26,
          animation: "riseIn .5s cubic-bezier(.32,.72,0,1) .7s both",
        }}
      >
        {Array.from({ length: WEEK }, (_, i) => (
          <span
            key={i}
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: i < pips ? GOLD : "transparent",
              border: "1.5px solid " + (i < pips ? GOLD : "rgba(255,255,255,.28)"),
              boxSizing: "border-box",
              transition: "background .3s ease, border-color .3s ease",
              transitionDelay: i * 90 + "ms",
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9.5,
          fontWeight: 600,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: GOLD,
          marginTop: 12,
          animation: "riseIn .5s cubic-bezier(.32,.72,0,1) .78s both",
        }}
      >
        {left === 0 ? "Week bonus earned" : left + (left === 1 ? " day to your week bonus" : " days to your week bonus")}
      </div>

      <button
        onClick={() => setStreakBurst(false)}
        style={{
          marginTop: 34,
          background: GOLD,
          border: "none",
          borderRadius: 999,
          padding: "12px 34px",
          fontSize: 14,
          fontWeight: 700,
          color: TEXT,
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: "0 2px 0 " + GOLD_DEEP,
          animation: "riseIn .5s cubic-bezier(.32,.72,0,1) .9s both",
        }}
      >
        Nice
      </button>
    </div>
  );
}
