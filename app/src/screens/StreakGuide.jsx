import React from "react";
import { useWF } from "../state";
import { ChevronLeft, Share2 } from "lucide-react";
import StreakFlame from "../components/StreakFlame";
import CtaArrow from "../components/CtaArrow";
import {
  GREEN, GREEN_DEEP, GOLD, GOLD_TINT, GOLD_LINE, GOLD_DEEP, BAD,
  TEXT, MUTED, BG, BG_ALT, BORDER, LINE,
} from "../tokens";

/* How the streak works, in three sentences. It used to run to four sections
   with friends, rest days and revives in it. None of that was the rule, and a
   rule you can hold in your head is the one people keep. */
export default function StreakGuide() {
  const {
    setStreakOpen,
    setActiveTab,
    streakShown,
    streakState,
    dailyDoneCount,
    dailyRepeating,
    dayFraction,
    dayComplete,
    STREAK_REWARDS,
    MILESTONES,
    milestoneStatus,
    setShareOpen,
    shareClaimed,
    SHARE_COINS,
  } = useWF();

  const total = dailyRepeating.length;
  const broken = streakState === "broken";

  const RULES = [
    {
      n: "1",
      t: "Finish all " + total + " tasks",
      b: "That is one day of your streak.",
    },
    {
      n: "2",
      t: "Come back tomorrow",
      b: "Miss a day and your streak starts over. There is no way to buy it back.",
    },
    {
      n: "3",
      t: "Longer runs pay more",
      b: "7 days and 30 days each earn bonus Flipcoins.",
    },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
      <div
        style={{
          padding: "8px 22px 0",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          onClick={() => setStreakOpen(null)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "none",
            background: "transparent",
            padding: "4px 0",
            fontSize: 15,
            fontWeight: 600,
            color: TEXT,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <ChevronLeft size={20} color={TEXT} /> Back
        </button>

        <span style={{ flex: 1 }} />

        {/* A run worth keeping is a run worth showing. Paid once, said here. */}
        <button
          onClick={() => setShareOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: shareClaimed ? BG : GOLD_TINT,
            border: "1px solid " + (shareClaimed ? BORDER : GOLD_LINE),
            borderRadius: 999,
            padding: "5px 11px 5px 9px",
            fontSize: 11,
            fontWeight: 700,
            color: shareClaimed ? MUTED : GOLD_DEEP,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <Share2 size={13} strokeWidth={2.3} />
          {shareClaimed ? "Share" : "Share, earn " + SHARE_COINS}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px 0", minHeight: 0 }}>
        {/* Where you actually are */}
        <div style={{ textAlign: "center" }}>
          <StreakFlame size={92} fraction={broken ? 0 : dayFraction} outline={false} />

          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 26,
              fontWeight: 600,
              color: TEXT,
              lineHeight: 1.2,
              marginTop: 14,
            }}
          >
            {broken
              ? "Your streak ended."
              : streakShown > 0
              ? streakShown + (streakShown === 1 ? " day" : " days") + " in a row"
              : "No streak yet"}
          </div>
          <div style={{ fontSize: 12.5, color: MUTED, marginTop: 7, lineHeight: 1.55 }}>
            {dayComplete
              ? "Today is in. Come back tomorrow and it keeps going."
              : dailyDoneCount + " of " + total + " tasks done today."}
          </div>
        </div>

        {/* The whole rule */}
        <div style={{ position: "relative", marginTop: 26 }}>
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 13,
              top: 10,
              bottom: 14,
              width: 2,
              borderRadius: 1,
              background: LINE,
            }}
          />
          {RULES.map((r) => (
            <div key={r.n} style={{ display: "flex", gap: 13, marginBottom: 18 }}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: BG_ALT,
                  border: "1px solid " + BORDER,
                  color: TEXT,
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  zIndex: 1,
                  boxShadow: "0 0 0 4px " + BG,
                }}
              >
                {r.n}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT, lineHeight: 1.35 }}>
                  {r.t}
                </div>
                <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.55, marginTop: 4 }}>
                  {r.b}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* What the long runs pay */}
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: MUTED,
            margin: "4px 0 9px",
          }}
        >
          Streak bonuses
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          {STREAK_REWARDS.map((r) => (
            <div
              key={r.days}
              style={{
                flex: 1,
                background: GOLD_TINT,
                border: "1px solid " + GOLD_LINE,
                borderRadius: 14,
                padding: "13px 12px",
              }}
            >
              <div style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>
                {r.days} days in a row
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 7,
                  fontSize: 13,
                  fontWeight: 800,
                  color: GOLD_DEEP,
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    background: GOLD,
                    clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                  }}
                />
                +{r.coins}
              </div>
            </div>
          ))}
        </div>

        {/* The long game. Shown here because it is the same idea one scale up:
            keep showing up and the reward grows. */}
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: MUTED,
            margin: "24px 0 4px",
          }}
        >
          Milestones
        </div>
        <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, marginBottom: 12 }}>
          Book at least one consultation a month. The longer the run holds, the more it pays.
        </div>

        <div style={{ position: "relative" }}>
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 5,
              top: 10,
              bottom: 16,
              width: 2,
              borderRadius: 1,
              background: LINE,
            }}
          />
          {MILESTONES.map((m) => {
            const st = milestoneStatus(m);
            return (
              <div key={m.months} style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    flexShrink: 0,
                    marginTop: 3,
                    background: st === "open" ? BG_ALT : st === "earned" ? GREEN : BAD,
                    border: "2px solid " + BG,
                    boxShadow: st === "open" ? "0 0 0 1px " + BORDER : "none",
                    position: "relative",
                    zIndex: 1,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
                      Stay active for {m.months} {m.months === 1 ? "month" : "months"}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        background: GOLD_TINT,
                        border: "1px solid " + GOLD_LINE,
                        borderRadius: 999,
                        padding: "3px 9px 3px 7px",
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: GOLD_DEEP,
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          background: GOLD,
                          clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                        }}
                      />
                      +{m.coins}
                      {st !== "open" && (
                        <span style={{ color: st === "earned" ? GREEN_DEEP : BAD, marginLeft: 2 }}>
                          · {st === "earned" ? "Earned" : "Missed"}
                        </span>
                      )}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.45, marginTop: 3 }}>
                    {m.months === 1
                      ? "One consultation in your first month."
                      : "One consultation every month, " + m.months + " months running."}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ height: 18 }} />
      </div>

      <div style={{ flexShrink: 0, padding: "12px 22px", borderTop: "1px solid " + BORDER, background: BG }}>
        <button
          onClick={() => {
            setStreakOpen(null);
            setActiveTab("track");
          }}
          style={{
            width: "100%",
            background: GREEN,
            border: "none",
            borderRadius: 14,
            padding: "15px 0",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 2px 0 " + GREEN_DEEP,
          }}
        >
          {dayComplete ? "Back to my day" : "Go to today's tasks"}
          <CtaArrow size={16} />
        </button>
      </div>
    </div>
  );
}
