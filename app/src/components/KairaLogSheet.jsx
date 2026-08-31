import React, { useState, useEffect } from "react";
import { useWF } from "../state";
import { X, Camera } from "lucide-react";
import { Bubble, Mark, Dots } from "./KairaChatSheet";
import { byId } from "../screens/log/foods";
import {
  GREEN, GREEN_DEEP, TEXT, MUTED, FAINT, BG, BG_ALT, BG_SUNK, BORDER, LINE, RULE,
} from "../tokens";

/* Logging a meal without typing it, which for most people is the only way they
   will ever do it twice.

   Both routes are Kaira's, because reading a plate and hearing a sentence are
   the two things she is for. They share a shape: what you handed her, a beat
   while she works, then what she found, as items rather than as prose. The
   answer is only useful if it lands in the meal, so the sheet ends in the one
   button that puts it there.

   She does not log it herself. The logger's own button is still what records a
   meal, so a photo she read wrong is corrected before it becomes a record
   rather than after. */

const ASKS = {
  snap: {
    title: "Reading your photo",
    found: [
      { id: "roti", qty: 2 },
      { id: "dal", qty: 1 },
      { id: "salad", qty: 1 },
    ],
    line: "Two rotis, a katori of dal and a side salad. I have set the portions to what you usually eat, so change any that look off.",
  },
  voice: {
    title: "Listening",
    said: "I had two rotis with dal and a bowl of curd",
    found: [
      { id: "roti", qty: 2 },
      { id: "dal", qty: 1 },
      { id: "curd", qty: 1 },
    ],
    line: "Got it. A katori is what I have assumed for the dal and the curd, which is the portion you have logged before.",
  },
};

export default function KairaLogSheet() {
  const { kairaLog, setKairaLog, logItems, setLogItems } = useWF();
  const [thinking, setThinking] = useState(true);

  /* App mounts this keyed on the route, so switching from the camera to the
     mic starts her again rather than showing the last answer instantly. */
  useEffect(() => {
    const t = setTimeout(() => setThinking(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const x = ASKS[kairaLog];
  if (!x) return null;

  /* Merged, not appended. Adding two rotis to a meal that already has one
     makes three, where a second entry would leave the stepper editing one of
     them and the total counting both. */
  const add = () => {
    const next = logItems.slice();
    for (const it of x.found) {
      const at = next.findIndex((y) => y.id === it.id);
      if (at === -1) next.push({ ...it });
      else next[at] = { ...next[at], qty: next[at].qty + it.qty };
    }
    setLogItems(next);
    setKairaLog(null);
  };

  return (
    <div
      onClick={() => setKairaLog(null)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 58,
        background: "rgba(16,24,40,0.46)",
        display: "flex",
        alignItems: "flex-end",
        animation: "scrimIn .24s ease both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Kaira is reading your meal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: BG,
          borderRadius: "26px 26px 0 0",
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "82%",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: BORDER, margin: "10px auto 0", flexShrink: 0 }} />

        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 22px",
            borderBottom: "1px solid " + LINE,
          }}
        >
          <Mark size={30} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: TEXT }}>Kaira</span>
            <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 1 }}>
              {thinking ? x.title : "Found " + x.found.length + " items"}
            </span>
          </span>
          <button
            onClick={() => setKairaLog(null)}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: -4, display: "flex" }}
          >
            <X size={18} color={MUTED} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", minHeight: 0, background: BG_ALT, padding: "16px 18px 8px" }}>
          {/* What you handed her, sent the way a message is. */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            {kairaLog === "snap" ? <Photo /> : (
              <span
                style={{
                  maxWidth: "82%",
                  background: GREEN,
                  color: "#fff",
                  borderRadius: "16px 16px 4px 16px",
                  padding: "10px 13px",
                  fontSize: 12.5,
                  lineHeight: 1.5,
                }}
              >
                {x.said}
              </span>
            )}
          </div>

          {thinking ? (
            <Bubble>
              <Dots />
            </Bubble>
          ) : (
            <>
              <Bubble>{x.line}</Bubble>
              {/* The finding itself, as the food it is rather than as a
                  sentence about food. Portions show, because the portion is
                  the part she guessed. */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, margin: "2px 0 0 30px" }}>
                {x.found.map((it, i) => {
                  const food = byId(it.id);
                  if (!food) return null;
                  return (
                    <span
                      key={it.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: BG,
                        border: "1px solid " + BORDER,
                        borderRadius: 999,
                        padding: "6px 11px",
                        fontSize: 11.5,
                        color: TEXT,
                        animation: "riseIn .32s cubic-bezier(.32,.72,0,1) " + (0.14 + i * 0.07) + "s both",
                      }}
                    >
                      <strong>{it.qty}</strong> {food.name}
                    </span>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Into the meal, not into the day. The logger's own button still does
            the recording, so a wrong guess is fixed before it is a record. */}
        <div style={{ flexShrink: 0, borderTop: "1px solid " + LINE, padding: "12px 18px 22px", background: BG }}>
          <button
            onClick={add}
            disabled={thinking}
            style={{
              width: "100%",
              height: 48,
              borderRadius: 14,
              background: thinking ? BG_SUNK : GREEN,
              border: "none",
              color: thinking ? FAINT : "#fff",
              fontSize: 14.5,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: thinking ? "default" : "pointer",
              boxShadow: thinking ? "none" : "0 2px 0 " + GREEN_DEEP,
            }}
          >
            {thinking ? "One moment" : "Add " + x.found.length + " items to this meal"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* A stated placeholder, not a drawing. Whatever ships here is the photograph
   the person actually took, so a labelled block is more honest than a stock
   plate of food. */
function Photo() {
  return (
    <span
      style={{
        width: 132,
        height: 108,
        borderRadius: "16px 16px 4px 16px",
        background: BG_SUNK,
        border: "1px dashed " + RULE,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      <Camera size={20} color={FAINT} strokeWidth={1.8} />
      <span style={{ fontSize: 10.5, fontWeight: 600, color: FAINT }}>Your photo</span>
    </span>
  );
}
