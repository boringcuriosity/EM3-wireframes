import React, { useState } from "react";
import { useWF } from "../../state";
import { ChevronLeft, ChevronRight, Search, X, Plus, Minus } from "lucide-react";
import { GREEN, TEXT, MUTED, FAINT, BG, BG_ALT, BG_SUNK, BORDER } from "../../tokens";
import Wheel from "../../components/Wheel";
import { EXERCISES, byId, INTENSITIES, burnt, dayMinutes, COACH_ROUTINE } from "./exercises";
import RoutineExercise from "./RoutineExercise";
import { fmtTime, timeSlots } from "../log/foods";

const NOW = 13 * 60 + 30;

/* Log movement, in one decision. Picking the activity is the only thing asked
   for; duration, effort and time all arrive with sensible defaults and stay out
   of the way until someone wants them.

   One screen for both kinds of movement. Move used to have two ways to record
   the same thing: this, which wrote a real log, and a Mark done pill on each of
   the coach's four exercises, which wrote to a list nothing else in the app
   read. Somebody could do exactly what their coach asked, tick all four, and
   watch the day's row stay open and the hero say nought minutes.

   The fix is not a second logger, it is admitting the routine is one thing you
   did rather than four. The four exercises are its contents the way a meal's
   items are the contents of a meal, so the session is what gets logged and the
   whole pipeline behind this screen handles it with no special case. */
export default function LogExercise() {
  const {
    setLogExOpen, exLogs, setExLogs,
    planAssigned, routineDone, routineFeel, setFeel, clearFeel,
    logExPick, setLogExPick, setMoveResult,
  } = useWF();

  const [query, setQuery] = useState("");
  /* Two sources, two tabs, the way Eat's logger has them. "Your plan" is the
     coach's session; "On your own" is everything you did without being asked.
     The pair names the real split rather than labelling one of them as the
     ordinary case. The plan tab only exists when a plan does. */
  const [tab, setTab] = useState(logExPick === "routine" ? "plan" : "own");
  // Opened on something, when the door in already knew what was done.
  const [picked, setPicked] = useState(logExPick === "routine" ? null : logExPick);
  const [minutes, setMinutes] = useState(20);
  // Mobility work is light by design, so the routine says so rather than
  // making somebody correct a default that was never right for it.
  const [intensity, setIntensity] = useState(logExPick === "routine" ? "light" : "moderate");
  const [when, setWhen] = useState(NOW);
  const [adjust, setAdjust] = useState(null);

  const q = query.trim().toLowerCase();
  /* The routine is pinned rather than listed, so it is never something you
     scroll past. Without a plan it is not an activity anybody can do, so it
     leaves the list entirely. */
  const routine = planAssigned ? byId("routine") : null;
  const notCoach = (x) => !x.tags.includes("coach");
  const list = q
    ? EXERCISES.filter((x) => notCoach(x) && x.name.toLowerCase().includes(q))
    : EXERCISES.filter((x) => notCoach(x) && x.tags.includes("common"));
  const total = COACH_ROUTINE.items.length;
  /* What was marked, and nothing more. The bar used to treat nothing marked as
     everything, which made one button mean two things and made it lie about a
     single exercise routine: "Mark 1 done" about the one thing already done.
     Marking is the card's job now and the bar only logs, so this is a count
     rather than an assumption. */
  const ticked = routineDone.length;
  const doing = ticked;
  // Pro rata, because logging the full twenty for half the work is a number
  // the trend has to live with afterwards.
  const routineMins = Math.max(5, Math.round((COACH_ROUTINE.minutes * doing) / total));

  const ex = picked ? byId(picked) : null;
  const inten = INTENSITIES.find((i) => i.id === intensity);
  const kcal = ex ? burnt({ met: ex.met, minutes, factor: inten.factor }) : 0;

  const close = () => {
    setLogExPick(null);
    setLogExOpen(false);
  };

  const logSession = () => {
    /* The session's own reading, from what they said on the way through.
       Everything marked has an answer, because answering is what marks it. */
    const votes = routineDone.map((id) => routineFeel[id]).filter(Boolean);
    const hard = votes.filter((v) => v === "hard").length;
    const sessionFeel = votes.length ? (hard * 2 >= votes.length ? "hard" : "easy") : null;
    const entry = { id: "routine", minutes: routineMins, intensity: "light", timeMins: when };
    const before = dayMinutes(exLogs);
    setExLogs(exLogs.concat(entry));
    setMoveResult({ entry, before, after: before + routineMins, count: doing, total, feel: sessionFeel });
    setLogExPick(null);
    setLogExOpen(false);
  };

  const submit = () => {
    const entry = { id: picked, minutes, intensity, timeMins: when };
    const before = dayMinutes(exLogs);
    setExLogs(exLogs.concat(entry));
    setMoveResult({ entry, before, after: before + minutes });
    setLogExPick(null);
    setLogExOpen(false);
  };

  return (
    <>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "6px 22px 14px" }}>
          <button
            onClick={() => (picked ? setPicked(null) : close())}
            aria-label="Back"
            style={{
              width: 34, height: 34, borderRadius: "50%", background: BG_ALT,
              border: "1px solid " + BORDER, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", flexShrink: 0,
            }}
          >
            <ChevronLeft size={18} color={TEXT} />
          </button>
          <span style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 700, color: TEXT }}>
            {picked ? "How long?" : "What did you do?"}
          </span>
          <span style={{ width: 34 }} />
        </div>

        {/* Two sources, the way Eat's logger names its own. Only when there is
            a plan: a tab leading to nothing is worse than no tab. */}
        {!picked && routine && (
          <div style={{ flexShrink: 0, display: "flex", gap: 10, padding: "0 22px 12px" }}>
            {[
              { id: "plan", label: "Your plan" },
              { id: "own", label: "Log other exercise" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  background: tab === t.id ? TEXT : BG_ALT,
                  border: "1px solid " + (tab === t.id ? TEXT : BORDER),
                  borderRadius: 999,
                  padding: "10px 0",
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: tab === t.id ? "#fff" : MUTED,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {!picked && routine && tab === "plan" ? (
          <PlanTab
            ticked={ticked}
            total={total}
            mins={routineMins}
            onLog={logSession}
            feel={routineFeel}
            onFeel={setFeel}
            onClear={clearFeel}
          />
        ) : !picked ? (
          /* One job: name the activity. */
          <div style={{ flex: 1, overflowY: "auto", padding: "0 22px 20px", minHeight: 0 }}>
            <div
              style={{
                display: "flex", alignItems: "center", gap: 9, background: BG_ALT,
                border: "1px solid " + BORDER, borderRadius: 13, padding: "12px 13px",
              }}
            >
              <Search size={16} color={MUTED} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search an activity"
                aria-label="Search an activity"
                style={{
                  flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent",
                  fontSize: 13.5, fontFamily: "inherit", color: TEXT,
                }}
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Clear search"
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                  <X size={15} color={MUTED} />
                </button>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              {list.length === 0 ? (
                <div style={{ padding: "34px 10px", textAlign: "center", fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
                  Nothing matches that. Try a simpler word, like walk, cycle or yoga.
                </div>
              ) : (
                list.map((x) => (
                  <button
                    key={x.id}
                    onClick={() => setPicked(x.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      textAlign: "left",
                      background: BG,
                      border: "none",
                      borderBottom: "1px solid " + BORDER,
                      padding: "15px 2px",
                      fontSize: 14.5,
                      color: TEXT,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span style={{ flex: 1 }}>{x.name}</span>
                    <ChevronRight size={17} color={MUTED} />
                  </button>
                ))
              )}
            </div>

            {!q && list.length > 0 && (
              <div style={{ fontSize: 11, color: MUTED, marginTop: 14, lineHeight: 1.55 }}>
                Search for anything else. Housework and gardening count too.
              </div>
            )}
          </div>
        ) : (
          /* Everything else already has an answer. This is a confirm, not a form. */
          <div style={{ flex: 1, overflowY: "auto", padding: "0 22px 20px", minHeight: 0 }}>
            <div
              style={{
                background: BG_ALT,
                border: "1px solid " + BORDER,
                borderRadius: 20,
                padding: "20px 18px 22px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{ex.name}</div>
              {/* What was in it, so the session being logged is recognisably
                  the work that was done rather than a name and a number. */}
              {picked === "routine" && (
                <div style={{ fontSize: 11.5, color: MUTED, marginTop: 5, lineHeight: 1.5 }}>
                  {COACH_ROUTINE.items.map((it) => it.name).join(", ")}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, marginTop: 18 }}>
                <Round onClick={() => setMinutes(Math.max(5, minutes - 5))} aria="Five minutes less">
                  <Minus size={19} color={TEXT} strokeWidth={2.4} />
                </Round>
                <span style={{ display: "flex", alignItems: "baseline", gap: 5, minWidth: 104, justifyContent: "center" }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: TEXT, lineHeight: 1, letterSpacing: -1 }}>
                    {minutes}
                  </span>
                  <span style={{ fontSize: 14, color: MUTED }}>min</span>
                </span>
                <Round onClick={() => setMinutes(Math.min(180, minutes + 5))} aria="Five minutes more">
                  <Plus size={19} color={TEXT} strokeWidth={2.4} />
                </Round>
              </div>

              <div style={{ fontSize: 12, color: MUTED, marginTop: 16 }}>
                about <strong style={{ color: TEXT }}>{kcal} kcal</strong> burnt
              </div>
            </div>

            {/* The two things almost nobody changes, folded into one quiet row */}
            <Row label="Effort" value={inten.label} onClick={() => setAdjust("effort")} />
            <Row label="When" value={fmtTime(when)} onClick={() => setAdjust("time")} />
            <button
              onClick={() => setPicked(null)}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "14px 0 0",
                fontSize: 12.5,
                fontWeight: 600,
                color: MUTED,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Pick a different activity
            </button>
          </div>
        )}

        {picked && (
          <div style={{ flexShrink: 0, borderTop: "1px solid " + BORDER, padding: "12px 22px 24px" }}>
            <button
              onClick={submit}
              style={{
                width: "100%", background: GREEN, border: "none", borderRadius: 14,
                padding: "14px 0", color: "#fff", fontSize: 14.5, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Log exercise
            </button>
          </div>
        )}
      </div>

      {adjust === "effort" && (
        <Sheet title="How hard was it?" onClose={() => setAdjust(null)} note={inten.hint}>
          <Wheel
            items={INTENSITIES.map((i) => ({ v: i.id, label: i.label }))}
            value={intensity}
            onChange={setIntensity}
          />
        </Sheet>
      )}

      {adjust === "time" && (
        <Sheet title="When did you do it?" onClose={() => setAdjust(null)}>
          <Wheel
            items={timeSlots(NOW).map((t) => ({ v: t, label: fmtTime(t) }))}
            value={when}
            onChange={setWhen}
          />
        </Sheet>
      )}

    </>
  );
}

/* The coach's session, done here rather than recorded here.

   This is the tab you land on when a plan exists, and it holds the work: every
   exercise with its video, its sets and its reps, and a tick. Ticking is how
   you keep your place while you go, so somebody can open this, work down it and
   press the button at the end.

   The button says the same thing whether nothing is ticked or everything is,
   because in both cases it logs the whole session. Arriving and pressing it
   straight away is the common path: most people open this having just finished.
   It only counts when some were left out. */
function PlanTab({ ticked, total, mins, onLog, feel, onFeel, onClear }) {
  const kcal = burnt({ met: byId("routine").met, minutes: mins, factor: 0.8 });

  return (
    <>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 22px 16px", minHeight: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{COACH_ROUTINE.name}</div>
        <div style={{ fontSize: 11.5, color: MUTED, marginTop: 3 }}>
          Set by {COACH_ROUTINE.by} · about {COACH_ROUTINE.minutes} minutes
        </div>

        <div style={{ marginTop: 14 }}>
          {COACH_ROUTINE.items.map((it) => (
            <RoutineExercise
              key={it.id}
              item={it}
              feel={feel[it.id]}
              onPick={onFeel}
              onClear={onClear}
            />
          ))}
        </div>
      </div>

      {/* What is about to be recorded, above the button that records it, so the
          minutes are never a surprise on the screen afterwards. */}
      <div style={{ flexShrink: 0, borderTop: "1px solid " + BORDER, padding: "12px 22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: MUTED }}>
            {ticked === 0
              ? "Mark what you did"
              : total === 1
              ? "1 exercise"
              : ticked === total
              ? "All " + total + " exercises"
              : ticked + " of " + total + " exercises"}
          </span>
          {ticked > 0 && (
            <span style={{ fontSize: 12, fontWeight: 700, color: TEXT, flexShrink: 0 }}>
              {mins} min · about {kcal} kcal
            </span>
          )}
        </div>
        {/* One job. The cards say what was done, this records it, and the two
            are never the same button in two places, which is what a routine of
            a single exercise made obvious. */}
        <button
          onClick={onLog}
          disabled={ticked === 0}
          style={{
            width: "100%",
            background: ticked === 0 ? BG_SUNK : GREEN,
            border: "none",
            borderRadius: 14,
            padding: "14px 0",
            color: ticked === 0 ? FAINT : "#fff",
            fontSize: 14.5,
            fontWeight: 700,
            cursor: ticked === 0 ? "default" : "pointer",
            fontFamily: "inherit",
          }}
        >
          Log
        </button>
      </div>
    </>
  );
}

function Round({ onClick, children, aria }) {
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      style={{
        width: 42, height: 42, borderRadius: "50%", background: BG,
        border: "1px solid " + BORDER, display: "flex", alignItems: "center",
        justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0,
      }}
    >
      {children}
    </button>
  );
}


/* One setting, one row. Naming the setting rather than running both values
   into a sentence is what makes it obvious there are two things here. */
function Row({ label, value, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: BG,
        border: "1px solid " + BORDER,
        borderRadius: 14,
        padding: "13px 15px",
        marginTop: 10,
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: "left",
      }}
    >
      <span style={{ flex: 1, fontSize: 12.5, color: MUTED }}>{label}</span>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>{value}</span>
      <ChevronRight size={15} color={MUTED} />
    </button>
  );
}

function Sheet({ title, note, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 48,
        background: "rgba(31,38,48,0.42)",
        display: "flex",
        alignItems: "flex-end",
        animation: "scrimIn .24s ease both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: BG,
          borderRadius: "26px 26px 0 0",
          padding: "10px 0 24px",
          boxShadow: "0 -12px 40px rgba(31,38,48,0.22)",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 2, background: BORDER, margin: "0 auto 14px" }} />

        <div style={{ padding: "0 22px 6px", fontSize: 16, fontWeight: 700, color: TEXT }}>{title}</div>

        {children}

        <div style={{ padding: "6px 22px 0", minHeight: 17, fontSize: 11.5, color: MUTED, textAlign: "center" }}>
          {note}
        </div>

        <div style={{ padding: "14px 22px 0" }}>
          <button
            onClick={onClose}
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
    </div>
  );
}
