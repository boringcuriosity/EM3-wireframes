import React from "react";
import { useWF } from "../state";
import { byId, fmtTime, qtyLabel } from "../screens/log/foods";
import { dayMinutes } from "../screens/move/exercises";
import { ChevronRight, Check } from "lucide-react";
import { GREEN, TEXT, MUTED, RULE, BG, BORDER, BG_SUNK, LINE, PILLAR, GOLD, GOLD_TINT, GOLD_LINE, GOLD_DEEP, SH } from "../tokens";

const PILLAR_NAME = { eat: "Eat", move: "Move", mind: "Mind", measure: "Measure" };

/* One pillar task, rendered identically on Home's carousel and in the To-do
   stack. Home passes a fixed width, To-do passes fullWidth. Keeping this in one
   place is what keeps the two surfaces honest with each other. */
export default function PillarTaskCard({ pillar: p, fullWidth, onClick }) {
  const { CARD_W, taskFill, taskIsDone, completeTask, mealsLogged, exLogs, daySteps, sleepMins } = useWF();

  const filled = taskFill(p);
  const isDone = taskIsDone(p);
  // Each pillar carries its own hue, kept to the icon chip and the progress
  // pips so the card stays a white card with an accent, not a coloured card.
  const pid = p.pillar || p.id;
  const hue = PILLAR[pid] || PILLAR.eat;

  /* Eat, once there is food in the day, ends on the last thing logged. It
     answers the question the card raises, "where am I up to", without a second
     card underneath repeating the pips. Only in the To-do stack: the Home
     carousel stretches every card to the tallest, so one taller card would
     pad the other three. */
  const last = fullWidth && p.id === "eat" ? mealsLogged[mealsLogged.length - 1] : null;

  /* Move and Mind end on their own numbers instead of a card underneath. Both
     wait until the pillar has been started: steps or sleep on their own would
     read as a contradiction beside a zero for the thing being asked for. */
  const stats = !fullWidth
    ? null
    : p.id === "move" && exLogs.length > 0
    ? [
        { v: daySteps === null ? "\u2014" : daySteps.toLocaleString(), l: "Steps" },
        { v: dayMinutes(exLogs) + "m", l: "Active" },
        { v: String(exLogs.length), l: "Workouts" },
      ]
    : p.id === "mind" && filled > 0
    ? [
        { v: sleepMins === null ? "\u2014" : Math.floor(sleepMins / 60) + "h " + (sleepMins % 60) + "m", l: "Slept" },
        { v: filled + (filled === 1 ? " break" : " breaks"), l: "Breathing" },
      ]
    : null;
  return (
    <div
      onClick={onClick || (() => completeTask(p))}
      style={{
        width: fullWidth ? "100%" : CARD_W,
        flexShrink: 0,
        scrollSnapAlign: "center",
        background: BG,
        border: "1px solid " + (isDone ? GREEN : BORDER),
        borderRadius: 16,
        padding: "13px 14px",
        // The rail stretches every card to the tallest one, so the pips are
        // pinned to the bottom rather than left floating under the copy.
        display: "flex",
        flexDirection: "column",
        boxShadow: SH,
        opacity: isDone ? 0.85 : 1,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {/* Icon and pillar name in one chip. It costs no height, because the
            chip is still shorter than the two lines of copy beside it, and it
            matches how the To-do stack already names each pillar. */}
        <span
          style={{
            width: 44,
            borderRadius: 12,
            flexShrink: 0,
            background: hue.t,
            opacity: isDone ? 0.6 : 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            padding: "7px 0 6px",
          }}
        >
          <p.Icon size={17} color={hue.c} />
          <span style={{ fontSize: 9.5, fontWeight: 700, color: hue.c, letterSpacing: 0.2 }}>
            {PILLAR_NAME[pid]}
          </span>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: isDone ? MUTED : TEXT,
              textDecoration: isDone ? "line-through" : "none",
              textDecorationColor: RULE,
            }}
          >
            {p.title}
          </div>
          <div style={{ fontSize: 10.5, color: MUTED, marginTop: 2, lineHeight: 1.4 }}>
            {isDone
              ? "Sorted for today"
              : filled > 0 && p.checks > 1
              ? /* Part way in. Say where you are, not what the task is for. */
                filled + " of " + p.checks + " " + (p.step || "part") + "s in, " +
                (p.checks - filled) + " to go"
              : p.hint}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {isDone && (
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: GREEN,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "popIn .4s cubic-bezier(.32,.72,0,1) both",
              }}
            >
              <Check size={13} color="#fff" strokeWidth={3.4} />
            </span>
          )}
          {!isDone && p.coins && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                background: GOLD_TINT,
                border: "1px solid " + GOLD_LINE,
                borderRadius: 999,
                padding: "3px 8px 3px 6px",
              }}
            >
              <span
                style={{
                  width: 13,
                  height: 13,
                  background: GOLD,
                  clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, fontWeight: 700, color: GOLD_DEEP }}>+{p.coins}</span>
            </span>
          )}
          <ChevronRight size={16} color={MUTED} />
        </div>
      </div>

      {/* What was last put in, so the card says where the day is up to */}
      {last && (
        <div
          style={{
            marginTop: 11,
            paddingTop: 10,
            borderTop: "1px solid " + LINE,
            display: "flex",
            alignItems: "baseline",
            gap: 10,
          }}
        >
          {/* The food is the point, the clock is metadata. Weight carries
              that: dark on what was eaten, light on when. */}
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 11,
              fontWeight: 600,
              color: TEXT,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {last.items.map((it) => byId(it.id).name + " " + qtyLabel(byId(it.id), it.qty)).join(", ")}
          </span>
          <span style={{ flexShrink: 0, fontSize: 10.5, color: MUTED }}>{fmtTime(last.timeMins)}</span>
        </div>
      )}

      {/* Where the day stands on this pillar, in its own numbers */}
      {stats && (
        <div style={{ marginTop: 11, paddingTop: 10, borderTop: "1px solid " + LINE, display: "flex" }}>
          {stats.map((x, i) => (
            <div
              key={x.l}
              style={{
                flex: 1,
                minWidth: 0,
                textAlign: "center",
                borderLeft: i === 0 ? "none" : "1px solid " + LINE,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.1 }}>{x.v}</div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 8.5,
                  fontWeight: 600,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  color: MUTED,
                  marginTop: 3,
                }}
              >
                {x.l}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* check pips — one per required log */}
      <div style={{ display: "flex", gap: 5, marginTop: last || stats ? 0 : "auto", paddingTop: last || stats ? 10 : 11 }}>
        {Array.from({ length: p.checks }).map((_, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 3,
              background: i < filled ? hue.c : BG_SUNK,
            }}
          />
        ))}
      </div>
    </div>
  );

}
