import React from "react";
import { useWF } from "../state";
import PrereqCard from "./PrereqCard";
import { ChevronDown, ListChecks, X } from "lucide-react";
import { TEXT, MUTED, BG, BORDER, WARN, WARN_TINT, WARN_LINE, SH_SM } from "../tokens";

/* What has to happen before a coach can write anything.

   One card that opens and shuts, rather than two things that look like two
   things. The header is the same line either way: what this is, how much is
   left, how far along. Opening it reveals the cards under that header; it does
   not replace the header with a different one. A section that redrew itself on
   expand read as two components sharing a job.

   The bar under the header is the progress, and when the card is open it is
   also the divider. One element doing both is what stops an accordion from
   growing a rule and a meter that say the same thing.

   Shut is the resting state once a plan lands: the day leads then, and these
   stop being the headline, which is a different thing from stopping mattering.
   They used to vanish outright at that point, so somebody whose labs were
   still unbooked got a To-do screen that never mentioned them again.

   Read off the same list as the Home carousel, so finishing one anywhere
   finishes it everywhere and the card empties itself. */
export default function PrereqRail() {
  const {
    nextActions, nextOpen, prereqHidden, prereqExpanded, setPrereqOpen, setPrereqAsk,
  } = useWF();
  if (!nextOpen.length || prereqHidden) return null;

  const total = nextActions.length;
  const done = total - nextOpen.length;

  return (
    <div style={{ position: "relative", marginBottom: 18 }}>
      {/* Half off the corner rather than inside the header. Within it, a cross
          sits beside the chevron and the two argue: one shuts the card, one
          puts it away for the day. Out on the edge it belongs to the whole
          card instead of to the row it is standing in, which is the thing it
          actually does. It opens the sheet first; nothing goes on one tap. */}
      <button
        onClick={() => setPrereqAsk(true)}
        aria-label="Do these later"
        style={{
          position: "absolute",
          top: -8,
          right: -8,
          zIndex: 1,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: BG,
          border: "1px solid " + BORDER,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
          boxShadow: "0 1px 3px rgba(16,24,40,0.07)",
        }}
      >
        <X size={13} color={MUTED} strokeWidth={2.4} />
      </button>

      <div
        style={{
          background: BG,
          border: "1px solid " + WARN_LINE,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: SH_SM,
        }}
      >
        <button
          onClick={() => setPrereqOpen(!prereqExpanded)}
          aria-expanded={prereqExpanded}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "left",
            boxSizing: "border-box",
          }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              flexShrink: 0,
              borderRadius: 9,
              background: WARN_TINT,
              border: "1px solid " + WARN_LINE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ListChecks size={15} color={WARN} strokeWidth={2.2} />
          </span>

          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 14, fontWeight: 800, color: TEXT, letterSpacing: -0.2 }}>
              Start here
            </span>
            {/* The only subtext. There were two saying overlapping things,
                and this line said the count a second time next to "0 of 3"
                on the right. What is left is the count; why it matters is
                this. "First steps" rather than "prerequisites", which is a
                word for a project plan and not for a person.

                Sized to hold one line, because a shut card is supposed to cost
                a line: at 11.5 this wrapped and the card grew by a third. */}
            <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 1.5 }}>
              Important first steps before your consultation
            </span>
          </span>

          <span
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              fontSize: 11,
              fontWeight: 700,
              color: WARN,
            }}
          >
            {done} of {total}
            <ChevronDown
              size={15}
              strokeWidth={2.4}
              style={{
                transform: prereqExpanded ? "rotate(180deg)" : "none",
                transition: "transform .25s ease",
              }}
            />
          </span>
        </button>

        {/* Progress, and the divider when the card is open. */}
        <span
          aria-hidden
          style={{ display: "block", height: 3, background: WARN_TINT, overflow: "hidden" }}
        >
          <span
            style={{
              display: "block",
              height: "100%",
              width: "100%",
              background: WARN,
              transformOrigin: "left",
              transform: "scaleX(" + (total ? done / total : 0) + ")",
              transition: "transform .6s cubic-bezier(.32,.72,0,1)",
            }}
          />
        </span>

        {prereqExpanded && (
          <div style={{ paddingTop: 13 }}>
            {/* The rail reaches the card's own edges rather than stopping at its
                padding, so a card at rest sits flush and the next one shows as a
                strip you can see there is more of. */}
            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                gap: 10,
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                scrollPaddingLeft: 13,
                padding: "0 13px 13px",
                scrollbarWidth: "none",
              }}
            >
              {nextOpen.map((id) => (
                <PrereqCard key={id} id={id} width={268} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
