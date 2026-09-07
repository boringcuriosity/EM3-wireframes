import React from "react";
import { useWF } from "../../state";
import { ChevronLeft, ClipboardList, Check } from "lucide-react";
import { Cta } from "../sufficiency/parts";
import {
  GREEN, MEASURE_C, MEASURE_T, MEASURE_W, TEXT, MUTED, FAINT,
  BG, BG_ALT, BORDER, LINE,
} from "../../tokens";

/* The one first step that is a purchase, except here it is not.

   The test costs money on its own and it is inside the program, so the whole
   screen turns on that: the price is shown struck through with nothing to pay,
   because a benefit somebody already bought is worth seeing rather than
   quietly applying. Everything else on the screen is what the test actually
   covers, since that is what makes the number mean anything. */

const PANEL = [
  "HbA1c and fasting glucose",
  "Full lipid profile",
  "Liver and kidney function",
  "Thyroid, vitamin D and B12",
  "Complete blood count",
];

const LIST_PRICE = 1999;

export default function Diagnostics() {
  const { setDiagOpen, finishNext, setActiveTab } = useWF();

  const book = () => {
    finishNext("labs");
    setDiagOpen(false);
    setActiveTab("track");
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", padding: "6px 22px 10px" }}>
        <button
          onClick={() => setDiagOpen(false)}
          aria-label="Back"
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: BG,
            border: "1px solid " + BORDER,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={18} color={TEXT} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "0 22px 26px" }}>
        <h1
          style={{
            margin: 0,
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 27,
            fontWeight: 600,
            color: TEXT,
            letterSpacing: -0.5,
            lineHeight: 1.2,
          }}
        >
          Understand yourself
          <br />
          better with data
        </h1>
        <p style={{ margin: "10px 0 0", fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
          Your logs show what you eat and how you move. A blood test shows what your body is doing
          with it, and that is the quarter of your score nobody can answer for you.
        </p>

        {/* The thing itself, drawn once and large. A list of markers with no
            object attached is a lab requisition; this is a decision. */}
        <div style={{ display: "flex", justifyContent: "center", margin: "22px 0 0" }}>
          <span
            style={{
              width: 178,
              height: 178,
              borderRadius: "50%",
              background:
                "radial-gradient(130% 130% at 30% 20%, #FFFFFF 0%, " + MEASURE_W + " 30%, " +
                MEASURE_T + " 72%, " + MEASURE_C + "59 100%)",
              boxShadow:
                "0 18px 34px -14px " + MEASURE_C + "66, inset 0 -18px 26px -14px " + MEASURE_C + "A6, " +
                "inset 0 10px 16px -9px #FFFFFF",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <ClipboardList size={30} color={TEXT} strokeWidth={1.8} />
            <span style={{ fontSize: 15, fontWeight: 800, color: TEXT, textAlign: "center", lineHeight: 1.25 }}>
              Personalised
              <br />
              lab test
            </span>
          </span>
        </div>

        {/* Nothing to pay, said as a price rather than as a badge, because the
            number crossed out is the part that lands. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 24,
            padding: "14px 15px",
            borderRadius: 16,
            background: BG_ALT,
            border: "1px solid " + BORDER,
          }}
        >
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: MUTED }}>
              Price for you
            </span>
            <span style={{ display: "flex", alignItems: "baseline", gap: 9, marginTop: 3 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: GREEN, letterSpacing: -0.5 }}>₹0</span>
              <span style={{ fontSize: 14, color: FAINT, textDecoration: "line-through" }}>
                ₹{LIST_PRICE.toLocaleString("en-IN")}
              </span>
            </span>
          </span>
          <span
            style={{
              flexShrink: 0,
              maxWidth: 132,
              fontSize: 11.5,
              fontWeight: 700,
              color: GREEN,
              textAlign: "right",
              lineHeight: 1.4,
            }}
          >
            Included in your program
          </span>
        </div>

        <div style={{ fontSize: 13.5, fontWeight: 800, color: TEXT, margin: "22px 0 10px" }}>
          What the test covers
        </div>
        <div style={{ borderRadius: 16, border: "1px solid " + LINE, overflow: "hidden" }}>
          {PANEL.map((x, i) => (
            <div
              key={x}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 13px",
                borderTop: i ? "1px solid " + LINE : "none",
                fontSize: 12.5,
                color: TEXT,
              }}
            >
              <Check size={14} color={GREEN} strokeWidth={3} style={{ flexShrink: 0 }} />
              {x}
            </div>
          ))}
        </div>

        <p style={{ margin: "12px 0 0", fontSize: 11.5, color: MUTED, lineHeight: 1.55 }}>
          A phlebotomist comes to your address. Results reach your coach in about two days, and they
          read them before your consultation.
        </p>
      </div>

      <div style={{ flexShrink: 0, padding: "12px 22px 26px", borderTop: "1px solid " + BORDER }}>
        <Cta onClick={book}>Book my test</Cta>
      </div>
    </div>
  );
}
