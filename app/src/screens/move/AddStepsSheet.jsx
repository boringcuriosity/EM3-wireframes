import React, { useEffect, useRef, useState } from "react";
import { useWF } from "../../state";
import { X, Footprints } from "lucide-react";
import { GREEN, GREEN_DEEP, MOVE_C, MOVE_T, TEXT, MUTED, BG, BORDER } from "../../tokens";

const COINS = 1;

/* 500 up to 30,000, which covers a quiet day and a very long walk. A wheel
   rather than a row of chips: a fixed set of chips caps what anyone can say,
   and a keypad invites a made-up number. Half thousands are as fine as this
   ever needs to be. */
const STEP = 500;
const MAX = 30000;
const VALUES = Array.from({ length: MAX / STEP }, (_, i) => (i + 1) * STEP);
const ROW = 42;
const WHEEL_H = ROW * 5;

/* Steps by hand, for anyone who did not connect Health Connect.

   A wheel of round numbers rather than a keypad: nobody knows their step count
   to the digit, and asking for one invites a made-up number. The nearest
   thousand is as true as this ever gets. */
export default function AddStepsSheet() {
  const { setStepsSheet, manualSteps, setManualSteps, flipcoins, setFlipcoins, setToast } = useWF();
  const [n, setN] = useState(manualSteps || 4000);

  const save = () => {
    const first = manualSteps === null;
    setManualSteps(n);
    if (first) {
      setFlipcoins(flipcoins + COINS);
      setToast({ title: "Steps added", line: n.toLocaleString() + " steps today", coins: COINS });
    }
    setStepsSheet(false);
  };

  return (
    <div
      onClick={() => setStepsSheet(false)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 55,
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
          background: BG,
          borderRadius: "26px 26px 0 0",
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: BORDER, margin: "10px auto 0" }} />

        <div style={{ padding: "14px 22px 0", display: "flex", alignItems: "center", gap: 9 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: MOVE_T,
              color: MOVE_C,
              borderRadius: 999,
              padding: "4px 10px 4px 8px",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}
          >
            <Footprints size={12} strokeWidth={2.2} />
            Steps
          </span>
          <span style={{ flex: 1 }} />
          <button
            onClick={() => setStepsSheet(false)}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: -4 }}
          >
            <X size={17} color={MUTED} />
          </button>
        </div>

        <div style={{ padding: "13px 22px 0" }}>
          <h2
            style={{
              margin: 0,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 20,
              fontWeight: 600,
              color: TEXT,
              lineHeight: 1.3,
            }}
          >
            Roughly how much did you walk today?
          </h2>
          <p style={{ margin: "8px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>
            Roughly is fine. Your coach is reading the week, not the digits.
          </p>
        </div>

        <Wheel value={n} onChange={setN} />

        <div style={{ padding: "18px 22px 26px" }}>
          <button
            onClick={save}
            style={{
              width: "100%",
              background: GREEN,
              border: "none",
              borderRadius: 14,
              padding: "14px 0",
              color: "#fff",
              fontSize: 14.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 2px 0 " + GREEN_DEEP,
            }}
          >
            {(manualSteps === null ? "Add " : "Update to ") + n.toLocaleString() + " steps"}
          </button>
          <div style={{ fontSize: 11, color: MUTED, textAlign: "center", marginTop: 10 }}>
            Connect Health Connect and this fills in on its own.
          </div>
        </div>
      </div>
    </div>
  );
}

function Wheel({ value, onChange }) {
  const ref = useRef(null);
  const settle = useRef(null);

  // Land on the current value without animating in from the top.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = (VALUES.indexOf(value) < 0 ? 7 : VALUES.indexOf(value)) * ROW;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = (e) => {
    const top = e.currentTarget.scrollTop;
    clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const i = Math.max(0, Math.min(VALUES.length - 1, Math.round(top / ROW)));
      if (VALUES[i] !== value) onChange(VALUES[i]);
    }, 90);
  };

  return (
    <div style={{ position: "relative", height: WHEEL_H, margin: "16px 0 0", overflow: "hidden" }}>
      {/* The band that says which one counts */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          top: ROW * 2,
          height: ROW,
          borderRadius: 12,
          background: MOVE_T,
          pointerEvents: "none",
        }}
      />
      {/* Fade at both ends, so the list reads as a wheel rather than a list */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2,
          background:
            "linear-gradient(" + BG + " 0%, rgba(255,255,255,0) 34%, rgba(255,255,255,0) 66%, " + BG + " 100%)",
        }}
      />

      <div
        ref={ref}
        onScroll={onScroll}
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          overflowY: "auto",
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none",
          padding: ROW * 2 + "px 0",
          boxSizing: "border-box",
        }}
      >
        {VALUES.map((v) => {
          const on = v === value;
          return (
            <div
              key={v}
              onClick={() => onChange(v)}
              style={{
                height: ROW,
                scrollSnapAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontSize: on ? 26 : 19,
                  fontWeight: on ? 800 : 500,
                  color: on ? TEXT : MUTED,
                  opacity: on ? 1 : 0.6,
                  transition: "font-size .15s, opacity .15s",
                }}
              >
                {v.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
