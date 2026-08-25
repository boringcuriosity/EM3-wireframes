import React from "react";
import { useWF } from "../state";
import { X, Smartphone, PencilLine, Check, Footprints, Moon } from "lucide-react";
import { GREEN, GREEN_DEEP, GREEN_TINT, TEXT, MUTED, BG, BG_ALT, BORDER, LINE } from "../tokens";

/* Where a signal comes from, asked once and changeable after.

   The OS permission sheet is a wall of switches with no reason attached, so
   this comes first and says plainly what we read and why. Manual sits beside
   it as an equal, not a fallback: most people here have no wearable, and an
   app that only works with one does not work. */

const SIGNALS = {
  steps: {
    Icon: Footprints,
    title: "Your steps",
    reads: ["Steps", "Walking distance", "Workouts"],
    why: "So the walking you already do counts without you having to remember it.",
    manual: "Log each walk or workout yourself",
    manualLine: "Takes a few seconds and you stay in control of what is recorded.",
  },
  sleep: {
    Icon: Moon,
    title: "Your sleep",
    reads: ["Time asleep", "Bedtime and wake time"],
    why: "Your body clock runs on when you sleep, not just how long, and that is what shapes how you handle food the next day.",
    manual: "Tell us when you slept",
    manualLine: "Two taps in the morning. Bedtime and wake time is all we need.",
  },
};

export default function HealthConnectSheet() {
  const { healthSheet, setHealthSheet, healthSource, setHealthSource } = useWF();
  const s = SIGNALS[healthSheet];
  if (!s) return null;

  const current = healthSource[healthSheet];
  const pick = (v) => {
    setHealthSource({ ...healthSource, [healthSheet]: v });
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
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          maxHeight: "88%",
          display: "flex",
          flexDirection: "column",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: BORDER, margin: "10px auto 0", flexShrink: 0 }} />

        <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px 0", minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: GREEN_TINT,
                color: GREEN_DEEP,
                borderRadius: 999,
                padding: "4px 10px 4px 8px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              <s.Icon size={12} strokeWidth={2.2} />
              {s.title}
            </span>
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
              margin: "13px 0 0",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 20,
              fontWeight: 600,
              color: TEXT,
              lineHeight: 1.3,
            }}
          >
            Both of these work. Pick whichever suits you.
          </h2>
          <p style={{ margin: "9px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>{s.why}</p>

          <div style={{ height: 1, background: LINE, margin: "16px 0 14px" }} />

          <Option
            value="phone"
            Icon={Smartphone}
            title="Use my phone's health app"
            line="We read only what is listed here, and nothing else. You can turn it off any time."
            chips={s.reads}
            current={current}
            pick={pick}
          />
          <Option value="manual" Icon={PencilLine} title={s.manual} line={s.manualLine} current={current} pick={pick} />
        </div>

        <div style={{ flexShrink: 0, padding: "8px 22px 24px", fontSize: 11, color: MUTED, lineHeight: 1.5 }}>
          Your health data stays yours. It is used to shape your plan and nothing else.
        </div>
      </div>
    </div>
  );
}

function Option({ value, Icon, title, line, chips, current, pick }) {
    const on = current === value;
    return (
      <button
        onClick={() => pick(value)}
        style={{
          width: "100%",
          textAlign: "left",
          display: "flex",
          gap: 11,
          background: on ? GREEN_TINT : BG,
          border: "1px solid " + (on ? GREEN : BORDER),
          borderRadius: 16,
          padding: "13px 14px",
          marginBottom: 10,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            flexShrink: 0,
            background: on ? BG : BG_ALT,
            border: "1px solid " + (on ? GREEN : BORDER),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={15} color={on ? GREEN : MUTED} strokeWidth={2} />
        </span>

        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: TEXT }}>{title}</span>
            {on && <Check size={15} color={GREEN} strokeWidth={3} />}
          </span>
          <span style={{ display: "block", fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginTop: 3 }}>
            {line}
          </span>
          {chips && (
            <span style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 9 }}>
              {chips.map((x) => (
                <span
                  key={x}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: MUTED,
                    background: BG_ALT,
                    border: "1px solid " + BORDER,
                    borderRadius: 999,
                    padding: "3px 8px",
                  }}
                >
                  {x}
                </span>
              ))}
            </span>
          )}
        </span>
      </button>
    );
  }
