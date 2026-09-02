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

/* The beat between pressing the button and the answer.

   It says what is being worked out rather than spinning silently, because the
   wait is short and a label makes it read as work rather than as lag. */
function Working({ label, edited }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        background: BG,
        minHeight: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: "2.5px solid " + LINE,
          borderTopColor: GREEN,
          animation: "spin .7s linear infinite",
        }}
      />
      <span role="status" style={{ fontSize: 13.5, color: MUTED }}>
        {edited ? "Updating your " + label.toLowerCase() : "Working out what that did"}
      </span>
    </div>
  );
}

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
    hasTargets, scoreUnlocked, mealsIn, mealSlots, mealsLeft, dayTotals, kcalTarget, editMeal,
  } = useWF();

  const [shown, setShown] = useState(logResult ? logResult.before : 0);
  /* A beat before the answer. A screen that resolves the instant you press the
     button reads as a form submitting; the same screen after a moment of work
     reads as something having been worked out. It is short on purpose: long
     enough to feel like an answer, short enough that nobody waits for it. */
  /* Only a result that has just been committed gets the beat. A result staged
     from the panel is somebody wanting to look at the screen, and making them
     watch a spinner first would be a wait with nothing behind it. It also
     keeps the smoke test rendering the body rather than the spinner.

     Initialised rather than set inside the effect, because editing clears the
     result and reopens the logger, so this screen unmounts between meals and
     never has to reset itself while it is up. */
  const [working, setWorking] = useState(!!(logResult && logResult.fresh));
  useEffect(() => {
    if (!working) return;
    const t = setTimeout(() => setWorking(false), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Counted up rather than printed. A number that arrives already correct is a
     result; one that climbs is something you did. */
  useEffect(() => {
    if (!logResult || working) return;
    const span = Math.max(1, logResult.after - logResult.before);
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setShown(logResult.before + Math.round((span * i) / 24));
      if (i >= 24) clearInterval(t);
    }, 26);
    return () => clearInterval(t);
  }, [logResult, working]);

  if (!logResult) return null;
  const meal = logResult.meal;
  const label = DIVISION_LABEL[meal.division];

  if (working) return <Working label={label} edited={logResult.edited} />;


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
          {/* The moment, drawn rather than stated. A tick in a ring that pops
              in is the difference between a screen confirming a form and a
              screen telling somebody they did a thing. */}
          <span
            aria-hidden
            style={{
              display: "inline-flex",
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: GREEN,
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 7px " + GREEN + "1A",
              animation: "taskPop .5s cubic-bezier(.32,.72,0,1) both",
            }}
          >
            <Check size={24} color="#fff" strokeWidth={3} />
          </span>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              color: TEXT,
              marginTop: 12,
              lineHeight: 1.25,
              animation: "riseIn .45s cubic-bezier(.32,.72,0,1) .12s both",
            }}
          >
            {label} {logResult.edited ? "updated" : "logged"}
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: MUTED,
              marginTop: 3,
              animation: "riseIn .45s cubic-bezier(.32,.72,0,1) .18s both",
            }}
          >
            at {fmtTime(meal.timeMins)}
          </div>

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
                  {mealsIn} of {mealSlots} meals logged.{" "}
                  {mealsLeft > 0
                    ? "Your sufficiency climbs with each one you add, so this is where it stands so far."
                    : "That is the whole day, so this is where it lands."}
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
                    {Array.from({ length: mealSlots }, (_, i) => (
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
                    Log a meal to open your score
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

      <div style={{ flexShrink: 0, borderTop: "1px solid " + LINE, padding: "12px 22px 24px", display: "flex", gap: 10 }}>
        {/* The way back into what was just recorded. A meal is a guess about
            portions half the time, and the moment somebody is most likely to
            want to fix one is while they are still looking at it. */}
        <button
          onClick={() => editMeal(meal.division)}
          style={{
            flexShrink: 0,
            height: 50,
            background: BG,
            border: "1px solid " + BORDER,
            borderRadius: 14,
            padding: "0 18px",
            fontSize: 14.5,
            fontWeight: 700,
            color: TEXT,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Edit
        </button>
        <button
          onClick={done}
          style={{
            flex: 1,
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
