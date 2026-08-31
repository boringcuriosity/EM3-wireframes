import React from "react";
import { useWF } from "../state";
import { Minus, RotateCcw, SquarePen, X } from "lucide-react";
import { TEXT, MUTED, BG, BG_ALT, BORDER, LINE, GREEN, PILLAR } from "../tokens";

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
    water, setWater,
  } = useWF();
  const r = dayRows.find((x) => x.id === rowMenu);
  if (!r) return null;
  const off = daySkipped.includes(r.id);
  const c = PILLAR[r.pillar].c;

  const owned = r.done && !off && r.kind === "tick";
  const isWater = r.done && !off && r.to === "water" && r.now > 0;
  const elsewhere = r.done && !off && r.kind === "go";

  const mode = off ? "back" : owned ? "undo" : isWater ? "less" : elsewhere ? "open" : "skip";

  const COPY = {
    skip: {
      Icon: Minus,
      head: "Not doing this today?",
      line: "That's fine. It won't count as missed, and your coach will see you chose to skip it.",
      no: "Keep it",
      yes: "Skip today",
      tone: TEXT,
    },
    back: {
      Icon: RotateCcw,
      head: "Put this back on today?",
      line: "It counts again, so you can still finish the day.",
      no: "Leave it out",
      yes: "Put it back",
      tone: GREEN,
    },
    undo: {
      Icon: RotateCcw,
      head: "Mark this as not done?",
      line: "It goes back on today's list. Nothing else changes.",
      no: "Leave it done",
      yes: "Mark as not done",
      tone: TEXT,
    },
    less: {
      Icon: Minus,
      head: "Take one off?",
      line: "One glass comes off today's count. Tap the circle to put it back.",
      no: "Leave it",
      yes: "Take one off",
      tone: TEXT,
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
    if (mode === "skip" || mode === "back") toggleSkip(r.id);
    else if (mode === "undo") toggleTick(r.id);
    else if (mode === "less") setWater(Math.max(0, water - 1));
    setRowMenu(null);
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

        <div style={{ display: "flex", gap: 10, padding: "18px 22px 0" }}>
          {COPY.no && (
            <button
              onClick={() => setRowMenu(null)}
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

        <div style={{ height: 22 }} />
      </div>
    </div>
  );
}
