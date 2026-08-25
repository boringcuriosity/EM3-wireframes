import React from "react";
import { useWF } from "../state";
import { Info } from "lucide-react";
import { TEXT, MUTED, BG_ALT, BG, BORDER, SH } from "../tokens";
import { sectionLabel } from "../ui";
import CtaArrow from "../components/CtaArrow";

export default function ProgramProgressPage() {
  const { program } = useWF();

  return (
    (
      <div style={{ padding: "4px 22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Your weekly consistency score</span>
          <Info size={14} color={MUTED} strokeWidth={2} />
        </div>
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 14 }}>Since last week</div>

        <div
          style={{
            background: BG,
            border: "1px solid " + BORDER,
            borderRadius: 18,
            padding: "22px 16px",
            textAlign: "center",
            boxShadow: SH,
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative", width: 132, height: 132 }}>
              <svg width="132" height="132" viewBox="0 0 132 132">
                <circle
                  cx="66"
                  cy="66"
                  r="55"
                  fill="none"
                  stroke="#E4E7EC"
                  strokeWidth="12"
                  strokeDasharray="4 7"
                  strokeLinecap="round"
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: MUTED,
                }}
              >
                Needs attention
              </div>
            </div>
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: TEXT, marginTop: 10 }}>10 Aug – 16 Aug</div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 8, lineHeight: 1.5 }}>
            Based on how consistently you're following your nutrition, movement and habit routines this week.
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          {sectionLabel("Your program")}
          {[
            { l: "Coach sessions", v: "0 sessions completed", r: "Recommended: 1 session every 15 days" },
            { l: "Periodic health checks", v: "0 tests completed", r: "Recommended: a test every 90 days" },
          ].map((r) => (
            <div
              key={r.l}
              style={{
                background: BG_ALT,
                border: "1px solid " + BORDER,
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: "#E4E7EC" }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: MUTED }}>{r.l}</span>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT, marginTop: 8 }}>{r.v}</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{r.r}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          {sectionLabel("Your metabolic progress")}
          <div
            style={{
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 18,
              padding: "20px 16px",
              textAlign: "center",
              boxShadow: SH,
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 800, color: TEXT, lineHeight: 1 }}>68</div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>11 Aug 2026</div>
            <div style={{ height: 1, background: BORDER, margin: "14px 30px" }} />
            <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5 }}>
              Attend one more coach session to start receiving insights.
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          {sectionLabel("Visible changes so far")}
          <div
            style={{
              background: BG_ALT,
              border: "1px solid " + BORDER,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 12 }}>Weight</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontSize: 10.5, color: MUTED }}>Initial weight</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: MUTED, marginTop: 4 }}>No data</div>
              </div>
              <CtaArrow size={16} style={{ marginLeft: 0, color: MUTED }} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10.5, color: MUTED }}>Latest weight</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: MUTED, marginTop: 4 }}>No data</div>
              </div>
            </div>
            <div style={{ fontSize: 10.5, color: MUTED, marginTop: 14, lineHeight: 1.45 }}>
              Log your weight after your program starts to see changes.
            </div>
          </div>
        </div>
      </div>
    )
  );
}
