import React from "react";
import { useWF } from "../../state";
import { Check } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BG_ALT, BORDER } from "../../tokens";
import { Cta } from "./parts";
import { MACRO_INFO, GOALS, targetsFor } from "./data";

/* One macro, explained. Opened from the eye on a target tile, so the answer
   arrives next to the number that raised the question. */
export default function MacroSheet() {
  const { suffSheet, setSuffSheet, suffGoal, suffKcal } = useWF();
  const info = MACRO_INFO[suffSheet];
  if (!info) return null;

  const goal = GOALS.find((g) => g.id === suffGoal) || GOALS[0];
  const t = targetsFor(suffGoal, suffKcal ?? goal.kcal).find((x) => x.id === suffSheet);

  return (
    <div
      onClick={() => setSuffSheet(null)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 47,
        background: "rgba(31,38,48,0.42)",
        display: "flex",
        alignItems: "flex-end",
        animation: "scrimIn .24s ease both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="macro-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: BG,
          borderRadius: "26px 26px 0 0",
          padding: "10px 22px 24px",
          boxShadow: "0 -12px 40px rgba(31,38,48,0.22)",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 2, background: BORDER, margin: "0 auto 16px" }} />

        <div id="macro-title" style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>
          {info.label}
        </div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
          <strong style={{ color: TEXT }}>
            {t.target}
            {t.unit} a day
          </strong>{" "}
          · {info.tagline}
        </div>

        <p style={{ margin: "14px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>
          {info.body}
        </p>

        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.9, margin: "20px 0 10px" }}>
          WHAT IT DOES FOR YOU
        </div>
        {info.does.map((d) => (
          <div key={d} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                flexShrink: 0,
                background: BG_ALT,
                border: "1px solid " + BORDER,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Check size={11} color={GREEN} strokeWidth={3} />
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: TEXT }}>{d}</span>
          </div>
        ))}

        <div style={{ marginTop: 18 }}>
          <Cta onClick={() => setSuffSheet(null)}>Got it</Cta>
        </div>
      </div>
    </div>
  );
}
