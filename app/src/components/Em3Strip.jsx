import React from "react";
import { useWF } from "../state";
import StreakFlame from "./StreakFlame";
import { ChevronRight } from "lucide-react";
import { Utensils, Flame, BarChart3 } from "lucide-react";
import LotusIcon from "./LotusIcon";
import { PILLAR, TEXT, MUTED, LINE, BG, BORDER, GOLD, GOLD_TINT, GOLD_LINE, GOLD_DEEP, SH_SM } from "../tokens";

const META = {
  eat: { label: "Eat", Icon: Utensils },
  move: { label: "Move", Icon: Flame },
  mind: { label: "Mind", Icon: LotusIcon },
  measure: { label: "Measure", Icon: BarChart3 },
};

/* The day, read the other way round, and what filling all four earns.

   These used to be two blocks: four rings at the foot of the list and a gold
   streak card at its head, both appearing the moment the last row went in and
   both saying the same thing. They are one thing. Clearing the four is what a
   streak day is, so the streak is the crown on the rings rather than a card of
   its own.

   The list above is chronological, which is how a day is lived. This is the
   same rows grouped by pillar, which is how metabolism works. Both numbers
   come from one array, so the two readings can never fall out of step, and
   nobody has to be told that a normal day already contains all four. It is
   also the guaranteed way into each pillar's own screen. */
export default function Em3Strip({ head = true, top, bottom }) {
  const { dayRows, dayLive, dayRowsDone, dayComplete, streakShown, streakState, setStreakInfo,
          setEatDetail, setMoveDetail, setMindDetail, setActiveTab } = useWF();

  const go = {
    eat: () => setEatDetail(true),
    move: () => setMoveDetail(true),
    mind: () => setMindDetail(true),
    measure: () => setActiveTab("med"),
  };

  /* Skipped rows leave the count here for the same reason they leave the phase
     header and the day's total: the person said no to that one, and a pillar
     should not read as unfinished because of a choice they told us about.
     A pillar whose every row is skipped still shows, because losing one of the
     four would be a stranger thing to see than a pillar with nothing due. */
  const groups = ["eat", "move", "mind", "measure"]
    .map((id) => {
      const live = dayLive.filter((r) => r.pillar === id);
      return {
        id,
        ...META[id],
        present: dayRows.some((r) => r.pillar === id),
        total: live.length,
        done: live.filter((r) => r.done).length,
      };
    })
    .filter((g) => g.present);

  const day = Math.max(1, streakShown);

  return (
    <div
      style={{
        background: dayComplete
          ? "linear-gradient(140deg, " + GOLD_TINT + " 0%, #FFFDF7 55%, " + BG + " 100%)"
          : BG,
        border: "1px solid " + (dayComplete ? GOLD_LINE : BORDER),
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: SH_SM,
        transition: "background .5s ease, border-color .5s ease",
      }}
    >
      {/* One head, two states. While the day runs it carries the streak on the
          left and the day on the right, with a single bar underneath. Once all
          four are in it becomes the crown.

          Everything about today is said here and nowhere else. The counts used
          to appear five times on one card: a flame, a total, a phase, and four
          pillar fractions, all the same day in different denominators. */}
      {top}

      {head && !dayComplete && (
        <button
          onClick={() => setStreakInfo(true)}
          aria-label={
            "Streak, " + day + (day === 1 ? " day. " : " days. ") +
            dayRowsDone + " of " + dayLive.length + " done today"
          }
          style={{
            width: "100%",
            display: "block",
            background: "none",
            border: "none",
            borderBottom: "1px solid " + LINE,
            padding: "12px 14px 13px",
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "left",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <StreakFlame size={15} fraction={streakState === "broken" ? 0 : 1} outline={false} />
            <span style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 700, color: TEXT }}>
              {streakState === "broken" || day < 1
                ? "Start a streak today"
                : day === 1
                ? "Day 1 of your streak"
                : day + " days in a row"}
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: MUTED, flexShrink: 0 }}>
              {dayRowsDone} of {dayLive.length}
            </span>
          </span>

          {/* The day as one line rather than four fractions. */}
          <span
            aria-hidden
            style={{
              display: "block",
              height: 5,
              borderRadius: 3,
              background: LINE,
              marginTop: 9,
              overflow: "hidden",
            }}
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
        </button>
      )}

      {head && dayComplete && (
        <button
          onClick={() => setStreakInfo(true)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 11,
            background: "none",
            border: "none",
            borderBottom: "1px solid " + GOLD_LINE,
            padding: "13px 14px",
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "left",
            animation: "popIn .5s cubic-bezier(.32,.72,0,1) both",
          }}
        >
          <span style={{ position: "relative", width: 34, height: 34, flexShrink: 0 }}>
            <span
              aria-hidden
              style={{
                position: "absolute",
                inset: -5,
                borderRadius: "50%",
                background: "radial-gradient(circle, " + GOLD + "3D 0%, " + GOLD + "00 70%)",
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
              <StreakFlame size={18} fraction={1} outline={false} />
            </span>
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: TEXT }}>
              {day === 1 ? "Day 1 of your streak" : day + " days in a row"}
            </span>
            <span style={{ display: "block", fontSize: 10.5, color: GOLD_DEEP, marginTop: 3, lineHeight: 1.4 }}>
              All four in. Come back tomorrow to keep it alive.
            </span>
          </span>
          <ChevronRight size={16} color={GOLD_DEEP} style={{ flexShrink: 0 }} />
        </button>
      )}

      <div style={{ display: "flex" }}>
      {groups.map((g, i) => {
        const c = PILLAR[g.id].c;
        const pct = g.total ? g.done / g.total : 0;
        return (
          <button
            key={g.id}
            onClick={go[g.id]}
            aria-label={
              g.total === 0
                ? g.label + ", nothing due today. Open " + g.label
                : g.done === g.total
                ? g.label + ", all done. Open " + g.label
                : g.label + ", " + g.done + " of " + g.total + " done. Open " + g.label
            }
            style={{
              flex: 1,
              minWidth: 0,
              background: "none",
              border: "none",
              borderLeft: i === 0 ? "none" : "1px solid " + LINE,
              padding: "13px 4px 12px",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ position: "relative", width: 34, height: 34, flexShrink: 0 }}>
              <svg width="34" height="34" viewBox="0 0 34 34" style={{ position: "absolute", inset: 0 }}>
                <circle cx="17" cy="17" r="15" fill={PILLAR[g.id].t} stroke="none" />
                <circle
                  cx="17" cy="17" r="15" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 15}
                  strokeDashoffset={2 * Math.PI * 15 * (1 - pct)}
                  transform="rotate(-90 17 17)"
                  style={{ transition: "stroke-dashoffset .6s cubic-bezier(.32,.72,0,1)" }}
                />
              </svg>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <g.Icon size={14} color={c} strokeWidth={2} />
              </span>
            </span>
            {/* Name only. The ring is the number: how far round it has gone
                says more at a glance than "2 of 9" ever did, and the bar above
                already owns the day's arithmetic. */}
            <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{g.label}</span>
          </button>
        );
      })}
      </div>

      {bottom}
    </div>
  );
}
