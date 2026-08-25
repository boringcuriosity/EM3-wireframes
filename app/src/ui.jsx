import React from "react";
import { useWF } from "./state";
import { GREEN, TEXT, MUTED, BG_ALT, BG, BORDER, GOLD, SH, RULE } from "./tokens";
import CtaArrow from "./components/CtaArrow";

// Shared wireframe atoms. The pure ones stay plain functions so every call
// site reads exactly as it did in the original single-file wireframe.

export const ringStyle = (color, pct) => ({
  width: 88,
  height: 88,
  borderRadius: "50%",
  background: `conic-gradient(${color} ${pct}%, #E4E7EC 0)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const sufficiencyRing = (r) => {
  const R = 22, C = 2 * Math.PI * R;
  return (
    <div key={r.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: 54, height: 54 }}>
        <svg width="54" height="54" viewBox="0 0 54 54">
          <circle cx="27" cy="27" r={R} fill="none" stroke="#F2F4F7" strokeWidth="5" />
          <circle
            cx="27" cy="27" r={R} fill="none" stroke={r.color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - r.pct / 100)}
            transform="rotate(-90 27 27)"
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>{r.pct}<span style={{ fontSize: 8, color: MUTED }}>%</span></span>
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: TEXT, marginTop: 6 }}>{r.label}</div>
      <div style={{ fontSize: 9.5, color: MUTED, marginTop: 1 }}>{r.val}</div>
    </div>
  );
};

export const sectionLabel = (text) => (
  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 10 }}>{text}</div>
);

export const coachAvatar = (size) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "#E4E7EC",
      border: "1px solid " + BORDER,
      flexShrink: 0,
    }}
  />
);

/* A stated placeholder, not a drawing. Whatever ships here is a photograph of
   a real person, so a grey box that says so is more honest than a vector body
   that looks finished. */
export const illustration = (w, h = w) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 14,
      background: BG_ALT,
      border: "1px dashed " + RULE,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: 6,
      boxSizing: "border-box",
      flexShrink: 0,
      fontSize: 8,
      fontWeight: 600,
      lineHeight: 1.35,
      letterSpacing: 0.2,
      color: MUTED,
    }}
  >
    Brand
    <br />
    ambassador
    <br />
    here
  </div>
);

/* The card every first-run explainer sits in. One place, so the FTUX cards on
   Home and in To-do cannot drift apart. */
export const ftuxShell = (children) => (
  <div style={{ padding: "4px 22px 18px" }}>
    <div
      style={{
        background: BG,
        border: "1px solid " + BORDER,
        borderRadius: 20,
        padding: 16,
        boxShadow: SH,
      }}
    >
      {children}
    </div>
  </div>
);

export const flame = (size, on) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2c1 3.5-1.5 4.5-1.5 7 0 1.4 1 2.5 1.5 3 .5-.6 1-1.2 1-2 1.2 1 2 2.5 2 4.2A5 5 0 0 1 7 14.4C7 10 11 8 12 2z"
      fill={on ? GOLD : "#D0D5DD"}
    />
  </svg>
);

export function StartCta() {
  const { setOnboardingStep, setOnboardingOpen, setTour } = useWF();
  return (
    <button
      onClick={() => {
        setTour(null);
        setOnboardingStep(0);
        setOnboardingOpen(true);
      }}
      style={{
        width: "100%",
        marginTop: 16,
        background: GREEN,
        border: "none",
        borderRadius: 12,
        padding: "13px 0",
        color: "#fff",
        fontSize: 14.5,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Let's start<CtaArrow />
    </button>
  );
}
