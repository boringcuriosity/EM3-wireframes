import React from "react";
import { useWF } from "../state";
import { ChevronRight, Check } from "lucide-react";
import { GREEN, TEXT, MUTED, BG_ALT, BG, BORDER, SH } from "../tokens";

export default function FirstWeekSetup() {
  const { setupTasks, setupDoneCount } = useWF();

  return (
    (
      <div style={{ padding: "4px 22px 18px" }}>
        <div
          style={{
            background: BG,
            border: "1px solid " + BORDER,
            borderRadius: 22,
            padding: "16px",
            boxShadow: SH,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Header row — Kaira on the left, figure on the right */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span
                  style={{
                    width: 20,
                    height: 20,
                    flexShrink: 0,
                    background: GREEN,
                    clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  K
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>
                  Your journey starts here
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: MUTED, marginTop: 5, lineHeight: 1.4 }}>
                {setupDoneCount === 0
                  ? "Start with three small logs."
                  : setupDoneCount < setupTasks.length
                  ? setupDoneCount + " of " + setupTasks.length + " done."
                  : "All three done."}
              </div>
            </div>

            {/* Figure, sitting in a soft disc */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: BG_ALT,
                border: "1px solid " + BORDER,
                flexShrink: 0,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <svg width="46" height="56" viewBox="0 0 86 96" fill="none">
                <circle cx="43" cy="17" r="11" fill="#D0D5DD" />
                <path
                  d="M43 30c-9 0-15 5-16 13l-2 16c-.4 3.2 1.6 5.4 4.4 5.4 2.4 0 4.2-1.6 4.6-4l1.4-9v14l-3 22c-.5 3.4 1.6 5.8 4.8 5.8 2.8 0 4.6-1.8 5-4.6l2.8-19 2.8 19c.4 2.8 2.2 4.6 5 4.6 3.2 0 5.3-2.4 4.8-5.8l-3-22V51l1.4 9c.4 2.4 2.2 4 4.6 4 2.8 0 4.8-2.2 4.4-5.4l-2-16c-1-8-7-13-16-13z"
                  fill="#D0D5DD"
                />
              </svg>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            {setupTasks.map((t, i) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  background: BG_ALT,
                  border: "1px solid " + BORDER,
                  borderRadius: 13,
                  padding: "10px 12px",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    flexShrink: 0,
                    border: "1.5px solid " + (t.done ? GREEN : "#D0D5DD"),
                    background: t.done ? GREEN : BG,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: t.done ? "#fff" : MUTED,
                  }}
                >
                  {t.done ? <Check size={12} color="#fff" strokeWidth={3} /> : i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: TEXT }}>{t.label}</div>
                  <div style={{ fontSize: 10.5, color: MUTED, marginTop: 1 }}>{t.sub}</div>
                </div>
                <ChevronRight size={16} color={MUTED} />
              </div>
            ))}
          </div>

          {/* Connector into the score card sitting directly below */}
          <div
            style={{
              width: 1,
              height: 14,
              background: BORDER,
              margin: "14px auto 0",
            }}
          />
        </div>
      </div>
    )
  );
}
