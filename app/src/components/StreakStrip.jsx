import React from "react";
import { useWF } from "../state";
import { ChevronRight } from "lucide-react";
import StreakFlame from "./StreakFlame";
import { TEXT, MUTED, BG, BORDER, GOLD_DEEP, SH_SM } from "../tokens";

/* The streak, read straight off today's tasks. The flame is the day's own
   progress, so the strip and the task row can never disagree. Every state taps
   through to the same place, because there is only one rule to explain. */
export default function StreakStrip() {
  const {
    streakShown,
    streakState,
    dailyDoneCount,
    dailyRepeating,
    dayFraction,
    dayComplete,
    setStreakOpen,
  } = useWF();

  const broken = streakState === "broken";
  const total = dailyRepeating.length;

  const lead = broken
    ? "Streak ended"
    : streakShown > 0
    ? streakShown + " day streak"
    : "Start your streak";

  const tail = broken
    ? "Clear today to start again"
    : dayComplete
    ? "Today is in"
    : dailyDoneCount + " of " + total + " today";

  return (
    <div style={{ padding: "10px 22px 0" }}>
      <button
        onClick={() => setStreakOpen("guide")}
        aria-label={lead + ", " + tail + ". See how streaks work"}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: BG,
          border: "1px solid " + BORDER,
          borderRadius: 12,
          padding: "9px 12px",
          cursor: "pointer",
          boxShadow: SH_SM,
          fontFamily: "inherit",
        }}
      >
        <StreakFlame size={20} fraction={broken ? 0 : dayFraction} />

        <span style={{ fontSize: 12.5, fontWeight: 700, color: broken ? MUTED : TEXT }}>
          {lead}
        </span>

        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 5,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 11.5, color: dayComplete ? GOLD_DEEP : MUTED, fontWeight: dayComplete ? 700 : 500 }}>
            {tail}
          </span>
          <ChevronRight size={15} color={MUTED} />
        </span>
      </button>
    </div>
  );
}
