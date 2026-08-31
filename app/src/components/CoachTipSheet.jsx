import React from "react";
import { useWF } from "../state";
import { Info, X } from "lucide-react";
import CtaArrow from "./CtaArrow";
import { GREEN, GREEN_DEEP, TEXT, MUTED, BG, BG_ALT, BORDER, LINE, PILLAR } from "../tokens";

const PILLAR_NAME = { eat: "Eat", move: "Move", mind: "Mind", measure: "Measure" };

/* What a tip is, and why it is on the list at all.

   Every other row on the day is finished by a record landing somewhere: a meal
   in Eat, a session in Move, a reading off a device. A tip is finished by
   doing the thing and saying so, which is why it ticks straight off the row
   with no screen behind it. On a list where the two sit side by side that
   difference is invisible, so the bulb marks it and this explains it.

   Short, because it is a detour. One line on what a tip is, one on where it
   came from, then the way to the part the sheet cannot answer: why this
   particular one is worth doing. That belongs to Kaira. */
export default function CoachTipSheet() {
  const { tipInfo, setTipInfo, dayRows, askKaira } = useWF();
  const r = dayRows.find((x) => x.id === tipInfo);
  if (!r) return null;
  const c = PILLAR[r.pillar].c;

  return (
    <div
      onClick={() => setTipInfo(null)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 56,
        background: "rgba(16,24,40,0.46)",
        display: "flex",
        alignItems: "flex-end",
        animation: "scrimIn .24s ease both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tip-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: BG,
          borderRadius: "26px 26px 0 0",
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: BORDER, margin: "10px auto 0" }} />

        {/* Which tip, kept quiet so the explanation below carries the weight.
            Same header the row menu uses, so two sheets opening off the same
            row read as two pages of one thing. */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "14px 22px 0" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, flexShrink: 0 }} />
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 12,
              fontWeight: 600,
              color: MUTED,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {r.title}
          </span>
          <button
            onClick={() => setTipInfo(null)}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: -4, display: "flex" }}
          >
            <X size={17} color={MUTED} />
          </button>
        </div>

        <div style={{ height: 1, background: LINE, margin: "14px 0 0" }} />

        <div style={{ padding: "18px 22px 0", display: "flex", gap: 13 }}>
          {/* The same mark as the row, so the sheet is visibly the thing that
              button opened. Neutral for the same reason: every hue in this app
              belongs to a pillar, and a tip belongs to all four. Enough room
              in a 38px circle that the glyph's own ring reads as an icon
              rather than as a second border. */}
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: BG_ALT,
              border: "1px solid " + BORDER,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Info size={18} color={TEXT} strokeWidth={2.2} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span
              id="tip-title"
              style={{ display: "block", fontSize: 16, fontWeight: 700, color: TEXT, letterSpacing: "-0.01em" }}
            >
              This one is a tip from your coach
            </span>
            <span style={{ display: "block", fontSize: 12.5, color: MUTED, lineHeight: 1.55, marginTop: 4 }}>
              Your {PILLAR_NAME[r.pillar]} coach added it to your day as a small habit worth
              building. Do it and tick it off.
            </span>
          </span>
        </div>

        {/* Why it works is a longer answer than a sheet should hold, and it is
            the question people actually have. Kaira takes it. */}
        <div style={{ padding: "20px 22px 0" }}>
          <button
            onClick={() => askKaira(r.id)}
            style={{
              width: "100%",
              height: 46,
              borderRadius: 14,
              background: GREEN,
              border: "none",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              boxShadow: "0 2px 0 " + GREEN_DEEP,
            }}
          >
            Ask Kaira more about it
            <CtaArrow size={15} />
          </button>
        </div>

        <div style={{ height: 22 }} />
      </div>
    </div>
  );
}
