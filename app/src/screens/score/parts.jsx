import React from "react";
import { useWF } from "../../state";
import NextActionStrip from "../../components/NextActionStrip";
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
  /* Only when this walkthrough is one of the first steps. Opened cold from the
     panel, or by somebody who has no such list, it is a score flow and nothing
     else, and a progress strip for a list they are not on would be a promise
     about work nobody asked them to do. */
  const { nextActions } = useWF();
  const strip = nextActions.includes("score") ? <NextActionStrip id="score" /> : null;
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
        <div style={{ flexShrink: 0, borderTop: "1px solid " + BORDER }}>
          {/* Outside the padding, so the strip reaches both edges of the frame
              and reads as part of the screen rather than as content. */}
          {strip}
          <div style={{ padding: "12px 22px 26px" }}>{footer}</div>
        </div>
      )}
    </div>
  );
}
