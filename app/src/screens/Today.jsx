import React, { useRef, useState } from "react";
import { useWF } from "../state";
import { Calendar } from "lucide-react";
import DayPhase from "../components/DayPhase";
import DayStreakBar, { DayDoneCard } from "../components/DayStreakBar";
import PlanCard from "../components/PlanCard";
import PrereqRail from "../components/PrereqRail";
import TrackHero from "../components/TrackHero";
import { GREEN, TEXT, MUTED, BG, BORDER, GOLD, GOLD_TINT, GOLD_LINE, GOLD_DEEP, GREEN_DEEP, SH_SM } from "../tokens";
import CtaArrow from "../components/CtaArrow";
import Em3Explainer from "../components/Em3Explainer";

export default function TrackPage() {
  const { dayPhases, dayComplete, flipcoins, heroState } = useWF();
  // Which phases the person has opened or closed by hand. Anything they have
  // not touched follows the day: open until it is finished.
  const [openPhase, setOpenPhase] = useState({});
  /* The part of the day you are in: the earliest one still with something in
     it. Once they are all cleared none is active, so the whole list folds and
     the streak card is what is left. */
  const activePhase = (dayPhases.find((f) => !f.complete) || {}).id;
  // The plans still to come, in EM3 order. Empty once both have landed.
  // The coach card's only action is "the tasks are down there", so it needs
  // somewhere to point at.
  const focusRef = useRef(null);

  return (
    (
      (() => {
        // No-data vs has-data across the whole Today page, driven by dailyState.
        return (
      /* The last 92px are room for Kaira, who floats over the bottom right
         corner and was sitting on the Measure ring. */
      <div style={{ padding: "14px 22px 92px" }}>
        {/* Top row: Flipcoins on the left, the day on the right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: GOLD_DEEP,
              border: "1px solid " + GOLD_LINE,
              borderRadius: 999,
              padding: "5px 12px",
              background: GOLD_TINT,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                background: GOLD,
                clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                display: "inline-block",
              }}
            />
            {flipcoins}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 13,
              fontWeight: 600,
              color: TEXT,
              border: "1px solid " + BORDER,
              borderRadius: 999,
              padding: "5px 14px",
              background: BG,
            }}
          >
            <span style={{ cursor: "pointer" }}>‹</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Calendar size={14} color={TEXT} strokeWidth={2} />
              Today
            </span>
            <span style={{ color: BORDER }}>›</span>
          </div>
        </div>

        {/* Before a plan exists the top of the screen has one job: get the
            prerequisites done. A summary of a day nobody has planned is not
            one, so the hero waits until there is a plan to summarise. */}
        {heroState === "noplan" ? (
          <PrereqRail />
        ) : (
          <TrackHero
            state={heroState}
            onSeeTasks={() => focusRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          />
        )}

        {/* The day itself. Morning, afternoon, evening, in the order they
            happen, with the pillar riding along as the colour of each circle
            rather than as a heading you have to file things under. */}
        <div
          ref={focusRef}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            margin: "20px 0 12px",
            scrollMarginTop: 14,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1 }}>
            TODAY'S FOCUS
          </span>
        </div>

        {/* Why the list below has no plan behind it, sitting on top of the
            list it is talking about. */}
        {/* One card for the whole handover: waiting, one plan in, then both.
            Same slot, same shape, so nothing jumps when a plan lands. */}
        <PlanCard />

        {/* The day and the run it belongs to, above the list rather than under
            it. It is the thing the list is adding up to, so it reads better as
            the heading of the list than as a summary at the bottom of a screen
            most people never scroll to. */}
        <div style={{ marginBottom: 12 }}>
          {dayComplete ? (
            <DayDoneCard />
          ) : (
            <div style={{ background: BG, border: "1px solid " + BORDER, borderRadius: 14, boxShadow: SH_SM }}>
              <DayStreakBar />
            </div>
          )}
        </div>

        {/* One part of the day open at a time: the earliest one still with
            something in it. Clearing the morning opens the afternoon by
            itself, so the list stays the length of what is in front of you
            rather than the length of the whole day. */}
        {dayPhases.map((f) => {
          const open = openPhase[f.id] !== undefined ? openPhase[f.id] : f.id === activePhase;
          return (
            <DayPhase
              key={f.id}
              phase={f}
              open={open}
              onToggle={() => setOpenPhase({ ...openPhase, [f.id]: !open })}
            />
          );
        })}

      </div>
        );
      })()
    )
  );
}

export function TodayFtux() {
  const { onbFinish } = useWF();

  /* First run on the To-do tab. Same explainer as the onboarding takeover,
     because a user who reaches EM3 from here should be told the same thing in
     the same way as one who reached it from Home. */
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px 0", minHeight: 0 }}>
        <Em3Explainer />
      </div>
      <div style={{ flexShrink: 0, padding: "12px 22px", borderTop: "1px solid " + BORDER, background: BG }}>
        <button
          onClick={onbFinish}
          style={{
            width: "100%",
            background: GREEN,
            border: "none",
            borderRadius: 14,
            padding: "15px 0",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 2px 0 " + GREEN_DEEP,
          }}
        >
          Take me to my day
          <CtaArrow size={16} />
        </button>
      </div>
    </div>
  );
}
