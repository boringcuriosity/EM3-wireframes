import React, { useState } from "react";
import { useWF } from "../../state";
import { Plus, Minus } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BG_ALT, BORDER } from "../../tokens";
import { FlowScreen, Cta, Title } from "./parts";
import { MEALS } from "./data";

/* Step three. Tap a dish, tap again for a second helping. No searching, no
   weighing, no calorie box. The list is the food people actually eat here. */
export default function Meals() {
  const { setSuffFlow, suffMeals, setSuffMeals } = useWF();
  const [adding, setAdding] = useState(null); // meal id whose sheet is open
  const [custom, setCustom] = useState("");
  const [qty, setQty] = useState(1);

  const picked = (mealId, name) => (suffMeals[mealId] || []).find((x) => x.name === name);
  const total = MEALS.reduce((n, m) => n + (suffMeals[m.id] || []).length, 0);

  const bump = (mealId, name, by) => {
    const list = suffMeals[mealId] || [];
    const at = list.findIndex((x) => x.name === name);
    let next;
    if (at === -1) next = list.concat({ name, qty: 1 });
    else if (list[at].qty + by <= 0) next = list.filter((_, i) => i !== at);
    else next = list.map((x, i) => (i === at ? { ...x, qty: x.qty + by } : x));
    setSuffMeals({ ...suffMeals, [mealId]: next });
  };

  const addCustom = () => {
    const name = custom.trim();
    if (!name) return;
    const list = suffMeals[adding] || [];
    setSuffMeals({ ...suffMeals, [adding]: list.concat({ name, qty }) });
    setAdding(null);
    setCustom("");
    setQty(1);
  };

  return (
    <>
      <FlowScreen
        step="meals"
        onBack={() => setSuffFlow("profile")}
        footer={
          <Cta disabled={total === 0} onClick={() => total > 0 && setSuffFlow("computing")}>
            {total === 0 ? "Pick at least one dish" : "Show me what it gives"}
          </Cta>
        }
      >
        <div style={{ padding: "0 22px 18px" }}>
          <Title sub="Pick a typical day, not a perfect one. Tap again for a second helping. You can change all of this later.">
            What do you
            <br />
            usually eat?
          </Title>
        </div>

        {MEALS.map((m) => {
          const extras = (suffMeals[m.id] || []).filter((x) => !m.options.includes(x.name));
          return (
            <div key={m.id} style={{ padding: "0 22px 20px" }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: MUTED,
                  letterSpacing: 0.9,
                  marginBottom: 10,
                }}
              >
                {m.label.toUpperCase()}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {m.options.concat(extras.map((e) => e.name)).map((name) => {
                  const p = picked(m.id, name);
                  return p ? (
                    <span
                      key={name}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: BG_ALT,
                        border: "1.5px solid " + GREEN,
                        borderRadius: 999,
                        padding: "5px 6px 5px 5px",
                      }}
                    >
                      <Step onClick={() => bump(m.id, name, -1)} aria={"One less " + name}>
                        <Minus size={12} color={TEXT} strokeWidth={2.6} />
                      </Step>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>{p.qty}</span>
                      <span style={{ fontSize: 12.5, color: TEXT }}>{name}</span>
                      <Step onClick={() => bump(m.id, name, 1)} aria={"One more " + name}>
                        <Plus size={12} color={TEXT} strokeWidth={2.6} />
                      </Step>
                    </span>
                  ) : (
                    <button
                      key={name}
                      onClick={() => bump(m.id, name, 1)}
                      style={{
                        background: BG,
                        border: "1px solid " + BORDER,
                        borderRadius: 999,
                        padding: "9px 15px",
                        fontSize: 12.5,
                        color: TEXT,
                        fontFamily: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      {name}
                    </button>
                  );
                })}

                <button
                  onClick={() => setAdding(m.id)}
                  style={{
                    background: "none",
                    border: "1px dashed " + BORDER,
                    borderRadius: 999,
                    padding: "9px 15px",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: MUTED,
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                >
                  + Add your own
                </button>
              </div>
            </div>
          );
        })}

        <div style={{ height: 4 }} />
      </FlowScreen>

      {/* Add your own */}
      {adding && (
        <div
          onClick={() => setAdding(null)}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 45,
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
              overflow: "hidden",
              padding: "10px 22px 24px",
              boxShadow: "0 -12px 40px rgba(31,38,48,0.22)",
              animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
            }}
          >
            <div
              style={{
                width: 38,
                height: 4,
                borderRadius: 2,
                background: BORDER,
                margin: "0 auto 18px",
              }}
            />
            <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>
              Add to {MEALS.find((m) => m.id === adding).label.toLowerCase()}
            </div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
              Anything you usually have. Home food counts.
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <input
                autoFocus
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustom()}
                placeholder="e.g. besan chilla"
                aria-label="Dish name"
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: "1px solid " + BORDER,
                  borderRadius: 12,
                  padding: "12px 13px",
                  fontSize: 14,
                  fontFamily: "inherit",
                  color: TEXT,
                  outline: "none",
                }}
              />
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  border: "1px solid " + BORDER,
                  borderRadius: 12,
                  padding: "0 10px",
                  flexShrink: 0,
                }}
              >
                <Step onClick={() => setQty(Math.max(1, qty - 1))} aria="One less">
                  <Minus size={13} color={TEXT} strokeWidth={2.6} />
                </Step>
                <span style={{ fontSize: 14, fontWeight: 700, color: TEXT, minWidth: 10, textAlign: "center" }}>
                  {qty}
                </span>
                <Step onClick={() => setQty(qty + 1)} aria="One more">
                  <Plus size={13} color={TEXT} strokeWidth={2.6} />
                </Step>
              </span>
            </div>

            <div style={{ marginTop: 16 }}>
              <Cta disabled={!custom.trim()} onClick={addCustom}>
                Add to {MEALS.find((m) => m.id === adding).label.toLowerCase()}
              </Cta>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Step({ onClick, children, aria }) {
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: BG,
        border: "1px solid " + BORDER,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}
