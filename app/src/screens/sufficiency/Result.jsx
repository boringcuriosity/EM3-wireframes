import React from "react";
import { useWF } from "../../state";
import { GREEN, TEXT, MUTED, BG, BG_ALT, BORDER } from "../../tokens";
import { FlowScreen, Cta, Eyebrow, KairaMark, HexScore, NutrientRing } from "./parts";
import { NUTRIENTS, GOALS, targetsFor, BEFORE, AFTER, PAYOFFS } from "./data";

/* Step four, in two versions. Before the add-ons the upside is blurred, because
   a number you have not earned yet should look like a promise, not a fact.
   After them the same screen shows what moved and hands over to real logging. */
export default function Result({ lifted }) {
  const { setSuffFlow, setSuffLift, setEatDetail, setSuffDone, suffAddons, suffGoal, suffKcal } = useWF();
  // Rings measure against whatever targets the user just set two steps ago.
  const goal = GOALS.find((g) => g.id === suffGoal) || GOALS[0];
  const TARGETS = targetsFor(suffGoal, suffKcal ?? goal.kcal);
  const now = lifted ? AFTER : BEFORE;

  const rings = NUTRIENTS.map((n) => {
    const t = TARGETS.find((x) => x.id === n.id);
    const have = now[n.id];
    return {
      ...n,
      have,
      target: t.target,
      pct: Math.round((have / t.target) * 100),
      delta: lifted ? AFTER[n.id] - BEFORE[n.id] : 0,
    };
  });

  return (
    <FlowScreen
      step="result"
      onBack={lifted ? undefined : () => setSuffFlow("meals")}
      footer={
        lifted ? (
          <Cta
            onClick={() => {
              // ponytail: hands off to the food logging flow. Until that flow
              // exists this lands on Eat, where the meal divisions live.
              setSuffDone(true);
              setSuffFlow(null);
              setEatDetail(true);
            }}
          >
            Log your first meal
          </Cta>
        ) : (
          <Cta onClick={() => setSuffLift(true)}>Let's try it out</Cta>
        )
      }
    >
      {/* The score */}
      <div
        style={{
          padding: "6px 22px 24px",
          background: BG_ALT,
          borderBottom: "1px solid " + BORDER,
          textAlign: "center",
        }}
      >
        <Eyebrow>{lifted ? "YOUR USUAL DAY, LIFTED" : "YOUR USUAL DAY"}</Eyebrow>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <HexScore value={now.score} />
        </div>

        {lifted ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: GREEN,
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 11.5,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            Up {AFTER.score - BEFORE.score} points, from {BEFORE.score}%
          </span>
        ) : (
          <span
            style={{
              display: "inline-block",
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 11,
              fontWeight: 700,
              color: MUTED,
              letterSpacing: 0.6,
            }}
          >
            SCOPE TO IMPROVE
          </span>
        )}

        <div style={{ display: "flex", gap: 4, marginTop: 20 }}>
          {rings.map((r) => (
            <NutrientRing key={r.id} {...r} tone={r.tone} />
          ))}
        </div>
      </div>

      {/* Kaira */}
      <div style={{ padding: "20px 22px 24px" }}>
        <div style={{ display: "flex", gap: 11 }}>
          <KairaMark size={24} />
          <div style={{ flex: 1, minWidth: 0 }}>
            {lifted ? (
              <>
                <p style={pStyle}>
                  There it is. A few small add-ons took your usual day from {BEFORE.score}% to{" "}
                  <strong style={{ color: TEXT }}>{AFTER.score}%</strong>, and nothing was taken
                  away. Same poha, same biryani.
                </p>
                <p style={{ ...pStyle, marginTop: 12 }}>
                  This is not a one time fix. Sufficiency moves with what you eat each day, and it
                  takes a few weeks of real meals before the picture is properly yours.
                </p>
                <p style={{ ...pStyle, marginTop: 12 }}>
                  From there I can tune it towards your goal instead of a general target, and your
                  coach can see the same thing I do.
                </p>
              </>
            ) : (
              <>
                <p style={pStyle}>
                  I want to work on this with you. Your usual day sits at{" "}
                  <strong style={{ color: TEXT }}>{BEFORE.score}%</strong>. Protein and fibre are
                  where it falls short, and both are easy to fix.
                </p>
                <p style={{ ...pStyle, marginTop: 12 }}>
                  Add a couple of small things and I can take you to
                </p>
              </>
            )}
          </div>
        </div>

        {/* The upside, blurred until it is earned */}
        {!lifted && (
          <div
            style={{
              margin: "14px 0 4px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ position: "relative" }}>
              <HexScore value={AFTER.score} size={92} caption="POSSIBLE" blurred />
            </div>
            <span style={{ fontSize: 11, color: MUTED }}>Tap below to unblur it</span>
          </div>
        )}

        {!lifted && (
          <>
            <div style={{ marginTop: 20 }}>
              <Eyebrow>WHICH WOULD GIVE YOU</Eyebrow>
              {PAYOFFS.map((p) => (
                <div
                  key={p.title}
                  style={{
                    background: BG,
                    border: "1px solid " + BORDER,
                    borderRadius: 14,
                    padding: "12px 14px",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>{p.title}</div>
                  <div style={{ fontSize: 11.5, color: MUTED, marginTop: 3, lineHeight: 1.5 }}>
                    {p.line}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {lifted && suffAddons.length > 0 && (
          <div
            style={{
              marginTop: 16,
              background: BG_ALT,
              border: "1px solid " + BORDER,
              borderRadius: 14,
              padding: "13px 14px",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 0.8 }}>
              WHAT YOU ADDED
            </div>
            {suffAddons.map((a) => (
              <div key={a} style={{ fontSize: 12, color: TEXT, marginTop: 7 }}>
                {a}
              </div>
            ))}
          </div>
        )}

        {lifted && (
          <div
            style={{
              marginTop: 16,
              background: BG,
              border: "1px solid " + TEXT,
              borderRadius: 14,
              padding: "13px 14px",
              fontSize: 12.5,
              color: TEXT,
              lineHeight: 1.55,
              fontWeight: 600,
            }}
          >
            Your score appears the moment you log your first meal, and it climbs as the rest of the day goes in. Log everything you eat and it ends up a true read of your day.
          </div>
        )}
      </div>
    </FlowScreen>
  );
}

const pStyle = { margin: 0, fontSize: 12.5, color: MUTED, lineHeight: 1.6 };
