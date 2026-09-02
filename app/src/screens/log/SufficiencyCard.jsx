import React from "react";
import { useWF } from "../../state";
import { Info, Lock } from "lucide-react";
import { GREEN, GREEN_DEEP, GREEN_WASH, GREEN_TINT, TEXT, MUTED, BG, BORDER, SH } from "../../tokens";
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
    liveScore, scoreUnlocked, mealsIn, mealSlots, mealsLeft, mealsLogged, weakestMacro, setPillarInfo,
  } = useWF();


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
          {/* The count, then what logging the rest does to it. The score is
              honest about being partial by saying how much of the day it has
              read, rather than by hiding until the day is over. */}
          <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginTop: 4 }}>
            {scoreUnlocked ? (
              <>
                {mealsIn} of {mealSlots} meals logged.{" "}
                {mealsLeft > 0
                  ? "Your sufficiency increases as you log the rest of your meals."
                  : "That is your whole day read."}
              </>
            ) : (
              <>Your targets are set. Log your first meal and today's score appears here.</>
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


      {/* The one thing worth doing something about, named. Sufficiency is the
          mean of four capped ratios, so the lowest of them is arithmetically
          the biggest gap there is, and a nutrient named without its mechanism
          is a scold rather than a reason. */}
      {weakestMacro && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 9,
            background: GREEN_WASH,
            border: "1px solid " + GREEN_TINT,
            borderRadius: 13,
            padding: "10px 12px",
            marginTop: 14,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 18,
              height: 19.6,
              flexShrink: 0,
              marginTop: 1,
              background: "linear-gradient(150deg, " + GREEN + " 0%, " + GREEN_DEEP + " 100%)",
              clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
            }}
          />
          <span style={{ fontSize: 11.5, color: TEXT, lineHeight: 1.5 }}>
            <strong>{weakestMacro.label}</strong> is the one furthest from where it should be, at{" "}
            {weakestMacro.have}g of {weakestMacro.target}g. It is {weakestMacro.why}.
          </span>
        </div>
      )}

      {/* Macros are always readable. Grams do not need permission. */}
      <div style={{ marginTop: 16 }}>
        <MacroRings />
      </div>

    </div>
  );
}
