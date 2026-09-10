import React from "react";
import { useWF } from "../state";
import Skel from "./Skel";
import { MOVE_C, TEXT, MUTED, FAINT, BG_ALT } from "../tokens";

/* What a Momentum figure needs beside it.

   Eat learned this first. A sufficiency of 1% reads as a verdict on the day
   until you can see five empty meal slots next to it, and then it reads as a
   morning.

   Two things stood here and both went. A strip of the four parts of the day,
   which carried the scoring weights on its face and turned a person's own card
   into the marking scheme it was graded by. And a segment bar counting what
   was done, which the rings below say better, with the numbers behind it. */

/* The three things a coach can assign, as rings.

   Eat has carried four macro rings under its score since the beginning, and
   they are the reason a 22% reads as a morning rather than a failure: you can
   see the protein at 21% and the fibre at 13% and know exactly which one the
   number is waiting on. Move had a row of flat text saying "Not yet" and
   "0 of 4", which named the same three facts and showed none of them.

   Same shape as `MacroRings` on purpose. Two pillars, one card grammar: the
   score, then the parts it is made of, each filling towards something the
   coach set.

   One colour rather than four. The macros get their own tones because they are
   genuinely different substances; a workout, a walk and a step count are all
   movement, and tinting them apart would invent a distinction the score does
   not make. */
const short = (n) =>
  n >= 10000 ? Math.round(n / 1000) + "k" : n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);

export function ContributorRings() {
  const { momentumParts: m, daySteps, healthSource, healthSync, setStepsSheet } = useWF();

  const rings = [];
  /* Minutes, because minutes are what the workout is now scored on. It counted
     the coach's four moves for a while, which was true only as long as the
     coach's routine was the only thing that could earn it. */
  if (m.session)
    rings.push({
      id: "session",
      label: "Workout",
      have: Math.round(m.workoutMins),
      target: m.askedMins || 1,
      mins: true,
    });
  if (m.neat.length)
    rings.push({ id: "neat", label: "Small moves", have: m.neatDone, target: m.neat.length, unit: "" });
  if (m.goal)
    rings.push({
      id: "steps", label: "Steps", have: daySteps || 0, target: m.goal, unit: "",
      syncing: healthSync === "steps",
      // Entered by hand means the cell is a control, not just a reading.
      onClick: healthSource.steps === "manual" && healthSync !== "steps" ? () => setStepsSheet(true) : undefined,
    });
  if (!rings.length) return null;

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {rings.map((r) => {
        const R = 20;
        const C = 2 * Math.PI * R;
        const pct = r.target ? Math.min(100, Math.round((r.have / r.target) * 100)) : 0;
        const Cell = r.onClick ? "button" : "div";
        return (
          <Cell
            key={r.id}
            onClick={r.onClick}
            aria-label={r.label + ", " + r.have + " of " + r.target}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              background: "none", border: "none", padding: 0,
              cursor: r.onClick ? "pointer" : "default", fontFamily: "inherit",
            }}
          >
            <div style={{ position: "relative", width: 50, height: 50 }}>
              <svg width="50" height="50" viewBox="0 0 50 50" aria-hidden>
                <circle cx="25" cy="25" r={R} fill="none" stroke={BG_ALT} strokeWidth="5" />
                <circle
                  cx="25" cy="25" r={R}
                  fill="none" stroke={MOVE_C} strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - (r.syncing ? 0 : pct) / 100)}
                  transform="rotate(-90 25 25)"
                  style={{ transition: "stroke-dashoffset .8s cubic-bezier(.32,.72,0,1)" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {r.syncing ? (
                  <Skel w={20} h={11} />
                ) : (
                  <span style={{ fontSize: 12, fontWeight: 800, color: pct ? TEXT : FAINT }}>
                    {pct}
                    <span style={{ fontSize: 7.5, color: MUTED }}>%</span>
                  </span>
                )}
              </div>
            </div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: TEXT, marginTop: 5 }}>{r.label}</div>
            <div style={{ fontSize: 9, color: MUTED, marginTop: 1 }}>
              {r.id === "steps"
                ? short(r.have) + "/" + short(r.target)
                : r.mins
                ? r.have + "/" + r.target + " min"
                : r.have + " of " + r.target}
            </div>
          </Cell>
        );
      })}
    </div>
  );
}
