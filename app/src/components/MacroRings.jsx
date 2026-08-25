import React from "react";
import { useWF } from "../state";
import { TEXT, MUTED } from "../tokens";
import { NUTRIENTS } from "../screens/sufficiency/data";

/* The four macros. Grams are true from the first meal, so they show whether or
   not a plan exists, but a ring needs something to fill towards. Before the
   coach sets the targets there is no denominator, so the numbers stand on
   their own. */
export default function MacroRings() {
  const { dayTotals, dailyTargets, planAssigned } = useWF();

  const rings = dailyTargets.map((t) => {
    const have = { protein: dayTotals.p, carbs: dayTotals.c, fats: dayTotals.f, fibre: dayTotals.fibre }[t.id];
    return {
      ...t,
      have: Math.round(have),
      pct: Math.min(100, Math.round((have / t.target) * 100)),
      tone: NUTRIENTS.find((n) => n.id === t.id).tone,
    };
  });

  if (!planAssigned) {
    return (
      <div style={{ display: "flex", gap: 4 }}>
        {rings.map((r) => (
          <div key={r.id} style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
            <div style={{ fontSize: 19, fontWeight: 800, color: TEXT, lineHeight: 1.1 }}>
              {r.have}
              <span style={{ fontSize: 11, fontWeight: 600, color: MUTED }}>g</span>
            </div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: TEXT, marginTop: 4 }}>{r.label}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {rings.map((r) => {
        const R = 20;
        const C = 2 * Math.PI * R;
        return (
          <div key={r.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ position: "relative", width: 50, height: 50 }}>
              <svg width="50" height="50" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r={R} fill="none" stroke="#F2F4F7" strokeWidth="5" />
                <circle
                  cx="25"
                  cy="25"
                  r={R}
                  fill="none"
                  stroke={r.tone}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - r.pct / 100)}
                  transform="rotate(-90 25 25)"
                  style={{ transition: "stroke-dashoffset .8s cubic-bezier(.32,.72,0,1)" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: TEXT }}>
                  {r.pct}
                  <span style={{ fontSize: 7.5, color: MUTED }}>%</span>
                </span>
              </div>
            </div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: TEXT, marginTop: 5 }}>{r.label}</div>
            <div style={{ fontSize: 9, color: MUTED, marginTop: 1 }}>
              {r.have}/{r.target}g
            </div>
          </div>
        );
      })}
    </div>
  );
}
