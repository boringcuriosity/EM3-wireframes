import React from "react";
import { useWF } from "../state";
import { ChevronRight } from "lucide-react";
import StreakFlame from "./StreakFlame";
import { TEXT, MUTED, BG, GOLD_TINT, GOLD_LINE, GOLD_DEEP, SH } from "../tokens";

/* Appears at the head of today's list once everything is in. It is the only
   card that is not a task: it says what the day earned and opens the rewards
   behind it. Gold, because it belongs to the coin and streak family rather
   than to any one pillar. */
export default function StreakWonCard({ fullWidth }) {
  const { CARD_W, streakShown, setStreakInfo } = useWF();
  const day = streakShown;

  return (
    <div
      onClick={() => setStreakInfo(true)}
      style={{
        width: fullWidth ? "100%" : CARD_W,
        flexShrink: 0,
        scrollSnapAlign: "center",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: GOLD_TINT,
        border: "1px solid " + GOLD_LINE,
        borderRadius: 16,
        padding: "13px 14px",
        boxShadow: SH,
        cursor: "pointer",
        animation: "popIn .5s cubic-bezier(.32,.72,0,1) both",
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          flexShrink: 0,
          background: BG,
          border: "1px solid " + GOLD_LINE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StreakFlame size={22} fraction={1} outline={false} />
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
          {day === 1 ? "Day 1 of your streak" : day + " days in a row"}
        </div>
        <div style={{ fontSize: 10.5, color: GOLD_DEEP, marginTop: 3, lineHeight: 1.4 }}>
          Everything on today's list is done. Come back tomorrow to keep it alive.
        </div>
      </div>

      <ChevronRight size={16} color={MUTED} style={{ flexShrink: 0 }} />
    </div>
  );
}
