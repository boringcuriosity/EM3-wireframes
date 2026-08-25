import React from "react";
import { Clock, Info } from "lucide-react";
import { MUTED, TEXT } from "../tokens";

/* A slim tab that sits behind a pillar's task card and shows only its bottom
   edge, so the wait is attached to the pillar it belongs to rather than
   floating as a card of its own. Negative margin pulls the card over it; the
   padding is what stays visible. It only ever says one thing, that the plan is
   not here yet, so it disappears rather than flipping to a done state. */
export default function PlanStrip({ label, onInfo }) {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 0,
        marginTop: -16,
        paddingTop: 22,
        paddingBottom: 7,
        paddingLeft: 15,
        paddingRight: 13,
        borderRadius: 16,
        background: "#F2F4F7",
        border: "1px solid #E4E7EC",
        display: "flex",
        alignItems: "center",
        gap: 7,
      }}
    >
      <Clock size={12} color={MUTED} strokeWidth={2.2} />
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 10.5,
          fontWeight: 600,
          color: MUTED,
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>

      {/* Dark enough to read against the grey strip on its own, with padding
          for a finger and a negative margin so it costs no layout. */}
      <button
        onClick={onInfo}
        aria-label={label + ". What this means"}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 4,
          margin: -4,
          display: "flex",
          flexShrink: 0,
        }}
      >
        <Info size={14} color={TEXT} strokeWidth={2.3} />
      </button>
    </div>
  );
}
