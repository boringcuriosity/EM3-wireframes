import React, { useState } from "react";
import { useWF } from "../state";
import { DEMO_DAY } from "../screens/log/foods";
import { MIND_TEMPLATES } from "../screens/mind/tools";
import { Home, Bell, MessageCircle } from "lucide-react";
import { GREEN, TEXT, SH, SH_MD } from "../tokens";
import { flame } from "../ui";

/* Every state Today's focus can be in, as one tap each. `progress` is the real
   per-task count, `days` is the streak that goes with it, so a preset lands the
   row and the streak strip on the same story. */
const ALL_DONE = { eat: 3, move: 1, mind: 1, measure: 1 };

/* The sufficiency card, in every shape it takes. `meals` is how many of the
   three main meals are logged, which is what the score gate counts. */
/* What each screen is made of. The panel shows these groups and folds the rest
   away, so the rail is as long as the screen in front of you rather than as
   long as the whole app. Order here is the order they appear.

   Plan, Sessions and MET score are deliberately absent: a program user is the
   default and the other two are one-off setup, so they belong in All controls
   rather than in the way on every screen. */
const ALL_GROUPS = [
  "signup", "plan", "welcome", "tour", "move", "hero", "targets",
  "logging", "suff", "streakscreen", "streak", "milestones",
  "focus", "homecard", "metabcard", "planarrive", "dayparts", "coachtip", "taskcard", "weekread", "movetrend", "mindtrend", "dayWon", "skip", "measuretasks", "score", "scoreflow", "sessions", "live", "nextaction", "home", "eat", "mind", "measure",
];

const SCREEN_GROUPS = {
  signup: ["signup"],
  move: ["move", "movetrend", "focus"],
  mind: ["mind", "mindtrend", "focus"],
  logging: ["logging", "targets"],
  suff: ["suff", "targets"],
  streakscreen: ["streakscreen", "milestones", "focus"],
  eat: ["eat", "targets", "logging", "coachtip"],
  chats: [],
  program: ["welcome"],
  todo: ["nextaction", "scoreflow", "hero", "focus", "taskcard", "planarrive", "weekread", "measuretasks"],
  // Home's "This part of day" card reads the same phases, so the split is a
  // control on both screens rather than a To-do one that quietly moves Home.
  home: ["welcome", "tour", "nextaction", "scoreflow", "live", "focus", "homecard", "metabcard", "measuretasks"],
  measure: ["measure"],
  care: [],
  more: [],
};

/* The four shapes the top of To-do takes. `plan` is whether the care plan is
   in, `data` is how much of today is logged. Between them they decide whether
   the hero is a coach card, an ask, a summary, or a two-card rail. */
const HERO_STATES = [
  {
    id: "noplan",
    label: "No plan",
    full: "Coach handoff card",
    plan: false,
    data: "empty",
    desc: "Your coaches want to know you, the three asks, and the way down to the tasks. Nothing to summarise yet.",
  },
  {
    id: "nodata",
    label: "Plan, no data",
    full: "Plan in, nothing logged today",
    plan: true,
    data: "empty",
    desc: "TDEE and a Log a meal bubble. One card, no rail, because there is no score to swipe to.",
  },
  {
    id: "partial",
    label: "Part way",
    full: "Calories real, score not yet",
    plan: true,
    data: "partial",
    desc: "Eaten, TDEE and deficit, then a second card with the score locked behind a blur. Macros are live under it.",
  },
  {
    id: "full",
    label: "Full day",
    full: "Both cards, rail swipes",
    plan: true,
    data: "done",
    desc: "Same two cards, score unlocked, and two suggestions for closing the gap.",
  },
];

const SUFF_STATES = [
  {
    id: "await",
    label: "No plan, nothing logged",
    plan: false,
    meals: 0,
    desc: "Show us what you eat, the two beats, and the line saying the score waits on the coach.",
  },
  {
    id: "awaitlogged",
    label: "No plan, food logged",
    plan: false,
    meals: 2,
    desc: "Same card, now showing macros instead of the explanation. Grams are real from the first meal; the score still waits on the plan.",
  },
  {
    id: "first",
    label: "Plan set, nothing logged",
    plan: true,
    meals: 0,
    desc: "The sufficiency card with its targets in place, so its only job is the first meal.",
  },
  {
    id: "one",
    label: "1 of 3 main meals",
    plan: true,
    meals: 1,
    desc: "The number exists but stays blurred behind a lock. Macros are live underneath it.",
  },
  {
    id: "two",
    label: "2 of 3 main meals",
    plan: true,
    meals: 2,
    desc: "Same gate, one meal from opening. The pips under the hexagon show how close it is.",
  },
  {
    id: "three",
    label: "3 of 3 main meals",
    plan: true,
    meals: 3,
    desc: "All three main meals in. The hexagon sharpens and the day has a real score.",
  },
];

const DEMO_EXERCISE = [{ id: "walk", minutes: 45, intensity: "moderate", timeMins: 7 * 60 + 15 }];

/* Every shape Today's focus takes, as one tap each.

   The day is a list now, not four pillar cards, so a preset has to leave the
   records a real day would leave: meals in the log, a capsule ticked, water
   drunk, a night slept. `seed` is that day; nothing here sets a counter. */
const FOCUS_PRESETS = [
  {
    id: "ftux",
    label: "Habits explainer",
    ftux: true,
    days: 0,
    seed: {},
    desc: "First run on To-do. The four habits are explained before the day is handed over, the same way onboarding does it.",
  },
  {
    id: "empty",
    label: "Nothing ticked",
    days: 0,
    seed: {},
    desc: "The whole day open. Morning is expanded, the afternoon and evening are folded away until it is cleared.",
  },
  {
    id: "few",
    label: "A few ticked",
    days: 0,
    seed: { meals: 1, mind: 1, water: 1, ticks: ["note:methi"] },
    desc: "Four things done across the morning and afternoon: last night's sleep, breakfast, the first capsule and a glass of water. Nothing is complete, so nothing has folded away.",
  },
  {
    id: "all",
    label: "Everything ticked",
    days: 0,
    seed: { every: true },
    desc: "Every row in the day done. All three parts fold themselves shut, the streak card leads, and the flame is full.",
  },
  {
    id: "d2",
    label: "Day 2 streak",
    days: 2,
    seed: { every: true },
    desc: "Same cleared day, second in a row. The card reads 2 days in a row.",
  },
  {
    id: "d7",
    label: "Day 7 streak",
    days: 7,
    seed: { every: true },
    desc: "A full week. The rewards sheet behind the card is where the 20 coin weekly bonus is explained.",
  },
];

// Which dailyState a preset wants. Presets without one land on a clean day.
const focusState = (v) => (v.ftux ? "ftux" : v.data || "empty");

// Which source each Mind preset stands for.
const SLEEP_SRC = { gate: null, syncing: "phone", phone: "phone", manualnone: "manual", manual: "manual", tools: "manual" };

export default function ControlPanel() {
  const { authStep, setAuthStep, setPhone, setOtp, setUserName, activeTab, setActiveTab, userState, setUserState, eatDetail, setEatDetail, eatState, setEatState, measureApproach, setMeasureApproach, setMsDetail, setA1Detail, setMsa2Detail, plan, setPlan, sessionState, setSessionState, scoreState, setScoreState, dailyState, setDailyState, taskProgress, setTaskProgress, setTaskDone, setStreakInfo, setOnboardingOpen, setOnboardingStep, tour, setTour, setTodayOnboarded, streakState, setStreakState, programDetail, setProgramDetail, setProgramSub, chatsOpen, setChatsOpen, openGroups, setOpenGroups, isPaid, program, programIntro, setProgramIntro, setProgramIntroSeen, streakOpen, setStreakOpen, milestones, setMilestones, flipcoins, setFlipcoins, streakDays, setStreakDays, suffFlow, setSuffFlow, setSuffLift, suffLift, scoreFlow, setScoreFlow, setScoreStep, setKcalSource, logOpen, setLogOpen, logResult, setLogResult, setToast, mealsLogged, setMealsLogged, setLogItems, logPlan, openMealLog, kairaLog, setKairaLog, planNotif, setPlanNotif, hasTargets, scoreUnlocked, mealsIn, planAssigned, heroState, measureTasks, setMeasureTasks, moveDetail, setMoveDetail, moveTab, setMoveTab, setMovePlan, logExOpen, setLogExOpen, logExPick, openMoveLog, moveResult, setMoveResult, setRoutineFeel, setRoutineDone, exLogs, setExLogs, healthSource, setHealthSource, healthSync, setHealthSync, manualSteps, setManualSteps, mindDetail, setMindDetail, mindTab, setMindTab, mindDone, setMindDone, setMindKept, mindTemplate, setMindTemplate, setTemplateKept, sleepLogs, setSleepLogs, logSleepOpen, setLogSleepOpen, nextActions, nextDone, nextOpen, setNextList, prereqHidden, setPrereqHidden, prereqAsk, setPrereqAsk, prereqExpanded, setPrereqOpen, setHomeProgramTab, setWater, setDayTicks, taskCard, setTaskCard, moveWeek, setMoveWeek, mindWeek, setMindWeek, weekInsight, setWeekInsight, weekMode, setWeekMode, setWeekReads, homeCard, setHomeCard, metabCard, setMetabCard, phaseMode, setPhaseMode, tipInfo, setTipInfo, kairaAsk, setKairaAsk, askKaira, planSeen, setPlanSeen, kcalSource, movePlan, mindPlan, setMindPlan, bookOpen, setBookOpen, bookWith, setBookWith, liveState, setLiveState, cgmOpen, bcaOpen, streakBurst, setStreakBurst, dayLive, daySkipped, toggleSkip, setDaySkipped, eatDivisions } = useWF();

  const suffCardState = (
    SUFF_STATES.find(
      (v) =>
        v.plan === planAssigned &&
        (v.plan ? v.meals === mealsIn : (v.meals > 0) === (mealsLogged.length > 0))
    ) || {}
  ).id;

  /* Which preset the day matches, read off the records rather than a counter,
     so a day built by hand still lights the chip it actually looks like. */
  const doneCount = dayLive.filter((r) => r.done).length;
  const focusPreset = (
    FOCUS_PRESETS.find((v) => {
      if (v.ftux) return dailyState === "ftux";
      if (dailyState === "ftux") return false;
      if (v.days !== streakDays) return false;
      const all = doneCount > 0 && doneCount === dayLive.length;
      if (v.seed.every) return all;
      if (v.id === "empty") return doneCount === 0;
      return doneCount > 0 && !all;
    }) || {}
  ).id;

  const groupValue = {
    move: moveResult ? "Result" : logExOpen ? (logExPick === "routine" ? "Routine" : "Log") : moveDetail ? moveTab : "Closed",
    targets: hasTargets ? (scoreUnlocked ? "Unlocked" : mealsIn + "/3 meals") : "No targets",
    logging: logResult ? "Result" : kairaLog ? "Kaira " + kairaLog : logOpen ? (logPlan ? "On plan" : "Search") : mealsLogged.length + " logged",
    suff: suffFlow || "Off",
    streakscreen: streakOpen || "Strip",
    milestones: milestones.earned.length + " earned",
    welcome: programIntro || "Off",
    tour: tour === null ? "Off" : "Step " + (tour + 1),
    signup: authStep || "Done",
    plan: isPaid ? "Paid" : "Free",
    home: userState,
    eat: eatState.toUpperCase(),
    measure: measureApproach.toUpperCase(),
    sessions: sessionState === "booked" ? "Booked" : "No sessions",
    score: scoreState,
    measuretasks: measureTasks,
    hero: heroState,
    mind: mindTemplate ? "Worksheet" : mindDetail ? mindTab : "Closed",
    nextaction: nextOpen.length ? nextOpen.length + " left" : "none",
    focus: doneCount + "/" + dayLive.length + (streakDays ? " · d" + streakDays : ""),
    skip: daySkipped.length ? daySkipped.length + " skipped" : "none",
    planarrive: bookOpen ? "booking" : planNotif || undefined,
    dayparts: phaseMode === 4 ? "with night" : "no night",
    metabcard: metabCard,
    coachtip: kairaAsk ? "Kaira" : tipInfo ? "explainer" : "closed",
    dayWon: streakBurst ? "showing" : "off",

    streak: streakState,
  };

  const liveGroup = moveDetail || logExOpen
    ? "move"
    : mindDetail || logSleepOpen
    ? "mind"
    : logOpen || logResult
    ? "logging"
    : suffFlow
    ? "suff"
    : authStep
    ? "signup"
    : streakOpen
    ? "streakscreen"
    : programDetail
      ? "welcome"
      : eatDetail
      ? "eat"
      : activeTab === "home"
      ? isPaid
        ? "focus"
        : "home"
      : activeTab === "med"
      ? "measure"
      : activeTab === "track"
      ? "focus"
      : null;

  const [showAll, setShowAll] = useState(false);

  const screenKey = cgmOpen || bcaOpen
    ? "measure"
    : moveDetail || logExOpen
    ? "move"
    : mindDetail || logSleepOpen
    ? "mind"
    : logOpen || logResult
    ? "logging"
    : suffFlow
    ? "suff"
    : authStep
    ? "signup"
    : streakOpen
    ? "streakscreen"
    : eatDetail
    ? "eat"
    : chatsOpen
    ? "chats"
    : programDetail
    ? "program"
    : activeTab === "track"
    ? "todo"
    : activeTab === "med"
    ? "measure"
    : activeTab === "care"
    ? "care"
    : activeTab === "more"
    ? "more"
    : "home";

  /* To-do is two different screens depending on the care plan, so the rail is
     too. Without a plan the top is the Prerequisites cards and there is no
     hero; with one, the hero leads and the prerequisites shut to a strip
     underneath it. The Care plan toggle at the head of the panel crosses
     between them. */
  const onScreen = (SCREEN_GROUPS[screenKey] || []).filter((g) => {
    if (screenKey !== "todo") return true;
    /* Without a plan there is no hero and no device sync to vary. The
       prerequisites used to be dropped from this list once a plan arrived,
       which was right while a plan arriving deleted them from the screen.
       They shut to a strip instead now, so they are still there and their
       controls have to be too. */
    return planAssigned || (g !== "hero" && g !== "measuretasks");
  });

  // Is anything open right now, the live group included. Same rule the group
  // headers use, so the label always matches what is on screen.
  const allOpen = ALL_GROUPS.some((g) => (g === liveGroup) !== openGroups.includes(g));


  const panelChip = (label, active, onClick, title, expanded, sub, Icon) => (
    <button
      key={label}
      onClick={onClick}
      title={title}
      aria-label={Icon ? label : undefined}
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "6px 11px",
        borderRadius: 999,
        border: "1px solid " + (active ? GREEN : "#D0D5DD"),
        background: active ? GREEN : "#FFFFFF",
        color: active ? "#fff" : "#475467",
        cursor: "pointer",
        whiteSpace: "nowrap",
        textAlign: "left",
        display: sub ? "flex" : undefined,
        alignItems: "center",
        gap: 7,
      }}
    >
      {Icon ? (
        <Icon size={15} strokeWidth={2.2} />
      ) : sub ? (
        <>
          <span style={{ flexShrink: 0 }}>{label}</span>
          <span style={{ flex: 1, minWidth: 0, fontWeight: 500, fontSize: 10, textAlign: "right", opacity: active ? 0.8 : 0.7, overflow: "hidden", textOverflow: "ellipsis" }}>
            {sub}
          </span>
        </>
      ) : active && expanded ? (
        <>
          {label}
          <span style={{ opacity: 0.55, margin: "0 5px" }}>·</span>
          <span style={{ fontWeight: 500 }}>{expanded}</span>
        </>
      ) : (
        label
      )}
    </button>
  );

  /* The fifth argument spells the label out on the active chip. Only groups
     whose labels are abbreviations pass it; a chip that already reads as a
     word does not need translating.

     `appliesTo` and `caption` are no longer rendered. They stay in the call
     sites as a note on what each group does, which is worth more in the source
     than it was on screen. */
  const panelGroup = (id, title, appliesTo, chips, caption, stack) => {
    const live = liveGroup === id;
    const here = onScreen.includes(id);
    // Groups not on this screen are hidden unless the rail is set to show
    // everything. What is left is what the screen in front of you is made of.
    if (!here && !showAll) return null;
    /* The live group opens itself, everything else starts closed, and
       openGroups flips whichever one you tap. Without the flip the live group
       could never be collapsed. */
    const open = live !== openGroups.includes(id);
    return (
      <div
        style={{
          borderTop: "1px solid #E4E7EC",
          padding: open ? "14px 0 4px" : "10px 0",
          opacity: live ? 1 : here ? 0.86 : 0.55,
        }}
      >
        <button
          onClick={() =>
            setOpenGroups(
              openGroups.includes(id)
                ? openGroups.filter((g) => g !== id)
                : openGroups.concat(id)
            )
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            width: "100%",
            border: "none",
            background: "transparent",
            padding: 0,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: live ? GREEN : "#D0D5DD",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#1D2939", letterSpacing: 0.3 }}>
            {title}
          </span>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            {!open && (
              <span style={{ fontSize: 10, color: "#98A2B3" }}>{groupValue[id] || ""}</span>
            )}
            <span
              style={{
                fontSize: 9,
                color: "#98A2B3",
                transform: open ? "rotate(90deg)" : "none",
                transition: "transform .15s",
              }}
            >
              ▶
            </span>
          </span>
        </button>
        {open && (
          <div
            style={{
              display: "flex",
              flexDirection: stack ? "column" : "row",
              flexWrap: stack ? "nowrap" : "wrap",
              gap: 6,
              marginTop: 8,
            }}
          >
            {chips}
          </div>
        )}
      </div>
    );
  };

  return (
    (
      <aside
        style={{
          width: 236,
          flexShrink: 0,
          position: "sticky",
          top: 24,
          background: "#F9FAFB",
          border: "1px solid #E4E7EC",
          borderRadius: 16,
          padding: "16px 16px 14px",
          fontFamily: "Roboto, system-ui, sans-serif",
          boxShadow: SH_MD,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: "#1D2939", letterSpacing: 0.3 }}>
            Wireframe controls
          </span>
          {/* One tap to fold the whole rail, including whichever group opened
              itself for this screen. */}
          <button
            onClick={() =>
              setOpenGroups(
                allOpen ? (liveGroup ? [liveGroup] : []) : ALL_GROUPS.filter((g) => g !== liveGroup)
              )
            }
            style={{
              background: "none",
              border: "none",
              padding: "2px 0",
              fontSize: 10.5,
              fontWeight: 700,
              color: "#667085",
              cursor: "pointer",
              fontFamily: "inherit",
              flexShrink: 0,
            }}
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>

        {/* The one switch that changes the most across the app, so it stays out
            of the accordion and in reach on every screen. */}
        {isPaid && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 9,
              padding: "7px 9px",
              background: "#FFFFFF",
              border: "1px solid #E4E7EC",
              borderRadius: 10,
            }}
          >
            <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "#1D2939" }}>
              Care plan
            </span>
            <span style={{ fontSize: 10.5, color: "#667085", fontWeight: 600 }}>
              {planAssigned ? "Assigned" : "Not yet"}
            </span>
            <button
              role="switch"
              aria-checked={planAssigned}
              aria-label="Care plan assigned"
              onClick={() => {
                /* One switch for the whole handover: targets, routine, meal
                   slots, the psychologist's worksheets and the waiting strips
                   all follow from it. A consultation produces three plans, so
                   assigned means three, not the two it used to mean while Mind
                   quietly stayed behind. */
                const on = !planAssigned;
                setKcalSource(on ? "coach" : "pending");
                setMovePlan(on ? "assigned" : null);
                setMindPlan(on ? "assigned" : null);
                setTodayOnboarded(true);
                if (!eatDetail && !moveDetail && activeTab !== "track") {
                  setActiveTab("track");
                }
              }}
              style={{
                width: 34,
                height: 20,
                flexShrink: 0,
                borderRadius: 999,
                border: "none",
                padding: 0,
                background: planAssigned ? GREEN : "#D0D5DD",
                cursor: "pointer",
                transition: "background .2s ease",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  left: 2,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 1px 2px rgba(16,24,40,0.2)",
                  // Slid rather than re-laid-out, so the knob does not make the
                  // panel measure itself again on every flick.
                  transform: planAssigned ? "translateX(14px)" : "none",
                  transition: "transform .2s cubic-bezier(.32,.72,0,1)",
                }}
              />
            </button>
          </div>
        )}

        {(() => {
          const steps = [
            { id: "splash", label: "Splash", full: "Splash", desc: "The four pillars open as a flower, then it hands off to the phone screen on its own." },
            { id: "phone", label: "Mobile", full: "Mobile number", desc: "Top half pitches the pillars, bottom half takes the number. Continue unlocks at 10 digits." },
            { id: "otp", label: "OTP", full: "OTP", desc: "Six boxes that advance as you type, with a resend countdown. Edit goes back to the number." },
            { id: "name", label: "Name", full: "Your name", desc: "Kaira introduces herself and asks what to call you. Continue drops into Home." },
            { id: null, label: "Done", full: "Signed up", desc: "Signup complete. The app renders normally with the tab bar." },
          ];
          const current = steps.find((v) => v.id === authStep);
          return panelGroup(
            "signup",
            "Signup flow",
            "before the app",
            steps.map((v) =>
              panelChip(
                v.label,
                authStep === v.id,
                () => {
                  setAuthStep(v.id);
                  // Reset what the earlier steps collect so each screen can be
                  // opened cold, exactly as a new user would meet it.
                  if (v.id === "splash" || v.id === "phone") setPhone("");
                  if (v.id !== "name" && v.id !== null) setOtp(["", "", "", "", "", ""]);
                  if (v.id !== null) setUserName("");
                  if (v.id === null) setActiveTab("home");
                  // Re-arm the one-shot program welcome, so replaying signup
                  // replays the whole first-run, not a trimmed version of it.
                  if (v.id !== null) { setProgramIntroSeen(false); setProgramIntro(null); }
                },
                v.full + ". " + v.desc
              )
            ),
            current && current.desc
          );
        })()}

        {(() => {
          const plans = [
            {
              id: "free",
              label: "Free",
              full: "Free user",
              desc: "No program. Home shows the pillar cards, campaign hooks and Smart Devices.",
            },
            {
              id: "paid",
              label: "Paid",
              full: "Program user",
              desc: "Enrolled in Diabetes Management. Home leads with the program carousel; program detail, coach chat and consistency score unlock.",
            },
          ];
          const current = plans.find((p) => p.id === plan);
          return panelGroup(
            "plan",
            "Plan",
            "applies everywhere",
            plans.map((p) =>
              panelChip(
                p.label,
                plan === p.id,
                () => {
                  setPlan(p.id);
                  setEatDetail(false);
                  setProgramDetail(false);
                  setProgramSub(null);
                  setChatsOpen(false);
                  setActiveTab("home");
                },
                p.full + ". " + p.desc
              )
            ),
            current && current.desc
          );
        })()}

        {isPaid &&
          panelGroup(
            "welcome",
            "Welcome bottomsheet",
            "Home, after onboarding",
            [
              { id: "sheet", label: "Sheet", full: "Bottom sheet" },
              { id: null, label: "Off", full: "Dismissed" },
            ].map((v) =>
              panelChip(
                v.label,
                programIntro === v.id,
                () => {
                  setProgramIntro(v.id);
                  setActiveTab("home");
                  setEatDetail(false);
                  setProgramDetail(false);
                  setChatsOpen(false);
                },
                v.full
              )
            ),
            {
              sheet: "Three beats in Kaira's voice: the program, the metabolic score, then logging your day. Its last CTA starts the tour.",
            }[programIntro] || "Nothing showing. Home renders normally."
          )}

        {isPaid &&
          panelGroup(
            "tour",
            "Coachmarks tour",
            "spotlight over Home",
            [
              { id: 0, label: "1 Program", full: "Program card" },
              { id: 1, label: "2 Score", full: "Metabolic score card" },
              { id: 2, label: "3 Pillars", full: "Pillars card, ends on Let's start" },
              { id: null, label: "Off", full: "Not running" },
            ].map((v) =>
              panelChip(
                v.label,
                tour === v.id,
                () => {
                  setProgramIntro(null);
                  setActiveTab("home");
                  setEatDetail(false);
                  setProgramDetail(false);
                  setChatsOpen(false);
                  if (v.id === 2) setDailyState("ftux");
                  setTour(v.id);
                },
                v.full
              )
            ),
            tour === null
              ? "Nothing showing. Home renders normally."
              : tour === 2
              ? "The last stop ends on a Let's start button in the note, which drops straight into the EM3 explainer."
              : "The screen dims, the element stays lit, and Kaira's note is anchored to it."
          )}

        {panelGroup(
          "move",
          "Move",
          "from the To-do Move card",
          /* The states Move's own screen can be in, in the order a person
             meets them. Whether a coach routine exists is not one of them:
             that is the Care plan toggle at the top, and Move reading it
             separately is what let the two disagree. */
          [
            { id: "gate", label: "Health Connect permission", steps: null },
            { id: "syncing", label: "Allowed, syncing", steps: "phone", sync: "steps", logs: [] },
            { id: "connected", label: "Steps in, nothing logged", steps: "phone", logs: [] },
            {
              id: "walk",
              label: "One walk logged",
              steps: "phone",
              logs: [{ id: "briskwalk", minutes: 25, intensity: "moderate", timeMins: 7 * 60 + 30 }],
            },
            { id: "manual", label: "Logging by hand, nothing yet", steps: "manual", logs: [] },
            { id: "logroutine", label: "The coach's session, in the logger", steps: "phone", logs: [], pick: "routine" },
            { id: "sessiondone", label: "Session logged, the result screen", steps: "phone", logs: [], result: true },
            { id: "handsteps", label: "Steps added by hand", steps: "manual", manual: 4000, logs: [] },
          ].map((v) =>
            panelChip(
              v.label,
              v.result
                ? !!moveResult
                : v.pick
                ? logExOpen && logExPick === v.pick && !moveResult
                : !moveResult &&
                  moveDetail &&
                !logExOpen &&
                healthSource.steps === v.steps &&
                healthSync === (v.sync || null) &&
                moveTab === "today" &&
                (v.logs === undefined || exLogs.length === v.logs.length) &&
                (v.manual === undefined || manualSteps === v.manual),
              () => {
                setLogExOpen(false);
                setMoveDetail(true);
                setActiveTab("track");
                setHealthSource(v.steps === null ? { steps: null, sleep: null } : { ...healthSource, steps: v.steps });
                setHealthSync(v.sync || null);
                setMoveTab("today");
                if (v.logs !== undefined) setExLogs(v.logs);
                setManualSteps(v.manual === undefined ? null : v.manual);
                setMoveResult(null);
                /* The routine's answers go with the logs. A preset that
                   leaves yesterday's Easy and Difficult behind is a state
                   nobody can demo from the top. */
                setRoutineFeel({});
                setRoutineDone([]);
                if (v.pick) {
                  setKcalSource("coach");
                  setMovePlan("assigned");
                  openMoveLog(v.pick);
                }
                if (v.result) {
                  setKcalSource("coach");
                  setMovePlan("assigned");
                  const entry = { id: "routine", minutes: 20, intensity: "light", timeMins: 18 * 60 + 40 };
                  setExLogs([entry]);
                  setMoveResult({ entry, before: 0, after: 20, count: 4, total: 4 });
                }
              }
            )
          ),
          healthSource.steps === null
            ? "First open. Not skippable, because logging by hand is a real answer and the screen has nothing to show without one."
            : healthSync === "steps"
            ? "Mid-sync. The number is a skeleton rather than a zero, because zero would be a claim."
            : healthSource.steps === "manual"
            ? "Steps are yours to enter, so the Steps cell and a second button in the prompt both open the wheel."
            : exLogs.length === 0
            ? "Steps are in from the phone, so the card stops explaining. Minutes and kcal stay blank until something is logged."
            : logExOpen && logExPick === "routine"
            ? "The routine is one activity, not four, so the session is what gets logged and the minutes, the burn, the hero and the day's row all follow from it."
            : planAssigned
            ? "The coach routine is here because the Care plan is assigned. Work through the exercises here; Log exercise at the top of the screen is what tells the rest of the app the session happened."
            : "No routine, because the Care plan is not assigned yet. The opening card asks for movement so the coach has something to build from.",
          true
        )}

        {panelGroup(
          "dayWon",
          "Day won",
          "the full screen moment",
          [
            { id: "on", label: "Show it", v: true },
            { id: "off", label: "Dismissed", v: false },
          ].map((x) => panelChip(x.label, streakBurst === x.v, () => setStreakBurst(x.v))),
          "Plays by itself the moment the last row goes in, once, on the crossing from an open day to a closed one. Tap Everything ticked from a part way day to see it arrive on its own.",
          true
        )}

        {panelGroup(
          "skip",
          "Skipped tasks",
          "turned down for today",
          [
            { id: "none", label: "Nothing skipped" },
            { id: "calm", label: "Calm break skipped" },
            { id: "meal:eveningsnack", label: "Evening snack skipped" },
          ].map((v) =>
            panelChip(
              v.label,
              v.id === "none" ? daySkipped.length === 0 : daySkipped.includes(v.id),
              () => {
                if (v.id === "none") daySkipped.forEach((x) => toggleSkip(x));
                else if (!daySkipped.includes(v.id)) toggleSkip(v.id);
                setActiveTab("track");
              }
            )
          ),
          daySkipped.length
            ? "The row dims, its circle goes to a dash, and it leaves the count and the phase total. Nothing reads as missed. Tap its three dots to put it back."
            : "Every row is in today's count. The three dots is where turning one down lives, and once a row is done it offers undo or the way to the record instead.",
          true
        )}

        {panelGroup(
          "hero",
          "Track hero",
          "the top of To-do",
          HERO_STATES.map((v) =>
            panelChip(
              v.label,
              heroState === v.id,
              () => {
                setKcalSource(v.plan ? "coach" : "pending");
                setMovePlan(v.plan ? "assigned" : null);
                setDailyState(v.data);
                // The hero and the task cards read the same day, so seed the
                // food that goes with the state rather than only the summary.
                setTaskProgress({});
                setMealsLogged(DEMO_DAY.slice(0, v.data === "done" ? 3 : v.data === "partial" ? 1 : 0));
                setTodayOnboarded(true);
                setActiveTab("track");
              },
              v.full
            )
          ),
          (HERO_STATES.find((v) => v.id === heroState) || {}).desc
        )}

        {planAssigned &&
          panelGroup(
            "measuretasks",
            "Measure tasks",
            "which device syncs are asked for",
            [
              { id: "bca", label: "BCA", full: "Body composition only" },
              { id: "cgm", label: "CGM", full: "Glucose monitor only" },
              { id: "both", label: "Both", full: "Both device syncs" },
            ].map((v) =>
              panelChip(
                v.label,
                measureTasks === v.id,
                () => {
                  setMeasureTasks(v.id);
                  setTodayOnboarded(true);
                  if (!eatDetail && !moveDetail && activeTab !== "track") {
                    setActiveTab("track");
                  }
                },
                v.full,
                v.full
              )
            ),
            measureTasks === "both"
              ? "Two cards under one Measure heading, so the day is 5 tasks."
              : "One card under Measure, so the day is 4 tasks."
          )}

        {panelGroup(
          "targets",
          "Sufficiency card",
          "the hero on Eat",
          SUFF_STATES.map((v) =>
            panelChip(
              v.label,
              suffCardState === v.id,
              () => {
                setLogResult(null);
                setToast(null);
                setLogOpen(false);
                // The card reads the care plan, so set the plan rather than
                // the target owner it used to have its own switch for.
                setKcalSource(v.plan ? "coach" : "pending");
                setMovePlan(v.plan ? "assigned" : null);
                setMealsLogged(DEMO_DAY.slice(0, v.meals));
                setEatState("ft");
                setEatDetail(true);
              }
            )
          ),
          (SUFF_STATES.find((v) => v.id === suffCardState) || {}).desc ||
            "A mix the presets do not cover. Tap any preset to land somewhere known.",
          true
        )}

        {panelGroup(
          "logging",
          "Food logging",
          "from Eat, snap / voice / search",
          [
            { id: "off", label: "Off", full: "Nothing open" },
            { id: "search", label: "Search", full: "Log a meal, search and add" },
            { id: "onplan", label: "On the plan", full: "Opened from a meal row, breakfast option 1 already picked" },
            { id: "snap", label: "Photo", full: "Kaira reading a photo of the plate" },
            { id: "voice", label: "Voice", full: "Kaira hearing what you ate" },
            { id: "result", label: "Result", full: "Meal logged, sufficiency rising" },
            { id: "toast", label: "Toast", full: "The confirmation toast" },
            { id: "donetoast", label: "Task done toast", full: "What you see when a diary task finishes on another screen" },
            { id: "reset", label: "Clear day", full: "Wipe everything logged today" },
          ].map((v) =>
            panelChip(
              v.label,
              v.id === "snap" || v.id === "voice"
                ? kairaLog === v.id
                : v.id === "search"
                ? logOpen && !logPlan && !kairaLog
                : v.id === "onplan"
                ? logOpen && !!logPlan
                : v.id === "result"
                ? !!logResult
                : v.id === "off" && !logOpen && !logResult,
              () => {
                setLogOpen(v.id === "search" || v.id === "snap" || v.id === "voice");
                setKairaLog(v.id === "snap" || v.id === "voice" ? v.id : null);
                setLogResult(null);
                setToast(null);
                if (v.id === "result") {
                  const meal = { division: "breakfast", timeMins: 8 * 60 + 30, items: [{ id: "poha", qty: 1 }, { id: "chai", qty: 1 }] };
                  setMealsLogged(mealsLogged.concat(meal));
                  setLogResult({ before: 0, after: 21, meal, mealCount: mealsLogged.length + 1 });
                }
                if (v.id === "toast") {
                  setToast({ title: "Meal logged", line: "Breakfast at 8:30 AM", coins: 4 });
                  setEatDetail(true);
                }
                if (v.id === "donetoast") {
                  setToast({ title: "Done for today", line: "Breakfast \u00b7 3 of 9 today", coins: 4, task: "eat" });
                  setEatDetail(true);
                }
                if (v.id === "reset") {
                  setMealsLogged([]);
                  setLogItems([]);
                  setEatDetail(true);
                }
                if (v.id === "search" || v.id === "off") setEatDetail(v.id === "off");
                /* The route a meal row takes: a plan has to be in for the
                   coach to have written an option to open on. */
                if (v.id === "onplan") {
                  setKcalSource("coach");
                  setMovePlan("assigned");
                  setTodayOnboarded(true);
                  setEatDetail(false);
                  setActiveTab("track");
                  openMealLog("breakfast", 0);
                }
              },
              v.full
            )
          ),
          logResult
            ? "The score counts up from where it was and the four bars grow. Done pays Flipcoins and fires the toast."
            : kairaLog
            ? "The camera and the mic beside the search box, both hers. She hands back items rather than prose, and the logger's own button still does the recording, so a wrong guess is fixed before it is a record."
            : logOpen && logPlan
            ? "Opened on the coach's option, so Your plan is the tab you land on and its food is already in the meal. Nothing is recorded until Log."
            : logOpen
            ? "Favourites and Frequent, live search, heart to favourite, stepper on anything added. The time pill decides which division it lands in."
            : mealsLogged.length + " meal(s) logged today. They appear in Eat under the division their time falls in."
        )}

        {panelGroup(
          "suff",
          "Sufficiency walkthrough",
          "from the Eat FTUX card",
          [
            { id: null, label: "Off", full: "Not running" },
            { id: "learn", label: "Learn", full: "What sufficiency is" },
            { id: "profile", label: "Targets", full: "Your body, your targets" },
            { id: "meals", label: "Meals", full: "What do you usually eat" },
            { id: "result", label: "Score", full: "Your usual day scores 63%" },
            { id: "lifted", label: "Lifted", full: "After the add-ons, 78%" },
          ].map((v) =>
            panelChip(
              v.label,
              suffFlow === v.id,
              () => {
                setSuffFlow(v.id);
                setSuffLift(false);
                if (v.id) {
                  setEatDetail(false);
                  setActiveTab("home");
                }
              },
              v.full
            )
          ),
          {
            learn: "The one comparison, the four nutrients, why enough matters, WHO and ICMR.",
            profile: "The four facts from sign up, and the four targets they produce.",
            meals: "Tap dishes, tap again for seconds, or add your own in a sheet.",
            result: "Hexagon score, four nutrient rings, and the upside blurred until earned.",
            lifted: "Same screen after the add-ons, with what moved and the hand-off to logging.",
          }[suffFlow] ||
            "Not running. Open Eat detail in its FT state to start it the way a user would."
        )}

        {panelGroup(
          "streakscreen",
          "Streak screens",
          "opened from the strip",
          [
            { id: null, label: "Strip", full: "Home strip only" },
            { id: "guide", label: "Guide", full: "How streaks work" },
          ].map((v) =>
            panelChip(
              v.label,
              streakOpen === v.id,
              () => {
                setStreakOpen(v.id);
                setActiveTab("home");
              },
              v.full
            )
          ),
          streakOpen === "guide"
            ? "The whole rule in three lines, where you are today, and what the 7 and 30 day runs pay."
            : "Home strip only. It reads the day's own tasks, so it can never disagree with the row."
        )}

        {panelGroup(
          "streak",
          "Streak strip",
          "above the program tabs",
          [
            { id: "new", label: "No streak", full: "Nothing running yet" },
            { id: "active", label: "Running", full: "A run in progress" },
            { id: "broken", label: "Ended", full: "A day was missed" },
          ].map((v) =>
            panelChip(
              v.label,
              streakState === v.id,
              () => {
                setStreakState(v.id);
                // The count and the state have to agree, or the strip
                // contradicts itself.
                if (v.id === "new" || v.id === "broken") setStreakDays(0);
                else if (streakDays === 0) setStreakDays(5);
              },
              v.full
            )
          ),
          {
            new: "An invitation, not a scoreboard. Shows how far into today you are.",
            active: "The count, plus the day's flame filling as tasks land.",
            broken: "Back to zero, with today offered as the way to start again. There is no revive.",
          }[streakState]
        )}

        {panelGroup(
          "milestones",
          "Milestones",
          "streak guide, long game",
          [
            { id: "new", label: "All open", full: "Nothing hit yet", v: { earned: [], missed: [] } },
            { id: "one", label: "1 earned", full: "First month earned", v: { earned: [1], missed: [] } },
            { id: "mix", label: "Earned + missed", full: "First earned, third let go", v: { earned: [1], missed: [3] } },
            { id: "far", label: "Half way", full: "Through six months", v: { earned: [1, 3, 6], missed: [] } },
          ].map((v) =>
            panelChip(
              v.label,
              milestones.earned.join() === v.v.earned.join() &&
                milestones.missed.join() === v.v.missed.join(),
              () => {
                setMilestones(v.v);
                setStreakOpen("guide");
                setActiveTab("home");
              },
              v.full
            )
          ),
          "A dot per milestone: grey is still open, green is earned, red is one that was let go."
        )}

        {isPaid &&
          panelGroup(
            "planarrive",
            "Plan assignment",
            "To-do, the card above the list",
            [
              { id: "none", label: "No plans yet", eatIn: false, moveIn: false, mindIn: false, seen: [] },
              { id: "eat", label: "Diet plan in", eatIn: true, moveIn: false, mindIn: false, seen: [] },
              { id: "move", label: "Exercise plan in", eatIn: false, moveIn: true, mindIn: false, seen: [] },
              { id: "mind", label: "Mind plan in", eatIn: false, moveIn: false, mindIn: true, seen: [] },
              { id: "both", label: "All three in", eatIn: true, moveIn: true, mindIn: true, seen: [] },
            ].map((v) => {
              const on =
                (kcalSource === "coach") === v.eatIn &&
                !!movePlan === v.moveIn &&
                !!mindPlan === v.mindIn &&
                planSeen.length === v.seen.length;
              return panelChip(
                v.label,
                on,
                () => {
                  setKcalSource(v.eatIn ? "coach" : "pending");
                  setMovePlan(v.moveIn ? "assigned" : null);
                  setMindPlan(v.mindIn ? "assigned" : null);
                  setPlanSeen(v.seen);
                  setTodayOnboarded(true);
                  setEatDetail(false);
                  setMoveDetail(false);
                  setActiveTab("track");
                },
                {
                  none: "All three chips dashed, and the card says plainly that plans come after the first consultation. The info dot opens why.",
                  eat: "Diet chip fills in, the other two stay dashed. No cross yet, because the card still owes an answer about the rest.",
                  move: "The same with exercise, and the copy turns plural for the two still being written.",
                  mind: "The psychologist's, which also turns Mind's worksheets on. They are gated on her plan rather than on the other two.",
                  both: "All three solid. The cross appears, and the sheet gets tabs.",
                }[v.id]
              );
            }).concat(
              /* What arrives before any of the above. The plan is written while
                 the person is somewhere else, so these are the first things
                 they read about it, and neither one is a screen in this app. */
              [
                {
                  id: "push",
                  label: "Push notification",
                  Icon: Bell,
                  d: "Push notification. The one that lands face up on a table. Two lines and a name, because a glance is all it gets.",
                },
                {
                  id: "whatsapp",
                  label: "WhatsApp messages",
                  Icon: MessageCircle,
                  d: "WhatsApp messages. Both exactly as they go out today, diet and exercise, so a rewrite has the real thing to be argued against.",
                },
              ].map((v) =>
                panelChip(
                  v.label,
                  v.id === "booking" ? bookOpen : planNotif === v.id,
                  () => {
                    setTodayOnboarded(true);
                    setEatDetail(false);
                    setMoveDetail(false);
                    setActiveTab("track");
                    if (v.id === "booking") {
                      /* Nobody books a consultation they have already had, so
                         this lands on the state that owns the screen. */
                      setKcalSource("pending");
                      setMovePlan(null);
                      setMindPlan(null);
                      setPlanNotif(null);
                      setBookWith(null);
                      setBookOpen(true);
                      return;
                    }
                    setKcalSource("coach");
                    setPlanSeen([]);
                    setBookOpen(false);
                    setPlanNotif(v.id);
                  },
                  v.d,
                  undefined,
                  undefined,
                  v.Icon
                )
              )
            ),
            bookOpen
              ? "Reachable from the plan card's sheet, which explained the wait and then left the one thing anybody could do about it off the screen."
              : planNotif === "push"
              ? "Two lines and a name. No date and no duration: the long version has those, and a push that lists them spends its one glance on arithmetic."
              : planNotif === "whatsapp"
              ? "Verbatim, em dashes and all. Reachable from here alone, because it is not a screen in this app."
              : "One card, four states. The chips stay put and fill in as each plan lands."
          )}

        {panelGroup(
          "coachtip",
          "Coach tip",
          "the bulb on a tip row",
          [
            { id: null, label: "Closed", d: "The day as it sits. Tip rows carry a grey info mark beside their pillar chip." },
            { id: "note:methi", label: "Warm water with methi", d: "The explainer for the morning tip: what a tip is, the coach's own line, and the way to Kaira." },
            { id: "note:sun", label: "10 minutes of morning sun", d: "The same sheet on the Mind nudge, so the pillar wording follows the row." },
            { id: "ask", label: "Kaira answering", d: "The chat, opened on the question already sent. She thinks for a beat, then answers in two parts." },
          ].map((v) =>
            panelChip(
              v.label,
              v.id === "ask" ? !!kairaAsk : v.id === null ? !tipInfo && !kairaAsk : tipInfo === v.id && !kairaAsk,
              () => {
                setActiveTab("track");
                setEatDetail(false);
                setMoveDetail(false);
                setMindDetail(false);
                // Both need a plan: the nudges are part of what a coach wrote.
                setKcalSource("coach");
                setMovePlan("assigned");
                setTodayOnboarded(true);
                if (v.id === "ask") { setTipInfo(null); askKaira("note:methi"); }
                else { setKairaAsk(null); setTipInfo(v.id); }
              },
              v.d
            )
          ),
          kairaAsk
            ? "Reading it is not doing it, so the chat pays nothing and leaves the row open. Closing it puts you back on the day."
            : tipInfo
            ? "One sheet for every tip. What it says about the pillar and the coach's line both come off the row, so a new nudge needs no new copy."
            : "A grey info mark beside the pillar chip. Every hue belongs to a pillar, so the one mark that belongs to none of them claims no colour at all.",
          true
        )}

        {panelGroup(
          "dayparts",
          "Evening vs Night",
          "To-do headings, and Home's part of day card",
          [
            {
              id: 4,
              label: "Four parts",
              sub: "Evening 4 to 7",
              d: "Morning, afternoon, evening, night. An Indian day has four names for itself: subah, dopahar, shaam, raat. Morning from 5 AM, afternoon from noon, evening from 4 PM, night from 7 PM.",
            },
            {
              id: 3,
              label: "Three parts",
              sub: "Evening 5 onwards",
              d: "Morning, afternoon, evening, the way it was built. Evening runs from 5 PM to the end of the day and carries dinner, the calm break and the bedtime snack.",
            },
          ].map((v) =>
            panelChip(
              v.label,
              phaseMode === v.id,
              () => {
                setPhaseMode(v.id);
                setEatDetail(false);
                setMoveDetail(false);
                setMindDetail(false);
                // Both screens read these phases, so stay on whichever one is
                // in front of you rather than being thrown to the other.
                if (activeTab !== "home") setActiveTab("track");
              },
              v.d,
              undefined,
              v.sub
            )
          ),
          phaseMode === 4
            ? "Dinner, the calm break and the bedtime snack move under Night, so the last stretch of the day gets a finish line of its own."
            : "One evening from 5 PM to bedtime, holding roughly half the list.",
          true
        )}

        {panelGroup(
          "taskcard",
          "To-do layout",
          "To-do, the day's list",
          [
            { id: "row", label: "Rows", d: "Today's list: tight rows inside one card per part of the day." },
            { id: "stack", label: "Card, badge on top", d: "Pillar mark and pay across the top, the task under them." },
            { id: "inline", label: "Card, badge inline", d: "Mark, title and pay on one line, the body underneath." },
            { id: "icon", label: "Card, icon in the circle", d: "The circle carries the pillar until it is ticked. No badge at all." },
            { id: "timeline", label: "Timeline", d: "One spine down the left, times in a single column, cards hanging off it. A day read as a schedule." },
            { id: "timeline2", label: "Timeline with now", d: "The same spine, marked where the clock is. Solid behind you, dashed ahead." },
            { id: "focus", label: "Next one open", d: "The task in front of you is a card. Everything else is a line, so the screen answers what now without hiding the day." },
            { id: "settle", label: "Done settles", d: "Cards, but a finished task shrinks to one dim line. The list gets shorter as the day goes." },
          ].map((v) =>
            panelChip(v.label, taskCard === v.id, () => {
              setTaskCard(v.id);
              setActiveTab("track");
              setEatDetail(false);
              setMoveDetail(false);
              setMindDetail(false);
            }, v.d)
          ),
          {
            row: "The phase container holds the rows. Shortest list, least room per task.",
            stack: "Tallest of the three, and the easiest to scan by pillar.",
            inline: "Closest to the rows, with the body given room it never had.",
            icon: "The quietest. One element carries both the pillar and the state.",
            timeline: "Times align in one column, so the eye travels down one edge instead of fourteen right margins.",
            timeline2: "The thread says how far into the day you are. No red, no lateness, just where the clock sits.",
            focus: "Lowest reading cost: one card, thirteen lines.",
            settle: "Finished work stops competing for attention.",
          }[taskCard]
        )}

        {panelGroup(
          "weekread",
          "Weekly trend insight",
          "To-do, an evening row",
          [
            { id: "off", label: "Off", d: "Not the end of a week. Nothing in the day about it." },
            { id: "ready", label: "Ready to read", d: "A row in the evening that opens Kaira's read of the week." },
            { id: "read", label: "Already read", d: "The row struck through, like any other finished task." },
          ].map((v) =>
            panelChip(v.label, weekInsight === v.id, () => {
              setWeekInsight(v.id);
              setWeekReads([]);
              setActiveTab("track");
              setEatDetail(false);
              setMoveDetail(false);
              setMindDetail(false);
            }, v.d)
          ).concat(
            [
              { id: "tasks", label: "As 3 tasks", d: "One read per pillar: sleep in the morning, movement in the afternoon, food after dinner." },
              { id: "sheet", label: "As one sheet", d: "A single Measure row in the evening that opens all three at once." },
            ].map((v) =>
              panelChip(v.label, weekMode === v.id, () => {
                setWeekMode(v.id);
                setWeekReads([]);
                setActiveTab("track");
                setEatDetail(false);
                setMoveDetail(false);
                setMindDetail(false);
              }, v.d)
            )
          ),
          {
            off: "Six days out of seven there is no week to read, so nothing is in the day.",
            ready:
              weekMode === "sheet"
                ? "One Measure task at 6:30 PM, opening the whole week. Opening it is what finishes it."
                : "Three reads across the day, each opening its own pillar's trend on a week worth reading.",
            read: "Done for today, and every page still opens if they want it again.",
          }[weekInsight]
        )}

        {panelGroup(
          "movetrend",
          "Move trend",
          "Move, the Trend tab",
          [
            { id: "none", label: "Nothing yet", d: "The week drawn empty, with the reason for the wait." },
            { id: "few", label: "Two days in", d: "Two days solid, five dashed. Still too thin to read." },
            { id: "week", label: "A week to read", d: "Four active days with gaps in the middle, and the one change worth making." },
            { id: "weeks", label: "Two steady weeks", d: "Six of seven days, nothing to fix, and the deltas turn positive." },
          ].map((v) =>
            panelChip(v.label, moveWeek === v.id, () => {
              setMoveWeek(v.id);
              setMoveTab("trend");
              // The permission gate covers the whole screen, so a trend state
              // that cannot be seen is not a state.
              setHealthSource({ ...healthSource, steps: "phone" });
              setMoveDetail(true);
            }, v.d)
          ),
          {
            none: "No week yet. The page shows what is coming rather than an empty chart.",
            few: "Two days in, so Kaira holds off reading it.",
            week: "Minutes a day against the target, the same week as steps, and three numbers under it.",
            weeks: "The steady version, where the read is to keep going.",
          }[moveWeek]
        )}

        {panelGroup(
          "mindtrend",
          "Mind trend",
          "Mind, the Trend tab",
          [
            { id: "none", label: "Nothing yet", d: "The week drawn empty, with the reason for the wait." },
            { id: "few", label: "Two nights in", d: "Too few nights to tell length from timing." },
            { id: "week", label: "A week to read", d: "Six nights, long enough, but the bed times swing across two and a half hours." },
            { id: "weeks", label: "A settled week", d: "Seven nights inside half an hour of each other." },
          ].map((v) =>
            panelChip(v.label, mindWeek === v.id, () => {
              setMindWeek(v.id);
              setMindTab("trend");
              setHealthSource({ ...healthSource, sleep: "phone" });
              setMindDetail(true);
            }, v.d)
          ),
          {
            none: "No week yet. The page shows what is coming rather than an empty chart.",
            few: "Two nights in, so Kaira holds off reading it.",
            week: "Hours a night against the target, and under it the hour each night started, where the wobble shows.",
            weeks: "The settled version: the dots line up and the read is to hold it.",
          }[mindWeek]
        )}

        {panelGroup(
          "homecard",
          "Home card shape",
          "Home, Today's focus",
          [
            { id: "split", label: "Day and pillars", full: "The day in one card, the pillars as their own section" },
            { id: "next", label: "Up next", full: "One thing next, then the rings" },
            { id: "phase", label: "This part of day", full: "The open part of the day, then the rings" },
            { id: "task", label: "Next task", full: "Your next task is, then the pillars, then a slim streak bar" },
          ].map((v) =>
            panelChip(v.label, homeCard === v.id, () => { setHomeCard(v.id); setActiveTab("home"); }, v.full)
          ),
          {
            split: "Slim streak, three tasks, then Metabolism as four places to go.",
            next: "Home summarises, To-do lists. Shortest card.",
            phase: "Up to three rows of whatever part of the day is open.",
            task: "One task named, the four pillars, and the streak as a slim line at the foot.",
          }[homeCard]
        )}

        {panelGroup(
          "metabcard",
          "Metabolism strip",
          "Home, under the day",
          [
            { id: "tiles", label: "Four tiles", full: "Icon and name only, four ways in" },
            { id: "gauge", label: "Gauge", full: "A bar along the foot showing where the score sits" },
            { id: "medal", label: "Medal", full: "Upright and narrow, the badge over the name" },
            { id: "peek", label: "Hexagon", full: "Solid hexagon, a third of it past the edge" },
            { id: "headline", label: "Headline", full: "The figure large, the pillar named beside it" },
          ].map((v) =>
            panelChip(v.label, metabCard === v.id, () => { setMetabCard(v.id); setActiveTab("home"); }, v.full)
          ),
          {
            tiles: "The four squares as they are today. The same four words whatever the day did.",
            peek: "Each pillar's score in its own colour, the number in white, the shape running off the card. Loudest of the four.",
            medal: "A shelf rather than a queue. Narrow enough that more than one is readable without swiping.",
            gauge: "The only one that says whether the number is good. 62 out of 100 means nothing until you see how far along it sits.",
            headline: "Four figures and whose they are, and nothing else. The explaining happens on the screen it opens.",
          }[metabCard]
        )}

        {panelGroup(
          "focus",
          "Today's focus",
          "Home row + To-do list",
          FOCUS_PRESETS.map((v) =>
            panelChip(
              v.label,
              focusPreset === v.id,
              () => {
                const d = v.seed || {};
                setDailyState(focusState(v));
                setTodayOnboarded(!v.ftux);
                setTaskProgress(d.every ? ALL_DONE : {});
                /* Everything ticked means the coach's own first option eaten
                   at every division, so the six meal rows all close rather
                   than the three that happen to be in the demo day. */
                setMealsLogged(
                  d.every
                    ? eatDivisions.map((x, i) => ({
                        division: x.id,
                        timeMins: 7 * 60 + i * 150,
                        items: (x.plan || [[]])[0],
                      }))
                    : DEMO_DAY.slice(0, d.meals || 0)
                );
                setExLogs(DEMO_EXERCISE.slice(0, d.every ? 1 : 0));
                setMindDone(d.every || d.mind ? ["breathing"] : []);
                setSleepLogs(d.every || d.mind ? [{ bed: 23 * 60, wake: 6 * 60 + 40 }] : []);
                setWater(d.every ? 2 : d.water || 0);
                /* Both lists are read off the day the plan actually builds
                   rather than written out here. A hand written list stays
                   right until the plan grows one more capsule or the
                   psychologist adds one more worksheet, and then Everything
                   ticked quietly stops meaning everything. */
                setDayTicks(
                  d.every
                    ? eatDivisions.flatMap((x) => (x.notes || []).map((n) => n.id))
                    : d.ticks || []
                );
                setTemplateKept(
                  d.every ? Object.fromEntries(MIND_TEMPLATES.map((t) => [t.id, true])) : {}
                );
                setManualSteps(d.every ? 10200 : null);
                setHealthSource({ steps: "manual", sleep: "manual" });
                setHealthSync(null);
                setDaySkipped([]);
                if (weekInsight !== "off") setWeekInsight(d.every ? "read" : "ready");
                if (!d.every) setWeekReads([]);
                setStreakDays(v.days);
                setStreakState(v.days > 0 ? "active" : "new");
                setTaskDone(null);
                setStreakInfo(false);
                // First run means the four habits explainer, which lives on
                // To-do. Landing on Home would show the teaching card instead,
                // which is a different screen from the one this group is for.
                if (v.ftux) setActiveTab("track");
                else if (activeTab !== "home" && activeTab !== "track") setActiveTab("track");
              }
            )
          ),
          (FOCUS_PRESETS.find((v) => v.id === focusPreset) || {}).desc ||
            "A mix the presets do not cover. Tap any preset to land somewhere known.",
          true
        )}

        {panelGroup(
          "mind",
          "Mind",
          "from the To-do Mind card",
          [
            { id: "smart", label: "A worksheet, open", tpl: "smart" },
            { id: "worry", label: "The worry tree, open", tpl: "worry" },
            { id: "tracker", label: "The week tracker, open", tpl: "tracker" },
            { id: "gate", label: "Health Connect permission" },
            { id: "syncing", label: "Allowed, syncing" },
            { id: "phone", label: "Sleep in from Health Connect" },
            { id: "manualnone", label: "Logging by hand, no night yet" },
            { id: "manual", label: "One night logged by hand" },
            { id: "tools", label: "Two tools done" },
          ].map((v) =>
            panelChip(
              v.label,
              v.tpl
                ? mindTemplate === v.tpl
                : !mindTemplate &&
                  mindDetail &&
                  !logSleepOpen &&
                  mindTab === "today" &&
                  healthSource.sleep === SLEEP_SRC[v.id] &&
                  healthSync === (v.id === "syncing" ? "sleep" : null) &&
                  (v.id !== "manual") === (sleepLogs.length === 0) &&
                  (v.id === "tools") === (mindDone.length > 0),
              () => {
                setLogSleepOpen(false);
                setActiveTab("track");
                setMindTab("today");
                /* A worksheet only exists once a psychologist has set one, and
                   it opens over whatever is in front of you rather than on
                   Mind, the way the day's own row opens it. */
                if (v.tpl) {
                  setKcalSource("coach");
                  setMovePlan("assigned");
                  setMindPlan("assigned");
                  setTodayOnboarded(true);
                  setMindDetail(false);
                  setTemplateKept({});
                  setMindTemplate(v.tpl);
                  return;
                }
                setMindTemplate(null);
                setMindDetail(true);
                setHealthSource(SLEEP_SRC[v.id] === null ? { steps: null, sleep: null } : { ...healthSource, sleep: SLEEP_SRC[v.id] });
                setHealthSync(v.id === "syncing" ? "sleep" : null);
                setSleepLogs(v.id === "manual" ? [{ bed: 23 * 60 + 40, wake: 6 * 60 + 30 }] : []);
                setMindDone(v.id === "tools" ? ["mood", "breathing"] : []);
                setMindKept(v.id === "tools" ? { mood: "Calm" } : {});
              }
            )
          ),
          mindTemplate
            ? "A psychologist's worksheet, opened from its card on Mind or from the row on the day. What somebody writes is the record, so filling it is what finishes it."
            : healthSource.sleep === "manual"
            ? "Sleep is entered by hand, so the ring is the way in. Connected, it is a reading and the ring is not a button."
            : "Sleep arrives on its own, so there is nothing to log here. The tools below are the day's work.",
          true
        )}

        {panelGroup(
          "nextaction",
          screenKey === "todo" ? "Prerequisites" : "Next actions card",
          screenKey === "todo" ? "To-do, above the list" : "Home carousel, second card",
          [
            { id: "all", label: "All three waiting", v: ["score", "labs", "assess"], d: [] },
            { id: "one", label: "Score done", v: ["score", "labs", "assess"], d: ["score"] },
            { id: "two", label: "One left", v: ["score", "labs", "assess"], d: ["score", "labs"] },
            { id: "none", label: "Nothing pending", v: ["score", "labs", "assess"], d: ["score", "labs", "assess"] },
          ].map((x) =>
            panelChip(
              x.label,
              x.v.join() === nextActions.join() && x.d.join() === nextDone.join(),
              () => {
                setNextList(x.v, x.d);
                setPrereqOpen(null);
                if (x.v.length) setHomeProgramTab("next");
                // The same list is read in two places. Stay on whichever one
                // is in front of you rather than being thrown to the other.
                if (activeTab !== "track") setActiveTab("home");
              }
            )
          ).concat(
            panelChip(
              "Collapsed strip",
              !prereqHidden && !prereqExpanded,
              () => {
                setPrereqHidden(false);
                setPrereqOpen(false);
                setActiveTab("track");
              },
              "The shut state: one line with what is left and how far along. What a plan arriving now leaves behind."
            ),
            panelChip(
              "Expanded cards",
              !prereqHidden && prereqExpanded,
              () => {
                setPrereqHidden(false);
                setPrereqOpen(true);
                setActiveTab("track");
              },
              "The open state: heading, reason and the cards themselves."
            ),
            panelChip(
              "Where they went",
              prereqAsk,
              () => {
                setPrereqHidden(false);
                setActiveTab("track");
                setPrereqAsk(true);
              },
              "The sheet the Hide button opens: what these are and where to find them once they are put away."
            ),
            panelChip(
              "Hidden on To-do",
              prereqHidden,
              () => {
                setPrereqHidden(true);
                setActiveTab("track");
              },
              "Put away from the top of the day. The work is still open and still on Home."
            )
          ),
          prereqAsk
            ? "Hiding asks before it acts. These two are what the whole program waits on, so a section that vanished on one tap would read as something broken."
            : prereqHidden
            ? "Let go from the top of To-do. Still on Home under Next actions, because hiding the reminder does not finish the work."
            : nextOpen.length
            ? "One amber card each, on To-do above the list and on Home inside the carousel. The same list read in both places, so finishing one finishes it everywhere."
            : "No cards and no tab. A tab leading to nothing pending is worse than no tab.",
          true
        )}

        {panelGroup(
          "score",
          "MET Score card",
          "Home, both plans",
          [
            { id: "locked", label: "Locked", full: "No score yet" },
            { id: "first", label: "First score", full: "First score, risk band" },
            { id: "up", label: "Improved", full: "Score went up" },
            { id: "flat", label: "No change", full: "Score held flat" },
            { id: "down", label: "Reduced", full: "Score went down" },
          ].map((v) =>
            panelChip(v.label, scoreState === v.id, () => setScoreState(v.id), v.full)
          ),
          {
            locked: "Ring shows a lock, no number, no last updated date.",
            first: "Ring shows the score. Reads as a risk band, no delta yet.",
            up: "Ring plus an increase and the last updated date.",
            flat: "Ring plus no recent changes and the last updated date.",
            down: "Ring plus a decrease and the last updated date.",
          }[scoreState]
        )}

        {panelGroup(
          "scoreflow",
          "Metabolic score flow",
          "from Take your metabolic score",
          [
            { id: null, label: "Closed", full: "Not running" },
            { id: "intro", label: "What it is", full: "The four parts, one of them shut behind a lab test" },
            { id: "focus", label: "What to look at", full: "The one question that is about you rather than your measurements" },
            { id: "profile", label: "Questions", full: "One at a time, with a bar" },
            { id: "review", label: "Review", full: "Every answer, each editable back to its own question" },
            { id: "result", label: "The score", full: "277 of 400, with the shut quarter drawn shut" },
          ].map((v) =>
            panelChip(v.label, scoreFlow === v.id, () => { setScoreStep(0); setScoreFlow(v.id); }, v.full)
          ),
          scoreFlow
            ? "Five steps that turn a few answers into one number. The figures are staged: a form that really collected height and weight would move BMR, TDEE and every macro under it."
            : "Opens from the Take your metabolic score card. Finishing it is what ticks that card off, rather than the tap that opened it.",
          true
        )}

        {isPaid &&
          panelGroup(
            "live",
            "Live sessions",
            "Home carousel, last card",
            [
              { id: "one", label: "One scheduled", full: "A specialist's hour, open to everybody on the program" },
              { id: "none", label: "None scheduled", full: "No live session, so no card and no tab" },
            ].map((v) =>
              panelChip(v.label, liveState === v.id, () => { setLiveState(v.id); setActiveTab("home"); setHomeProgramTab(v.id === "one" ? "live" : "program"); }, v.full)
            ),
            liveState === "one"
              ? "Not a consultation: nobody books it, it is not yours, and it runs whether or not you turn up. Tinted rather than white so it does not read as another slot with your name on it."
              : "No card and no tab. A tab leading to nothing scheduled is worse than no tab.",
            true
          )}

        {isPaid &&
          panelGroup(
            "sessions",
            "Session state",
            "paid Home, second card",
            [
              { id: "none", label: "No sessions", full: "No upcoming sessions" },
              { id: "booked", label: "Booked", full: "Session booked" },
            ].map((s) =>
              panelChip(
                s.label,
                sessionState === s.id,
                () => setSessionState(s.id),
                s.full
              )
            ),
            sessionState === "booked"
              ? "Second card shows the coach, the slot and a join button."
              : "Second card shows the empty state with a book action."
          )}

        {panelGroup(
          "home",
          "Home state",
          "free Home only",
          [
            { id: "free", label: "Free" },
            { id: "returning", label: "Returning" },
            { id: "device", label: "Device" },
            { id: "deviceReturning", label: "Device Returning" },
          ].map((s) =>
            panelChip(s.label, userState === s.id, () => {
              setUserState(s.id);
              setEatDetail(false);
              setActiveTab("home");
            })
          )
        )}

        {(() => {
          const eatStages = [
            {
              id: "ft",
              label: "FT",
              full: "First time",
              desc: "Journey not set up. One start banner, no ring, no logs, no hook card. Trend is empty.",
            },
            {
              id: "fad",
              label: "FAD",
              full: "First activity done",
              desc: "Day 1 of 7. Ring and sufficiency card appear; insight is still building. Trend is empty.",
            },
            {
              id: "kg",
              label: "KG",
              full: "Knowledge gap",
              desc: "Day 3 of 7. Adds a Kaira help card and an article on the protein gap. Trend is empty.",
            },
            {
              id: "wc",
              label: "WC",
              full: "Week completed",
              desc: "First weekly insight unlocked. Trend now has the full report: graph, gap, averages.",
            },
            {
              id: "w2",
              label: "W2",
              full: "Week two",
              desc: "Day 2 of a second week. Everything reads as a comparison against last week.",
            },
            {
              id: "cg",
              label: "CG",
              full: "Capability gap",
              desc: "Protein flat across two weeks. Trend adds a free-consult card, the hand-off to a coach.",
            },
          ];
          const current = eatStages.find((s) => s.id === eatState);
          return panelGroup(
            "eat",
            "Eat stage",
            "applies in Eat detail",
            eatStages.map((s) =>
              panelChip(
                s.label,
                eatState === s.id,
                () => {
                  setEatState(s.id);
                  setEatDetail(true);
                },
                s.full + ". " + s.desc,
                s.full
              )
            ),
            current && current.desc
          );
        })()}

        {showAll && (
          <>
        <button
          onClick={() => {
            setDailyState("ftux");
            setTour(null);
            setProgramIntroSeen(false);
            setProgramIntro(null);
            setOnboardingStep(0);
            setOnboardingOpen(true);
          }}
          style={{
            width: "100%",
            marginTop: 9,
            fontSize: 11,
            fontWeight: 600,
            padding: "7px 0",
            borderRadius: 8,
            border: "1px solid #D0D5DD",
            background: "#FFFFFF",
            color: "#475467",
            cursor: "pointer",
          }}
        >
          Run onboarding flow
        </button>

        <button
          onClick={() => {
            setTodayOnboarded(false);
            setActiveTab("track");
          }}
          style={{
            width: "100%",
            marginTop: 9,
            fontSize: 11,
            fontWeight: 600,
            padding: "7px 0",
            borderRadius: 8,
            border: "1px solid #D0D5DD",
            background: "#FFFFFF",
            color: "#475467",
            cursor: "pointer",
          }}
        >
          Reset Today FTUX
        </button>

        <button
          onClick={() => setEatDetail(!eatDetail)}
          style={{
            width: "100%",
            marginTop: 9,
            fontSize: 11,
            fontWeight: 600,
            padding: "7px 0",
            borderRadius: 8,
            border: "1px solid #D0D5DD",
            background: "#FFFFFF",
            color: "#475467",
            cursor: "pointer",
          }}
        >
          {eatDetail ? "Close Eat detail" : "Open Eat detail"}
        </button>
          </>
        )}

        {(() => {
          const approaches = [
            {
              id: "a0",
              label: "A0",
              full: "Achieve",
              desc: "The existing layout. Achieve tab is built; MET Score and Vitals are placeholders.",
            },
            {
              id: "ms",
              label: "MS",
              full: "Metabolic score",
              desc: "Score-anchored. Four components including a locked Body, plus two detail pages.",
            },
            {
              id: "a1",
              label: "A1",
              full: "Reflection first",
              desc: "Kaira's read leads. Mind is a dotted line: unmeasured, not failed. Five nudge cards.",
            },
            {
              id: "msa2",
              label: "MSA2",
              full: "Refined score",
              desc: "Current direction. Score card, lab nudge, Kaira summary. Detail page still to be defined.",
            },
          ];
          const current = approaches.find((a) => a.id === measureApproach);
          return panelGroup(
            "measure",
            "Measure approach",
            "applies on Measure",
            approaches.map((a) =>
              panelChip(
                a.label,
                measureApproach === a.id,
                () => {
                  setMeasureApproach(a.id);
                  setMsDetail(null);
                  setA1Detail(null);
                  setMsa2Detail(null);
                  setEatDetail(false);
                  setActiveTab("med");
                },
                a.full + ". " + a.desc,
                a.full
              )
            ),
            current && current.desc
          );
        })()}

        {/* The scope switch, put where a setting belongs rather than at the
            top where it competed with the controls it filters. */}
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            display: "block",
            width: "100%",
            marginTop: 14,
            padding: "8px 0 2px",
            background: "none",
            border: "none",
            borderTop: "1px solid #E4E7EC",
            fontSize: 10.5,
            fontWeight: 600,
            color: "#98A2B3",
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "center",
          }}
        >
          {showAll
            ? "Showing all " + ALL_GROUPS.length + " controls \u00b7 show this screen only"
            : "Show all controls \u00b7 " + ALL_GROUPS.length}
        </button>
      </aside>
    )
  );
}
