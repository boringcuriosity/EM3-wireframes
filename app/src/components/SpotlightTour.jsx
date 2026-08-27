import React, { useEffect, useState } from "react";
import { useWF } from "../state";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { GREEN, GREEN_DEEP, TEXT, MUTED, BG, BORDER, LINE, SH_XL } from "../tokens";

/* A real spotlight tour. The screen dims, one element stays lit, and the note
   is anchored to it rather than shoved into the layout. Each step scrolls its
   element into view first, so nothing is ever explained off screen.

   The last step is different on purpose: it does not offer Next. The dim opens
   over the card so the user taps the actual button, which is the only way a
   tour ends with someone having done the thing. Skip is always there. */

const STEPS = [
  {
    id: "program",
    title: "Your program lives here",
    body: "Everything that is part of your care plan, like your coaches, your sessions, your lab tests, your devices and your progress, can be accessed from here.",
  },
  {
    id: "score",
    title: "Your metabolic score",
    body: "One number that shows how your metabolism is doing right now. Take it once, so your coaches can understand your metabolic health better.",
  },
  {
    id: "pillars",
    title: "Now the important part",
    body: "Eat, Move, Mind and Measure are what you do every day. That is what shifts your metabolism.",
    cta: "Let's start",
  },
];

/* The single mark shown the first time Home has a real task row on it. Same
   spotlight, one stop, and it explains the row rather than touring the page. */
const FOCUS = [
  {
    id: "focus",
    title: "Your day lives here",
    body: "Your next two tasks are always on top. Finish the task list to keep your streak and earn Flipcoins, as you improve your metabolism.",
  },
];

const SEQUENCES = { home: STEPS, focus: FOCUS };

/* How much room the spotlight leaves around the element. Wider than it is
   tall, because the cards already run close to the page edges and the extra
   height is what stops the ring sitting on the content. */
const PAD_X = 14;
const PAD_Y = 12;
const DIM = "rgba(16,24,40,0.64)";

export default function SpotlightTour() {
  const { tour, setTour, tourName, tourTargets, activeTab, isPaid, setOnboardingStep, setOnboardingOpen } = useWF();
  const seq = SEQUENCES[tourName] || STEPS;
  const [box, setBox] = useState(null);
  const [root, setRoot] = useState(null);

  const step = seq[tour];

  // Bring the element on screen, let the scroll settle, then measure. Measured
  // twice because a smooth scroll has no reliable "finished" event.
  useEffect(() => {
    if (tour === null || !root || !seq[tour]) return;
    const el = tourTargets.current[seq[tour].id];
    if (!el) {
      setBox(null);
      return;
    }
    // "nearest" horizontally: nothing on the tour needs the page moved
    // sideways, and asking for it made the scroller pan, which read as the
    // frame widening. "center" here would also fight the carousel's snap.
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    const measure = () => {
      const t = tourTargets.current[seq[tour]?.id];
      if (!t) return;
      const r = t.getBoundingClientRect();
      const o = root.getBoundingClientRect();
      setBox({ x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height });
    };
    const a = setTimeout(measure, 380);
    const b = setTimeout(measure, 660);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [tour, root, tourTargets, seq]);

  // Everything it points at lives on a program user's Home.
  if (tour === null || !step || activeTab !== "home" || !isPaid) return null;

  const last = tour >= seq.length - 1;
  const end = () => setTour(null);
  const next = () => (last ? end() : setTour(tour + 1));
  const back = () => setTour(Math.max(0, tour - 1));

  // The note goes under the element when there is room, otherwise above it.
  const NOTE_H = 150;
  const below = box ? box.y + box.h + PAD_Y + NOTE_H < 760 : true;
  const rawTop = box ? (below ? box.y + box.h + PAD_Y + 10 : box.y - PAD_Y - NOTE_H - 10) : 300;
  const noteTop = Math.min(Math.max(rawTop, 54), 700 - NOTE_H);

  const hole = box
    ? {
        left: box.x - PAD_X,
        top: box.y - PAD_Y,
        width: box.w + PAD_X * 2,
        height: box.h + PAD_Y * 2,
      }
    : null;

  return (
    <div ref={setRoot} style={{ position: "absolute", inset: 0, zIndex: 60, pointerEvents: "none" }}>
      {/* The dim itself, one element, so the cutout keeps its rounded corners.
          It paints only: clicks are handled by the panes below it. */}
      {hole && (
        <div
          style={{
            position: "absolute",
            ...hole,
            borderRadius: 22,
            boxShadow: "0 0 0 9999px " + DIM,
            pointerEvents: "none",
            transition: "all .36s cubic-bezier(.4,0,.2,1)",
          }}
        />
      )}

      {/* The lit ring */}
      {hole && (
        <div
          style={{
            position: "absolute",
            ...hole,
            borderRadius: 22,
            border: "2px solid " + GREEN,
            boxShadow: "0 0 0 5px rgba(41,157,107,0.22)",
            pointerEvents: "none",
            transition: "all .36s cubic-bezier(.4,0,.2,1)",
          }}
        />
      )}

      {/* Four panes around the hole swallow taps and scrolling, so the page
          stays put while a step is being read. The hole is left open, which is
          what lets the last step's button be pressed for real. */}
      {hole &&
        [
          { left: 0, top: 0, right: 0, height: Math.max(0, hole.top) },
          { left: 0, top: hole.top + hole.height, right: 0, bottom: 0 },
          { left: 0, top: hole.top, width: Math.max(0, hole.left), height: hole.height },
          { left: hole.left + hole.width, top: hole.top, right: 0, height: hole.height },
        ].map((p, i) => (
          <div
            key={i}
            onClick={last ? undefined : next}
            style={{ position: "absolute", ...p, pointerEvents: "auto" }}
          />
        ))}

      {/* The lit card is shown, not live: tapping it would leave Home mid-tour.
          It advances instead, and the last step's action sits in the note. */}
      {hole && (
        <div
          onClick={step.cta ? undefined : next}
          style={{ position: "absolute", ...hole, pointerEvents: "auto" }}
        />
      )}

      {/* Kaira's note */}
      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          top: noteTop,
          background: BG,
          borderRadius: 18,
          boxShadow: SH_XL,
          padding: "14px 16px 14px",
          pointerEvents: "auto",
          animation: "tourpop .34s ease both",
          transition: "top .36s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* The pointer, on whichever side the element is */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: box ? Math.min(Math.max(box.x + box.w / 2 - 16, 14), 300) : 150,
            [below ? "top" : "bottom"]: -7,
            width: 14,
            height: 14,
            background: BG,
            transform: "rotate(45deg)",
            borderRadius: 3,
          }}
        />

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 20,
              height: 22,
              flexShrink: 0,
              background: "linear-gradient(150deg, " + GREEN + " 0%, " + GREEN_DEEP + " 100%)",
              clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 10,
              fontWeight: 600,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            K
          </span>
          <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: TEXT }}>{step.title}</span>
          {/* Every stop can be left, including the last one: it ends on an
              action, and an action nobody wants still needs a way out. */}
          <button
            onClick={end}
            aria-label="Skip the tour"
            style={{
              background: "none",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              padding: 4,
              margin: -4,
            }}
          >
            <X size={16} color={MUTED} />
          </button>
        </div>

        <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.55, marginTop: 8 }}>{step.body}</div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 14,
          }}
        >
          <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {seq.length > 1 && seq.map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === tour ? 16 : 5,
                  height: 5,
                  borderRadius: 3,
                  background: i <= tour ? GREEN : LINE,
                  transition: "width .3s ease, background .3s ease",
                }}
              />
            ))}
          </span>

          <span style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {tour > 0 && (
              <button
                onClick={back}
                aria-label="Previous step"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: BG,
                  border: "1px solid " + BORDER,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  padding: 0,
                }}
              >
                <ArrowLeft size={15} color={TEXT} strokeWidth={2.2} />
              </button>
            )}

          {step.cta ? (
            /* The last stop does the thing rather than pointing at it. */
            <button
              onClick={() => {
                setTour(null);
                setOnboardingStep(0);
                setOnboardingOpen(true);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: GREEN,
                border: "none",
                borderRadius: 999,
                padding: "8px 16px",
                fontSize: 12.5,
                fontWeight: 700,
                color: "#fff",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 2px 0 " + GREEN_DEEP,
              }}
            >
              {step.cta}
              <ArrowRight size={14} color="#fff" strokeWidth={2.6} />
            </button>
          ) : (
            <button
              onClick={next}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: GREEN,
                border: "none",
                borderRadius: 999,
                padding: "8px 16px",
                fontSize: 12.5,
                fontWeight: 700,
                color: "#fff",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 2px 0 " + GREEN_DEEP,
              }}
            >
              {last ? "Got it" : "Next"}
              <ArrowRight size={14} color="#fff" strokeWidth={2.6} />
            </button>
          )}
          </span>
        </div>
      </div>
    </div>
  );
}
