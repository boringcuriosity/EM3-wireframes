import React from "react";
import CtaArrow from "../components/CtaArrow";
import { PILLAR, TEXT, MUTED, RULE } from "../tokens";

/* The four pillars, one of them bigger.

   Each keeps its own corner and its own size, so the shape is the same every
   time you look at it. Only the big one moves, and it leans a little out of
   the corner it came from so the gap it leaves does not read as a hole.

   Everything on a bubble comes off the tasks on the board below. A pillar is
   as far along as the tasks it has finished, which is why there are no dials
   to set: tick something on the board and the bubble answers.

   A bubble says a score and nothing else. Naming the next task on it was
   borrowing To-do's job, and the list underneath already does that better.
   The one exception is a pillar nobody has logged today, where there is no
   percentage worth printing and the ask to go and log takes its place.

   TWO LAYERS, AND THEY HAVE TO STAY SEPARATE. The button owns where the
   bubble is and how big; the skin inside owns the drift. Put both on one
   element and the endless animation and the size change fight, and the size
   loses silently. */
const SEATS = {
  mind:    { x: 80,  y: 56,  d: 72 },
  move:    { x: 266, y: 56,  d: 76 },
  measure: { x: 266, y: 180, d: 70 },
  eat:     { x: 80,  y: 180, d: 74 },
};
const C = { x: 173, y: 118 };
const HERO = 150;
const PERIOD = { eat: 8, move: 9.4, mind: 7.2, measure: 8.7 };
const DELAY = { eat: 0, move: 2.6, mind: 4.1, measure: 1.3 };
const EASE = "cubic-bezier(.32,.72,0,1)";

export default function Bubbles({ order, onOpen }) {
  return (
    <div style={{ position: "relative", width: 346, height: 236, margin: "0 auto" }} role="group" aria-label="Your four pillars">
      {order.map((p, i) => {
        const seat = SEATS[p.id];
        const hero = p.hero && i === 0;
        const d = hero ? HERO : seat.d;
        const cx = hero ? C.x + 0.13 * (seat.x - C.x) : seat.x;
        const cy = hero ? C.y + 0.13 * (seat.y - C.y) : seat.y;
        const c = PILLAR[p.id];
        // Three states, and each one says what it is in words.
        const state = p.total === 0 ? "none" : p.left === 0 ? "clear" : "going";

        return (
          <button
            key={p.id}
            onClick={() => onOpen && onOpen(p.id)}
            aria-label={
              p.name + ", " +
              (state === "none" ? "nothing to do today"
                : !p.started ? "not logged yet, " + p.first
                : p.score + " percent, " + p.done + " of " + p.total + " done today" +
                  (hero ? ". " + p.nudge : ""))
            }
            style={{
              position: "absolute",
              left: cx - d / 2,
              top: cy - d / 2,
              width: d,
              height: d,
              transition: ["left", "top", "width", "height"].map((k) => k + " .5s " + EASE).join(", "),
              background: "none", border: "none", padding: 0,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <span
              style={{
                display: "flex", width: "100%", height: "100%",
                borderRadius: "50%", position: "relative", overflow: "hidden",
                alignItems: "center", justifyContent: "center", textAlign: "center",
                background: c.w,
                // Solid once the day has anything in it. A dotted ring while
                // there is nothing yet, which is the plainest way to draw it.
                border: p.started ? "1.5px solid " + c.c : "1.5px dashed " + RULE,
                animation: `drift ${PERIOD[p.id]}s ease-in-out infinite`,
                animationDelay: `-${DELAY[p.id]}s`,
              }}
            >
              {/* Fills as that pillar's day gets done. */}
              <span
                aria-hidden
                style={{
                  position: "absolute", left: 0, right: 0, bottom: 0,
                  height: (p.total ? (p.done / p.total) * 100 : 0) + "%",
                  background: c.t,
                  transition: "height .6s " + EASE,
                }}
              />

              <span style={{ position: "relative", display: "block", padding: "0 9px" }}>
                {/* The big one leads with the nudge rather than the pillar's
                    name. Its colour and its corner already say which pillar it
                    is, so the words go on asking for something. A small one
                    keeps the name, because that is all it has to identify it
                    by. */}
                {hero ? (
                  /* Big always asks for something. Even with nothing scheduled
                     for this hour, a pillar you are behind on is one you can
                     get ahead of now, so the line and the arrow stay. */
                  p.started ? (
                    <>
                      <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>
                        {p.nudge}
                        <CtaArrow size={12} style={{ color: c.c, marginLeft: 4, verticalAlign: -1.5 }} />
                      </span>
                      <span style={{ display: "block", fontFamily: "'Playfair Display', serif", fontSize: 34, color: TEXT, lineHeight: 1.1, marginTop: 2 }}>
                        {p.score}
                        <span style={{ fontSize: "0.48em", color: MUTED }}>%</span>
                      </span>
                    </>
                  ) : (
                    <span style={{ display: "block", fontFamily: "'Playfair Display', serif", fontSize: 16, color: TEXT, lineHeight: 1.3 }}>
                      {p.first}
                      <CtaArrow size={14} style={{ color: c.c, marginLeft: 5, verticalAlign: -2 }} />
                    </span>
                  )
                ) : (
                  <>
                    <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: state === "none" ? MUTED : TEXT, letterSpacing: 0.2 }}>
                      {p.name}
                    </span>
                    {state !== "none" && p.started && (
                      <span style={{ display: "block", fontFamily: "'Playfair Display', serif", fontSize: 17, color: TEXT, lineHeight: 1.1, marginTop: 1 }}>
                        {p.score}
                        <span style={{ fontSize: "0.48em", color: MUTED }}>%</span>
                      </span>
                    )}
                  </>
                )}
              </span>
            </span>
          </button>
        );
      })}
      <style>{`@keyframes drift{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-4px,0)}}
        @media(prefers-reduced-motion:reduce){[aria-label="Your four pillars"] span{animation:none!important}}`}</style>
    </div>
  );
}
