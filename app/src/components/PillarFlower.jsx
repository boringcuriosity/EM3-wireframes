import React from "react";
import { Utensils, Flame, BarChart3 } from "lucide-react";
import LotusIcon from "./LotusIcon";
import { TEXT, MUTED, BG, PILLAR, GREEN, SH, SH_SM } from "../tokens";

/* The four pillars as a flower. Each petal is a circle with the corner facing
   the centre squared off, so the four of them close around the hub. Order is
   clockwise from top left: Eat, Move, Measure, Mind — the hub reads "Repeat",
   which is the whole point of the shape. */
const PETALS = [
  { id: "eat", label: "Eat", note: "Fuel", Icon: Utensils, radius: "50% 50% 14px 50%" },
  { id: "move", label: "Move", note: "Burn", Icon: Flame, radius: "50% 50% 50% 14px" },
  { id: "mind", label: "Mind", note: "Calm", Icon: LotusIcon, radius: "50% 14px 50% 50%" },
  { id: "measure", label: "Measure", note: "Know", Icon: BarChart3, radius: "14px 50% 50% 50%" },
];

// Grid order is Eat, Move / Mind, Measure — matching the 2x2 above.
const ORDER = ["eat", "move", "mind", "measure"];

export default function PillarFlower({ size = 260, animate = false, hub = "Repeat" }) {
  const petal = (size - 10) / 2;
  const hubSize = Math.round(size * 0.235);
  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "grid",
        gridTemplateColumns: `repeat(2, ${petal}px)`,
        gridTemplateRows: `repeat(2, ${petal}px)`,
        gap: 10,
      }}
    >
      {ORDER.map((id, i) => {
        const p = PETALS.find((x) => x.id === id);
        return (
          <div
            key={p.id}
            style={{
              width: petal,
              height: petal,
              borderRadius: p.radius,
              // Each petal wears its own pillar, at tint strength, so the four
              // read as four things without turning the screen into a paint box.
              // The stroke is what holds them apart: the tints are pale enough
              // to melt into a white or washed background without one.
              background: PILLAR[p.id].t,
              border: "1.5px solid " + PILLAR[p.id].c + "38",
              boxShadow: SH_SM,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              animation: animate ? `petalIn .5s ${0.08 * i + 0.1}s ease both` : undefined,
            }}
          >
            <p.Icon size={Math.round(size * 0.085)} color={PILLAR[p.id].c} strokeWidth={1.9} />
            <span
              style={{
                fontSize: Math.round(size * 0.052),
                fontWeight: 700,
                color: TEXT,
                letterSpacing: 0.2,
              }}
            >
              {p.label}
            </span>
            <span style={{ fontSize: Math.round(size * 0.04), color: MUTED }}>{p.note}</span>
          </div>
        );
      })}

      {/* Hub — sits over the four squared corners */}
      <div
        style={{
          position: "absolute",
          // Centred with inset, not translate: the petalIn keyframe animates
          // transform and would overwrite a translate(-50%,-50%).
          left: `calc(50% - ${hubSize / 2}px)`,
          top: `calc(50% - ${hubSize / 2}px)`,
          width: hubSize,
          height: hubSize,
          borderRadius: "50%",
          background: BG,
          border: "2px solid " + GREEN,
          boxShadow: SH,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: animate ? "petalIn .45s .45s ease both" : undefined,
        }}
      >
        <span
          style={{
            fontSize: Math.round(size * 0.045),
            fontWeight: 700,
            color: GREEN,
            letterSpacing: 0.2,
          }}
        >
          {hub}
        </span>
      </div>
    </div>
  );
}
