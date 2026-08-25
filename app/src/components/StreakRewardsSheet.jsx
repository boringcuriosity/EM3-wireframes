import React from "react";
import { useWF } from "../state";
import { X } from "lucide-react";
import StreakFlame from "./StreakFlame";
import {
  GREEN, GREEN_DEEP, GOLD, GOLD_TINT, GOLD_LINE, GOLD_DEEP, TEXT, MUTED, BG, BORDER,
} from "../tokens";

/* Opened from the card that appears once a day is cleared. It answers one
   question, "what have I got and what is it worth", and hands off to the full
   screen for anyone who wants the rest. */
export default function StreakRewardsSheet() {
  const { setStreakInfo, setStreakOpen, setActiveTab, streakShown, STREAK_REWARDS } = useWF();
  const day = streakShown;

  const knowMore = () => {
    setStreakInfo(false);
    setActiveTab("home");
    setStreakOpen("guide");
  };

  return (
    <div
      onClick={() => setStreakInfo(false)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 57,
        background: "rgba(16,24,40,0.46)",
        display: "flex",
        alignItems: "flex-end",
        animation: "scrimIn .24s ease both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="streak-title"
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

        <div style={{ display: "flex", justifyContent: "flex-end", padding: "4px 18px 0" }}>
          <button
            onClick={() => setStreakInfo(false)}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: -4 }}
          >
            <X size={17} color={MUTED} />
          </button>
        </div>

        {/* The streak itself, big, because that is what was just earned */}
        <div style={{ textAlign: "center", padding: "2px 24px 0" }}>
          <StreakFlame size={86} fraction={1} outline={false} />

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "center",
              gap: 7,
              marginTop: 10,
            }}
          >
            <span
              id="streak-title"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 44,
                fontWeight: 600,
                color: TEXT,
                lineHeight: 1,
                letterSpacing: -1,
              }}
            >
              {day}
            </span>
            <span style={{ fontSize: 14, color: MUTED }}>
              {day === 1 ? "day in a row" : "days in a row"}
            </span>
          </div>

          <p
            style={{
              margin: "12px auto 0",
              maxWidth: 290,
              fontSize: 12.5,
              color: MUTED,
              lineHeight: 1.6,
            }}
          >
            Clear everything on today's list and the day counts. Keep the run going and it pays a bonus on top
            of what the tasks already gave you.
          </p>

          {/* What the run is heading towards */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14 }}>
            {STREAK_REWARDS.map((r) => (
              <span
                key={r.days}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: GOLD_TINT,
                  border: "1px solid " + GOLD_LINE,
                  borderRadius: 999,
                  padding: "6px 12px 6px 11px",
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: GOLD_DEEP,
                }}
              >
                {r.days} days
                <span
                  style={{
                    width: 11,
                    height: 11,
                    background: GOLD,
                    clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                  }}
                />
                +{r.coins}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, padding: "22px 22px 26px" }}>
          <button
            onClick={knowMore}
            style={{
              flex: 1,
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 14,
              padding: "13px 0",
              fontSize: 13.5,
              fontWeight: 700,
              color: TEXT,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Know more
          </button>
          <button
            onClick={() => setStreakInfo(false)}
            style={{
              flex: 1,
              background: GREEN,
              border: "none",
              borderRadius: 14,
              padding: "13px 0",
              fontSize: 13.5,
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
