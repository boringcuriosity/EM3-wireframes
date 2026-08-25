import React from "react";
import { useWF } from "../state";
import { Info } from "lucide-react";
import { GREEN, GREEN_DEEP, TEXT, MUTED, BG, BORDER, LINE, PILLAR, SH } from "../tokens";

/* EM3, taught once and rendered in both places it is needed: the onboarding
   takeover and the To-do tab's first run. Two screens telling the same story
   in two different ways is how a product starts contradicting itself. */
export default function Em3Explainer() {
  const { pillarExplain, setPillarInfo } = useWF();

  return (
    <>
      {/* Kaira says it. Small mark beside the line rather than a portrait
          above it, because she is the speaker here, not the subject. */}
      <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
        <span style={{ position: "relative", display: "inline-flex", flexShrink: 0, marginTop: 3 }}>
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
              width: 28,
              height: 30,
              background: "linear-gradient(150deg, " + GREEN + " 0%, " + GREEN_DEEP + " 100%)",
              clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            K
          </span>
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 24,
              fontWeight: 600,
              color: TEXT,
              lineHeight: 1.22,
              letterSpacing: -0.3,
            }}
          >
            Your metabolism runs
            <br />
            on four habits.
          </h1>

          <p style={{ margin: "9px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>
            Doing small efforts in each, most days is enough to shift your metabolism.
          </p>
        </div>
      </div>

      {/* The four, on a rail, so they read as one framework */}
      <div style={{ position: "relative", marginTop: 22, paddingBottom: 4 }}>
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 21,
            top: 22,
            bottom: 30,
            width: 2,
            borderRadius: 1,
            background: LINE,
          }}
        />

        {pillarExplain.map((p, i) => {
          const hue = PILLAR[p.id];
          return (
            <div
              key={p.id}
              style={{
                display: "flex",
                gap: 13,
                marginBottom: 14,
                animation: "riseIn .45s " + (0.05 + i * 0.07) + "s ease both",
              }}
            >
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: hue.t,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  zIndex: 1,
                  boxShadow: "0 0 0 5px " + BG,
                }}
              >
                <p.Icon size={20} color={hue.c} strokeWidth={1.9} />
              </span>

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: BG,
                  border: "1px solid " + BORDER,
                  borderRadius: 16,
                  padding: "12px 14px 13px",
                  boxShadow: SH,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 17,
                      fontWeight: 600,
                      color: TEXT,
                      lineHeight: 1,
                    }}
                  >
                    {p.label}
                  </span>
                  {/* The concept and the way to the science behind it, one
                      control, because the label is what raises the question. */}
                  <button
                    onClick={() => setPillarInfo(p.id)}
                    aria-label={"Why " + p.concept + " matters"}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      background: hue.t,
                      color: hue.c,
                      border: "none",
                      borderRadius: 999,
                      padding: "4px 8px 4px 9px",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 0.2,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {p.concept}
                    <Info size={11} strokeWidth={2.4} />
                  </button>
                </div>
                <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.6, marginTop: 7 }}>
                  {p.line}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          fontSize: 11.5,
          color: MUTED,
          textAlign: "center",
          lineHeight: 1.55,
          margin: "4px 0 8px",
        }}
      >
        These four are your daily to-do list. Your coaches shape each one as they get to know you.
      </div>
    </>
  );
}
