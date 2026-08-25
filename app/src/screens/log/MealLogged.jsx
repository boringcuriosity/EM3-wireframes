import React, { useEffect, useState } from "react";
import { useWF } from "../../state";
import { Check, ArrowUp, Lock } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BG_ALT, BORDER, LINE } from "../../tokens";
import { GOALS, targetsFor, NUTRIENTS } from "../sufficiency/data";
import { byId, totals, DIVISION_LABEL, fmtTime } from "./foods";

const COINS_PER_MEAL = 4;

/* What that meal did. The number counts up rather than appearing, and the bars
   grow from where they were, so the point lands as movement instead of a fact.
   Nothing here is a reward for its own sake: every figure is the meal's. */
export default function MealLogged() {
  const {
    logResult, setLogResult, mealsLogged, suffGoal, suffKcal,
    flipcoins, setFlipcoins, setToast, setEatDetail,
    hasTargets, scoreUnlocked, mainMealsDone,
  } = useWF();

  const [shown, setShown] = useState(logResult.before);
  const [grown, setGrown] = useState(false);

  const goal = GOALS.find((g) => g.id === suffGoal) || GOALS[0];
  const targets = targetsFor(suffGoal, suffKcal ?? goal.kcal);
  const now = totals(mealsLogged);
  const meal = logResult.meal;

  // What this one meal contributed, and where the day sits after it.
  const gave = meal.items.reduce(
    (a, it) => {
      const f = byId(it.id);
      a.p += f.p * it.qty;
      a.c += f.c * it.qty;
      a.f += f.f * it.qty;
      a.fibre += f.fibre * it.qty;
      a.kcal += f.kcal * it.qty;
      return a;
    },
    { p: 0, c: 0, f: 0, fibre: 0, kcal: 0 }
  );

  const rows = [
    { id: "protein", label: "Protein", have: now.p, gain: gave.p },
    { id: "carbs", label: "Carbs", have: now.c, gain: gave.c },
    { id: "fats", label: "Fats", have: now.f, gain: gave.f },
    { id: "fibre", label: "Fibre", have: now.fibre, gain: gave.fibre },
  ].map((r) => {
    const t = targets.find((x) => x.id === r.id).target;
    return { ...r, target: t, pct: Math.min(100, (r.have / t) * 100), was: Math.min(100, ((r.have - r.gain) / t) * 100), tone: NUTRIENTS.find((n) => n.id === r.id).tone };
  });

  // Count the score up to its new value, then let the bars grow.
  useEffect(() => {
    const t0 = setTimeout(() => setGrown(true), 260);
    const span = Math.max(1, logResult.after - logResult.before);
    let i = 0;
    const step = setInterval(() => {
      i += 1;
      setShown(logResult.before + Math.round((span * i) / 24));
      if (i >= 24) clearInterval(step);
    }, 26);
    return () => {
      clearTimeout(t0);
      clearInterval(step);
    };
  }, [logResult]);

  const done = () => {
    setFlipcoins(flipcoins + COINS_PER_MEAL);
    setToast({
      title: "Meal logged",
      line: DIVISION_LABEL[meal.division] + " at " + fmtTime(meal.timeMins),
      coins: COINS_PER_MEAL,
    });
    setLogResult(null);
    setEatDetail(true);
  };


  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {/* The rise */}
        <div
          style={{
            padding: "26px 22px 26px",
            background: BG_ALT,
            borderBottom: "1px solid " + BORDER,
            textAlign: "center",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 999,
              padding: "5px 12px",
              fontSize: 11,
              fontWeight: 700,
              color: MUTED,
              letterSpacing: 0.6,
              marginBottom: 16,
            }}
          >
            <Check size={12} color={GREEN} strokeWidth={3} /> LOGGED
          </span>

          {hasTargets ? (
            <>
              <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
                <div
                  style={{
                    width: 138,
                    height: 150,
                    background: GREEN,
                    clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    filter: scoreUnlocked ? "none" : "blur(9px)",
                    animation: "petalIn .45s ease both",
                    transition: "filter .6s ease",
                  }}
                >
                  <span style={{ fontSize: 42, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                    {shown}%
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: 1.2, opacity: 0.85, marginTop: 3 }}>
                    SUFFICIENCY
                  </span>
                </div>
                {!scoreUnlocked && (
                  <span
                    style={{
                      position: "absolute",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: BG,
                      border: "1px solid " + BORDER,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Lock size={18} color={MUTED} />
                  </span>
                )}
              </div>

              <div style={{ marginTop: 14 }}>
                {scoreUnlocked ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: GREEN,
                      borderRadius: 999,
                      padding: "6px 14px",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    <ArrowUp size={13} color="#fff" strokeWidth={3} />
                    {logResult.after - logResult.before} points from this meal
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: MUTED, lineHeight: 1.55 }}>
                    {mainMealsDone} of 3 main meals in.
                    <br />
                    The score unblurs once the third one lands.
                  </span>
                )}
              </div>
            </>
          ) : (
            /* No targets, so no percentage. The meal is still a fact, and the
               fact is what gets shown. Nothing here asks for anything. */
            <div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: TEXT, lineHeight: 1, letterSpacing: -1 }}>
                  {gave.kcal}
                </span>
                <span style={{ fontSize: 15, color: MUTED }}>kcal</span>
              </div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 7 }}>
                {DIVISION_LABEL[meal.division]} at {fmtTime(meal.timeMins)}
              </div>
            </div>
          )}
        </div>

        {/* What was in it */}
        <div style={{ padding: "20px 22px 0" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.9, marginBottom: 10 }}>
            WHAT WAS IN THIS MEAL
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {meal.items.map((it) => {
              const f = byId(it.id);
              return (
                <span
                  key={it.id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: BG,
                    border: "1px solid " + BORDER,
                    borderRadius: 999,
                    padding: "7px 12px",
                    fontSize: 11.5,
                    color: TEXT,
                  }}
                >
                  {it.qty > 1 && <strong>{it.qty}</strong>} {f.name}
                  <span style={{ color: MUTED }}>{f.kcal * it.qty} kcal</span>
                </span>
              );
            })}
          </div>
          {hasTargets && (
            <div style={{ fontSize: 11, color: MUTED, marginTop: 10 }}>
              {DIVISION_LABEL[meal.division]} at {fmtTime(meal.timeMins)} · {gave.kcal} kcal total
            </div>
          )}
        </div>

        {/* Where the day now stands. With targets that is a bar; without one
            it is four numbers, because a bar with no end means nothing. */}
        <div style={{ padding: "20px 22px 0" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.9, marginBottom: 12 }}>
            {hasTargets ? "WHAT IT ADDED" : "IN THIS MEAL"}
          </div>

          {!hasTargets ? (
            <div style={{ display: "flex", gap: 8 }}>
              {rows.map((r) => (
                <div
                  key={r.id}
                  style={{
                    flex: 1,
                    background: BG_ALT,
                    border: "1px solid " + LINE,
                    borderRadius: 14,
                    padding: "12px 4px 10px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 17, fontWeight: 800, color: TEXT, letterSpacing: -0.3 }}>
                    {Math.round(r.gain)}
                    <span style={{ fontSize: 11, fontWeight: 600, color: MUTED }}>g</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: MUTED, marginTop: 3 }}>{r.label}</div>
                </div>
              ))}
            </div>
          ) : (
            rows.map((r, i) => (
              <div key={r.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT, flex: 1 }}>{r.label}</span>
                  {r.gain > 0 && (
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: GREEN }}>+{r.gain}g</span>
                  )}
                  <span style={{ fontSize: 11, color: MUTED }}>
                    {Math.round(r.have)} of {r.target}g
                  </span>
                </div>
                <div style={{ height: 7, borderRadius: 4, background: "#F2F4F7", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: (grown ? r.pct : r.was) + "%",
                      background: r.tone,
                      borderRadius: 4,
                      transition: "width .9s cubic-bezier(.32,.72,0,1) " + i * 0.08 + "s",
                    }}
                  />
                </div>
              </div>
            ))
          )}

          {!hasTargets && (
            <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.5, marginTop: 11 }}>
              Today so far: {Math.round(now.p)}g protein, {Math.round(now.c)}g carbs,{" "}
              {Math.round(now.f)}g fats, {Math.round(now.fibre)}g fibre.
            </div>
          )}
        </div>

        {/* What happens next */}
        {hasTargets && (
        <div style={{ padding: "8px 22px 24px" }}>
          <div
            style={{
              display: "flex",
              gap: 11,
              background: BG_ALT,
              border: "1px solid " + BORDER,
              borderRadius: 14,
              padding: "13px 14px",
            }}
          >
            <span
              style={{
                width: 22,
                height: 24,
                flexShrink: 0,
                background: GREEN,
                clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              K
            </span>
            <span style={{ fontSize: 12, color: TEXT, lineHeight: 1.6 }}>
              {!hasTargets ? (
                <>
                  Logged either way, and your coach can see it. Set up your targets and every meal
                  after this one starts building a real score.
                </>
              ) : scoreUnlocked ? (
                <>
                  All 3 main meals are in, so today's score is a real one. Anything else you log
                  today still counts towards it.
                </>
              ) : (
                <>
                  That is {mainMealsDone} of your 3 main meals. A percentage from half a day would
                  read worse than your day actually is, so I am holding it until the third one.
                </>
              )}
            </span>
          </div>
        </div>
        )}

      </div>

      <div style={{ flexShrink: 0, padding: "12px 22px 26px", borderTop: "1px solid " + BORDER }}>
        <button
          onClick={done}
          style={{
            width: "100%",
            background: GREEN,
            border: "none",
            borderRadius: 14,
            padding: "14px 0",
            color: "#fff",
            fontSize: 14.5,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
