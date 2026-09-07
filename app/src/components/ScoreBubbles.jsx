import React from "react";
import { useWF } from "../state";
import CtaArrow from "./CtaArrow";
import { Utensils, Flame, BarChart3 } from "lucide-react";
import LotusIcon from "./LotusIcon";
import { PILLAR, TEXT, MUTED } from "../tokens";

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
const HERO = 158;
// Out of step with each other on the first frame, so the four never pulse together.
const PERIOD = { eat: 8, move: 9.4, mind: 7.2, measure: 8.7 };
const DELAY = { eat: 0, move: 2.6, mind: 4.1, measure: 1.3 };
/* Settling, with a little overshoot. A handover is a thing arriving, and a
   bubble that eases politely into its size reads as a resize rather than as
   something that moved. */
const EASE = "cubic-bezier(.34,1.3,.5,1)";
// The liquid has weight, so it takes longer to settle than the shell does.
const POUR = "cubic-bezier(.22,1,.36,1)";

/* Depth, three ways.

   Flat is what these were: one tint, one hairline, one rectangular block of
   fill. It reads as a disc with a bar in it. The other two light the sphere
   from the top left and let the fill behave like liquid, which is what makes
   a circle read as a bubble rather than as a pie.

   Written as one function per skin rather than as a table of values, because
   every layer is derived from the pillar's own hue and a table would be the
   same three colours written twelve times. */
const SKINS = {
  flat: (c, on) => ({
    shell: {
      background: c.w,
      border: "1.5px solid " + (on ? c.c : c.t),
    },
    fill: { background: c.t },
    spec: null,
  }),
  glass: (c, on) => ({
    shell: {
      background:
        "radial-gradient(120% 120% at 30% 22%, #FFFFFF 0%, " + c.w + " 46%, " + c.t + " 100%)",
      /* One rim, drawn the same whether anything is in or not, just paler
         while it is empty. A dashed ring was meant to say "not filled in
         yet", but the liquid level and the missing number already say that,
         and four broken outlines on one card read as damage rather than as a
         state. A bubble with nothing in it is still a bubble. */
      border: "1.5px solid " + (on ? c.t : c.w),
      boxShadow:
        "0 10px 22px -9px " + c.c + "3D, inset 0 -12px 18px -12px " + c.c + "66, inset 0 7px 12px -7px #FFFFFF",
    },
    fill: {
      background: "linear-gradient(180deg, " + c.t + " 0%, " + c.c + "40 100%)",
    },
    spec: { top: "13%", left: "20%", width: "30%", height: "20%", opacity: 0.85, blur: 5 },
  }),
  orb: (c, on) => ({
    shell: {
      background:
        "radial-gradient(130% 130% at 28% 18%, #FFFFFF 0%, " + c.w + " 32%, " + c.t + " 74%, " + c.c + "59 100%)",
      border: "none",
      // The rim is an inner line rather than a border, so it curves with the
      // sphere instead of ringing it. Softer while the bubble is empty.
      boxShadow:
        "0 16px 30px -12px " + c.c + "59, 0 2px 5px " + c.c + "26, " +
        "inset 0 -16px 24px -13px " + c.c + "A6, inset 0 9px 15px -8px #FFFFFF, " +
        "inset 0 0 0 1px " + c.c + (on ? "26" : "14"),
    },
    fill: {
      background: "linear-gradient(180deg, " + c.t + " 0%, " + c.c + "59 100%)",
    },
    spec: { top: "10%", left: "17%", width: "34%", height: "23%", opacity: 1, blur: 6 },
  }),
};

export default function ScoreBubbles() {
  const { bubbles, planAssigned, bubbleSkin, openRow, setEatDetail, setMoveDetail, setMindDetail, setActiveTab } = useWF();

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
        const skin = (SKINS[bubbleSkin] || SKINS.flat)(c, p.logged);

        return (
          <button
            key={p.id}
            /* The big one opens what it just asked about; a small one is a way
               into its pillar, because it is not asking anything specific. */
            onClick={p.hero && p.next ? () => openRow(p.next) : go[p.id]}
            aria-label={
              p.name + ", " +
              (idle ? "nothing to do today"
                : !p.started ? (p.logged ? p.done + " of " + p.total + " done today" : "not logged yet")
                : p.score + " percent, " + p.done + " of " + p.total + " done today") +
              // The same three states the bubble draws, said in the same order.
              (p.hero ? ". " + p.ask : "")
            }
            style={{
              position: "absolute",
              left: cx - d / 2,
              top: cy - d / 2,
              width: d,
              height: d,
              // Named rather than `all`, so nothing transitions by accident.
              transition: ["left", "top", "width", "height"].map((k) => k + " .62s " + EASE).join(", "),
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
                /* Lit, rimmed and shadowed by the skin. Dashed until a
                   pillar has anything in it, because a dotted outline says
                   "not filled in yet" in every visual language there is, and
                   it costs no colour and no words. */
                ...skin.shell,
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
                  ...skin.fill,
                  transition: "height .85s " + POUR,
                }}
              >
                {/* The surface. A flat cut across a sphere reads as a chart;
                    a lit line that breathes reads as something poured in. */}
                {bubbleSkin !== "flat" && p.fill > 0 && (
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: "-10%", right: "-10%", top: -1,
                      height: 3,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,.62)",
                      animation: "meniscus 4.6s ease-in-out infinite",
                    }}
                  />
                )}
              </span>

              {/* Where the light lands. One highlight, high and left, which is
                  the whole difference between a disc and a sphere. */}
              {skin.spec && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: skin.spec.top, left: skin.spec.left,
                    width: skin.spec.width, height: skin.spec.height,
                    borderRadius: "50%",
                    background: "#FFFFFF",
                    opacity: p.logged ? skin.spec.opacity : skin.spec.opacity * 0.5,
                    filter: "blur(" + skin.spec.blur + "px)",
                  }}
                />
              )}

              {/* Keyed on the question, so a handover replays rather than
                  swapping the words under a circle that is already the right
                  size. The arrival is the half of the movement that says
                  something new is being asked. */}
              <span
                key={p.hero ? "ask:" + p.ask : "small"}
                style={{
                  position: "relative",
                  display: "block",
                  padding: "0 9px",
                  animation: p.hero ? "riseIn .5s cubic-bezier(.32,.72,0,1) both" : undefined,
                }}
              >
                {p.hero ? (
                  /* The question first, always. A score is the answer to a
                     different question and it only exists once something has
                     gone in, so it sits under the ask rather than replacing
                     it. Long questions step the type down rather than
                     spilling out of the circle. */
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
