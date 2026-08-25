import React from "react";
import { useWF } from "../state";
import { BarChart3, FlaskConical, Bluetooth, ChevronRight } from "lucide-react";
import {
  TEXT, MUTED, BG, GOLD, GOLD_DEEP, GOLD_TINT, GOLD_LINE, LINE,
} from "../tokens";

/* The things waiting on the person, on Home beside the program card.

   A short list rather than one hero ask: these are all setup jobs of the same
   size, and seeing that there are three of them is the point. Capped at three,
   because a card that scrolls is a screen pretending to be a card. */

const CATALOGUE = {
  score: { Icon: BarChart3, label: "Take your Metabolic Score", tab: "med" },
  labs: { Icon: FlaskConical, label: "Book your lab tests", tab: "care" },
  bca: { Icon: Bluetooth, label: "Connect your BCA device", tab: "med" },
};

export default function NextActionCard() {
  const { CARD_W, CARD_H, nextActions, setActiveTab } = useWF();
  const items = nextActions.map((id) => CATALOGUE[id]).filter(Boolean).slice(0, 3);
  if (!items.length) return null;

  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        boxSizing: "border-box",
        borderRadius: 18,
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, " + GOLD_TINT + " 0%, " + BG + " 68%)",
        border: "1px solid " + GOLD_LINE,
        padding: "14px 14px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {/* The app's own motif, kept faint. It gives the card a warmth the two
          white ones beside it do not have, without competing with the rows. */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          right: -30,
          bottom: -38,
          width: 126,
          height: 138,
          background: GOLD,
          opacity: 0.1,
          clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
        }}
      />

      {items.map((x, i) => (
        <button
          key={x.label}
          onClick={() => setActiveTab(x.tab)}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            height: 28,
            padding: 0,
            background: "none",
            border: "none",
            borderTop: i === 0 ? "none" : "1px solid " + LINE,
            paddingTop: i === 0 ? 0 : 8,
            marginTop: i === 0 ? 0 : -1,
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "left",
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              flexShrink: 0,
              background: GOLD_TINT,
              border: "1px solid " + GOLD_LINE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <x.Icon size={12} color={GOLD_DEEP} strokeWidth={2.2} />
          </span>
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 12.5,
              fontWeight: 600,
              color: TEXT,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {x.label}
          </span>
          <ChevronRight size={15} color={MUTED} style={{ flexShrink: 0 }} />
        </button>
      ))}
    </div>
  );
}
