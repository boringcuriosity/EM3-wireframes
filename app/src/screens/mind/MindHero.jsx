import React from "react";
import { useWF } from "../../state";
import { Info, Moon } from "lucide-react";
import Skel from "../../components/Skel";
import { SLEEP_GOAL_MIN, fmtDur } from "./tools";
import { fmtTime } from "../log/foods";
import { MIND_C, MIND_T, TEXT, MUTED, FAINT, RULE, BG, BORDER, SH } from "../../tokens";

/* Mind's hero, the same shape as Eat's and Move's: the one number the pillar
   is about, then the smaller ones behind it.

   Sleep is the number, because it is the part of Mind that actually moves
   metabolism. There is no score here: Eat earns its hexagon from targets a
   coach set, and nobody sets a target for how calm you were. */
export default function MindHero() {
  const { sleepMins, lastNight, mindDone, mindMood, setPillarInfo, healthSync } = useWF();

  const pct = sleepMins === null ? 0 : Math.min(100, Math.round((sleepMins / SLEEP_GOAL_MIN) * 100));
  const syncing = healthSync === "sleep";
  const known = sleepMins !== null;

  const R = 34;
  const C = 2 * Math.PI * R;

  const calm = mindDone.includes("breathing") ? 3 : 0;
  const stats = [
    { v: lastNight ? fmtTime(lastNight.bed) : known ? "11:40 PM" : "—", l: "Bedtime" },
    { v: calm ? calm + " min" : "—", l: "Calm" },
    { v: mindMood ? mindMood : "—", l: "Mood" },
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
            <circle cx="42" cy="42" r={R} fill="none" stroke={MIND_T} strokeWidth="8" />
            <circle
              cx="42"
              cy="42"
              r={R}
              fill="none"
              stroke={MIND_C}
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
            {syncing ? (
              <Skel w={54} h={20} />
            ) : known ? (
              <>
                <span style={{ fontSize: 20, fontWeight: 800, color: TEXT, lineHeight: 1 }}>
                  {fmtDur(sleepMins)}
                </span>
                <span style={{ fontSize: 9.5, color: MUTED, marginTop: 3 }}>slept</span>
              </>
            ) : (
              <Moon size={22} color={RULE} strokeWidth={1.8} />
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>
            {syncing ? "Reading your nights" : known ? "Last night" : "How did you sleep?"}
          </div>
          <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginTop: 4 }}>
            {syncing
              ? "Health Connect is handing over what your phone already has. This takes a moment."
              : !known
              ? "Sleep is the part of Mind that moves your metabolism most. Tell us when you slept and it starts filling in."
              : sleepMins >= SLEEP_GOAL_MIN
              ? "A full night. Your body did most of its repair work while you were out."
              : "Short of " + fmtDur(SLEEP_GOAL_MIN) + ". A short night pushes hunger up and fullness down the next day."}
          </div>
        </div>

        <button
          onClick={() => setPillarInfo("mind")}
          aria-label="Why your body clock matters"
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

      <div style={{ display: "flex", marginTop: 16, paddingTop: 14, borderTop: "1px solid " + BORDER }}>
        {stats.map((x, i) => (
          <div
            key={x.l}
            style={{
              flex: 1,
              minWidth: 0,
              textAlign: "center",
              borderLeft: i === 0 ? "none" : "1px solid " + BORDER,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: x.v === "—" ? FAINT : TEXT, lineHeight: 1.1 }}>
              {x.v}
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
          </div>
        ))}
      </div>

    </div>
  );
}
