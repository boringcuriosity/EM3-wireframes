import React, { useState } from "react";
import { useWF } from "../../state";
import { X, Droplet, Minus, Plus } from "lucide-react";
import TimeSheet from "./TimeSheet";
import { fmtTime } from "./foods";
import { GREEN, GREEN_DEEP, GREEN_TINT, EAT_C, EAT_T, TEXT, MUTED, FAINT, BG, BG_ALT, BORDER } from "../../tokens";

const COINS = 3;
const MAX = 12;

/* Water, counted in glasses.

   Glasses rather than millilitres, because nobody measures a glass and asking
   for a volume invites a made-up number. Tapping the glasses is the control:
   a stepper would be two small targets for a thing somebody does eight times a
   day, and the row of glasses says how many there are without a label.

   The time is here for the same reason it is in the meal logger: when you
   drank is part of what was logged, and it defaults to now so nobody has to
   set it. */
export default function AddWaterSheet() {
  /* The time uses the app's own "when was this" control rather than a second
     one. `logTime` belongs to the meal logger, and the two are never open at
     once, so they share the picker instead of the app carrying two. */
  const {
    waterSheet, setWaterSheet, water, setWater, flipcoins, setFlipcoins, setToast,
    logTime: at, logTimeOpen, setLogTimeOpen,
  } = useWF();
  const [n, setN] = useState(water || 0);

  if (!waterSheet) return null;

  const save = () => {
    const first = water === 0;
    setWater(n);
    if (n > 0 && first) {
      setFlipcoins(flipcoins + COINS);
      setToast({
        title: "Water logged",
        line: n + (n === 1 ? " glass" : " glasses") + " at " + fmtTime(at),
        coins: COINS,
      });
    }
    setWaterSheet(false);
  };

  return (
    <>
      <div
        onClick={() => setWaterSheet(false)}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 55,
          background: "rgba(16,24,40,0.46)",
          display: "flex",
          alignItems: "flex-end",
          animation: "scrimIn .24s ease both",
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="water-title"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            background: BG,
            borderRadius: "26px 26px 0 0",
            overflow: "hidden",
            boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
            animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
          }}
        >
          <div style={{ padding: "22px 22px 0", display: "flex", alignItems: "center", gap: 9 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: EAT_T,
                color: EAT_C,
                borderRadius: 999,
                padding: "4px 10px 4px 8px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              <Droplet size={12} strokeWidth={2.2} />
              Water
            </span>
            <span style={{ flex: 1 }} />
            <button
              onClick={() => setWaterSheet(false)}
              aria-label="Close"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: -4 }}
            >
              <X size={17} color={MUTED} />
            </button>
          </div>

          <div style={{ padding: "13px 22px 0" }}>
            <h2 id="water-title" style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: TEXT, lineHeight: 1.3 }}>
              How much water so far?
            </h2>
            <p style={{ margin: "8px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>
              Tap up to the glass you are on. A glass is about 250ml, and near enough is fine.
            </p>
          </div>

          {/* The glasses themselves, filled up to where you tapped. Tapping the
              one you are already on takes it back off, which is the one gesture
              nobody has to be taught. */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", padding: "18px 22px 0" }}>
            {Array.from({ length: MAX }, (_, i) => {
              const on = i < n;
              return (
                <button
                  key={i}
                  onClick={() => setN(n === i + 1 ? i : i + 1)}
                  aria-label={i + 1 + (i === 0 ? " glass" : " glasses")}
                  aria-pressed={on}
                  style={{
                    width: 38,
                    height: 46,
                    borderRadius: "7px 7px 12px 12px",
                    background: on ? EAT_T : BG_ALT,
                    border: "1.5px solid " + (on ? EAT_C : BORDER),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 0,
                    transition: "background .18s, border-color .18s",
                  }}
                >
                  <Droplet size={16} color={on ? EAT_C : FAINT} strokeWidth={2} fill={on ? EAT_C : "none"} />
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 22px 0" }}>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: TEXT }}>
              {n === 0 ? "No glasses yet" : n + (n === 1 ? " glass" : " glasses") + " today"}
            </span>
            {/* A stepper as well as the glasses, for the twelfth one and for
                anybody who would rather nudge than aim. */}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 2, background: BG_ALT, border: "1px solid " + BORDER, borderRadius: 999, padding: 2 }}>
              <Step Icon={Minus} label="One less glass" onClick={() => setN(Math.max(0, n - 1))} off={n === 0} />
              <Step Icon={Plus} label="One more glass" onClick={() => setN(Math.min(MAX, n + 1))} off={n === MAX} />
            </span>
          </div>

          {/* When you drank it, set to now and editable, the same control the
              meal logger uses. */}
          <div style={{ padding: "14px 22px 0" }}>
            <button
              onClick={() => setLogTimeOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 999,
                padding: "7px 12px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>{fmtTime(at)}</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: GREEN }}>EDIT</span>
            </button>
          </div>

          <div style={{ padding: "18px 22px 26px" }}>
            <button
              onClick={save}
              disabled={n === 0 && water === 0}
              style={{
                width: "100%",
                background: n === 0 && water === 0 ? GREEN_TINT : GREEN,
                border: "none",
                borderRadius: 14,
                padding: "14px 0",
                color: n === 0 && water === 0 ? GREEN : "#fff",
                fontSize: 14.5,
                fontWeight: 700,
                cursor: n === 0 && water === 0 ? "default" : "pointer",
                fontFamily: "inherit",
                boxShadow: n === 0 && water === 0 ? "none" : "0 2px 0 " + GREEN_DEEP,
              }}
            >
              {n === 0 ? "Log no water yet" : "Log " + n + (n === 1 ? " glass" : " glasses")}
            </button>
          </div>
        </div>
      </div>

      {logTimeOpen && <TimeSheet />}
    </>
  );
}

function Step({ Icon, label, onClick, off }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      disabled={off}
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: off ? "transparent" : BG,
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: off ? "default" : "pointer",
        padding: 0,
      }}
    >
      <Icon size={14} color={off ? FAINT : TEXT} strokeWidth={2.4} />
    </button>
  );
}
