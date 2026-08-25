import React from "react";
import { useWF } from "../../state";
import { ChevronRight, Calendar } from "lucide-react";
import { GREEN, TEXT, MUTED, BG_ALT, BG, BORDER, SH } from "../../tokens";

export default function ProgressPage() {
  const { progressTab, setProgressTab, achieveRange, setAchieveRange, progressTabs } = useWF();

  return (
    (
      <div>
        {/* Top tab bar — underline style */}
        <div
          style={{
            display: "flex",
            padding: "4px 12px 0",
            background: BG_ALT,
            borderBottom: "1px solid " + BORDER,
          }}
        >
          {progressTabs.map((t) => {
            const active = progressTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setProgressTab(t.id)}
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: active ? 700 : 500,
                  padding: "12px 0 14px",
                  background: "none",
                  border: "none",
                  borderBottom:
                    "2.5px solid " + (active ? GREEN : "transparent"),
                  color: active ? TEXT : MUTED,
                  cursor: "pointer",
                  marginBottom: -1,
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div style={{ padding: "16px 22px 28px" }}>
          {progressTab === "achieve" ? (
            <div>
              {/* Time-range toggle */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  background: BG_ALT,
                  border: "1px solid " + BORDER,
                  borderRadius: 999,
                  padding: 4,
                  marginBottom: 16,
                }}
              >
                {[
                  { id: "week", label: "This week" },
                  { id: "month", label: "This month" },
                  { id: "custom", label: "Custom" },
                ].map((r) => {
                  const active = achieveRange === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setAchieveRange(r.id)}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        fontSize: 12,
                        fontWeight: active ? 700 : 500,
                        padding: "7px 0",
                        borderRadius: 999,
                        border: "none",
                        background: active ? BG : "transparent",
                        color: active ? TEXT : MUTED,
                        cursor: "pointer",
                        boxShadow: active ? "0 1px 4px rgba(16,24,40,0.12)" : "none",
                      }}
                    >
                      {r.id === "custom" && <Calendar size={12} color={active ? GREEN : MUTED} />}
                      {r.label}
                    </button>
                  );
                })}
              </div>

              {/* Element 1 — Kaira cumulative read */}
              <div
                style={{
                  background: "linear-gradient(135deg,#F2F4F7,#F9FAFB)",
                  border: "1px solid #E4E7EC",
                  borderRadius: 18,
                  padding: 18,
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: GREEN,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                  >
                    K
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 0.5 }}>
                    YOUR WEEK ACROSS EAT, MOVE, MIND
                  </span>
                </div>
                <div style={{ fontSize: 13.5, color: TEXT, lineHeight: 1.5 }}>
                  Your nutrition sufficiency climbed this week, and it lined up with the days you moved more. Sleep was the one thing that slipped, and that's likely why the last couple of days felt harder.
                </div>
              </div>

              {/* Element 2 — cumulative graph, 3 blended pillar lines */}
              <div
                style={{
                  background: BG,
                  border: "1px solid " + BORDER,
                  borderRadius: 18,
                  padding: 16,
                  marginBottom: 14,
                  boxShadow: SH,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Everything you're tracking, together</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2, marginBottom: 14 }}>
                  Each line shows how close you got to your goal that week. Tap a pillar to see what's inside.
                </div>

                {/* legend (tappable pillars) */}
                <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                  {[
                    { l: "Eat", c: GREEN },
                    { l: "Move", c: "#444CE7" },
                    { l: "Mind", c: "#2DA6A6" },
                  ].map((p) => (
                    <div key={p.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 20, height: 3, borderRadius: 2, background: p.c }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{p.l}</span>
                      <ChevronRight size={12} color={MUTED} />
                    </div>
                  ))}
                </div>

                {/* multi-line chart (SVG) */}
                <svg viewBox="0 0 300 150" style={{ width: "100%", height: "auto" }}>
                  {/* horizontal gridlines */}
                  {[0, 37.5, 75, 112.5, 150].map((y, i) => (
                    <line key={i} x1="0" y1={y} x2="300" y2={y} stroke="#F2F4F7" strokeWidth="1" />
                  ))}
                  {/* Eat line */}
                  <polyline
                    fill="none"
                    stroke={GREEN}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,95 60,80 120,70 180,55 240,48 300,40"
                  />
                  {/* Move line */}
                  <polyline
                    fill="none"
                    stroke="#444CE7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,70 60,72 120,60 180,66 240,58 300,62"
                  />
                  {/* Mind line */}
                  <polyline
                    fill="none"
                    stroke="#2DA6A6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,60 60,66 120,72 180,80 240,92 300,98"
                  />
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  {["W1", "W2", "W3", "W4", "W5", "Now"].map((w) => (
                    <span key={w} style={{ fontSize: 10, color: MUTED }}>{w}</span>
                  ))}
                </div>
              </div>

              {/* Element 3 — the averages (honest metrics) */}
              <div
                style={{
                  background: BG,
                  border: "1px solid " + BORDER,
                  borderRadius: 18,
                  padding: 16,
                  marginBottom: 14,
                  boxShadow: SH,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 14 }}>This week's averages</div>
                {[
                  { pillar: "Eat", c: GREEN, metrics: [{ l: "Nutrition sufficiency", v: "68%", up: true }] },
                  { pillar: "Move", c: "#444CE7", metrics: [{ l: "Steps / day", v: "6,200", up: true }, { l: "Exercises logged", v: "3", up: false }] },
                  { pillar: "Mind", c: "#2DA6A6", metrics: [{ l: "Sleep / night", v: "6h 40m", up: false }, { l: "Breathing sessions", v: "2", up: true }] },
                ].map((p) => (
                  <div key={p.pillar} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <div style={{ width: 14, height: 3, borderRadius: 2, background: p.c }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{p.pillar}</span>
                    </div>
                    {p.metrics.map((m) => (
                      <div key={m.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" }}>
                        <span style={{ fontSize: 12.5, color: MUTED }}>{m.l}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
                          {m.v}{" "}
                          <span style={{ color: m.up ? GREEN : "#98A2B3", fontSize: 11 }}>{m.up ? "↑" : "↓"}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Element 4 — how to improve (denominator-driven) */}
              <div
                style={{
                  background: BG,
                  border: "1px solid " + BORDER,
                  borderRadius: 18,
                  padding: 16,
                  boxShadow: SH,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12 }}>How to improve</div>
                {[
                  { pillar: "Eat", c: GREEN, text: "You're 515 kcal under your TDEE target most days, and protein is the gap. Add one protein anchor at lunch." },
                  { pillar: "Move", c: "#444CE7", text: "Steps averaged 6,200 against your 8,000 goal. A 15-minute walk after lunch closes most of it." },
                  { pillar: "Mind", c: "#2DA6A6", text: "You're averaging 6h 40m against your 7h 30m need. A fixed wake-up time is the easiest lever." },
                ].map((p) => (
                  <div key={p.pillar} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 3, borderRadius: 2, background: p.c, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: TEXT, marginBottom: 2 }}>{p.pillar}</div>
                      <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{p.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
          <div
            style={{
              background: BG,
              border: "1px dashed #D0D5DD",
              borderRadius: 16,
              minHeight: 320,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 24px",
              textAlign: "center",
              color: MUTED,
              fontSize: 12.5,
              lineHeight: 1.5,
            }}
          >
            {progressTabs.find((t) => t.id === progressTab)?.label} content will
            come over here.
          </div>
          )}
        </div>
      </div>
    )
  );
}
