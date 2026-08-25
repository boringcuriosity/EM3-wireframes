import React from "react";
import { useWF } from "../../state";
import { ChevronLeft, Play, Check, Flame, Clock, Heart, Calendar } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BG_ALT, BORDER } from "../../tokens";
import {
  byId, INTENSITIES, DAILY_GOAL_MIN, logBurn, dayMinutes, dayBurn,
  COACH_ROUTINE, VIDEO_SECTIONS,
} from "./exercises";
import { fmtTime } from "../log/foods";

/* Move, built the same way as Eat: today's header, Kaira, the one number that
   matters, the action, then the detail behind tabs. */
export default function MoveDetail() {
  const {
    setMoveDetail, moveTab, setMoveTab, movePlan, exLogs, setLogExOpen,
    routineDone, setRoutineDone, isPaid,
  } = useWF();

  const mins = dayMinutes(exLogs);
  const kcal = dayBurn(exLogs);
  const pct = Math.min(100, Math.round((mins / DAILY_GOAL_MIN) * 100));
  const hasPlan = movePlan === "assigned";

  const R = 14;
  const C = 2 * Math.PI * R;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG_ALT, minHeight: 0 }}>
      {/* Header */}
      <div style={{ flexShrink: 0, background: BG, padding: "6px 22px 12px", borderBottom: "1px solid " + BORDER }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setMoveDetail(false)}
            aria-label="Back"
            style={{
              width: 34, height: 34, borderRadius: "50%", background: BG_ALT,
              border: "1px solid " + BORDER, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", flexShrink: 0,
            }}
          >
            <ChevronLeft size={18} color={TEXT} />
          </button>

          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 13,
                fontWeight: 600,
                color: TEXT,
                border: "1px solid " + BORDER,
                borderRadius: 999,
                padding: "5px 14px",
                background: BG,
              }}
            >
              <span style={{ cursor: "pointer" }}>‹</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Calendar size={14} color={TEXT} strokeWidth={2} />
                Today
              </span>
              <span style={{ color: BORDER }}>›</span>
            </div>
          </div>

          <span style={{ width: 34, flexShrink: 0 }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {/* Kaira, in one of two states */}
        <div style={{ padding: "16px 22px 0" }}>
          <div
            style={{
              display: "flex",
              gap: 11,
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 16,
              padding: "14px 15px",
            }}
          >
            <span
              style={{
                width: 24, height: 26, flexShrink: 0, background: GREEN,
                clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 11, fontWeight: 600,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              K
            </span>
            <span style={{ fontSize: 12, color: TEXT, lineHeight: 1.6 }}>
              {hasPlan ? (
                <>
                  {COACH_ROUTINE.by} has built your routine, so start there when you can. Anything
                  else you do still counts, so log it and I will keep the picture complete.
                </>
              ) : isPaid ? (
                <>
                  You are on a care program. Before your coach builds your exercise plan, they want
                  to see how you already move. Log your daily movement, even a 10 minute walk
                  counts.
                </>
              ) : (
                <>
                  Log your daily movement, even a 10 minute walk counts. The more I see, the better I
                  can tell you what is actually working for you.
                </>
              )}
            </span>
          </div>
        </div>

        {/* Duration, slim. One line, because it is one number. */}
        <div style={{ padding: "12px 22px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 12,
              padding: "9px 13px",
            }}
          >
            <div style={{ position: "relative", width: 34, height: 34, flexShrink: 0 }}>
              <svg width="34" height="34" viewBox="0 0 34 34">
                <circle cx="17" cy="17" r={R} fill="none" stroke="#F2F4F7" strokeWidth="4" />
                <circle
                  cx="17" cy="17" r={R} fill="none" stroke={GREEN} strokeWidth="4"
                  strokeLinecap="round" strokeDasharray={C}
                  strokeDashoffset={C * (1 - pct / 100)}
                  transform="rotate(-90 17 17)"
                  style={{ transition: "stroke-dashoffset .8s cubic-bezier(.32,.72,0,1)" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 8.5, fontWeight: 800, color: pct ? TEXT : MUTED }}>{pct}%</span>
              </div>
            </div>

            <span style={{ display: "flex", alignItems: "baseline", gap: 4, flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: TEXT }}>{mins}</span>
              <span style={{ fontSize: 12, color: MUTED }}>of {DAILY_GOAL_MIN} min moved</span>
            </span>

            {mins > 0 && (
              <span style={{ marginLeft: "auto", fontSize: 11, color: MUTED, textAlign: "right" }}>
                about {kcal} kcal
              </span>
            )}
          </div>
        </div>

        {/* The action, above the tabs */}
        <div style={{ padding: "12px 22px 0" }}>
          <button
            onClick={() => setLogExOpen(true)}
            style={{
              width: "100%",
              background: GREEN,
              border: "none",
              borderRadius: 14,
              padding: "13px 0",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Log exercise
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: "16px 22px 0",
            borderBottom: "1px solid " + BORDER,
            marginBottom: 14,
          }}
        >
          {[
            { id: "routine", label: "Daily routine" },
            { id: "logged", label: "Exercises" },
            { id: "videos", label: "Videos" },
          ].map((t) => {
            const on = moveTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setMoveTab(t.id)}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  borderBottom: "2.5px solid " + (on ? GREEN : "transparent"),
                  padding: "9px 0 12px",
                  fontSize: 12.5,
                  fontWeight: on ? 700 : 500,
                  color: on ? TEXT : MUTED,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div style={{ padding: "0 22px 26px" }}>
          {moveTab === "routine" &&
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
            ))}

          {moveTab === "logged" &&
            (exLogs.length === 0 ? (
              <Empty
                title="Nothing logged today"
                line="A walk to the shop counts. So does taking the stairs. Log it and I can tell you what it did."
              />
            ) : (
              exLogs.map((l, i) => {
                const ex = byId(l.id);
                const inten = INTENSITIES.find((x) => x.id === l.intensity);
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: BG,
                      border: "1px solid " + BORDER,
                      borderRadius: 16,
                      padding: "13px 15px",
                      marginBottom: 9,
                    }}
                  >
                    <span
                      style={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        background: BG_ALT, border: "1px solid " + BORDER,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Flame size={16} color={TEXT} strokeWidth={1.8} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: TEXT }}>
                        {ex.name}
                      </span>
                      <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2 }}>
                        {l.minutes} min · {inten.label} · {fmtTime(l.timeMins)}
                      </span>
                    </span>
                    <span style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: TEXT }}>
                        {logBurn(l)}
                      </span>
                      <span style={{ display: "block", fontSize: 9.5, color: MUTED }}>kcal</span>
                    </span>
                  </div>
                );
              })
            ))}

          {moveTab === "videos" &&
            VIDEO_SECTIONS.map((sec) => (
              <div key={sec.title} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT, marginBottom: 10 }}>
                  {sec.title}
                </div>
                <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none" }}>
                  {sec.items.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        flex: sec.featured ? "1 1 100%" : "0 0 190px",
                        background: BG,
                        border: "1px solid " + BORDER,
                        borderRadius: 16,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: sec.featured ? 118 : 96,
                          background: BG_ALT,
                          borderBottom: "1px dashed " + BORDER,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          style={{
                            width: 36, height: 36, borderRadius: "50%", background: BG,
                            border: "1px solid " + BORDER, display: "flex",
                            alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <Play size={15} color={TEXT} fill={TEXT} />
                        </span>
                      </div>
                      <div style={{ padding: "11px 13px 13px" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{v.name}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 7 }}>
                          {[v.level, v.kind].map((tag) => (
                            <span
                              key={tag}
                              style={{
                                background: BG_ALT,
                                border: "1px solid " + BORDER,
                                borderRadius: 999,
                                padding: "3px 9px",
                                fontSize: 10,
                                color: MUTED,
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        {v.likes && (
                          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 9 }}>
                            <Heart size={12} color={MUTED} />
                            <span style={{ fontSize: 11, color: MUTED }}>{v.likes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function Empty({ title, line }) {
  return (
    <div
      style={{
        background: BG,
        border: "1px dashed " + BORDER,
        borderRadius: 16,
        padding: "34px 22px",
        textAlign: "center",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          width: 46, height: 46, borderRadius: "50%", background: BG_ALT,
          border: "1px solid " + BORDER, alignItems: "center", justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Clock size={19} color={MUTED} strokeWidth={1.6} />
      </span>
      <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{title}</div>
      <div style={{ fontSize: 11.5, color: MUTED, marginTop: 7, lineHeight: 1.6 }}>{line}</div>
    </div>
  );
}
