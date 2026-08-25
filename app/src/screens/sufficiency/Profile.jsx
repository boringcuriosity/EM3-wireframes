import React from "react";
import { useWF } from "../../state";
import { ArrowDown, Eye, Pencil, Lock, Check, Clock } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BG_ALT, BORDER } from "../../tokens";
import { FlowScreen, Cta, Eyebrow, KairaMark, Title } from "./parts";
import { PROFILE, GOALS, BMR, TDEE, ACTIVITY, targetsFor } from "./data";

/* Step two. Four facts about you become a calorie target, and that target
   becomes four macro targets that add up to it. Every number on this screen is
   derived from the one above it, so nothing has to be taken on faith. */
export default function Profile() {
  const {
    setSuffFlow, setSuffSheet, userName, suffGoal, setSuffGoal, suffKcal, setSuffKcal,
    kcalSource, isPaid, suffEdit, setSuffEdit, setEatDetail,
  } = useWF();

  const name = (userName || "").trim().split(" ")[0];
  const goal = GOALS.find((g) => g.id === suffGoal) || GOALS[0];
  const kcal = suffKcal ?? goal.kcal;
  const targets = targetsFor(suffGoal, kcal);
  // Only a program user can have a coach owning the number.
  const source = isPaid ? kcalSource : "you";

  // Editing from the info sheet returns to Eat rather than walking on.
  const close = () => {
    setSuffEdit(false);
    setSuffFlow(null);
    setEatDetail(true);
  };

  const pickGoal = (id) => {
    setSuffGoal(id);
    setSuffKcal(null); // back to that goal's own recommendation
  };

  return (
    <FlowScreen
      step="profile"
      onBack={() => (suffEdit ? close() : setSuffFlow("learn"))}
      footer={
        <Cta onClick={() => (suffEdit ? close() : setSuffFlow("meals"))}>
          {suffEdit ? "Save my targets" : "This looks good"}
        </Cta>
      }
    >
      <div style={{ padding: "0 22px 20px" }}>
        <Title sub="Enough is not the same number for everyone. Yours comes from your body, not an average.">
          {name ? name + ", I already" : "I already"}
          <br />
          know a few things.
        </Title>
      </div>

      {/* What we know */}
      <div style={{ padding: "0 22px" }}>
        <Eyebrow>FROM YOUR SIGN UP</Eyebrow>
        <div style={{ background: BG, border: "1px solid " + BORDER, borderRadius: 16, overflow: "hidden" }}>
          {PROFILE.map((p, i) => (
            <div
              key={p.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                borderTop: i === 0 ? "none" : "1px solid " + BORDER,
              }}
            >
              <span style={{ fontSize: 12.5, color: MUTED }}>{p.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{p.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "16px 0" }}>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: BG_ALT,
            border: "1px solid " + BORDER,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowDown size={15} color={MUTED} />
        </span>
        <span style={{ fontSize: 11, color: MUTED }}>so your daily targets are</span>
      </div>

      {/* Calories, then the macros that make them up */}
      <div style={{ padding: "0 22px 4px" }}>
        <div
          style={{
            background: BG_ALT,
            border: "1px solid " + BORDER,
            borderRadius: 16,
            padding: "13px 15px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: MUTED }}>Daily calories</div>
            <div style={{ fontSize: 21, fontWeight: 800, color: TEXT, marginTop: 2, letterSpacing: -0.4 }}>
              {kcal.toLocaleString()}
              <span style={{ fontSize: 12, fontWeight: 700, color: MUTED }}> kcal</span>
            </div>
          </div>

          {source === "coach" ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 999,
                padding: "6px 12px",
                fontSize: 11.5,
                fontWeight: 700,
                color: MUTED,
                flexShrink: 0,
              }}
            >
              <Lock size={12} color={MUTED} /> Set by coach
            </span>
          ) : (
            <button
              onClick={() => setSuffSheet("kcal")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: BG,
                border: "1px solid " + TEXT,
                borderRadius: 999,
                padding: "6px 13px",
                fontSize: 11.5,
                fontWeight: 700,
                color: TEXT,
                cursor: "pointer",
                flexShrink: 0,
                fontFamily: "inherit",
              }}
            >
              <Pencil size={12} color={TEXT} /> Edit
            </button>
          )}
        </div>

        {/* Who owns this number */}
        {source !== "you" && (
          <div
            style={{
              marginTop: 8,
              display: "flex",
              gap: 9,
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 13,
              padding: "11px 13px",
            }}
          >
            {source === "coach" ? (
              <Check size={14} color={GREEN} strokeWidth={3} style={{ flexShrink: 0, marginTop: 1 }} />
            ) : (
              <Clock size={14} color={MUTED} style={{ flexShrink: 0, marginTop: 1 }} />
            )}
            <span style={{ fontSize: 11, color: MUTED, lineHeight: 1.55 }}>
              {source === "coach" ? (
                <>
                  Manya Jain, your success coach, set this after your consultation on 14 Aug. It
                  stays fixed so your plan and your logging agree. Message them if it needs a change.
                </>
              ) : (
                <>
                  You are on a care program, so your coach will set this properly after your first
                  consultation. Until then this is my estimate and you can adjust it.
                </>
              )}
            </span>
          </div>
        )}

        {/* Macro tiles */}
        <div style={{ display: "flex", gap: 7, marginTop: 12 }}>
          {targets.map((t) => (
            <button
              key={t.id}
              onClick={() => setSuffSheet(t.id)}
              aria-label={"What " + t.label + " does"}
              style={{
                flex: 1,
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 14,
                padding: "11px 4px 12px",
                textAlign: "center",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: MUTED,
                }}
              >
                {t.label} <Eye size={11} color={MUTED} />
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 18,
                  fontWeight: 800,
                  color: TEXT,
                  marginTop: 5,
                  lineHeight: 1,
                }}
              >
                {t.target}
                <span style={{ fontSize: 10, fontWeight: 700, color: MUTED }}>{t.unit}</span>
              </span>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 10.5, color: MUTED, marginTop: 8, lineHeight: 1.5 }}>
          Tap the eye on any one to see what it does. These four add up to your calorie target.
        </div>
      </div>

      {/* Goal */}
      <div style={{ padding: "22px 22px 4px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Your goal</div>
        <div style={{ fontSize: 11.5, color: MUTED, marginTop: 3, marginBottom: 12, lineHeight: 1.5 }}>
          This retunes the four targets above, and the calories that go with them.
        </div>

        {GOALS.map((g) => {
          const on = g.id === suffGoal;
          return (
            <button
              key={g.id}
              onClick={() => pickGoal(g.id)}
              aria-pressed={on}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                textAlign: "left",
                background: on ? BG_ALT : BG,
                border: "1.5px solid " + (on ? GREEN : BORDER),
                borderRadius: 14,
                padding: "12px 14px",
                marginBottom: 9,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "border-color .15s, background .15s",
              }}
            >
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: TEXT }}>
                  {g.label}
                </span>
                <span style={{ display: "block", fontSize: 11.5, color: MUTED, marginTop: 2 }}>
                  {g.line}
                </span>
              </span>
              <span style={{ fontSize: 11, color: MUTED, flexShrink: 0 }}>
                {g.kcal.toLocaleString()}
              </span>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: on ? GREEN : BG,
                  border: "1px solid " + (on ? GREEN : BORDER),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {on && <Check size={12} color="#fff" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kaira explains the method */}
      <div style={{ padding: "12px 22px 24px" }}>
        <div
          style={{
            display: "flex",
            gap: 11,
            background: BG_ALT,
            border: "1px solid " + BORDER,
            borderRadius: 14,
            padding: "13px 14px",
          }}
        >
          <KairaMark size={22} />
          <span style={{ fontSize: 12, color: TEXT, lineHeight: 1.6 }}>
            Our coaches work this out with the Harris-Benedict equation. It estimates your basal
            metabolic rate, roughly {BMR.toLocaleString()} kcal for you, which is what your body
            burns doing nothing at all. Being {ACTIVITY.label.toLowerCase()} takes a full day to
            about {TDEE.toLocaleString()} kcal, and your goal sits above or below that.
          </span>
        </div>
      </div>
    </FlowScreen>
  );
}
