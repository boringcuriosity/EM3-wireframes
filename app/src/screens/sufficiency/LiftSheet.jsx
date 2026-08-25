import React, { useState } from "react";
import { useWF } from "../../state";
import { Plus, Check } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BG_ALT, BORDER } from "../../tokens";
import { Cta } from "./parts";
import { ADDONS } from "./data";

/* The add-ons. Everything here is additive on purpose, so the sheet can never
   read as a list of things being taken off your plate. */
export default function LiftSheet() {
  const { setSuffLift, setSuffFlow, setSuffAddons } = useWF();
  const [chosen, setChosen] = useState([]);

  const toggle = (id) =>
    setChosen(chosen.includes(id) ? chosen.filter((x) => x !== id) : chosen.concat(id));

  const go = () => {
    setSuffAddons(ADDONS.filter((a) => chosen.includes(a.id)).map((a) => a.label));
    setSuffLift(false);
    setSuffFlow("computing2");
  };

  return (
    <div
      onClick={() => setSuffLift(false)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 45,
        background: "rgba(31,38,48,0.42)",
        display: "flex",
        alignItems: "flex-end",
        animation: "scrimIn .24s ease both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lift-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxHeight: "88%",
          display: "flex",
          flexDirection: "column",
          background: BG,
          borderRadius: "26px 26px 0 0",
          boxShadow: "0 -12px 40px rgba(31,38,48,0.22)",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <div style={{ padding: "10px 22px 0", flexShrink: 0 }}>
          <div
            style={{
              width: 38,
              height: 4,
              borderRadius: 2,
              background: BORDER,
              margin: "0 auto 16px",
            }}
          />
          <div id="lift-title" style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>
            Lift your day
          </div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 4, lineHeight: 1.5 }}>
            Tap what you would happily add. Even one helps, and nothing comes off your plate.
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px 4px", minHeight: 0 }}>
          {ADDONS.map((a) => {
            const on = chosen.includes(a.id);
            return (
              <button
                key={a.id}
                onClick={() => toggle(a.id)}
                aria-pressed={on}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textAlign: "left",
                  background: on ? BG_ALT : BG,
                  border: "1.5px solid " + (on ? GREEN : BORDER),
                  borderRadius: 14,
                  padding: "12px 13px",
                  marginBottom: 9,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "border-color .15s, background .15s",
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: on ? GREEN : BG_ALT,
                    border: "1px solid " + (on ? GREEN : BORDER),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {on ? (
                    <Check size={15} color="#fff" strokeWidth={3} />
                  ) : (
                    <Plus size={15} color={MUTED} strokeWidth={2.4} />
                  )}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: TEXT }}>
                    {a.label}
                  </span>
                  <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2 }}>
                    {a.why}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ flexShrink: 0, padding: "10px 22px 24px", borderTop: "1px solid " + BORDER }}>
          <Cta disabled={chosen.length === 0} onClick={go}>
            {chosen.length === 0
              ? "Pick at least one"
              : "See the results (" + chosen.length + ")"}
          </Cta>
        </div>
      </div>
    </div>
  );
}
