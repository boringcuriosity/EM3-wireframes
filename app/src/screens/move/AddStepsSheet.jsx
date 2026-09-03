import React, { useState } from "react";
import { useWF } from "../../state";
import { X } from "lucide-react";
import Wheel from "../../components/Wheel";
import { GREEN, GREEN_DEEP, TEXT, MUTED, BG } from "../../tokens";

const COINS = 1;

/* 500 up to 30,000, which covers a quiet day and a very long walk. A wheel
   rather than a row of chips: a fixed set of chips caps what anyone can say,
   and a keypad invites a made-up number. Half thousands are as fine as this
   ever needs to be. */
const STEP = 500;
const MAX = 30000;
const VALUES = Array.from({ length: MAX / STEP }, (_, i) => {
  const v = (i + 1) * STEP;
  return { v, label: v.toLocaleString() };
});

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
          overflow: "hidden",
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >

        <div style={{ padding: "22px 22px 0", display: "flex", alignItems: "center", gap: 9 }}>
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
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "-0.02em",
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

        <div style={{ marginTop: 16 }}>
          <Wheel items={VALUES} value={n} onChange={setN} />
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
            {(manualSteps === null ? "Add " : "Update to ") + n.toLocaleString() + " steps"}
          </button>
        </div>
      </div>
    </div>
  );
}

