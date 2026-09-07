import React, { useEffect, useRef, useState } from "react";
import { useWF } from "../state";
import { Check, ListChecks } from "lucide-react";
import CtaArrow from "./CtaArrow";
import { TEXT, MUTED, BG_ALT, LINE, GREEN, WARN, WARN_TINT, WARN_LINE } from "../tokens";

/* Where a first step sits while you are doing it.

   A next action is a card on Home and on To-do, and then you tap it and every
   trace of it disappears for the length of a flow. Five screens later the card
   is simply gone, and nothing in between ever said the walkthrough you were in
   was that task. This is the thread: it rides above the button on every step,
   names the one being done, and counts it off against the rest.

   Full width and flush to the frame rather than inset, because it belongs to
   the screen rather than to the content: a card inside a flow would be one
   more thing to read, and this is a place marker. */

const NAME = {
  score: "Metabolic score",
  labs: "Diagnostics",
  doctor: "Doctor consultation",
  assess: "Pre-consultation assessment",
  "book:eat": "Eat consultation",
  "book:move": "Move consultation",
  "book:mind": "Mind consultation",
};

export default function NextActionStrip({ id }) {
  const { nextActions, nextOpen, setNextSheet, openDiagnostics, openDoctor } = useWF();
  const total = nextActions.length;
  const done = total - nextOpen.length;

  /* The bar draws the count it had a beat ago, then catches up, so finishing
     the task is something you watch happen rather than something that was
     already true by the time the screen arrived. Result marks the score off in
     its own effect, which lands after this strip has mounted, and without the
     lag the tick and the fill would both be there on the first frame. */
  const [shown, setShown] = useState(done);
  const was = useRef(done);
  useEffect(() => {
    if (done === was.current) return;
    was.current = done;
    const t = setTimeout(() => setShown(done), 380);
    return () => clearTimeout(t);
  }, [done]);

  const mine = !nextOpen.includes(id);
  // Both land together, so the tick and the bar read as one event.
  const settled = mine && shown === done;

  // Where this one sits in the list, so the strip can say which step this is.
  const place = nextActions.indexOf(id) + 1;
  // What comes after it, which is the other half of knowing where you are.
  const after = nextActions.filter((x) => x !== id && nextOpen.includes(x));

  return (
    <div
      style={{
        position: "relative",
        padding: "11px 22px 13px",
        background: BG_ALT,
        borderTop: "1px solid " + LINE,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        {/* The strip itself opens the list. Halfway through a walkthrough the
            real question is what else is on it, and a count can say how many
            but never which. */}
        <button
          onClick={() => setNextSheet(true)}
          aria-label="See all your first steps"
          style={{
            position: "absolute",
            inset: 0,
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        />
        <span
          style={{
            width: 24,
            height: 24,
            flexShrink: 0,
            borderRadius: 8,
            background: settled ? GREEN : WARN_TINT,
            border: "1px solid " + (settled ? GREEN : WARN_LINE),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background .35s ease, border-color .35s ease",
            position: "relative",
          }}
        >
          {settled ? (
            <Check size={13} color="#fff" strokeWidth={3} />
          ) : (
            <ListChecks size={13} color={WARN} strokeWidth={2.2} />
          )}
        </span>

        <span style={{ position: "relative", flex: 1, minWidth: 0 }}>
          {/* The eyebrow carries the position, the line under it carries the
              name. A count on its own says how much is left; a count with a
              place in it says where you are, which is what somebody halfway
              through a five screen walkthrough is actually asking. */}
          <span
            style={{
              display: "block",
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              color: settled ? GREEN : WARN,
              transition: "color .35s ease",
            }}
          >
            {settled ? "First step done" : "First step " + place + " of " + total}
          </span>
          <span style={{ display: "block", fontSize: 12.5, fontWeight: 800, color: TEXT, letterSpacing: -0.1, marginTop: 1 }}>
            {NAME[id] || "First step"}
          </span>
        </span>

        {/* What is still waiting, so finishing this one lands somewhere rather
            than into a count. Only when there is one, and only its name. */}
        {settled && after.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (after[0] === "labs") openDiagnostics();
      else if (after[0] === "doctor") openDoctor();
              else setNextSheet(true);
            }}
            style={{
              position: "relative",
              flexShrink: 0,
              textAlign: "right",
              maxWidth: 132,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <span style={{ display: "block", fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: MUTED }}>
              Next
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 3,
                fontSize: 11.5,
                fontWeight: 700,
                color: GREEN,
                marginTop: 1,
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {NAME[after[0]]}
              </span>
              <CtaArrow size={12} style={{ color: GREEN }} />
            </span>
          </button>
        )}
      </div>

      {/* One segment per first step rather than one bar across all of them.
          Six discrete things deserve six marks: you can see which are behind
          you, which one you are standing in, and how many are still ahead. */}
      <div aria-hidden style={{ display: "flex", gap: 4, marginTop: 9 }}>
        {nextActions.map((x, i) => {
          const behind = i < shown;
          const here = x === id;
          return (
            <span
              key={x}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                /* The ones ahead need to be visible, not merely present.
                   Tint at half opacity on a tinted strip disappeared, and a
                   progress mark you cannot count is not a progress mark. */
                background: behind || (here && settled) ? GREEN : here ? WARN : WARN_LINE,
                transition: "background .5s cubic-bezier(.32,.72,0,1)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
