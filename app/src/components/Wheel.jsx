import React, { useEffect, useRef } from "react";
import { BG, TEXT, MUTED, MOVE_T } from "../tokens";

/* A picker for one value out of many. Used wherever the answer is a number or
   a level rather than a choice between two or three things: a row of chips
   caps what anyone can say, and a keypad invites a made-up figure.

   The band marks what counts, and the ends fade so the list reads as a wheel
   rather than something that has been cut off. */

const ROW = 42;
const VISIBLE = 5;
export const WHEEL_H = ROW * VISIBLE;

export default function Wheel({ items, value, onChange, band = MOVE_T }) {
  const ref = useRef(null);
  const settle = useRef(null);

  // Land on the current value rather than animating in from the top.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const i = items.findIndex((x) => x.v === value);
    el.scrollTop = Math.max(0, i) * ROW;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = (e) => {
    const top = e.currentTarget.scrollTop;
    clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const i = Math.max(0, Math.min(items.length - 1, Math.round(top / ROW)));
      if (items[i].v !== value) onChange(items[i].v);
    }, 90);
  };

  return (
    <div style={{ position: "relative", height: WHEEL_H, overflow: "hidden" }}>
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          top: ROW * 2,
          height: ROW,
          borderRadius: 12,
          background: band,
          pointerEvents: "none",
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2,
          background:
            "linear-gradient(" + BG + " 0%, rgba(255,255,255,0) 34%, rgba(255,255,255,0) 66%, " + BG + " 100%)",
        }}
      />

      <div
        ref={ref}
        onScroll={onScroll}
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          overflowY: "auto",
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none",
          padding: ROW * 2 + "px 0",
          boxSizing: "border-box",
        }}
      >
        {items.map((x) => {
          const on = x.v === value;
          return (
            <div
              key={x.v}
              onClick={() => onChange(x.v)}
              style={{
                height: ROW,
                scrollSnapAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontSize: on ? 24 : 18,
                  fontWeight: on ? 800 : 500,
                  color: on ? TEXT : MUTED,
                  opacity: on ? 1 : 0.6,
                  transition: "font-size .15s, opacity .15s",
                }}
              >
                {x.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
