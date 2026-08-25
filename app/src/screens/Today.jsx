import React, { useRef } from "react";
import { useWF } from "../state";
import { ChevronRight, Calendar } from "lucide-react";
import PillarTaskCard from "../components/PillarTaskCard";
import StreakFlame from "../components/StreakFlame";
import StreakWonCard from "../components/StreakWonCard";
import PlanStrip from "../components/PlanStrip";
import TrackHero from "../components/TrackHero";
import { GREEN, TEXT, MUTED, BG_ALT, BG, BORDER, GOLD, GOLD_TINT, GOLD_LINE, GOLD_DEEP, SH_SM, GREEN_DEEP } from "../tokens";
import CtaArrow from "../components/CtaArrow";
import Em3Explainer from "../components/Em3Explainer";

const PILLAR_NAME = { eat: "Eat", move: "Move", mind: "Mind", measure: "Measure" };

/* The strip exists to say a plan has not landed yet. Once it has, there is
   nothing left to wait for and it goes. Mind and Measure carry no coach plan,
   so they never had one. */
const PLAN_STRIP = {
  eat: { waiting: (w) => w.kcalSource !== "coach", label: "Your diet plan is yet to be assigned" },
  move: { waiting: (w) => !w.movePlan, label: "Your exercise plan is yet to be assigned" },
};

export default function TrackPage() {
  const { setEatDetail, setActiveTab, dailyState, dailyPillars, dailyRepeating,
          dailyDoneCount, dayFraction, dayComplete, streakShown, streakState, setStreakOpen,
          flipcoins, setMoveDetail,
          isPaid, kcalSource, movePlan, setPlanInfo, heroState } = useWF();
  // The coach card's only action is "the tasks are down there", so it needs
  // somewhere to point at.
  const focusRef = useRef(null);

  return (
    (
      (() => {
        // No-data vs has-data across the whole Today page, driven by dailyState.
        return (
      <div style={{ padding: "14px 22px 28px" }}>
        {/* Top row: Flipcoins on the left, the day on the right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: GOLD_DEEP,
              border: "1px solid " + GOLD_LINE,
              borderRadius: 999,
              padding: "5px 12px",
              background: GOLD_TINT,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                background: GOLD,
                clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                display: "inline-block",
              }}
            />
            {flipcoins}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 13,
              fontWeight: 600,
              color: TEXT,
              border: "1px solid " + BORDER,
              borderRadius: 999,
              padding: "5px 14px",
              background: BG,
            }}
          >
            <span style={{ cursor: "pointer" }}>‹</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Calendar size={14} color={TEXT} strokeWidth={2} />
              Today
            </span>
            <span style={{ color: BORDER }}>›</span>
          </div>
          {/* The streak, where the eye already goes at the end of the header */}
          <button
            onClick={() => setStreakOpen("guide")}
            aria-label={"Streak, " + streakShown + " days. See how streaks work"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              border: "1px solid " + (dayComplete ? GOLD_LINE : BORDER),
              background: dayComplete ? GOLD_TINT : BG,
              borderRadius: 999,
              padding: "5px 11px 5px 8px",
              fontSize: 13,
              fontWeight: 700,
              color: dayComplete ? GOLD_DEEP : TEXT,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <StreakFlame size={16} fraction={streakState === "broken" ? 0 : dayFraction} outline={false} />
            {streakShown}
          </button>
        </div>

        <TrackHero
          state={heroState}
          onSeeTasks={() => focusRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        />

        {/* Today's focus — same four pillars, same data as the Home carousel.
            Each pillar shows its action card always, and its secondary card
            only once that pillar has something logged. A first-time user sees
            four asks and nothing else. */}
        <div ref={focusRef} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14, scrollMarginTop: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1 }}>
            TODAY'S FOCUS
          </span>
          {/* The count, with the day's flame filling beside it. Same number,
              two readings: one exact, one you can take in at a glance. */}
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: MUTED }}>
            <StreakFlame size={22} fraction={dayFraction} />
            {dailyDoneCount + " of " + dailyRepeating.length}
          </span>
        </div>

        {dayComplete && (
          <div style={{ marginBottom: 22 }}>
            <StreakWonCard fullWidth />
          </div>
        )}

        {dailyPillars.map((p, i, arr) => {
          const filled = p.fill[dailyState];
          /* Tapping a card here opens the pillar it belongs to. Ticking it
             off in one tap is Home's job; this screen is where the work
             actually happens. Mind has no screen of its own yet, so its card
             still completes rather than going nowhere. */
          /* One header per pillar, not per task: Measure can carry two device
             syncs and they belong under one heading. */
          const pid = p.pillar || p.id;
          const firstOfPillar = i === 0 || (arr[i - 1].pillar || arr[i - 1].id) !== pid;
          const go = p.id === "eat" ? () => setEatDetail(true)
                   : p.id === "move" ? () => setMoveDetail(true)
                   : pid === "measure" ? () => setActiveTab("med")
                   : undefined;
          return (
            <div key={p.id} style={{ marginBottom: firstOfPillar && arr[i + 1] && (arr[i + 1].pillar || arr[i + 1].id) === pid ? 10 : 22 }}>
              {/* Pillar header. The chevron only appears where there is
                  somewhere to go, so no tap is a dead end. */}
              {firstOfPillar && (
              <div
                onClick={go || undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  cursor: go ? "pointer" : "default",
                }}
              >
                {/* Name only. The card directly below already carries the
                    pillar's icon, so a second one is decoration. */}
                <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 600, color: TEXT }}>
                  {PILLAR_NAME[pid]}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {p.checks > 1 && (
                    <span style={{ fontSize: 11.5, color: MUTED }}>
                      {filled} of {p.checks}
                    </span>
                  )}
                  {go && <ChevronRight size={18} color={MUTED} />}
                </span>
              </div>
              )}

              <div style={{ position: "relative", zIndex: 1 }}>
                <PillarTaskCard pillar={p} fullWidth onClick={go} />
              </div>

              {/* Only while a program user is still waiting on this pillar's
                  plan. Once it is written the strip has nothing to say. */}
              {isPaid && PLAN_STRIP[p.id]?.waiting({ kcalSource, movePlan }) && (
                <PlanStrip label={PLAN_STRIP[p.id].label} onInfo={() => setPlanInfo(p.id)} />
              )}

            </div>
          );
        })}


        {/* Quick values */}
        <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1, marginBottom: 12 }}>
          QUICK VALUES
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { v: "74.2", u: "kg", l: "WEIGHT", plus: true },
            { v: "3", u: "/8", l: "WATER", plus: true },
          ].map((q) => (
            <div
              key={q.l}
              style={{
                flex: 1,
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 14,
                padding: 12,
                boxShadow: SH_SM,
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: BG_ALT,
                    border: "1px solid " + BORDER,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    color: GREEN,
                    fontWeight: 700,
                  }}
                >
                  {q.plus ? "+" : "›"}
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>
                  {q.v}
                </span>
                <span style={{ fontSize: 11, color: MUTED }}>{q.u}</span>
              </div>
              <div style={{ fontSize: 10, color: MUTED, letterSpacing: 0.5, marginTop: 2 }}>{q.l}</div>
            </div>
          ))}
        </div>
      </div>
        );
      })()
    )
  );
}

export function TodayFtux() {
  const { onbFinish } = useWF();

  /* First run on the To-do tab. Same explainer as the onboarding takeover,
     because a user who reaches EM3 from here should be told the same thing in
     the same way as one who reached it from Home. */
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px 0", minHeight: 0 }}>
        <Em3Explainer />
      </div>
      <div style={{ flexShrink: 0, padding: "12px 22px", borderTop: "1px solid " + BORDER, background: BG }}>
        <button
          onClick={onbFinish}
          style={{
            width: "100%",
            background: GREEN,
            border: "none",
            borderRadius: 14,
            padding: "15px 0",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 2px 0 " + GREEN_DEEP,
          }}
        >
          Take me to my day
          <CtaArrow size={16} />
        </button>
      </div>
    </div>
  );
}
