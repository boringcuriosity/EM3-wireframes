import React from "react";
import { useWF } from "../state";
import { X, Utensils, Flame } from "lucide-react";
import { GREEN, GREEN_DEEP, TEXT, MUTED, BG, BORDER, LINE, PILLAR } from "../tokens";

/* Why there is no plan yet. Opened from the info dot on the waiting strip.

   The honest answer is a sequence, not a fact, so the sheet shows it as one:
   you log, your coach reads it, your plan comes back built around it. Seeing
   where their own logging sits in that chain is what makes the wait feel like
   a step rather than a delay. */

const PLANS = {
  /* Both plans are written by two different people off the same logging, so
     when both are outstanding the sheet says so once rather than making anyone
     open it twice. */
  both: {
    pillar: "eat",
    chips: [
      { pillar: "eat", Icon: Utensils, coach: "nutrition coach" },
      { pillar: "move", Icon: Flame, coach: "exercise coach" },
    ],
    lede: "Log how you normally eat and move",
    ledeAccent: "and both plans get built around it.",
    sub: "Neither coach has written your plan yet. They want to see how you really eat and how your days actually run, before asking you to change any of it.",
    steps: [
      { t: "You log your day", b: "Meals, movement, sleep. On the good days and the bad ones." },
      { t: "You book your consultations", b: "One with each coach. They come to it having already read how your days go." },
      { t: "Your plans come back", b: "Built around your food, your timings and your body, written at those sessions." },
    ],
  },
  eat: {
    pillar: "eat",
    chips: [{ pillar: "eat", Icon: Utensils, coach: "nutrition coach" }],
    lede: "Log how you normally eat",
    ledeAccent: "and your plan gets built around it.",
    sub: "Your nutrition coach has not written your food plan yet. They want to see how you really eat first, not a tidied up version of it.",
    steps: [
      { t: "You log your meals", b: "Everything, on the good days and the bad ones. Even chai and papad." },
      { t: "You book your consultation", b: "Your coach comes to it having already read how you eat and when." },
      { t: "Your plan comes back", b: "Written at that session, around your food, your timings and your home." },
    ],
  },
  move: {
    pillar: "move",
    chips: [{ pillar: "move", Icon: Flame, coach: "exercise coach" }],
    lede: "Log how you already move",
    ledeAccent: "and your plan starts from there.",
    sub: "Your exercise coach has not written your routine yet. They want to see how your days actually run before asking you to change them.",
    steps: [
      { t: "You log your movement", b: "Anything counts. A short walk, the stairs, an hour of housework." },
      { t: "You book your consultation", b: "Your coach comes to it having already read what your days allow." },
      { t: "Your plan comes back", b: "Written at that session, around your days and your body." },
    ],
  },
};

export default function PlanWaitSheet() {
  const { planInfo, setPlanInfo, openBooking } = useWF();
  const p = PLANS[planInfo];
  if (!p) return null;
  const hue = PILLAR[p.pillar];

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
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          maxHeight: "88%",
          display: "flex",
          flexDirection: "column",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: BORDER, margin: "10px auto 0", flexShrink: 0 }} />

        <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px 0", minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
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
            <span style={{ flex: 1 }} />
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
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 21,
              fontWeight: 600,
              color: TEXT,
              lineHeight: 1.3,
            }}
          >
            {p.lede} <span style={{ color: hue.c }}>{p.ledeAccent}</span>
          </h2>
          <p style={{ margin: "10px 0 0", fontSize: 13, color: MUTED, lineHeight: 1.55 }}>{p.sub}</p>

          <div style={{ height: 1, background: LINE, margin: "18px 0 14px" }} />

          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: MUTED,
              marginBottom: 14,
            }}
          >
            How it happens
          </div>

          {/* One rail through all three, so it reads as a sequence rather than
              three separate promises. */}
          <div style={{ position: "relative" }}>
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 12,
                top: 16,
                bottom: 22,
                width: 1.5,
                borderRadius: 1,
                background: LINE,
              }}
            />
            {p.steps.map((x, i) => (
              <div key={x.t} style={{ display: "flex", gap: 12, marginBottom: i < p.steps.length - 1 ? 16 : 0 }}>
                <span
                  style={{
                    width: 25,
                    height: 25,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: hue.t,
                    color: hue.c,
                    fontSize: 11.5,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 1,
                    boxShadow: "0 0 0 4px " + BG,
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1.35 }}>{x.t}</div>
                  <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.5, marginTop: 2 }}>{x.b}</div>
                </div>
              </div>
            ))}
          </div>

          {/* The step everything above waits on, named and bookable. The sheet
              explained the sequence and then left the one thing a person could
              actually do about it off the screen. */}
          <div
            style={{
              marginTop: 18,
              paddingTop: 16,
              borderTop: "1px solid " + LINE,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1.4 }}>
              Step two is the one waiting on you
            </div>
            <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.55, marginTop: 4 }}>
              Your plans are written at that consultation, so booking it is what starts them.
            </div>
            <button
              onClick={openBooking}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                padding: "10px 0 0",
                margin: 0,
                fontSize: 13,
                fontWeight: 700,
                color: GREEN,
                cursor: "pointer",
                fontFamily: "inherit",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              Book your consultation
            </button>
          </div>
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
