import React from "react";
import { useWF } from "../state";
import { phasesFor } from "../screens/today/day";
import { Check } from "lucide-react";
import { MOVE_C, MOVE_T, TEXT, MUTED, FAINT, BG, BORDER, RULE } from "../tokens";

/* The coach's small movements, tickable where the plan lives.

   They were only reachable from To-do, which put half of a Move plan on a
   different screen from the other half and the score that reads both. Somebody
   opening Move to do their plan could work through the routine and had no way
   to say they had taken the stairs.

   One tap each and no logger. There is no duration to collect, because nobody
   times the stairs, and the tick is the whole record. That is what separates
   these from the workout above them rather than a difference in how much they
   are worth: they carry a quarter of the weight each and pay Flipcoins the
   same way. */
export default function SmallMoves() {
  const { dayLive, openRow, phaseMode } = useWF();
  const spans = phasesFor(phaseMode);

  const rows = dayLive.filter((r) => r.pillar === "move" && r.type === "neat");
  if (!rows.length) return null;

  return (
    <div style={{ border: "1px solid " + BORDER, borderRadius: 16, overflow: "hidden", background: BG }}>
      {rows.map((r, i) => (
        <button
          key={r.id}
          onClick={() => openRow(r)}
          aria-label={r.title + (r.done ? ", done" : ", not done yet")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            width: "100%",
            padding: "12px 14px",
            background: "none",
            border: "none",
            borderTop: i ? "1px solid " + RULE : "none",
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "left",
          }}
        >
          <span
            style={{
              width: 21,
              height: 21,
              borderRadius: "50%",
              flexShrink: 0,
              background: r.done ? MOVE_C : BG,
              border: "1.8px solid " + (r.done ? MOVE_C : MOVE_T),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background .18s ease",
            }}
          >
            {r.done && <Check size={12} color="#fff" strokeWidth={3} />}
          </span>

          <span style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                display: "block",
                fontSize: 13.5,
                fontWeight: 600,
                color: r.done ? MUTED : TEXT,
                lineHeight: 1.35,
                textDecoration: r.done ? "line-through" : "none",
              }}
            >
              {r.title}
            </span>
            {r.tip && !r.done && (
              <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2, lineHeight: 1.45 }}>
                {r.tip}
              </span>
            )}
          </span>

          {/* The part of the day, not a clock time. A walk after your tea is
              not an appointment at half past five, and a timetable is a thing
              to fall behind rather than a plan to work through. The hours are
              there underneath for anybody who wants to know how long is left
              to do it in. */}
          <span style={{ flexShrink: 0, textAlign: "right" }}>
            <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: r.done ? FAINT : MUTED }}>
              {(spans.find((p) => p.id === r.phase) || {}).label || ""}
            </span>
            <span style={{ display: "block", fontSize: 9.5, color: FAINT, marginTop: 1 }}>
              {(spans.find((p) => p.id === r.phase) || {}).span || ""}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
