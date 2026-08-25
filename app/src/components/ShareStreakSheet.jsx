import React from "react";
import { useWF } from "../state";
import { X, Share2, AtSign } from "lucide-react";
import StreakFlame from "./StreakFlame";
import {
  GREEN, GREEN_DEEP, GREEN_TINT, GOLD, GOLD_TINT, GOLD_LINE, GOLD_DEEP,
  TEXT, MUTED, BG, BG_ALT, BORDER, LINE, RULE,
} from "../tokens";

/* Share the streak, once for coins and after that for the fun of it. The
   reward is one time and says so up front, because finding that out after the
   second share is how a reward turns into a grievance. */
export default function ShareStreakSheet() {
  const {
    setShareOpen,
    shareClaimed,
    setShareClaimed,
    SHARE_COINS,
    streakShown,
    flipcoins,
    setFlipcoins,
    setToast,
  } = useWF();

  const day = streakShown;

  const share = () => {
    if (!shareClaimed) {
      setShareClaimed(true);
      setFlipcoins(flipcoins + SHARE_COINS);
      setToast({
        title: "+" + SHARE_COINS + " Flipcoins earned",
        line: "Thanks for spreading the word",
        coins: SHARE_COINS,
      });
    } else {
      setToast({ title: "Ready to share", line: "Your streak card has been copied" });
    }
    setShareOpen(false);
  };

  return (
    <div
      onClick={() => setShareOpen(false)}
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
        aria-labelledby="share-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: BG,
          borderRadius: "26px 26px 0 0",
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          maxHeight: "90%",
          display: "flex",
          flexDirection: "column",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: BORDER, margin: "10px auto 0", flexShrink: 0 }} />

        <div style={{ flexShrink: 0, padding: "14px 22px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: GREEN_TINT,
                color: GREEN_DEEP,
                borderRadius: 999,
                padding: "4px 11px 4px 8px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.6,
              }}
            >
              <Share2 size={11} strokeWidth={2.4} />
              SHARE
            </span>
            <span style={{ flex: 1 }} />
            <button
              onClick={() => setShareOpen(false)}
              aria-label="Close"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: -4 }}
            >
              <X size={17} color={MUTED} />
            </button>
          </div>

          <h2
            id="share-title"
            style={{ margin: "11px 0 0", fontSize: 17, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}
          >
            Show off your streak
          </h2>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT, lineHeight: 1.42, marginTop: 5 }}>
            Post it and tag GoodFlip.{" "}
            <span style={{ color: GREEN }}>
              {shareClaimed
                ? "You have already claimed the bonus."
                : "First share pays " + SHARE_COINS + " Flipcoins."}
            </span>
          </div>
          <p style={{ margin: "9px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>
            The {SHARE_COINS} coin bonus lands once. After that, share as often as you like, every
            week if you want to.
          </p>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px 4px", minHeight: 0 }}>
          {/* What goes out */}
          <div
            style={{
              background: BG_ALT,
              border: "1px solid " + LINE,
              borderRadius: 18,
              padding: "18px 16px",
              textAlign: "center",
            }}
          >
            <StreakFlame size={54} fraction={1} outline={false} />
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 22,
                fontWeight: 600,
                color: TEXT,
                marginTop: 10,
              }}
            >
              {day} {day === 1 ? "day" : "days"} in a row
            </div>
            <div style={{ fontSize: 11.5, color: MUTED, marginTop: 4 }}>
              Eat, Move, Mind and Measure, every day.
            </div>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 12,
                fontWeight: 600,
                color: GREEN,
                marginTop: 12,
                letterSpacing: 0.3,
              }}
            >
              GoodFlip
            </div>
            <div
              style={{
                fontSize: 9,
                color: RULE,
                marginTop: 10,
                letterSpacing: 0.4,
              }}
            >
              THIS IS THE IMAGE THAT GETS SHARED
            </div>
          </div>

          {/* The one condition */}
          <div
            style={{
              display: "flex",
              gap: 11,
              background: GOLD_TINT,
              border: "1px solid " + GOLD_LINE,
              borderRadius: 14,
              padding: "12px 14px",
              marginTop: 14,
            }}
          >
            <AtSign size={15} color={GOLD_DEEP} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 11.5, color: GOLD_DEEP, lineHeight: 1.55 }}>
              <strong>Tag GoodFlip in your post.</strong> That is how we find it and drop the coins
              in your wallet.
            </div>
          </div>
        </div>

        <div style={{ flexShrink: 0, padding: "16px 22px 24px" }}>
          <button
            onClick={share}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
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
            <Share2 size={16} color="#fff" strokeWidth={2.4} />
            {shareClaimed ? "Share again" : "Share and earn " + SHARE_COINS}
            {!shareClaimed && (
              <span
                style={{
                  width: 12,
                  height: 12,
                  background: GOLD,
                  clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                }}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
