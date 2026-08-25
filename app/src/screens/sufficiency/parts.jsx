import React from "react";
import { ChevronLeft } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BG_ALT, BORDER } from "../../tokens";

/* Shell and visual pieces shared by the sufficiency walkthrough. */

const STEPS = ["learn", "profile", "meals", "result"];

export function FlowScreen({ step, onBack, children, footer }) {
  const idx = STEPS.indexOf(step);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "6px 22px 10px",
        }}
      >
        {onBack ? (
          <button
            onClick={onBack}
            aria-label="Back"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: BG,
              border: "1px solid " + BORDER,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={18} color={TEXT} />
          </button>
        ) : (
          <span style={{ width: 34 }} />
        )}
        <span style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
          {STEPS.map((s, i) => (
            <span
              key={s}
              style={{
                width: i === idx ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background: i <= idx ? GREEN : BORDER,
                transition: "width .2s",
              }}
            />
          ))}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>{children}</div>

      {footer && (
        <div style={{ flexShrink: 0, padding: "12px 22px 26px", borderTop: "1px solid " + BORDER }}>
          {footer}
        </div>
      )}
    </div>
  );
}

export function Cta({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        background: disabled ? BG_ALT : GREEN,
        border: "1px solid " + (disabled ? BORDER : GREEN),
        borderRadius: 14,
        padding: "14px 0",
        color: disabled ? MUTED : "#fff",
        fontSize: 14.5,
        fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        transition: "background .15s, color .15s",
      }}
    >
      {children}
    </button>
  );
}

export function Eyebrow({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.9, marginBottom: 10 }}>
      {children}
    </div>
  );
}

export function KairaMark({ size = 22 }) {
  return (
    <span
      style={{
        width: size,
        height: size * 1.09,
        flexShrink: 0,
        background: GREEN,
        clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: size * 0.5,
        fontWeight: 600,
        fontFamily: "'Playfair Display', Georgia, serif",
      }}
    >
      K
    </span>
  );
}

export function Title({ children, sub }) {
  return (
    <>
      <h1
        style={{
          margin: 0,
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 24,
          fontWeight: 600,
          color: TEXT,
          lineHeight: 1.22,
          letterSpacing: -0.2,
        }}
      >
        {children}
      </h1>
      {sub && (
        <p style={{ margin: "9px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>{sub}</p>
      )}
    </>
  );
}

/* The score, as a hexagon. Same shape as Kaira's mark, because the number is
   hers: it is a reading, not a grade. */
export function HexScore({ value, size = 132, caption = "SUFFICIENCY", blurred }) {
  return (
    <div
      style={{
        width: size,
        height: size * 1.09,
        background: GREEN,
        clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        filter: blurred ? "blur(7px)" : "none",
        transition: "filter .5s ease",
      }}
    >
      <span style={{ fontSize: size * 0.3, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
        {value}%
      </span>
      <span style={{ fontSize: size * 0.075, fontWeight: 700, color: "#fff", letterSpacing: 1.2, opacity: 0.85 }}>
        {caption}
      </span>
    </div>
  );
}

/* One nutrient, as a ring with the raw grams underneath. The grams matter:
   a percentage on its own is not something you can act on. */
export function NutrientRing({ label, pct, have, target, tone, delta }) {
  const R = 22;
  const C = 2 * Math.PI * R;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: 56, height: 56 }}>
        <svg width="56" height="56" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={R} fill="none" stroke="#F2F4F7" strokeWidth="5.5" />
          <circle
            cx="28"
            cy="28"
            r={R}
            fill="none"
            stroke={tone}
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - Math.min(pct, 100) / 100)}
            transform="rotate(-90 28 28)"
            style={{ transition: "stroke-dashoffset .8s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 13.5, fontWeight: 800, color: TEXT }}>
            {pct}
            <span style={{ fontSize: 8, color: MUTED }}>%</span>
          </span>
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: TEXT, marginTop: 6 }}>{label}</div>
      <div style={{ fontSize: 9.5, color: MUTED, marginTop: 1 }}>
        {have}/{target}g
      </div>
      {delta > 0 && (
        <div style={{ fontSize: 9.5, fontWeight: 700, color: GREEN, marginTop: 2 }}>+{delta}g</div>
      )}
    </div>
  );
}
