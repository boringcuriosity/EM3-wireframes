import React from "react";
import { useWF } from "../../state";
import { WeekPicker, KairaRead, StatRow, TrendWaiting, DAYS } from "../../components/TrendShell";
import { Moon } from "lucide-react";
import { MIND_C, MIND_T, TEXT, MUTED, FAINT, BG, BORDER, LINE, SH, SH_SM } from "../../tokens";

/* Mind, read across a week.

   Move is about how much. Mind is about when. Seven hours starting at eleven
   one night and half past one the next is a body with no clock, and no bar
   chart of hours will ever show that. So the length of each night is the top
   chart and the hour it started is the one underneath, drawn as a rhythm you
   can see the wobble in. */

/* Minutes asleep, and the hour the night started, as minutes past 9pm. */
const WEEKS = {
  week: {
    mins: [388, 402, 350, 0, 431, 396, 470],
    start: [95, 140, 210, null, 80, 165, 45],
    head: "Your nights are long enough, but they move around.",
    body: "You are averaging close to six and a half hours, which is fine. What moves is when they start: Wednesday began two and a half hours later than Sunday. Your body clock reads the timing more than the total.",
  },
  weeks: {
    mins: [402, 410, 395, 420, 431, 415, 408],
    start: [70, 85, 75, 90, 80, 95, 70],
    head: "Your nights have settled into a rhythm.",
    body: "Seven nights, all starting within half an hour of each other, all close to seven hours. This is the part that shifts glucose overnight, and it is the hardest one to build. Nothing to change.",
  },
};

const GOAL = 420;

const hhmm = (m) => Math.floor(m / 60) + "h " + String(m % 60).padStart(2, "0") + "m";
/* Floor, not round. Rounding 165 minutes up to three hours and then printing
   the leftover 45 gives "3h 45m" for a two and three quarter hour spread. */
const spread = (m) => (m < 60 ? m + "m" : Math.floor(m / 60) + "h " + (m % 60 ? (m % 60) + "m" : ""));
const clockOf = (m) => {
  const t = 21 * 60 + m;
  const h = Math.floor(t / 60) % 24;
  const mm = String(t % 60).padStart(2, "0");
  return (h % 12 || 12) + ":" + mm + (h < 12 ? " AM" : " PM");
};

export default function MindTrend() {
  const { mindWeek, setMindTab, setLogSleepOpen } = useWF();

  if (mindWeek === "none" || mindWeek === "few") {
    const days = mindWeek === "few" ? 2 : 0;
    return (
      <TrendWaiting
        pillar="mind"
        days={days}
        head={days ? "Your week is still filling in." : "Your week has not started yet."}
        line={
          days
            ? "Two nights in. A couple more and I can tell whether it is the length or the timing that needs work."
            : "Log your sleep each morning and this fills in. On Sunday I read the week back to you: how long your nights ran, and when they started."
        }
        note="A night counts once its hours are in, however they got there."
        cta="Log last night"
        onCta={() => { setMindTab("today"); setLogSleepOpen(true); }}
      />
    );
  }

  const w = WEEKS[mindWeek] || WEEKS.week;
  const nights = w.mins.filter(Boolean);
  const avg = Math.round(nights.reduce((a, b) => a + b, 0) / nights.length);
  const starts = w.start.filter((s) => s !== null);
  const swing = Math.max(...starts) - Math.min(...starts);
  const top = Math.max(GOAL + 60, ...w.mins);
  const steady = mindWeek === "weeks";

  return (
    <div>
      <WeekPicker back />

      <KairaRead head={w.head} body={w.body} />

      <div style={{ background: BG, border: "1px solid " + BORDER, borderRadius: 18, padding: "16px 16px 14px", boxShadow: SH }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Hours slept</span>
          <span style={{ fontSize: 10.5, color: MUTED }}>Target 7h</span>
        </div>

        <div style={{ position: "relative", height: 96, marginTop: 14 }}>
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              // Same scale the bars use, or the target sits at the wrong height.
              bottom: (GOAL / top) * 78,
              borderTop: "1.5px dashed " + MIND_C + "66",
            }}
          />
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: "100%" }}>
            {w.mins.map((m, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                {m > 0 && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: MIND_C, marginBottom: 3 }}>
                    {Math.round((m / 60) * 10) / 10}
                  </span>
                )}
                <div
                  style={{
                    width: "100%",
                    height: m > 0 ? Math.max(6, (m / top) * 78) : 6,
                    borderRadius: 6,
                    background: m > 0 ? MIND_C : "transparent",
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

        {/* When each night began. The wobble is the point, so the dots sit on
            one track and the spread between them is drawn as a band. */}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid " + LINE }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
            <Moon size={13} color={MIND_C} strokeWidth={2.2} />
            <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: TEXT }}>When the night started</span>
            <span style={{ fontSize: 10.5, color: MUTED }}>
              {swing < 45 ? "Steady" : spread(swing) + " swing"}
            </span>
          </div>

          <div style={{ position: "relative", height: 44 }}>
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 20,
                height: 2,
                borderRadius: 1,
                background: LINE,
              }}
            />
            {/* The band the nights actually fall in. Narrow reads as rhythm. */}
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 20 - (swing / 240) * 16,
                height: 2 + (swing / 240) * 32,
                borderRadius: 8,
                background: MIND_T,
              }}
            />
            <div style={{ position: "absolute", inset: 0, display: "flex", gap: 8 }}>
              {w.start.map((s, i) => (
                <div key={i} style={{ flex: 1, position: "relative" }}>
                  {s !== null && (
                    <>
                      <span
                        style={{
                          position: "absolute",
                          left: "50%",
                          top: 20 - ((s - starts.reduce((a, b) => a + b, 0) / starts.length) / 240) * 32,
                          transform: "translate(-50%, -50%)",
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          background: MIND_C,
                          border: "2px solid " + BG,
                          boxShadow: "0 0 0 1.5px " + MIND_C,
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          left: "50%",
                          bottom: -2,
                          transform: "translateX(-50%)",
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 8,
                          color: FAINT,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {clockOf(s).replace(":00", "").replace(" ", "")}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <StatRow
        pillar="mind"
        stats={[
          { label: "Average night", value: hhmm(avg), delta: steady ? "+22m" : "Same", up: steady },
          { label: "Nights logged", value: nights.length + " of 7", delta: steady ? "+1" : null, up: steady },
          {
            label: "Bed time swing",
            value: spread(swing),
            delta: steady ? "Tighter" : "Wide",
            up: steady,
          },
        ]}
      />

      <div
        style={{
          marginTop: 14,
          background: MIND_T,
          border: "1px solid " + MIND_C + "33",
          borderRadius: 16,
          padding: "13px 15px",
          boxShadow: SH_SM,
        }}
      >
        <div style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>
          {steady ? "Keep this rhythm" : "One change for next week"}
        </div>
        <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginTop: 4 }}>
          {steady
            ? "Your nights are landing within half an hour of each other. That steadiness is doing more for your glucose than an extra hour would."
            : "Pick one bed time and hold it for five nights, even on the late days. The hours will follow the timing."}
        </div>
      </div>

      <div style={{ height: 8 }} />
    </div>
  );
}
