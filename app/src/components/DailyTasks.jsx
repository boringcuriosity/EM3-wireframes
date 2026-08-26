import React from "react";
import { useWF } from "../state";
import FtuxExplainer from "./FtuxExplainer";
import TourTarget from "./TourTarget";
import DayRow from "./DayRow";
import Em3Strip from "./Em3Strip";
import StreakFlame from "./StreakFlame";
import { Check, ChevronRight } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BORDER, SH } from "../tokens";
import { flame } from "../ui";

/* Home's job is the next thing, not the whole list.

   It used to carry the same four pillar cards the To-do screen carried, which
   made one of the two screens redundant. Now To-do is the day written out and
   this is the top of it: whatever is open in the part of the day you are in,
   and the four pillars as a way straight into any of them. */
export default function DailyTasks() {
  const { dailyState, dayPhases, dayLive, dayRowsDone, dayComplete, streakShown, setActiveTab } = useWF();

  if (dailyState === "ftux") return <FtuxExplainer />;

  // The first phase with anything left in it. Once they are all clear the
  // card below takes over, so there is never an empty heading.
  const phase = dayPhases.find((f) => !f.complete);
  const next = phase ? phase.rows.filter((r) => !r.done && !r.skipped).slice(0, 3) : [];
  const rest = phase ? phase.rows.filter((r) => !r.done && !r.skipped).length - next.length : 0;

  return (
    <TourTarget id="focus" style={{ padding: "4px 0 18px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          padding: "0 22px",
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Today's focus</span>
        <button
          onClick={() => setActiveTab("track")}
          aria-label="See your whole day"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: MUTED,
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <StreakFlame size={22} fraction={dayLive.length ? dayRowsDone / dayLive.length : 0} />
          {dayRowsDone + " of " + dayLive.length}
          <ChevronRight size={15} color={MUTED} style={{ marginLeft: -1 }} />
        </button>
      </div>

      <div style={{ padding: "0 22px" }}>
        {dayComplete || !phase ? (
          <div
            style={{
              background: BG,
              border: "1px solid " + GREEN,
              borderRadius: 16,
              padding: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: SH,
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: GREEN,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Check size={19} color="#fff" strokeWidth={3} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>Today is done. Nice work.</div>
              <div
                style={{
                  fontSize: 11,
                  color: MUTED,
                  marginTop: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                {flame(14, true)}
                <span>{streakShown} day streak · come back tomorrow</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 18,
              padding: "3px 16px 4px",
              boxShadow: SH,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                padding: "11px 0 2px",
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: MUTED,
                }}
              >
                This {phase.label.toLowerCase()}
              </span>
              <span style={{ fontSize: 11, color: MUTED }}>
                {phase.done} of {phase.total}
              </span>
            </div>

            {next.map((r, i) => (
              <DayRow key={r.id} row={r} compact last={i === next.length - 1 && rest === 0} />
            ))}

            {rest > 0 && (
              <button
                onClick={() => setActiveTab("track")}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "10px 0 11px",
                  fontSize: 11.5,
                  color: MUTED,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                {rest} more this {phase.label.toLowerCase()}
              </button>
            )}
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <Em3Strip />
        </div>
      </div>
    </TourTarget>
  );
}
