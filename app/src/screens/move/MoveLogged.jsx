import React, { useState, useEffect } from "react";
import { useWF } from "../../state";
import { Check, Flame } from "lucide-react";
import { byId, logBurn, dayBurn, DAILY_GOAL_MIN, COACH_ROUTINE } from "./exercises";
import { fmtTime } from "../log/foods";
import CtaArrow from "../../components/CtaArrow";
import {
  GREEN, GREEN_DEEP, TEXT, MUTED, FAINT, BG, BG_ALT, BORDER, LINE, PILLAR,
} from "../../tokens";

const COINS = 2;

/* What that session did, on the same beat as a meal.

   Eat has counted its score up on a screen of its own since the beginning, and
   Move finished on a toast. So the two pillars ended the same act differently:
   one made something of it, the other mentioned it. This is the other half.

   Four beats, the same four: the rise, what was in it, where the day stands
   now, and what happens next. The number that moves here is minutes against
   the day's twenty, because that is the one Move is actually asking for. */
export default function MoveLogged() {
  const { moveResult, setMoveResult, setMoveDetail, moveReturn, exLogs, flipcoins, setFlipcoins, setToast } = useWF();

  const [shown, setShown] = useState(moveResult ? moveResult.before : 0);

  /* Counted up rather than printed. A number that arrives already correct is a
     result; one that climbs is something you did. */
  useEffect(() => {
    if (!moveResult) return;
    const span = Math.max(1, moveResult.after - moveResult.before);
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setShown(moveResult.before + Math.round((span * i) / 24));
      if (i >= 24) clearInterval(t);
    }, 26);
    return () => clearInterval(t);
  }, [moveResult]);

  if (!moveResult) return null;
  const { entry, after, count, total, feel } = moveResult;
  const ex = byId(entry.id);
  const isRoutine = entry.id === "routine";
  const kcal = logBurn(entry);
  const pct = Math.min(100, Math.round((shown / DAILY_GOAL_MIN) * 100));
  const met = after >= DAILY_GOAL_MIN;

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

          {/* A ring rather than Eat's hexagon. Minutes against the day's goal
              is a fraction of something, and a ring is what the rest of Move
              already draws a fraction with. */}
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
                  MINUTES TODAY
                </span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 13, color: TEXT, marginTop: 16, lineHeight: 1.5 }}>
            <strong>+{entry.minutes} minutes</strong> from this session
          </div>
          <div style={{ fontSize: 11.5, color: MUTED, marginTop: 4 }}>
            {met
              ? "That clears the twenty you are aiming for today."
              : DAILY_GOAL_MIN - after + " more minutes and today counts."}
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
                {COACH_ROUTINE.items.map((it, i) => (
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

        {/* Where the day now stands */}
        <div style={{ padding: "20px 22px 0" }}>
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
            {[
              { v: after, l: "Minutes" },
              { v: dayBurn(exLogs), l: "kcal burnt" },
              { v: exLogs.length, l: exLogs.length === 1 ? "Session" : "Sessions" },
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

        {/* What happens next.

            When they told us how it felt, that is the first thing said back,
            because a question you answer and never hear about again is a toll
            rather than a conversation. */}
        <div style={{ padding: "18px 22px 8px" }}>
          <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.55 }}>
            {feel === "easy"
              ? "You found this one easy, so " + COACH_ROUTINE.by.split(" ")[0] + " can step it up when she writes the next one."
              : feel === "hard"
              ? "You found this one difficult, and " + COACH_ROUTINE.by.split(" ")[0] + " will see that before she writes the next one. Holding the same routine another week is a normal answer."
              : met
              ? "Your coach sees this the next time they open your week, and steady days are what they build the next routine on."
              : "A walk after dinner would finish today off. Short and often is what moves the number your coach watches."}
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
