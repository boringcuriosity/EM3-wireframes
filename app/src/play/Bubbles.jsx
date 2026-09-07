import React from "react";
import CtaArrow from "../components/CtaArrow";
import { PILLAR, TEXT, MUTED } from "../tokens";

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
const HERO = 158;
const PERIOD = { eat: 8, move: 9.4, mind: 7.2, measure: 8.7 };
const DELAY = { eat: 0, move: 2.6, mind: 4.1, measure: 1.3 };
/* Settling, with a little overshoot. A handover is a thing arriving, and a
   bubble that eases politely into its size reads as a resize rather than as
   something that moved. */
const EASE = "cubic-bezier(.34,1.3,.5,1)";
// The liquid has weight, so it takes longer to settle than the shell does.
const POUR = "cubic-bezier(.22,1,.36,1)";

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
                : !p.started ? "not logged yet, " + p.ask
                : p.score + " percent, " + p.done + " of " + p.total + " done today" +
                  (hero ? ". " + p.ask : ""))
            }
            style={{
              position: "absolute",
              left: cx - d / 2,
              top: cy - d / 2,
              width: d,
              height: d,
              transition: ["left", "top", "width", "height"].map((k) => k + " .62s " + EASE).join(", "),
              background: "none", border: "none", padding: 0,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <span
              style={{
                display: "flex", width: "100%", height: "100%",
                borderRadius: "50%", position: "relative", overflow: "hidden",
                alignItems: "center", justifyContent: "center", textAlign: "center",
                /* A lit sphere rather than a tinted disc. One rim, drawn the
                   same whether anything is in it or not and just paler while
                   it is empty: a dashed ring was meant to say "nothing yet",
                   but the liquid level and the missing number already say
                   that, and four broken outlines on one card read as damage
                   rather than as a state. */
                background:
                  "radial-gradient(130% 130% at 28% 18%, #FFFFFF 0%, " + c.w + " 32%, " +
                  c.t + " 74%, " + c.c + "59 100%)",
                boxShadow:
                  "0 16px 30px -12px " + c.c + "59, 0 2px 5px " + c.c + "26, " +
                  "inset 0 -16px 24px -13px " + c.c + "A6, inset 0 9px 15px -8px #FFFFFF, " +
                  "inset 0 0 0 1px " + c.c + (p.started ? "26" : "14"),
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
                  background: "linear-gradient(180deg, " + c.t + " 0%, " + c.c + "59 100%)",
                  transition: "height .85s " + POUR,
                }}
              >
                {/* The surface. A flat cut across a sphere reads as a chart; a
                    lit line that breathes reads as something poured in. */}
                {p.done > 0 && (
                  <span
                    aria-hidden
                    style={{
                      position: "absolute", left: "-10%", right: "-10%", top: -1,
                      height: 3, borderRadius: "50%",
                      background: "rgba(255,255,255,.62)",
                      animation: "meniscus 4.6s ease-in-out infinite",
                    }}
                  />
                )}
              </span>

              {/* Where the light lands, which is the whole difference between
                  a disc and a sphere. */}
              <span
                aria-hidden
                style={{
                  position: "absolute", top: "10%", left: "17%",
                  width: "34%", height: "23%",
                  borderRadius: "50%", background: "#FFFFFF",
                  opacity: p.started ? 1 : 0.5,
                  filter: "blur(6px)",
                }}
              />

              <span style={{ position: "relative", display: "block", padding: "0 9px" }}>
                {/* The big one leads with the nudge rather than the pillar's
                    name. Its colour and its corner already say which pillar it
                    is, so the words go on asking for something. A small one
                    keeps the name, because that is all it has to identify it
                    by. */}
                {hero ? (
                  /* The question first, always. A score is the answer to a
                     different question and it only exists once something has
                     gone in, so it sits under the ask rather than replacing
                     it. Long questions step the type down rather than spilling
                     out of the circle. */
                  <>
                    <span style={{ display: "block", fontSize: p.ask.length > 30 ? 11.5 : 12.5, fontWeight: 700, color: TEXT, lineHeight: 1.32 }}>
                      {p.ask}
                      <CtaArrow size={12} style={{ color: c.c, marginLeft: 4, verticalAlign: -1.5 }} />
                    </span>
                    {p.started && (
                      <span style={{ display: "block", fontFamily: "'Playfair Display', serif", fontSize: p.ask.length > 30 ? 26 : 32, color: TEXT, lineHeight: 1.1, marginTop: 2 }}>
                        {p.score}
                        <span style={{ fontSize: "0.48em", color: MUTED }}>%</span>
                      </span>
                    )}
                  </>
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
        @keyframes meniscus{0%,100%{transform:translateY(0) rotate(-.6deg)}50%{transform:translateY(1px) rotate(.6deg)}}
        @media(prefers-reduced-motion:reduce){[aria-label="Your four pillars"] span{animation:none!important}}`}</style>
    </div>
  );
}
