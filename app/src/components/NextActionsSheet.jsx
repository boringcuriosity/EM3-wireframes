import React from "react";
import { useWF } from "../state";
import { Check, X } from "lucide-react";
import CtaArrow from "./CtaArrow";
import {
  GREEN, TEXT, MUTED, FAINT, BG, BG_ALT, LINE, WARN, WARN_TINT, WARN_LINE,
} from "../tokens";

/* The whole list, from inside one of them.

   The strip above a flow can say which step this is and how many there are. It
   cannot say what the others are, and that is the question somebody halfway
   through a walkthrough actually has. One tap, the list, and a way into any of
   them. */

const ITEMS = {
  score: { name: "Metabolic score", line: "A few questions about how you eat, move and sleep." },
  labs: { name: "Diagnostics", line: "A blood test at home, included in your program." },
  assess: { name: "Pre-consultation assessment", line: "KAIRA learns how your days actually run." },
  "book:eat": { name: "Eat consultation", line: "The hour your nutrition coach writes your plan in." },
  "book:move": { name: "Move consultation", line: "The hour your physio writes your routine in." },
  "book:mind": { name: "Mind consultation", line: "The hour your psychologist plans around." },
};

export default function NextActionsSheet() {
  const {
    setNextSheet, nextActions, nextOpen, setScoreFlow, setScoreStep,
    openDiagnostics, openBooking, setActiveTab,
  } = useWF();

  const total = nextActions.length;
  const done = total - nextOpen.length;

  /* Where each one lives. The sheet closes on the way, because it is a map
     rather than a place. */
  const go = (id) => {
    setNextSheet(false);
    if (id === "score") {
      setScoreStep(0);
      setScoreFlow("intro");
      return;
    }
    if (id === "labs") return openDiagnostics();
    if (id.startsWith("book:")) return openBooking({ eat: "eat", move: "move", mind: "success" }[id.slice(5)]);
    setActiveTab("care");
  };

  return (
    <div
      onClick={() => setNextSheet(false)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 60,
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
          maxHeight: "82%",
          display: "flex",
          flexDirection: "column",
          background: BG,
          borderRadius: "26px 26px 0 0",
          overflow: "hidden",
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <div style={{ flexShrink: 0, display: "flex", alignItems: "flex-start", gap: 10, padding: "22px 22px 0" }}>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 19, fontWeight: 800, color: TEXT, letterSpacing: -0.3 }}>
              Your first steps
            </span>
            <span style={{ display: "block", fontSize: 12.5, color: MUTED, marginTop: 4, lineHeight: 1.5 }}>
              {done} of {total} done. Your coaches read all of these before they write anything.
            </span>
          </span>
          <button
            onClick={() => setNextSheet(false)}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: "-4px -4px 0 0", display: "flex" }}
          >
            <X size={18} color={MUTED} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "16px 22px 26px" }}>
          {nextActions.map((id) => {
            const x = ITEMS[id] || { name: id, line: "" };
            const open = nextOpen.includes(id);
            return (
              <button
                key={id}
                onClick={open ? () => go(id) : undefined}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  textAlign: "left",
                  marginBottom: 8,
                  padding: "12px 13px",
                  borderRadius: 14,
                  background: open ? BG : BG_ALT,
                  border: "1px solid " + (open ? WARN_LINE : LINE),
                  cursor: open ? "pointer" : "default",
                  fontFamily: "inherit",
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    flexShrink: 0,
                    borderRadius: "50%",
                    background: open ? WARN_TINT : GREEN,
                    border: "1px solid " + (open ? WARN_LINE : GREEN),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {open ? (
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: WARN }} />
                  ) : (
                    <Check size={14} color="#fff" strokeWidth={3} />
                  )}
                </span>

                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: open ? TEXT : FAINT,
                      textDecoration: open ? "none" : "line-through",
                    }}
                  >
                    {x.name}
                  </span>
                  {open && (
                    <span style={{ display: "block", fontSize: 11.5, color: MUTED, marginTop: 2, lineHeight: 1.45 }}>
                      {x.line}
                    </span>
                  )}
                </span>

                {open && <CtaArrow size={14} style={{ color: GREEN, flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
