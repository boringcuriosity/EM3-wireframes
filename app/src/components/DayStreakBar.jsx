import React from "react";
import { useWF } from "../state";
import StreakFlame from "./StreakFlame";
import { ChevronRight } from "lucide-react";
import { TEXT, MUTED, LINE, BG, GOLD, GOLD_TINT, GOLD_LINE, GOLD_DEEP, SH_SM } from "../tokens";

/* The day and the run it belongs to, on one line.

   Home and To-do both need to say this, and they used to say it differently:
   a flame in one header, a gold card at the foot of the other, a count in
   between. One piece now, used in both places, so the same day cannot read
   two ways on two screens. */
export default function DayStreakBar({ edge }) {
  const { dayLive, dayRowsDone, streakShown, streakState, setStreakInfo } = useWF();
  const day = Math.max(1, streakShown);

  return (
    <button
      onClick={() => setStreakInfo(true)}
      aria-label={
        "Streak, " + day + (day === 1 ? " day. " : " days. ") +
        dayRowsDone + " of " + dayLive.length + " done today"
      }
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "none",
        border: "none",
        /* Spelled out, never undefined. Handing React an undefined value here
           clears the shorthand set on the line above and lets the browser's
           own button border back in, which is a 2px black rule. */
        borderBottom: edge === "top" ? "1px solid " + LINE : "none",
        borderTop: edge === "bottom" ? "1px solid " + LINE : "none",
        padding: "11px 14px",
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: "left",
      }}
    >
      <StreakFlame size={13} fraction={streakState === "broken" ? 0 : 1} outline={false} />
      <span style={{ fontSize: 11, fontWeight: 700, color: TEXT, flexShrink: 0 }}>
        {day === 1 ? "Day 1" : day + " days"}
      </span>
      <span
        aria-hidden
        style={{ flex: 1, minWidth: 0, height: 4, borderRadius: 2, background: LINE, overflow: "hidden" }}
      >
        <span
          style={{
            display: "block",
            height: "100%",
            width: (dayLive.length ? (dayRowsDone / dayLive.length) * 100 : 0) + "%",
            borderRadius: 2,
            background: GOLD,
            transition: "width .55s cubic-bezier(.32,.72,0,1)",
          }}
        />
      </span>
      {/* A bare 0 of 14 beside an empty bar reads as a score. Naming what is
          being counted turns it back into a statement about the day. */}
      <span style={{ fontSize: 11, fontWeight: 600, color: MUTED, flexShrink: 0 }}>
        {dayRowsDone === 0
          ? "0 of " + dayLive.length + " tasks done"
          : dayRowsDone + " of " + dayLive.length}
      </span>
    </button>
  );
}

/* The day, finished. The full screen moment has already played by now, so this
   is what it leaves behind: warmth rather than fireworks, and the one thing
   that matters tomorrow. A bar reading 14 of 14 said the same fact with none
   of the feeling. */
export function DayDoneCard() {
  const { dayLive, streakShown, setStreakInfo } = useWF();
  const day = Math.max(1, streakShown);
  void dayLive;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setStreakInfo(true)}
      onKeyDown={(e) => e.key === "Enter" && setStreakInfo(true)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 13,
        background: "linear-gradient(140deg, " + GOLD_TINT + " 0%, #FFFDF7 58%, " + BG + " 100%)",
        border: "1px solid " + GOLD_LINE,
        borderRadius: 18,
        padding: "16px 15px",
        boxShadow: SH_SM,
        cursor: "pointer",
        width: "100%",
        fontFamily: "inherit",
        textAlign: "left",
        animation: "popIn .5s cubic-bezier(.32,.72,0,1) both",
      }}
    >
      <span style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: -7,
            borderRadius: "50%",
            background: "radial-gradient(circle, " + GOLD + "42 0%, " + GOLD + "00 70%)",
            animation: "glowBreathe 3.2s ease-in-out infinite",
          }}
        />
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: BG,
            border: "1px solid " + GOLD_LINE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StreakFlame size={21} fraction={1} outline={false} />
        </span>
      </span>

      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>
          We are proud of you
        </span>
        <span style={{ display: "block", fontSize: 11.5, color: GOLD_DEEP, marginTop: 4, lineHeight: 1.45 }}>
          Everything on today's list is done. Come back tomorrow to keep{" "}
          {day === 1 ? "your streak going" : "your " + day + " day streak going"}.
        </span>
      </span>

      <ChevronRight size={17} color={GOLD_DEEP} style={{ flexShrink: 0, marginTop: 3 }} />
    </div>
  );
}
