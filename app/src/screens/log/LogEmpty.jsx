import React from "react";
import { Heart, Search } from "lucide-react";
import { TEXT, MUTED, FAINT, BG, BG_ALT, BORDER, LINE } from "../../tokens";

/* The logger on the day somebody has never used it.

   Both tabs are genuinely empty on day one, and an empty tab is the one moment
   this screen gets to say what it is for. Favourites teaches the gesture that
   fills it, and it draws the real heart inside the sentence, because a control
   described in words and drawn somewhere else is two things to connect.

   Frequent has nothing of yours to count yet, so it offers a few common meals
   underneath and says plainly that they are suggestions. They step aside as
   soon as there is a real count. */

/* The heart as it appears on a row, shown inline at the size it really is, so
   the thing being described is the thing they will look for. */
const InlineHeart = () => (
  <span
    aria-hidden
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      /* Kept close to the text's own line box. At 22px square it made the
         line it sat on taller than the one under it, so a two line sentence
         came apart down the middle. */
      width: 20,
      height: 18,
      borderRadius: 6,
      background: BG,
      border: "1px solid " + BORDER,
      verticalAlign: -4,
      margin: "0 3px",
    }}
  >
    <Heart size={12} color={TEXT} strokeWidth={2.2} />
  </span>
);

export default function LogEmpty({ tab }) {
  const fav = tab === "fav";

  return (
    <div style={{ padding: "26px 4px 8px", textAlign: "center" }}>
      <span
        aria-hidden
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 52,
          height: 52,
          borderRadius: 18,
          background: BG_ALT,
          border: "1px solid " + LINE,
          marginBottom: 14,
        }}
      >
        {fav ? (
          <Heart size={22} color={FAINT} strokeWidth={1.9} />
        ) : (
          <Search size={22} color={FAINT} strokeWidth={1.9} />
        )}
      </span>

      <div style={{ fontSize: 14.5, fontWeight: 800, color: TEXT, letterSpacing: -0.2 }}>
        {fav ? "Keep the meals you love here" : "Your usual meals will gather here"}
      </div>

      <div
        style={{
          fontSize: 12,
          color: MUTED,
          marginTop: 7,
          lineHeight: 1.7,
          maxWidth: 276,
          margin: "7px auto 0",
        }}
      >
        {fav ? (
          <>
            Tap the <InlineHeart /> on anything you eat often and it waits for you here, ready to
            add in one tap.
          </>
        ) : (
          "As you log your days, whatever you eat most often moves to the top of this tab."
        )}
      </div>
    </div>
  );
}

/* The heading over the suggestions under an empty Frequent. Its own export so
   the list underneath stays the logger's own rows rather than a second copy of
   them drawn in here. */
export function SuggestHead() {
  return (
    <div style={{ padding: "18px 0 6px", display: "flex", alignItems: "center", gap: 9 }}>
      <span
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: MUTED,
          flexShrink: 0,
        }}
      >
        Common to start with
      </span>
      <span aria-hidden style={{ flex: 1, height: 1, background: LINE }} />
    </div>
  );
}
