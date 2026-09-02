import React from "react";
import { useWF } from "../state";
import { X, Info, Check, Utensils, Flame } from "lucide-react";
import LotusIcon from "./LotusIcon";
import { GREEN, GREEN_WASH, TEXT, MUTED, PILLAR, SH } from "../tokens";

/* One card in the one place a person watches for their plan.

   Waiting, then one in, then the rest. It was two components before, which
   meant two shapes for one story and a jump between them the moment a plan
   landed. Now the chips stay put and only fill in, so the card a person read
   while waiting is the card that tells them the wait is over.

   The cross appears only once every plan is in. Until then the card still has
   a job: it is the only thing on the screen explaining why part of the day is
   missing, and letting somebody close that would leave the question with no
   answer anywhere. */

/* Three plans, because a consultation produces three. The Mind one was missing
   from the handover entirely, so somebody waiting on their third coach had
   nothing on this card telling them it was coming.

   Named off the pillars: Eat plan, Move plan, Mind plan, from your Eat coach,
   Move coach and Mind coach. The app teaches Eat, Move, Mind and Measure on
   the splash screen, in the explainer, on every task row and in the score
   bubbles, so a handover that switched to diet, exercise and wellbeing made
   somebody learn a second set of words for the four things they already knew.
   One vocabulary, taught once. */
const CHIP = {
  eat: { Icon: Utensils, label: "Eat plan", coach: "Eat coach" },
  move: { Icon: Flame, label: "Move plan", coach: "Move coach" },
  mind: { Icon: LotusIcon, label: "Mind plan", coach: "Mind coach" },
};
const ALL = ["eat", "move", "mind"];

export default function PlanCard() {
  const { plan, kcalSource, movePlan, mindPlan, planSeen, readPlan, setPlanChanged, setPlanInfo } = useWF();
  if (plan !== "paid") return null;

  const IN = { eat: kcalSource === "coach", move: !!movePlan, mind: !!mindPlan };
  const inList = ALL.filter((id) => IN[id]);
  const waiting = ALL.filter((id) => !IN[id]);
  const both = waiting.length === 0;
  const read = both && planSeen.length === ALL.length;

  // Once both are in and read, the card has said everything it has to say.
  if (read) return null;

  /* "On the way" was the wrong promise. It reads as somebody else already
     working on it, when nothing starts until this person books a consultation,
     so the card said the wait was passive and then asked them to act. The
     heading carries the one blocking fact now. */
  const title = both
    ? "Your plans are in"
    : inList.length === 0
    ? "Your plans start with a consultation"
    /* The label keeps its capital. Eat, Move and Mind are proper names
       everywhere else in the app, so lowering the first letter here would
       print "Your eat plan is in" against a chip reading "Eat plan". */
    : "Your " + CHIP[inList[0]].label + " is in";

  const line = both
    ? "Your coaches set your meals, your session and your worksheets, at the hours that suit your day."
    : inList.length === 0
    ? /* One idea, because the heading already carries the other. Two actions in
         one paragraph made the reader decide which of them mattered, and the
         answer is that booking blocks and logging does not. Split by hierarchy
         instead: the blocker is the heading, this is the meanwhile. */
      "Log the tasks below so your coaches can understand how you eat, move and sleep, and curate a plan that fits you better."
    : "Your " + CHIP[inList[0]].coach + " set this one. Your " +
      (waiting.length > 1 ? "other coaches are" : CHIP[waiting[0]].coach + " is") +
      " still writing, and " + (waiting.length > 1 ? "they" : "it") + " will land here too.";

  const open = () => inList.length > 0 && setPlanChanged(both ? "both" : inList[0]);

  /* The whole card opens the plan once there is one to open. A button inside
     it was a second target for the thing the card already is, so the card
     carries the outline and the lift instead and the button is gone. */
  return (
    <div
      role={inList.length ? "button" : undefined}
      tabIndex={inList.length ? 0 : undefined}
      onClick={open}
      onKeyDown={(e) => e.key === "Enter" && open()}
      style={{
        background: GREEN_WASH,
        border: "1px solid " + GREEN + "33",
        borderRadius: 16,
        padding: "13px 14px",
        marginBottom: 12,
        boxShadow: SH,
        cursor: inList.length ? "pointer" : "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 700, color: TEXT }}>
          {title}
        </span>

        {/* While anything is still being written the corner holds the reason
            for the wait. Once both are in there is nothing left to explain, so
            it becomes the way to put the card away. */}
        {both ? (
          <button
            onClick={(e) => { e.stopPropagation(); ALL.forEach(readPlan); }}
            aria-label="Dismiss"
            style={{ background: "none", border: "none", padding: 2, margin: -2, cursor: "pointer", display: "flex", flexShrink: 0 }}
          >
            <X size={15} color={MUTED} strokeWidth={2} />
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setPlanInfo(waiting.length > 1 ? "all" : waiting[0]); }}
            aria-label="Why the wait"
            style={{ background: "none", border: "none", padding: 2, margin: -2, cursor: "pointer", display: "flex", flexShrink: 0 }}
          >
            <Info size={15} color={GREEN} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* All three, always, in the same order. A plan that has landed fills in;
          one still being written keeps the dashed outline it had. */}
      <div style={{ display: "flex", gap: 6, marginTop: 9, flexWrap: "wrap" }}>
        {ALL.map((id) => {
          const c = PILLAR[id].c;
          const x = CHIP[id];
          const on = IN[id];
          return (
            <span
              key={id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: on ? c : "transparent",
                border: on ? "1.4px solid " + c : "1.4px dashed " + c + "66",
                borderRadius: 999,
                padding: on ? "4px 10px 4px 7px" : "4px 10px 4px 8px",
                fontSize: 10.5,
                fontWeight: 700,
                color: on ? "#fff" : c,
                transition: "background .3s ease, color .3s ease",
              }}
            >
              {on ? <Check size={11.5} strokeWidth={3} /> : <x.Icon size={11.5} strokeWidth={2.4} />}
              {x.label}
            </span>
          );
        })}
      </div>

      <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginTop: 9 }}>{line}</div>

      {/* Booking used to sit here as well. It is the first card in Start here
          now, which is on this same screen and is where every other blocking
          job already lives, so the card is back to explaining what is coming
          and why half the day looks thin. */}
    </div>
  );
}
