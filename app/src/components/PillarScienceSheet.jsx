import React from "react";
import { useWF } from "../state";
import { X, Check, Lock } from "lucide-react";
import { GREEN, GREEN_DEEP, GREEN_TINT, TEXT, MUTED, BG, BG_ALT, BORDER, LINE } from "../tokens";
import { PILLAR_SCIENCE } from "../screens/pillarScience";

/* Why a pillar is a pillar. Opened from the concept pill on each EM3 card, so
   the teaching screen stays one line per pillar and the person who wants the
   reasoning can have it.

   Short on purpose. This sheet is a detour from a screen someone is trying to
   get through, and a wall of text on a detour gets closed, not read. One
   claim, one sentence of context, three things it buys you. Same shape and one
   colour for all four: inside a sheet the accent is the brand, not the pillar,
   so four sheets read as four pages of the same book. */
export default function PillarScienceSheet() {
  const { pillarInfo, setPillarInfo, pillarExplain, planAssigned, dailyTargets, kcalTarget, setChatsOpen } = useWF();

  const p = pillarExplain.find((x) => x.id === pillarInfo);
  const s = PILLAR_SCIENCE[pillarInfo];
  if (!p || !s) return null;

  return (
    <div
      onClick={() => setPillarInfo(null)}
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
        aria-labelledby="science-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: BG,
          borderRadius: "26px 26px 0 0",
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          maxHeight: "88%",
          display: "flex",
          flexDirection: "column",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: BORDER, margin: "10px auto 0", flexShrink: 0 }} />

        <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px 0", minHeight: 0 }}>
          {/* Which pillar */}
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: GREEN_TINT,
                color: GREEN_DEEP,
                borderRadius: 999,
                padding: "4px 10px 4px 8px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.6,
              }}
            >
              <p.Icon size={12} strokeWidth={2.2} />
              {p.label.toUpperCase()}
            </span>
            <span style={{ flex: 1 }} />
            <button
              onClick={() => setPillarInfo(null)}
              aria-label="Close"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: -4 }}
            >
              <X size={17} color={MUTED} />
            </button>
          </div>

          {/* The claim, and one sentence behind it */}
          <h2
            id="science-title"
            style={{
              margin: "13px 0 0",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 21,
              fontWeight: 600,
              color: TEXT,
              lineHeight: 1.3,
            }}
          >
            {s.lede} <span style={{ color: GREEN }}>{s.ledeAccent}</span>
          </h2>
          <p style={{ margin: "10px 0 0", fontSize: 13, color: MUTED, lineHeight: 1.55 }}>{s.sub}</p>

          <div style={{ height: 1, background: LINE, margin: "18px 0 14px" }} />

          {/* What it buys you */}
          <Label>Why it matters</Label>
          {s.points.map((x, i) => (
            <div key={x.t} style={{ display: "flex", gap: 11, marginBottom: i < s.points.length - 1 ? 15 : 0 }}>
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  flexShrink: 0,
                  marginTop: 1,
                  background: GREEN_TINT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={12} color={GREEN} strokeWidth={3} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1.35 }}>{x.t}</div>
                <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.5, marginTop: 2 }}>{x.b}</div>
              </div>
            </div>
          ))}


          {/* Once a coach has set them, the numbers behind the score belong in
              the same place the score is explained. */}
          {pillarInfo === "eat" && planAssigned && (
            <>
              <div style={{ height: 1, background: LINE, margin: "18px 0 14px" }} />
              <Label>Your targets</Label>

              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: TEXT, lineHeight: 1 }}>
                  {kcalTarget.toLocaleString()}
                </span>
                <span style={{ fontSize: 12, color: MUTED }}>kcal a day</span>
              </div>

              <div style={{ display: "flex", gap: 7, marginBottom: 13 }}>
                {dailyTargets.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: BG_ALT,
                      border: "1px solid " + BORDER,
                      borderRadius: 11,
                      padding: "8px 4px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>
                      {t.target}
                      <span style={{ fontSize: 9, fontWeight: 600, color: MUTED }}>g</span>
                    </div>
                    <div style={{ fontSize: 9.5, color: MUTED, marginTop: 2 }}>{t.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <Lock size={13} color={GREEN} strokeWidth={2.2} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 12, color: MUTED, lineHeight: 1.55 }}>
                  Manya Jain, your nutrition coach, set these after your first consultation.{" "}
                  <button
                    onClick={() => {
                      setPillarInfo(null);
                      setChatsOpen(true);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      font: "inherit",
                      color: GREEN,
                      fontWeight: 700,
                      textDecoration: "underline",
                      textUnderlineOffset: 2,
                      cursor: "pointer",
                    }}
                  >
                    Message them
                  </button>{" "}
                  if they need to change.
                </span>
              </div>
            </>
          )}
        </div>

        <div style={{ flexShrink: 0, padding: "16px 22px 24px" }}>
          <button
            onClick={() => setPillarInfo(null)}
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

function Label({ children }) {
  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: MUTED,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}
