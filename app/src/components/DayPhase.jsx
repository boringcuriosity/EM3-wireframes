import React from "react";
import { Check, ChevronDown } from "lucide-react";
import DayRow from "./DayRow";
import { GREEN, TEXT, MUTED, BG, BORDER, SH_SM } from "../tokens";

/* A part of the day, with its own finish line.

   Three reachable endings beat one distant one. Clearing the morning is a real
   moment at 10am; clearing all thirteen rows is not a moment until nine at
   night. When a phase is done it folds itself away, so the list gets shorter
   as the day goes on instead of standing there fully lit. */
export default function DayPhase({ phase: f, open, onToggle }) {
  return (
    <div
      style={{
        background: BG,
        border: "1px solid " + BORDER,
        borderRadius: 18,
        padding: "4px 16px 6px",
        marginBottom: 12,
        boxShadow: SH_SM,
      }}
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
          padding: "12px 0 11px",
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
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 17,
            fontWeight: 600,
            color: TEXT,
          }}
        >
          {f.complete ? f.label + " done" : f.label}
        </span>
        <span style={{ fontSize: 11.5, color: MUTED }}>
          {f.done} of {f.total}
        </span>
        <ChevronDown
          size={16}
          color={MUTED}
          style={{ transform: open ? "none" : "rotate(-90deg)", transition: "transform .2s ease" }}
        />
      </button>

      {open &&
        f.rows.map((r, i) => <DayRow key={r.id} row={r} last={i === f.rows.length - 1} />)}
    </div>
  );
}
