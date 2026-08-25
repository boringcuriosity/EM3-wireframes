import React from "react";
import { Camera, Mic } from "lucide-react";
import { GREEN, GREEN_DEEP, INDIGO, MIND_C, TEXT, BG } from "../tokens";

/* The one way into logging a meal. It replaced a section label and two tiles,
   because a prompt that says what to do reads faster than a menu that makes
   you choose first. The gradient edge is the only one in the app, which is
   what makes it the thing you look at on this screen. */
export default function LogMealPrompt({ onLog, lit }) {
  return (
    <div style={{ padding: "12px 22px 0" }}>
      <div
        style={{
          background: "linear-gradient(135deg, " + INDIGO + " 0%, " + MIND_C + " 100%)",
          borderRadius: 18,
          padding: 1.5,
          // Lit when something elsewhere has pointed the user here to log.
          boxShadow: lit ? "0 0 0 3px " + GREEN + "40" : "none",
          transition: "box-shadow .3s",
        }}
      >
        <div style={{ background: BG, borderRadius: 16.5, padding: "14px 15px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
            <svg width="24" height="26" viewBox="0 0 22 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden>
              <path
                d="M11 1.2 20.1 6.6v10.8L11 22.8 1.9 17.4V6.6z"
                stroke={INDIGO}
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: TEXT, lineHeight: 1.5 }}>
              Time to log your meal. Snap a photo or just say it out loud, whichever is easier.
            </div>
          </div>

          <div style={{ display: "flex", gap: 9, marginTop: 13 }}>
            <button
              onClick={onLog}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                background: GREEN,
                border: "1px solid " + GREEN,
                borderRadius: 999,
                padding: "10px 0",
                fontSize: 13.5,
                fontWeight: 700,
                color: "#fff",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 2px 0 " + GREEN_DEEP,
              }}
            >
              <Camera size={16} color="#fff" strokeWidth={2} />
              Snap
            </button>
            <button
              onClick={onLog}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                background: BG,
                border: "1px solid " + GREEN,
                borderRadius: 999,
                padding: "10px 0",
                fontSize: 13.5,
                fontWeight: 700,
                color: GREEN,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Mic size={16} color={GREEN} strokeWidth={2} />
              Voice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
