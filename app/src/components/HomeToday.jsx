import React from "react";
import { useWF } from "../state";
import ScoreBubbles from "./ScoreBubbles";
import KairaSummary from "./KairaSummary";
import { DayDoneCard } from "./DayStreakBar";
import StreakFlame from "./StreakFlame";
import { ChevronRight } from "lucide-react";
import { GREEN, TEXT, MUTED, LINE, BG, BG_SUNK, BORDER, GOLD, SH_SM } from "../tokens";

/* Home's day, read from the top down.

   The order is the argument. The bubbles first, because they are why any of
   this is worth doing and because the big one is already the day's next task
   asked as a question. Then Kaira, saying why that pillar is worth a minute.
   Then what the day adds up to and the way into the rest of it.

   NO TASK LIST HERE ANY MORE. There used to be two rows under a "Your next
   task" heading, and the top one was the row the big bubble was already asking
   about: one task, named twice, with two ways to tap it. Wording around it
   never fixed anything, because the cause was that Home was doing To-do's job
   as well as its own. To-do is adherence and it owns the list. EM3 is
   motivation and it owns this card. The foot of the card is the door between
   them.

   What went with the list: ticking a row without opening it, the preview of
   the task after next, and tips, which never counted towards a bubble anyway.

   All of it in one card, because it is one argument. It ran as four separate
   blocks for a while and read as four unrelated things stacked up. */
export default function HomeToday() {
  const { dayLive, dayRowsDone, dayComplete, streakShown, streakState, setActiveTab, setStreakInfo } = useWF();

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

      {/* What today is worth, and the way into the rest of it. The streak is
          the reason to finish rather than a threat about breaking, and it says
          it in the flame, the count of days and the bar rather than in a
          sentence. */}
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
          {/* No line of encouragement under the day. The flame, the number of
              days, the bar and the count already say where the day stands and
              that finishing it matters, and a sentence repeating that in words
              is the only thing on this card not carrying its own weight. */}
          <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
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

        {/* Secondary, because it is a way out rather than the thing to do. The
            work is up in the bubbles; this is the door to the list for
            somebody who wants the whole day. A filled button here competed
            with the big one for the only tap the card is asking for. */}
        <button
          onClick={() => setActiveTab("track")}
          style={{
            flexShrink: 0,
            background: BG,
            border: "1px solid " + GREEN,
            borderRadius: 13,
            color: GREEN,
            fontSize: 12.5,
            fontWeight: 700,
            fontFamily: "inherit",
            padding: "10px 12px",
            cursor: "pointer",
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
