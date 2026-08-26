import React from "react";
import { Info, Utensils, Flame } from "lucide-react";
import { GREEN, GREEN_TINT, GREEN_WASH, TEXT, MUTED, PILLAR, SH_SM } from "../tokens";

/* Which plans are still being written, said as the plans themselves.

   A sentence about a plan not existing is abstract. Two dashed chips, one per
   coach, in the pillar colours those coaches own, say exactly what is missing
   and roughly what it will look like when it lands. Dashed because the outline
   is there and the contents are not yet.

   It sits inside Today's focus rather than above it, because its whole job is
   to explain the list underneath. */

const CHIP = {
  eat: { Icon: Utensils, label: "Diet plan" },
  move: { Icon: Flame, label: "Exercise plan" },
};

export default function PlanStrip({ pillars, line, onInfo }) {
  return (
    <div
      style={{
        background: GREEN_WASH,
        border: "1px solid " + GREEN_TINT,
        borderRadius: 16,
        padding: "13px 14px",
        marginBottom: 12,
        boxShadow: SH_SM,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 700, color: TEXT }}>
          {pillars.length > 1 ? "Your plans are on the way" : "Your " + CHIP[pillars[0]].label.toLowerCase() + " is on the way"}
        </span>
        <button
          onClick={onInfo}
          aria-label="Why the wait"
          style={{ background: "none", border: "none", padding: 2, margin: -2, cursor: "pointer", display: "flex", flexShrink: 0 }}
        >
          <Info size={15} color={GREEN} strokeWidth={2} />
        </button>
      </div>

      <div style={{ display: "flex", gap: 7, marginTop: 9 }}>
        {pillars.map((id) => {
          const c = PILLAR[id].c;
          const x = CHIP[id];
          return (
            <span
              key={id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                border: "1.4px dashed " + c + "66",
                borderRadius: 999,
                padding: "4px 11px 4px 9px",
                fontSize: 11,
                fontWeight: 700,
                color: c,
              }}
            >
              <x.Icon size={11.5} strokeWidth={2.4} />
              {x.label}
            </span>
          );
        })}
      </div>

      <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginTop: 9 }}>{line}</div>
    </div>
  );
}
