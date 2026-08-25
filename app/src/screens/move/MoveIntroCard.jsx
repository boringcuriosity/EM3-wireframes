import React from "react";
import { useWF } from "../../state";
import ConnectNudge from "../../components/ConnectNudge";
import { Info, Flame, UserRound, Lock } from "lucide-react";
import Skel from "../../components/Skel";
import { dayMinutes, dayBurn } from "./exercises";
import {
  MOVE_C, MOVE_T, MOVE_W, TEXT, MUTED, FAINT, BG, BORDER, LINE, RULE, INDIGO, SH,
} from "../../tokens";

/* Move's opening card for someone whose coach has not written a routine yet.
   Built the same way as Eat's, because the situation is the same one: nothing
   to follow, nothing to score, and the only useful thing anyone can do is show
   the coach how they already are.

   Once there is something logged it stops explaining and shows the day. */

const BEATS = [
  {
    Icon: Flame,
    t: "Log whatever you did",
    b: "A walk to the shop, the stairs at work, an hour at the gym. All of it counts.",
  },
  {
    Icon: UserRound,
    t: "Your coach reads it",
    b: "They will see what your days actually allow before asking you to change anything.",
  },
];

export default function MoveIntroCard() {
  const { exLogs, daySteps, setPillarInfo, healthSource, setStepsSheet, healthSync } = useWF();
  const worked = exLogs.length > 0;
  const hasData = worked || daySteps !== null || healthSync === "steps";

  const stats = [
    { v: worked ? dayMinutes(exLogs) + "m" : "\u2014", l: "Moved" },
    {
      v: healthSync === "steps" ? null : daySteps === null ? "Add" : daySteps.toLocaleString(),
      l: "Steps",
      onClick:
        healthSource.steps === "manual" && healthSync !== "steps" ? () => setStepsSheet(true) : undefined,
    },
    { v: worked ? String(dayBurn(exLogs)) : "\u2014", l: "Kcal burnt" },
  ];

  return (
    <div
      style={{
        background: BG,
        border: "1px solid " + BORDER,
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: SH,
      }}
    >
      <div
        style={{
          background: MOVE_W,
          borderBottom: "1px solid " + MOVE_T,
          padding: "13px 15px",
          display: "flex",
          alignItems: "flex-start",
          gap: 11,
        }}
      >
        <svg width="28" height="30" viewBox="0 0 22 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden>
          <path
            d="M11 1.2 20.1 6.6v10.8L11 22.8 1.9 17.4V6.6z"
            stroke={INDIGO}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 16.5,
              fontWeight: 600,
              color: TEXT,
              lineHeight: 1.2,
            }}
          >
            {hasData ? "Keep logging." : "Show us how you move."}
          </div>
          <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.45, marginTop: 4 }}>
            {hasData
              ? worked
                ? "The more honest you log, the better your coach can read you. Nothing is judged."
                : "Your steps are in. Log a workout or a walk and the rest fills in."
              : "No routine yet, and nothing to keep up with."}
          </div>
        </div>

        <button
          onClick={() => setPillarInfo("move")}
          aria-label="Why everyday movement matters"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            margin: "-2px -4px 0 0",
            flexShrink: 0,
            display: "flex",
          }}
        >
          <Info size={16} color={MOVE_C} strokeWidth={2.2} />
        </button>
      </div>

      {hasData ? (
        <div style={{ display: "flex", padding: "16px 15px 14px" }}>
          {stats.map((x, i) => {
            const Cell = x.onClick ? "button" : "div";
            return (
              <Cell
                key={x.l}
                onClick={x.onClick}
                style={{
                  flex: 1,
                  minWidth: 0,
                  textAlign: "center",
                  background: "none",
                  border: "none",
                  borderLeft: i === 0 ? "none" : "1px solid " + LINE,
                  padding: 0,
                  cursor: x.onClick ? "pointer" : "default",
                  fontFamily: "inherit",
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: x.v === "—" ? FAINT : x.v === "Add" ? MOVE_C : TEXT,
                    lineHeight: 1.1,
                  }}
                >
                  {x.v === null ? <Skel w={48} h={17} /> : x.v}
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 8.5,
                    fontWeight: 600,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    color: MUTED,
                    marginTop: 4,
                  }}
                >
                  {x.l}
                </div>
              </Cell>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: "12px 15px 2px", position: "relative" }}>
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 28,
              top: 24,
              bottom: 24,
              width: 1.5,
              borderRadius: 1,
              background: LINE,
            }}
          />
          {BEATS.map((x) => (
            <div key={x.t} style={{ display: "flex", gap: 11, marginBottom: 11 }}>
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: MOVE_T,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  zIndex: 1,
                  boxShadow: "0 0 0 4px " + BG,
                }}
              >
                <x.Icon size={13} color={MOVE_C} strokeWidth={2} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: TEXT, lineHeight: 1.35 }}>{x.t}</div>
                <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginTop: 2 }}>{x.b}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: "0 15px 14px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            fontSize: 11,
            color: MUTED,
            lineHeight: 1.4,
          }}
        >
          <Lock size={12} color={RULE} strokeWidth={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Your exercise plan arrives once your coach has seen a few days of this and spoken to you.
          </span>
        </div>

        <ConnectNudge signal="steps" />
      </div>
    </div>
  );
}
