import React from "react";
import { useWF } from "../../state";
import { ChevronRight, Scale, Activity, Soup, Sparkles, Gauge } from "lucide-react";
import { ScoreScreen } from "./parts";
import { TEXT, MUTED, FAINT, BG, BORDER, MOVE_C, MOVE_T } from "../../tokens";

/* One question before the form, and it is the only one that is about you
   rather than about your measurements.

   It steers what the coaches look at first; it does not gate anything, which
   the line at the foot says out loud. A question that quietly narrows a score
   is one people answer strategically instead of honestly. */
const FOCUS = [
  { id: "weight", Icon: Scale, line: "I find it hard to manage my weight" },
  { id: "sugar", Icon: Activity, line: "I notice sugar spikes or energy crashes" },
  { id: "bloated", Icon: Soup, line: "I feel bloated or heavy after meals" },
  { id: "cycle", Icon: Sparkles, line: "I have seen changes in my cycle, skin or hair" },
  { id: "none", Icon: Gauge, line: "None of these, just take me to my score" },
];

export default function Focus() {
  const { setScoreFlow, scoreFocus, setScoreFocus } = useWF();

  const pick = (id) => {
    setScoreFocus(id);
    setScoreFlow("profile");
  };

  return (
    <ScoreScreen step="focus" onBack={() => setScoreFlow("intro")}>
      <div style={{ padding: "4px 22px 26px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 800,
            color: TEXT,
            letterSpacing: -0.4,
            lineHeight: 1.25,
          }}
        >
          What should we look at first?
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
          More than one may be true. Pick whichever sounds most like you today.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 20 }}>
          {FOCUS.map((f) => {
            const on = scoreFocus === f.id;
            return (
              <button
                key={f.id}
                onClick={() => pick(f.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "13px 13px",
                  background: on ? MOVE_T : BG,
                  border: "1px solid " + (on ? MOVE_C : BORDER),
                  borderRadius: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: MOVE_T,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <f.Icon size={16} color={MOVE_C} strokeWidth={2} />
                </span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, color: TEXT, lineHeight: 1.4 }}>
                  {f.line}
                </span>
                <ChevronRight size={16} color={FAINT} strokeWidth={2.4} style={{ flexShrink: 0 }} />
              </button>
            );
          })}
        </div>

        <p style={{ margin: "16px 0 0", fontSize: 11.5, color: FAINT, lineHeight: 1.5, textAlign: "center" }}>
          Your score is not limited by this. It only decides what your coaches read first.
        </p>
      </div>
    </ScoreScreen>
  );
}
