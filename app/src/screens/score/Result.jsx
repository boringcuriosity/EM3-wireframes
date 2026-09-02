import React from "react";
import { useWF } from "../../state";
import { Lock, AlertTriangle } from "lucide-react";
import { ScoreScreen } from "./parts";
import { Cta, KairaMark } from "../sufficiency/parts";
import CtaArrow from "../../components/CtaArrow";
import {
  GREEN, GREEN_DEEP, TEXT, MUTED, FAINT, BG, BG_ALT, BORDER, LINE, WARN, WARN_TINT, WARN_LINE,
} from "../../tokens";

/* The number, and the quarter of it that is missing.

   277 out of 400 is not a bad score, it is an incomplete one, and those two
   read identically if the screen only prints the figure. So the total carries
   the reason next to it, the shut quarter is drawn shut rather than left out,
   and the way to open it is the same lab test the day is already asking for.
   One prerequisite, not two. */
export default function Result() {
  const {
    setScoreFlow, SUB_SCORES, metabolicScore, nextDone, setNextDone, setActiveTab, firstName,
  } = useWF();

  const shut = SUB_SCORES.filter((s) => s.value === null);

  const finish = () => {
    if (!nextDone.includes("score")) setNextDone(nextDone.concat("score"));
    setScoreFlow(null);
    setActiveTab("track");
  };

  return (
    <ScoreScreen step="result" footer={<Cta onClick={finish}>Back to my day</Cta>}>
      <div style={{ padding: "0 22px 26px" }}>
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
          {firstName ? "Nicely done, " + firstName + "." : "Nicely done."}
        </h1>

        {/* The figure, with what it is out of and what is missing from it. */}
        <div
          style={{
            marginTop: 16,
            padding: "20px 16px 18px",
            borderRadius: 20,
            background: BG_ALT,
            border: "1px solid " + BORDER,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 0.5 }}>
            YOUR METABOLIC SCORE
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: TEXT,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              marginTop: 4,
            }}
          >
            {metabolicScore}
            <span style={{ fontSize: 20, fontWeight: 700, color: FAINT }}> / 400</span>
          </div>

          {shut.length > 0 && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                marginTop: 12,
                padding: "7px 11px",
                borderRadius: 999,
                background: WARN_TINT,
                border: "1px solid " + WARN_LINE,
                fontSize: 11.5,
                fontWeight: 600,
                color: WARN,
                textAlign: "left",
                lineHeight: 1.4,
              }}
            >
              <AlertTriangle size={13} strokeWidth={2.4} style={{ flexShrink: 0 }} />
              Not the whole picture yet: {shut.length} of 4 parts still shut
            </div>
          )}
        </div>

        {/* The four parts. The shut one keeps its place rather than being left
            out, so the total is visibly three quarters of something. */}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {SUB_SCORES.map((s) => (
            <div
              key={s.id}
              style={{
                flex: 1,
                minWidth: 0,
                textAlign: "center",
                padding: "12px 4px 11px",
                borderRadius: 14,
                background: s.value === null ? BG : s.tone + "14",
                border: "1px solid " + (s.value === null ? BORDER : s.tone + "33"),
              }}
            >
              {s.value === null ? (
                <Lock size={16} color={FAINT} strokeWidth={2.4} />
              ) : (
                <div style={{ fontSize: 21, fontWeight: 800, color: s.tone, lineHeight: 1 }}>
                  {s.value}
                </div>
              )}
              <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, marginTop: 6, lineHeight: 1.3 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Kaira reads it rather than repeating it. */}
        <div
          style={{
            display: "flex",
            gap: 11,
            marginTop: 14,
            padding: "13px 14px",
            background: BG_ALT,
            border: "1px solid " + LINE,
            borderRadius: 16,
          }}
        >
          <KairaMark size={24} />
          <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.55 }}>
            Your habits and how you feel are both strong, so the groundwork is there. What nobody
            can see yet is what your blood is doing, and that is the part a coach plans around.
          </div>
        </div>

        {/* The one shut quarter, and the one thing that opens it. This is the
            same lab test the day already asks for, so finishing it here
            finishes it there. */}
        {shut.length > 0 && (
          <div
            style={{
              marginTop: 12,
              padding: "14px 15px",
              borderRadius: 16,
              background: BG,
              border: "1px solid " + GREEN + "33",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>
              Open your Diagnostic score
            </div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 4, lineHeight: 1.5 }}>
              A blood test at home. It is the last quarter of the score, and the one your coach
              reads first.
            </div>
            <button
              onClick={() => {
                setScoreFlow(null);
                setActiveTab("care");
              }}
              style={{
                marginTop: 12,
                display: "inline-flex",
                alignItems: "center",
                background: GREEN,
                border: "none",
                borderRadius: 999,
                padding: "8px 15px",
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 2px 0 " + GREEN_DEEP,
              }}
            >
              Book diagnostics<CtaArrow size={14} />
            </button>
          </div>
        )}
      </div>
    </ScoreScreen>
  );
}
