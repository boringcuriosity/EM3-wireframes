import React, { useEffect } from "react";
import { useWF } from "../state";
import { X, ChevronRight, Utensils, Flame, BarChart3 } from "lucide-react";
import LotusIcon from "./LotusIcon";
import { GREEN, GREEN_DEEP, TEXT, MUTED, FAINT, BG, BORDER, LINE, PILLAR } from "../tokens";

/* The week, in one place, once a week.

   Each pillar keeps its own Trend tab and its own charts. This is the way in:
   Kaira's one line per pillar, and a door to the detail behind each. Without
   it the weekly read lives three taps deep inside three different screens and
   nobody meets it.

   Opening it is what marks the task done. Nobody reads their week and then
   also ticks a box to say so. */

const PILLARS = [
  {
    id: "eat",
    Icon: Utensils,
    label: "Eat",
    line: "Your calories held steady all week. Protein is the one thing still holding your sufficiency back.",
    tab: "trend",
  },
  {
    id: "move",
    Icon: Flame,
    label: "Move",
    line: "Four days out of seven, with the three quiet ones sitting together in the middle of the week.",
    tab: "trend",
  },
  {
    id: "mind",
    Icon: LotusIcon,
    label: "Mind",
    line: "Long enough nights, but they started anywhere between half past nine and half past twelve.",
    tab: "trend",
  },
];

export default function WeekReadSheet() {
  const { setWeekOpen, weekInsight, setWeekInsight, flipcoins, setFlipcoins, setToast, openWeek } = useWF();

  /* Reading it is doing it. The day's own toast picks this up and says which
     task closed, exactly as it does for a meal logged inside Eat. */
  useEffect(() => {
    if (weekInsight === "read") return;
    setWeekInsight("read");
    setFlipcoins(flipcoins + 5);
    setToast({ title: "+5 Flipcoins earned", line: "Read your week with Kaira", coins: 5 });
  }, [weekInsight, setWeekInsight, flipcoins, setFlipcoins, setToast]);

  // One opener, shared with the day's own rows, so a week reached from here
  // and a week reached from the list land on exactly the same page.
  const open = openWeek;

  return (
    <div
      onClick={() => setWeekOpen(false)}
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
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: BG,
          borderRadius: "26px 26px 0 0",
          overflow: "hidden",
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          maxHeight: "88%",
          display: "flex",
          flexDirection: "column",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >

        <div style={{ flex: 1, overflowY: "auto", padding: "22px 22px 0", minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span
              style={{
                width: 26,
                height: 28,
                background: "linear-gradient(150deg, " + GREEN + " 0%, " + GREEN_DEEP + " 100%)",
                clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 13,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              K
            </span>
            <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 0.5 }}>
              YOUR WEEK, READ BY KAIRA
            </span>
            <button
              onClick={() => setWeekOpen(false)}
              aria-label="Close"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: -4, display: "flex" }}
            >
              <X size={17} color={MUTED} />
            </button>
          </div>

          <h2
            style={{
              margin: "13px 0 0",
              fontSize: 21,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: TEXT,
              lineHeight: 1.25,
            }}
          >
            Seven days, and one thing worth changing.
          </h2>
          <p style={{ margin: "8px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>
            Your movement is the gap this week. Your food and your nights are close to where they
            should be, so that is the one to spend next week on.
          </p>

          <div style={{ marginTop: 16 }}>
            {PILLARS.map((p) => {
              const hue = PILLAR[p.id];
              return (
                <button
                  key={p.id}
                  onClick={() => open(p.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    background: BG,
                    border: "1px solid " + BORDER,
                    borderRadius: 16,
                    padding: "13px 14px",
                    marginBottom: 10,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: hue.t,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <p.Icon size={15} color={hue.c} strokeWidth={2} />
                  </span>

                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: TEXT }}>
                      {p.label}
                    </span>
                    <span style={{ display: "block", fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginTop: 3 }}>
                      {p.line}
                    </span>
                  </span>

                  <ChevronRight size={16} color={FAINT} style={{ flexShrink: 0, marginTop: 6 }} />
                </button>
              );
            })}
          </div>

          {/* Measure keeps its own numbers, so it points at the tab rather than
              pretending to summarise a blood test in one line. */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              borderTop: "1px solid " + LINE,
              paddingTop: 14,
              marginTop: 4,
              fontSize: 11.5,
              color: MUTED,
              lineHeight: 1.5,
            }}
          >
            <BarChart3 size={14} color={PILLAR.measure.c} strokeWidth={2} style={{ flexShrink: 0 }} />
            Your readings and score live in Measure, and your coach reads them alongside this.
          </div>
        </div>

        <div style={{ flexShrink: 0, padding: "12px 22px 22px" }}>
          <button
            onClick={() => setWeekOpen(false)}
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
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
