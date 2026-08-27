import React from "react";
import { useWF } from "../state";
import PrereqCard from "./PrereqCard";
import { TEXT, MUTED } from "../tokens";

/* What has to happen before a coach can write anything, at the top of the day.

   Read off the same list as the Home carousel, so finishing one anywhere
   finishes it everywhere and the rail empties itself. */
export default function PrereqRail() {
  const { nextOpen, CARD_PAD, CARD_GAP, CARD_TAIL } = useWF();
  if (!nextOpen.length) return null;

  return (
    <div style={{ marginLeft: -CARD_PAD, marginRight: -CARD_PAD }}>
      <div style={{ padding: "0 " + CARD_PAD + "px", marginBottom: 12 }}>
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 19,
            fontWeight: 600,
            color: TEXT,
            lineHeight: 1.25,
          }}
        >
          Start here
        </div>
        <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, marginTop: 4 }}>
          Your care program needs these before your coach can build anything for you.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: CARD_GAP,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollPaddingLeft: CARD_PAD,
          paddingLeft: CARD_PAD,
          paddingRight: CARD_TAIL,
          paddingTop: 6,
          paddingBottom: 14,
          marginTop: -6,
          marginBottom: -8,
          scrollbarWidth: "none",
        }}
      >
        {/* Wider than the Home carousel's cards. The body copy is three lines
            at 268 and two at 310, and a shorter card means the list underneath
            starts higher up the screen. */}
        {nextOpen.map((id) => (
          <PrereqCard key={id} id={id} width={310} />
        ))}
      </div>
    </div>
  );
}
