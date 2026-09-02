import React, { useState } from "react";
import { useWF } from "../state";
import { X, Utensils, Flame, Check } from "lucide-react";
import { GREEN, GREEN_DEEP, TEXT, MUTED, FAINT, BG, BG_ALT, BORDER, LINE, PILLAR } from "../tokens";

/* What the coach actually set, opened from the arrival card.

   The card announces. This answers. It is opened by choice rather than pushed
   on open, and it shows the plan as the plan, meal by meal, rather than making
   somebody find the changes among fourteen rows. It ends on a button that
   closes the card for good, so reading it and dismissing it are the same
   action. */

/* Named off the pillars, the same as the handover card and the waiting sheet.
   One vocabulary across the three surfaces that talk about a plan. */
const HEAD = {
  eat: { Icon: Utensils, coach: "Eat coach", title: "Your food, meal by meal" },
  move: { Icon: Flame, coach: "Move coach", title: "Your session, and your steps" },

};

const MOVE_ROWS = [
  { t: "Your exercise session", s: "Six moves, about 40 minutes", w: "7:00 - 8:00 PM" },
  { t: "Your step target", s: "10,000 steps across the day", w: "All day" },
];

export default function PlanChangedSheet() {
  const { planChanged, setPlanChanged, eatDivisions } = useWF();
  /* Which half is showing when both landed together. Two plans from two
     coaches read better as two tabs than as one long scroll where the second
     coach's work is whatever is left at the bottom. */
  const [tab, setTab] = useState("eat");
  if (!planChanged) return null;

  const id = planChanged === "both" ? tab : planChanged;
  const both = planChanged === "both";
  const hue = PILLAR[id];
  const h = HEAD[id];
  const close = () => setPlanChanged(null);
  /* Reading the plan closes the sheet and nothing else. Putting the card away
     is the cross's job: somebody who opens this to check a meal time should not
     lose the card that got them here. */
  const done = () => setPlanChanged(null);

  const meals = eatDivisions.filter((d) => (d.plan || []).length > 0);
  const notes = eatDivisions.flatMap((d) => d.notes || []);

  return (
    <div
      onClick={close}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 55,
        background: "rgba(16,24,40,0.46)",
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
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          maxHeight: "88%",
          display: "flex",
          flexDirection: "column",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >

        <div style={{ flex: 1, overflowY: "auto", padding: "22px 22px 0", minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: PILLAR[id].t,
                color: PILLAR[id].c,
                borderRadius: 999,
                padding: "4px 11px 4px 8px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              {React.createElement(HEAD[id].Icon, { size: 12, strokeWidth: 2.2 })}
              {HEAD[id].coach.toUpperCase()}
            </span>
            <span style={{ flex: 1 }} />
            <button
              onClick={close}
              aria-label="Close"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: -4 }}
            >
              <X size={17} color={MUTED} />
            </button>
          </div>

          <h2
            style={{
              margin: "13px 0 0",
              fontSize: 21,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: TEXT,
              lineHeight: 1.25,
            }}
          >
            {h.title}
          </h2>

          <p style={{ margin: "8px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>
            {id === "move"
              ? "This is now on your day in the evening, with a step target that runs alongside it."
              : "These are now on your day at the times below, each with a couple of ways to eat it. Pick whichever one you actually had."}
          </p>

          {both && (
            <div
              style={{
                display: "flex",
                gap: 6,
                marginTop: 14,
                background: BG_ALT,
                border: "1px solid " + LINE,
                borderRadius: 999,
                padding: 3,
              }}
            >
              {["eat", "move"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    background: tab === t ? BG : "transparent",
                    border: "1px solid " + (tab === t ? BORDER : "transparent"),
                    borderRadius: 999,
                    padding: "7px 0",
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: tab === t ? PILLAR[t].c : MUTED,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {React.createElement(HEAD[t].Icon, { size: 12.5, strokeWidth: 2.2 })}
                  {t === "eat" ? "Eat plan" : "Move plan"}
                </button>
              ))}
            </div>
          )}

          {/* The plan itself. Meals with their windows and how many ways there
              are to eat each one, or the session and the steps. */}
          <div
            style={{
              marginTop: 16,
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {id === "eat"
              ? meals.map((d, i) => (
                  <div
                    key={d.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 14px",
                      borderBottom: i === meals.length - 1 ? "none" : "1px solid " + LINE,
                    }}
                  >
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: TEXT }}>
                        {d.name}
                      </span>
                      <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2 }}>
                        {d.plan.length === 1 ? "One way to eat it" : d.plan.length + " ways to eat it"}
                      </span>
                    </span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 9.5,
                        fontWeight: 600,
                        color: FAINT,
                        flexShrink: 0,
                      }}
                    >
                      {d.time}
                    </span>
                  </div>
                ))
              : MOVE_ROWS.map((x, i) => (
                  <div
                    key={x.t}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 14px",
                      borderBottom: i === 0 ? "1px solid " + LINE : "none",
                    }}
                  >
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: TEXT }}>{x.t}</span>
                      <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2 }}>{x.s}</span>
                    </span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 9.5,
                        fontWeight: 600,
                        color: FAINT,
                        flexShrink: 0,
                      }}
                    >
                      {x.w}
                    </span>
                  </div>
                ))}
          </div>

          {/* The parts of the plan that are not food, kept separate here for
              the same reason they are separate on the Eat screen. */}
          {id === "eat" && notes.length > 0 && (
            <div
              style={{
                marginTop: 12,
                background: BG_ALT,
                border: "1px solid " + LINE,
                borderRadius: 16,
                padding: "12px 14px",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: MUTED,
                  marginBottom: 8,
                }}
              >
                Also from your coach
              </span>
              {notes.map((n) => (
                <div key={n.id} style={{ display: "flex", gap: 9, marginTop: 7 }}>
                  <Check size={13} color={hue.c} strokeWidth={2.6} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: TEXT }}>
                      {n.title}
                    </span>
                    <span style={{ display: "block", fontSize: 11, color: MUTED, lineHeight: 1.45, marginTop: 1 }}>
                      {n.tip}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}

          <p style={{ margin: "14px 0 0", fontSize: 11.5, color: MUTED, lineHeight: 1.6 }}>
            Your coach can change any of this as they see how your days go. Message them if
            something here does not fit.
          </p>
        </div>

        <div style={{ flexShrink: 0, padding: "12px 22px 22px" }}>
          <button
            onClick={done}
            style={{
              width: "100%",
              background: GREEN,
              border: "none",
              borderRadius: 14,
              padding: "15px 0",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 2px 0 " + GREEN_DEEP,
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
