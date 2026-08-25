import React from "react";
import { ChevronLeft, TrendingUp, BookOpen } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BG_ALT, BORDER, PILLAR } from "../tokens";
import { PILLAR_SCIENCE } from "../screens/pillarScience";

/* The shell every pillar screen wears: the day being looked at, which pillar
   this is and what it is for, the body, and a nav of its own.

   Eat was the only screen that had this, which is why Move felt like a
   different app and Mind was not a screen at all. Anything a pillar screen
   does that is not its own subject belongs here, so the three cannot drift. */

const NAME = { eat: "Eat", move: "Move", mind: "Mind" };

export default function PillarScreen({ id, Icon, tab, setTab, onBack, children }) {
  const hue = PILLAR[id];

  const tabs = [
    { id: "today", label: NAME[id], Icon },
    { id: "trend", label: "Trend", Icon: TrendingUp },
    { id: "learn", label: "Learn", Icon: BookOpen },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, background: BG_ALT }}>
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minHeight: 0 }}>
        {/* Which day */}
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 4px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid " + BORDER,
              background: BG,
              borderRadius: 999,
              padding: "7px 16px",
              fontSize: 13,
              fontWeight: 700,
              color: TEXT,
              cursor: "pointer",
            }}
          >
            <span style={{ color: MUTED }}>‹</span> Today <span style={{ color: MUTED }}>›</span>
          </div>
        </div>

        {/* Which pillar, and what it is for. One slim line, because the answer
            is one line. */}
        <div style={{ padding: "10px 22px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: hue.t,
              borderRadius: 12,
              padding: "9px 12px",
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                flexShrink: 0,
                background: BG,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={14} color={hue.c} strokeWidth={2} />
            </span>
            <span style={{ display: "flex", alignItems: "baseline", gap: 7, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{NAME[id]}</span>
              <span style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.4 }}>
                {PILLAR_SCIENCE[id].tagline}
              </span>
            </span>
          </div>
        </div>

        {children}
      </div>

      {/* The pillar's own nav: out, and the three ways to read it */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "10px 6px 22px",
          background: BG,
          borderTop: "1px solid " + BORDER,
        }}
      >
        <button
          onClick={onBack}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={22} color={MUTED} strokeWidth={1.8} />
          <span style={{ fontSize: 11, fontWeight: 500, color: MUTED }}>Back</span>
        </button>

        {tabs.map((t) => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <t.Icon size={22} color={on ? GREEN : MUTED} strokeWidth={on ? 2.4 : 1.8} />
              <span style={{ fontSize: 11, fontWeight: on ? 700 : 500, color: on ? GREEN : MUTED }}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
