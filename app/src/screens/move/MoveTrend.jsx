import React from "react";
import { useWF } from "../../state";
import { WeekPicker, KairaRead, StatRow, TrendWaiting, DAYS } from "../../components/TrendShell";
import { Footprints } from "lucide-react";
import { MOVE_C, MOVE_T, TEXT, MUTED, BG, BORDER, LINE, SH, SH_SM } from "../../tokens";

/* Move, read across a week.

   The question Move has to answer is how much and how often, so the chart is
   minutes a day against the target, and the row under it is the same week read
   as steps. Days with nothing in them stay visible as gaps, because a week
   with three holes in it is the finding. */

const WEEKS = {
  week: {
    mins: [22, 0, 35, 0, 45, 30, 0],
    steps: [6200, 3100, 8800, 2400, 11200, 9400, 3900],
    head: "Your movement comes in bursts rather than most days.",
    body: "Four days out of seven, and the three quiet ones sit together in the middle of the week. Your body reads a steady twenty minutes better than one long session, so the gap is worth closing before the minutes are.",
  },
  weeks: {
    mins: [30, 25, 35, 20, 45, 30, 25],
    steps: [8100, 7400, 9200, 6800, 11400, 9900, 7600],
    head: "You have moved on six of the last seven days.",
    body: "The gaps from last week are gone and the minutes are steadier than they were. Nothing here needs changing. Hold this shape for another week and your coach will start building on it.",
  },
};

const GOAL = 20;

export default function MoveTrend() {
  const { moveWeek, setMoveTab, setLogExOpen } = useWF();

  if (moveWeek === "none" || moveWeek === "few") {
    const days = moveWeek === "few" ? 2 : 0;
    return (
      <TrendWaiting
        pillar="move"
        days={days}
        head={days ? "Your week is still filling in." : "Your week has not started yet."}
        line={
          days
            ? "Two days in. A couple more and I can tell whether the gaps are the problem or the minutes are."
            : "Log a walk, a session, anything. On Sunday I read the week back to you: how often you moved, and the one thing worth changing."
        }
        note="A day counts once anything is logged in it, a walk to the shop included."
        cta="Log something you did"
        onCta={() => { setMoveTab("today"); setLogExOpen(true); }}
      />
    );
  }

  const w = WEEKS[moveWeek] || WEEKS.week;
  const active = w.mins.filter((m) => m > 0).length;
  const total = w.mins.reduce((a, b) => a + b, 0);
  const best = Math.max(...w.mins);
  const top = Math.max(50, best);
  const twoWeeks = moveWeek === "weeks";

  return (
    <div>
      <WeekPicker back label={twoWeeks ? "This week" : "This week"} />

      <KairaRead head={w.head} body={w.body} />

      {/* Minutes a day against the target. The target line is what makes a
          short day read as short. */}
      <div style={{ background: BG, border: "1px solid " + BORDER, borderRadius: 18, padding: "16px 16px 14px", boxShadow: SH }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Minutes moved</span>
          <span style={{ fontSize: 10.5, color: MUTED }}>Target {GOAL} a day</span>
        </div>

        <div style={{ position: "relative", height: 96, marginTop: 14 }}>
          {/* The target, drawn once across the week. */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              // Same scale the bars use, or the target sits at the wrong height.
              bottom: (GOAL / top) * 78,
              borderTop: "1.5px dashed " + MOVE_C + "66",
            }}
          />
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: "100%" }}>
            {w.mins.map((m, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                {m > 0 && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: MOVE_C, marginBottom: 3 }}>{m}</span>
                )}
                <div
                  style={{
                    width: "100%",
                    height: m > 0 ? Math.max(6, (m / top) * 78) : 6,
                    borderRadius: 6,
                    background: m > 0 ? MOVE_C : "transparent",
                    border: m > 0 ? "none" : "1.5px dashed " + BORDER,
                    opacity: m >= GOAL ? 1 : m > 0 ? 0.55 : 1,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 7 }}>
          {DAYS.map((d, i) => (
            <span key={i} style={{ flex: 1, textAlign: "center", fontSize: 11, color: w.mins[i] ? TEXT : MUTED }}>
              {d}
            </span>
          ))}
        </div>

        {/* The same week as steps, which move on days no session was logged. */}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid " + LINE }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
            <Footprints size={13} color={MOVE_C} strokeWidth={2.2} />
            <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: TEXT }}>Steps</span>
            <span style={{ fontSize: 10.5, color: MUTED }}>
              {Math.round(w.steps.reduce((a, b) => a + b, 0) / 7 / 100) / 10}k a day
            </span>
          </div>
          <div style={{ display: "flex", gap: 4, height: 26 }}>
            {w.steps.map((s, i) => (
              <div key={i} style={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
                <div
                  style={{
                    width: "100%",
                    height: Math.max(4, (s / 12000) * 26),
                    borderRadius: 4,
                    background: MOVE_T,
                    borderBottom: "2px solid " + MOVE_C,
                    opacity: s >= 10000 ? 1 : 0.7,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <StatRow
        pillar="move"
        stats={[
          { label: "Active days", value: active + " of 7", delta: twoWeeks ? "+2" : "Same as last week", up: twoWeeks },
          { label: "Total minutes", value: total, delta: twoWeeks ? "+78" : "+12", up: true },
          { label: "Longest", value: best + " min", delta: twoWeeks ? "Friday" : "Friday" },
        ]}
      />

      {/* What to do about it. A read with no next step is a report. */}
      <div
        style={{
          marginTop: 14,
          background: MOVE_T,
          border: "1px solid " + MOVE_C + "33",
          borderRadius: 16,
          padding: "13px 15px",
          boxShadow: SH_SM,
        }}
      >
        <div style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>
          {twoWeeks ? "Keep this shape" : "One change for next week"}
        </div>
        <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginTop: 4 }}>
          {twoWeeks
            ? "Nothing to fix. Your coach will add a little length once this holds for another week."
            : "Put twenty minutes on one of the quiet days. Tuesday is the easiest one to reach, since nothing else sits in it."}
        </div>
      </div>

      <div style={{ height: 8 }} />
    </div>
  );
}
