import React from "react";
import { useWF } from "../../state";
import { Info, Lock } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BG_ALT, BORDER, SH } from "../../tokens";
import { DIVISION_LABEL } from "./foods";
import MacroRings from "../../components/MacroRings";

/* The hero on Eat, once targets exist. The number is real from the first meal,
   but stays blurred until all three main meals are in, because a percentage of
   a day you have only half told me about invites the wrong conclusion. Macros
   are never hidden: grams are true whatever the day looks like. */

const MAIN = ["breakfast", "lunch", "dinner"];

export default function SufficiencyCard() {
  const {
    liveScore, scoreUnlocked, mainMealsDone, mealsLogged, setPillarInfo,
  } = useWF();

  const missing = MAIN.filter((d) => !mealsLogged.some((m) => m.division === d));
  const anyLogged = mealsLogged.length > 0;

  return (
    <div
      style={{
        background: BG,
        border: "1px solid " + BORDER,
        borderRadius: 20,
        padding: 18,
        boxShadow: SH,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* The score, legible only once the day is */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: 66,
              height: 72,
              background: GREEN,
              clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              filter: scoreUnlocked ? "none" : "blur(6px)",
              transition: "filter .6s ease",
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
              {liveScore}
              <span style={{ fontSize: 11 }}>%</span>
            </span>
            <span style={{ fontSize: 7, letterSpacing: 1, color: "#fff", marginTop: 3, opacity: 0.85 }}>
              SUFFICIENT
            </span>
          </div>
          {!scoreUnlocked && (
            <span
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: BG,
                border: "1px solid " + BORDER,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lock size={13} color={MUTED} />
            </span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>
            {scoreUnlocked ? "Today's sufficiency" : anyLogged ? "Today so far" : "Nothing logged yet"}
          </div>
          <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginTop: 4 }}>
            {scoreUnlocked ? (
              <>All 3 main meals are in, so this is a real read of your day.</>
            ) : anyLogged ? (
              <>
                {mainMealsDone} of 3 main meals. Log{" "}
                {missing.map((d) => DIVISION_LABEL[d].toLowerCase()).join(" and ")} to reveal today's
                score.
              </>
            ) : (
              <>Your targets are set. Log your 3 main meals and today's score appears here.</>
            )}
          </div>
        </div>

        <button
          onClick={() => setPillarInfo("eat")}
          aria-label="What is sufficiency?"
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            flexShrink: 0,
            background: BG,
            border: "1px solid " + BORDER,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <Info size={14} color={MUTED} strokeWidth={2} />
        </button>
      </div>

      {/* Progress towards each main meal */}
      {!scoreUnlocked && (
        <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
          {MAIN.map((d) => {
            const done = mealsLogged.some((m) => m.division === d);
            return (
              <span
                key={d}
                style={{
                  flex: 1,
                  textAlign: "center",
                  background: done ? BG_ALT : "transparent",
                  border: "1px " + (done ? "solid " + GREEN : "dashed " + BORDER),
                  borderRadius: 999,
                  padding: "5px 0",
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: done ? TEXT : MUTED,
                }}
              >
                {DIVISION_LABEL[d]}
              </span>
            );
          })}
        </div>
      )}

      {/* Macros are always readable. Grams do not need permission. */}
      <div style={{ marginTop: 16 }}>
        <MacroRings />
      </div>

    </div>
  );
}
