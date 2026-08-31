import React, { useEffect, useState } from "react";
import { useWF } from "../../state";
import { Check, Lock } from "lucide-react";
import MacroRings from "../../components/MacroRings";
import CaloriesStrip from "../../components/CaloriesStrip";
import { byId, DIVISION_LABEL, fmtTime } from "./foods";
import {
  GREEN, GREEN_DEEP, TEXT, MUTED, FAINT, BG, BG_ALT, BORDER, LINE, RULE,
} from "../../tokens";

const COINS_PER_MEAL = 4;

/* What that meal did, in four beats and nothing else.

   It used to say the same day in five ways: a score, a line under it counting
   meals, a per macro delta beside a per macro total, and a Kaira card at the
   bottom explaining the lock a second time. The screen after logging a meal was
   longer than the screen that logged it.

   Four things now, in the order somebody wants them:

     1. which meal landed and when
     2. the score, or the count of meals that opens it, under the same hexagon
     3. the four macros and the day's calories
     4. what was actually in the meal

   The bar goes once the score is real, because the score is the answer and a
   full bar beside it is the question restated. */
export default function MealLogged() {
  const {
    logResult, setLogResult, flipcoins, setFlipcoins, setToast, setEatDetail, logReturn,
    hasTargets, scoreUnlocked, mealsIn, dayTotals, kcalTarget,
  } = useWF();

  const [shown, setShown] = useState(logResult ? logResult.before : 0);

  /* Counted up rather than printed. A number that arrives already correct is a
     result; one that climbs is something you did. */
  useEffect(() => {
    if (!logResult) return;
    const span = Math.max(1, logResult.after - logResult.before);
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setShown(logResult.before + Math.round((span * i) / 24));
      if (i >= 24) clearInterval(t);
    }, 26);
    return () => clearInterval(t);
  }, [logResult]);

  if (!logResult) return null;
  const meal = logResult.meal;
  const left = Math.max(0, 3 - mealsIn);

  const done = () => {
    setFlipcoins(flipcoins + COINS_PER_MEAL);
    setToast({
      title: "Meal logged",
      line: DIVISION_LABEL[meal.division] + " at " + fmtTime(meal.timeMins),
      coins: COINS_PER_MEAL,
    });
    setLogResult(null);
    if (logReturn === "eat") setEatDetail(true);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {/* 1. It landed. */}
        <div
          style={{
            padding: hasTargets ? "24px 22px 26px" : "24px 22px 22px",
            background: BG_ALT,
            borderBottom: "1px solid " + BORDER,
            textAlign: "center",
          }}
        >
          {/* Which meal and when, said once. It was a caps badge reading MEAL
              LOGGED with the same fact repeated as a line under the food, so
              the badge became the sentence and the line went. */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 999,
              padding: "6px 14px 6px 11px",
              fontSize: 12.5,
              fontWeight: 700,
              color: TEXT,
            }}
          >
            <Check size={13} color={GREEN} strokeWidth={3} />
            {DIVISION_LABEL[meal.division]} logged at {fmtTime(meal.timeMins)}
          </span>

          {/* The score, or the reason there is not one yet. Without targets no
              hexagon appears at all: a locked one would promise that meals
              unlock it, and what unlocks it is targets. */}
          {hasTargets && (
            <>
              <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
                <div
                  style={{
                    position: "relative",
                    width: 132,
                    height: 144,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(150deg, " + GREEN + " 0%, " + GREEN_DEEP + " 100%)",
                      clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                      filter: scoreUnlocked ? "none" : "blur(10px)",
                      animation: "popIn .5s cubic-bezier(.32,.72,0,1) both",
                      transition: "filter .7s ease",
                    }}
                  />
                  {scoreUnlocked ? (
                    <span style={{ position: "relative", textAlign: "center" }}>
                      <span style={{ display: "block", fontSize: 40, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                        {shown}%
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: 8.5,
                          fontWeight: 700,
                          color: "#fff",
                          letterSpacing: 1.2,
                          opacity: 0.85,
                          marginTop: 4,
                        }}
                      >
                        SUFFICIENCY
                      </span>
                    </span>
                  ) : (
                    <span
                      style={{
                        position: "relative",
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: BG,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Lock size={18} color={GREEN_DEEP} strokeWidth={2.4} />
                    </span>
                  )}
                </div>
              </div>

              {/* One slot under the hexagon, two states. Locked, it is the
                  count that opens it; unlocked, it is what the number means.
                  The card used to sit below the macros, which put the
                  explanation of the lock two sections away from the lock. */}
              {scoreUnlocked ? (
                <div style={{ fontSize: 12.5, color: MUTED, marginTop: 14, lineHeight: 1.55 }}>
                  Three meals in, so your score is ready. Log the rest of the day to see where it
                  really lands.
                </div>
              ) : (
                <div
                  style={{
                    background: BG,
                    border: "1px solid " + GREEN + "26",
                    borderRadius: 16,
                    padding: "13px 14px",
                    marginTop: 16,
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", gap: 6 }}>
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          flex: 1,
                          height: 6,
                          borderRadius: 3,
                          background: i < mealsIn ? GREEN : BG_ALT,
                          border: "1px solid " + (i < mealsIn ? GREEN : RULE),
                          transition: "background .45s cubic-bezier(.32,.72,0,1) " + i * 0.08 + "s",
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: 12.5, color: TEXT, fontWeight: 700, marginTop: 11 }}>
                    {left === 1 ? "One more meal" : left + " more meals"} to unlock your score
                  </div>
                  <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginTop: 3 }}>
                    Any meal counts, whichever ones your day is made of.
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 3. The four macros and the day's calories. Rings and a bar against a
               coach's targets, plain numbers without one, which MacroRings and
               CaloriesStrip already decide for themselves. */}
        <div style={{ padding: "20px 22px 0" }}>
          <Label>Where your day stands</Label>
          <div
            style={{
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 18,
              padding: "16px 12px",
            }}
          >
            <MacroRings />
          </div>

          <div style={{ marginTop: 10 }}>
            <CaloriesStrip kcal={dayTotals.kcal} target={hasTargets ? kcalTarget : null} />
          </div>
        </div>

        {/* 4. What was actually in it. */}
        <div style={{ padding: "20px 22px 20px" }}>
          <Label>What you logged</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {meal.items.map((it) => {
              const food = byId(it.id);
              if (!food) return null;
              return (
                <span
                  key={it.id}
                  style={{
                    display: "inline-flex",
                    alignItems: "baseline",
                    gap: 6,
                    background: BG,
                    border: "1px solid " + BORDER,
                    borderRadius: 999,
                    padding: "7px 12px",
                    fontSize: 12,
                    color: TEXT,
                  }}
                >
                  {/* The food, not the portion. qtyLabel says "2 x 1 piece",
                      which is the helping rather than the thing eaten. */}
                  <span style={{ fontWeight: 600 }}>
                    {it.qty > 1 ? it.qty + " " : ""}
                    {food.name}
                  </span>
                  <span style={{ fontSize: 10.5, color: FAINT }}>
                    {Math.round(food.kcal * it.qty)} kcal
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ flexShrink: 0, borderTop: "1px solid " + LINE, padding: "12px 22px 24px" }}>
        <button
          onClick={done}
          style={{
            width: "100%",
            height: 50,
            background: GREEN,
            border: "none",
            borderRadius: 14,
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 2px 0 " + GREEN_DEEP,
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.9,
        textTransform: "uppercase",
        color: FAINT,
        marginBottom: 9,
      }}
    >
      {children}
    </div>
  );
}
