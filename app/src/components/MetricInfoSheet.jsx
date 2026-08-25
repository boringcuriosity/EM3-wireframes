import React from "react";
import { useWF } from "../state";
import { X } from "lucide-react";
import { GREEN, GREEN_DEEP, TEXT, MUTED, BG, BORDER, LINE, MOVE_C, MOVE_T, GOLD_DEEP, GOLD_TINT, GREEN_TINT } from "../tokens";

/* The three figures on the daily summary, explained. They are the only numbers
   on Home a person cannot work out for themselves, and TDEE in particular is a
   term nobody arrives already knowing. */

const METRICS = {
  eaten: {
    tint: GREEN_TINT,
    ink: GREEN_DEEP,
    label: "Eaten",
    lede: "What you have logged today, against the target your coach set.",
    body: "It only counts what you put in, so the small things matter. A chai, two biscuits and a handful of namkeen can add up to a meal on their own.",
  },
  tdee: {
    tint: MOVE_T,
    ink: MOVE_C,
    label: "TDEE",
    lede: "Everything your body burns in a day, added up.",
    body: "Most of it goes on simply keeping you alive: your heart, your breathing, staying warm. The rest is walking around, chores and anything you do on purpose. Yours is worked out from your height, weight, age and how active your days usually are.",
  },
  deficit: {
    tint: GOLD_TINT,
    ink: GOLD_DEEP,
    label: "Deficit",
    lede: "The gap between what you burned and what you ate.",
    body: "When there is a gap, your body makes up the difference from what it has stored, which is how fat comes off. A steady, moderate gap works better than a big one, because your body slows itself down to match anything too sharp.",
  },
};

export default function MetricInfoSheet() {
  const { metricInfo, setMetricInfo } = useWF();
  const m = METRICS[metricInfo];
  if (!m) return null;

  return (
    <div
      onClick={() => setMetricInfo(null)}
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
        aria-labelledby="metric-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: BG,
          borderRadius: "26px 26px 0 0",
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: BORDER, margin: "10px auto 0" }} />

        <div style={{ padding: "14px 22px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span
              style={{
                background: m.tint,
                color: m.ink,
                borderRadius: 999,
                padding: "4px 11px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              {m.label}
            </span>
            <span style={{ flex: 1 }} />
            <button
              onClick={() => setMetricInfo(null)}
              aria-label="Close"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: -4 }}
            >
              <X size={17} color={MUTED} />
            </button>
          </div>

          <h2
            id="metric-title"
            style={{
              margin: "13px 0 0",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 20,
              fontWeight: 600,
              color: TEXT,
              lineHeight: 1.3,
            }}
          >
            {m.lede}
          </h2>

          <div style={{ height: 1, background: LINE, margin: "16px 0 14px" }} />

          <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{m.body}</p>
        </div>

        <div style={{ padding: "20px 22px 26px" }}>
          <button
            onClick={() => setMetricInfo(null)}
            style={{
              width: "100%",
              background: GREEN,
              border: "none",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 2px 0 " + GREEN_DEEP,
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
