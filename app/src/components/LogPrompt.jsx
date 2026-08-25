import React from "react";
import { GREEN, GREEN_DEEP, INDIGO, MIND_C, TEXT, BG } from "../tokens";

/* The one way into logging, on every pillar. It replaced a section label and
   two tiles, because a prompt that says what to do reads faster than a menu
   that makes you choose first. The gradient edge is the only one in the app,
   which is what makes it the thing you look at on the screen.

   `actions` is one or two buttons. The first is filled, the rest outlined, so
   there is never a question about which one is the ordinary way in. */
export default function LogPrompt({ line, actions, lit }) {
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
              {line}
            </div>
          </div>

          <div style={{ display: "flex", gap: 9, marginTop: 13 }}>
            {actions.map((a, i) => {
              const filled = i === 0;
              return (
                <button
                  key={a.label}
                  onClick={a.onClick}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    background: filled ? GREEN : BG,
                    border: "1px solid " + GREEN,
                    borderRadius: 999,
                    padding: "10px 0",
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: filled ? "#fff" : GREEN,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: filled ? "0 2px 0 " + GREEN_DEEP : "none",
                  }}
                >
                  {a.Icon && <a.Icon size={16} color={filled ? "#fff" : GREEN} strokeWidth={2} />}
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
