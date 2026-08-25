import React from "react";
import { useWF } from "../../state";
import { ChevronRight, ChevronLeft, TrendingUp, Info, Calendar } from "lucide-react";
import { GREEN, TEXT, MUTED, BG_ALT, BG, BORDER, SH } from "../../tokens";
import CtaArrow from "../../components/CtaArrow";

export default function Msa2Page() {
  const { msRange, setMsRange, msa2Detail, setMsa2Detail } = useWF();

  return (
    (
      <div style={{ padding: "16px 22px 28px" }}>
        {msa2Detail === "score" ? (
          /* ---------- Detail: MET score (empty for now) ---------- */
          <div>
            <button
              onClick={() => setMsa2Detail(null)}
              style={{
                display: "flex", alignItems: "center", gap: 6, background: "none",
                border: "none", padding: 0, marginBottom: 16, color: TEXT,
                fontSize: 13.5, fontWeight: 600, cursor: "pointer",
              }}
            >
              <ChevronLeft size={18} /> Back
            </button>
            <div
              style={{
                background: BG,
                border: "1px dashed #D0D5DD",
                borderRadius: 18,
                padding: "60px 20px",
                textAlign: "center",
                color: MUTED,
                fontSize: 12.5,
                lineHeight: 1.5,
              }}
            >
              MET Score detail page, to be defined.
            </div>
          </div>
        ) : (
        <>
        {/* 1 — Range tabs */}
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
            { id: "week", label: "Weekly" },
            { id: "month", label: "Monthly" },
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

        {/* 2 — Your MET Score this week */}
        <div
          onClick={() => setMsa2Detail("score")}
          style={{
            background: BG,
            border: "1px solid " + BORDER,
            borderRadius: 18,
            padding: "14px 16px",
            cursor: "pointer",
            boxShadow: SH,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: MUTED,
                letterSpacing: 0.6,
              }}
            >
              YOUR MET SCORE THIS WEEK
            </span>
            <Info size={13} color={MUTED} strokeWidth={2} />
            <div style={{ flex: 1 }} />
            <ChevronRight size={18} color={MUTED} />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginBottom: 12,
            }}
          >
            <TrendingUp size={15} color={GREEN} strokeWidth={2.4} />
            <span style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>+4</span>
            <span style={{ fontSize: 11, color: MUTED }}>vs last week</span>
          </div>

          {/* Score ring */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <div style={{ position: "relative", width: 108, height: 108 }}>
              <svg width="108" height="108" viewBox="0 0 108 108">
                <circle cx="54" cy="54" r="45" fill="none" stroke="#F2F4F7" strokeWidth="10" />
                <circle
                  cx="54"
                  cy="54"
                  r="45"
                  fill="none"
                  stroke={GREEN}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset="91"
                  transform="rotate(-90 54 54)"
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ fontSize: 28, fontWeight: 800, color: TEXT, lineHeight: 1 }}>68</div>
                <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>out of 100</div>
              </div>
            </div>
          </div>

          {/* Three component tiles */}
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { l: "Eat", v: "72", c: GREEN },
              { l: "Move", v: "64", c: "#444CE7" },
              { l: "Mind", v: "58", c: "#2DA6A6" },
            ].map((p) => (
              <div
                key={p.l}
                style={{
                  flex: 1,
                  background: BG_ALT,
                  border: "1px solid " + BORDER,
                  borderRadius: 12,
                  padding: "10px 4px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, marginBottom: 2 }}>{p.v}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: MUTED }}>{p.l}</div>
                <div style={{ height: 3, borderRadius: 2, background: p.c, marginTop: 6 }} />
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.5, marginTop: 10 }}>
            Eat, Move and Mind move your score weekly.
          </div>
        </div>

        {/* 2 — Lab report nudge */}
        <div
          style={{
            background: BG,
            border: "1px solid " + BORDER,
            borderRadius: 16,
            padding: "13px 14px",
            marginTop: 12,
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            boxShadow: SH,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              flexShrink: 0,
              borderRadius: 10,
              background: BG_ALT,
              border: "1px solid " + BORDER,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.8">
              <path d="M9 2h6M10 2v13a2 2 0 0 0 4 0V2" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.45, marginBottom: 9 }}>
              Add your lab report to make your MET Score more insightful.
            </div>
            <button
              style={{
                background: GREEN,
                border: "none",
                borderRadius: 10,
                padding: "8px 14px",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Upload your lab report<CtaArrow />
            </button>
          </div>
        </div>

        {/* 4 — Kaira's weekly summary */}
        <div
          style={{
            background: "linear-gradient(135deg,#F2F4F7,#F9FAFB)",
            border: "1px solid #E4E7EC",
            borderRadius: 18,
            padding: 16,
            marginTop: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div
              style={{
                width: 26,
                height: 26,
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
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Your week, read by Kaira</div>
          </div>

          <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.55, marginBottom: 12 }}>
            19 meals logged, sufficiency above 70% on five days. Eat is your
            strongest at 72. Move followed at 6,200 steps a day. Mind is the drag
            at 58: you logged sleep once, so it's unmeasured more than it's poor.
          </div>

          {/* Suggestion chips — horizontal scroll */}
          <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 0.5, marginBottom: 8 }}>
            TO MOVE YOUR SCORE NEXT WEEK
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              overflowX: "auto",
              paddingBottom: 2,
              marginBottom: 12,
              scrollbarWidth: "none",
            }}
          >
            {[
              { t: "Log 3 nights of sleep", g: "Mind +6" },
              { t: "Protein anchor at lunch", g: "Eat +3" },
              { t: "Close step goal 5 days", g: "Move +4" },
            ].map((c) => (
              <button
                key={c.t}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: "1px solid " + GREEN,
                  background: BG,
                  color: TEXT,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {c.t}
                <span style={{ color: GREEN, fontWeight: 700 }}>{c.g}</span>
              </button>
            ))}
          </div>

          {/* Capability gap — text then slim button below */}
          <div
            style={{
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 12,
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.5, marginBottom: 10 }}>
              Three weeks of the same protein gap, a pattern worth a human eye.
            </div>
            <button
              style={{
                background: GREEN,
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                color: "#fff",
                fontSize: 11.5,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Book a free consultation<CtaArrow />
            </button>
          </div>
        </div>
        </>
        )}
      </div>
    )
  );
}
