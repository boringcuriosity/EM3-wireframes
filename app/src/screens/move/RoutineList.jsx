import React from "react";
import { useWF } from "../../state";
import RoutineExercise from "./RoutineExercise";
import { TEXT, MUTED } from "../../tokens";
import { COACH_ROUTINE } from "./exercises";
import Empty from "./Empty";

/* The coach's plan for the body: a list of video exercises, each one ticked
   off as it is done. It is the Move equivalent of Eat's meal divisions, so it
   behaves the same way, a plan you work through rather than a page you read.

   Working through them is all this does. Saying the session happened is Log
   exercise at the top of the screen, which was already there: two CTAs one
   scroll apart, both opening the same logger, made the screen look like it
   wanted two different things. */
export default function RoutineList() {
  const { planAssigned, isPaid, routineFeel, setFeel, clearFeel } = useWF();
  const hasPlan = planAssigned;

  return (
(hasPlan ? (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{COACH_ROUTINE.name}</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>
                Set by {COACH_ROUTINE.by} · {COACH_ROUTINE.from} to {COACH_ROUTINE.to}
              </div>
              <span
                style={{
                  display: "inline-block",
                  marginTop: 10,
                  background: TEXT,
                  borderRadius: 999,
                  padding: "5px 14px",
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {COACH_ROUTINE.block}
              </span>

              <div style={{ marginTop: 14 }}>
                {COACH_ROUTINE.items.map((it) => (
                  <RoutineExercise
                    key={it.id}
                    item={it}
                    feel={routineFeel[it.id]}
                    onPick={setFeel}
                    onClear={clearFeel}
                  />
                ))}
              </div>

            </>
          ) : (
            <Empty
              title="No routine yet"
              line={
                isPaid
                  ? "Your coach builds this after your first consultation, once they have seen how you already move. Logging now is what gives them something to build from."
                  : "Routines come with a care program. In the meantime, log whatever movement you do and I will work with that."
              }
            />
          ))
  );
}
