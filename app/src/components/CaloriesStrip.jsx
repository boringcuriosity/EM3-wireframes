import React from "react";
import { Flame } from "lucide-react";
import { TEXT, MUTED, BG, LINE, EAT_C, EAT_W } from "../tokens";

/* Calories, in one line, in two shapes.

   With a goal the card's own background is the progress bar, so the reading is
   there without the strip getting any taller. Without a goal there is no bar to
   draw, because a bar with no end is a lie, and the number stands on its own. */
export default function CaloriesStrip({ kcal, target }) {
  const hasGoal = !!target;
  const pct = hasGoal ? Math.min(100, (kcal / target) * 100) : 0;

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: BG,
        border: "1px solid " + LINE,
        borderRadius: 14,
        padding: "11px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* With a goal, the fill is the card's own background rather than a
          separate track, which is what keeps it slim. */}
      {hasGoal && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: pct + "%",
            background: EAT_W,
            borderRight: pct > 0 && pct < 100 ? "1.5px solid " + EAT_C + "33" : "none",
            transition: "width .9s cubic-bezier(.32,.72,0,1)",
          }}
        />
      )}

      <Flame
        size={15}
        color={kcal > 0 ? EAT_C : MUTED}
        strokeWidth={2}
        style={{ position: "relative", flexShrink: 0 }}
      />

      <span style={{ position: "relative", flex: 1, minWidth: 0, fontSize: 12, color: MUTED }}>
        Calorie intake
      </span>

      <span
        style={{
          position: "relative",
          display: "flex",
          alignItems: "baseline",
          gap: 4,
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            fontSize: 14.5,
            fontWeight: 800,
            color: kcal > 0 ? TEXT : MUTED,
            letterSpacing: -0.2,
          }}
        >
          {kcal.toLocaleString()}
        </span>
        <span style={{ fontSize: 11.5, color: MUTED }}>
          {hasGoal ? "of " + target.toLocaleString() : "kcal"}
        </span>
      </span>
    </div>
  );
}
