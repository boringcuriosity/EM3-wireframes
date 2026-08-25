import React from "react";
import { useWF } from "../state";
import { GREEN, GREEN_DEEP, TEXT, MUTED, PILLAR } from "../tokens";
import { illustration, ftuxShell, StartCta } from "../ui";
import TourTarget from "./TourTarget";

export default function FtuxExplainer() {
  const { metPillars } = useWF();

  return (
    ftuxShell(
      <>
        {/* The tour points at what the card teaches, not at its button. The
            button is the tour note's own action. */}
        <TourTarget id="pillars">
        {/* Figure left, headline + subtext right */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {illustration(46, 76)}
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
                The four pillars of metabolism
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.45 }}>
              Your metabolism is built on these four. Small daily habits in each let you see it and shift it.
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
