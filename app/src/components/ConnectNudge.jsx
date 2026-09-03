import React from "react";
import { useWF } from "../state";
import { Smartphone } from "lucide-react";
import { GREEN, MUTED, LINE } from "../tokens";

/* A small offer at the foot of the card, for anyone entering their numbers by
   hand. Not the whole pitch again: they have seen it once, so this is one line
   and a way to change their mind, not a second argument.

   It carries the undecided case too, where somebody shut the ask without
   answering it. That one reopens the sheet rather than connecting outright,
   because the pitch is what they closed rather than what they refused.

   It sits at the bottom rather than the top because what they came for is the
   day above it. */

const COPY = {
  steps: "Your phone can count these for you.",
  sleep: "Your phone can track these for you.",
};
const ASK = {
  steps: "Nobody is counting your steps yet.",
  sleep: "Nobody is reading your nights yet.",
};

export default function ConnectNudge({ signal }) {
  const { healthSource, pickSource, setHealthSheet } = useWF();
  const undecided = healthSource[signal] === null;
  if (healthSource[signal] !== "manual" && !undecided) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 13,
        paddingTop: 11,
        borderTop: "1px solid " + LINE,
      }}
    >
      <Smartphone size={13} color={MUTED} strokeWidth={2} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 11, color: MUTED, lineHeight: 1.4 }}>
        {undecided ? ASK[signal] : COPY[signal]}
      </span>
      <button
        onClick={() => (undecided ? setHealthSheet(signal) : pickSource(signal, "phone"))}
        style={{
          flexShrink: 0,
          background: "none",
          border: "none",
          padding: 0,
          fontSize: 11,
          fontWeight: 700,
          color: GREEN,
          cursor: "pointer",
          fontFamily: "inherit",
          textDecoration: "underline",
          textUnderlineOffset: 2,
        }}
      >
        {undecided ? "Choose" : "Connect Health Connect"}
      </button>
    </div>
  );
}
