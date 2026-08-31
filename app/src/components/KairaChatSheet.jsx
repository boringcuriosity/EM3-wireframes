import React, { useState, useEffect } from "react";
import { useWF } from "../state";
import { X, ArrowUp } from "lucide-react";
import { askAbout } from "../screens/today/day";
import {
  GREEN, GREEN_DEEP, GREEN_TINT,
  TEXT, MUTED, FAINT, BG, BG_ALT, BORDER, LINE,
} from "../tokens";

/* Kaira, opened on a question that has already been asked.

   The button that got here was the question, so the thread starts with it sent
   rather than with an empty box and a cursor. Asking somebody to retype what
   they just tapped is the kind of thing that makes a chat feel like a form.

   She answers after a beat. An answer that lands in the same frame as the
   question reads as a lookup, and the whole point of her being here is that
   this is the one part of a tip a card cannot hold. */

/* One answer per tip. Written to tell somebody something they did not know,
   which is the whole test for a line of hers: a recap of the row above it
   would be worth nobody's tap. */
const ANSWERS = {
  "note:methi": [
    "Methi seeds are wrapped in a soluble fibre called galactomannan. In water it turns to gel, and that gel slows how fast your stomach empties into the gut.",
    "So the sugar from breakfast arrives in a slow stream rather than a wave, and the spike your body has to answer is smaller. On an empty stomach the gel is already in place before the food lands, which is why the timing matters as much as the seeds.",
  ],
  "note:sun": [
    "Light in the first hour or two after waking is what sets your body clock for the day. That clock decides when melatonin arrives at night, so morning light is really about how easily you fall asleep sixteen hours later.",
    "It has to be outdoors. A bright room is around 300 lux, an overcast sky is 10,000, and the eye reads the difference. Ten minutes on the balcony does more than an hour by the window.",
  ],
  "note:almonds": [
    "Almond skins carry tannins, which bind to the iron and zinc in the nut and to the enzymes your gut uses to break it down. Soaking pulls those tannins into the water, and the skin slips off with them.",
    "You also soften the cell walls, so the vitamin E and the good fats underneath are easier to absorb. Overnight in plain water is enough. Peel them in the morning and throw the water away.",
  ],
};

const FALLBACK = [
  "Your coach put this one in your day because it is small enough to hold on the days you have no time, and those are the days it counts.",
  "Ask me again once you have run it for a week and I can tell you what it moved.",
];

export default function KairaChatSheet() {
  const { kairaAsk, setKairaAsk, dayRows } = useWF();
  const r = dayRows.find((x) => x.id === kairaAsk);
  const [typing, setTyping] = useState(true);

  /* App mounts this keyed on the question, so a second tip opened after a
     first one arrives as a fresh sheet with her thinking again rather than
     showing the previous answer instantly. That is why the reset lives in the
     key rather than in here. */
  useEffect(() => {
    const t = setTimeout(() => setTyping(false), 1400);
    return () => clearTimeout(t);
  }, []);

  if (!r) return null;
  const answer = ANSWERS[r.id] || FALLBACK;

  return (
    <div
      onClick={() => setKairaAsk(null)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 57,
        background: "rgba(16,24,40,0.46)",
        display: "flex",
        alignItems: "flex-end",
        animation: "scrimIn .24s ease both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chat with Kaira"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          height: "82%",
          background: BG,
          borderRadius: "26px 26px 0 0",
          overflow: "hidden",
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          display: "flex",
          flexDirection: "column",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >

        {/* Who you are talking to. Her own mark rather than an avatar, because
            that hexagon is what she is recognised by everywhere else. */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "20px 22px 12px",
            borderBottom: "1px solid " + LINE,
          }}
        >
          <Mark size={30} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: TEXT }}>Kaira</span>
            <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 1 }}>
              AI care assistant
            </span>
          </span>
          <button
            onClick={() => setKairaAsk(null)}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: -4, display: "flex" }}
          >
            <X size={18} color={MUTED} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", minHeight: 0, background: BG_ALT, padding: "16px 18px 8px" }}>
          {/* Sent, past tense. The tap that opened this was the asking. */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <span
              style={{
                maxWidth: "82%",
                background: GREEN,
                color: "#fff",
                borderRadius: "16px 16px 4px 16px",
                padding: "10px 13px",
                fontSize: 12.5,
                lineHeight: 1.5,
              }}
            >
              {askAbout(r)}
            </span>
          </div>

          {typing ? (
            <Bubble>
              <Dots />
            </Bubble>
          ) : (
            answer.map((line, i) => (
              <Bubble key={i} delay={i * 0.12}>
                {line}
              </Bubble>
            ))
          )}
        </div>

        {/* A real looking box that goes nowhere on purpose. The wireframe has
            one answer to give and a working field would promise a second. */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "10px 18px 20px",
            borderTop: "1px solid " + LINE,
            background: BG,
          }}
        >
          <span
            style={{
              flex: 1,
              minWidth: 0,
              background: BG_ALT,
              border: "1px solid " + BORDER,
              borderRadius: 999,
              padding: "11px 15px",
              fontSize: 12.5,
              color: FAINT,
            }}
          >
            Ask Kaira anything
          </span>
          <span
            aria-hidden
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              flexShrink: 0,
              background: BG_ALT,
              border: "1px solid " + BORDER,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowUp size={17} color={FAINT} strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </div>
  );
}

/* One of hers. Her mark rides beside the first line only, so a two part answer
   reads as one person talking rather than as two notifications. */
export function Bubble({ children, delay = 0 }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginBottom: 10,
        animation: "riseIn .32s cubic-bezier(.32,.72,0,1) " + delay + "s both",
      }}
    >
      <span style={{ width: 22, flexShrink: 0 }}>{delay === 0 && <Mark size={22} />}</span>
      <span
        style={{
          maxWidth: "88%",
          background: BG,
          border: "1px solid " + GREEN_TINT,
          borderRadius: "16px 16px 16px 4px",
          padding: "11px 13px",
          fontSize: 12.5,
          color: TEXT,
          lineHeight: 1.55,
        }}
      >
        {children}
      </span>
    </div>
  );
}

export function Mark({ size }) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size * 1.09,
        flexShrink: 0,
        background: "linear-gradient(150deg, " + GREEN + " 0%, " + GREEN_DEEP + " 100%)",
        clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: size * 0.42,
        fontWeight: 800,
      }}
    >
      K
    </span>
  );
}

/* Three dots, out of step with each other. The delay is what makes it read as
   thinking rather than as a loading bar. */
export function Dots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, padding: "2px 4px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: FAINT,
            animation: "kairaPulse 1.1s ease-in-out " + i * 0.18 + "s infinite",
          }}
        />
      ))}
    </span>
  );
}
