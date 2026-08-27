import React from "react";
import { useWF } from "../state";
import { GREEN, GREEN_DEEP, TEXT, MUTED, PILLAR } from "../tokens";
import { ftuxShell, StartCta } from "../ui";
import TourTarget from "./TourTarget";

export default function FtuxExplainer() {
  const { metPillars } = useWF();

  return (
    ftuxShell(
      <>
        {/* The tour points at what the card teaches, not at its button. The
            button is the tour note's own action. */}
        <TourTarget id="pillars">
        {/* Headline and subtext, full width. The placeholder figure took a
            third of a small card to say nothing yet. */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
              <span
                style={{
                  width: 18,
                  height: 18,
                  flexShrink: 0,
                  background: "linear-gradient(150deg, " + GREEN + " 0%, " + GREEN_DEEP + " 100%)",
                  clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                K
              </span>
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 16,
                  fontWeight: 600,
                  color: TEXT,
                  lineHeight: 1.2,
                }}
              >
                Your metabolism runs on four pillars
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.45 }}>
              Small daily tasks in each build the habits that let you see your metabolism, and
              change it.
            </div>
          </div>
        </div>

        {/* Four pillars in soft mono squares */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {metPillars.map((p) => (
            <div
              key={p.id}
              style={{
                flex: 1,
                background: PILLAR[p.id].w,
                border: "1px solid " + PILLAR[p.id].c + "1F",
                borderRadius: 12,
                padding: "11px 4px 9px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <p.Icon size={18} color={PILLAR[p.id].c} strokeWidth={1.9} />
              <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{p.label}</span>
            </div>
          ))}
        </div>
        </TourTarget>

        {<StartCta />}
      </>
    )
  );
}
