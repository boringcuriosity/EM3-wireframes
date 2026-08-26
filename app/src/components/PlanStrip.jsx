import React from "react";
import { Clock, Info } from "lucide-react";
import { TEXT, MUTED, BG, BORDER, SH_SM } from "../tokens";

/* Why there is a list below but no plan behind it.

   Two lines and no more: this is context for the tasks, not a task of its own,
   so it stays shorter than anything it sits above. It only ever says one
   thing, that the plan has not arrived, so it disappears rather than flipping
   to a done state. */
export default function PlanStrip({ label, line, onInfo }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        background: BG,
        border: "1px solid " + BORDER,
        borderRadius: 14,
        padding: "11px 13px",
        marginTop: 16,
        boxShadow: SH_SM,
      }}
    >
      <Clock size={14} color={MUTED} strokeWidth={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
      {/* One paragraph, not a heading over a body. The same words in two
          stacked blocks run to four lines; here they run to two and a half. */}
      <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: 11.5, color: MUTED, lineHeight: 1.5 }}>
        <span style={{ fontWeight: 700, color: TEXT }}>{label}</span>
        {line ? " " + line : ""}
      </p>
      <button
        onClick={onInfo}
        aria-label="Why the wait"
        style={{
          background: "none",
          border: "none",
          padding: 2,
          margin: "-2px -2px 0 0",
          cursor: "pointer",
          flexShrink: 0,
          display: "flex",
        }}
      >
        <Info size={15} color={MUTED} strokeWidth={2} />
      </button>
    </div>
  );
}
