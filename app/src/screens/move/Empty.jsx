import React from "react";
import { Clock } from "lucide-react";
import { TEXT, MUTED, BG, BG_ALT, BORDER } from "../../tokens";

/* A tab with nothing in it yet, said as a state rather than left blank. */
export default function Empty({ title, line }) {
  return (
    <div
      style={{
        background: BG,
        border: "1px dashed " + BORDER,
        borderRadius: 16,
        padding: "34px 22px",
        textAlign: "center",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          width: 46, height: 46, borderRadius: "50%", background: BG_ALT,
          border: "1px solid " + BORDER, alignItems: "center", justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Clock size={19} color={MUTED} strokeWidth={1.6} />
      </span>
      <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{title}</div>
      <div style={{ fontSize: 11.5, color: MUTED, marginTop: 7, lineHeight: 1.6 }}>{line}</div>
    </div>
  );
}
