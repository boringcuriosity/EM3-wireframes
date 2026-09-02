import React from "react";
import { Check, ChevronDown } from "lucide-react";
import DayRow from "./DayRow";
import { useWF } from "../state";

// The clock the wireframe is frozen at, matched to the status bar.
const NOW_MIN = 9 * 60 + 41;
import { GREEN, TEXT, MUTED, BG, BORDER, SH_SM, FAINT} from "../tokens";

/* A part of the day, with its own finish line.

   Three reachable endings beat one distant one. Clearing the morning is a real
   moment at 10am; clearing the whole list is not a moment until nine at night.
   When a phase is done it folds itself away, so the list gets shorter as the
   day goes on instead of standing there fully lit.

   The heading stays the plain name of the part of the day. The green tick and
   the count beside it already say it is finished, and saying it a third time
   in the words made three headings read as a report. */
export default function DayPhase({ phase: f, open, onToggle }) {
  const { taskCard } = useWF();
  /* With a card per task the container would be a card holding cards, so the
     heading goes flush and the cards stand on the page. */
  const cards = taskCard !== "row";
  // The timeline draws its own spine per row, so the phase gives it no padding
  // to fight with.
  const flush = taskCard === "timeline" || taskCard === "focus";

  return (
    <div
      style={
        cards
          ? { marginBottom: flush ? 18 : 14 }
          : {
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 18,
              padding: "4px 16px 6px",
              marginBottom: 12,
              boxShadow: SH_SM,
            }
      }
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 9,
          background: "none",
          border: "none",
          padding: cards ? "4px 2px 10px" : "12px 0 11px",
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        {f.complete && (
          <span
            style={{
              width: 19,
              height: 19,
              borderRadius: "50%",
              background: GREEN,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Check size={11} color="#fff" strokeWidth={3.2} />
          </span>
        )}
        {/* The hours belong to the part of the day rather than to each task
            in it. Every row carried its own clock while the headings said
            none, which meant reading eight times to learn what one heading
            could say once. */}
        <span style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "baseline", gap: 7 }}>
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 17,
              fontWeight: 600,
              color: TEXT,
            }}
          >
            {f.label}
          </span>
          <span style={{ fontSize: 10.5, color: FAINT, whiteSpace: "nowrap" }}>{f.span}</span>
        </span>
        <span style={{ fontSize: 11.5, color: MUTED }}>
          {f.total === 0 ? "Not today" : f.done + " of " + f.total}
        </span>
        <ChevronDown
          size={16}
          color={MUTED}
          style={{ transform: open ? "none" : "rotate(-90deg)", transition: "transform .2s ease" }}
        />
      </button>

      {open &&
        (() => {
          /* Where the clock sits inside this part of the day: the first task
             still ahead of it carries the marker. */
          const nowAt = taskCard === "timeline2" ? f.rows.findIndex((r) => r.at > NOW_MIN) : -1;
          return f.rows.map((r, i) => (
            <DayRow key={r.id} row={r} last={i === f.rows.length - 1} now={i === nowAt} />
          ));
        })()}
    </div>
  );
}
