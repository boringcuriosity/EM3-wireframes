import React from "react";
import { useWF } from "../state";
import { Lock, Clock, Trash2 } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BORDER, LINE, GREEN_TINT } from "../tokens";
import { byId, qtyLabel, fmtTime, timeSlots, divisionForTime, DIVISION_LABEL } from "../screens/log/foods";

const NOW = 13 * 60 + 30; // the prototype's clock reads 1:30 PM

/* The three dot menu on a food. What it offers depends on who put the food
   there. A coach's plan is theirs to change, so this sheet says so plainly
   rather than showing buttons that would only refuse. Anything logged by hand
   can be moved to a different time or taken back out. */
export default function MealItemSheet() {
  const { mealItem, setMealItem, mealsLogged, setMealsLogged } = useWF();
  if (!mealItem) return null;

  const fromPlan = !!mealItem.planId;
  const meal = fromPlan ? null : mealsLogged[mealItem.mealIndex];
  const item = fromPlan
    ? { id: mealItem.planId, qty: mealItem.qty }
    : meal?.items.find((x) => x.id === mealItem.id);
  if (!item) return null;

  const food = byId(item.id);
  const close = () => setMealItem(null);

  const retime = (t) =>
    setMealsLogged(
      mealsLogged.map((m, i) =>
        i === mealItem.mealIndex ? { ...m, timeMins: t, division: divisionForTime(t) } : m
      )
    );

  const remove = () => {
    const next = mealsLogged
      .map((m, i) => (i === mealItem.mealIndex ? { ...m, items: m.items.filter((x) => x.id !== item.id) } : m))
      .filter((m) => m.items.length > 0);
    setMealsLogged(next);
    close();
  };

  return (
    <div
      onClick={close}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        background: "rgba(31,38,48,0.42)",
        display: "flex",
        alignItems: "flex-end",
        animation: "scrimIn .24s ease both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: BG,
          borderRadius: "26px 26px 0 0",
          padding: "10px 0 24px",
          boxShadow: "0 -12px 40px rgba(31,38,48,0.22)",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 2, background: BORDER, margin: "0 auto 16px" }} />

        <div style={{ padding: "0 22px 14px" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: TEXT }}>{food.name}</div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>
            {qtyLabel(food, item.qty)} · {Math.round(food.kcal * item.qty)} cal
            {meal ? " · logged at " + fmtTime(meal.timeMins) : ""}
          </div>
        </div>

        {fromPlan ? (
          <div style={{ padding: "0 22px" }}>
            <div
              style={{
                display: "flex",
                gap: 11,
                background: GREEN_TINT,
                borderRadius: 14,
                padding: "13px 14px",
              }}
            >
              <Lock size={16} color={GREEN} strokeWidth={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5 }}>
                Your nutritionist put this in your plan, so it cannot be edited or deleted here. If it
                does not suit you, say so in your chat and they will swap it.
              </div>
            </div>

            <button
              onClick={close}
              style={{
                width: "100%",
                marginTop: 14,
                background: GREEN,
                border: "none",
                borderRadius: 14,
                padding: "14px 0",
                color: "#fff",
                fontSize: 14.5,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Got it
            </button>
          </div>
        ) : (
          <>
            <div style={{ padding: "0 22px 4px", display: "flex", alignItems: "center", gap: 7 }}>
              <Clock size={14} color={MUTED} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>Change the time</span>
            </div>

            <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "10px 22px 4px", scrollbarWidth: "none" }}>
              {timeSlots(NOW).map((t) => {
                const on = t === meal.timeMins;
                return (
                  <button
                    key={t}
                    onClick={() => retime(t)}
                    style={{
                      flexShrink: 0,
                      background: on ? GREEN : BG,
                      border: "1px solid " + (on ? GREEN : BORDER),
                      borderRadius: 12,
                      padding: "10px 14px",
                      fontSize: 13,
                      fontWeight: on ? 700 : 500,
                      color: on ? "#fff" : TEXT,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {fmtTime(t)}
                  </button>
                );
              })}
            </div>

            <div style={{ padding: "10px 22px 0", fontSize: 11.5, color: MUTED, lineHeight: 1.5 }}>
              This sits under <strong style={{ color: TEXT }}>{DIVISION_LABEL[divisionForTime(meal.timeMins)]}</strong>.
              Change the time and the whole meal moves with it.
            </div>

            <div style={{ height: 1, background: LINE, margin: "16px 22px" }} />

            <div style={{ padding: "0 22px", display: "flex", gap: 10 }}>
              <button
                onClick={remove}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  background: BG,
                  border: "1px solid " + BORDER,
                  borderRadius: 14,
                  padding: "13px 0",
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: "#B42318",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <Trash2 size={15} color="#B42318" strokeWidth={2.2} />
                Delete
              </button>
              <button
                onClick={close}
                style={{
                  flex: 1,
                  background: GREEN,
                  border: "none",
                  borderRadius: 14,
                  padding: "13px 0",
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
