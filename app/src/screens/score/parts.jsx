import React from "react";
import { ChevronLeft } from "lucide-react";
import { GREEN, TEXT, BG, BORDER } from "../../tokens";

/* The frame every step of the score walkthrough sits in: a way back, a
   progress rail, a scrolling body and a footer that does not scroll with it.

   Its own copy rather than the sufficiency one because the two flows have
   different steps, and a shared component taking a step list as a prop would
   be one indirection standing in for four lines. */
const STEPS = ["intro", "focus", "profile", "review", "result"];

export function ScoreScreen({ step, onBack, children, footer }) {
  const idx = STEPS.indexOf(step);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "6px 22px 10px",
        }}
      >
        {onBack ? (
          <button
            onClick={onBack}
            aria-label="Back"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: BG,
              border: "1px solid " + BORDER,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={18} color={TEXT} />
          </button>
        ) : (
          <span style={{ width: 34 }} />
        )}
        <span style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
          {STEPS.map((s, i) => (
            <span
              key={s}
              style={{
                width: i === idx ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background: i <= idx ? GREEN : BORDER,
                transition: "width .2s",
              }}
            />
          ))}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>{children}</div>

      {footer && (
        <div style={{ flexShrink: 0, padding: "12px 22px 26px", borderTop: "1px solid " + BORDER }}>
          {footer}
        </div>
      )}
    </div>
  );
}
