import React from "react";
import { useWF } from "../state";
import { BarChart3, FlaskConical, Bluetooth } from "lucide-react";
import CtaArrow from "./CtaArrow";
import {
  GREEN, GREEN_DEEP, TEXT, MUTED, GOLD_TINT, GOLD_LINE, GOLD_DEEP, GOLD, SH_SM,
} from "../tokens";

/* What has to happen before a coach can write anything.

   These are the same three jobs the Next actions card on Home carries, read
   off the same list, so ticking one anywhere clears it everywhere. Home shows
   them as a checklist because they sit beside two other cards there. Here they
   are the first thing on the screen and there is room to say why each one
   matters, so each gets a card of its own.

   All three are Measure work, which is why they share one colour rather than
   competing for attention with three. */

const CATALOGUE = {
  score: {
    Icon: BarChart3,
    title: "Take your metabolic score",
    line: "A few questions about how you eat, move and sleep. It tells your coach where you are starting from.",
    cta: "Take the test",
    tab: "med",
  },
  labs: {
    Icon: FlaskConical,
    title: "Book your diagnostics",
    line: "A blood test at home. Your coach reads the numbers before deciding anything about your food.",
    cta: "Book a slot",
    tab: "care",
  },
  bca: {
    Icon: Bluetooth,
    title: "Connect your BCA",
    line: "Your body composition scale. It shows muscle and fat separately, which weight alone never can.",
    cta: "Connect device",
    tab: "med",
  },
};

export default function PrereqRail() {
  const { nextOpen, CARD_PAD, CARD_GAP, CARD_TAIL, setActiveTab } = useWF();
  const items = nextOpen.map((id) => ({ id, ...CATALOGUE[id] })).filter((x) => x.title);
  if (!items.length) return null;

  return (
    <div style={{ marginLeft: -CARD_PAD, marginRight: -CARD_PAD }}>
      <div style={{ padding: "0 " + CARD_PAD + "px", marginBottom: 12 }}>
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 19,
            fontWeight: 600,
            color: TEXT,
            lineHeight: 1.25,
          }}
        >
          Start here
        </div>
        <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, marginTop: 4 }}>
          Your care program needs these before your coach can build anything for you.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: CARD_GAP,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollPaddingLeft: CARD_PAD,
          paddingLeft: CARD_PAD,
          paddingRight: CARD_TAIL,
          paddingTop: 6,
          paddingBottom: 14,
          marginTop: -6,
          marginBottom: -8,
          scrollbarWidth: "none",
        }}
      >
        {items.map((x) => (
          <div
            key={x.id}
            style={{
              width: 268,
              flexShrink: 0,
              scrollSnapAlign: "start",
              position: "relative",
              overflow: "hidden",
              background: GOLD_TINT,
              border: "1px solid " + GOLD_LINE,
              borderRadius: 18,
              padding: "15px 16px 16px",
              boxShadow: SH_SM,
            }}
          >
            <Watermark />
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
              <x.Icon size={15} color={GOLD_DEEP} strokeWidth={2.2} />
              <span style={{ fontSize: 14.5, fontWeight: 700, color: GOLD_DEEP, lineHeight: 1.3 }}>
                {x.title}
              </span>
            </div>
            <div
              style={{
                position: "relative",
                fontSize: 11.5,
                color: MUTED,
                lineHeight: 1.5,
                margin: "7px 0 13px",
                minHeight: 52,
              }}
            >
              {x.line}
            </div>
            <button
              onClick={() => setActiveTab(x.tab)}
              style={{
                position: "relative",
                background: GREEN,
                border: "none",
                borderRadius: 11,
                padding: "9px 14px",
                color: "#fff",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 2px 0 " + GREEN_DEEP,
              }}
            >
              {x.cta}
              <CtaArrow size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* GoodFlip's own mark, at the weight of a watermark. It fills the corner the
   copy does not reach, which is what stops a short card looking unfinished. */
function Watermark() {
  return (
    <svg
      width="150"
      height="150"
      viewBox="0 0 60 60"
      aria-hidden
      style={{ position: "absolute", right: -34, bottom: -40, opacity: 0.16 }}
    >
      {[
        [30, 8], [12, 19], [48, 19], [30, 30], [12, 41], [48, 41], [30, 52],
      ].map(([cx, cy], i) => (
        <path
          key={i}
          d={`M${cx} ${cy - 9} l7.8 4.5 v9 L${cx} ${cy + 9} l-7.8 -4.5 v-9 z`}
          fill="none"
          stroke={GOLD}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
