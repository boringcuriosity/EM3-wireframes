import React, { useRef, useEffect } from "react";
import { useWF } from "../state";
import { ChevronRight, ChevronLeft, Utensils, TrendingUp, Gift, Check, Stethoscope, BookOpen, MoreVertical } from "lucide-react";
import { GREEN, TEXT, MUTED, BG_ALT, BG, BORDER, RULE, LINE, PILLAR, SH, SH_SM } from "../tokens";
import LogMealPrompt from "../components/LogMealPrompt";
import CaloriesStrip from "../components/CaloriesStrip";
import LogWithoutJudgementCard from "../components/LogWithoutJudgementCard";
import { PILLAR_SCIENCE } from "./pillarScience";
import { byId, qtyLabel } from "./log/foods";
import SufficiencyCard from "./log/SufficiencyCard";
import CtaArrow from "../components/CtaArrow";
import ArticleList from "../components/ArticleList";

const EAT_ARTICLES = [
  { title: "Eating Smart: Your Guide to Balanced Nutrition for Weight…", meta: "1 min read . 21 Mar 26" },
  { title: "Is Ragi Good for Diabetes? A Simple Guide to This Powerfu…", meta: "7 min read . 07 Jan 26" },
  { title: "Is Jackfruit Good for Diabetes? The Complete Indian Guide t…", meta: "10 min read . 02 Jan 26" },
  { title: "Drink Smart, Stay Balanced: How Steady Hydration Keeps…", meta: "8 min read . 24 Dec 25" },
  { title: "Fasting & Gut Reset: How a Simple 16-Hour Pause Can R…", meta: "6 min read . 18 Dec 25" },
];

// Where the plus on each division drops you on the clock.
const DIVISION_TIME = {
  prebreakfast: 6 * 60 + 30, breakfast: 8 * 60 + 30, lunch: 13 * 60 + 30,
  eveningsnack: 17 * 60 + 30, dinner: 20 * 60 + 30, bedtime: 22 * 60 + 30,
};

export default function EatDetailPage() {
  const { setEatDetail, eatState, eatTab, setEatTab, eatDivisions, kcalTarget, setLogOpen, setLogTime, mealsLogged, hasTargets, dayTotals, planAssigned, setLogItems, setMealItem, eatFocus, setEatFocus, planOption, setPlanOption, dayTicks, toggleTick } = useWF();

  /* Every route into the logger goes through here. If targets are not set up
     and the pitch has not been seen, it gets made once, first. */
  /* Straight to the logger. There used to be a sheet in front of a first log
     asking the user to set their targets up first, which is the wrong ask for
     a program user whose coach sets them, and a second ask for everyone else
     when the card above already offers it. */
  const openLog = (atMins) => {
    if (atMins !== undefined) setLogTime(atMins);
    setLogOpen(true);
  };


  // Which of the coach's options is showing, per meal. Switching is a read,
  // not a commitment, so it lives here rather than in shared state.
  /* A meal row on the To-do screen sends you here for one meal in particular.
     Landing at the top of the day and hunting for it is the thing the tap was
     meant to save, so the division it named scrolls itself into view and
     clears the mark once it has. */
  const focusEl = useRef(null);
  useEffect(() => {
    if (!eatFocus) return;
    focusEl.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = setTimeout(() => setEatFocus(null), 1600);
    return () => clearTimeout(t);
  }, [eatFocus, setEatFocus]);


  /* Tapping a plan item's circle opens the logger with that item already in
     the meal. It is not logged until the user presses the button there, which
     keeps one meaning for "logged" across the whole app. */
  const logPlanItem = (divId, it) => {
    setLogItems([{ id: it.id, qty: it.qty }]);
    openLog(DIVISION_TIME[divId]);
  };


  const eatTodayView = (
  (
    <div style={{ margin: "-8px -22px 0" }}>
      {/* Today selector */}
      <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid " + BORDER, background: BG, borderRadius: 999, padding: "7px 16px", fontSize: 13, fontWeight: 700, color: TEXT, cursor: "pointer" }}>
          <span style={{ color: MUTED }}>‹</span> Today <span style={{ color: MUTED }}>›</span>
        </div>
      </div>

      {/* Which pillar this is, and what it is for. One slim line, because the
          answer is one line, with the way to the reasoning on the end of it. */}
      <div style={{ padding: "10px 22px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: PILLAR.eat.t,
            borderRadius: 12,
            padding: "9px 12px",
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              flexShrink: 0,
              background: BG,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Utensils size={14} color={PILLAR.eat.c} strokeWidth={2} />
          </span>
          <span style={{ display: "flex", alignItems: "baseline", gap: 7, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Eat</span>
            <span style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.4 }}>
              {PILLAR_SCIENCE.eat.tagline}
            </span>
          </span>
        </div>
      </div>

      {/* Sufficiency — the hero. For first-time (ft) users it explains what
          sufficiency even is, before any data exists. */}
      <div style={{ padding: "12px 22px 0" }}>
        {/* Two states, decided by one fact. A program user never sets their
            own targets, so there is no third card offering to. */}
        {!planAssigned ? (
          <LogWithoutJudgementCard />
        ) : (
          <SufficiencyCard />
        )}
      </div>

      {/* Journey state — reflects where the user is (eatState). Insight states
          (wc/w2/cg) tap through to the full breakdown under Trend. Day one has
          no journey to report, and the To-do screen already carries the coach
          hand-off, so it stays out of the way. */}
      {eatState !== "ft" && (
      <div style={{ padding: "10px 22px 0" }}>
        <div
          onClick={() => {
            if (eatState === "wc" || eatState === "w2" || eatState === "cg") setEatTab("trend");
          }}
          style={{
            display: "flex", alignItems: "flex-start", gap: 11,
            background: BG, border: "1px solid " + BORDER, borderRadius: 16, padding: "13px 15px",
            boxShadow: SH_SM,
            cursor: (eatState === "wc" || eatState === "w2" || eatState === "cg") ? "pointer" : "default",
          }}
        >
          <span
            style={{
              width: 26, height: 26, flexShrink: 0, marginTop: 1,
              background: GREEN,
              clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            K
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
                {{
                  ft: "Help your coach understand you",
                  fad: "Day 1 of 7 · nice start",
                  kg: "Day 3 of 7 · keep going",
                  wc: "Week 1 done · first insight ready",
                  w2: "Week 2 · Day 2",
                  cg: "A pattern worth a look",
                }[eatState]}
              </span>
              {(eatState === "wc" || eatState === "w2" || eatState === "cg") && (
                <span style={{ fontSize: 9.5, fontWeight: 700, color: GREEN, border: "1px solid " + GREEN, borderRadius: 5, padding: "1px 6px" }}>
                  Insight
                </span>
              )}
            </div>
            <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.45, marginTop: 3 }}>
              {{
                ft: "You're a Care program user. Before your coach builds your plan, they want to see how you eat. Log at least your 3 main meals each day, every item counts, even papad and pickle.",
                fad: "One day in. A few more and your first weekly insight unlocks.",
                kg: "You're building a habit. Protein is the gap to watch this week.",
                wc: "Your first week is in. Protein ran low most days, lunch is the easiest fix.",
                w2: "This week reads against last week, so you can see what's shifting.",
                cg: "Protein has stayed flat across two weeks. A quick coach consult could help.",
              }[eatState]}
            </div>
            {(eatState === "wc" || eatState === "w2" || eatState === "cg") && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 9, fontSize: 11.5, fontWeight: 700, color: GREEN }}>
                See the full breakdown <ChevronRight size={14} color={GREEN} />
              </div>
            )}

            {/* Building states — gift + weekly progress toward the first insight */}
            {(eatState === "fad" || eatState === "kg") && (
              <div style={{ marginTop: 11 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: MUTED }}>
                    <Gift size={13} color={GREEN} />
                    {eatState === "kg" ? "3 days logged" : "1 day logged"}
                  </span>
                  <span style={{ fontSize: 10.5, color: MUTED }}>
                    {eatState === "kg" ? "Unlocks in 4 days" : "Unlocks in 6 days"}
                  </span>
                </div>
                <div style={{ height: 5, background: "#F2F4F7", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: eatState === "kg" ? "43%" : "14%", background: GREEN, borderRadius: 3 }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Calories, slim, with or without a goal to measure against */}
      <div style={{ padding: "10px 22px 0" }}>
        <CaloriesStrip kcal={dayTotals.kcal} target={hasTargets ? kcalTarget : null} />
      </div>

      {/* Log a meal, as a prompt rather than a menu */}
      <LogMealPrompt onLog={() => openLog()} />

      {/* Meal divisions */}
      <div style={{ padding: "16px 22px 20px" }}>
        {eatDivisions.map((div) => {
          const isFocus = div.id === eatFocus;
          const opts = div.plan || [];
          // Everything really logged into this meal, kept with the index of the
          // meal it came from so the three dot menu can act on it.
          const mine = mealsLogged.flatMap((m, mi) =>
            m.division === div.id ? m.items.map((it) => ({ ...it, mealIndex: mi })) : []
          );
          const loggedIds = new Set(mine.map((x) => x.id));
          const loggedCal = Math.round(mine.reduce((n, x) => n + byId(x.id).kcal * x.qty, 0));

          /* A plan food that has been logged is shown ticked in the plan, not
             repeated above it. Only food the plan never asked for gets its own
             row, which is what makes the Manual pill mean something. */
          const planIds = new Set(planAssigned ? opts.flat().map((x) => x.id) : []);
          const extras = mine.filter((x) => !planIds.has(x.id));

          /* The options are alternates for the same meal, so eating from one
             settles the meal. That option becomes the one on show, and the
             others stay readable but stop offering a way to log. */
          const chosen = opts.findIndex((o) => o.some((it) => loggedIds.has(it.id)));
          const picked = planOption[div.id];
          const oi = Math.max(0, Math.min(picked !== undefined ? picked : Math.max(chosen, 0), opts.length - 1));
          const planItems = opts[oi] || [];
          const closed = chosen >= 0 && oi !== chosen;
          const target = Math.round(planItems.reduce((n, it) => n + byId(it.id).kcal * it.qty, 0));

          return (
            <div key={div.id} ref={isFocus ? focusEl : null} style={{ scrollMarginTop: 14, background: BG, border: "1px solid " + (isFocus ? GREEN : BORDER), borderRadius: 16, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{div.name}</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{div.time}</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>
                    {planAssigned ? loggedCal + " of " + target + " cal" : loggedCal > 0 ? loggedCal + " cal logged" : "Nothing logged yet"}
                  </div>
                </div>
                <button
                  onClick={() => openLog(DIVISION_TIME[div.id])}
                  aria-label={"Log something for " + div.name}
                  style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid " + GREEN, background: BG, color: GREEN, fontSize: 18, cursor: "pointer", flexShrink: 0, lineHeight: 1 }}
                >
                  +
                </button>
              </div>

              {/* Logged outside the plan */}
              {extras.length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + BORDER }}>
                  {extras.map((it) => (
                    <ItemRow key={it.mealIndex + ":" + it.id} it={it} done manual onMenu={() => setMealItem({ mealIndex: it.mealIndex, id: it.id })} />
                  ))}
                </div>
              )}

              {/* The coach's plan. Options are alternates for the same meal, so
                  they swap in place rather than sending anyone elsewhere. */}
              {planAssigned && opts.length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + BORDER }}>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9.5,
                      fontWeight: 600,
                      letterSpacing: 0.9,
                      textTransform: "uppercase",
                      color: MUTED,
                      marginBottom: opts.length > 1 ? 9 : 11,
                    }}
                  >
                    Your coach's plan
                  </div>

                  {opts.length > 1 && (
                    <div style={{ display: "flex", gap: 7, marginBottom: 11, overflowX: "auto", paddingBottom: 1, scrollbarWidth: "none" }}>
                      {opts.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPlanOption({ ...planOption, [div.id]: i })}
                          style={{
                            flexShrink: 0,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            background: i === oi ? PILLAR.eat.t : BG,
                            border: "1px solid " + (i === oi ? GREEN : BORDER),
                            borderRadius: 999,
                            padding: "4px 11px",
                            fontSize: 11.5,
                            fontWeight: 700,
                            color: i === oi ? GREEN : MUTED,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          Option {i + 1}
                          {i === chosen && <Check size={11} color={GREEN} strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Why the circles on this option do nothing */}
                  {closed && (
                    <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.45, marginBottom: 10 }}>
                      You have already started Option {chosen + 1} for this meal, so this one is just here to look at.
                    </div>
                  )}

                  {planItems.map((it) => (
                    <ItemRow
                      key={it.id}
                      it={it}
                      done={loggedIds.has(it.id)}
                      onTick={closed ? undefined : () => logPlanItem(div.id, it)}
                      onMenu={() => setMealItem({ planId: it.id, qty: it.qty })}
                    />
                  ))}

                  {/* The rest of what the coach said about this meal: a
                      capsule, a timing. Nothing to log, so nothing to search
                      for. They tick, and they tick in the day's list at the
                      same moment, because both read the same list.

                      Given their own heading because they are a different kind
                      of thing from the food above: nothing here goes into the
                      calorie count, and running them straight on from the meal
                      would read as more of it. */}
                  {(div.notes || []).length > 0 && (
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid " + LINE }}>
                      <div
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9.5,
                          fontWeight: 600,
                          letterSpacing: 0.9,
                          textTransform: "uppercase",
                          color: MUTED,
                          marginBottom: 2,
                        }}
                      >
                        Tips from your coach
                      </div>
                      {div.notes.map((n) => (
                        <NoteRow key={n.id} note={n} done={dayTicks.includes(n.id)} onTick={() => toggleTick(n.id)} />
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  )
  );

  return (
    (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", background: BG_ALT, padding: "8px 22px 20px" }}>
          {eatTab === "learn" ? (
            <ArticleList category="Nutrition & Metabolic Health" items={EAT_ARTICLES} />
          ) : eatTab === "trend" ? (
            <div>
              {/* Element 0 — week selector */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
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
                  <span style={{ color: eatState === "w2" || eatState === "cg" ? TEXT : "#D0D5DD" }}>‹</span>
                  This week
                  <span>›</span>
                </div>
              </div>

              {/* Trend content only for completed weeks (WC, W2, CG); blank for FT/FAD/KG */}
              {(eatState === "wc" || eatState === "w2" || eatState === "cg") && (
              <>
              {/* Element 1 — Kaira interpretation (no number) */}
              <div
                style={{
                  background: "linear-gradient(135deg,#F2F4F7,#F9FAFB)",
                  border: "1px solid #E4E7EC",
                  borderRadius: 18,
                  padding: 18,
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: GREEN,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                  >
                    K
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 0.5 }}>
                    YOUR WEEK, READ BY KAIRA
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 18,
                    fontWeight: 600,
                    color: TEXT,
                    lineHeight: 1.35,
                  }}
                >
                  {eatState === "cg"
                    ? "Protein's stayed the gap for two weeks now, even with the changes."
                    : eatState === "w2"
                    ? "Your protein's improving, but it's still the gap to close."
                    : "Your eating was steady and balanced, protein is the one thing to work on."}
                </div>
                <div style={{ fontSize: 13, color: TEXT, marginTop: 8, lineHeight: 1.5 }}>
                  {eatState === "cg"
                    ? "Your calories, carbs and fats held steady, but protein hasn't moved much across two weeks. When the small tweaks don't shift it, the meal pattern itself usually needs a rethink."
                    : eatState === "w2"
                    ? "You lifted protein from last week, nice work. Calories, carbs and fats all stayed on target. Keep nudging protein and your sufficiency climbs."
                    : "Your calories stayed steady and your carbs and fats are on target. Protein is the single thing holding your sufficiency back. Close that, and the rest follows."}
                </div>
              </div>

              {/* CG — free consultation card, under Kaira's first commentary */}
              {eatState === "cg" && (
                <div
                  style={{
                    background: BG,
                    border: "1px solid " + BORDER,
                    borderRadius: 18,
                    padding: 16,
                    marginBottom: 14,
                    boxShadow: SH,
                  }}
                >
                  <div style={{ display: "flex", gap: 12 }}>
                    {/* thumbnail — coach */}
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        background: "linear-gradient(135deg,#F2F4F7,#E4E7EC)",
                        border: "1px solid #E4E7EC",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Stethoscope size={26} color={GREEN} strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <Gift size={13} color={GREEN} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 0.5 }}>
                          A SMALL GIFT FOR YOU
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: 16,
                          fontWeight: 600,
                          color: TEXT,
                          lineHeight: 1.3,
                        }}
                      >
                        A free consult, on us
                      </div>
                      <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4, lineHeight: 1.45 }}>
                        Let a GoodFlip coach help you crack the protein gap for good.
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 14,
                      background: GREEN,
                      color: "#fff",
                      textAlign: "center",
                      borderRadius: 12,
                      padding: "12px 0",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Claim my free consult<CtaArrow />
                  </div>
                </div>
              )}

              {/* Element 2 — the number + graph */}
              <div
                style={{
                  background: BG,
                  border: "1px solid " + BORDER,
                  borderRadius: 18,
                  padding: 16,
                  marginBottom: 14,
                  boxShadow: SH,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Your sufficiency this week</span>
                  {eatState === "w2" && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: GREEN }}>▲ up from 61%</span>
                  )}
                  {eatState === "cg" && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#98A2B3" }}>≈ same as last week</span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
                  <span style={{ fontSize: 40, fontWeight: 700, color: TEXT, lineHeight: 1 }}>68</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: MUTED }}>%</span>
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 6, lineHeight: 1.45 }}>
                  This is how well this week's meals met your weekly targets, not your overall goal. Your bigger goal lives in Measure.
                </div>

                {/* simple 7-day bar graph */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, marginTop: 18, position: "relative" }}>
                  {/* goal reference line */}
                  <div style={{ position: "absolute", top: 30, left: 0, right: 0, borderTop: "1px dashed #D0D5DD" }} />
                  {[
                    { d: "M", h: 70, logged: true },
                    { d: "T", h: 82, logged: true },
                    { d: "W", h: 60, logged: true },
                    { d: "T", h: 75, logged: true },
                    { d: "F", h: 88, logged: true },
                    { d: "S", h: 45, logged: false },
                    { d: "S", h: 30, logged: false },
                  ].map((b, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                      <div
                        style={{
                          width: "100%",
                          height: b.h + "%",
                          borderRadius: 6,
                          background: b.logged ? GREEN : "transparent",
                          border: b.logged ? "none" : "1.5px dashed #98A2B3",
                        }}
                      />
                      <span style={{ fontSize: 10, color: MUTED, marginTop: 6 }}>{b.d}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 10, lineHeight: 1.45 }}>
                  Lighter days are ones you didn't log. The line shows direction, not a perfect score.
                </div>
              </div>

              {/* Element 3 — what went well */}
              <div
                style={{
                  background: BG,
                  border: "1px solid " + BORDER,
                  borderRadius: 18,
                  padding: 16,
                  marginBottom: 14,
                  boxShadow: SH,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12 }}>What went well</div>
                {[
                  "You logged 5 of 7 days, enough to see a real pattern.",
                  "Calories stayed steady, no big spikes.",
                  "Carbs and fats both on target.",
                ].map((p) => (
                  <div key={p} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                    <Check size={15} color={GREEN} strokeWidth={2.6} style={{ marginTop: 1, flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.45 }}>{p}</span>
                  </div>
                ))}
              </div>

              {/* Element 3b — the gap + action, clubbed */}
              <div
                style={{
                  background: BG,
                  border: "1px solid " + BORDER,
                  borderRadius: 18,
                  padding: 16,
                  marginBottom: 14,
                  boxShadow: SH,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
                  The one gap, and how to close it
                </div>
                <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5 }}>
                  Your protein averaged <strong>71g a day</strong> against your <strong>94g daily target</strong>, a bit short most days, especially at lunch.
                </div>
                <div
                  style={{
                    marginTop: 12,
                    background: BG_ALT,
                    border: "1px solid " + BORDER,
                    borderRadius: 12,
                    padding: 12,
                    display: "flex",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: GREEN,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                  >
                    K
                  </div>
                  <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5 }}>
                    Add one protein anchor at lunch twice next week, dal, curd, paneer, eggs, or chicken. That single change should lift your sufficiency the most, even on days you don't log perfectly.
                  </div>
                </div>
              </div>

              {/* Element 4 — macro pattern, daily averages */}
              <div
                style={{
                  background: BG,
                  border: "1px solid " + BORDER,
                  borderRadius: 18,
                  padding: 16,
                  marginBottom: 14,
                  boxShadow: SH,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Your daily averages this week</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2, marginBottom: 14 }}>
                  Averages across the days you logged.
                </div>
                {[
                  { l: "Protein", v: "71g / 94g a day", pct: 75, short: true },
                  { l: "Carbs", v: "214g / 236g a day", pct: 91, short: false },
                  { l: "Fats", v: "48g / 62g a day", pct: 77, short: false },
                ].map((m) => (
                  <div key={m.l} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{m.l}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: m.short ? "#444CE7" : TEXT }}>{m.v}</span>
                    </div>
                    <div style={{ height: 8, background: BG_ALT, borderRadius: 4, overflow: "hidden", border: "1px solid " + BORDER }}>
                      <div style={{ width: m.pct + "%", height: "100%", background: m.short ? "#667085" : GREEN }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Element 5 — forward hook */}
              <div
                style={{
                  background: "#101828",
                  borderRadius: 18,
                  padding: 18,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                  Next week
                </div>
                <div style={{ fontSize: 12.5, color: "#2DA6A6", lineHeight: 1.5 }}>
                  {eatState === "w2"
                    ? "Log next week and let's see if you can beat 68%. I'll track whether the lunch fix is working."
                    : "Log through next week and I'll show you if that lunch change lifts your protein. Let's build on this."}
                </div>
              </div>
              </>
              )}

              {/* Nothing to read yet. Rather than an empty page, say what this
                  page will be and what it is waiting on. */}
              {!(eatState === "wc" || eatState === "w2" || eatState === "cg") && (
                <TrendWaiting
                  days={eatState === "kg" ? 3 : eatState === "fad" ? 1 : 0}
                  onLog={() => {
                    setEatTab("today");
                    openLog();
                  }}
                />
              )}
            </div>
          ) : (
            eatTodayView
          )}
        </div>

        {/* Eat bottom nav: Back · Eat · Trend · Learn */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            padding: "10px 6px 22px",
            background: BG,
            borderTop: "1px solid " + BORDER,
          }}
        >
          <button
            onClick={() => setEatDetail(false)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={22} color={MUTED} strokeWidth={1.8} />
            <span style={{ fontSize: 11, fontWeight: 500, color: MUTED }}>Back</span>
          </button>

          <button
            onClick={() => setEatTab("today")}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Utensils
              size={22}
              color={eatTab === "today" ? GREEN : MUTED}
              strokeWidth={eatTab === "today" ? 2.4 : 1.8}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: eatTab === "today" ? 700 : 500,
                color: eatTab === "today" ? GREEN : MUTED,
              }}
            >
              Eat
            </span>
          </button>

          <button
            onClick={() => setEatTab("trend")}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <TrendingUp
              size={22}
              color={eatTab === "trend" ? GREEN : MUTED}
              strokeWidth={eatTab === "trend" ? 2.4 : 1.8}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: eatTab === "trend" ? 700 : 500,
                color: eatTab === "trend" ? GREEN : MUTED,
              }}
            >
              Trend
            </span>
          </button>

          <button
            onClick={() => setEatTab("learn")}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <BookOpen
              size={22}
              color={eatTab === "learn" ? GREEN : MUTED}
              strokeWidth={eatTab === "learn" ? 2.4 : 1.8}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: eatTab === "learn" ? 700 : 500,
                color: eatTab === "learn" ? GREEN : MUTED,
              }}
            >
              Learn
            </span>
          </button>
        </div>
      </div>
    )
  );
}

/* One line of food, whether the plan asked for it or the user added it. The
   circle is the only difference: on a plan item it is a way in to the logger,
   on something logged it is just a tick. */
/* A coach instruction with nothing to weigh. Same tick as a plan food so the
   meal reads as one list, but no calories and no menu, because there is
   nothing to edit about "with warm water". */
function NoteRow({ note, done, onTick }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 11, marginTop: 11 }}>
      <button
        onClick={onTick}
        aria-label={note.title + (done ? ", done" : "")}
        style={{
          width: 21,
          height: 21,
          borderRadius: "50%",
          flexShrink: 0,
          marginTop: 1,
          background: done ? GREEN : BG,
          border: "1.8px solid " + (done ? GREEN : RULE),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
        }}
      >
        {done && <Check size={12} color="#fff" strokeWidth={3.2} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: done ? 600 : 700, color: done ? MUTED : TEXT, lineHeight: 1.35 }}>
          {note.title}
        </div>
        <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.45, marginTop: 2 }}>{note.tip}</div>
      </div>
    </div>
  );
}

function ItemRow({ it, done, manual, onTick, onMenu }) {
  const food = byId(it.id);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
      <button
        onClick={onTick && !done ? onTick : undefined}
        disabled={!onTick || done}
        aria-label={done ? food.name + " is logged" : "Log " + food.name}
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
          cursor: onTick && !done ? "pointer" : "default",
        }}
      >
        {done && <Check size={12} color="#fff" strokeWidth={3} />}
      </button>

      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: TEXT }}>
        {food.name} <span style={{ color: MUTED, fontWeight: 400 }}>· {qtyLabel(food, it.qty)}</span>
      </span>

      {manual && (
        <span
          style={{
            flexShrink: 0,
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: 0.3,
            color: MUTED,
            background: BG_ALT,
            border: "1px solid " + BORDER,
            borderRadius: 999,
            padding: "2px 7px",
          }}
        >
          Manual
        </span>
      )}

      <span style={{ flexShrink: 0, fontSize: 12, color: MUTED }}>{Math.round(food.kcal * it.qty)} cal</span>

      <button
        onClick={onMenu}
        aria-label={"Options for " + food.name}
        style={{
          flexShrink: 0,
          width: 22,
          height: 22,
          marginRight: -6,
          padding: 0,
          background: "none",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <MoreVertical size={15} color={MUTED} />
      </button>
    </div>
  );
}

/* The Trend tab before there is a week to read. It shows the shape of what is
   coming, so the wait reads as a week filling up rather than a broken page. */
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const HEIGHTS = [46, 62, 38, 54, 58, 44, 50];

function TrendWaiting({ days, onLog }) {
  const line =
    days === 0
      ? "Log your meals and this fills in. On Sunday I read the week back to you: what held steady, what slipped, and the one change worth making."
      : days === 1
      ? "One day in. A single day is a day, not a pattern, so I will wait until there is enough here to be worth your time."
      : "Three days in. A few more and there is enough of a pattern to read properly.";

  return (
    <div>
      <div
        style={{
          background: BG,
          border: "1px solid " + BORDER,
          borderRadius: 18,
          padding: 18,
          boxShadow: SH,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: GREEN,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            K
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 0.5 }}>
            YOUR WEEK, READ BY KAIRA
          </span>
        </div>

        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 18,
            fontWeight: 600,
            color: TEXT,
            lineHeight: 1.35,
          }}
        >
          {days === 0 ? "Your week has not started yet." : "Your week is still filling in."}
        </div>
        <div style={{ fontSize: 13, color: TEXT, marginTop: 8, lineHeight: 1.5 }}>{line}</div>

        {/* The week ahead, drawn empty. Days already logged are solid. */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 66, marginTop: 18 }}>
          {DAYS.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: "100%",
                  height: HEIGHTS[i],
                  borderRadius: 6,
                  background: i < days ? GREEN : "transparent",
                  border: i < days ? "none" : "1.5px dashed " + BORDER,
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          {DAYS.map((d, i) => (
            <span key={i} style={{ flex: 1, textAlign: "center", fontSize: 11, color: i < days ? TEXT : MUTED }}>
              {d}
            </span>
          ))}
        </div>

        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid " + LINE,
            fontSize: 12, 
            color: MUTED,
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: TEXT }}>{days} of 7 days logged.</strong> A day counts once your three
          main meals are in it.
        </div>
      </div>

      <button
        onClick={onLog}
        style={{
          width: "100%",
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          background: GREEN,
          border: "none",
          borderRadius: 14,
          padding: "14px 0",
          color: "#fff",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Log a meal
        <CtaArrow />
      </button>
    </div>
  );
}
