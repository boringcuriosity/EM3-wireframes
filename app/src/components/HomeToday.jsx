import React from "react";
import { useWF } from "../state";
import ScoreBubbles from "./ScoreBubbles";
import KairaSummary from "./KairaSummary";
import DayRow from "./DayRow";
import { DayDoneCard } from "./DayStreakBar";
import StreakFlame from "./StreakFlame";
import { ChevronRight } from "lucide-react";
import { GREEN, GREEN_DEEP, TEXT, MUTED, LINE, BG, BG_SUNK, BORDER, GOLD, SH_SM } from "../tokens";

/* Home's day, read from the top down.

   The order is the argument. Scores first, because they are why any of this is
   worth doing, then Kaira saying which task moves which score, then the tasks
   themselves, then what the day adds up to and the way into the rest of it.
   To-do is adherence and EM3 is motivation, and this is the one place a person
   sees both at once with something joining them.

   All of it in one card, because it is one argument. It ran as four separate
   blocks for a while and read as four unrelated things stacked up. */
export default function HomeToday() {
  const { dayLive, dayRowsDone, dayComplete, streakShown, streakState, setActiveTab, setStreakInfo } = useWF();

  const open = dayLive.filter((r) => !r.done);
  const shown = open.slice(0, 2);
  const day = Math.max(1, streakShown);

  if (dayComplete) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <ScoreBubbles />
        <KairaSummary />
        <DayDoneCard />
      </div>
    );
  }

  return (
    <div
      style={{
        background: BG,
        border: "1px solid " + BORDER,
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: SH_SM,
      }}
    >
      <div style={{ padding: "14px 0 4px" }}>
        <ScoreBubbles />
      </div>

      <div style={{ padding: "0 14px 14px" }}>
        <KairaSummary />
      </div>

      <div style={{ borderTop: "1px solid " + LINE, padding: "0 14px" }}>
        <span
          style={{
            display: "block",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: MUTED,
            padding: "12px 0 1px",
          }}
        >
          Your next task
        </span>
        {/* Two rows, and no line counting the rest. The button at the foot is
            already the way to the whole day, and saying it twice made the
            shortlist look like a truncated list rather than a shortlist. */}
        {shown.map((r, i) => (
          <DayRow key={r.id} row={r} compact last={i === shown.length - 1} />
        ))}
      </div>

      {/* What today is worth, and the way into the rest of it. The streak is
          the reason to finish rather than a threat about breaking: it says how
          many are left and what they buy, in that order. */}
      <div
        style={{
          borderTop: "1px solid " + LINE,
          background: BG_SUNK,
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          onClick={() => setStreakInfo(true)}
          aria-label={
            "Streak, " + day + (day === 1 ? " day. " : " days. ") +
            dayRowsDone + " of " + dayLive.length + " done today"
          }
          style={{
            flex: 1,
            minWidth: 0,
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "left",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <StreakFlame size={13} fraction={streakState === "broken" ? 0 : 1} outline={false} />
            <span style={{ fontSize: 12, fontWeight: 800, color: TEXT }}>
              {day === 1 ? "Day 1" : day + " days"}
            </span>
          </span>
          <span style={{ display: "block", fontSize: 10.5, color: MUTED, marginTop: 1.5, lineHeight: 1.35 }}>
            Finish today to keep it going
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
            <span
              aria-hidden
              style={{ flex: 1, minWidth: 0, height: 5, borderRadius: 3, background: BORDER, overflow: "hidden" }}
            >
              <span
                style={{
                  display: "block",
                  height: "100%",
                  width: (dayLive.length ? (dayRowsDone / dayLive.length) * 100 : 0) + "%",
                  borderRadius: 3,
                  background: GOLD,
                  transition: "width .55s cubic-bezier(.32,.72,0,1)",
                }}
              />
            </span>
            <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 700, color: MUTED, fontVariantNumeric: "tabular-nums" }}>
              {dayRowsDone} of {dayLive.length}
            </span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab("track")}
          style={{
            flexShrink: 0,
            background: GREEN,
            border: "none",
            borderRadius: 13,
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 700,
            fontFamily: "inherit",
            padding: "11px 13px",
            cursor: "pointer",
            boxShadow: "0 2px 0 " + GREEN_DEEP,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          View all tasks
          <ChevronRight size={14} strokeWidth={2.6} style={{ marginRight: -3 }} />
        </button>
      </div>
    </div>
  );
}
