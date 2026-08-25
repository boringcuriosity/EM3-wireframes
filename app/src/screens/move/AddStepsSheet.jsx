import React, { useState } from "react";
import { useWF } from "../../state";
import { X, Footprints } from "lucide-react";
import { GREEN, GREEN_DEEP, MOVE_C, MOVE_T, TEXT, MUTED, BG, BORDER } from "../../tokens";

const COINS = 1;
const STEPS = [1000, 2000, 3000, 4000, 5000, 6000, 8000, 10000, 12000];

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
            The nearest thousand is close enough. Your coach is reading the week, not the digits.
          </p>
        </div>

        <div style={{ textAlign: "center", padding: "20px 0 4px" }}>
          <span style={{ fontSize: 40, fontWeight: 800, color: TEXT, lineHeight: 1 }}>
            {n.toLocaleString()}
          </span>
          <span style={{ fontSize: 13, color: MUTED, marginLeft: 7 }}>steps</span>
        </div>

        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "14px 22px 2px", scrollbarWidth: "none" }}>
          {STEPS.map((v) => {
            const on = v === n;
            return (
              <button
                key={v}
                onClick={() => setN(v)}
                style={{
                  flexShrink: 0,
                  background: on ? MOVE_C : BG,
                  border: "1px solid " + (on ? MOVE_C : BORDER),
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontSize: 13,
                  fontWeight: on ? 700 : 500,
                  color: on ? "#fff" : TEXT,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {v.toLocaleString()}
              </button>
            );
          })}
        </div>

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
            {manualSteps === null ? "Add these steps" : "Update my steps"}
          </button>
          <div style={{ fontSize: 11, color: MUTED, textAlign: "center", marginTop: 10 }}>
            Connect Health Connect and this fills in on its own.
          </div>
        </div>
      </div>
    </div>
  );
}
