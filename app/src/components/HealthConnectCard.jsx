import React from "react";
import { useWF } from "../state";
import { Smartphone, RefreshCw, Check } from "lucide-react";
import CtaArrow from "./CtaArrow";
import { GREEN, GREEN_DEEP, GREEN_TINT, TEXT, MUTED, BG, BORDER, LINE, SH } from "../tokens";

/* Two states of the same fact: where this pillar's numbers come from.

   Before a source is picked it makes the offer. After, it shrinks to a line,
   because a connection that is working should not keep announcing itself. */

const COPY = {
  steps: {
    title: "Where should your steps come from?",
    line: "Health Connect has them already. Connect it and your movement fills in on its own.",
  },
  sleep: {
    title: "Where should your sleep come from?",
    line: "If your phone or watch tracks your nights, Health Connect has them. If not, telling us works just the same.",
  },
};

export default function HealthConnectCard({ signal }) {
  const { healthSource, setHealthSheet } = useWF();
  const src = healthSource[signal];
  const c = COPY[signal];

  // Connected, or told us they will do it by hand. Either way it is settled,
  // so it becomes a footnote.
  if (src) {
    return (
      <button
        onClick={() => setHealthSheet(signal)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "none",
          border: "none",
          padding: "2px 0 0",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {src === "phone" ? (
          <RefreshCw size={12} color={MUTED} strokeWidth={2.2} />
        ) : (
          <Check size={12} color={MUTED} strokeWidth={2.6} />
        )}
        <span style={{ flex: 1, minWidth: 0, fontSize: 11, color: MUTED, textAlign: "left" }}>
          {src === "phone" ? "Synced from Health Connect, 6 minutes ago" : "You are entering this by hand"}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: GREEN }}>Change</span>
      </button>
    );
  }

  return (
    <div
      style={{
        background: BG,
        border: "1px solid " + BORDER,
        borderRadius: 16,
        padding: "14px 15px",
        boxShadow: SH,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 9,
            flexShrink: 0,
            background: GREEN_TINT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Smartphone size={15} color={GREEN} strokeWidth={2} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>{c.title}</div>
          <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginTop: 3 }}>{c.line}</div>
        </div>
      </div>

      <div style={{ height: 1, background: LINE, margin: "12px 0" }} />

      <button
        onClick={() => setHealthSheet(signal)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: GREEN,
          border: "none",
          borderRadius: 12,
          padding: "11px 0",
          fontSize: 13,
          fontWeight: 700,
          color: "#fff",
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: "0 2px 0 " + GREEN_DEEP,
        }}
      >
        Set this up
        <CtaArrow size={14} />
      </button>
    </div>
  );
}
