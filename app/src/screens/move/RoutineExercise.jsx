import React, { useState } from "react";
import { Play, Check, Star, X } from "lucide-react";
import { TEXT, MUTED, FAINT, BG, BG_ALT, BORDER, PILLAR } from "../../tokens";

export const FEELS = [
  { id: "easy", label: "Easy" },
  { id: "hard", label: "Difficult" },
];
export const FEEL_LABEL = { easy: "Easy", hard: "Difficult" };

/* One exercise of the coach's routine, and the question that finishes it.

   The question waits for the act. It used to sit open under every exercise,
   which meant asking four people-shaped questions about work nobody had done
   yet, and a screen of four cards each dangling a query. Marking it done is
   what raises it, so it is asked at the only moment it has an answer.

   It arrives over the card rather than over the screen. A sheet would take the
   exercise away in order to ask about it; this way the thing being asked about
   is still underneath, and the answer never costs somebody their place.

   The star is not decoration. A physio needs one thing back from a routine,
   whether it was pitched right, and this is the only place they can get it. The
   line under it says so, because a star on its own is a rule without a reason.

   Shared by Move's own list and the logger's plan tab, so the same routine
   cannot be worked through two different ways on two screens. */
export default function RoutineExercise({ item, feel, onPick, onClear }) {
  const [asking, setAsking] = useState(false);
  const c = PILLAR.move.c;
  const done = !!feel;

  return (
    <div
      style={{
        position: "relative",
        background: BG,
        border: "1px solid " + (done ? c : BORDER),
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        {/* Only once it is done, and then it is the undo.

            An empty circle beside an exercise nobody has done yet is a control
            that does nothing, sitting where a control should be: Mark done is
            the affordance, and the circle was competing with it. Filled, it is
            the tick, and tapping a tick to clear it is the one gesture nobody
            has to be taught. */}
        {done && (
          <button
            onClick={() => onClear(item.id)}
            aria-label={item.name + ", done. Mark as not done"}
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              flexShrink: 0,
              padding: 0,
              background: c,
              border: "1.8px solid " + c,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Check size={13} color="#fff" strokeWidth={3.2} />
          </button>
        )}
        <span style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 700,
              color: done ? MUTED : TEXT,
              textDecoration: done ? "line-through" : "none",
            }}
          >
            {item.name}
          </span>
          <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2 }}>
            {item.sets} sets · {item.reps} reps · {item.rest} rest
          </span>
        </span>

        {/* The answer stays on the card once it is given, and it is the way
            back to the question. Somebody who called it easy on the first day
            of a routine may want to say otherwise on the fourth. */}
        {done && (
          <button
            onClick={() => setAsking(true)}
            aria-label={"Felt " + FEEL_LABEL[feel] + ". Change"}
            style={{
              flexShrink: 0,
              background: PILLAR.move.t,
              border: "none",
              borderRadius: 999,
              padding: "5px 11px",
              fontSize: 11,
              fontWeight: 700,
              color: c,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {FEEL_LABEL[feel]}
          </button>
        )}
      </div>

      <div
        style={{
          height: 96,
          borderRadius: 12,
          background: BG_ALT,
          border: "1px dashed " + BORDER,
          margin: "11px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            width: 34, height: 34, borderRadius: "50%", background: BG,
            border: "1px solid " + BORDER, display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Play size={14} color={TEXT} fill={TEXT} />
        </span>
      </div>

      <div style={{ fontSize: 11.5, color: MUTED, marginTop: 9, lineHeight: 1.5 }}>
        {item.note}
      </div>

      {!done && (
        <button
          onClick={() => setAsking(true)}
          style={{
            width: "100%",
            marginTop: 11,
            background: BG,
            border: "1px solid " + c,
            borderRadius: 12,
            padding: "10px 0",
            fontSize: 12.5,
            fontWeight: 700,
            color: c,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Mark done
        </button>
      )}

      {asking && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            borderRadius: 16,
            /* Nearly opaque rather than solid. The exercise stays faintly
               visible underneath, so the question is plainly about this one. */
            background: "rgba(255,255,255,0.96)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "18px 16px",
            animation: "popIn .22s cubic-bezier(.32,.72,0,1) both",
          }}
        >
          <button
            onClick={() => setAsking(false)}
            aria-label="Close"
            style={{
              position: "absolute", top: 10, right: 10, background: "none",
              border: "none", padding: 4, cursor: "pointer", display: "flex",
            }}
          >
            <X size={15} color={FAINT} />
          </button>

          <Star size={17} color={c} fill={c} strokeWidth={0} />
          <div
            style={{
              fontSize: 15.5,
              fontWeight: 700,
              color: TEXT,
              marginTop: 8,
              letterSpacing: "-0.01em",
            }}
          >
            How did it feel?
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: MUTED,
              lineHeight: 1.5,
              marginTop: 4,
              textAlign: "center",
              maxWidth: 230,
            }}
          >
            Your physio reads this before writing your next routine.
          </div>

          <div style={{ display: "flex", gap: 9, marginTop: 15 }}>
            {FEELS.map((f) => {
              const on = feel === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    onPick(item.id, f.id);
                    setAsking(false);
                  }}
                  style={{
                    minWidth: 96,
                    height: 42,
                    borderRadius: 12,
                    background: on ? c : BG,
                    border: "1.4px solid " + c,
                    color: on ? "#fff" : c,
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
