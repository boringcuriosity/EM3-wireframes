import React from "react";
import { useWF } from "../../state";
import RoutineExercise from "./RoutineExercise";
import { GREEN, TEXT, MUTED, BG } from "../../tokens";
import { COACH_ROUTINE } from "./exercises";
import Empty from "./Empty";

/* The coach's plan for the body: a list of video exercises, each one ticked
   off as it is done. It is the Move equivalent of Eat's meal divisions, so it
   behaves the same way, a plan you work through rather than a page you read. */
export default function RoutineList() {
  const { planAssigned, routineDone, isPaid, openMoveLog, exLogs, routineFeel, setFeel, clearFeel } = useWF();
  const hasPlan = planAssigned;
  const logged = exLogs.some((l) => l.id === "routine");

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

              {/* Ticking the exercises is working through them; this is saying
                  the session happened, which is the part the rest of the app
                  was never being told. It opens the logger on the routine, so
                  the minutes and the effort are still the person's to confirm
                  rather than numbers we made up for them. */}
              {!logged && (
                <button
                  onClick={() => openMoveLog("routine")}
                  style={{
                    width: "100%",
                    marginTop: 2,
                    background: BG,
                    border: "1px solid " + GREEN,
                    borderRadius: 14,
                    padding: "12px 0",
                    fontSize: 13,
                    fontWeight: 700,
                    color: GREEN,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {routineDone.length === COACH_ROUTINE.items.length
                    ? "Log this session"
                    : routineDone.length > 0
                    ? "Log what you did"
                    : "Log this session"}
                </button>
              )}
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
