import React from "react";
import { Utensils, Flame, HeartHandshake, ArrowDown } from "lucide-react";
import LotusIcon from "./LotusIcon";
import { useWF } from "../state";
import {
  GREEN, GREEN_DEEP, TEXT, MUTED, BG, LINE, PILLAR, SH_MD,
  GOLD, GOLD_TINT, GOLD_LINE, GOLD_DEEP,
} from "../tokens";

/* The first thing a care-program user sees on To-do, before their consultation.
   It answers the only question worth answering at that moment: who decides what
   I do, and why am I logging in the meantime.

   The green cap is doing the work. A card this important should not look like
   the cards around it, and a tinted band with white type reads as an occasion
   rather than another row of grey. */

const COACHES = [
  { id: "nutrition", Icon: Utensils, label: "Nutrition" },
  { id: "exercise", Icon: Flame, label: "Exercise" },
  { id: "success", Icon: HeartHandshake, label: "Success" },
];

const ASKS = [
  { id: "eat", Icon: Utensils, line: "Log every meal, even tiny things like papad" },
  { id: "move", Icon: Flame, line: "Log any movement, even a short walk" },
  { id: "mind", Icon: LotusIcon, line: "Log your sleep and calm breaks" },
];

export default function CoachHandoffCard({ onSeeTasks }) {
  const { setCoinsInfo } = useWF();

  return (
    <div
      style={{
        width: "100%",
        background: BG,
        borderRadius: 20,
        overflow: "hidden",
        isolation: "isolate",
        boxShadow: SH_MD,
        boxSizing: "border-box",
      }}
    >
      {/* Brand cap. Three faces, then the promise. */}
      <div
        style={{
          position: "relative",
          background: "linear-gradient(150deg, " + GREEN + " 0%, " + GREEN_DEEP + " 100%)",
          padding: "16px 18px 17px",
          overflow: "hidden",
        }}
      >
        {/* A soft light behind the coaches, so the band is not a flat slab */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: -54,
            left: -26,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.10)",
          }}
        />

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ display: "flex", flexShrink: 0 }}>
            {COACHES.map((c, i) => (
              <span
                key={c.id}
                title={c.label + " coach"}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: BG,
                  border: "2px solid " + GREEN,
                  boxShadow: "0 2px 5px rgba(0,0,0,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: i === 0 ? 0 : -11,
                  position: "relative",
                  zIndex: COACHES.length - i,
                }}
              >
                <c.Icon size={14} color={GREEN_DEEP} strokeWidth={2} />
              </span>
            ))}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 16,
                fontWeight: 600,
                color: "#fff",
                lineHeight: 1.2,
              }}
            >
              Your coaches want to know you
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.78)", marginTop: 3 }}>
              Your plans are built after your consultations
            </div>
          </div>
        </div>
      </div>

      {/* The three asks. A hairline rail ties them into one list rather than
          three loose rows. */}
      <div style={{ padding: "15px 18px 6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            Show them how your day goes
          </span>
          {/* The reward, mentioned once and explained on tap. A payout printed
              on every row would make this read as a game. */}
          <button
            onClick={() => setCoinsInfo(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: GOLD_TINT,
              border: "1px solid " + GOLD_LINE,
              borderRadius: 999,
              padding: "4px 9px 4px 7px",
              fontSize: 10,
              fontWeight: 700,
              color: GOLD_DEEP,
              cursor: "pointer",
              fontFamily: "inherit",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 11,
                height: 11,
                background: GOLD,
                clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
              }}
            />
            Earn Flipcoins
          </button>
        </div>

        <div style={{ position: "relative", paddingLeft: 2 }}>
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 13,
              top: 13,
              bottom: 13,
              width: 1.5,
              borderRadius: 1,
              background: LINE,
            }}
          />
          {ASKS.map((a) => (
            <div
              key={a.id}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "5px 0" }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: PILLAR[a.id].t,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  zIndex: 1,
                  boxShadow: "0 0 0 3px " + BG,
                }}
              >
                <a.Icon size={13} color={PILLAR[a.id].c} strokeWidth={2} />
              </span>
              <span style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.35 }}>{a.line}</span>
            </div>
          ))}
        </div>

      </div>

      {/* One way onward, pointing where the tasks actually are */}
      <div style={{ padding: "10px 18px 16px" }}>
        <button
          onClick={onSeeTasks}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            background: GREEN,
            border: "none",
            borderRadius: 12,
            padding: "12px 0",
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 2px 0 " + GREEN_DEEP,
          }}
        >
          Start today's tasks
          <ArrowDown size={15} color="#fff" strokeWidth={2.6} style={{ animation: "nudgeDown 1.6s ease-in-out infinite" }} />
        </button>
      </div>
    </div>
  );
}
