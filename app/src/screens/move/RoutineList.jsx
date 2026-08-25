import React from "react";
import { useWF } from "../../state";
import { Play, Check } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BG_ALT, BORDER } from "../../tokens";
import { COACH_ROUTINE } from "./exercises";
import Empty from "./Empty";

/* The coach's plan for the body: a list of video exercises, each one ticked
   off as it is done. It is the Move equivalent of Eat's meal divisions, so it
   behaves the same way, a plan you work through rather than a page you read. */
export default function RoutineList() {
  const { movePlan, routineDone, setRoutineDone, isPaid } = useWF();
  const hasPlan = movePlan === "assigned";

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
                {COACH_ROUTINE.items.map((it) => {
                  const done = routineDone.includes(it.id);
                  return (
                    <div
                      key={it.id}
                      style={{
                        background: BG,
                        border: "1px solid " + (done ? GREEN : BORDER),
                        borderRadius: 16,
                        padding: 14,
                        marginBottom: 10,
                        opacity: done ? 0.85 : 1,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: TEXT }}>
                          {it.name}
                        </span>
                        <button
                          onClick={() =>
                            setRoutineDone(
                              done ? routineDone.filter((x) => x !== it.id) : routineDone.concat(it.id)
                            )
                          }
                          aria-pressed={done}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            background: done ? GREEN : BG,
                            border: "1px solid " + (done ? GREEN : BORDER),
                            borderRadius: 999,
                            padding: "6px 13px",
                            fontSize: 11.5,
                            fontWeight: 700,
                            color: done ? "#fff" : MUTED,
                            cursor: "pointer",
                            flexShrink: 0,
                            fontFamily: "inherit",
                          }}
                        >
                          {done && <Check size={12} color="#fff" strokeWidth={3} />}
                          {done ? "Done" : "Mark done"}
                        </button>
                      </div>

                      <div
                        style={{
                          height: 96,
                          borderRadius: 12,
                          background: BG_ALT,
                          border: "1px dashed " + BORDER,
                          margin: "11px 0",
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

                      <div style={{ fontSize: 11, color: MUTED }}>
                        {it.sets} sets · {it.reps} reps · {it.rest} rest
                      </div>
                      <div style={{ fontSize: 11.5, color: MUTED, marginTop: 5, lineHeight: 1.5 }}>
                        {it.note}
                      </div>
                    </div>
                  );
                })}
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
