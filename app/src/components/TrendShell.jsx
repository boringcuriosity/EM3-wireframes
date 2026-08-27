import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GREEN, TEXT, MUTED, FAINT, BG, BORDER, LINE, SH, SH_SM, PILLAR } from "../tokens";

/* The parts every Trend tab shares: which week you are reading, what Kaira
   makes of it, and what the page looks like before there is a week worth
   reading. Move and Mind both use these, so the two pillars cannot drift into
   two different ideas of what a trend page is. */

export const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function WeekPicker({ back, label = "This week" }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 13,
          fontWeight: 600,
          color: TEXT,
          border: "1px solid " + BORDER,
          borderRadius: 999,
          padding: "5px 14px",
          background: BG,
        }}
      >
        <ChevronLeft size={15} color={back ? TEXT : "#D0D5DD"} strokeWidth={2.2} />
        {label}
        <ChevronRight size={15} color={FAINT} strokeWidth={2.2} />
      </div>
    </div>
  );
}

/* Kaira's read of the week. A headline that says the finding and a paragraph
   that shows the working, because a verdict with no reasoning is just an
   opinion about somebody's life. */
export function KairaRead({ head, body, children }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg,#F2F4F7,#F9FAFB)",
        border: "1px solid " + BORDER,
        borderRadius: 18,
        padding: 18,
        marginBottom: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span
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
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 0.5 }}>
          YOUR WEEK, READ BY KAIRA
        </span>
      </div>

      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 18,
          fontWeight: 600,
          color: TEXT,
          lineHeight: 1.35,
        }}
      >
        {head}
      </div>
      <div style={{ fontSize: 13, color: TEXT, marginTop: 8, lineHeight: 1.5 }}>{body}</div>
      {children}
    </div>
  );
}

/* Three numbers under the chart. Each one carries how it moved, because a
   number on its own says where you are and a delta says where you are going. */
export function StatRow({ pillar, stats }) {
  const c = PILLAR[pillar].c;
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            flex: 1,
            minWidth: 0,
            background: BG,
            border: "1px solid " + BORDER,
            borderRadius: 14,
            padding: "12px 9px",
            textAlign: "center",
            boxShadow: SH_SM,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: TEXT, lineHeight: 1.2 }}>{s.value}</div>
          <div style={{ fontSize: 10, color: MUTED, marginTop: 3, lineHeight: 1.3 }}>{s.label}</div>
          {s.delta && (
            <div style={{ fontSize: 9.5, fontWeight: 700, color: s.up ? c : MUTED, marginTop: 4 }}>
              {s.delta}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* The Trend tab before there is a week to read. It shows the shape of what is
   coming, so the wait reads as a week filling up rather than a broken page. */
const HEIGHTS = [46, 62, 38, 54, 58, 44, 50];

export function TrendWaiting({ pillar, days, head, line, note, cta, onCta }) {
  const c = PILLAR[pillar].c;
  return (
    <div>
      <div style={{ background: BG, border: "1px solid " + BORDER, borderRadius: 18, padding: 18, boxShadow: SH }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span
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
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 0.5 }}>
            YOUR WEEK, READ BY KAIRA
          </span>
        </div>

        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 18,
            fontWeight: 600,
            color: TEXT,
            lineHeight: 1.35,
          }}
        >
          {head}
        </div>
        <div style={{ fontSize: 13, color: TEXT, marginTop: 8, lineHeight: 1.5 }}>{line}</div>

        {/* The week ahead, drawn empty. Days already in are solid. */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 66, marginTop: 18 }}>
          {DAYS.map((d, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div
                style={{
                  width: "100%",
                  height: HEIGHTS[i],
                  borderRadius: 6,
                  background: i < days ? c : "transparent",
                  border: i < days ? "none" : "1.5px dashed " + BORDER,
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          {DAYS.map((d, i) => (
            <span key={i} style={{ flex: 1, textAlign: "center", fontSize: 11, color: i < days ? TEXT : MUTED }}>
              {d}
            </span>
          ))}
        </div>

        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid " + LINE,
            fontSize: 12,
            color: MUTED,
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: TEXT }}>{days} of 7 days in.</strong> {note}
        </div>
      </div>

      <button
        onClick={onCta}
        style={{
          width: "100%",
          marginTop: 14,
          background: c,
          border: "none",
          borderRadius: 14,
          padding: "14px 0",
          color: "#fff",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {cta}
      </button>
    </div>
  );
}
