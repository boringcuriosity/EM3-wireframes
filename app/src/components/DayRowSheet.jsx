import React from "react";
import { useWF } from "../state";
import { Minus, RotateCcw, X } from "lucide-react";
import { TEXT, MUTED, BG, BG_ALT, BORDER, LINE, GREEN, PILLAR } from "../tokens";

/* The one place a task can be turned down.

   Saying no to something is a real answer and the coach needs it, but a
   decline button beside every ask turns thirteen requests into twenty six
   decisions. So it lives one tap in.

   It asks a question and offers two buttons rather than listing one choice.
   A sheet with a single row in it reads like a menu that failed to load, and
   nothing tells you what happens if you walk away. A question with a yes and
   a no is the shape people already know. */
export default function DayRowSheet() {
  const { rowMenu, setRowMenu, dayRows, daySkipped, toggleSkip } = useWF();
  const r = dayRows.find((x) => x.id === rowMenu);
  if (!r) return null;
  const off = daySkipped.includes(r.id);
  const c = PILLAR[r.pillar].c;

  const act = () => {
    toggleSkip(r.id);
    setRowMenu(null);
  };

  const Icon = off ? RotateCcw : Minus;

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
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: BORDER, margin: "10px auto 0" }} />

        {/* Which task this is about, kept quiet so the question below carries
            the weight. */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "14px 22px 0" }}>
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
              {off ? "Put this back on today?" : "Not doing this today?"}
            </span>
            <span style={{ display: "block", fontSize: 12.5, color: MUTED, lineHeight: 1.55, marginTop: 4 }}>
              {off
                ? "It counts again, so you can still finish the day."
                : "That's fine. It won't count as missed, and your coach will see you chose to skip it."}
            </span>
          </span>
        </div>

        <div style={{ display: "flex", gap: 10, padding: "18px 22px 0" }}>
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
            {off ? "Leave it out" : "Keep it"}
          </button>
          <button
            onClick={act}
            style={{
              flex: 1,
              height: 46,
              borderRadius: 14,
              background: off ? GREEN : TEXT,
              border: "none",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            {off ? "Put it back" : "Skip today"}
          </button>
        </div>

        <div style={{ height: 22 }} />
      </div>
    </div>
  );
}
