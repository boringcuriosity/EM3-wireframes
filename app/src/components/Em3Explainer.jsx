import React, { useState, useEffect } from "react";
import { useWF } from "../state";
import Confetti from "./Confetti";
import StreakFlame from "./StreakFlame";
import { Info } from "lucide-react";
import {
  GREEN, GREEN_DEEP, TEXT, MUTED, FAINT, BG, BORDER, LINE, PILLAR, SH,
  GOLD, GOLD_TINT, GOLD_LINE, GOLD_DEEP,
} from "../tokens";

/* What the To-do tab is, taught by showing it.

   This used to explain the four pillars as an idea, four cards deep, and left
   the real question unanswered: what am I going to be asked to do. So it leads
   with a working miniature of a day. The rows tick themselves one after
   another, the day closes, and the streak and the coins arrive the way they
   will tomorrow. Nothing here is described that could be shown.

   Rendered in both places it is needed: the onboarding takeover and the To-do
   tab's first run. Two screens telling the same story two ways is how a
   product starts contradicting itself. */

/* A day small enough to take in, drawn from the same shapes the real list
   uses. Not the live day: on first run there is nothing in it yet. */
const DEMO = [
  { pillar: "mind", title: "Log last night's sleep", when: "7:00 AM" },
  { pillar: "eat", title: "Log breakfast", when: "8:00 - 10:00 AM" },
  { pillar: "move", title: "Move for 20 minutes", when: "6:00 PM" },
];

/* One word each, the same four the splash screen opens with, so the pillars
   are named the same way everywhere. The science behind each is one tap away
   for anybody who wants it. */
const DOES = { eat: "Fuel", move: "Burn", mind: "Calm", measure: "Know" };

export default function Em3Explainer() {
  const { pillarExplain, setPillarInfo } = useWF();
  const icon = Object.fromEntries(pillarExplain.map((p) => [p.id, p.Icon]));

  /* The rows tick one after another, unhurried, and then stay ticked. A loop
     that resets turns the day into a screensaver: you watch it instead of
     reading the screen, and the finished state, which is the point, never
     stays long enough to be seen. */
  const [done, setDone] = useState(0);
  const [burst, setBurst] = useState(-1);
  useEffect(() => {
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    DEMO.forEach((_, i) => {
      at(1600 + i * 1600, () => { setDone(i + 1); setBurst(i); });
      at(2700 + i * 1600, () => setBurst((b) => (b === i ? -1 : b)));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  const all = done === DEMO.length;

  return (
    <>
      {/* Kaira says it. Small mark beside the line rather than a portrait
          above it, because she is the speaker here, not the subject. */}
      {/* Room above the headline. It sat tight under the back button, which
          made the first thing on the screen feel cramped. */}
      <div style={{ display: "flex", gap: 11, alignItems: "flex-start", paddingTop: 16 }}>
        <span style={{ position: "relative", display: "inline-flex", flexShrink: 0, marginTop: 3 }}>
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: -4,
              background: GREEN,
              clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
              animation: "kairaPulse 2.6s ease-in-out infinite",
            }}
          />
          <span
            style={{
              position: "relative",
              width: 28,
              height: 30,
              background: "linear-gradient(150deg, " + GREEN + " 0%, " + GREEN_DEEP + " 100%)",
              clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            K
          </span>
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 24,
              fontWeight: 600,
              color: TEXT,
              lineHeight: 1.22,
              letterSpacing: -0.3,
            }}
          >
            Every morning, a task
            <br />
            list made just for you.
          </h1>

          <p style={{ margin: "10px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.65 }}>
            Your coaches understand how your day generally goes, and curate daily tasks around you.
          </p>
        </div>
      </div>

      {/* The day itself, in miniature, doing what it does. */}
      <div
        style={{
          marginTop: 20,
          background: BG,
          border: "1px solid " + (all ? GOLD_LINE : BORDER),
          borderRadius: 18,
          boxShadow: SH,
          overflow: "hidden",
          transition: "border-color .4s ease",
          animation: "riseIn .45s .06s ease both",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "11px 15px 9px",
            borderBottom: "1px solid " + LINE,
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: MUTED }}>
            Today
          </span>
        </div>

        <div style={{ padding: "2px 15px 6px" }}>
          {DEMO.map((d, i) => {
            const hue = PILLAR[d.pillar];
            const Icon = icon[d.pillar];
            const on = i < done;
            const pop = burst === i;
            return (
              <div
                key={d.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "11px 0",
                  borderBottom: i === DEMO.length - 1 ? "none" : "1px solid " + LINE,
                }}
              >
                <span
                  style={{
                    position: "relative",
                    width: 19,
                    height: 19,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: on ? hue.c : BG,
                    border: "1.8px solid " + (on ? hue.c : hue.c + "66"),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background .18s ease",
                    animation: pop ? "taskPop .55s cubic-bezier(.34,1.56,.64,1) both" : undefined,
                  }}
                >
                  {pop && (
                    <>
                      <span
                        aria-hidden
                        style={{
                          position: "absolute",
                          inset: -3,
                          borderRadius: "50%",
                          border: "2px solid " + hue.c,
                          animation: "haloOut .8s cubic-bezier(.22,.7,.3,1) forwards",
                        }}
                      />
                      <Confetti pillar={d.pillar} />
                    </>
                  )}
                  {on && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                      {/* Dashed only while it draws. Left dashed afterwards the
                          tick never appears at all. */}
                      <path
                        d="M5 12.5 10.5 18 19 7"
                        stroke="#fff"
                        strokeWidth="3.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        pathLength="1"
                        style={
                          pop
                            ? { strokeDasharray: 1, strokeDashoffset: 1, animation: "checkDraw .34s cubic-bezier(.4,0,.2,1) .12s forwards" }
                            : undefined
                        }
                      />
                    </svg>
                  )}
                </span>

                <span style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      position: "relative",
                      fontSize: 12.5,
                      fontWeight: on ? 600 : 700,
                      color: on ? MUTED : TEXT,
                      transition: "color .3s ease",
                    }}
                  >
                    {d.title}
                    {on && (
                      <span
                        aria-hidden
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: "54%",
                          height: 1.5,
                          borderRadius: 1,
                          background: MUTED,
                          transformOrigin: "left center",
                          animation: pop ? "strikeIn .42s cubic-bezier(.4,0,.2,1) forwards" : undefined,
                        }}
                      />
                    )}
                  </span>
                  <span
                    aria-hidden
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 17,
                      height: 17,
                      borderRadius: 999,
                      background: hue.t,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={9.5} color={hue.c} strokeWidth={2} />
                  </span>
                </span>

                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    fontWeight: 600,
                    color: FAINT,
                    flexShrink: 0,
                  }}
                >
                  {d.when}
                </span>
              </div>
            );
          })}
        </div>

        {/* The day adding up, filling as the rows go in. The bar is the same
            one the real card carries, so the thing they will glance at every
            morning is already familiar by the time they meet it. It leaves
            once it is full: a finished bar and the reward under it are the
            same news twice. */}
        {!all && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderTop: "1px solid " + LINE,
            padding: "10px 15px 11px",
          }}
        >
          <StreakFlame size={13} fraction={all ? 1 : 0} outline={false} />
          <span style={{ fontSize: 10.5, fontWeight: 700, color: TEXT, flexShrink: 0 }}>Day 1</span>
          <span
            aria-hidden
            style={{ flex: 1, minWidth: 0, height: 4, borderRadius: 2, background: LINE, overflow: "hidden" }}
          >
            <span
              style={{
                display: "block",
                height: "100%",
                width: (done / DEMO.length) * 100 + "%",
                borderRadius: 2,
                background: GOLD,
                transition: "width .5s cubic-bezier(.32,.72,0,1)",
              }}
            />
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, color: FAINT, flexShrink: 0 }}>
            {done} of {DEMO.length} done
          </span>
        </div>
        )}

        {/* What clearing the list gives back. Shown once the list is clear,
            because a promise landing at the moment it is earned reads as a
            reward and the same promise sitting in a paragraph reads as terms
            and conditions. */}
        {all && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              background: "linear-gradient(120deg, " + GOLD_TINT + " 0%, " + BG + " 100%)",
              borderTop: "1px solid " + GOLD_LINE,
              padding: "10px 15px 11px",
              animation: "popIn .45s cubic-bezier(.32,.72,0,1) both",
            }}
          >
            <StreakFlame size={15} fraction={1} outline={false} />
            <span style={{ flex: 1, minWidth: 0, fontSize: 11, fontWeight: 600, color: GOLD_DEEP, lineHeight: 1.45 }}>
              Finish your tasks, keep your streak going, and earn Flipcoins along the way.
            </span>
            <span
              aria-hidden
              style={{
                width: 13,
                height: 13,
                flexShrink: 0,
                background: GOLD,
                clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
              }}
            />
          </div>
        )}
      </div>

      {/* The four, as four. Each one a card of its own, because they are four
          separate parts of a day and not one block of theory. */}
      <p style={{ margin: "20px 0 10px", fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>
        Every task belongs to one of four habits. Keep them steady and your metabolism follows.
      </p>

      <div style={{ display: "flex", gap: 8 }}>
        {pillarExplain.map((p, i) => {
          const hue = PILLAR[p.id];
          return (
            <button
              key={p.id}
              onClick={() => setPillarInfo(p.id)}
              aria-label={p.label + ", " + DOES[p.id] + ". Why " + p.concept + " matters"}
              style={{
                flex: 1,
                minWidth: 0,
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 15,
                boxShadow: SH,
                padding: "13px 5px 13px",
                cursor: "pointer",
                fontFamily: "inherit",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 7,
                animation: "riseIn .45s " + (0.1 + i * 0.06) + "s ease both",
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: hue.t,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <p.Icon size={16} color={hue.c} strokeWidth={1.9} />
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: TEXT }}>{p.label}</span>
              <span style={{ fontSize: 9.5, color: MUTED, lineHeight: 1.3 }}>{DOES[p.id]}</span>
              {/* The way to the science, in the corner. As a "Why" link under
                  the words it competed with the words. */}
              <Info
                size={11}
                strokeWidth={2.2}
                color={FAINT}
                style={{ position: "absolute", top: 7, right: 7 }}
              />
            </button>
          );
        })}
      </div>

      <p
        style={{
          fontSize: 11.5,
          color: MUTED,
          textAlign: "center",
          lineHeight: 1.6,
          margin: "18px 0 8px",
        }}
      >
        Your coaches see everything you tick off, and the list keeps changing as they get to know you.
      </p>
    </>
  );
}
