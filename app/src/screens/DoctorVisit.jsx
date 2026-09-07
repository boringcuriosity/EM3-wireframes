import React from "react";
import { useWF } from "../state";
import { ChevronLeft } from "lucide-react";
import { Cta } from "./sufficiency/parts";
import { GREEN, GREEN_TINT, TEXT, BG, BORDER } from "../tokens";

/* Booking a doctor, which happens somewhere else.

   The consultation is arranged outside this app, so this screen is the door
   rather than the booking: it hands over, waits, and takes the person's word
   for it when they come back. The button at the foot is the only thing that
   finishes it, because nothing here can know what happened on the other side.

   Deliberately one thing on the screen. A waiting state that also carries
   copy, options or a second route reads as a page somebody has to work out;
   this is a moment to sit through. */
export default function DoctorVisit() {
  const { setDocOpen, finishNext, setActiveTab } = useWF();

  const done = () => {
    finishNext("doctor");
    setDocOpen(false);
    setActiveTab("track");
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", padding: "6px 22px 10px" }}>
        <button
          onClick={() => setDocOpen(false)}
          aria-label="Back"
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: BG,
            border: "1px solid " + BORDER,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={18} color={TEXT} />
        </button>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
        }}
      >
        {/* A ring with one lit arc, turning. The gap is what makes it read as
            moving: a full circle spinning looks like a circle. */}
        <span
          aria-hidden
          style={{
            width: 62,
            height: 62,
            borderRadius: "50%",
            border: "4px solid " + GREEN_TINT,
            borderTopColor: GREEN,
            animation: "spin 1s linear infinite",
          }}
        />
        <span style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Visit health</span>
      </div>

      <div style={{ flexShrink: 0, padding: "12px 22px 26px", borderTop: "1px solid " + BORDER }}>
        <Cta onClick={done}>Done</Cta>
      </div>
    </div>
  );
}
