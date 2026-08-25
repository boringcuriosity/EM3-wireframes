import React from "react";
import { useWF } from "../../state";
import { Heart, ChevronRight, ChevronLeft, Calendar } from "lucide-react";
import { GREEN, TEXT, MUTED, BG_ALT, BG, BORDER, SH } from "../../tokens";
import CtaArrow from "../../components/CtaArrow";

export default function A1Page() {
  const { msRange, setMsRange, a1Detail, setA1Detail } = useWF();

  return (
    (
      <div style={{ padding: "16px 22px 28px" }}>
        {a1Detail === "movers" ? (
          /* ---------- Detail: daily movers ---------- */
          <div>
            <button
              onClick={() => setA1Detail(null)}
              style={{
                display: "flex", alignItems: "center", gap: 6, background: "none",
                border: "none", padding: 0, marginBottom: 16, color: TEXT,
                fontSize: 13.5, fontWeight: 600, cursor: "pointer",
              }}
            >
              <ChevronLeft size={18} /> Back
            </button>

            <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
              Your daily movers
            </div>
            <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 18, lineHeight: 1.5 }}>
              Eat, Move and Mind this week, and what Kaira makes of each.
            </div>

            {[
              {
                p: "Eat", c: GREEN, pts: "0,95 50,80 100,70 150,62 200,55 250,48 300,40",
                stat: "72% avg sufficiency", delta: "↑ 11%",
                read: "Your most consistent week yet. Protein was short on six of seven days. Your best days all had a protein anchor at lunch. Start there rather than changing dinner.",
              },
              {
                p: "Move", c: "#444CE7", pts: "0,70 50,72 100,60 150,66 200,58 250,50 300,62",
                stat: "6,200 steps / day", delta: "↑ 700",
                read: "You moved more on the days you ate better. Those two travel together for you. Three workouts logged, all before 9am, which seems to be when it actually happens.",
              },
              {
                p: "Mind", c: "#2DA6A6", pts: "0,60 50,60 100,60 150,60 200,60 250,60 300,60",
                stat: "1 night logged", delta: "-",
                read: "This line is mostly blank because sleep went unlogged. Log even three nights and I can tell you whether short sleep is what's driving your protein-poor days.",
              },
            ].map((g) => (
              <div
                key={g.p}
                style={{
                  background: BG, border: "1px solid " + BORDER, borderRadius: 18,
                  padding: 16, marginBottom: 14,
                  boxShadow: SH,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 16, height: 3, borderRadius: 2, background: g.c }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: TEXT, flex: 1 }}>{g.p}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>{g.stat}</span>
                  <span style={{ fontSize: 11.5, color: g.delta === "-" ? MUTED : GREEN }}>{g.delta}</span>
                </div>
                <svg viewBox="0 0 300 100" style={{ width: "100%", height: "auto" }}>
                  {[0, 33, 66, 99].map((y, i) => (
                    <line key={i} x1="0" y1={y} x2="300" y2={y} stroke="#F2F4F7" strokeWidth="1" />
                  ))}
                  <polyline
                    fill="none" stroke={g.c} strokeWidth="2.5"
                    strokeDasharray={g.p === "Mind" ? "5 5" : "0"}
                    strokeLinecap="round" strokeLinejoin="round" points={g.pts}
                  />
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", margin: "6px 0 12px" }}>
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <span key={i} style={{ fontSize: 10, color: MUTED }}>{d}</span>
                  ))}
                </div>
                <div
                  style={{
                    background: "linear-gradient(135deg,#F2F4F7,#F9FAFB)",
                    border: "1px solid #E4E7EC", borderRadius: 14, padding: 12,
                    display: "flex", gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 22, height: 22, flexShrink: 0, borderRadius: "50%",
                      background: GREEN, display: "flex", alignItems: "center",
                      justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700,
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                  >K</div>
                  <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5 }}>{g.read}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ---------- A1 main ---------- */
          <>
            {/* 1 — Range chips */}
            <div
              style={{
                display: "flex", gap: 6, background: BG_ALT,
                border: "1px solid " + BORDER, borderRadius: 999,
                padding: 4, marginBottom: 16,
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
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                      gap: 4, fontSize: 12, fontWeight: active ? 700 : 500, padding: "7px 0",
                      borderRadius: 999, border: "none",
                      background: active ? BG : "transparent",
                      color: active ? TEXT : MUTED, cursor: "pointer",
                      boxShadow: active ? "0 1px 4px rgba(16,24,40,0.12)" : "none",
                    }}
                  >
                    {r.id === "custom" && <Calendar size={12} color={active ? GREEN : MUTED} />}
                    {r.label}
                  </button>
                );
              })}
            </div>

            {/* 2 — Kaira's summary of the week */}
            <div
              style={{
                background: "linear-gradient(135deg,#F2F4F7,#F9FAFB)",
                border: "1px solid #E4E7EC", borderRadius: 18,
                padding: 16, marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div
                  style={{
                    width: 26, height: 26, borderRadius: "50%", background: GREEN,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 12, fontWeight: 700,
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >K</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Your week, read by Kaira</div>
              </div>

              <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.6, marginBottom: 14 }}>
                You logged 19 meals, your most consistent week yet. Sufficiency
                held above 70% on five days. But protein came up short six days
                running, and that's the thread running through everything else: your
                two lowest-energy days both followed your two lowest-protein days.
              </div>

              {/* Correlation chips */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {["Why protein matters for you", "Food vs. energy", "What changed from last week"].map((c) => (
                  <button
                    key={c}
                    style={{
                      fontSize: 11.5, fontWeight: 600, padding: "7px 12px",
                      borderRadius: 999, border: "1px solid " + GREEN,
                      background: BG, color: GREEN, cursor: "pointer",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Capability gap inside the summary */}
              <div
                style={{
                  background: BG, border: "1px solid " + BORDER,
                  borderRadius: 14, padding: 12,
                }}
              >
                <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5, marginBottom: 10 }}>
                  Six weeks of the same protein gap is a pattern worth a human eye.
                </div>
                <button
                  style={{
                    width: "100%", background: GREEN, border: "none", borderRadius: 10,
                    padding: "10px 0", color: "#fff", fontSize: 12.5, fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Book a free consultation<CtaArrow />
                </button>
              </div>
            </div>

            {/* 3 — Daily movers, combined graph */}
            <div
              onClick={() => setA1Detail("movers")}
              style={{
                background: BG, border: "1px solid " + BORDER, borderRadius: 18,
                padding: 16, marginBottom: 20, cursor: "pointer",
                boxShadow: SH,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Your daily movers</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Eat, Move and Mind this week</div>
                </div>
                <ChevronRight size={18} color={MUTED} />
              </div>

              <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
                {[
                  { l: "Eat", c: GREEN, d: "↑" },
                  { l: "Move", c: "#444CE7", d: "↑" },
                  { l: "Mind", c: "#2DA6A6", d: "-" },
                ].map((p) => (
                  <div key={p.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 18, height: 3, borderRadius: 2, background: p.c }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{p.l}</span>
                    <span style={{ fontSize: 11, color: p.d === "↑" ? GREEN : MUTED }}>{p.d}</span>
                  </div>
                ))}
              </div>

              <svg viewBox="0 0 300 130" style={{ width: "100%", height: "auto" }}>
                {[0, 32.5, 65, 97.5, 130].map((y, i) => (
                  <line key={i} x1="0" y1={y} x2="300" y2={y} stroke="#F2F4F7" strokeWidth="1" />
                ))}
                <polyline fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  points="0,95 50,80 100,70 150,62 200,55 250,48 300,40" />
                <polyline fill="none" stroke="#444CE7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  points="0,70 50,72 100,60 150,66 200,58 250,50 300,62" />
                <polyline fill="none" stroke="#2DA6A6" strokeWidth="2.5" strokeDasharray="5 5"
                  strokeLinecap="round" strokeLinejoin="round"
                  points="0,84 50,84 100,84 150,84 200,84 250,84 300,84" />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "6px 0 12px" }}>
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} style={{ fontSize: 10, color: MUTED }}>{d}</span>
                ))}
              </div>

              <div
                style={{
                  background: "linear-gradient(135deg,#F2F4F7,#F9FAFB)",
                  border: "1px solid #E4E7EC", borderRadius: 14, padding: 12,
                  display: "flex", gap: 10,
                }}
              >
                <div
                  style={{
                    width: 22, height: 22, flexShrink: 0, borderRadius: "50%", background: GREEN,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 11, fontWeight: 700,
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >K</div>
                <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5 }}>
                  Eat and Move climbed together. They usually do for you. Mind is the
                  dotted line: you logged sleep once, so there's little to read. Log
                  even three nights and I can tell you whether short sleep is driving
                  your protein-poor days.
                </div>
              </div>
            </div>

            {/* 4 — Nudge cards: make Kaira's insights richer */}
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
              Make your insights richer
            </div>
            <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginBottom: 12 }}>
              Each of these gives Kaira something new to work with.
            </div>

            {[
              {
                icon: "hex",
                h: "Get your metabolic scorecard",
                s: "A full read of where your metabolism stands today, built from your habits and anything you've measured. Kaira uses it as the baseline for everything else.",
                cta: "Get your scorecard",
              },
              {
                icon: "vial",
                h: "Add your lab report",
                s: "Your logs show what you eat. A lab report shows what your body is doing with it, and lets Kaira connect the two.",
                cta: "Upload a report",
              },
              {
                icon: "cgm",
                h: "See your sugar spikes",
                s: "Most of what you logged this week digests fast. A CGM shows what that actually does to you, so swaps become obvious instead of theoretical.",
                cta: "Explore CGM",
              },
              {
                icon: "scale",
                h: "Know what you're losing",
                s: "Weight alone can't tell you whether you're losing fat or muscle. A smart scale can.",
                cta: "Explore smart scale",
              },
              {
                icon: "ring",
                h: "Let sleep track itself",
                s: "Sleep is the hardest thing to log and the easiest to measure. The ring fills your Mind line without you doing anything.",
                cta: "Explore ring",
              },
            ].map((c) => (
              <div
                key={c.h}
                style={{
                  background: BG, border: "1px solid " + BORDER, borderRadius: 18,
                  padding: 16, marginBottom: 12,
                  boxShadow: SH,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 44, height: 44, flexShrink: 0, borderRadius: 12,
                      background: BG_ALT, border: "1px solid " + BORDER,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {c.icon === "hex" ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.8">
                        <path d="M12 2l8 4.6v9.2L12 22l-8-4.6V6.6L12 2z" />
                      </svg>
                    ) : c.icon === "vial" ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.8">
                        <path d="M9 2h6M10 2v13a2 2 0 0 0 4 0V2" />
                      </svg>
                    ) : c.icon === "ring" ? (
                      <div style={{ width: 22, height: 22, borderRadius: "50%", border: "4px solid #D0D5DD" }} />
                    ) : c.icon === "scale" ? (
                      <div style={{ width: 22, height: 22, borderRadius: 5, border: "2px solid #D0D5DD" }} />
                    ) : (
                      <div style={{ width: 22, height: 18, borderRadius: 9, border: "2px solid #D0D5DD" }} />
                    )}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>{c.h}</div>
                </div>
                <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.55, marginBottom: 14 }}>{c.s}</div>
                <button
                  style={{
                    width: "100%", background: GREEN, border: "none", borderRadius: 12,
                    padding: "11px 0", color: "#fff", fontSize: 13, fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {c.cta}<CtaArrow />
                </button>
              </div>
            ))}

            {/* 5 — Vitals library, deliberately lighter */}
            <div
              style={{
                background: BG, border: "1px solid " + BORDER, borderRadius: 14,
                padding: "14px 16px", marginTop: 8,
                boxShadow: SH,
                display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
              }}
            >
              <Heart size={18} color={MUTED} strokeWidth={1.8} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>See your body vitals</div>
                <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>
                  Every measurement we hold for you, in one place.
                </div>
              </div>
              <ChevronRight size={18} color={MUTED} />
            </div>
          </>
        )}
      </div>
    )
  );
}
