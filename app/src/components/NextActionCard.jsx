import React from "react";
import { useWF } from "../state";
import { BarChart3 } from "lucide-react";
import CtaArrow from "./CtaArrow";
import {
  GREEN, GREEN_DEEP, GREEN_TINT, TEXT, MUTED, BG,
  GOLD, GOLD_DEEP, GOLD_TINT, GOLD_LINE,
} from "../tokens";

/* The one thing worth doing next, on Home beside the program card.

   It is deliberately not a checklist. A person with six things pending will do
   none of them, so this card holds exactly one ask at a time and the tab
   badge says how many are waiting behind it. */

const NEXT_ACTIONS = {
  score: {
    Icon: BarChart3,
    eyebrow: "Start here",
    title: "Take your Metabolic Score",
    line: "A few questions about your body and your day. It gives your coaches a starting point, and gives you a number you can watch move.",
    cta: "Take the score",
  },
};

export default function NextActionCard() {
  const { CARD_W, CARD_H, nextAction, setActiveTab } = useWF();
  const a = NEXT_ACTIONS[nextAction];

  const shell = {
    width: CARD_W,
    height: CARD_H,
    boxSizing: "border-box",
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  };

  // Nothing pending. The tab still exists, so it has to say so rather than
  // showing an empty rectangle.
  if (!a) {
    return (
      <div
        style={{
          ...shell,
          background: GREEN_TINT,
          border: "1px solid " + BG,
          padding: "16px 16px",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: GREEN_DEEP }}>Nothing pending</div>
        <div style={{ fontSize: 11.5, color: MUTED, marginTop: 4, lineHeight: 1.45 }}>
          You are all caught up. Anything your coaches need from you will show up here.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...shell,
        background: "linear-gradient(135deg, " + GOLD_TINT + " 0%, " + BG + " 72%)",
        border: "1px solid " + GOLD_LINE,
        padding: "13px 15px 14px",
      }}
    >
      {/* A quiet hexagon field in the corner, the app's own motif rather than
          a stock pattern. It gives the card weight without competing. */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          right: -26,
          bottom: -34,
          width: 132,
          height: 144,
          background: GOLD,
          opacity: 0.13,
          clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          right: 42,
          bottom: -18,
          width: 62,
          height: 68,
          background: GOLD,
          opacity: 0.1,
          clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
        }}
      />

      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 6 }}>
        <a.Icon size={12} color={GOLD_DEEP} strokeWidth={2.4} />
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: GOLD_DEEP,
          }}
        >
          {a.eyebrow}
        </span>
      </div>

      <div
        style={{
          position: "relative",
          fontSize: 14.5,
          fontWeight: 700,
          color: TEXT,
          lineHeight: 1.25,
          marginTop: 6,
        }}
      >
        {a.title}
      </div>

      <button
        onClick={() => setActiveTab("med")}
        style={{
          position: "relative",
          marginTop: "auto",
          alignSelf: "flex-start",
          display: "flex",
          alignItems: "center",
          fontSize: 11.5,
          fontWeight: 700,
          padding: "6px 13px",
          borderRadius: 999,
          border: "none",
          background: GREEN,
          color: "#fff",
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: "0 2px 0 " + GREEN_DEEP,
        }}
      >
        {a.cta}
        <CtaArrow size={13} />
      </button>
    </div>
  );
}
