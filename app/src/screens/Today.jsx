import React, { useRef, useState } from "react";
import { useWF } from "../state";
import { Calendar } from "lucide-react";
import StreakFlame from "../components/StreakFlame";
import DayPhase from "../components/DayPhase";
import Em3Strip from "../components/Em3Strip";
import WeekStrip from "../components/WeekStrip";
import StreakWonCard from "../components/StreakWonCard";
import PlanStrip from "../components/PlanStrip";
import TrackHero from "../components/TrackHero";
import { GREEN, TEXT, MUTED, BG, BORDER, GOLD, GOLD_TINT, GOLD_LINE, GOLD_DEEP, GREEN_DEEP } from "../tokens";
import CtaArrow from "../components/CtaArrow";
import Em3Explainer from "../components/Em3Explainer";

export default function TrackPage() {
  const { dayRows, dayPhases, dayRowsDone, dayComplete, streakShown, streakState,
          dayFraction, setStreakOpen, flipcoins,
          isPaid, kcalSource, movePlan, planAssigned, setPlanInfo, heroState } = useWF();
  // Which phases the person has opened or closed by hand. Anything they have
  // not touched follows the day: open until it is finished.
  const [openPhase, setOpenPhase] = useState({});
  // The coach card's only action is "the tasks are down there", so it needs
  // somewhere to point at.
  const focusRef = useRef(null);

  return (
    (
      (() => {
        // No-data vs has-data across the whole Today page, driven by dailyState.
        return (
      <div style={{ padding: "14px 22px 28px" }}>
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
          {/* The streak, where the eye already goes at the end of the header */}
          <button
            onClick={() => setStreakOpen("guide")}
            aria-label={"Streak, " + streakShown + " days. See how streaks work"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              border: "1px solid " + (dayComplete ? GOLD_LINE : BORDER),
              background: dayComplete ? GOLD_TINT : BG,
              borderRadius: 999,
              padding: "5px 11px 5px 8px",
              fontSize: 13,
              fontWeight: 700,
              color: dayComplete ? GOLD_DEEP : TEXT,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <StreakFlame size={16} fraction={streakState === "broken" ? 0 : dayFraction} outline={false} />
            {streakShown}
          </button>
        </div>

        <TrackHero
          state={heroState}
          onSeeTasks={() => focusRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        />

        {/* One line, and only while the wait is real. Two strips saying the
            same thing twice is the plan being late twice. */}
        {isPaid && !planAssigned && (
          <PlanStrip
            label={
              kcalSource !== "coach" && !movePlan
                ? "Your diet and exercise plans are yet to be assigned"
                : kcalSource !== "coach"
                ? "Your diet plan is yet to be assigned"
                : "Your exercise plan is yet to be assigned"
            }
            onInfo={() => setPlanInfo(kcalSource !== "coach" ? "eat" : "move")}
          />
        )}

        {/* The day itself. Morning, afternoon, evening, in the order they
            happen, with the pillar riding along as the colour of each circle
            rather than as a heading you have to file things under. */}
        <div
          ref={focusRef}
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            margin: "20px 0 12px",
            scrollMarginTop: 14,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1 }}>
            YOUR DAY
          </span>
          <span style={{ fontSize: 11, color: MUTED }}>
            {dayRowsDone} of {dayRows.length} done
          </span>
        </div>

        {dayComplete && (
          <div style={{ marginBottom: 14 }}>
            <StreakWonCard fullWidth />
          </div>
        )}

        {dayPhases.map((f) => (
          <DayPhase
            key={f.id}
            phase={f}
            open={openPhase[f.id] !== undefined ? openPhase[f.id] : !f.complete}
            onToggle={() =>
              setOpenPhase({
                ...openPhase,
                [f.id]: !(openPhase[f.id] !== undefined ? openPhase[f.id] : !f.complete),
              })
            }
          />
        ))}

        {/* The same rows read as EM3, and the way into each pillar's screen. */}
        <div style={{ marginTop: 20 }}>
          <Em3Strip />
        </div>

        <div style={{ marginTop: 12 }}>
          <WeekStrip />
        </div>
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
