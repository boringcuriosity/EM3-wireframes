import React, { useState, useRef, useEffect } from "react";
import { useWF } from "../state";
import { Check, ChevronRight, Plus } from "lucide-react";
import Skel from "./Skel";
import Confetti from "./Confetti";
import { PILLAR, TEXT, MUTED, FAINT, LINE, BG } from "../tokens";

const PILLAR_NAME = { eat: "Eat", move: "Move", mind: "Mind", measure: "Measure" };

/* One thing to do, at the hour it happens.

   The circle is the only pillar mark on the row. A coloured pill on every line
   would be thirteen pills down a screen, and the colour says the same thing in
   none of the space. The name still reaches a screen reader through the label.

   Nothing here is ever struck through. Strike-through is for cancelled, and a
   meal you have not logged yet is not cancelled. */
export default function DayRow({ row: r, last, compact }) {
  const { openRow } = useWF();
  const c = PILLAR[r.pillar].c;

  /* The moment a row goes done, once. Rows that send you off to another screen
     come back already ticked, so this fires on the way back in, which is
     exactly when the person is looking for the reward. */
  const wasDone = useRef(r.done);
  const [burst, setBurst] = useState(false);
  useEffect(() => {
    if (r.done && !wasDone.current) {
      wasDone.current = true;
      setBurst(true);
      const t = setTimeout(() => setBurst(false), 800);
      return () => clearTimeout(t);
    }
    wasDone.current = r.done;
  }, [r.done]);
  const bar = r.kind === "target";
  const pct = bar && r.now ? Math.min(100, Math.round((r.now / r.goal) * 100)) : 0;

  return (
    <button
      onClick={() => openRow(r)}
      aria-label={r.title + ", " + PILLAR_NAME[r.pillar] + (r.done ? ", done" : "")}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        textAlign: "left",
        background: "none",
        border: "none",
        borderBottom: last ? "none" : "1px solid " + LINE,
        padding: compact ? "9px 0" : "12px 0",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      <span
        style={{
          width: 21,
          height: 21,
          borderRadius: "50%",
          flexShrink: 0,
          marginTop: 1,
          background: r.done ? c : BG,
          border: "1.8px solid " + (r.done ? c : c + "66"),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          transition: "background .18s ease",
        }}
      >
        {r.done && <Check size={12} color="#fff" strokeWidth={3.2} />}
        {burst && <Confetti pillar={r.pillar} />}
      </span>

      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: 13.5,
            fontWeight: r.done ? 600 : 700,
            color: r.done ? MUTED : TEXT,
            lineHeight: 1.35,
          }}
        >
          <span style={{ position: "relative", display: "inline-block" }}>
            {r.title}
            {r.done && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "54%",
                  height: 1.5,
                  borderRadius: 1,
                  background: MUTED,
                  transformOrigin: "left center",
                  transform: burst ? undefined : "scaleX(1)",
                  animation: burst ? "strikeIn .34s cubic-bezier(.4,0,.2,1) forwards" : undefined,
                }}
              />
            )}
          </span>
        </span>

        {r.tip && !r.done && !compact && (
          <span style={{ display: "block", fontSize: 11.5, color: MUTED, lineHeight: 1.45, marginTop: 3 }}>
            {r.tip}
          </span>
        )}

        {bar && !compact && (
          <span style={{ display: "block", marginTop: 7 }}>
            <span style={{ display: "block", height: 4, borderRadius: 2, background: LINE, overflow: "hidden" }}>
              <span
                style={{
                  display: "block",
                  height: "100%",
                  width: pct + "%",
                  background: c,
                  borderRadius: 2,
                  transition: "width .5s cubic-bezier(.32,.72,0,1)",
                }}
              />
            </span>
            <span style={{ display: "block", fontSize: 10.5, color: MUTED, marginTop: 5 }}>
              {r.syncing ? (
                <Skel w={72} h={10} />
              ) : (
                (r.now === null ? 0 : r.now).toLocaleString() + " of " + r.goal.toLocaleString() + " " + r.unit
              )}
            </span>
          </span>
        )}
      </span>

      <span style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, marginTop: 2 }}>
        {r.when && (
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9.5,
              fontWeight: 600,
              color: r.done ? FAINT : MUTED,
              whiteSpace: "nowrap",
            }}
          >
            {r.when}
          </span>
        )}
        {r.kind === "go" && <ChevronRight size={15} color={FAINT} strokeWidth={2.2} />}
        {r.add && !r.done && (
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: PILLAR[r.pillar].t,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus size={12} color={c} strokeWidth={2.6} />
          </span>
        )}
      </span>
    </button>
  );
}
