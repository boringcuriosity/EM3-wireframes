import React, { useState, useEffect } from "react";
import { useWF } from "../../state";
import { Check, Flame } from "lucide-react";
import { byId, logBurn, dayBurn, dayMinutes, ROUTINES, COACH_ROUTINE } from "./exercises";
import KairaMark from "../../components/KairaMark";
import { fmtTime } from "../log/foods";
import CtaArrow from "../../components/CtaArrow";
import {
  GREEN, GREEN_DEEP, TEXT, MUTED, FAINT, BG, BG_ALT, BORDER, LINE, PILLAR,
} from "../../tokens";

const COINS = 2;

/* A moment of work before the answer.

   A screen that resolves the instant you press the button reads as a form
   submitting; the same screen after a beat reads as something having been
   worked out. Eat has had this since the beginning and Move landed straight on
   its result, which made the number look printed rather than calculated.

   Only a result that has just been committed gets it. One staged from the
   panel is somebody wanting to look at the screen, and making them watch a
   spinner first is a wait with nothing behind it. It also keeps the smoke test
   rendering the body rather than the spinner. */
function Working() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: BG,
        minHeight: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          border: "3px solid " + LINE,
          borderTopColor: PILLAR.move.c,
          animation: "spin .7s linear infinite",
        }}
      />
      <span role="status" style={{ fontSize: 13.5, color: MUTED }}>
        Logging your workout
      </span>
    </div>
  );
}

/* What that session did, on the same beat as a meal.

   Eat has counted its score up on a screen of its own since the beginning, and
   Move finished on a toast. So the two pillars ended the same act differently:
   one made something of it, the other mentioned it. This is the other half.

   Four beats, the same four: the rise, what was in it, where the day stands
   now, and what happens next.

   THE NUMBER THAT MOVES IS MOMENTUM, not minutes. It counted minutes against a
   goal of twenty for a while, which meant the screen that should have said
   what the session was worth instead reported a stopwatch: a person finished
   their coach's half hour, watched "30 minutes" arrive, and learned nothing
   about the day. Momentum is what the pillar is scored on, so it is what the
   act of logging should move, the same way a meal moves sufficiency.

   The bars underneath are the same two the hero carries, and they are the
   reason a low number does not read as a verdict: one says how much of the
   plan is in, the other says how much of the day it is spread across. */
export default function MoveLogged() {
  const {
    moveResult, setMoveResult, setMoveDetail, moveReturn, exLogs, flipcoins, setFlipcoins, setToast,
    momentum, momentumParts: m,
  } = useWF();

  /* Read live rather than carried in the result. By the time this draws, the
     log is in state and Momentum has been worked out from it, so the screen
     and the pillar can never disagree about what just happened. */
  const after = momentum;

  const [shown, setShown] = useState(moveResult ? moveResult.before : 0);
  const [working, setWorking] = useState(!!(moveResult && moveResult.fresh));
  useEffect(() => {
    if (!working) return;
    const t = setTimeout(() => setWorking(false), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Counted up rather than printed. A number that arrives already correct is a
     result; one that climbs is something you did. */
  useEffect(() => {
    if (!moveResult || working) return;
    /* The distance travelled, which is allowed to be nothing. Flooring the
       span at one so the animation always has something to do lands in the
       printed figure, and the screen finishes a point above what the pillar
       shows for the same day. */
    const span = after - moveResult.before;
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setShown(i >= 24 ? after : moveResult.before + Math.round((span * i) / 24));
      if (i >= 24) clearInterval(t);
    }, 26);
    return () => clearInterval(t);
  }, [moveResult, after, working]);

  if (!moveResult) return null;
  if (working) return <Working />;
  const { entry, count, total } = moveResult;
  const ex = byId(entry.id);
  // Either of the coach's plans, so the morning stretch gets the same beats.
  const isRoutine = !!ROUTINES[entry.id];
  const kcal = logBurn(entry);
  const pct = Math.min(100, shown);
  const gained = after - moveResult.before;

  /* What she says back. Good work first, because somebody who has just finished
     a session should not be met with a list, and then the one thing worth doing
     next. Spread is named where it applies rather than as a general rule: after
     a workout the small movements are the whole of what is left to spread. */
  const neatLeft = m.neat.length - m.neatDone;
  const stepsShort = m.goal ? Math.max(0, m.goal - Math.round(m.steps * m.goal)) : 0;
  const said =
    after >= 100
      ? "Good work. That is your whole plan in, and nothing is left to chase today."
      : neatLeft > 0
      ? "Good work on that. Your " + (neatLeft === 1 ? "last small move is" : neatLeft + " small moves are") +
        " still open, and landing them in different parts of the day lifts Momentum further than another workout would."
      : stepsShort > 0
      ? "Good work on that. You are " + stepsShort.toLocaleString("en-IN") +
        " steps short of your goal, which is the biggest thing left today."
      : "Good work on that.";

  const done = () => {
    setFlipcoins(flipcoins + COINS);
    setToast({
      title: "Movement logged",
      line: ex.name + " · " + entry.minutes + " min · about " + kcal + " kcal",
      coins: COINS,
    });
    setMoveResult(null);
    // Back where the logger was opened from, never onto a screen nobody asked
    // for. Somebody who tapped the session row on their day wants the day back.
    if (moveReturn === "move") setMoveDetail(true);
  };

  const c = PILLAR.move.c;
  const R = 62;
  const C = 2 * Math.PI * R;

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

          {/* A ring rather than Eat's hexagon. Momentum is a fraction of a
              plan, and a ring is what the rest of Move already draws a
              fraction with. */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative", width: 150, height: 150 }}>
              <svg width="150" height="150" viewBox="0 0 150 150" aria-hidden>
                <circle cx="75" cy="75" r={R} fill="none" stroke={LINE} strokeWidth="11" />
                <circle
                  cx="75"
                  cy="75"
                  r={R}
                  fill="none"
                  stroke={c}
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - pct / 100)}
                  transform="rotate(-90 75 75)"
                  style={{ transition: "stroke-dashoffset .1s linear" }}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 44, fontWeight: 800, color: TEXT, lineHeight: 1, letterSpacing: -1 }}>
                  {shown}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 1.1, marginTop: 4 }}>
                  MOMENTUM
                </span>
              </div>
            </div>
          </div>

          {/* What the session was worth, and how much of the plan is in.

              NO WEIGHTS AND NO SCIENCE HERE. The parts of the day carry
              numbers on them, 15 through 35, and printing that table under a
              number somebody has just earned turns a result into a marking
              scheme: they came here to find out what they did, not to be shown
              how it was graded. The mechanism, the trial and the HbA1c figure
              belong on the pillar's own card, where somebody is reading about
              the score rather than collecting one. This screen says what
              landed and what is left, in that order, and stops. */}
          <div style={{ fontSize: 13, color: TEXT, marginTop: 16, lineHeight: 1.5 }}>
            <strong>+{gained} Momentum</strong> from this workout
          </div>

          {/* Kaira, rather than a bar and a tally.

              There were six segments here and a line counting what was left,
              which is the day's admin restated on the one screen that exists to
              say what a thing was worth. She takes the room instead: what was
              just done, and then the one thing that would move the number
              furthest, which on Move is nearly always spreading it rather than
              adding to it. */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              textAlign: "left",
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 14,
              padding: "12px 13px",
              marginTop: 18,
            }}
          >
            <span style={{ flexShrink: 0, marginTop: 1 }}>
              <KairaMark size={18} />
            </span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: TEXT, lineHeight: 1.55 }}>
              {said}
            </span>
          </div>
        </div>

        {/* What was in it */}
        <div style={{ padding: "20px 22px 0" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 10 }}>
            What you did
          </div>
          <div
            style={{
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 16,
              padding: "13px 15px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: PILLAR.move.t, display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <Flame size={16} color={c} strokeWidth={2} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: TEXT }}>
                  {ex.name}
                </span>
                <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2 }}>
                  {entry.minutes} min · {fmtTime(entry.timeMins)}
                </span>
              </span>
              <span style={{ textAlign: "right", flexShrink: 0 }}>
                <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: TEXT }}>{kcal}</span>
                <span style={{ display: "block", fontSize: 9.5, color: MUTED }}>kcal</span>
              </span>
            </div>

            {/* The session named its parts on the way in, so it names them on
                the way out too. */}
            {isRoutine && (
              <div style={{ marginTop: 11, paddingTop: 11, borderTop: "1px solid " + LINE }}>
                {(ROUTINES[entry.id] || COACH_ROUTINE).items.map((it, i) => (
                  <div
                    key={it.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: i === 0 ? 0 : 7,
                    }}
                  >
                    <Check size={12} color={i < (count ?? total) ? c : FAINT} strokeWidth={3} />
                    <span style={{ fontSize: 12, color: i < (count ?? total) ? TEXT : FAINT }}>
                      {it.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Where the day now stands. It carries the foot of the scroll now
            that the coach's read on how it felt has gone, so it brings its own
            bottom padding rather than borrowing the next block's. */}
        <div style={{ padding: "20px 22px 22px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 10 }}>Today so far</div>
          <div
            style={{
              display: "flex",
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 16,
              padding: "14px 0",
            }}
          >
            {/* Minutes still belong here, as a reading rather than as the
                score. `after` is Momentum now, and printing it under a label
                saying Minutes had a twenty minute session reporting thirty
                nine minutes: the same figure meaning two different things two
                inches apart. */}
            {[
              { v: dayMinutes(exLogs), l: "Minutes" },
              { v: dayBurn(exLogs), l: "kcal burnt" },
              { v: exLogs.length, l: exLogs.length === 1 ? "Workout" : "Workouts" },
            ].map((x, i) => (
              <div
                key={x.l}
                style={{
                  flex: 1,
                  textAlign: "center",
                  borderLeft: i ? "1px solid " + LINE : "none",
                }}
              >
                <div style={{ fontSize: 19, fontWeight: 800, color: TEXT, lineHeight: 1.1 }}>{x.v}</div>
                <div style={{ fontSize: 10.5, color: MUTED, marginTop: 3 }}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div style={{ flexShrink: 0, borderTop: "1px solid " + BORDER, padding: "12px 22px 24px" }}>
        <button
          onClick={done}
          style={{
            width: "100%",
            background: GREEN,
            border: "none",
            borderRadius: 14,
            padding: "15px 0",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 2px 0 " + GREEN_DEEP,
          }}
        >
          Done
          <CtaArrow size={16} />
        </button>
      </div>
    </div>
  );
}
