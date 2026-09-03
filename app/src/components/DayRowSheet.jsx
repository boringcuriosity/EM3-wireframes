import React from "react";
import { useWF } from "../state";
import { Check, Footprints, Minus, RotateCcw, SquarePen, X } from "lucide-react";
import { TEXT, MUTED, BG, BG_ALT, BORDER, LINE, RULE, GREEN, PILLAR } from "../tokens";
import { byId, qtyLabel } from "../screens/log/foods";

const PILLAR_NAME = { eat: "Eat", move: "Move", mind: "Mind", measure: "Measure" };

/* What a row can still be told, given where it stands.

   Saying no to something is a real answer and the coach needs it, but a
   decline button beside every ask turns thirteen requests into twenty six
   decisions. So it lives one tap in, and it asks a question with a yes and a
   no rather than listing one choice.

   What it offers depends on who owns the record. A coach tip is ticked here
   and stored nowhere else, so undoing it is a real one step reversal. A meal,
   a session or a sync is done because a record exists in its own pillar, and
   undoing that would mean deleting data rather than untapping a tick, so this
   offers the door to where the record lives instead of pretending. Skipping
   disappears once something is done, because declining what you have already
   done means nothing. */
export default function DayRowSheet() {
  const {
    rowMenu, setRowMenu, dayRows, daySkipped, toggleSkip, toggleTick, goToRecord,
    water, setWater, editMeal, undoMeal, openMealLog, setStepsSheet,
  } = useWF();
  const r = dayRows.find((x) => x.id === rowMenu);
  if (!r) return null;
  const off = daySkipped.includes(r.id);
  const c = PILLAR[r.pillar].c;

  const owned = r.done && !off && r.kind === "tick";
  const isWater = r.done && !off && r.to === "water" && r.now > 0;
  const elsewhere = r.done && !off && r.kind === "go";
  /* A logged meal is the one record you can change from here. Everything else
     that finishes elsewhere is a reading or a session, where undoing means
     deleting something the person did rather than something they typed. */
  const isMeal = r.done && !off && !!r.division;
  /* Part of a coach's option is in and part is not. The meal is logged and
     the row is ticked, so this is not an unfinished task: it is a finished one
     with something the coach asked for still on the table, and the useful
     answer is to offer that thing rather than to argue about the tick.

     Only when what went in came off the option. Somebody who ate their own
     food has not left anything of the coach's half done. */
  const isPartial =
    r.done && !off && !!r.division && r.fromPlan && (r.outstanding || []).length > 0;
  // The coach's option as it stands, which is what the sheet shows: the same
  // list Eat draws, ticks and all, rather than a sentence about it.
  const planItems = (r.opts && r.opts[r.oi]) || [];
  const inAlready = new Set(r.loggedIds || []);
  const left = planItems.filter((it) => !inAlready.has(it.id));
  const gotIn = planItems.length - left.length;

  /* A count that is under way. The question somebody taps a half finished
     target with is how far along am I, and the only two answers worth having
     are the number and a way out of it. */
  const isSteps = !r.done && !off && r.kind === "target" && r.to === "steps";
  const now = r.now || 0;
  const toGo = Math.max(0, (r.goal || 0) - now);
  const pct = r.goal ? Math.min(100, Math.round((now / r.goal) * 100)) : 0;
  const n = (x) => x.toLocaleString("en-IN");

  const mode = off
    ? "back"
    : isSteps
    ? "steps"
    : isPartial
    ? "partial"
    : isMeal
    ? "meal"
    : owned
    ? "undo"
    : isWater
    ? "less"
    : elsewhere
    ? "open"
    : "skip";

  const COPY = {
    skip: {
      Icon: Minus,
      head: "Not doing this today?",
      line: "That's fine. It won't count as missed, and your coach will see you chose to skip it.",
      no: null,
      yes: "Skip today",
      tone: TEXT,
    },
    back: {
      Icon: RotateCcw,
      head: "Put this back on today?",
      line: "It counts again, so you can still finish the day.",
      no: null,
      yes: "Put it back",
      tone: GREEN,
    },
    undo: {
      Icon: RotateCcw,
      head: "Mark this as not done?",
      line: "It goes back on today's list. Nothing else changes.",
      no: null,
      yes: "Mark as not done",
      tone: TEXT,
    },
    less: {
      Icon: Minus,
      head: "Take one off?",
      line: "One glass comes off today's count. Tap the circle to put it back.",
      no: null,
      yes: "Take one off",
      tone: TEXT,
    },
    partial: {
      Icon: SquarePen,
      head: r.name + " is logged",
      line: gotIn + " of the " + planItems.length + " things your coach suggested went in.",
      /* The option itself, rather than a sentence describing it. A person who
         has eaten two of three wants to see which one is missing and tick it,
         which is what the same list does in Eat. */
      list: true,
      no: "Undo log",
      yes: "Edit what I logged",
      tone: GREEN,
    },
    steps: {
      Icon: Footprints,
      head: n(now) + " steps so far",
      line:
        n(toGo) + " to go. A twenty minute walk is about 2,000 of them, so it is " +
        "closer than the number looks.",
      bar: true,
      /* Adding to it only when the count is the person's own. Connected, the
         number is a reading and a button that changed it would be a lie. */
      no: r.add ? "Skip today" : null,
      yes: r.add ? "Add steps" : "Skip today",
      tone: r.add ? GREEN : TEXT,
    },
    meal: {
      Icon: SquarePen,
      head: r.name + " is logged",
      line: "Change what went in, or take the log off today and put the task back on your list.",
      no: "Undo log",
      yes: "Edit what I logged",
      tone: GREEN,
    },
    open: {
      Icon: SquarePen,
      head: "Logged in " + PILLAR_NAME[r.pillar],
      line: "If you want to edit this log, you can do that from " + PILLAR_NAME[r.pillar] + ".",
      /* One button. The sheet is an answer rather than a question here, and
         the cross above already does what a Close would. */
      no: null,
      yes: "Go to " + PILLAR_NAME[r.pillar],
      tone: GREEN,
    },
  }[mode];

  const act = () => {
    if (mode === "steps") {
      setRowMenu(null);
      return r.add ? setStepsSheet(true) : toggleSkip(r.id);
    }
    if (mode === "skip" || mode === "back") toggleSkip(r.id);
    else if (mode === "undo") toggleTick(r.id);
    else if (mode === "less") setWater(Math.max(0, water - 1));
    setRowMenu(null);
    if (mode === "meal" || mode === "partial") return editMeal(r.division);
    /* The way to the record, which is not the same as the way to do the task.
       This row is already done, so the logger has nothing left to ask. */
    if (mode === "open") goToRecord(r);
  };

  const Icon = COPY.Icon;

  return (
    <div
      onClick={() => setRowMenu(null)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 55,
        background: "rgba(16,24,40,0.46)",
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
          overflow: "hidden",
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >

        {/* Which task this is about, kept quiet so the question below carries
            the weight. */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "22px 22px 0" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, flexShrink: 0 }} />
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 12,
              fontWeight: 600,
              color: MUTED,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {r.title}
          </span>
          <button
            onClick={() => setRowMenu(null)}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: -4, display: "flex" }}
          >
            <X size={17} color={MUTED} />
          </button>
        </div>

        <div style={{ height: 1, background: LINE, margin: "14px 0 0" }} />

        <div style={{ padding: "18px 22px 0", display: "flex", gap: 13 }}>
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: BG_ALT,
              border: "1px solid " + BORDER,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={18} color={TEXT} strokeWidth={2.2} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 16, fontWeight: 700, color: TEXT, letterSpacing: "-0.01em" }}>
              {COPY.head}
            </span>
            <span style={{ display: "block", fontSize: 12.5, color: MUTED, lineHeight: 1.55, marginTop: 4 }}>
              {COPY.line}
            </span>
          </span>
        </div>

        {/* The count, as a shape. The two numbers are already in the sentence
            above, so this is the part a sentence cannot do: how much of the
            bar is behind you. */}
        {COPY.bar && (
          <div style={{ padding: "18px 22px 0" }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 9,
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 800, color: c, letterSpacing: "-0.02em" }}>
                {pct}%
              </span>
              <span style={{ fontSize: 11.5, color: MUTED, fontVariantNumeric: "tabular-nums" }}>
                {n(now)} of {n(r.goal)} {r.unit}
              </span>
            </div>
            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: BG_ALT,
                border: "1px solid " + LINE,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: pct + "%",
                  height: "100%",
                  background: c,
                  borderRadius: 999,
                  transition: "width .5s cubic-bezier(.32,.72,0,1)",
                }}
              />
            </div>
          </div>
        )}

        {COPY.list && (
          <div style={{ padding: "14px 22px 0" }}>
            <div
              style={{
                background: BG_ALT,
                border: "1px solid " + LINE,
                borderRadius: 14,
                padding: "6px 12px",
              }}
            >
              {planItems.map((it) => {
                const food = byId(it.id);
                if (!food) return null;
                const done = inAlready.has(it.id);
                return (
                  <div
                    key={it.id}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}
                  >
                    <button
                      onClick={
                        done
                          ? undefined
                          : () => {
                              setRowMenu(null);
                              openMealLog(r.division, r.oi, it);
                            }
                      }
                      disabled={done}
                      aria-label={done ? food.name + " is logged" : "Log " + food.name}
                      style={{
                        width: 20,
                        height: 20,
                        flexShrink: 0,
                        padding: 0,
                        borderRadius: "50%",
                        background: done ? GREEN : BG,
                        border: "1.5px solid " + (done ? GREEN : RULE),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: done ? "default" : "pointer",
                      }}
                    >
                      {done && <Check size={12} color="#fff" strokeWidth={3} />}
                    </button>
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: done ? MUTED : TEXT,
                      }}
                    >
                      {/* Only the name is struck. A decoration on the whole
                          row would carry through the portion, which is not
                          the thing that has been done. */}
                      <span
                        style={
                          done
                            ? { textDecoration: "line-through", textDecorationColor: c }
                            : undefined
                        }
                      >
                        {food.name}
                      </span>{" "}
                      <span style={{ color: MUTED, fontWeight: 400 }}>
                        &middot; {qtyLabel(food, it.qty)}
                      </span>
                    </span>
                    <span style={{ flexShrink: 0, fontSize: 12, color: MUTED }}>
                      {Math.round(food.kcal * it.qty)} cal
                    </span>
                  </div>
                );
              })}
            </div>

            {/* One circle at a time is three trips through the logger, so the
                whole rest goes in one go once there is more than one left.
                With a single item outstanding its own circle is this button. */}
            {left.length > 1 && (
              <button
                onClick={() => {
                  setRowMenu(null);
                  openMealLog(r.division, r.oi);
                }}
                style={{
                  width: "100%",
                  marginTop: 10,
                  background: BG,
                  border: "1px solid " + GREEN,
                  borderRadius: 12,
                  padding: "10px 0",
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: GREEN,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Log the other {left.length}
              </button>
            )}
          </div>
        )}

        {COPY.actions ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "18px 22px 0" }}>
            {COPY.actions.map((a) => (
              <button
                key={a.label}
                onClick={() => {
                  setRowMenu(null);
                  a.run();
                }}
                style={{
                  height: 46,
                  borderRadius: 14,
                  background: a.primary ? COPY.tone : BG,
                  border: a.primary ? "none" : "1px solid " + BORDER,
                  color: a.primary ? "#fff" : TEXT,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        ) : (
        <div style={{ display: "flex", gap: 10, padding: "18px 22px 0" }}>
          {COPY.no && (
            <button
              onClick={() => {
                setRowMenu(null);
                if (mode === "meal" || mode === "partial") undoMeal(r.division);
                if (mode === "steps") toggleSkip(r.id);
              }}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 14,
                background: BG,
                border: "1px solid " + BORDER,
                color: TEXT,
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              {COPY.no}
            </button>
          )}
          <button
            onClick={act}
            style={{
              flex: 1,
              height: 46,
              borderRadius: 14,
              background: COPY.tone,
              border: "none",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            {COPY.yes}
          </button>
        </div>
        )}

        <div style={{ height: 22 }} />
      </div>
    </div>
  );
}
