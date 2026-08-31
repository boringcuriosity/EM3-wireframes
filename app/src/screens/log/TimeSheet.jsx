import React, { useEffect, useRef } from "react";
import { useWF } from "../../state";
import { GREEN, TEXT, MUTED, BG, BG_ALT, BORDER } from "../../tokens";
import { timeSlots, fmtTime, divisionForTime, DIVISION_LABEL } from "./foods";

const NOW = 13 * 60 + 30; // the prototype's clock reads 1:30 PM

/* When did you eat this? Half hour slots from the morning up to now, because
   you cannot have eaten something later than now. Picking one immediately
   changes which meal the food lands under, so that is shown as you scroll. */
export default function TimeSheet() {
  const { logTime, setLogTime, setLogTimeOpen } = useWF();
  const railRef = useRef(null);

  useEffect(() => {
    railRef.current?.querySelector('[data-on="1"]')?.scrollIntoView({ inline: "center", block: "nearest" });
  }, []);

  const slots = timeSlots(NOW);

  return (
    <div
      onClick={() => setLogTimeOpen(false)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 48,
        background: "rgba(31,38,48,0.42)",
        display: "flex",
        alignItems: "flex-end",
        animation: "scrimIn .24s ease both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="time-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: BG,
          borderRadius: "26px 26px 0 0",
          overflow: "hidden",
          padding: "22px 0 24px",
          boxShadow: "0 -12px 40px rgba(31,38,48,0.22)",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >

        <div style={{ padding: "0 22px" }}>
          <div id="time-title" style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>
            When did you eat this?
          </div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>Today</div>
        </div>

        <div
          ref={railRef}
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            padding: "16px 22px 4px",
            scrollbarWidth: "none",
          }}
        >
          {slots.map((t) => {
            const on = t === logTime;
            return (
              <button
                key={t}
                data-on={on ? "1" : "0"}
                onClick={() => setLogTime(t)}
                style={{
                  flexShrink: 0,
                  background: on ? GREEN : BG,
                  border: "1px solid " + (on ? GREEN : BORDER),
                  borderRadius: 12,
                  padding: "11px 15px",
                  fontSize: 13,
                  fontWeight: on ? 700 : 500,
                  color: on ? "#fff" : TEXT,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {fmtTime(t)}
              </button>
            );
          })}
        </div>

        <div style={{ padding: "14px 22px 0" }}>
          <div
            style={{
              background: BG_ALT,
              border: "1px solid " + BORDER,
              borderRadius: 13,
              padding: "11px 13px",
              fontSize: 11.5,
              color: MUTED,
              lineHeight: 1.5,
            }}
          >
            {fmtTime(logTime)} puts this under{" "}
            <strong style={{ color: TEXT }}>{DIVISION_LABEL[divisionForTime(logTime)]}</strong> in your
            day. Change the time and it moves.
          </div>

          <button
            onClick={() => setLogTimeOpen(false)}
            style={{
              width: "100%",
              marginTop: 14,
              background: GREEN,
              border: "none",
              borderRadius: 14,
              padding: "14px 0",
              color: "#fff",
              fontSize: 14.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
