import React from "react";
import { useWF } from "../state";
import { X, Zap, Flame, Target, Trophy, Plug } from "lucide-react";
import {
  GREEN, GREEN_DEEP, GREEN_TINT, GOLD, GOLD_TINT, GOLD_LINE, GOLD_DEEP,
  TEXT, MUTED, BG, BG_ALT, BORDER, LINE,
} from "../tokens";

/* What Flipcoins are, how they add up, and what they turn into. Opened from
   the one pill that names them, so the reward is explained where it is asked
   about rather than repeated on every task in the app.

   Five ways to earn, in the order a new user meets them: today's logging
   first, the long game last. */

const EARN = [
  {
    Icon: Zap,
    t: "Every day",
    b: "Log your meals, movement, sleep, water and device readings.",
    pay: "1 to 4 each",
  },
  {
    Icon: Flame,
    t: "Staying consistent",
    b: "Keep a daily food or exercise log going without a gap.",
    pay: "20 a week",
  },
  {
    Icon: Target,
    t: "Following your program",
    b: "Hit a metabolic goal, or attend a session with your coach.",
    pay: "20 to 50",
  },
  {
    Icon: Trophy,
    t: "Sticking with it",
    b: "Stay active month after month and each milestone pays more.",
    pay: "up to 400",
  },
  {
    Icon: Plug,
    t: "Setting things up",
    b: "Join a program, connect your glucose monitor or body analyser.",
    pay: "10 each",
  },
];

const BRANDS = ["Amazon", "Zomato", "Myntra", "AJIO", "Domino's", "Swiggy"];

export default function FlipcoinsSheet() {
  const { setCoinsInfo } = useWF();

  return (
    <div
      onClick={() => setCoinsInfo(false)}
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
        aria-labelledby="coins-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: BG,
          borderRadius: "26px 26px 0 0",
          overflow: "hidden",
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          maxHeight: "90%",
          display: "flex",
          flexDirection: "column",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >

        <div style={{ flexShrink: 0, padding: "22px 22px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: GOLD_TINT,
                border: "1px solid " + GOLD_LINE,
                color: GOLD_DEEP,
                borderRadius: 999,
                padding: "4px 10px 4px 8px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.6,
              }}
            >
              <Coin size={11} />
              FLIPCOINS
            </span>
            <span style={{ flex: 1 }} />
            <button
              onClick={() => setCoinsInfo(false)}
              aria-label="Close"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: -4 }}
            >
              <X size={17} color={MUTED} />
            </button>
          </div>

          <h2
            id="coins-title"
            style={{ margin: "11px 0 0", fontSize: 17, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}
          >
            What are Flipcoins?
          </h2>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT, lineHeight: 1.42, marginTop: 5 }}>
            Looking after yourself pays.{" "}
            <span style={{ color: GREEN }}>Redeem what you earn on brands you already shop with.</span>
          </div>
          <p style={{ margin: "9px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>
            Coins land in your wallet as you go. The more of your day you log, the faster they
            build.
          </p>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px 4px", minHeight: 0 }}>
          <Label>Five ways to earn</Label>

          {EARN.map((x) => (
            <div
              key={x.t}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 11,
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 14,
                padding: "11px 13px",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: GREEN_TINT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <x.Icon size={15} color={GREEN_DEEP} strokeWidth={2} />
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, color: TEXT }}>
                    {x.t}
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
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Coin size={10} />
                    {x.pay}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginTop: 3 }}>
                  {x.b}
                </div>
              </div>
            </div>
          ))}

          <Label>Where they go</Label>
          <div
            style={{
              background: BG_ALT,
              border: "1px solid " + LINE,
              borderRadius: 16,
              padding: "14px 15px",
            }}
          >
            <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.55 }}>
              Turn your balance into coupons from your favourite brands, straight from your wallet.
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 11 }}>
              {BRANDS.map((b) => (
                <span
                  key={b}
                  style={{
                    background: BG,
                    border: "1px solid " + BORDER,
                    borderRadius: 999,
                    padding: "5px 11px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: TEXT,
                  }}
                >
                  {b}
                </span>
              ))}
              <span
                style={{
                  padding: "5px 4px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: MUTED,
                }}
              >
                and more
              </span>
            </div>
          </div>

          <div
            style={{
              margin: "16px 0 4px",
              background: GREEN_TINT,
              border: "1px solid " + GREEN + "40",
              borderRadius: 16,
              padding: "13px 15px",
              fontSize: 12.5,
              color: TEXT,
              lineHeight: 1.55,
            }}
          >
            <strong style={{ color: GREEN_DEEP }}>Your coins are yours.</strong> Break a streak and
            you lose the weekly bonus, never the balance. Nothing here takes back what you have
            already earned.
          </div>
        </div>

        <div style={{ flexShrink: 0, padding: "16px 22px 24px" }}>
          <button
            onClick={() => setCoinsInfo(false)}
            style={{
              width: "100%",
              background: GREEN,
              border: "none",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 14,
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

function Coin({ size = 11 }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        background: GOLD,
        clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
        display: "inline-block",
      }}
    />
  );
}

function Label({ children }) {
  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: MUTED,
        margin: "22px 0 8px",
      }}
    >
      {children}
    </div>
  );
}
