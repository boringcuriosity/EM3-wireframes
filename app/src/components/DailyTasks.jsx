import React from "react";
import { useWF } from "../state";
import FtuxExplainer from "./FtuxExplainer";
import TourTarget from "./TourTarget";
import PillarTaskCard from "./PillarTaskCard";
import StreakFlame from "./StreakFlame";
import StreakWonCard from "./StreakWonCard";
import { Check } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, SH } from "../tokens";
import { flame } from "../ui";

export default function DailyTasks() {
  const { dailyState, taskIsDone, streakShown, CARD_W, CARD_GAP, CARD_PAD, program, CARD_TAIL, dailyRepeating, dailyDoneCount, dayFraction, dayComplete, dailyPillars } = useWF();

  return (
    dailyState === "ftux" ? (
        <FtuxExplainer />
      ) : (
      <TourTarget id="focus" style={{ padding: "4px 0 18px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 22px", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>
            Today's focus
          </span>
          {/* The count, with the day's flame filling beside it. Same number,
              two readings: one exact, one you can take in at a glance. */}
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: MUTED }}>
            <StreakFlame size={22} fraction={dayFraction} />
            {dailyDoneCount + " of " + dailyRepeating.length}
          </span>
        </div>

        {dailyState === "done" ? (
          /* Done state — the row collapses to proof + the week streak, no empty carousel */
          <div style={{ padding: "0 22px" }}>
            <div
              style={{
                background: BG,
                border: "1px solid " + GREEN,
                borderRadius: 16,
                padding: "16px 16px",
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
                <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>
                  Today is done. Nice work.
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                  {flame(14, true)}
                  <span>{streakShown} day streak · come back tomorrow</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
              style={{
                display: "flex",
                alignItems: "stretch",
                gap: CARD_GAP,
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                paddingLeft: CARD_PAD,
                paddingRight: CARD_TAIL,
                // Vertical room so the cards' shadows are not cut off by the
                // scroll container, taken back off the layout below.
                paddingTop: 8,
                paddingBottom: 16,
                marginTop: -8,
                marginBottom: -12,
                scrollbarWidth: "none",
              }}
            >
              {dayComplete && <StreakWonCard />}
              {/* Ordering: the three daily habits lead, because they are what
                  today is actually made of. Measure is a one-off setup, so it
                  sits at the end. Done cards sink behind everything. */}
              {[...dailyPillars]
                .sort((a, b) => {
                  const ad = taskIsDone(a) ? 1 : 0;
                  const bd = taskIsDone(b) ? 1 : 0;
                  if (ad !== bd) return ad - bd;
                  const am = a.id === "measure" ? 1 : 0;
                  const bm = b.id === "measure" ? 1 : 0;
                  return am - bm;
                })
                .map((p) => <PillarTaskCard key={p.id} pillar={p} />)}
            </div>
        )}
      </TourTarget>
      )
  );
}
