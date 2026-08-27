import React, { useState, useEffect } from "react";
import { useWF } from "../../state";
import Skel from "../../components/Skel";
import { ChevronLeft, ChevronDown, RefreshCw, Share2, Calendar } from "lucide-react";
import {
  GREEN, GREEN_DEEP, GREEN_TINT, GREEN_WASH, TEXT, MUTED, FAINT, BG, BG_ALT,
  BORDER, LINE, WARN,
} from "../../tokens";

/* The glucose sync, opened from the day's Measure row.

   The reading is the whole screen. It arrives rather than being asked for: the
   device already has it, so the job here is to fetch, show, and mark the task
   off without making anybody press anything. The task finishes itself the
   moment the number lands, which is the honest moment, and the row on the
   diary is struck by the time they walk back to it. */

/* A day of readings, on the hour. Real enough to read a shape off. */
const READINGS = [
  80, 88, 99, 112, 118, 116, 104, 92, 78, 70, 67, 72,
  84, 95, 92, 90, 96, 108, 118, 114, 101, 96, 94, 95,
];
const LOW = 80;
const HIGH = 104;
const NOW = 104;

/* A smooth line through the points, in a 300 by 120 box. */
function trendPath(vals) {
  const min = 60;
  const max = 125;
  const x = (i) => (i / (vals.length - 1)) * 300;
  const y = (v) => 120 - ((v - min) / (max - min)) * 120;
  return vals
    .map((v, i) => {
      if (i === 0) return "M " + x(0) + " " + y(v);
      const px = x(i - 1);
      const cx = (px + x(i)) / 2;
      return "C " + cx + " " + y(vals[i - 1]) + ", " + cx + " " + y(v) + ", " + x(i) + " " + y(v);
    })
    .join(" ");
}

export default function CgmSync() {
  const {
    setCgmOpen, taskProgress, setTaskProgress, flipcoins, setFlipcoins, setToast,
  } = useWF();
  const [tab, setTab] = useState("daily");
  const [ready, setReady] = useState(false);

  /* The fetch. When it lands the task is done, so it is marked done here
     rather than waiting for somebody to confirm what the device already
     knows. The day's own toast picks this up and says which task closed. */
  useEffect(() => {
    if (ready) return;
    const t = setTimeout(() => {
      setReady(true);
      if (!taskProgress.cgm) {
        setTaskProgress({ ...taskProgress, cgm: 1 });
        setFlipcoins(flipcoins + 10);
        setToast({ title: "+10 Flipcoins earned", line: "Sync your CGM", coins: 10 });
      }
    }, 1600);
    return () => clearTimeout(t);
  }, [ready, taskProgress, setTaskProgress, flipcoins, setFlipcoins, setToast]);

  const band = { top: 120 - ((HIGH - 60) / 65) * 120, h: ((HIGH - LOW) / 65) * 120 };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "6px 18px 12px",
        }}
      >
        <button
          onClick={() => setCgmOpen(false)}
          aria-label="Back"
          style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: TEXT }}
        >
          <ChevronLeft size={20} strokeWidth={2.2} />
          Back
        </button>

        <span style={{ flex: 1 }} />

        <button
          onClick={() => setReady(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: BG,
            border: "1px solid " + GREEN_TINT,
            borderRadius: 999,
            padding: "6px 13px 6px 10px",
            fontSize: 12.5,
            fontWeight: 700,
            color: GREEN,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <RefreshCw size={13} strokeWidth={2.4} style={{ animation: ready ? undefined : "spin 1s linear infinite" }} />
          Refresh
        </button>

        <button
          aria-label="Share"
          style={{ background: "none", border: "none", padding: 4, margin: -4, cursor: "pointer", display: "flex", color: TEXT }}
        >
          <Share2 size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Two readings of the same data: today, and the run of days behind it. */}
      <div style={{ flexShrink: 0, display: "flex", borderBottom: "1px solid " + LINE }}>
        {[
          { id: "daily", label: "Daily Metrics" },
          { id: "cumulative", label: "Cumulative Report" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              borderBottom: "2px solid " + (tab === t.id ? GREEN : "transparent"),
              padding: "9px 0 11px",
              fontSize: 12.5,
              fontWeight: 700,
              color: tab === t.id ? GREEN : MUTED,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 0" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: BG_ALT,
              border: "1px solid " + BORDER,
              borderRadius: 999,
              padding: "7px 13px",
              fontSize: 12.5,
              fontWeight: 700,
              color: TEXT,
            }}
          >
            <Calendar size={13} strokeWidth={2.2} color={MUTED} />
            April 09 (Today)
            <ChevronDown size={14} strokeWidth={2.4} color={MUTED} />
          </span>
        </div>

        {tab === "daily" ? (
          <>
            {/* The reading, held in a pebble with the light behind it. */}
            <div
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                padding: "26px 0 30px",
                overflow: "hidden",
              }}
            >
              <Dots ready={ready} />

              <span
                style={{
                  position: "relative",
                  width: 152,
                  height: 180,
                  borderRadius: "50% 50% 48% 48% / 58% 58% 42% 42%",
                  background: "linear-gradient(170deg, #FFFFFF 0%, #F4F7F5 62%, #EDF2EF 100%)",
                  boxShadow: "0 18px 40px rgba(41,157,107,0.16), inset 0 2px 6px rgba(255,255,255,0.9)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <span style={{ fontSize: 10.5, color: MUTED, lineHeight: 1.35, textAlign: "center" }}>
                  Last captured
                  <br />
                  {ready ? "03:00 PM" : "just now"}
                </span>

                {ready ? (
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 46,
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: TEXT,
                      lineHeight: 1.1,
                      animation: "popIn .5s cubic-bezier(.32,.72,0,1) both",
                    }}
                  >
                    {NOW}
                  </span>
                ) : (
                  <Skel w={92} h={44} style={{ margin: "4px 0 2px" }} />
                )}

                <span style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>mg/dl</span>
              </span>
            </div>

            <div style={{ padding: "0 22px 26px" }}>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 19,
                  fontWeight: 600,
                  color: TEXT,
                }}
              >
                Daily glucose trend
              </h2>

              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    paddingBottom: 18,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    color: FAINT,
                    flexShrink: 0,
                  }}
                >
                  {[120, 100, 80, 60].map((v) => (
                    <span key={v}>{v}</span>
                  ))}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <svg viewBox="0 0 300 120" width="100%" height="132" preserveAspectRatio="none">
                    {/* The range the coach wants the line to spend its day in. */}
                    <rect x="0" y={band.top} width="300" height={band.h} fill={GREEN_WASH} />
                    {[0, 60, 120].map((y) => (
                      <line key={y} x1="0" y1={y} x2="300" y2={y} stroke={LINE} strokeWidth="1" />
                    ))}
                    {[0, 75, 150, 225, 300].map((x) => (
                      <line key={x} x1={x} y1="0" x2={x} y2="120" stroke={LINE} strokeWidth="1" strokeDasharray="3 4" />
                    ))}
                    {ready && (
                      <>
                        <defs>
                          <linearGradient id="cgmline" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={GREEN} />
                            <stop offset="22%" stopColor={WARN} />
                            <stop offset="45%" stopColor={GREEN_DEEP} />
                            <stop offset="72%" stopColor={WARN} />
                            <stop offset="100%" stopColor={GREEN} />
                          </linearGradient>
                        </defs>
                        <path
                          d={trendPath(READINGS)}
                          fill="none"
                          stroke="url(#cgmline)"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                          style={{
                            strokeDasharray: 1200,
                            strokeDashoffset: 1200,
                            animation: "drawLine 1.1s cubic-bezier(.4,0,.2,1) forwards",
                          }}
                        />
                      </>
                    )}
                  </svg>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 8.5,
                      color: FAINT,
                      marginTop: 2,
                    }}
                  >
                    {["00:00", "06:00", "12:00", "18:00", "00:00"].map((t, i) => (
                      <span key={i}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {ready && (
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  {[
                    { l: "In range", v: "78%" },
                    { l: "Average", v: "96" },
                    { l: "Highest", v: "118" },
                  ].map((s) => (
                    <div
                      key={s.l}
                      style={{
                        flex: 1,
                        background: BG_ALT,
                        border: "1px solid " + LINE,
                        borderRadius: 14,
                        padding: "11px 8px",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{s.v}</div>
                      <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ padding: "18px 22px 26px" }}>
            <h2
              style={{
                margin: 0,
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 19,
                fontWeight: 600,
                color: TEXT,
              }}
            >
              The last 14 days
            </h2>
            <p style={{ margin: "7px 0 0", fontSize: 12, color: MUTED, lineHeight: 1.55 }}>
              Your coach reads this view. It is the same readings, added up, so a run of days
              says more than any single one.
            </p>

            <div
              style={{
                marginTop: 14,
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              {[
                { l: "Time in range", v: "74%", s: "Up from 68% last week" },
                { l: "Average glucose", v: "98 mg/dl", s: "Steady" },
                { l: "Highest reading", v: "142 mg/dl", s: "Sunday, after lunch" },
                { l: "Lowest reading", v: "64 mg/dl", s: "Tuesday, before breakfast" },
              ].map((r, i) => (
                <div
                  key={r.l}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    borderBottom: i === 3 ? "none" : "1px solid " + LINE,
                  }}
                >
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: TEXT }}>{r.l}</span>
                    <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2 }}>{r.s}</span>
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: TEXT, flexShrink: 0 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* The scatter behind the pebble. It settles once the reading is in, so the
   waiting has a little motion and the answer has none. */
function Dots({ ready }) {
  const D = [
    [8, 44, 7], [20, 30, 5], [30, 58, 9], [16, 70, 4], [4, 62, 6], [26, 80, 5],
    [92, 40, 8], [80, 28, 5], [70, 62, 6], [86, 74, 4], [96, 60, 7], [74, 82, 5],
  ];
  return (
    <span aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {D.map(([l, t, s], i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: l + "%",
            top: t + "%",
            width: s,
            height: s,
            borderRadius: "50%",
            background: i % 3 === 0 ? GREEN : i % 3 === 1 ? GREEN_TINT : GREEN_DEEP,
            opacity: ready ? 0.85 : 0.4,
            transition: "opacity .6s ease",
            animation: ready ? undefined : "glowBreathe " + (2 + (i % 4) * 0.4) + "s ease-in-out infinite",
          }}
        />
      ))}
    </span>
  );
}
