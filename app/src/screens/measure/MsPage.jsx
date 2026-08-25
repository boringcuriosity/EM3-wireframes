import React from "react";
import { useWF } from "../../state";
import { Heart, ChevronRight, ChevronLeft, Calendar } from "lucide-react";
import { GREEN, TEXT, MUTED, BG_ALT, BG, BORDER, SH } from "../../tokens";
import CtaArrow from "../../components/CtaArrow";

export default function MsPage() {
  const { setActiveTab, msRange, setMsRange, msDetail, setMsDetail } = useWF();

  return (
    (
      <div style={{ padding: "16px 22px 28px" }}>
        {msDetail === "score" ? (
          /* ---------- Detail: MET score week by week ---------- */
          <div>
            <button
              onClick={() => setMsDetail(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                padding: 0,
                marginBottom: 16,
                color: TEXT,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <ChevronLeft size={18} /> Back
            </button>

            <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
              How your MET Score has moved
            </div>
            <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 18, lineHeight: 1.5 }}>
              Week by week, with what changed each week.
            </div>

            {/* Score trend graph */}
            <div
              style={{
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 18,
                padding: 16,
                marginBottom: 16,
                boxShadow: SH,
              }}
            >
              <svg viewBox="0 0 300 140" style={{ width: "100%", height: "auto" }}>
                {[0, 35, 70, 105, 140].map((y, i) => (
                  <line key={i} x1="0" y1={y} x2="300" y2={y} stroke="#F2F4F7" strokeWidth="1" />
                ))}
                <polyline
                  fill="none"
                  stroke={GREEN}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,105 60,98 120,100 180,80 240,72 300,58"
                />
                {[
                  [0, 105], [60, 98], [120, 100], [180, 80], [240, 72], [300, 58],
                ].map(([cx, cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r="3.5" fill={BG} stroke={GREEN} strokeWidth="2" />
                ))}
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {["W1", "W2", "W3", "W4", "W5", "Now"].map((w) => (
                  <span key={w} style={{ fontSize: 10, color: MUTED }}>{w}</span>
                ))}
              </div>
            </div>

            {/* Week-by-week change list */}
            <div
              style={{
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 18,
                padding: 16,
                boxShadow: SH,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12 }}>
                Week by week
              </div>
              {[
                { w: "This week", v: "68", d: "+4", dir: "up", note: "Eat and Move both improved." },
                { w: "Last week", v: "64", d: "+3", dir: "up", note: "Steps picked up mid-week." },
                { w: "W4", v: "61", d: "0", dir: "same", note: "No real change." },
                { w: "W3", v: "61", d: "−2", dir: "down", note: "Sleep dropped for four nights." },
                { w: "W2", v: "63", d: "+1", dir: "up", note: "First full week of logging." },
              ].map((r) => (
                <div
                  key={r.w}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: "1px solid " + BORDER,
                  }}
                >
                  <div style={{ width: 74, flexShrink: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: TEXT }}>{r.w}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>Score {r.v}</div>
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      flexShrink: 0,
                      width: 30,
                      color:
                        r.dir === "up" ? GREEN : r.dir === "down" ? "#98A2B3" : MUTED,
                    }}
                  >
                    {r.dir === "up" ? "↑" : r.dir === "down" ? "↓" : "-"} {r.d}
                  </div>
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.45 }}>{r.note}</div>
                </div>
              ))}
            </div>
          </div>
        ) : msDetail === "pillars" ? (
          /* ---------- Detail: Eat / Move / Mind ---------- */
          <div>
            <button
              onClick={() => setMsDetail(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                padding: 0,
                marginBottom: 16,
                color: TEXT,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <ChevronLeft size={18} /> Back
            </button>

            <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
              Eat, Move, Mind this week
            </div>
            <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 18, lineHeight: 1.5 }}>
              The three daily movers behind your score.
            </div>

            {/* Three separate line graphs */}
            {[
              { p: "Eat", c: GREEN, pts: "0,95 60,80 120,70 180,55 240,48 300,40", sub: "Nutrition sufficiency" },
              { p: "Move", c: "#444CE7", pts: "0,70 60,72 120,60 180,66 240,58 300,62", sub: "Steps & activity" },
              { p: "Mind", c: "#2DA6A6", pts: "0,60 60,66 120,72 180,80 240,92 300,98", sub: "Sleep & breathing" },
            ].map((g) => (
              <div
                key={g.p}
                style={{
                  background: BG,
                  border: "1px solid " + BORDER,
                  borderRadius: 18,
                  padding: 16,
                  marginBottom: 14,
                  boxShadow: SH,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <div style={{ width: 16, height: 3, borderRadius: 2, background: g.c }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{g.p}</span>
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>{g.sub}</div>
                <svg viewBox="0 0 300 110" style={{ width: "100%", height: "auto" }}>
                  {[0, 36, 72, 108].map((y, i) => (
                    <line key={i} x1="0" y1={y} x2="300" y2={y} stroke="#F2F4F7" strokeWidth="1" />
                  ))}
                  <polyline
                    fill="none"
                    stroke={g.c}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={g.pts}
                  />
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <span key={i} style={{ fontSize: 10, color: MUTED }}>{d}</span>
                  ))}
                </div>
              </div>
            ))}

            {/* This week's averages */}
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
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 14 }}>
                This week's averages
              </div>
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

            {/* How to improve */}
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
          /* ---------- MS main ---------- */
          <>
            {/* 0 — Goal anchor */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
                Losing weight
              </div>
              <div style={{ width: 3, height: 3, borderRadius: "50%", background: MUTED }} />
              <div style={{ fontSize: 12.5, color: MUTED }}>Week 3 of 26</div>
            </div>

            {/* 1 — Snapshot: where the score stands now */}
            <div
              style={{
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 18,
                padding: "20px 16px 16px",
                marginBottom: 16,
                boxShadow: SH,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 0.6, textAlign: "center", marginBottom: 12 }}>
                YOUR MET SCORE TODAY
              </div>

              {/* Score ring */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                <div style={{ position: "relative", width: 148, height: 148 }}>
                  <svg width="148" height="148" viewBox="0 0 148 148">
                    <circle cx="74" cy="74" r="62" fill="none" stroke="#F2F4F7" strokeWidth="12" />
                    <circle
                      cx="74" cy="74" r="62" fill="none"
                      stroke={GREEN} strokeWidth="12" strokeLinecap="round"
                      strokeDasharray="390" strokeDashoffset="125"
                      transform="rotate(-90 74 74)"
                    />
                  </svg>
                  <div
                    style={{
                      position: "absolute", inset: 0,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <div style={{ fontSize: 40, fontWeight: 800, color: TEXT, lineHeight: 1 }}>68</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>out of 100 · Good</div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: GREEN, marginTop: 4 }}>↑ 4 this week</div>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 11, color: MUTED, textAlign: "center", marginBottom: 14 }}>
                Built from 3 of 4 inputs
              </div>

              {/* 4 components */}
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { l: "Eat", v: "72", c: GREEN, locked: false },
                  { l: "Move", v: "64", c: "#444CE7", locked: false },
                  { l: "Mind", v: "58", c: "#2DA6A6", locked: false },
                  { l: "Body", v: null, c: MUTED, locked: true },
                ].map((c) => (
                  <div
                    key={c.l}
                    style={{
                      flex: 1,
                      background: BG_ALT,
                      border: "1px solid " + BORDER,
                      borderRadius: 12,
                      padding: "10px 4px",
                      textAlign: "center",
                    }}
                  >
                    {c.locked ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.8" style={{ margin: "3px auto 5px", display: "block" }}>
                        <rect x="4" y="10" width="16" height="11" rx="2.5" />
                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                      </svg>
                    ) : (
                      <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, marginBottom: 2 }}>{c.v}</div>
                    )}
                    <div style={{ fontSize: 10, fontWeight: 600, color: MUTED }}>{c.l}</div>
                    <div style={{ height: 3, borderRadius: 2, background: c.locked ? "#E4E7EC" : c.c, marginTop: 6 }} />
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.5, marginTop: 10 }}>
                Eat, Move and Mind move your score daily. Body unlocks with a scan, a smart scale, a CGM or a lab test.
              </div>
            </div>

            {/* 2 — What moves it today (the only action on this screen) */}
            <div
              style={{
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 18,
                padding: 16,
                marginBottom: 16,
                boxShadow: SH,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 0.6, marginBottom: 8 }}>
                WHAT MOVES IT TODAY
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, lineHeight: 1.35, marginBottom: 6 }}>
                Your biggest lever right now is sleep.
              </div>
              <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.5, marginBottom: 14 }}>
                Mind is your lowest component at 58. It's the one part of your score
                that's been sliding all week.
              </div>
              <button
                onClick={() => setActiveTab("track")}
                style={{
                  width: "100%",
                  background: GREEN,
                  border: "none",
                  borderRadius: 12,
                  padding: "11px 0",
                  color: "#fff",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Go to today's tasks<CtaArrow />
              </button>
            </div>

            {/* 3 — Time range */}
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
                const active = msRange === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setMsRange(r.id)}
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

            {/* 3 — MET score movement */}
            <div
              onClick={() => setMsDetail("score")}
              style={{
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 18,
                padding: 16,
                marginBottom: 14,
                cursor: "pointer",
                boxShadow: SH,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Your score this week</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Moved from 64 to 68</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: GREEN }}>↑ 4</span>
                  <ChevronRight size={18} color={MUTED} />
                </div>
              </div>

              <svg viewBox="0 0 300 90" style={{ width: "100%", height: "auto" }}>
                {[0, 30, 60, 90].map((y, i) => (
                  <line key={i} x1="0" y1={y} x2="300" y2={y} stroke="#F2F4F7" strokeWidth="1" />
                ))}
                <polyline
                  fill="none" stroke={GREEN} strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  points="0,66 50,62 100,64 150,50 200,46 250,40 300,34"
                />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, marginBottom: 12 }}>
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} style={{ fontSize: 10, color: MUTED }}>{d}</span>
                ))}
              </div>

              {/* Kaira commentary */}
              <div
                style={{
                  background: "linear-gradient(135deg,#F2F4F7,#F9FAFB)",
                  border: "1px solid #E4E7EC",
                  borderRadius: 14,
                  padding: 12,
                  display: "flex",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 22, height: 22, flexShrink: 0, borderRadius: "50%",
                    background: GREEN, display: "flex", alignItems: "center",
                    justifyContent: "center", color: "#fff", fontSize: 11,
                    fontWeight: 600, fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  K
                </div>
                <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5 }}>
                  Four points up, your best week yet. Most of it came from eating more consistently, not from any one big day.
                </div>
              </div>
            </div>

            {/* 4 — Eat / Move / Mind movement */}
            <div
              onClick={() => setMsDetail("pillars")}
              style={{
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 18,
                padding: 16,
                cursor: "pointer",
                boxShadow: SH,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>What moved it</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>These are what you do: Eat, Move and Mind this week</div>
                </div>
                <ChevronRight size={18} color={MUTED} />
              </div>

              {/* legend */}
              <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
                {[
                  { l: "Eat", c: GREEN, d: "↑" },
                  { l: "Move", c: "#444CE7", d: "↑" },
                  { l: "Mind", c: "#2DA6A6", d: "↓" },
                ].map((p) => (
                  <div key={p.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 18, height: 3, borderRadius: 2, background: p.c }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{p.l}</span>
                    <span style={{ fontSize: 11, color: p.d === "↑" ? GREEN : "#98A2B3" }}>{p.d}</span>
                  </div>
                ))}
              </div>

              <svg viewBox="0 0 300 130" style={{ width: "100%", height: "auto" }}>
                {[0, 32.5, 65, 97.5, 130].map((y, i) => (
                  <line key={i} x1="0" y1={y} x2="300" y2={y} stroke="#F2F4F7" strokeWidth="1" />
                ))}
                <polyline fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  points="0,85 50,72 100,64 150,50 200,44 250,38 300,32" />
                <polyline fill="none" stroke="#444CE7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  points="0,66 50,68 100,56 150,62 200,54 250,50 300,58" />
                <polyline fill="none" stroke="#2DA6A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  points="0,54 50,60 100,66 150,74 200,86 250,90 300,96" />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, marginBottom: 12 }}>
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} style={{ fontSize: 10, color: MUTED }}>{d}</span>
                ))}
              </div>

              {/* Kaira commentary */}
              <div
                style={{
                  background: "linear-gradient(135deg,#F2F4F7,#F9FAFB)",
                  border: "1px solid #E4E7EC",
                  borderRadius: 14,
                  padding: 12,
                  display: "flex",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 22, height: 22, flexShrink: 0, borderRadius: "50%",
                    background: GREEN, display: "flex", alignItems: "center",
                    justifyContent: "center", color: "#fff", fontSize: 11,
                    fontWeight: 600, fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  K
                </div>
                <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5 }}>
                  Eat climbed steadily and Move followed it. Mind slipped all week. Sleep is the one holding your score back.
                </div>
              </div>
            </div>

            {/* 6 — Your body's side of the story (pre-framed, not a padlock) */}
            <div
              style={{
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 18,
                padding: 16,
                marginTop: 14,
                marginBottom: 14,
                boxShadow: SH,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 6 }}>
                Your body's side of the story
              </div>
              <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.55, marginBottom: 10 }}>
                Right now your score reflects your habits. A scan, a smart scale, a
                CGM or a lab test adds what your body is actually doing, and the two
                don't always agree. That gap is the useful part.
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  fontStyle: "italic",
                  color: TEXT,
                  lineHeight: 1.5,
                  background: BG_ALT,
                  border: "1px solid " + BORDER,
                  borderRadius: 12,
                  padding: "10px 12px",
                  marginBottom: 14,
                }}
              >
                Adding Body data may move your score up or down. Either way, it
                becomes a measurement instead of an estimate.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {["Take a scan", "Book a lab test"].map((c, i) => (
                  <button
                    key={c}
                    style={{
                      flex: 1,
                      background: i === 0 ? GREEN : BG,
                      border: i === 0 ? "none" : "1px solid " + GREEN,
                      borderRadius: 12,
                      padding: "11px 0",
                      color: i === 0 ? "#fff" : GREEN,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {c}<CtaArrow />
                  </button>
                ))}
              </div>
            </div>

            {/* 7 — Explore your measurements (reference catalogue) */}
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
              Explore your measurements
            </div>
            <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginBottom: 12 }}>
              Everything GoodFlip can measure. Not all of it feeds your score.
            </div>
            {[
              { l: "CGM Analytics", d: "Glucose spikes, dips and time in range", s: "Connect a CGM" },
              { l: "Cardiovascular Health", d: "Heart rate, blood pressure, circulation", s: "7 of 10 measured" },
              { l: "Body Composition", d: "Fat, muscle, water and metabolic age", s: "Connect a smart scale" },
              { l: "Advanced Health Metrics", d: "HRV and deeper physiological markers", s: "3 of 3 measured" },
              { l: "Well-being and Stress", d: "Stress, sleep quality and breathing", s: "1 of 3 measured" },
              { l: "Lab Report Results", d: "Upload a report and we'll read it for you", s: "Upload a report" },
            ].map((c) => (
              <div
                key={c.l}
                style={{
                  background: BG,
                  border: "1px solid " + BORDER,
                  borderRadius: 14,
                  padding: "13px 14px",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 2 }}>{c.l}</div>
                  <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.4 }}>{c.d}</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 5, fontWeight: 600 }}>{c.s}</div>
                </div>
                <ChevronRight size={18} color={MUTED} />
              </div>
            ))}
          </>
        )}
      </div>
    )
  );
}
