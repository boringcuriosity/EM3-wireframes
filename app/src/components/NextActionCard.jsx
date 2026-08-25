import React from "react";
import { useWF } from "../state";
import { BarChart3, FlaskConical, Bluetooth, ChevronRight, Check } from "lucide-react";
import {
  GREEN, TEXT, MUTED, RULE, BG, GOLD, GOLD_TINT, GOLD_LINE, LINE,
} from "../tokens";

/* The things waiting on the person, on Home beside the program card.

   A short list rather than one hero ask: these are all setup jobs of the same
   size, and seeing that there are three of them is the point. Capped at three,
   because a card that scrolls is a screen pretending to be a card.

   Ticked rows stay, struck through, until the last one is done. Removing each
   as it goes would leave the final task sitting alone with nothing to show for
   the two before it. */

const CATALOGUE = {
  score: { Icon: BarChart3, label: "Take your Metabolic Score", tab: "med" },
  labs: { Icon: FlaskConical, label: "Book your lab tests", tab: "care" },
  bca: { Icon: Bluetooth, label: "Connect your BCA device", tab: "med" },
};

export default function NextActionCard() {
  const { CARD_W, CARD_H, nextActions, nextDone, setNextDone, setActiveTab } = useWF();
  const items = nextActions
    .slice(0, 3)
    .map((id) => ({ id, ...CATALOGUE[id] }))
    .filter((x) => x.label);
  if (!items.length) return null;

  const toggle = (id) =>
    setNextDone(nextDone.includes(id) ? nextDone.filter((x) => x !== id) : nextDone.concat(id));

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

      {items.map((x, i) => {
        const done = nextDone.includes(x.id);
        return (
          <div
            key={x.id}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 10,
              height: 28,
              borderTop: i === 0 ? "none" : "1px solid " + LINE,
              paddingTop: i === 0 ? 0 : 8,
              marginTop: i === 0 ? 0 : -1,
            }}
          >
            <button
              onClick={() => toggle(x.id)}
              aria-label={(done ? "Undo " : "Mark done: ") + x.label}
              style={{
                width: 20,
                height: 20,
                flexShrink: 0,
                padding: 0,
                borderRadius: "50%",
                background: done ? GREEN : BG,
                border: "1.5px solid " + (done ? GREEN : RULE),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {done && <Check size={12} color="#fff" strokeWidth={3} />}
            </button>

            <button
              onClick={() => setActiveTab(x.tab)}
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: 0,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              <x.Icon size={13} color={done ? RULE : MUTED} strokeWidth={2.1} style={{ flexShrink: 0 }} />
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: done ? MUTED : TEXT,
                  textDecoration: done ? "line-through" : "none",
                  textDecorationColor: RULE,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  transition: "color .25s",
                }}
              >
                {x.label}
              </span>
              {!done && <ChevronRight size={15} color={MUTED} style={{ flexShrink: 0 }} />}
            </button>
          </div>
        );
      })}
    </div>
  );
}
