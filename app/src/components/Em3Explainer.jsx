import React, { useState, useEffect } from "react";
import { useWF } from "../state";
import Confetti from "./Confetti";
import { Info } from "lucide-react";
import { GREEN, GREEN_DEEP, TEXT, MUTED, FAINT, BG, BG_ALT, BORDER, LINE, PILLAR, SH } from "../tokens";

/* What the To-do tab is, taught by showing it.

   This used to explain the four pillars as an idea, four cards deep, and left
   the actual question unanswered: what am I going to be asked to do. So it
   leads with a working miniature of the day instead. One row ticks itself
   while you read, which is the whole interaction in one glance, and the four
   pillars stay on as a legend for the colours rather than as the subject.

   Rendered in both places it is needed: the onboarding takeover and the To-do
   tab's first run. Two screens telling the same story two ways is how a
   product starts contradicting itself. */

/* A day small enough to take in, drawn from the same shapes the real list
   uses. Not the live day: on first run there is nothing in it yet. */
const DEMO = [
  { pillar: "mind", title: "Log last night's sleep", when: "7:00 AM" },
  { pillar: "eat", title: "Breakfast", when: "8:00 - 10:00 AM" },
  { pillar: "move", title: "Move for 20 minutes", when: "6:00 PM" },
];

export default function Em3Explainer() {
  const { pillarExplain, setPillarInfo } = useWF();
  const icon = Object.fromEntries(pillarExplain.map((p) => [p.id, p.Icon]));

  /* The middle row ticks itself, waits, and resets. It is the one thing a
     person will do fourteen times tomorrow, so it is worth showing rather
     than describing. */
  const [done, setDone] = useState(false);
  const [burst, setBurst] = useState(false);
  useEffect(() => {
    const timers = [];
    const cycle = () => {
      timers.push(setTimeout(() => { setDone(true); setBurst(true); }, 1200));
      timers.push(setTimeout(() => setBurst(false), 2300));
      timers.push(setTimeout(() => setDone(false), 4600));
    };
    cycle();
    const loop = setInterval(cycle, 6000);
    return () => { clearInterval(loop); timers.forEach(clearTimeout); };
  }, []);

  return (
    <>
      {/* Kaira says it. Small mark beside the line rather than a portrait
          above it, because she is the speaker here, not the subject. */}
      <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
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
            Your day, a few small
            <br />
            tasks at a time.
          </h1>

          <p style={{ margin: "9px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>
            Your coaches turn your plan into a short list. You tick things off as the day goes.
          </p>
        </div>
      </div>

      {/* The day itself, in miniature. */}
      <div
        style={{
          marginTop: 20,
          background: BG,
          border: "1px solid " + BORDER,
          borderRadius: 18,
          boxShadow: SH,
          overflow: "hidden",
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
            Your day
          </span>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: FAINT }}>
            {done ? "1 of 3 done" : "0 of 3 done"}
          </span>
        </div>

        <div style={{ padding: "2px 15px 6px" }}>
          {DEMO.map((d, i) => {
            const hue = PILLAR[d.pillar];
            const Icon = icon[d.pillar];
            const on = i === 1 && done;
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
                    animation: burst && i === 1 ? "taskPop .55s cubic-bezier(.34,1.56,.64,1) both" : undefined,
                  }}
                >
                  {burst && i === 1 && (
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
                          burst
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
                          animation: "strikeIn .42s cubic-bezier(.4,0,.2,1) forwards",
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
      </div>

      {/* The colours, explained once, and the way into the science behind each
          one. Small, because they are a legend here and not the lesson. */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.6, marginBottom: 10 }}>
          Every task belongs to one of four habits. Together they are what moves your metabolism.
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            background: BG_ALT,
            border: "1px solid " + LINE,
            borderRadius: 16,
            padding: "12px 10px",
          }}
        >
          {pillarExplain.map((p, i) => {
            const hue = PILLAR[p.id];
            return (
              <button
                key={p.id}
                onClick={() => setPillarInfo(p.id)}
                aria-label={"Why " + p.concept + " matters"}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
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
                <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{p.label}</span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 9,
                    fontWeight: 600,
                    color: MUTED,
                    lineHeight: 1.25,
                    textAlign: "center",
                  }}
                >
                  {p.concept}
                  <Info size={9} strokeWidth={2.4} color={FAINT} style={{ flexShrink: 0 }} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          fontSize: 11.5,
          color: MUTED,
          textAlign: "center",
          lineHeight: 1.55,
          margin: "16px 0 8px",
        }}
      >
        Your coaches set the list, and it changes as they get to know you.
      </div>
    </>
  );
}
