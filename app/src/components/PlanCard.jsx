import React from "react";
import { useWF } from "../state";
import { X, Info, Check, Utensils, Flame } from "lucide-react";
import { GREEN, GREEN_WASH, TEXT, MUTED, PILLAR, SH } from "../tokens";

/* One card, four states, in the one place a person watches for their plan.

   Waiting, diet in, exercise in, both in. It was two components before, which
   meant two shapes for one story and a jump between them the moment a plan
   landed. Now the chips stay put and only fill in, so the card a person read
   while waiting is the card that tells them the wait is over.

   The cross appears only once both plans are in. Until then the card still has
   a job: it is the only thing on the screen explaining why one half of the day
   is missing, and letting somebody close that would leave the question with no
   answer anywhere. */

const CHIP = {
  eat: { Icon: Utensils, label: "Diet plan", coach: "nutrition coach" },
  move: { Icon: Flame, label: "Exercise plan", coach: "exercise coach" },
};

export default function PlanCard() {
  const { plan, kcalSource, movePlan, planSeen, readPlan, setPlanChanged, setPlanInfo } = useWF();
  if (plan !== "paid") return null;

  const IN = { eat: kcalSource === "coach", move: !!movePlan };
  const inList = ["eat", "move"].filter((id) => IN[id]);
  const waiting = ["eat", "move"].filter((id) => !IN[id]);
  const both = waiting.length === 0;
  const read = both && planSeen.length === 2;

  // Once both are in and read, the card has said everything it has to say.
  if (read) return null;

  const title = both
    ? "Your plans are in"
    : inList.length === 0
    ? "Your plans are on the way"
    : "Your " + CHIP[inList[0]].label.toLowerCase() + " is in";

  const line = both
    ? "Your coaches set your meals and your session, at the hours that suit your day."
    : inList.length === 0
    ? "Log the tasks below so your coaches can understand how you eat and move, and curate a plan that fits you better."
    : "Your " + CHIP[inList[0]].coach + " set this one. Your " +
      CHIP[waiting[0]].coach + " is still writing the other, and it will land here too.";

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
            onClick={(e) => { e.stopPropagation(); ["eat", "move"].forEach(readPlan); }}
            aria-label="Dismiss"
            style={{ background: "none", border: "none", padding: 2, margin: -2, cursor: "pointer", display: "flex", flexShrink: 0 }}
          >
            <X size={15} color={MUTED} strokeWidth={2} />
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setPlanInfo(waiting.length > 1 ? "both" : waiting[0]); }}
            aria-label="Why the wait"
            style={{ background: "none", border: "none", padding: 2, margin: -2, cursor: "pointer", display: "flex", flexShrink: 0 }}
          >
            <Info size={15} color={GREEN} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Both chips, always, in the same order. A plan that has landed fills
          in; one still being written keeps the dashed outline it had. */}
      <div style={{ display: "flex", gap: 7, marginTop: 9 }}>
        {["eat", "move"].map((id) => {
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
                padding: on ? "4px 11px 4px 8px" : "4px 11px 4px 9px",
                fontSize: 11,
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

    </div>
  );
}
