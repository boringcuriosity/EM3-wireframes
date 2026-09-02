import React from "react";
import { useWF } from "../../state";
import { Pencil } from "lucide-react";
import { ScoreScreen } from "./parts";
import { Cta } from "../sufficiency/parts";
import { QUESTIONS } from "./questions";
import { GREEN, TEXT, MUTED, BG, BORDER } from "../../tokens";

/* Everything you said, in one place, before it becomes a number.

   The edit on each row goes back to that question rather than restarting the
   run, because the only reason to be on this screen is that one answer is
   wrong and you know which. */
export default function Review() {
  const { setScoreFlow, setScoreStep } = useWF();

  return (
    <ScoreScreen
      step="review"
      onBack={() => {
        setScoreStep(QUESTIONS.length - 1);
        setScoreFlow("profile");
      }}
      footer={<Cta onClick={() => setScoreFlow("working")}>Work out my score</Cta>}
    >
      <div style={{ padding: "0 22px 26px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: 21,
            fontWeight: 800,
            color: TEXT,
            letterSpacing: -0.4,
            lineHeight: 1.25,
          }}
        >
          Does this look right?
        </h1>
        <p style={{ margin: "7px 0 0", fontSize: 13, color: MUTED, lineHeight: 1.55 }}>
          Change anything that is off. Your coaches read these before they meet you.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 18 }}>
          {QUESTIONS.map((q, i) => (
            <div
              key={q.id}
              style={{
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 14,
                padding: "12px 14px",
              }}
            >
              <div style={{ fontSize: 11.5, color: MUTED }}>{q.label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3 }}>
                <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 700, color: TEXT }}>
                  {q.answer}
                </span>
                <button
                  onClick={() => {
                    setScoreStep(i);
                    setScoreFlow("profile");
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    flexShrink: 0,
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: 12,
                    fontWeight: 700,
                    color: GREEN,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Edit
                  <Pencil size={12} strokeWidth={2.4} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScoreScreen>
  );
}
