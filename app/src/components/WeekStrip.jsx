import React from "react";
import { useWF } from "../state";
import { ChevronRight } from "lucide-react";
import { GREEN, TEXT, MUTED, FAINT, BG, BORDER, LINE, SH_SM } from "../tokens";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

/* The only trend the To-do screen owes anyone: which days you closed.

   Nutrition, steps and sleep all have real charts inside their own pillars.
   What this screen is for is the habit, so the trend here is seven marks and
   a way through to the rule behind them. */
export default function WeekStrip() {
  const { streakShown, dayComplete, setStreakOpen } = useWF();

  // Today is the last mark. The days before it are closed as far back as the
  // streak reaches, so the strip and the number always tell the same story.
  const cells = DAYS.map((d, i) => {
    const back = DAYS.length - 1 - i;
    return { d, today: back === 0, done: back === 0 ? dayComplete : back <= streakShown - (dayComplete ? 1 : 0) };
  });

  return (
    <button
      onClick={() => setStreakOpen("guide")}
      aria-label={"This week, " + streakShown + " day streak. See how streaks work"}
      style={{
        width: "100%",
        background: BG,
        border: "1px solid " + BORDER,
        borderRadius: 18,
        padding: "14px 16px 15px",
        cursor: "pointer",
        fontFamily: "inherit",
        boxShadow: SH_SM,
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, color: TEXT }}>
          This week
        </span>
        <span style={{ fontSize: 11.5, color: MUTED }}>
          {streakShown > 0 ? streakShown + " days in a row" : "No days closed yet"}
        </span>
        <ChevronRight size={15} color={MUTED} style={{ marginLeft: 3 }} />
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        {cells.map((c, i) => (
          <span key={i} style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
            <span
              style={{
                display: "block",
                height: 30,
                borderRadius: 9,
                background: c.done ? GREEN : c.today ? BG : LINE,
                border: c.today && !c.done ? "1.5px dashed " + BORDER : "1.5px solid " + (c.done ? GREEN : LINE),
                boxSizing: "border-box",
              }}
            />
            <span
              style={{
                display: "block",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                fontWeight: 600,
                color: c.today ? TEXT : FAINT,
                marginTop: 5,
              }}
            >
              {c.d}
            </span>
          </span>
        ))}
      </div>
    </button>
  );
}
