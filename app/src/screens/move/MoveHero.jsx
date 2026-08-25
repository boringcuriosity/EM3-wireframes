import React from "react";
import { useWF } from "../../state";
import { Info } from "lucide-react";
import Skel from "../../components/Skel";
import { dayMinutes, dayBurn, DAILY_GOAL_MIN } from "./exercises";
import {
  MOVE_C, MOVE_T, TEXT, MUTED, FAINT, RULE, BG, BORDER, SH,
} from "../../tokens";

/* Move's hero, built the way Eat's is: the one number the pillar is about,
   then the smaller ones that make it up.

   Minutes moved is the number. Steps come from the phone rather than from
   logging, so they sit beside it as a reading rather than a score, and they
   read as unknown until a source exists. */
export default function MoveHero() {
  const { exLogs, daySteps, setPillarInfo, healthSource, setStepsSheet, healthSync } = useWF();

  const mins = dayMinutes(exLogs);
  const kcal = dayBurn(exLogs);
  const pct = Math.min(100, Math.round((mins / DAILY_GOAL_MIN) * 100));

  const R = 34;
  const C = 2 * Math.PI * R;

  /* When steps come from Health Connect they are a reading. When the person
     enters them they are a control, so the cell has to be tappable. */
  const ownSteps = healthSource.steps === "manual";
  const stats = [
    {
      v: healthSync === "steps" ? null : daySteps === null ? "Add" : daySteps.toLocaleString(),
      l: "Steps",
      onClick: ownSteps && healthSync !== "steps" ? () => setStepsSheet(true) : undefined,
    },
    { v: String(exLogs.length), l: "Workouts" },
    { v: kcal ? String(kcal) : "—", l: "Kcal burnt" },
  ];

  return (
    <div
      style={{
        background: BG,
        border: "1px solid " + BORDER,
        borderRadius: 20,
        padding: 18,
        boxShadow: SH,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative", width: 84, height: 84, flexShrink: 0 }}>
          <svg width="84" height="84" viewBox="0 0 84 84">
            <circle cx="42" cy="42" r={R} fill="none" stroke={MOVE_T} strokeWidth="8" />
            <circle
              cx="42"
              cy="42"
              r={R}
              fill="none"
              stroke={MOVE_C}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - pct / 100)}
              transform="rotate(-90 42 42)"
              style={{ transition: "stroke-dashoffset .8s cubic-bezier(.32,.72,0,1)" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 23, fontWeight: 800, color: mins ? TEXT : RULE, lineHeight: 1 }}>
              {mins}
            </span>
            <span style={{ fontSize: 9.5, color: MUTED, marginTop: 2 }}>min</span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>
            {mins >= DAILY_GOAL_MIN ? "Today's movement is in" : "Minutes moved today"}
          </div>
          <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginTop: 4 }}>
            {mins >= DAILY_GOAL_MIN
              ? "You are past " + DAILY_GOAL_MIN + " minutes. Anything more is a bonus."
              : mins > 0
              ? DAILY_GOAL_MIN - mins + " more minutes and today counts."
              : "Your goal is " + DAILY_GOAL_MIN + " minutes. A walk to the shop counts."}
          </div>
        </div>

        <button
          onClick={() => setPillarInfo("move")}
          aria-label="Why everyday movement matters"
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            flexShrink: 0,
            background: BG,
            border: "1px solid " + BORDER,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <Info size={14} color={MUTED} strokeWidth={2} />
        </button>
      </div>

      {/* The readings behind it */}
      <div style={{ display: "flex", marginTop: 16, paddingTop: 14, borderTop: "1px solid " + BORDER }}>
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
                borderLeft: i === 0 ? "none" : "1px solid " + BORDER,
                padding: 0,
                cursor: x.onClick ? "pointer" : "default",
                fontFamily: "inherit",
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: x.v === "—" ? FAINT : x.v === "Add" ? MOVE_C : TEXT,
                  lineHeight: 1.1,
                }}
              >
                {x.v === null ? <Skel w={44} h={15} /> : x.v}
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

    </div>
  );
}
