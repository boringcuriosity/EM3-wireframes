import React from "react";
import { useWF } from "../state";
import { X, Utensils, Flame } from "lucide-react";
import LotusIcon from "./LotusIcon";
import { GREEN, GREEN_DEEP, TEXT, MUTED, BG, PILLAR } from "../tokens";

/* Why there is no plan yet. Opened from the info dot on the waiting strip.

   One answer, said once: your coaches curate your full day at your first
   consultation, and here is where to book it. It walked through a numbered
   sequence for a while, with a booking button under it and a second one on the
   card behind. Three tellings of one fact, and the sheet was longer than the
   thing it was explaining. The heading says what waits on what, the paragraph
   says what arrives and where it comes from, and the last line says where to
   go. Nothing else. */

/* Named off the pillars, the same as the handover card and the plan sheet:
   Eat coach, Move coach, Mind coach, writing an Eat plan, a Move plan and a
   Mind plan. The app teaches those four words everywhere else, so a handover
   that switched to diet, exercise and wellbeing asked somebody to learn a
   second vocabulary for the four things they already knew.

   `all` covers any combination of more than one still outstanding. It was
   called `both` while a consultation produced two plans, which quietly became
   wrong the day it produced three.

   `mind` was missing entirely. `PlanCard` opens this sheet with whichever
   single plan is waiting, so a person whose Eat and Move plans had landed and
   whose Mind plan had not tapped the info dot and got a blank screen. */
const PLANS = {
  all: {
    pillar: "eat",
    chips: [
      { pillar: "eat", Icon: Utensils, coach: "Eat coach" },
      { pillar: "move", Icon: Flame, coach: "Move coach" },
      { pillar: "mind", Icon: LotusIcon, coach: "Mind coach" },
    ],
    head: "Your plans start with a consultation",
    body: "Your Eat, Move and Mind coaches will curate a full personalised day for you: tasks that improve your metabolism, built on EM3, the habit building framework. All of it is assigned once your first consultation is done.",
  },
  eat: {
    pillar: "eat",
    chips: [{ pillar: "eat", Icon: Utensils, coach: "Eat coach" }],
    head: "Your Eat plan starts with a consultation",
    body: "Your Eat coach will curate your meals for the day: what to eat and when, built on EM3, the habit building framework. It is assigned once your first consultation is done.",
  },
  move: {
    pillar: "move",
    chips: [{ pillar: "move", Icon: Flame, coach: "Move coach" }],
    head: "Your Move plan starts with a consultation",
    body: "Your Move coach will curate your movement for the day: the session and the small things around it, built on EM3, the habit building framework. It is assigned once your first consultation is done.",
  },
  mind: {
    pillar: "mind",
    chips: [{ pillar: "mind", Icon: LotusIcon, coach: "Mind coach" }],
    head: "Your Mind plan starts with a consultation",
    body: "Your Mind coach will curate your sleep and your worksheets, built on EM3, the habit building framework. It is assigned once your first consultation is done.",
  },
};


export default function PlanWaitSheet() {
  const { planInfo, setPlanInfo } = useWF();
  const p = PLANS[planInfo];
  if (!p) return null;

  return (
    <div
      onClick={() => setPlanInfo(null)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 55,
        background: "rgba(16,24,40,0.46)",
        display: "flex",
        alignItems: "flex-end",
        animation: "scrimIn .24s ease both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="planwait-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: BG,
          borderRadius: "26px 26px 0 0",
          overflow: "hidden",
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          maxHeight: "88%",
          display: "flex",
          flexDirection: "column",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >

        <div style={{ flex: 1, overflowY: "auto", padding: "22px 22px 0", minHeight: 0 }}>
          {/* Wraps, because three coaches at 10px uppercase plus the close
              button come within a few pixels of the frame. The chips take the
              flexible column and the close button keeps its corner. */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexWrap: "wrap", gap: 7 }}>
            {p.chips.map((ch) => (
              <span
                key={ch.coach}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: PILLAR[ch.pillar].t,
                  color: PILLAR[ch.pillar].c,
                  borderRadius: 999,
                  padding: "4px 11px 4px 8px",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}
              >
                <ch.Icon size={12} strokeWidth={2.2} />
                {ch.coach.toUpperCase()}
              </span>
            ))}
            </div>
            <button
              onClick={() => setPlanInfo(null)}
              aria-label="Close"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: -4 }}
            >
              <X size={17} color={MUTED} />
            </button>
          </div>

          <h2
            id="planwait-title"
            style={{
              margin: "13px 0 0",
              fontSize: 21,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: TEXT,
              lineHeight: 1.3,
            }}
          >
            {p.head}
          </h2>
          <p style={{ margin: "10px 0 0", fontSize: 13, color: MUTED, lineHeight: 1.55 }}>{p.body}</p>

          {/* Where booking lives, said in words rather than as a button. The
              consultation has one home now, the first card in Start here on
              this same screen, and a second door to it here would be the same
              ask in two places. */}
          <p style={{ margin: "14px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>
            If you have not booked your consultation yet, you can do it from{" "}
            <span style={{ color: TEXT, fontWeight: 700 }}>Next actions</span>.
          </p>
        </div>

        <div style={{ flexShrink: 0, padding: "18px 22px 26px" }}>
          <button
            onClick={() => setPlanInfo(null)}
            style={{
              width: "100%",
              background: GREEN,
              border: "none",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 2px 0 " + GREEN_DEEP,
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
