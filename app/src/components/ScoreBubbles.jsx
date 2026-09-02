import React from "react";
import { useWF } from "../state";
import CtaArrow from "./CtaArrow";
import { Utensils, Flame, BarChart3 } from "lucide-react";
import LotusIcon from "./LotusIcon";
import { PILLAR, TEXT, MUTED, RULE } from "../tokens";

const ICONS = { eat: Utensils, move: Flame, mind: LotusIcon, measure: BarChart3 };

/* The four pillars, one of them bigger.

   To-do is adherence, the day as a list. This is the other half: where each
   pillar stands, and which one is worth a minute right now.

   Each keeps its own corner and its own size, so the shape is the same every
   time Home is opened. Only the big one moves, and it leans a little out of
   the corner it came from so the gap it leaves does not read as a hole.

   The big one always asks for something. With a score it leads with the nudge
   and prints the figure under it; without one it leads with the ask to go and
   log, because a percentage of nothing is a figure nobody has earned. Which
   pillar is which comes from its colour and its corner, so the words on the
   big one are spent on the ask rather than on a label.

   TWO LAYERS, AND THEY HAVE TO STAY SEPARATE. The button owns where a bubble
   is and how big; the skin inside owns the drift. Putting both on one element
   makes the endless animation and the size change fight, and the size loses
   silently: the inline width reads 150px while the computed width sits at 70. */
const SEATS = {
  mind:    { x: 80,  y: 56,  d: 72 },
  move:    { x: 266, y: 56,  d: 76 },
  measure: { x: 266, y: 180, d: 70 },
  eat:     { x: 80,  y: 180, d: 74 },
};
const C = { x: 173, y: 118 };
const HERO = 150;
// Out of step with each other on the first frame, so the four never pulse together.
const PERIOD = { eat: 8, move: 9.4, mind: 7.2, measure: 8.7 };
const DELAY = { eat: 0, move: 2.6, mind: 4.1, measure: 1.3 };
const EASE = "cubic-bezier(.32,.72,0,1)";

export default function ScoreBubbles() {
  const { bubbles, planAssigned, setEatDetail, setMoveDetail, setMindDetail, setActiveTab } = useWF();

  const go = {
    eat: () => setEatDetail(true),
    move: () => setMoveDetail(true),
    mind: () => setMindDetail(true),
    measure: () => setActiveTab("med"),
  };

  /* Before a plan lands there is no day for a score to read and nothing for
     one pillar to be ahead of another on, so the four are four ways in rather
     than four readings. The bubbles arrive with the plan, which is also when
     they start having something to say. */
  if (!planAssigned) return <Tiles bubbles={bubbles} go={go} />;

  return (
    <div
      role="group"
      aria-label="Your four pillars"
      style={{ position: "relative", width: 346, height: 236, margin: "0 auto" }}
    >
      {bubbles.map((p) => {
        const seat = SEATS[p.id];
        const d = p.hero ? HERO : seat.d;
        const cx = p.hero ? C.x + 0.13 * (seat.x - C.x) : seat.x;
        const cy = p.hero ? C.y + 0.13 * (seat.y - C.y) : seat.y;
        const c = PILLAR[p.id];
        const idle = p.total === 0;

        return (
          <button
            key={p.id}
            onClick={go[p.id]}
            aria-label={
              p.name + ", " +
              (idle ? "nothing to do today"
                : !p.started ? (p.logged ? p.done + " of " + p.total + " done today" : "not logged yet")
                : p.score + " percent, " + p.done + " of " + p.total + " done today") +
              // The same three states the bubble draws, said in the same order.
              (p.hero ? ". " + (p.started ? p.nudge : p.logged ? p.need : p.first) : "")
            }
            style={{
              position: "absolute",
              left: cx - d / 2,
              top: cy - d / 2,
              width: d,
              height: d,
              // Named rather than `all`, so nothing transitions by accident.
              transition: ["left", "top", "width", "height"].map((k) => k + " .5s " + EASE).join(", "),
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <span
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                position: "relative",
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                background: c.w,
                /* Dashed until a pillar has a score. A dotted outline says
                   "not filled in yet" in every visual language there is, and
                   it costs no colour and no words. */
                border: p.logged ? "1.5px solid " + c.c : "1.5px dashed " + RULE,
                animation: "drift " + PERIOD[p.id] + "s ease-in-out infinite",
                animationDelay: "-" + DELAY[p.id] + "s",
              }}
            >
              {/* Fills to the score once there is one, and to how much of the
                  pillar's day is in before that, so logging always moves
                  something. */}
              <span
                aria-hidden
                style={{
                  position: "absolute", left: 0, right: 0, bottom: 0,
                  height: p.fill + "%",
                  background: c.t,
                  transition: "height .6s " + EASE,
                }}
              />

              <span style={{ position: "relative", display: "block", padding: "0 9px" }}>
                {p.hero ? (
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
                    /* No score yet. Nothing logged means the ask to start;
                       something logged means saying what still opens it, which
                       `pillarScores` has already written. */
                    <span style={{ display: "block", fontFamily: "'Playfair Display', serif", fontSize: p.logged ? 14 : 16, color: TEXT, lineHeight: 1.32 }}>
                      {p.logged ? p.need : p.first}
                      <CtaArrow size={14} style={{ color: c.c, marginLeft: 5, verticalAlign: -2 }} />
                    </span>
                  )
                ) : (
                  <>
                    {/* A small one keeps its name, because that is all it has
                        to identify itself by. */}
                    <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: idle ? MUTED : TEXT, letterSpacing: 0.2 }}>
                      {p.name}
                    </span>
                    {p.started && (
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
    </div>
  );
}

/* The four as plain cards, for the days before a coach has written anything.
   Same order, same colours, same taps, so the day the plan lands nothing has
   to be relearned: the cards simply become the bubbles. */
function Tiles({ bubbles, go }) {
  const order = ["eat", "move", "mind", "measure"];
  return (
    <div role="group" aria-label="Your four pillars" style={{ display: "flex", gap: 10, padding: "0 14px" }}>
      {order.map((id) => {
        const p = bubbles.find((x) => x.id === id) || { id, name: id };
        const c = PILLAR[id];
        const Icon = ICONS[id];
        return (
          <button
            key={id}
            onClick={go[id]}
            aria-label={"Open " + p.name}
            style={{
              flex: 1,
              minWidth: 0,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: "inherit",
              textAlign: "center",
            }}
          >
            <span
              style={{
                display: "flex",
                height: 62,
                borderRadius: 16,
                background: c.w,
                border: "1px solid " + c.t,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 7,
              }}
            >
              <Icon size={22} color={c.c} strokeWidth={1.8} />
            </span>
            <span style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: TEXT }}>{p.name}</span>
          </button>
        );
      })}
    </div>
  );
}
