import React from "react";
import { useWF } from "../state";
import { BarChart3, FlaskConical } from "lucide-react";
import CtaArrow from "./CtaArrow";
import {
  GREEN, GREEN_DEEP, MUTED, WARN, WARN_TINT, WARN_LINE, SH_SM,
} from "../tokens";

/* One thing the care program cannot start without.

   Amber rather than gold, because gold in this system means knowledge and
   reward and these are neither. They are the two jobs holding everything else
   up, and amber is the one family that says so without shouting the way red
   would. Two of them, side by side, in the same colour: one set of asks, not
   two competing ones.

   The same card serves the To-do rail and the Home carousel. Only the width
   changes, because the two rails are different widths. */

const PREREQS = {
  score: {
    Icon: BarChart3,
    title: "Take your metabolic score",
    line: "A few questions about how you eat, move and sleep. It tells your coach where you are starting from.",
    cta: "Get my score",
    tab: "med",
  },
  labs: {
    Icon: FlaskConical,
    title: "Book your diagnostics",
    line: "A blood test at home. Your coach reads the numbers before deciding anything about your food.",
    cta: "Book a slot",
    tab: "care",
  },
};

export default function PrereqCard({ id, width, minHeight }) {
  const { setActiveTab, nextDone, setNextDone } = useWF();
  const x = PREREQS[id];
  if (!x) return null;

  /* Tapping through is what finishes it. There is no separate tick, because
     nobody books a lab test and then also ticks a box to say so. */
  const go = () => {
    if (!nextDone.includes(id)) setNextDone(nextDone.concat(id));
    setActiveTab(x.tab);
  };

  return (
    <div
      style={{
        width,
        minHeight,
        boxSizing: "border-box",
        flexShrink: 0,
        scrollSnapAlign: "start",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: WARN_TINT,
        border: "1px solid " + WARN_LINE,
        borderRadius: 18,
        padding: "15px 16px 16px",
        boxShadow: SH_SM,
      }}
    >
      <Watermark />
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
        <x.Icon size={15} color={WARN} strokeWidth={2.2} />
        <span style={{ fontSize: 14.5, fontWeight: 700, color: WARN, lineHeight: 1.3 }}>
          {x.title}
        </span>
      </div>
      <div
        style={{
          position: "relative",
          flex: 1,
          fontSize: 11.5,
          color: MUTED,
          lineHeight: 1.5,
          margin: "7px 0 13px",
        }}
      >
        {x.line}
      </div>
      <button
        onClick={go}
        style={{
          position: "relative",
          alignSelf: "flex-start",
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
  );
}

/* The brand's own corner mark. Served from public/ rather than inlined,
   because it is 128KB of gradients and every card would otherwise carry a copy
   of it in the bundle. Faint enough to read as texture, not as a second thing
   on the card. */
function Watermark() {
  return (
    <img
      src="/Vector-bottom-right.svg"
      alt=""
      aria-hidden
      style={{
        position: "absolute",
        right: -6,
        bottom: -6,
        width: 122,
        height: 120,
        /* The art is drawn in near white, for a dark surface. Multiplied into
           a pale amber card it turns into a soft warm texture instead of a
           ghost you cannot see. */
        mixBlendMode: "multiply",
        opacity: 0.45,
        filter: "brightness(.94)",
        pointerEvents: "none",
      }}
    />
  );
}
