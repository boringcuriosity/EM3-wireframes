import React from "react";
import { useWF } from "../state";
import { Smartphone } from "lucide-react";
import { GREEN, MUTED, LINE } from "../tokens";

/* A small offer at the foot of the card, for anyone entering their numbers by
   hand. Not the whole pitch again: they turned it down once at the gate, so
   this is one line and a way to change their mind, not a second argument.

   It sits at the bottom rather than the top because what they came for is the
   day above it. */

const COPY = {
  steps: "Your phone can count these for you.",
  sleep: "Your phone can track these for you.",
};

export default function ConnectNudge({ signal }) {
  const { healthSource, pickSource } = useWF();
  if (healthSource[signal] !== "manual") return null;

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
        {COPY[signal]}
      </span>
      <button
        onClick={() => pickSource(signal, "phone")}
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
        Connect Health Connect
      </button>
    </div>
  );
}
