import React from "react";
import { useWF } from "../state";
import { HeartPulse, PencilLine, Footprints, Moon, Check } from "lucide-react";
import CtaArrow from "./CtaArrow";
import { GREEN, GREEN_DEEP, MOVE_C, MIND_C, TEXT, MUTED, BG, BG_ALT, BORDER } from "../tokens";

/* Asked once, the first time someone opens Move or Mind, and not skippable.

   Not because we want to trap anyone, but because both answers are real
   answers. There is no "later" here: a pillar that does not know where its
   numbers come from cannot show anything, so a dismissed screen would leave an
   empty one behind it. Choosing to log by hand is a complete answer and takes
   one tap. */

const COPY = {
  steps: {
    Icon: Footprints,
    accent: MOVE_C,
    title: "How should we count your movement?",
    line: "Health Connect is where your phone already keeps your steps and workouts. Connect it and Move fills in on its own.",
    reads: ["Steps", "Workouts", "Distance"],
    manual: "I will log it myself",
    manualLine: "A few seconds after each walk or workout.",
  },
  sleep: {
    Icon: Moon,
    accent: MIND_C,
    title: "How should we know about your sleep?",
    line: "If your phone or watch tracks your nights, Health Connect already has them. Connect it and your sleep fills in on its own.",
    reads: ["Time asleep", "Bedtime and wake time"],
    manual: "I will tell you myself",
    manualLine: "Two taps in the morning, and nothing to wear at night.",
  },
};

export default function HealthGate({ signal }) {
  const { healthSource, setHealthSource } = useWF();
  const c = COPY[signal];
  const pick = (v) => setHealthSource({ ...healthSource, [signal]: v });

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: BG,
        minHeight: 0,
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "26px 26px 0" }}>
        {/* The two apps, and the fact that one is about to hand data to the
            other. Drawn rather than branded: this is a wireframe. */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 18 }}>
          <Mark bg="#0B3B4A" fg="#4285F4">
            <HeartPulse size={26} color="#fff" strokeWidth={2} />
          </Mark>
          <span style={{ display: "flex", gap: 4 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: BORDER }} />
            ))}
          </span>
          <Mark bg={GREEN} fg={GREEN_DEEP}>
            <svg width="24" height="26" viewBox="0 0 22 24" fill="none" aria-hidden>
              <path d="M11 1.2 20.1 6.6v10.8L11 22.8 1.9 17.4V6.6z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </Mark>
        </div>

        <h1
          style={{
            margin: "28px 0 0",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 24,
            fontWeight: 600,
            color: TEXT,
            lineHeight: 1.25,
            textAlign: "center",
          }}
        >
          {c.title}
        </h1>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: 13.5,
            color: MUTED,
            lineHeight: 1.6,
            textAlign: "center",
          }}
        >
          {c.line}
        </p>

        {/* Exactly what is read, so the OS sheet that follows is not a
            surprise. */}
        <div
          style={{
            marginTop: 22,
            background: BG_ALT,
            border: "1px solid " + BORDER,
            borderRadius: 16,
            padding: "13px 15px",
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9.5,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: MUTED,
              marginBottom: 9,
            }}
          >
            We read only this
          </div>
          {c.reads.map((r) => (
            <div key={r} style={{ display: "flex", alignItems: "center", gap: 9, padding: "3px 0" }}>
              <Check size={13} color={GREEN} strokeWidth={2.6} />
              <span style={{ fontSize: 12.5, color: TEXT }}>{r}</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: MUTED, marginTop: 9, lineHeight: 1.5 }}>
            Nothing else, and you can turn it off any time.
          </div>
        </div>
      </div>

      <div style={{ flexShrink: 0, padding: "16px 26px 26px" }}>
        <button
          onClick={() => pick("phone")}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: GREEN,
            border: "none",
            borderRadius: 14,
            padding: "15px 0",
            fontSize: 14.5,
            fontWeight: 700,
            color: "#fff",
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 2px 0 " + GREEN_DEEP,
          }}
        >
          Connect Health Connect
          <CtaArrow size={15} />
        </button>

        <button
          onClick={() => pick("manual")}
          style={{
            width: "100%",
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: BG,
            border: "1px solid " + GREEN,
            borderRadius: 14,
            padding: "14px 0",
            fontSize: 14,
            fontWeight: 700,
            color: GREEN,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <PencilLine size={15} color={GREEN} strokeWidth={2.2} />
          {c.manual}
        </button>

        <div style={{ fontSize: 11, color: MUTED, textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
          {c.manualLine} You can change this later from the {signal === "steps" ? "Move" : "Mind"} screen.
        </div>
      </div>
    </div>
  );
}

function Mark({ bg, fg, children }) {
  return (
    <span
      style={{
        width: 56,
        height: 56,
        borderRadius: 18,
        background: "linear-gradient(150deg, " + bg + " 0%, " + fg + " 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}
