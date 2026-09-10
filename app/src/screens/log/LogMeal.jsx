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
/* THE PLAN IS NOT THE ONLY THING YOU CAN LOG, said where somebody is looking
   at the plan.

   A logger that opens on the coach's food and offers two tabs of your own
   favourites reads, quite reasonably, as a menu you have to pick from. People
   eat what they eat, and a day logged honestly is worth more to a coach than
   a day logged obediently. The search bar has been at the top of this screen
   the whole time; nothing said out loud that it was for this. */
function Anything() {
  return (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 9,
      background: BG_ALT,
      border: "1px solid " + BORDER,
      borderRadius: 13,
      padding: "11px 12px",
      margin: "4px 0 10px",
    }}
  >
    <Search size={14} color={MUTED} style={{ flexShrink: 0, marginTop: 1 }} />
    <span style={{ flex: 1, minWidth: 0, fontSize: 11.5, color: TEXT, lineHeight: 1.5 }}>
      Ate something else? Search for it at the top. Anything you log counts,
      on the plan or not, and your coach would rather see the real day.
    </span>
  </div>
);
}

export default function LogMeal() {
  const {
    setLogOpen, logItems, setLogItems, logTime, setLogTimeOpen, logTimeOpen,
    favorites, setFavorites, mealsLogged, setMealsLogged, setLogResult, logInfo, setLogInfo,
    suffGoal, suffKcal, logPlan, eatDivisions, setKairaLog, logEditing, setLogEditing,} = useWF();

  /* What the coach picked for this meal, when the logger was opened on a plan.
     Favourites and Frequent know nothing about a plan, so arriving from a meal
     row used to mean searching for your own breakfast by name.

     EVERY OPTION, NOT THE ONE YOU CAME THROUGH. A meal row carries the option
     it was tapped on and this read `plan[logPlan.oi]`, so a breakfast the
     coach wrote three ways arrived here as one. The choice was the point: the
     day's list offers Option 1 and Option 2 side by side and then the logger
     quietly decided for you, and a person who fancied the other one had to
     search for their own coach's food by name. */
  const planDiv = logPlan ? eatDivisions.find((d) => d.id === logPlan.division) : null;
  const planAll = ((planDiv || {}).plan || [])
    .map((opt, i) => ({
      oi: i,
      label: "Option " + (i + 1),
      // The one the row was tapped on, marked so it stays obvious which was meant.
      came: i === (logPlan ? logPlan.oi ?? 0 : 0),
      foods: opt.map((it) => byId(it.id)).filter(Boolean),
    }))
    .filter((g) => g.foods.length);

  /* WHAT EVERY OPTION SHARES, LIFTED OUT OF ALL OF THEM.

     A breakfast written three ways is rarely three breakfasts. It is a curd
     and an egg that never change, and one main that does. Printed as three
     complete options that is eleven rows to read six things from, with the
     curd appearing three times and quietly implying you might want three.

     Pulled apart, the plan says what it actually is: here is what you are
     having either way, and here is the choice. Six rows, and the shape of the
     coach's thinking is visible rather than buried in the repetition.

     Not done when it would empty an option. An option whose every item is
     shared is not a variant, and a header with nothing under it reads as a
     bug rather than as a base. */
  const shared =
    planAll.length > 1
      ? planAll[0].foods.filter((f) => planAll.every((g) => g.foods.some((x) => x.id === f.id)))
      : [];
  const splitOk = shared.length > 0 && planAll.every((g) => g.foods.length > shared.length);
  const planCommon = splitOk ? shared : [];
  const planGroups = splitOk
    ? planAll.map((g) => ({ ...g, foods: g.foods.filter((f) => !shared.some((x) => x.id === f.id)) }))
    : planAll;
  const planFoods = planCommon.concat(planGroups.flatMap((g) => g.foods));

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




  const FoodRow = (food) => {
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
  };

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
            tab === "plan" && !q && planGroups.length > 1 ? (
              /* One block per option the coach wrote, in the order they wrote
                 them, with the one the row was tapped on marked. Two options
                 rendered as one flat list reads as a single long meal rather
                 than as a choice between two. */
              <>
                {planCommon.length > 0 && (
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: MUTED, margin: "6px 0 4px" }}>
                      In every option
                    </div>
                    {planCommon.map(FoodRow)}
                  </div>
                )}
                {planGroups.map((g) => (
                  <div key={g.oi} style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "6px 0 4px" }}>
                      <span
                        style={{
                          fontSize: 9.5, fontWeight: 700, letterSpacing: 1,
                          textTransform: "uppercase", color: g.came ? TEXT : MUTED,
                        }}
                      >
                        {g.label}
                      </span>
                      {g.came && (
                        <span
                          style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: 0.4,
                            color: GREEN, background: BG_ALT,
                            borderRadius: 999, padding: "2px 7px",
                          }}
                        >
                          SELECTED
                        </span>
                      )}
                    </div>
                    {g.foods.map(FoodRow)}
                  </div>
                ))}
                <Anything />
              </>
            ) : (
              <>
                {list.map(FoodRow)}
                {tab === "plan" && !q && <Anything />}
              </>
            )
          )}
        </div>

        {/* The meal being built */}
        <div style={{ flexShrink: 0, borderTop: "1px solid " + BORDER, padding: "12px 22px 24px" }}>
          {logItems.length > 0 && (
            /* Two rows that hug, and then it scrolls sideways.

               It wrapped once, so a meal of eight things grew the tray to four
               rows and pushed the plan up off the screen: the list you are
               choosing from shrinks as you choose from it, which is exactly
               backwards.

               A two row grid fixed the height and broke the chips. Columns take
               the width of their widest member, so "2 Boiled egg" stretched to
               the width of "2 Lauki oats besan chilla" underneath it and sat in
               a pill half full of nothing. Two plain rows inside one scroller
               instead: every chip is its own width, each row packs tight, and
               the pair scroll together. */
            <div style={{ overflowX: "auto", marginBottom: 11 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, width: "max-content" }}>
                {[
                  logItems.slice(0, Math.ceil(logItems.length / 2)),
                  logItems.slice(Math.ceil(logItems.length / 2)),
                ]
                  // Split down the middle rather than every other one, so each
                  // row still reads left to right in the order things went in.
                  .filter((row) => row.length)
                  .map((row, ri) => (
                    <div key={ri} style={{ display: "flex", gap: 7 }}>
                      {row.map((it) => {
                        const food = byId(it.id);
                        return (
                          /* Two targets in one pill. The label opens what the
                             food actually gives you, the same sheet its row
                             above opens, and only the cross removes it. A chip
                             that could only be deleted made the tray a list of
                             things to undo rather than the meal itself. */
                          <span
                            key={it.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              flexShrink: 0,
                              background: BG_ALT,
                              border: "1px solid " + BORDER,
                              borderRadius: 999,
                              fontSize: 11.5,
                              color: TEXT,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <button
                              onClick={() => setLogInfo(it.id)}
                              aria-label={"What " + food.name + " gives you"}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                background: "none",
                                border: "none",
                                padding: "5px 4px 5px 11px",
                                margin: 0,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                fontSize: 11.5,
                                color: TEXT,
                              }}
                            >
                              <strong>{it.qty}</strong> {food.name}
                            </button>
                            <button
                              onClick={() => setLogItems(logItems.filter((x) => x.id !== it.id))}
                              aria-label={"Remove " + food.name}
                              style={{
                                background: "none",
                                border: "none",
                                padding: "5px 9px 5px 4px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <X size={13} color={MUTED} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ))}
              </div>
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
