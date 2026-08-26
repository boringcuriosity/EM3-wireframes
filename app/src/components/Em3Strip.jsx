import React from "react";
import { useWF } from "../state";
import { Utensils, Flame, BarChart3 } from "lucide-react";
import LotusIcon from "./LotusIcon";
import { PILLAR, TEXT, MUTED, LINE, BG, BORDER, SH_SM } from "../tokens";

const META = {
  eat: { label: "Eat", Icon: Utensils },
  move: { label: "Move", Icon: Flame },
  mind: { label: "Mind", Icon: LotusIcon },
  measure: { label: "Measure", Icon: BarChart3 },
};

/* The day, read the other way round.

   The list above is chronological, which is how a day is lived. This is the
   same rows grouped by pillar, which is how metabolism works. Both numbers
   come from one array, so the two readings can never fall out of step, and
   nobody has to be told that a normal day already contains all four. It is
   also the guaranteed way into each pillar's own screen. */
export default function Em3Strip() {
  const { dayRows, setEatDetail, setMoveDetail, setMindDetail, setActiveTab } = useWF();

  const go = {
    eat: () => setEatDetail(true),
    move: () => setMoveDetail(true),
    mind: () => setMindDetail(true),
    measure: () => setActiveTab("med"),
  };

  const groups = ["eat", "move", "mind", "measure"]
    .map((id) => {
      const rows = dayRows.filter((r) => r.pillar === id);
      return { id, ...META[id], total: rows.length, done: rows.filter((r) => r.done).length };
    })
    .filter((g) => g.total > 0);

  return (
    <div
      style={{
        display: "flex",
        background: BG,
        border: "1px solid " + BORDER,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: SH_SM,
      }}
    >
      {groups.map((g, i) => {
        const c = PILLAR[g.id].c;
        const pct = g.done / g.total;
        return (
          <button
            key={g.id}
            onClick={go[g.id]}
            aria-label={g.label + ", " + g.done + " of " + g.total + " done. Open " + g.label}
            style={{
              flex: 1,
              minWidth: 0,
              background: "none",
              border: "none",
              borderLeft: i === 0 ? "none" : "1px solid " + LINE,
              padding: "13px 4px 12px",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ position: "relative", width: 34, height: 34, flexShrink: 0 }}>
              <svg width="34" height="34" viewBox="0 0 34 34" style={{ position: "absolute", inset: 0 }}>
                <circle cx="17" cy="17" r="15" fill={PILLAR[g.id].t} stroke="none" />
                <circle
                  cx="17" cy="17" r="15" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 15}
                  strokeDashoffset={2 * Math.PI * 15 * (1 - pct)}
                  transform="rotate(-90 17 17)"
                  style={{ transition: "stroke-dashoffset .6s cubic-bezier(.32,.72,0,1)" }}
                />
              </svg>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <g.Icon size={14} color={c} strokeWidth={2} />
              </span>
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{g.label}</span>
            <span style={{ fontSize: 10, color: MUTED }}>
              {g.done} of {g.total}
            </span>
          </button>
        );
      })}
    </div>
  );
}
