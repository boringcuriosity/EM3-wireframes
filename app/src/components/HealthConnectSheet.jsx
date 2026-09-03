import React from "react";
import { useWF } from "../state";
import { X, Check } from "lucide-react";
import { GREEN, GREEN_DEEP, TEXT, MUTED, FAINT, BG, BG_ALT, BORDER, LINE } from "../tokens";

/* Where a signal comes from, asked once and changeable after.

   The OS permission screen is a wall of switches with no reason attached, so
   this comes first, shows the screen that is about to appear, and says what we
   read off it. One thing to say yes to, with typing it in yourself underneath
   for the many people here who have nothing to read from. */

const SIGNALS = {
  steps: {
    title: "Your steps",
    head: "Let your phone count your steps.",
    why: "It is already keeping this. Connecting it means the walking you do anyway counts without you having to remember it.",
    note: "your step count, walking distance and workout minutes",
    /* What the permission screen actually offers, which is coarser than what
       we read off it: the phone grants a category and the app works out the
       rest. Drawing three switches for the three lines above would be a
       screen nobody is ever shown. */
    perms: [
      { name: "Steps", on: true },
      { name: "Distance", on: true },
      { name: "Exercise", on: true },
      { name: "Heart rate", on: false },
      { name: "Weight", on: false },
    ],
    manual: "I will log my walks myself",
  },
  sleep: {
    title: "Your sleep",
    head: "Let your phone tell us how you slept.",
    why: "Your body clock runs on when you sleep, not just how long, and that is what shapes how you handle food the next day.",
    note: "time asleep, bedtime and wake time, and your sleep stages",
    perms: [
      { name: "Sleep", on: true },
      { name: "Heart rate", on: false },
      { name: "Steps", on: false },
      { name: "Weight", on: false },
    ],
    manual: "I will tell you when I slept",
  },
};

export default function HealthConnectSheet() {
  const { healthSheet, setHealthSheet, healthSource, pickSource } = useWF();
  const s = SIGNALS[healthSheet];
  if (!s) return null;

  const current = healthSource[healthSheet];
  const pick = (v) => {
    pickSource(healthSheet, v);
    setHealthSheet(null);
  };

  return (
    <div
      onClick={() => setHealthSheet(null)}
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
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: BG,
          borderRadius: "26px 26px 0 0",
          overflow: "hidden",
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          maxHeight: "92%",
          display: "flex",
          flexDirection: "column",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px 0", minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ flex: 1 }} />
            <button
              onClick={() => setHealthSheet(null)}
              aria-label="Close"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: -4 }}
            >
              <X size={17} color={MUTED} />
            </button>
          </div>

          <h2
            style={{
              margin: "14px 0 0",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: TEXT,
              lineHeight: 1.24,
            }}
          >
            {s.head}
          </h2>
          <p style={{ margin: "9px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>{s.why}</p>

          <Phone perms={s.perms} />
        </div>

        <div style={{ flexShrink: 0, padding: "16px 22px 24px" }}>
          <button
            onClick={() => pick("phone")}
            style={{
              width: "100%",
              height: 50,
              borderRadius: 15,
              background: GREEN,
              border: "none",
              boxShadow: "0 2px 0 " + GREEN_DEEP,
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
            }}
          >
            {current === "phone" && <Check size={16} color="#fff" strokeWidth={3} />}
            {current === "phone" ? "Health Connect is on" : "Allow Health Connect"}
          </button>

          <button
            onClick={() => pick("manual")}
            style={{
              width: "100%",
              marginTop: 10,
              height: 44,
              borderRadius: 15,
              background: "none",
              border: "none",
              color: current === "manual" ? GREEN_DEEP : MUTED,
              fontSize: 13.5,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {current === "manual" && <Check size={14} color={GREEN_DEEP} strokeWidth={3} />}
            {s.manual}
          </button>

          <p style={{ margin: "6px 0 0", fontSize: 11, color: FAINT, lineHeight: 1.5, textAlign: "center" }}>
            We read {s.note}. Nothing else, and your health data stays yours.
          </p>
        </div>
      </div>
    </div>
  );
}

/* The screen that appears next, drawn small. Somebody about to be handed a
   page of switches by their phone should recognise it when it arrives, and
   seeing the list is what makes "only what is listed" mean something. */
function Phone({ perms }) {
  return (
    <div
      style={{
        marginTop: 20,
        display: "flex",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          width: 208,
          border: "1px solid " + BORDER,
          borderRadius: "22px 22px 0 0",
          borderBottom: "none",
          background: BG_ALT,
          padding: "16px 14px 0",
          boxShadow: "0 -1px 0 rgba(16,24,40,0.02), 0 8px 22px -14px rgba(16,24,40,0.35)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
          <img
            src="/health-heart.png"
            alt=""
            width={40}
            height={40}
            style={{
              display: "block",
              background: "#fff",
              borderRadius: 11,
              padding: 6,
              boxSizing: "border-box",
              boxShadow: "0 1px 3px rgba(16,24,40,0.14)",
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>Health Connect</span>
        </div>

        <div
          style={{
            marginTop: 12,
            background: BG,
            border: "1px solid " + LINE,
            borderRadius: 10,
            padding: "7px 10px",
            fontSize: 11,
            fontWeight: 700,
            color: GREEN,
          }}
        >
          Allow selected
        </div>

        <div
          style={{
            marginTop: 8,
            background: BG,
            border: "1px solid " + LINE,
            borderRadius: 10,
            padding: "2px 10px",
            /* Faded out at the bottom rather than cut, because the real screen
               keeps going and a hard edge would say it does not. */
            maskImage: "linear-gradient(#000 42%, transparent 96%)",
            WebkitMaskImage: "linear-gradient(#000 42%, transparent 96%)",
          }}
        >
          {perms.map((x) => (
            <div
              key={x.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 0",
                borderBottom: "1px solid " + LINE,
              }}
            >
              <span style={{ flex: 1, minWidth: 0, fontSize: 10.5, color: x.on ? TEXT : MUTED }}>
                {x.name}
              </span>
              {/* Off for the ones we do not ask for. A screen where everything
                  is on says we take everything, which is the opposite of what
                  the line under the button promises. */}
              <span
                style={{
                  width: 22,
                  height: 13,
                  borderRadius: 999,
                  background: x.on ? GREEN : BORDER,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: x.on ? "flex-end" : "flex-start",
                  padding: 1.5,
                  boxSizing: "border-box",
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: 999, background: "#fff" }} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
