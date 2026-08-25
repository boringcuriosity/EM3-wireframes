import React from "react";
import { INDIGO, MIND_C, SH_XL } from "../tokens";

/* Kaira, always within reach. The hexagon rather than the letter, because the
   mark is what she is recognised by everywhere else in the app.

   Indigo to teal rather than brand green: green is what every action in the
   app is already wearing, so the one thing that is not a task on the page
   needs to sit outside that. It matches the indigo hexagon on her prompts.

   `bottom` moves it clear of whichever bar is underneath: the app's own tab
   bar on the main screens, a pillar screen's own nav on a takeover. */
export default function KairaFab({ bottom = 92 }) {
  return (
    <button
      aria-label="Ask Kaira"
      style={{
        position: "absolute",
        right: 18,
        bottom,
        // Above the page, below every sheet. Cards inside the scroller carry
        // their own z-index, so without one here they paint over the button.
        zIndex: 20,
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: "linear-gradient(135deg, " + INDIGO + " 0%, " + MIND_C + " 100%)",
        border: "none",
        cursor: "pointer",
        boxShadow: SH_XL,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      <svg width="22" height="24" viewBox="0 0 22 24" fill="none" aria-hidden>
        <path
          d="M11 1.2 20.1 6.6v10.8L11 22.8 1.9 17.4V6.6z"
          stroke="#fff"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
