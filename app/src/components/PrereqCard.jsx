import React from "react";
import { useWF } from "../state";
import { BarChart3, FlaskConical, MessagesSquare } from "lucide-react";
import CtaArrow from "./CtaArrow";
import {
  GREEN, MUTED, WARN, WARN_TINT, WARN_LINE, SH_SM,
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
  /* The part a lab test cannot answer. Kaira asks it as a conversation
     because a person will tell a chat what they skip and why, and will not
     tell a form. */
  assess: {
    Icon: MessagesSquare,
    title: "Take your pre-consultation assessment",
    line: "Kaira learns how you eat, move and rest, so your coaches know you before they meet you.",
    cta: "Start the chat",
    tab: "care",
  },
};

export default function PrereqCard({ id, width, minHeight }) {
  const { setActiveTab, nextDone, setNextDone, setScoreFlow, setScoreStep } = useWF();
  const x = PREREQS[id];
  if (!x) return null;

  /* Tapping through is what finishes the two that hand off to another screen:
     nobody books a lab test and then also ticks a box to say so.

     The score is not one of those. It runs a walkthrough of its own now, so
     marking it done on the tap would finish it before it started; Result marks
     it when the score actually exists. */
  const go = () => {
    if (id === "score") {
      setScoreStep(0);
      setScoreFlow("intro");
      return;
    }
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
        /* The same pill the session cards use. These sit in the same Home rail
           as Book a session and View session, so a second button shape one
           card along read as two kinds of action rather than one.

           Flex, so the label and the arrow centre on each other rather than on
           a line box the arrow's descent has stretched. */
        style={{
          position: "relative",
          alignSelf: "flex-start",
          display: "inline-flex",
          alignItems: "center",
          background: GREEN,
          border: "none",
          borderRadius: 999,
          padding: "6px 13px",
          color: "#fff",
          fontSize: 11.5,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {x.cta}
        <CtaArrow />
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
        opacity: 0.28,
        filter: "brightness(.94)",
        pointerEvents: "none",
      }}
    />
  );
}
