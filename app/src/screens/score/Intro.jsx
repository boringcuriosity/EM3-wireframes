import React from "react";
import { useWF } from "../../state";
import { Lock } from "lucide-react";
import { ScoreScreen } from "./parts";
import { Cta, KairaMark } from "../sufficiency/parts";
import { TEXT, MUTED, FAINT, BG, BG_ALT, BORDER, LINE } from "../../tokens";

/* What the score is, before any of it is asked for.

   Four parts, named up front, and one of them is a lab test somebody has to
   book. Saying so here is the point: a score that turns out at the end to have
   been a quarter missing all along reads as a bait, and the part that is
   missing is the part that costs money. */
export default function Intro() {
  const { setScoreFlow, SUB_SCORES, firstName } = useWF();

  return (
    <ScoreScreen
      step="intro"
      onBack={() => setScoreFlow(null)}
      footer={<Cta onClick={() => setScoreFlow("focus")}>Get my metabolic score</Cta>}
    >
      <div style={{ padding: "4px 22px 24px" }}>
        <div
          style={{
            display: "flex",
            gap: 11,
            padding: "13px 14px",
            background: BG_ALT,
            border: "1px solid " + BORDER,
            borderRadius: 16,
          }}
        >
          <KairaMark size={26} />
          <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.55 }}>
            {firstName ? firstName + ", the" : "The"} first thing your coaches read is where you
            are starting from. This is that.
          </div>
        </div>

        <h1
          style={{
            margin: "26px 0 0",
            fontSize: 26,
            fontWeight: 800,
            color: TEXT,
            letterSpacing: -0.5,
            lineHeight: 1.2,
          }}
        >
          Your metabolic score
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: 13.5, color: MUTED, lineHeight: 1.6 }}>
          One number for how your metabolism is doing today, out of 400. It is made of four parts,
          and you can open three of them right now.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
          {SUB_SCORES.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "12px 13px",
                background: BG,
                border: "1px solid " + (s.value === null ? BORDER : LINE),
                borderRadius: 14,
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  flexShrink: 0,
                  background: s.tone + "1F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {s.value === null ? (
                  <Lock size={14} color={FAINT} strokeWidth={2.4} />
                ) : (
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: s.tone }} />
                )}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: TEXT }}>
                  {s.label} score
                </span>
                <span style={{ display: "block", fontSize: 11.5, color: MUTED, marginTop: 1 }}>
                  {SUB_LINES[s.id]}
                </span>
              </span>
              {s.value === null && (
                <span style={{ fontSize: 10.5, fontWeight: 700, color: FAINT, flexShrink: 0 }}>
                  Needs a test
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </ScoreScreen>
  );
}

const SUB_LINES = {
  profile: "Your age, size and family history.",
  wellness: "How you sleep, move and feel.",
  habit: "What a normal week actually looks like.",
  diagnostic: "Bloodwork. It opens once a lab test comes back.",
};
