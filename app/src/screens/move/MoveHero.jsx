import React from "react";
import { useWF } from "../../state";
import ConnectNudge from "../../components/ConnectNudge";
import { Info, Lock } from "lucide-react";
import { ContributorRings } from "../../components/MomentumBars";
import KairaMark from "../../components/KairaMark";
import {
  MOVE_C, MOVE_T, MOVE_W, TEXT, MUTED, RULE, BG, BORDER, SH,
} from "../../tokens";

/* Move's hero, built the way Eat's is: the one number the pillar is about,
   then the smaller ones that make it up.

   IT USED TO COUNT MINUTES. Twenty a day, a ring filling towards them, and a
   line saying how many were left. That number answered a question the pillar
   had stopped asking: Momentum is not how long you moved, it is how much of
   your coach's day you did and whether you did it across the whole of it. A
   hero counting minutes against a figure nothing else on the screen used left
   the score living in a bubble on Home and nowhere in the pillar it belongs to.

   Three states, the same three Eat has: no plan to read against, a plan with
   nothing in it yet, and a number. Move has a fourth that Eat does not, a day
   where everything the coach asked for is in, because a Move plan can actually
   be finished and a day of eating cannot.

   The number is never blurred. Eat hides a sufficiency until three meals are
   in because a percentage of a day half told is misleading; Momentum is a
   fraction of a known plan from the first tick, so it has nothing to hide. It
   is low early because the day is early, and the two bars underneath say so. */
export default function MoveHero() {
  const {
    momentum, momentumLine, moveStarted, planAssigned, setPillarInfo,
  } = useWF();

  const R = 34;
  const C = 2 * Math.PI * R;
  const complete = moveStarted && momentum >= 100;

  const title = !planAssigned
    ? "No movement plan yet"
    : complete
    ? "Today's Momentum is in"
    : moveStarted
    ? "Today's Momentum"
    : "Nothing logged yet";

  /* One clause, and no counting.

     It carried "3 of 6 done" for a while, which the rings underneath already
     say three times over and better, and then a second clause about landing in
     different parts of the day. That clause is the spread bonus explained in
     the abstract, and the abstract is the worst place for it: Kaira says the
     same thing underneath about the actual walk that would actually earn it. */
  const line = !planAssigned
    ? "Momentum is how much of your coach's plan you did, so it waits for them."
    : complete
    ? "Everything your coach asked for, right across the day."
    : moveStarted
    ? "It climbs as you do the rest of your move tasks today."
    : "Do the first thing on your plan and it appears here.";

  return (
    <div style={{ background: BG, border: "1px solid " + BORDER, borderRadius: 20, padding: 18, boxShadow: SH }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative", width: 84, height: 84, flexShrink: 0 }}>
          <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden>
            <circle cx="42" cy="42" r={R} fill="none" stroke={MOVE_T} strokeWidth="8" />
            <circle
              cx="42" cy="42" r={R}
              fill="none" stroke={MOVE_C} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - (moveStarted ? momentum : 0) / 100)}
              transform="rotate(-90 42 42)"
              style={{ transition: "stroke-dashoffset .8s cubic-bezier(.32,.72,0,1)" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            {planAssigned ? (
              <>
                <span style={{ fontSize: 23, fontWeight: 800, color: moveStarted ? TEXT : RULE, lineHeight: 1 }}>
                  {moveStarted ? momentum : 0}
                </span>
                <span style={{ fontSize: 9.5, color: MUTED, marginTop: 2 }}>momentum</span>
              </>
            ) : (
              <Lock size={18} color={RULE} strokeWidth={2.2} />
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{title}</div>
          <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginTop: 4 }}>{line}</div>
        </div>

        <button
          onClick={() => setPillarInfo("move")}
          aria-label="What is Momentum?"
          style={{
            width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
            background: BG, border: "1px solid " + BORDER,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", padding: 0,
          }}
        >
          <Info size={14} color={MUTED} strokeWidth={2} />
        </button>
      </div>

      {/* The one part still worth doing something about, in Kaira's voice.

          Her mark rather than a dot, because this is the only line on the card
          that is somebody talking rather than the card reporting. Everything
          above it is arithmetic. */}
      {planAssigned && momentumLine && (
        <div
          style={{
            display: "flex", alignItems: "flex-start", gap: 9,
            background: MOVE_W, border: "1px solid " + MOVE_T,
            borderRadius: 13, padding: "10px 12px", marginTop: 14,
          }}
        >
          <span style={{ flexShrink: 0, marginTop: 1 }}>
            <KairaMark size={18} />
          </span>
          <span style={{ fontSize: 11.5, color: TEXT, lineHeight: 1.5 }}>{momentumLine}</span>
        </div>
      )}

      {/* The parts it is made of, each filling towards something the coach
          set. Eat has carried its four macro rings here since the beginning
          and they are why a low sufficiency reads as a morning rather than a
          verdict; this is the same device for the three things a Move plan can
          ask for.

          There were two bars above this for a while, one for what was done and
          one for which parts of the day it landed in. Between them and these
          rings the card said what had been done three times over, and the bars
          were the two saying it in the abstract. */}
      {planAssigned && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid " + BORDER }}>
          <ContributorRings />
        </div>
      )}

      <ConnectNudge signal="steps" />
    </div>
  );
}
