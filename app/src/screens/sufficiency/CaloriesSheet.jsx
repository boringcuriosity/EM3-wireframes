import React from "react";
import { useWF } from "../../state";
import { Info, ArrowRight, Lock } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BG_ALT, BORDER } from "../../tokens";
import { Cta } from "./parts";
import {
  GOALS, KCAL_MIN, KCAL_MAX, BMR, TDEE, BMI, BODY, ACTIVITY, bmiBand, projectKg,
} from "./data";

/* Editing the calorie target. Two things have to be true here: the projection
   must follow the number honestly, and a target a coach has already set must
   not be quietly overwritten by a slider. */
export default function CaloriesSheet() {
  const { setSuffSheet, suffGoal, suffKcal, setSuffKcal, kcalSource, isPaid } = useWF();
  const goal = GOALS.find((g) => g.id === suffGoal) || GOALS[0];
  const kcal = suffKcal ?? goal.kcal;
  const locked = isPaid && kcalSource === "coach";

  const diff = TDEE - kcal;
  const direction = diff > 120 ? "lose weight" : diff < -120 ? "gain weight" : "hold steady";
  const after = projectKg(kcal);

  return (
    <div
      onClick={() => setSuffSheet(null)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 47,
        background: "rgba(31,38,48,0.42)",
        display: "flex",
        alignItems: "flex-end",
        animation: "scrimIn .24s ease both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="kcal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxHeight: "90%",
          display: "flex",
          flexDirection: "column",
          background: BG,
          borderRadius: "26px 26px 0 0",
          overflow: "hidden",
          boxShadow: "0 -12px 40px rgba(31,38,48,0.22)",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <div style={{ padding: "22px 22px 0", flexShrink: 0 }}>
          <div id="kcal-title" style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>
            Daily calories
          </div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 4, lineHeight: 1.5 }}>
            {locked
              ? "Your coach set this for you. It stays fixed until they change it."
              : "Set the amount and I will rebalance your macros to match."}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px 4px", minHeight: 0 }}>
          {/* The number */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 46,
                fontWeight: 800,
                color: TEXT,
                lineHeight: 1,
                letterSpacing: -1.5,
              }}
            >
              {kcal.toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>kcal a day</div>
          </div>

          {/* The slider */}
          <div style={{ margin: "20px 0 0", opacity: locked ? 0.45 : 1 }}>
            <input
              type="range"
              min={KCAL_MIN}
              max={KCAL_MAX}
              step={50}
              value={kcal}
              disabled={locked}
              onChange={(e) => setSuffKcal(+e.target.value)}
              aria-label="Daily calories"
              style={{ width: "100%", accentColor: GREEN, cursor: locked ? "not-allowed" : "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              <span style={{ fontSize: 10, color: MUTED }}>{KCAL_MIN.toLocaleString()}</span>
              <button
                onClick={() => !locked && setSuffKcal(goal.kcal)}
                disabled={locked}
                style={{
                  background: kcal === goal.kcal ? GREEN : BG,
                  border: "1px solid " + (kcal === goal.kcal ? GREEN : BORDER),
                  borderRadius: 999,
                  padding: "4px 12px",
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: kcal === goal.kcal ? "#fff" : MUTED,
                  cursor: locked ? "default" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                Recommended {goal.kcal.toLocaleString()}
              </button>
              <span style={{ fontSize: 10, color: MUTED }}>{KCAL_MAX.toLocaleString()}</span>
            </div>
          </div>

          {/* What it means for the body in front of us */}
          <div
            style={{
              marginTop: 20,
              background: BG_ALT,
              border: "1px solid " + BORDER,
              borderRadius: 16,
              padding: "14px 15px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12.5, color: MUTED }}>Your BMI is</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>{BMI}</span>
              <span
                style={{
                  background: BG,
                  border: "1px solid " + BORDER,
                  borderRadius: 999,
                  padding: "3px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: TEXT,
                }}
              >
                {bmiBand(BMI)}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
              <span style={{ fontSize: 12.5, color: MUTED }}>At this goal you will</span>
              <span
                style={{
                  background: BG,
                  border: "1px solid " + TEXT,
                  borderRadius: 999,
                  padding: "3px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: TEXT,
                }}
              >
                {direction}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
              <Box label="Today" value={BODY.kg + " kg"} />
              <ArrowRight size={16} color={MUTED} style={{ flexShrink: 0 }} />
              <Box label="In 6 months" value={after + " kg"} strong />
            </div>

            <div style={{ display: "flex", gap: 7, marginTop: 12 }}>
              <Info size={13} color={MUTED} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 10.5, color: MUTED, lineHeight: 1.5 }}>
                An estimate from your current calorie goal, at roughly 7,700 kcal a kilo. Real
                results move around with sleep, stress and activity.
              </span>
            </div>
          </div>

          {/* Where the recommendation comes from */}
          <div
            style={{
              marginTop: 14,
              border: "1px solid " + BORDER,
              borderRadius: 16,
              padding: "14px 15px",
            }}
          >
            <div style={{ fontSize: 12.5, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
              Where this number comes from
            </div>
            <Row k="Your BMR, at rest" v={BMR.toLocaleString() + " kcal"} />
            <Row k={ACTIVITY.label + " (x" + ACTIVITY.factor + ")"} v={TDEE.toLocaleString() + " kcal"} />
            <Row k={"Your goal, " + goal.label.toLowerCase()} v={goal.kcal.toLocaleString() + " kcal"} />
            <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.55, marginTop: 10 }}>
              Our coaches use the Harris-Benedict equation to estimate your basal metabolic rate,
              which is what your body burns doing nothing at all. Multiply that by how much you move
              and you get what a day actually costs you. Your goal then sits above or below it.
            </div>
          </div>

          {locked && (
            <div
              style={{
                marginTop: 14,
                display: "flex",
                gap: 10,
                background: BG_ALT,
                border: "1px solid " + TEXT,
                borderRadius: 14,
                padding: "13px 14px",
              }}
            >
              <Lock size={15} color={TEXT} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 11.5, color: TEXT, lineHeight: 1.55 }}>
                Manya Jain, your success coach, set this after your consultation on 14 Aug. If it
                does not feel right, message them and they can change it.
              </span>
            </div>
          )}
        </div>

        <div style={{ flexShrink: 0, padding: "12px 22px 24px", borderTop: "1px solid " + BORDER }}>
          <Cta onClick={() => setSuffSheet(null)}>Done</Cta>
        </div>
      </div>
    </div>
  );
}

function Box({ label, value, strong }) {
  return (
    <div
      style={{
        flex: 1,
        background: BG,
        border: "1px solid " + (strong ? TEXT : BORDER),
        borderRadius: 12,
        padding: "10px 12px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 10, color: MUTED }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginTop: 3 }}>{value}</div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
      <span style={{ fontSize: 11.5, color: MUTED }}>{k}</span>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: TEXT }}>{v}</span>
    </div>
  );
}
