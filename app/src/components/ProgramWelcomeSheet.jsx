import React, { useState } from "react";
import { useWF } from "../state";
import { Utensils, Flame, HeartHandshake, ArrowRight, ArrowLeft } from "lucide-react";
import LotusIcon from "./LotusIcon";
import MetabolicScoreDial from "./MetabolicScoreDial";
import {
  GREEN, GREEN_DEEP, GREEN_TINT, GREEN_WASH, TEXT, MUTED, BG, BORDER,
  LINE, PILLAR, SH_SM,
} from "../tokens";

/* Shown once, when a care-program user first lands on Home. Three beats, in
   Kaira's voice, because one long sheet is a document and three short ones is
   a conversation:
     1  what you joined, and that coaches are on the way
     2  the metabolic score, your starting point
     3  logging your day, which is what the coaches read
   Dismissing at any point hands off to the coach mark on the program card. */

const LOGS = [
  { id: "eat", Icon: Utensils, label: "Eat", hint: "Every meal, even the small ones" },
  { id: "move", Icon: Flame, label: "Move", hint: "Walks, workouts, anything" },
  { id: "mind", Icon: LotusIcon, label: "Mind", hint: "Sleep and breathing breaks" },
];

const COACHES = [
  { id: "nutrition", Icon: Utensils, label: "Nutrition coach", line: "Builds your diet plan around how you actually eat." },
  { id: "exercise", Icon: Flame, label: "Exercise coach", line: "Sets movement that fits your body and your day." },
  { id: "success", Icon: HeartHandshake, label: "Success coach", line: "Keeps the whole plan on track and checks in on you." },
];

export default function ProgramWelcomeSheet() {
  const { program, setProgramIntro, firstName, setTour } = useWF();
  const you = firstName;
  const [step, setStep] = useState(0);
  const Icon = program.icon;

  const close = (next) => setProgramIntro(next);
  /* Both ways out land in the same place. Skipping means "I do not need the
     three beats", not "show me nothing", so the tour still runs. */
  const done = () => {
    close(null);
    setTour(0);
  };
  const next = () => (step >= 2 ? done() : setStep(step + 1));

  const BEATS = [
    {
      title: (you ? "Hey " + you + ", welcome to\n" : "Welcome to\n") + program.name + " care.",
      say: (
        <>
          Your coaches will be assigned to you soon. Your program can include coach consultations,
          doctor visits, lab tests and devices.
        </>
      ),
      cta: "What happens next",
      body: (
        <>
          <div
            style={{
              background: GREEN_WASH,
              border: "1px solid " + GREEN_TINT,
              borderRadius: 16,
              padding: "13px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                flexShrink: 0,
                background: BG,
                border: "1px solid " + GREEN_TINT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={19} color={GREEN} strokeWidth={1.8} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{program.name}</div>
              <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>
                {program.duration}, starting today
              </div>
            </div>
          </div>

          {/* Who is coming, and what each of them is for */}
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: MUTED,
              margin: "18px 0 10px",
            }}
          >
            Your coaches
          </div>

          {COACHES.map((c) => (
            <div key={c.id} style={{ display: "flex", gap: 11, marginBottom: 11 }}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: GREEN_TINT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <c.Icon size={14} color={GREEN_DEEP} strokeWidth={2} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>{c.label}</div>
                <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.45, marginTop: 1 }}>
                  {c.line}
                </div>
              </div>
            </div>
          ))}

          <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginTop: 2 }}>
            You will meet all three at your first consultation.
          </div>
        </>
      ),
    },
    {
      title: "Your metabolic score\nis where we start.",
      say: (
        <>
          It shows the condition your metabolic health is in right now. Take it once, and your
          coaches have the context to understand you better.
        </>
      ),
      cta: "Okay, next",
      body: <MetabolicScoreDial />,
    },
    {
      title: "Next, let us understand\nhow your day goes.",
      say: (
        <>
          What you eat, how you move, how you rest. Log it each day, and your coaches build your
          plan around what your days actually look like.
        </>
      ),
      cta: "Let's explore",
      body: (
        <div style={{ display: "flex", gap: 8 }}>
          {LOGS.map((l) => (
            <div
              key={l.id}
              style={{
                flex: 1,
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 14,
                padding: "12px 8px",
                textAlign: "center",
                boxShadow: SH_SM,
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: PILLAR[l.id].t,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <l.Icon size={15} color={PILLAR[l.id].c} strokeWidth={2} />
              </span>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: TEXT, marginTop: 6 }}>
                {l.label}
              </div>
              <div style={{ fontSize: 9.5, color: MUTED, marginTop: 2, lineHeight: 1.35 }}>
                {l.hint}
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const b = BEATS[step];

  return (
    <div
      onClick={() => close(null)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 40,
        background: "rgba(16,24,40,0.46)",
        display: "flex",
        alignItems: "flex-end",
        animation: "scrimIn .24s ease both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: BG,
          borderRadius: "26px 26px 0 0",
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          maxHeight: "88%",
          overflowY: "auto",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: BORDER, margin: "10px auto 0" }} />

        {/* Kaira speaks. The mark, a live pulse behind it, then her line. */}
        <div style={{ padding: "16px 22px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            {/* Kaira narrates every beat, so her mark never leaves the header. */}
            {(
              <span style={{ position: "relative", display: "flex", flexShrink: 0 }}>
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: -4,
                    background: GREEN,
                    clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                    animation: "kairaPulse 2.6s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    position: "relative",
                    width: 26,
                    height: 28,
                    background: "linear-gradient(150deg, " + GREEN + " 0%, " + GREEN_DEEP + " 100%)",
                    clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  K
                </span>
              </span>
            )}

            {/* Where we are, three beats */}
            <span style={{ marginLeft: "auto", display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: i === step ? 16 : 5,
                    height: 5,
                    borderRadius: 3,
                    background: i <= step ? GREEN : LINE,
                    transition: "width .3s ease, background .3s ease",
                  }}
                />
              ))}
            </span>

            <button
              onClick={done}
              style={{
                background: "none",
                border: "none",
                padding: "4px 0 4px 6px",
                marginLeft: 4,
                fontSize: 12,
                fontWeight: 600,
                color: MUTED,
                cursor: "pointer",
                fontFamily: "inherit",
                flexShrink: 0,
              }}
            >
              Later
            </button>
          </div>

          {/* The beat itself, remounted per step so it animates in each time */}
          <div key={step}>
            <h2
              id="welcome-title"
              style={{
                margin: "14px 0 0",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 24,
                fontWeight: 600,
                color: TEXT,
                lineHeight: 1.22,
                letterSpacing: -0.2,
                whiteSpace: "pre-line",
                animation: "riseIn .4s ease both",
              }}
            >
              {b.title}
            </h2>

            <p
              style={{
                margin: "10px 0 0",
                fontSize: 12.5,
                color: MUTED,
                lineHeight: 1.6,
                animation: "riseIn .4s .06s ease both",
              }}
            >
              {b.say}
            </p>

            <div style={{ marginTop: 18, animation: "riseIn .4s .12s ease both" }}>{b.body}</div>
          </div>
        </div>

        <div style={{ padding: "20px 22px 24px", display: "flex", alignItems: "stretch", gap: 10 }}>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              aria-label="Back"
              style={{
                width: 52,
                flexShrink: 0,
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
                boxShadow: "0 2px 0 " + LINE,
              }}
            >
              <ArrowLeft size={17} color={TEXT} strokeWidth={2.2} />
            </button>
          )}
          <button
            onClick={next}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              background: GREEN,
              border: "none",
              borderRadius: 14,
              padding: "14px 0",
              color: "#fff",
              fontSize: 14.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 2px 0 " + GREEN_DEEP,
            }}
          >
            {b.cta}
            <ArrowRight size={16} color="#fff" strokeWidth={2.6} />
          </button>
        </div>
      </div>
    </div>
  );
}
