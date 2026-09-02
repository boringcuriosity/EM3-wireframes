import React from "react";
import { useWF } from "../../state";
import { ScoreScreen } from "./parts";
import { Cta, KairaMark } from "../sufficiency/parts";
import { QUESTIONS } from "./questions";
import { GREEN, TEXT, MUTED, BG, BG_ALT, BORDER, LINE } from "../../tokens";

/* One question at a time, with a bar that fills as they go.

   Five on one screen is a form, and a form gets skimmed. One at a time is a
   conversation, and the bar is what stops that feeling endless: you can see
   there are five and you can see where you are. */
export default function ScoreProfile() {
  const { setScoreFlow, scoreStep, setScoreStep } = useWF();

  const i = Math.min(scoreStep, QUESTIONS.length - 1);
  const q = QUESTIONS[i];
  const last = i === QUESTIONS.length - 1;

  const back = () => (i === 0 ? setScoreFlow("focus") : setScoreStep(i - 1));
  const next = () => (last ? setScoreFlow("review") : setScoreStep(i + 1));

  return (
    <ScoreScreen
      step="profile"
      onBack={back}
      footer={<Cta onClick={next}>{last ? "Review my answers" : "Next"}</Cta>}
    >
      <div style={{ padding: "0 22px" }}>
        {/* How far in, before the question rather than after it. */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ flex: 1, height: 4, borderRadius: 2, background: LINE, overflow: "hidden" }}>
            <span
              style={{
                display: "block",
                height: "100%",
                width: "100%",
                background: GREEN,
                transformOrigin: "left",
                transform: "scaleX(" + (i + 1) / QUESTIONS.length + ")",
                transition: "transform .4s cubic-bezier(.32,.72,0,1)",
              }}
            />
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, flexShrink: 0 }}>
            {i + 1} of {QUESTIONS.length}
          </span>
        </div>

        <div
          style={{
            marginTop: 22,
            background: BG,
            border: "1px solid " + BORDER,
            borderRadius: 18,
            padding: "18px 16px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <KairaMark size={22} />
            <span style={{ fontSize: 15.5, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>
              {q.label}
            </span>
          </div>

          {q.kind === "choice" ? (
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              {q.options.map((o) => (
                <span
                  key={o}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "10px 0",
                    borderRadius: 11,
                    fontSize: 13,
                    fontWeight: 700,
                    background: o === q.answer ? GREEN : BG_ALT,
                    border: "1px solid " + (o === q.answer ? GREEN : BORDER),
                    color: o === q.answer ? "#fff" : MUTED,
                  }}
                >
                  {o}
                </span>
              ))}
            </div>
          ) : (
            /* Drawn as a filled field rather than a live input. Nothing here is
               typed: the answers are staged, and a caret that does not accept a
               keystroke is worse than a field that never claimed to. */
            <div
              style={{
                marginTop: 16,
                padding: "12px 13px",
                borderRadius: 11,
                background: BG_ALT,
                border: "1px solid " + BORDER,
                fontSize: 14,
                fontWeight: 600,
                color: TEXT,
              }}
            >
              {q.answer}
            </div>
          )}
        </div>
      </div>
    </ScoreScreen>
  );
}
