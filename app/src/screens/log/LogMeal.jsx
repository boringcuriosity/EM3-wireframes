import React, { useState } from "react";
import { useWF } from "../../state";
import { ChevronLeft, Search, Heart, Plus, Minus, X, Clock, Info, Camera, Mic } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BG_ALT, BORDER } from "../../tokens";
import { GOALS, targetsFor } from "../sufficiency/data";
import { FOODS, byId, divisionForTime, DIVISION_LABEL, fmtTime, totals, sufficiency, frequentFrom, SUGGESTED } from "./foods";
import LogEmpty, { SuggestHead } from "./LogEmpty";
import TimeSheet from "./TimeSheet";
import FoodInfoSheet from "./FoodInfoSheet";

/* Log a meal. Search, or pick from what you already eat, build up a meal, say
   when you ate it, and send it. The time matters: it decides which division in
   Eat the food lands in, so it is a first class control rather than a detail. */
export default function LogMeal() {
  const {
    setLogOpen, logItems, setLogItems, logTime, setLogTimeOpen, logTimeOpen,
    favorites, setFavorites, mealsLogged, setMealsLogged, setLogResult, logInfo, setLogInfo,
    suffGoal, suffKcal, logPlan, eatDivisions, setKairaLog, logEditing, setLogEditing,} = useWF();

  /* What the coach picked for this meal, when the logger was opened on a plan.
     Favourites and Frequent know nothing about a plan, so arriving from a meal
     row used to mean searching for your own breakfast by name. */
  const planFoods = logPlan
    ? (((eatDivisions.find((d) => d.id === logPlan.division) || {}).plan || [])[logPlan.oi] || [])
        .map((it) => byId(it.id))
        .filter(Boolean)
    : [];

  /* Land on the plan when there is one, since it is the reason this screen
     opened. Failing that, land on the tab that has something in it: on a first
     run Favourites is empty by definition, and opening on a tab with nothing
     to add is a dead end at the exact moment somebody is trying to log their
     first meal. */
  const [tab, setTab] = useState(planFoods.length ? "plan" : favorites.length ? "fav" : "freq");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  /* What you eat most, counted off your own meals rather than off a tag. On a
     first run there is nothing to count, so the tab offers a few common meals
     under a heading that says what they are. */
  const frequent = frequentFrom(mealsLogged);
  const suggesting = !q && tab === "freq" && frequent.length === 0;
  // Favourites is the one tab that stays empty until somebody fills it, since
  // the only thing that belongs in it is a choice they made.
  const emptyFav = !q && tab === "fav" && !favorites.length;

  const list = q
    ? FOODS.filter((x) => x.name.toLowerCase().includes(q))
    : tab === "plan"
    ? planFoods
    : tab === "fav"
    ? FOODS.filter((x) => favorites.includes(x.id))
    : frequent.length
    ? frequent
    : SUGGESTED;

  const qtyOf = (id) => logItems.find((x) => x.id === id)?.qty || 0;
  const count = logItems.reduce((n, x) => n + x.qty, 0);
  const division = divisionForTime(logTime);

  const bump = (id, by) => {
    const at = logItems.findIndex((x) => x.id === id);
    if (at === -1) return setLogItems(logItems.concat({ id, qty: 1 }));
    const next = logItems[at].qty + by;
    setLogItems(
      next <= 0 ? logItems.filter((x) => x.id !== id) : logItems.map((x, i) => (i === at ? { ...x, qty: next } : x))
    );
  };

  const toggleFav = (id) =>
    setFavorites(favorites.includes(id) ? favorites.filter((x) => x !== id) : favorites.concat(id));

  const submit = () => {
    const goal = GOALS.find((g) => g.id === suffGoal) || GOALS[0];
    const targets = targetsFor(suffGoal, suffKcal ?? goal.kcal);
    const before = sufficiency(totals(mealsLogged), targets);
    const meal = { division, timeMins: logTime, items: logItems };
    /* Editing replaces that slot rather than adding to it, so a correction
       leaves one meal in the day instead of two. */
    const kept = logEditing ? mealsLogged.filter((m) => m.division !== logEditing) : mealsLogged;
    const next = kept.concat(meal);
    const after = sufficiency(totals(next), targets);

    setMealsLogged(next);
    setLogItems([]);
    setLogOpen(false);
    setLogEditing(null);
    setLogResult({ before, after, meal, mealCount: next.length, edited: !!logEditing, fresh: true });
  };

  return (
    <>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 22px 12px",
          }}
        >
          <button
            onClick={() => setLogOpen(false)}
            aria-label="Back"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: BG_ALT,
              border: "1px solid " + BORDER,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={18} color={TEXT} />
          </button>
          <span style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 700, color: TEXT }}>
            Log a meal
          </span>
          <span style={{ width: 34 }} />
        </div>

        {/* Search */}
        <div style={{ flexShrink: 0, padding: "0 22px 12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              background: BG_ALT,
              border: "1px solid " + BORDER,
              borderRadius: 13,
              padding: "11px 13px",
            }}
          >
            <Search size={16} color={MUTED} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a dish or ingredient"
              aria-label="Search a dish or ingredient"
              style={{
                flex: 1,
                minWidth: 0,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 13.5,
                fontFamily: "inherit",
                color: TEXT,
              }}
            />
            {/* Two ways in that are not typing, which is the difference
                between logging once and logging on a Tuesday. Both hand to
                Kaira: reading a plate and hearing a sentence are the two
                things she is for.

                They stand down while there is a query, the way the tabs below
                do. Somebody who has started typing has chosen their way in,
                and a clear button plus two offers is three controls in the
                space of one. */}
            {query ? (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
              >
                <X size={15} color={MUTED} />
              </button>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                <span aria-hidden style={{ width: 1, height: 18, background: BORDER, marginRight: 6 }} />
                {[
                  { id: "snap", Icon: Camera, label: "Log with a photo" },
                  { id: "voice", Icon: Mic, label: "Log by speaking" },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setKairaLog(b.id)}
                    aria-label={b.label}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 4,
                      margin: 0,
                      cursor: "pointer",
                      display: "flex",
                    }}
                  >
                    <b.Icon size={17} color={TEXT} strokeWidth={2} />
                  </button>
                ))}
              </span>
            )}
          </div>
        </div>

        {/* Tabs, hidden while searching because they no longer apply */}
        {!q && (
          <div style={{ flexShrink: 0, display: "flex", gap: 10, padding: "0 22px 8px" }}>
            {[
              // Only when a plan sent you here. A tab leading to nothing is
              // worse than no tab.
              ...(planFoods.length ? [{ id: "plan", label: "Your plan" }] : []),
              { id: "fav", label: "Favourites" },
              { id: "freq", label: "Frequent" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  background: tab === t.id ? TEXT : BG_ALT,
                  border: "1px solid " + (tab === t.id ? TEXT : BORDER),
                  borderRadius: 999,
                  padding: "10px 0",
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: tab === t.id ? "#fff" : MUTED,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 22px 8px", minHeight: 0 }}>
          {/* An empty Frequent still has something to offer, so it says its
              piece and the suggestions run underneath it. */}
          {suggesting && (
            <>
              <LogEmpty tab="freq" />
              <SuggestHead />
            </>
          )}

          {emptyFav ? (
            <LogEmpty tab="fav" />
          ) : list.length === 0 ? (
            <div style={{ padding: "40px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>
                {q ? "Nothing matches “" + query + "”" : "Nothing planned for this one"}
              </div>
              <div style={{ fontSize: 11.5, color: MUTED, marginTop: 6, lineHeight: 1.55 }}>
                {q
                  ? "Try a shorter word, or the name of one ingredient rather than the whole dish."
                  : "Your coach has not written food for this meal yet. Search for what you ate and it still counts."}
              </div>
            </div>
          ) : (
            list.map((food) => {
              const qty = qtyOf(food.id);
              const fav = favorites.includes(food.id);
              return (
                <div
                  key={food.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 10px",
                    margin: "0 -10px",
                    borderRadius: 14,
                    background: qty ? BG_ALT : "transparent",
                    borderBottom: "1px solid " + BORDER,
                    transition: "background .15s",
                  }}
                >
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>{food.name}</span>
                      <button
                        onClick={() => setLogInfo(food.id)}
                        aria-label={"What " + food.name + " gives you"}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          display: "flex",
                          flexShrink: 0,
                        }}
                      >
                        <Info size={13} color={MUTED} />
                      </button>
                    </span>
                    <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2 }}>
                      {food.unit} · {food.kcal} kcal
                    </span>
                  </span>

                  <button
                    onClick={() => toggleFav(food.id)}
                    aria-label={fav ? "Remove from favourites" : "Add to favourites"}
                    aria-pressed={fav}
                    style={{ background: "none", border: "none", padding: 4, cursor: "pointer", flexShrink: 0 }}
                  >
                    <Heart size={17} color={fav ? TEXT : MUTED} fill={fav ? TEXT : "none"} />
                  </button>

                  {qty ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        background: BG,
                        border: "1.5px solid " + GREEN,
                        borderRadius: 11,
                        padding: "5px 8px",
                        flexShrink: 0,
                      }}
                    >
                      <Step onClick={() => bump(food.id, -1)} aria={"One less " + food.name}>
                        <Minus size={13} color={TEXT} strokeWidth={2.6} />
                      </Step>
                      <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, minWidth: 9, textAlign: "center" }}>
                        {qty}
                      </span>
                      <Step onClick={() => bump(food.id, 1)} aria={"One more " + food.name}>
                        <Plus size={13} color={TEXT} strokeWidth={2.6} />
                      </Step>
                    </span>
                  ) : (
                    <button
                      onClick={() => bump(food.id, 1)}
                      aria-label={"Add " + food.name}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 11,
                        background: GREEN,
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      <Plus size={18} color="#fff" strokeWidth={2.6} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* The meal being built */}
        <div style={{ flexShrink: 0, borderTop: "1px solid " + BORDER, padding: "12px 22px 24px" }}>
          {logItems.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 11 }}>
              {logItems.map((it) => {
                const food = byId(it.id);
                return (
                  <span
                    key={it.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: BG_ALT,
                      border: "1px solid " + BORDER,
                      borderRadius: 999,
                      padding: "5px 9px 5px 11px",
                      fontSize: 11.5,
                      color: TEXT,
                    }}
                  >
                    <strong>{it.qty}</strong> {food.name}
                    <button
                      onClick={() => setLogItems(logItems.filter((x) => x.id !== it.id))}
                      aria-label={"Remove " + food.name}
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}
                    >
                      <X size={13} color={MUTED} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: MUTED }}>
              {count === 0
                ? "No items yet"
                : count + (count === 1 ? " item" : " items") + " in this meal"}
            </span>
            <button
              onClick={() => setLogTimeOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: BG_ALT,
                border: "1px solid " + TEXT,
                borderRadius: 999,
                padding: "7px 12px",
                cursor: "pointer",
                flexShrink: 0,
                fontFamily: "inherit",
              }}
            >
              <Clock size={13} color={TEXT} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>{fmtTime(logTime)}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.5 }}>EDIT</span>
            </button>
          </div>

          {count > 0 && (
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 10 }}>
              This will land under <strong style={{ color: TEXT }}>{DIVISION_LABEL[division]}</strong>
            </div>
          )}

          <button
            onClick={() => count > 0 && submit()}
            disabled={count === 0}
            style={{
              width: "100%",
              background: count === 0 ? BG_ALT : GREEN,
              border: "1px solid " + (count === 0 ? BORDER : GREEN),
              borderRadius: 14,
              padding: "14px 0",
              color: count === 0 ? MUTED : "#fff",
              fontSize: 14.5,
              fontWeight: 700,
              cursor: count === 0 ? "default" : "pointer",
              fontFamily: "inherit",
              transition: "background .15s, color .15s",
            }}
          >
            Log meal
          </button>
        </div>
      </div>

      {logTimeOpen && <TimeSheet />}
      {logInfo && <FoodInfoSheet />}
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
        background: BG_ALT,
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
