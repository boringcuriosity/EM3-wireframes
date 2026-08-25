import React from "react";
import { useWF } from "../../state";
import { TEXT, MUTED, BG, BG_ALT, BORDER, GREEN } from "../../tokens";
import { FlowScreen, Cta, Eyebrow, KairaMark, Title } from "./parts";
import { NUTRIENTS, BENEFITS } from "./data";

/* Step one. The whole idea in one comparison, then why it is worth caring
   about, then what it is built on. Education lives here so the card on the Eat
   screen can stay a single sentence. */
export default function Learn() {
  const { setSuffFlow } = useWF();

  return (
    <FlowScreen
      step="learn"
      onBack={() => setSuffFlow(null)}
      footer={<Cta onClick={() => setSuffFlow("profile")}>Try it on my usual day</Cta>}
    >
      <div style={{ padding: "0 22px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <KairaMark size={22} />
          <span style={{ fontSize: 12.5, color: MUTED }}>Hey, I'm Kaira.</span>
        </div>

        <Title sub="I find where your day falls short, then suggest small add-ons that close the gap.">
          Your meals have the calories.
          <br />
          But are they enough?
        </Title>
      </div>

      {/* The whole idea, as one picture */}
      <div style={{ padding: "18px 22px", display: "flex", gap: 10 }}>
        <Plate label="Not enough" filled={1} note="Same calories" />
        <Plate label="Enough" filled={5} note="Plus a little protein and fibre" good />
      </div>

      <div style={{ padding: "6px 22px 20px" }}>
        <Eyebrow>THE FOUR THINGS WE COUNT</Eyebrow>
        <div style={{ display: "flex", gap: 6 }}>
          {NUTRIENTS.map((n) => (
            <span
              key={n.id}
              style={{
                flex: 1,
                textAlign: "center",
                background: BG_ALT,
                border: "1px solid " + BORDER,
                borderRadius: 10,
                padding: "8px 2px",
                fontSize: 11,
                fontWeight: 700,
                color: TEXT,
              }}
            >
              {n.label}
            </span>
          ))}
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 11.5, color: MUTED, lineHeight: 1.55 }}>
          Your day gets one score: how close your meals came to giving your body enough of these
          four.
        </p>
      </div>

      <div style={{ padding: "18px 22px", borderTop: "1px solid " + BORDER }}>
        <Eyebrow>WHY ENOUGH MATTERS</Eyebrow>
        {BENEFITS.map((b, i) => (
          <div key={b.title} style={{ display: "flex", gap: 11, marginBottom: 13 }}>
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 7,
                flexShrink: 0,
                background: BG_ALT,
                border: "1px solid " + BORDER,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10.5,
                fontWeight: 700,
                color: MUTED,
              }}
            >
              {i + 1}
            </span>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>{b.title}</div>
              <div style={{ fontSize: 11.5, color: MUTED, marginTop: 3, lineHeight: 1.5 }}>
                {b.line}
              </div>
            </div>
          </div>
        ))}

        <div
          style={{
            background: BG_ALT,
            border: "1px solid " + TEXT,
            borderRadius: 14,
            padding: "12px 14px",
            fontSize: 12,
            color: TEXT,
            lineHeight: 1.55,
          }}
        >
          <strong>And nothing to cut.</strong> Keep your poha, dal and biryani. Small add-ons close
          the gaps in what you already eat, with no calorie counting.
        </div>
      </div>

      <div style={{ padding: "18px 22px 24px", borderTop: "1px solid " + BORDER }}>
        <Eyebrow>WHAT IT IS BUILT ON</Eyebrow>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { k: "WHO", v: "Dietary guidelines" },
            { k: "ICMR", v: "Nutrient references" },
          ].map((s) => (
            <div
              key={s.k}
              style={{
                flex: 1,
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 14,
                padding: "14px 10px",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: TEXT,
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                {s.k}
              </span>
              <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.4 }}>{s.v}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 12,
            background: BG_ALT,
            border: "1px dashed " + BORDER,
            borderRadius: 12,
            padding: "11px 13px",
            fontSize: 11,
            color: MUTED,
            lineHeight: 1.55,
          }}
        >
          One honest note: sufficiency covers protein, carbs, fats and fibre, not micronutrients like
          iron or vitamin B12. It is a guide, not medical advice. For a health condition, talk to
          your doctor.
        </div>
      </div>
    </FlowScreen>
  );
}

/* A plate and a five segment meter. The two sit side by side so the difference
   is something you see before you read it. */
function Plate({ label, filled, note, good }) {
  return (
    <div
      style={{
        flex: 1,
        background: BG,
        border: "1px solid " + (good ? TEXT : BORDER),
        borderRadius: 16,
        padding: 12,
        textAlign: "center",
      }}
    >
      <div
        style={{
          height: 74,
          borderRadius: 12,
          background: BG_ALT,
          border: "1px dashed " + BORDER,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "1.5px solid " + (good ? TEXT : "#D0D5DD"),
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 3, justifyContent: "center", marginBottom: 8 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            style={{
              width: 8,
              height: 14,
              borderRadius: 2,
              background: i < filled ? (good ? GREEN : "#D0D5DD") : "transparent",
              border: "1px solid " + (i < filled ? (good ? GREEN : "#D0D5DD") : BORDER),
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: good ? TEXT : MUTED }}>{label}</div>
      <div style={{ fontSize: 10, color: MUTED, marginTop: 3, lineHeight: 1.4 }}>{note}</div>
    </div>
  );
}
