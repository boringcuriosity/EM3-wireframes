import React from "react";
import { useWF } from "../state";
import KairaMark from "./KairaMark";
import { TEXT_2, BG, BORDER, SH_SM } from "../tokens";

/* Kaira's read on the day.

   She sits between the scores and the tasks and that position is her job: the
   scores say where you stand, the rows say what to do, and she is the only
   thing that can say which task moves which score. Anything that does not join
   those two halves is a wasted line.

   She talks about the pillar in the big bubble, never another one, because a
   card whose halves disagree is worse than one that says less. The line is
   derived in `state.jsx` off the same hero the bubbles read, so the two can
   never come apart.

   Unsigned, and unnamed. Her hexagon is the only mark on it: putting a label
   over the line spends a row saying who is talking, which the shape already
   does, and there is one voice on this card anyway. The mark itself moved to
   `KairaMark` when Move's card needed it too, rather than becoming a third
   copy of the same six points. */
export default function KairaSummary() {
  const { kairaLine } = useWF();
  if (!kairaLine) return null;

  return (
    <div
      style={{
        background: BG,
        border: "1px solid " + BORDER,
        borderRadius: 16,
        boxShadow: SH_SM,
        padding: "13px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <KairaMark />
      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: TEXT_2, lineHeight: 1.55 }}>
        {kairaLine}
      </span>
    </div>
  );
}
