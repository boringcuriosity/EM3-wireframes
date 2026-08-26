import React from "react";
import { useWF } from "../state";
import { Minus, RotateCcw, X } from "lucide-react";
import { TEXT, MUTED, BG, BG_ALT, BORDER, LINE, PILLAR } from "../tokens";

/* The one place a task can be turned down.

   Saying no to something is a real answer and the coach needs it, but a
   decline button beside every ask turns thirteen requests into twenty six
   decisions. So it lives one tap in, and it says what skipping actually means,
   because "skip" on its own reads like a confession. */
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

        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 22px 0" }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: c,
              flexShrink: 0,
            }}
          />
          <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>{r.title}</span>
          <button
            onClick={() => setRowMenu(null)}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: -4, display: "flex" }}
          >
            <X size={17} color={MUTED} />
          </button>
        </div>

        <div style={{ height: 1, background: LINE, margin: "16px 22px 0" }} />

        <button
          onClick={act}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            background: "none",
            border: "none",
            padding: "16px 22px",
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "left",
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: BG_ALT,
              border: "1px solid " + BORDER,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {off ? <RotateCcw size={15} color={TEXT} /> : <Minus size={16} color={TEXT} strokeWidth={2.4} />}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: TEXT }}>
              {off ? "Put it back on today" : "Not today"}
            </span>
            <span style={{ display: "block", fontSize: 12, color: MUTED, lineHeight: 1.5, marginTop: 3 }}>
              {off
                ? "It goes back into today's count and your streak."
                : "It leaves today's count, so nothing here reads as missed. Your coach sees you chose to, which is worth knowing."}
            </span>
          </span>
        </button>

        <div style={{ height: 22 }} />
      </div>
    </div>
  );
}
