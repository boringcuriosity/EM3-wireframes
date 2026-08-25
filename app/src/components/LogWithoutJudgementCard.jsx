import React from "react";
import { useWF } from "../state";
import { Info, Utensils, UserRound, Lock } from "lucide-react";
import MacroRings from "./MacroRings";
import {
  GREEN, GREEN_TINT, GREEN_WASH, INDIGO, TEXT, MUTED, BG, BORDER, LINE, RULE, SH,
} from "../tokens";

/* The Eat screen's opening card for a care-program user who has not had their
   diet consultation yet. There is nothing to score and no target to set, so
   the card's whole job is to make logging feel safe and to say what happens
   next. No action of its own: the Snap and Voice prompt sits directly below
   it, so a button here would be the same ask twice.

   No "set up my sufficiency" here on purpose: for a program user the coach
   sets the targets, and the info dot is where they can be looked at or
   changed afterwards. */

const BEATS = [
  {
    Icon: Utensils,
    t: "Log everything you eat",
    b: "Even the papad and the two biscuits with chai. Nothing is judged.",
  },
  {
    Icon: UserRound,
    t: "Your coach reads it",
    b: "They will look at what you ate, speak to you, and craft a diet plan around you.",
  },
];

export default function LogWithoutJudgementCard() {
  const { setPillarInfo, mealsLogged } = useWF();
  /* Two states, one card. Before anything is logged it explains what logging
     is for; once food is in it stops explaining and shows the grams, which are
     real from the first meal even though the score is not. */
  const logged = mealsLogged.length > 0;

  return (
    <div
      style={{
        background: BG,
        border: "1px solid " + BORDER,
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: SH,
      }}
    >
      {/* Kaira sets the tone before the list explains the mechanics */}
      <div
        style={{
          background: GREEN_WASH,
          borderBottom: "1px solid " + GREEN_TINT,
          padding: "13px 15px 13px",
          display: "flex",
          alignItems: "flex-start",
          gap: 11,
        }}
      >
        {/* The same outlined hexagon the logging prompt below uses, so Kaira
            reads as one mark across the screen rather than two. */}
        <svg width="28" height="30" viewBox="0 0 22 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden>
          <path
            d="M11 1.2 20.1 6.6v10.8L11 22.8 1.9 17.4V6.6z"
            stroke={INDIGO}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 16.5,
              fontWeight: 600,
              color: TEXT,
              lineHeight: 1.2,
            }}
          >
            {logged ? "Keep logging." : "Show us what you eat."}
          </div>
          <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.45, marginTop: 4 }}>
            {logged
              ? "The more honest you log, the better your coach can read you. Nothing is judged."
              : "No targets yet, and nothing to get right."}
          </div>
        </div>

        <button
          onClick={() => setPillarInfo("eat")}
          aria-label="What is nutrition sufficiency"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            margin: "-2px -4px 0 0",
            flexShrink: 0,
            display: "flex",
          }}
        >
          <Info size={16} color={GREEN} strokeWidth={2.2} />
        </button>
      </div>

      {logged ? (
        <div style={{ padding: "16px 15px 14px" }}>
          <MacroRings />
        </div>
      ) : (
        <div style={{ padding: "12px 15px 2px", position: "relative" }}>
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 28,
              top: 24,
              bottom: 24,
              width: 1.5,
              borderRadius: 1,
              background: LINE,
            }}
          />
          {BEATS.map((x) => (
            <div key={x.t} style={{ display: "flex", gap: 11, marginBottom: 11 }}>
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: GREEN_TINT,
                  border: "1px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  zIndex: 1,
                  boxShadow: "0 0 0 4px " + BG,
                }}
              >
                <x.Icon size={13} color={GREEN} strokeWidth={2} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: TEXT, lineHeight: 1.35 }}>
                  {x.t}
                </div>
                <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginTop: 2 }}>
                  {x.b}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: "0 15px 16px" }}>
        {/* What logging is building towards, in a line rather than a row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            fontSize: 11,
            color: MUTED,
            lineHeight: 1.4,
          }}
        >
          <Lock size={12} color={RULE} strokeWidth={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Your sufficiency score will unlock once your coach has assigned you a diet plan after
            your first consultation.
          </span>
        </div>

      </div>
    </div>
  );
}
