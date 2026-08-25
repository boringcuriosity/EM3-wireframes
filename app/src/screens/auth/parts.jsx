import React from "react";
import { ChevronLeft } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BG_ALT, BORDER, INDIGO, INDIGO_RING } from "../../tokens";

/* Bits the three signup form screens share. Kept in one file so a change to
   the CTA or the field chrome is a single edit. */

// Faint botanical mark in the top right, the one flourish in an otherwise
// flat wireframe. Outline only so it stays quiet.
export function Sprig() {
  return (
    <svg
      width="132"
      height="120"
      viewBox="0 0 132 120"
      fill="none"
      style={{ position: "absolute", right: -12, top: -14, opacity: 0.5, pointerEvents: "none" }}
    >
      <path d="M118 6C96 22 74 44 58 72" stroke={BORDER} strokeWidth="1.6" strokeLinecap="round" />
      {[
        [104, 14, -32],
        [92, 30, -32],
        [80, 46, -32],
        [68, 62, -32],
        [110, 30, 34],
        [98, 46, 34],
        [86, 62, 34],
      ].map(([x, y, r], i) => (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx="15"
          ry="8"
          transform={`rotate(${r} ${x} ${y})`}
          stroke={BORDER}
          strokeWidth="1.4"
          fill={BG_ALT}
        />
      ))}
    </svg>
  );
}

export function AuthHeader({ onBack, step, total = 3 }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 22px 0",
        position: "relative",
        zIndex: 1,
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
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            style={{
              width: i === step ? 18 : 6,
              height: 6,
              borderRadius: 3,
              background: i <= step ? GREEN : BORDER,
              transition: "width .2s",
            }}
          />
        ))}
      </span>
    </div>
  );
}

export function Title({ children, sub }) {
  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <h1
        style={{
          margin: 0,
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 27,
          fontWeight: 600,
          color: TEXT,
          lineHeight: 1.18,
          letterSpacing: -0.2,
        }}
      >
        {children}
      </h1>
      {sub && (
        <p style={{ margin: "8px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.5 }}>{sub}</p>
      )}
    </div>
  );
}

export function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: TEXT, letterSpacing: 0.3, marginBottom: 7 }}>
      {children}
    </div>
  );
}

export function inputStyle(focused) {
  return {
    width: "100%",
    border: "1px solid " + (focused ? INDIGO : BORDER),
    borderRadius: 12,
    background: BG,
    padding: "13px 14px",
    fontSize: 15,
    fontFamily: "inherit",
    color: TEXT,
    outline: "none",
    boxShadow: focused ? "0 0 0 3px " + INDIGO_RING : "none",
    transition: "border-color .15s, box-shadow .15s",
  };
}

export function PrimaryCta({ children, onClick, disabled }) {
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

// Every form screen is: header, scrollable body, pinned footer.
export function AuthScreen({ header, children, footer }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
      {header}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>{children}</div>
      {footer && (
        <div style={{ flexShrink: 0, padding: "12px 22px 26px", borderTop: "1px solid " + BORDER }}>
          {footer}
        </div>
      )}
    </div>
  );
}
