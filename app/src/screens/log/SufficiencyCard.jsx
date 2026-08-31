import React from "react";
import { useWF } from "../../state";
import { Info, Lock } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BORDER, SH } from "../../tokens";
import MacroRings from "../../components/MacroRings";

/* The hero on Eat, once targets exist. The number is real from the first meal,
   but stays blurred until three are in, because a percentage of a day you have
   only half told me about invites the wrong conclusion. Macros are never
   hidden: grams are true whatever the day looks like.

   Any three slots, not breakfast, lunch and dinner in particular. Naming which
   ones were missing told somebody whose day runs on a pre-breakfast tea and a
   late snack that their real meals did not count. */

export default function SufficiencyCard() {
  const {
    liveScore, scoreUnlocked, mealsIn, mealsLogged, setPillarInfo,
  } = useWF();

  const left = Math.max(0, 3 - mealsIn);
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
              <>Three meals are in, so this is a real read of your day.</>
            ) : anyLogged ? (
              <>
                {mealsIn} of 3 meals in. Log {left} more to reveal today's score.
              </>
            ) : (
              <>Your targets are set. Log three meals and today's score appears here.</>
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

      {/* Three meals, counted rather than named. Naming them told somebody
          whose day runs on a tea and two snacks that their real meals were the
          wrong ones. */}
      {!scoreUnlocked && (
        <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                background: i < mealsIn ? GREEN : "transparent",
                border: "1px solid " + (i < mealsIn ? GREEN : BORDER),
                transition: "background .45s cubic-bezier(.32,.72,0,1) " + i * 0.08 + "s",
              }}
            />
          ))}
        </div>
      )}

      {/* Macros are always readable. Grams do not need permission. */}
      <div style={{ marginTop: 16 }}>
        <MacroRings />
      </div>

    </div>
  );
}
