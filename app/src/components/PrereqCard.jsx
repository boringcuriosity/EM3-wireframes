import React from "react";
import { useWF } from "../state";
import { BarChart3, FlaskConical, MessagesSquare } from "lucide-react";
import CtaArrow from "./CtaArrow";
import { coachAvatar } from "../ui";
import {
  GREEN, TEXT, MUTED, WARN, WARN_TINT, WARN_LINE, SH_SM,
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
  /* First, because it is the only one of the four that anybody else is waiting
     on. The other three make the consultation better and none of them gates
     it, so a slot gets booked while the preparation happens around it. */
  /* One per coach, because a consultation is with a person and three of them
     get booked in one sitting. They sit at the end of the rail: the three
     above are what a coach reads on the way in, and these are the hour that
     turns all of it into a plan. */
  "book:eat": { book: "eat" },
  "book:move": { book: "move" },
  "book:mind": { book: "mind" },
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

/* The plan each consultation produces, named the way the handover names it. */
const PLAN_OF = { eat: "Eat plan", move: "Move plan", mind: "Mind plan" };

export default function PrereqCard({ id, width, minHeight }) {
  const { setActiveTab, nextDone, setNextDone, setScoreFlow, setScoreStep, openBooking, careTeam } = useWF();
  const x = PREREQS[id];
  if (!x) return null;
  // The coach cards are their own shape: a person rather than a task.
  const who = x.book ? careTeam.find((m) => m.pillar === x.book) : null;

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
    /* Booking marks itself off the booking, never off the tap. `bookings`
       already records the slot, so a tick of our own would be the same fact
       kept twice and the two would part company the moment a slot moved. */
    if (x.book) return openBooking(who ? who.id : null);
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
      {who ? (
        <>
          {/* The ask first, in the same amber the rail uses, so it reads as
              one of the blocking jobs rather than as an offer. */}
          <div style={{ position: "relative", fontSize: 14.5, fontWeight: 700, color: WARN, lineHeight: 1.3 }}>
            Book your first consultation
          </div>

          {/* Then the person, because that is what a consultation is with.
              Name over role, since the program is people rather than a
              directory. */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, margin: "11px 0 10px" }}>
            {coachAvatar(38)}
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 11, color: MUTED, lineHeight: 1.3 }}>{who.coach}</span>
              <span style={{ display: "block", fontSize: 14, fontWeight: 800, color: TEXT, letterSpacing: -0.2, lineHeight: 1.3 }}>
                {who.name}
              </span>
            </span>
          </div>

          {/* Why it blocks, said once. */}
          <div style={{ position: "relative", flex: 1, fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginBottom: 13 }}>
            Your {PLAN_OF[x.book]} is assigned only after your first consultation.
          </div>
        </>
      ) : (
        <>
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
        </>
      )}
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
        {who ? "Book a time" : x.cta}
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
