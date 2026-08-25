import React from "react";
import { useWF } from "../../state";
import { GREEN, TEXT, MUTED, BG, BG_ALT, BORDER } from "../../tokens";
import { GOALS, targetsFor, NUTRIENTS } from "../sufficiency/data";
import { byId } from "./foods";

/* What one dish actually gives you, opened from the info dot on its row. Shows
   grams against your own daily target, because "5g of protein" means nothing
   until you know you are aiming at 115. */
export default function FoodInfoSheet() {
  const { logInfo, setLogInfo, logItems, setLogItems, suffGoal, suffKcal } = useWF();
  const food = byId(logInfo);
  if (!food) return null;

  const goal = GOALS.find((g) => g.id === suffGoal) || GOALS[0];
  const targets = targetsFor(suffGoal, suffKcal ?? goal.kcal);
  const inMeal = logItems.find((x) => x.id === food.id);

  const rows = [
    { id: "protein", label: "Protein", g: food.p },
    { id: "carbs", label: "Carbs", g: food.c },
    { id: "fats", label: "Fats", g: food.f },
    { id: "fibre", label: "Fibre", g: food.fibre },
  ].map((r) => {
    const t = targets.find((x) => x.id === r.id).target;
    return { ...r, target: t, pct: Math.round((r.g / t) * 100), tone: NUTRIENTS.find((n) => n.id === r.id).tone };
  });

  return (
    <div
      onClick={() => setLogInfo(null)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 49,
        background: "rgba(31,38,48,0.42)",
        display: "flex",
        alignItems: "flex-end",
        animation: "scrimIn .24s ease both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="food-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: BG,
          borderRadius: "26px 26px 0 0",
          padding: "10px 22px 24px",
          boxShadow: "0 -12px 40px rgba(31,38,48,0.22)",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 2, background: BORDER, margin: "0 auto 16px" }} />

        <div id="food-title" style={{ fontSize: 19, fontWeight: 700, color: TEXT }}>
          {food.name}
        </div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>
          {food.unit} · <strong style={{ color: TEXT }}>{food.kcal} kcal</strong>
        </div>

        <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.9, margin: "20px 0 12px" }}>
          WHAT IT GIVES YOU
        </div>

        {rows.map((r) => (
          <div key={r.id} style={{ marginBottom: 13 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT, flex: 1 }}>{r.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{r.g}g</span>
              <span style={{ fontSize: 11, color: MUTED }}>{r.pct}% of your day</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "#F2F4F7", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: Math.min(100, r.pct) + "%",
                  background: r.tone,
                  borderRadius: 3,
                }}
              />
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: 4,
            background: BG_ALT,
            border: "1px solid " + BORDER,
            borderRadius: 12,
            padding: "11px 13px",
            fontSize: 10.5,
            color: MUTED,
            lineHeight: 1.55,
          }}
        >
          Typical amounts for {food.unit.toLowerCase()} of home cooking. Oil, portion size and how it
          is made will shift these, so treat them as close rather than exact.
        </div>

        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => {
              if (!inMeal) setLogItems(logItems.concat({ id: food.id, qty: 1 }));
              setLogInfo(null);
            }}
            style={{
              width: "100%",
              background: inMeal ? BG : GREEN,
              border: "1px solid " + (inMeal ? TEXT : GREEN),
              borderRadius: 14,
              padding: "13px 0",
              color: inMeal ? TEXT : "#fff",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {inMeal ? "Already in this meal" : "Add to this meal"}
          </button>
        </div>
      </div>
    </div>
  );
}
