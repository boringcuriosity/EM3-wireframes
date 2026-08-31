import React from "react";
import { useWF } from "../state";
import { X } from "lucide-react";
import { TDEE, BMR, ACTIVITY, HERO_GOAL, HERO_EATEN } from "../screens/sufficiency/data";
import {
  GREEN, GREEN_DEEP, GREEN_TINT, GREEN_WASH, TEXT, TEXT_2, MUTED, BG, BORDER, LINE,
  MOVE_C, MOVE_T, MOVE_W, GOLD_DEEP, GOLD_TINT, GOLD_LINE,
} from "../tokens";

/* The three figures on the daily summary, explained.

   They are the only numbers on the screen a person cannot work out for
   themselves, and TDEE in particular is a term nobody arrives already knowing.

   Each sheet opens with the number it is about, in the colour of the orb that
   was tapped, so there is never a question of which figure is being explained.
   The value is the live one rather than a written example, because a sheet
   quoting 500 next to an orb reading 640 teaches somebody to distrust both. */

export default function MetricInfoSheet() {
  const { metricInfo, setMetricInfo, heroState } = useWF();

  const eaten = HERO_EATEN[heroState] ?? 0;
  const balance = eaten - TDEE;
  const surplus = balance > 0;

  const M = {
    eaten: {
      tint: GREEN_TINT,
      wash: GREEN_WASH,
      ink: GREEN_DEEP,
      title: "Eaten",
      chipTop: "Eaten",
      /* The dash the card shows, not a zero. A sheet reading 0 beside an orb
         reading — is the same disagreement in the other direction. */
      chipBig: heroState === "nodata" ? "—" : eaten.toLocaleString(),
      chipSub: "of " + HERO_GOAL.toLocaleString() + " kcal",
      head: "What this is",
      body: "Everything you have logged today, food and drink together. It counts towards your daily target, which is the amount your coach set for you to aim at.",
    },
    tdee: {
      tint: MOVE_T,
      wash: MOVE_W,
      ink: MOVE_C,
      title: "TDEE",
      chipTop: "TDEE",
      chipBig: TDEE.toLocaleString(),
      head: "What TDEE is",
      body: "The total number of calories your body burns in a day. It is your maintenance line: eat roughly this much and your weight holds steady, eat under it and you tend to lose, eat over it and you tend to gain.",
      /* The formula, with the person's own two numbers under it. A formula
         nobody can put their own figures into is a fact about arithmetic
         rather than a fact about them. */
      how: "How it is worked out",
      formula: "TDEE = BMR × activity factor",
      hownote:
        "BMR is what you would burn lying still all day, from your height, weight, age and sex. The activity factor scales it up for how your days actually run. Yours is " +
        ACTIVITY.label.toLowerCase() +
        ", so " +
        BMR.toLocaleString() +
        " × " +
        ACTIVITY.factor +
        ".",
    },
    balance: {
      tint: GOLD_TINT,
      wash: "#FFFDF5",
      ink: GOLD_DEEP,
      title: surplus ? "Surplus" : "Deficit",
      chipTop: surplus ? "Surplus" : "Deficit",
      chipBig: (surplus ? "+" : "−") + Math.abs(balance).toLocaleString(),
      head: "What this number means",
      body: "Your energy balance: what you have eaten set against what your body burns in a day. It tells you which direction today is heading.",
      /* Two readings of one number, and the second is where the usual
         explanation goes wrong. A surplus on its own becomes fat; muscle needs
         a reason to be built, which is training and enough protein. Saying a
         surplus builds muscle is the shortcut that sends people to the wrong
         conclusion in a diabetes app. */
      pairs: [
        {
          k: "A minus means a deficit.",
          v: "You have eaten less than your body burned, so it makes up the difference from what it has stored. That is how weight comes off. A steady, moderate gap works better than a sharp one.",
        },
        {
          k: "A plus means a surplus.",
          v: "You have eaten more than your body burned, and the extra gets stored. Whether it stores as muscle or as fat depends on what else you are doing: strength work and enough protein are what turn some of it into muscle.",
        },
        {
          k: "Near zero is maintenance.",
          v: "What went in matched what went out, so your weight holds roughly where it is.",
        },
      ],
    },
  }[metricInfo];

  if (!M) return null;

  return (
    <div
      onClick={() => setMetricInfo(null)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 55,
        background: "rgba(16,24,40,0.46)",
        display: "flex",
        alignItems: "flex-end",
        animation: "scrimIn .24s ease both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="metric-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxHeight: "88%",
          background: BG,
          borderRadius: "26px 26px 0 0",
          overflow: "hidden",
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          display: "flex",
          flexDirection: "column",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >

        {/* The number, on a band in its own colour. Same hue as the orb that
            opened it, so the two are visibly the same thing. */}
        <div
          style={{
            flexShrink: 0,
            background: M.wash,
            borderBottom: "1px solid " + LINE,
            padding: "20px 22px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <h2
              id="metric-title"
              style={{
                flex: 1,
                minWidth: 0,
                margin: 0,
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: TEXT,
              }}
            >
              {M.title}
            </h2>
            <button
              onClick={() => setMetricInfo(null)}
              aria-label="Close"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                flexShrink: 0,
                background: BG,
                border: "1px solid " + BORDER,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <X size={15} color={MUTED} />
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
            <span
              style={{
                width: 128,
                height: 128,
                borderRadius: "50%",
                background: BG,
                border: "1px solid " + (M.ink === GOLD_DEEP ? GOLD_LINE : M.tint),
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                animation: "popIn .42s cubic-bezier(.32,.72,0,1) both",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 0.4 }}>
                {M.chipTop}
              </span>
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: M.ink,
                  lineHeight: 1.15,
                  marginTop: 2,
                  letterSpacing: "-0.02em",
                }}
              >
                {M.chipBig}
              </span>
              {M.chipSub && (
                <span style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{M.chipSub}</span>
              )}
            </span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "18px 22px 0" }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>{M.head}</div>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{M.body}</p>

          {M.how && (
            <>
              <div style={{ height: 1, background: LINE, margin: "18px 0 16px" }} />
              <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>{M.how}</div>
              <div
                style={{
                  background: M.wash,
                  border: "1px solid " + M.tint,
                  borderRadius: 12,
                  padding: "11px 13px",
                  marginTop: 9,
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: M.ink,
                  textAlign: "center",
                }}
              >
                {M.formula}
              </div>
              <p style={{ margin: "10px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>
                {M.hownote}
              </p>
            </>
          )}

          {M.pairs && (
            <div style={{ marginTop: 4 }}>
              {M.pairs.map((p) => (
                <p key={p.k} style={{ margin: "14px 0 0", fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
                  <strong style={{ color: TEXT_2 }}>{p.k}</strong> {p.v}
                </p>
              ))}
            </div>
          )}
        </div>

        <div style={{ flexShrink: 0, padding: "20px 22px 26px" }}>
          <button
            onClick={() => setMetricInfo(null)}
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
