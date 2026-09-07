import React from "react";
import { useWF } from "../../state";
import { Lock } from "lucide-react";
import { ScoreScreen } from "./parts";
import { Cta, KairaMark } from "../sufficiency/parts";
import { TEXT, MUTED, FAINT, BG_ALT, BORDER } from "../../tokens";

/* What the score is, before any of it is asked for.

   Four parts, named up front, and one of them is a lab test somebody has to
   book. Saying so here is the point: a score that turns out at the end to have
   been a quarter missing all along reads as a bait, and the part that is
   missing is the part that costs money. */
export default function Intro() {
  const { setScoreFlow, SUB_SCORES, firstName } = useWF();

  return (
    <ScoreScreen
      step="intro"
      onBack={() => setScoreFlow(null)}
      footer={<Cta onClick={() => setScoreFlow("focus")}>Get my metabolic score</Cta>}
    >
      <div style={{ padding: "4px 22px 24px" }}>
        <div
          style={{
            display: "flex",
            gap: 11,
            padding: "13px 14px",
            background: BG_ALT,
            border: "1px solid " + BORDER,
            borderRadius: 16,
          }}
        >
          <KairaMark size={26} />
          <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.55 }}>
            {firstName ? firstName + ", the" : "The"} first thing your coaches read is where you
            are starting from. This is that.
          </div>
        </div>

        {/* The score as an object before it is a number: a halo of the four
            parts' own colours around the name, then the four named underneath
            as the things it is made of. A vertical list of four rows read as a
            settings screen, and this is the one screen whose whole job is to
            make somebody want the thing. */}
        {/* The halo rings the name and nothing else. Wrapped around the
            paragraph as well it threw dots across the words, which is the one
            thing a decorative layer must never do. */}
        <div
          style={{
            position: "relative",
            height: 196,
            margin: "18px 0 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Halo tones={SUB_SCORES.map((x) => x.tone)} />
          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: MUTED, letterSpacing: 0.2 }}>
              Unlock your
            </div>
            <h1
              style={{
                margin: "2px 0 0",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 33,
                fontWeight: 600,
                color: TEXT,
                letterSpacing: -0.6,
                lineHeight: 1.12,
              }}
            >
              Metabolic
              <br />
              Score
            </h1>
          </div>
        </div>

        <p style={{ margin: "2px auto 0", maxWidth: 262, fontSize: 12.5, color: MUTED, lineHeight: 1.6, textAlign: "center" }}>
          One number for how your metabolism is doing today, out of 400. It is made of four parts,
          and three of them open right now.
        </p>

        <div style={{ height: 16 }} />

        {/* Four across rather than four down. They are peers you glance at, not
            a list you work through, and side by side they cost a third of the
            room. The locked one keeps its place so the quarter that costs
            money is visible before anybody starts. */}
        <div style={{ display: "flex", gap: 8 }}>
          {SUB_SCORES.map((x) => (
            <div
              key={x.id}
              style={{
                flex: 1,
                minWidth: 0,
                padding: "11px 9px 10px",
                borderRadius: 14,
                background: x.tone + "12",
                border: "1px solid " + x.tone + "33",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                {/* All four shut. Nothing has been answered yet, so drawing
                    three of them open would be showing somebody a result they
                    have not got. Which ones open here is what the line above
                    says. */}
                <Lock size={13} color={x.value === null ? FAINT : x.tone} strokeWidth={2.4} />
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: x.tone }} />
              </span>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>
                {x.label}
                <br />
                score
              </span>
            </div>
          ))}
        </div>

        {/* The one that cannot be opened here, said once and in words rather
            than as a badge on a card too small to hold the reason. */}
        <div style={{ marginTop: 12, fontSize: 11.5, color: FAINT, lineHeight: 1.5, textAlign: "center" }}>
          {SUB_LINES.diagnostic}
        </div>
      </div>
    </ScoreScreen>
  );
}

/* The scatter behind the name. Two rings of dots in the four parts' own
   colours, thrown by an index rather than at random so it is the same shape
   every time this screen opens. */
function Halo({ tones }) {
  const dots = [];
  for (let i = 0; i < 64; i++) {
    const ring = i % 3;
    /* Open at the bottom, the way the reference is: the arc reads as a thing
       opening rather than as a closed ring around a label. */
    const a = -Math.PI * 1.14 + (i / 64) * Math.PI * 1.44;
    const r = 92 + ring * 13 + ((i * 37) % 11);
    const d = 4 + ((i * 17) % 4);
    dots.push(
      <span
        key={i}
        style={{
          position: "absolute",
          left: "calc(50% + " + Math.round(Math.cos(a) * r) + "px)",
          top: "calc(50% + " + Math.round(Math.sin(a) * r * 0.9) + "px)",
          width: d,
          height: d,
          borderRadius: "50%",
          background: tones[i % tones.length],
          opacity: 0.28 + ((i * 11) % 5) * 0.09,
        }}
      />
    );
  }
  return (
    <span aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {dots}
    </span>
  );
}

const SUB_LINES = {
  profile: "Your age, size and family history.",
  wellness: "How you sleep, move and feel.",
  habit: "What a normal week actually looks like.",
  diagnostic: "Blood work. It opens once a lab test comes back.",
};
