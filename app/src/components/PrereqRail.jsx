import React, { useEffect, useRef, useState } from "react";
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

   The same card on To-do and on the program page, with the same collapse and
   the same cross: one list, one set of controls, and putting it away in one
   place puts it away in both.

   Read off the same list as the Home carousel, so finishing one anywhere
   finishes it everywhere and the card empties itself. */
/* `startOpen` is the resting state where this appears rather than a state of
   its own. On To-do these are the day's blocking work and the screen is a list,
   so they stand open. On Home they are a strip above the day, and a strip that
   arrives unfolded pushes today below the fold on the one screen that should
   open on it. Either way a tap outranks the default, for both. */
/* `keep` is the surface that holds on to these after they have been put away.
   Dismissing means taking them off the day, which is To-do, and the sheet that
   explains it promises they are still on Home. If Home honoured the dismissal
   too, that promise would be a lie and there would be no way back to them. */
export default function PrereqRail({ startOpen = false, keep = false }) {
  const {
    nextActions, nextOpen, nextJustDone, setNextJustDone, planAssigned,
    prereqHidden, prereqOpen, setPrereqOpen, setPrereqAsk,
  } = useWF();
  /* The one finished elsewhere, kept in the rail for as long as it takes to
     watch it go. Long enough to read the tick, short enough that it is gone
     before anybody wonders why a finished thing is still sitting there. */
  const leaving = nextJustDone && nextActions.includes(nextJustDone) ? nextJustDone : null;
  const total = nextActions.length;
  const done = total - nextOpen.length;

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setNextJustDone(null), 2500);
    return () => clearTimeout(t);
  }, [leaving, setNextJustDone]);

  /* The count the header draws, which lags the real one by a beat so the bar
     is seen filling rather than arriving full. Only ever matters on the return
     from a flow, where the number changed while nobody was looking. */
  const [shownDone, setShownDone] = useState(leaving ? done - 1 : done);
  useEffect(() => {
    if (shownDone === done) return;
    const t = setTimeout(() => setShownDone(done), 520);
    return () => clearTimeout(t);
  }, [done, shownDone]);

  /* A card on its way out opens the section to show itself. Shut is the right
     resting state once a plan lands, but a strip that silently ticks from 0 to
     1 while folded is the disappearance this whole thing exists to avoid. It
     folds back to whatever it was as soon as the card has gone. */
  const expanded = leaving ? true : prereqOpen === null ? startOpen : prereqOpen;

  /* One order, always, and nothing ever moves in it.

     They used to leave the rail the moment they were done, which throws away
     the only proof anybody gets that the thing they went off and did counted.
     Sorting the finished ones to the end fixed that and broke something else:
     a card that jumps three places while you are looking for it is a card you
     have to find again, and the person has just come back specifically to see
     it. So the list is the list, and what changes is the card, in place. */
  const shown = nextActions;

  /* Watching it tick, then being taken to what is next.

     The rail lands on the card that was finished, holds long enough to read
     the tick going on, and then carries you to the first one still open. That
     order matters: the payoff first, the next ask second. Doing it the other
     way round is an app hurrying somebody past the thing they earned. */
  const railRef = useRef(null);
  const cards = useRef({});
  useEffect(() => {
    if (!leaving || !expanded) return;
    const rail = railRef.current;
    if (!rail) return;
    const at = (id) => {
      const el = cards.current[id];
      if (!el) return null;
      return el.getBoundingClientRect().left - rail.getBoundingClientRect().left + rail.scrollLeft - 13;
    };
    const from = at(leaving);
    if (from !== null) rail.scrollLeft = Math.max(0, from);

    /* Native rather than a hand rolled tween. A tween writing scrollLeft on
       every frame was being undone by something between the rail and the
       frame's own scroller, so the glide fired and the rail sat at nought.
       scrollIntoView asks the browser for the same thing once and lets it
       own the animation, which is both shorter and the version that works. */
    /* Then it carries you to the one still waiting.

       Slowly, and after the tick has landed: the payoff first, the next ask
       second. Doing it the other way round is an app hurrying somebody past
       the thing they earned.

       Hand rolled rather than scrollTo({behavior:"smooth"}), which is a no-op
       on this frame's scrollers in Chrome, and the loop keeps re-asserting the
       position every frame rather than setting it once, so a re-render landing
       mid glide cannot put the rail back where it started. */
    const nextUp = nextActions.find((id) => nextOpen.includes(id));
    let raf = null;
    const hold = setTimeout(() => {
      const to = nextUp ? at(nextUp) : null;
      if (to === null) return;
      const start = rail.scrollLeft;
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / 620);
        const e = 1 - Math.pow(1 - k, 3);
        rail.scrollLeft = Math.max(0, start + (to - start) * e);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, 1300);

    return () => {
      clearTimeout(hold);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaving, expanded]);

  /* Every hook is above this line. The rail bows out on a list with nothing
     left in it, and a return that sits between hooks changes how many run
     between one render and the next. */
  if (!nextOpen.length || (prereqHidden && !keep)) return null;

  const head = (
    <>
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
          {/* What these are changes the day a plan lands. Before one, they are
              the work holding everything up and the section is the beginning
              of the thing. After, the consultation they were preparing for has
              happened: they are not a start any more, they are the part of the
              program that still needs the person rather than the coach. */}
          {planAssigned ? "Tasks from your care program" : "Start here"}
        </span>
        {/* The only subtext. There were two saying overlapping things, and this
            line said the count a second time next to "0 of 3" on the right.
            What is left is the count; why it matters is this. "First steps"
            rather than "prerequisites", which is a word for a project plan and
            not for a person.

            Sized to hold one line, because a shut card is supposed to cost a
            line: at 11.5 this wrapped and the card grew by a third. */}
        <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 1.5 }}>
          {planAssigned
            ? "These help at your next consultation"
            : "Important first steps before your consultation"}
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
        {shownDone} of {total}
        <ChevronDown
          size={15}
          strokeWidth={2.4}
          style={{
            transform: expanded ? "rotate(180deg)" : "none",
            transition: "transform .25s ease",
          }}
        />
      </span>
    </>
  );

  const headStyle = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 12px",
    textAlign: "left",
    boxSizing: "border-box",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
  };

  return (
    <div style={{ position: "relative", marginBottom: 18 }}>
      {/* Half off the corner rather than inside the header. Within it, a cross
          sits beside the chevron and the two argue: one shuts the card, one
          puts it away for the day. Out on the edge it belongs to the whole card
          instead of to the row it is standing in, which is the thing it
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
          onClick={() => setPrereqOpen(!expanded)}
          aria-expanded={expanded}
          style={headStyle}
        >
          {head}
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
              transform: "scaleX(" + (total ? shownDone / total : 0) + ")",
              transition: "transform .6s cubic-bezier(.32,.72,0,1)",
            }}
          />
        </span>

        {expanded && (
          <div style={{ paddingTop: 13 }}>
            {/* The rail reaches the card's own edges rather than stopping at its
                padding, so a card at rest sits flush and the next one shows as
                a strip you can see there is more of. */}
            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                gap: 10,
                overflowX: "auto",
                /* No snapping. A mandatory snap container re-snaps on every
                   frame and on every re-render, so it fought the glide to the
                   next card and put the rail back at nought each time. The
                   cards are wider than the frame and a partial one at the edge
                   is the point, so there was never much for snapping to add. */
                scrollPaddingLeft: 13,
                padding: "0 13px 13px",
                scrollbarWidth: "none",
              }}
              ref={railRef}
            >
              {shown.map((id) => (
                <span
                  key={id}
                  ref={(el) => {
                    cards.current[id] = el;
                  }}
                  /* Stretch passes through. Without it the wrapper sizes to
                     its own content and the ticked card ends up shorter than
                     the one beside it. */
                  style={{ display: "flex", alignItems: "stretch", flexShrink: 0 }}
                >
                  <PrereqCard
                    id={id}
                    width={268}
                    done={!nextOpen.includes(id)}
                    fresh={id === leaving}
                  />
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
