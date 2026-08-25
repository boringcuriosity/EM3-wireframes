import React, { useState } from "react";
import { useWF } from "../state";
import { DEMO_DAY } from "../screens/log/foods";
import { Home } from "lucide-react";
import { GREEN, TEXT, TABS, SH, SH_MD } from "../tokens";
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
  "focus", "measuretasks", "score", "sessions", "nextaction", "home", "eat", "measure",
];

const SCREEN_GROUPS = {
  signup: ["signup"],
  move: ["move", "focus"],
  logging: ["logging", "targets"],
  suff: ["suff", "targets"],
  streakscreen: ["streakscreen", "streak", "milestones", "focus"],
  eat: ["eat", "targets", "logging"],
  chats: [],
  program: ["welcome"],
  todo: ["hero", "focus", "measuretasks", "streak"],
  home: ["welcome", "tour", "nextaction", "focus", "measuretasks", "streak"],
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

const FOCUS_PRESETS = [
  {
    id: "ftux",
    label: "Four habits explainer",
    progress: {},
    days: 0,
    ftux: true,
    desc: "To-do shows the four habits explainer instead of the task list, ending on Take me to my day.",
  },
  {
    id: "none",
    label: "Nothing ticked yet",
    progress: {},
    days: 0,
    desc: "Four open cards, flame empty, 0 of 4. The day as a returning user finds it.",
  },
  {
    id: "meal1",
    label: "1 of 3 meals logged",
    progress: { eat: 1 },
    days: 0,
    desc: "Eat is part way: one pip filled, hint reads 1 of 3 meals in. Still 0 of 4, because the task is not done.",
  },
  {
    id: "eat",
    label: "All 3 meals logged",
    progress: { eat: 3 },
    days: 0,
    desc: "Eat struck through with its tick, flame at a quarter, 1 of 4.",
  },
  {
    id: "three",
    label: "Eat, Move and Mind done",
    progress: { eat: 3, move: 1, mind: 1 },
    days: 0,
    desc: "Three done and sunk to the back. With a care plan that leaves the Measure sync to clear the day; without one there is no Measure task, so the day is already done.",
  },
  {
    id: "d1",
    label: "Day 1 streak",
    progress: ALL_DONE,
    days: 1,
    desc: "All four in. The streak card leads the row reading Streak started, flame full.",
  },
  {
    id: "d4",
    label: "Day 4 streak",
    progress: ALL_DONE,
    days: 4,
    desc: "Card reads 4 day streak. Home strip shows four dots filled.",
  },
  {
    id: "d7",
    label: "Day 7 streak",
    progress: ALL_DONE,
    days: 7,
    desc: "A full week. The rewards sheet behind the card is where the 20 coin weekly bonus is explained.",
  },
];

// Which dailyState a preset wants. Presets without one land on a clean day.
const focusState = (v) => (v.ftux ? "ftux" : v.data || "empty");

export default function ControlPanel() {
  const { authStep, setAuthStep, setPhone, setOtp, setUserName, activeTab, setActiveTab, userState, setUserState, eatDetail, setEatDetail, eatState, setEatState, measureApproach, setMeasureApproach, setMsDetail, setA1Detail, setMsa2Detail, eatTab, plan, setPlan, sessionState, setSessionState, scoreState, setScoreState, dailyState, setDailyState, taskProgress, setTaskProgress, dailyDoneCount, setTaskDone, setStreakInfo, setOnboardingOpen, setOnboardingStep, tour, setTour, setTodayOnboarded, streakState, setStreakState, programDetail, setProgramDetail, programSub, setProgramSub, chatsOpen, setChatsOpen, openGroups, setOpenGroups, isPaid, program, programIntro, setProgramIntro, setProgramIntroSeen, streakOpen, setStreakOpen, milestones, setMilestones, flipcoins, setFlipcoins, streakDays, setStreakDays, suffFlow, setSuffFlow, setSuffLift, suffLift, setKcalSource, logOpen, setLogOpen, logResult, setLogResult, setToast, mealsLogged, setMealsLogged, setLogItems, hasTargets, scoreUnlocked, mainMealsDone, planAssigned, heroState, measureTasks, setMeasureTasks, moveDetail, setMoveDetail, moveTab, setMoveTab, movePlan, setMovePlan, logExOpen, setLogExOpen, exLogs, setExLogs, nextActions, setNextActions, setHomeProgramTab } = useWF();

  const suffCardState = (
    SUFF_STATES.find(
      (v) =>
        v.plan === planAssigned &&
        (v.plan ? v.meals === mainMealsDone : (v.meals > 0) === (mealsLogged.length > 0))
    ) || {}
  ).id;

  const progKey = (o) =>
    ["eat", "move", "mind", "measure"].map((k) => o[k] || 0).join("-");
  const focusPreset = (
    FOCUS_PRESETS.find(
      (v) =>
        focusState(v) === dailyState &&
        progKey(v.progress) === progKey(taskProgress) &&
        v.days === streakDays
    ) || {}
  ).id;

  const groupValue = {
    move: logExOpen ? "Log" : moveDetail ? moveTab : "Closed",
    targets: hasTargets ? (scoreUnlocked ? "Unlocked" : mainMealsDone + "/3 meals") : "No targets",
    logging: logResult ? "Result" : logOpen ? "Search" : mealsLogged.length + " logged",
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
    nextaction: nextActions.length ? nextActions.length + " left" : "none",
    focus: dailyDoneCount + "/4" + (streakDays ? " · d" + streakDays : ""),
    streak: streakState,
  };

  const liveGroup = moveDetail || logExOpen
    ? "move"
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

  const screenKey = moveDetail || logExOpen
    ? "move"
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

  const onScreen = SCREEN_GROUPS[screenKey] || [];

  // Is anything open right now, the live group included. Same rule the group
  // headers use, so the label always matches what is on screen.
  const allOpen = ALL_GROUPS.some((g) => (g === liveGroup) !== openGroups.includes(g));

  const nowShowing = logExOpen
    ? "Move · Log exercise"
    : moveDetail
    ? "Move · " + ({ routine: "Daily routine", logged: "Exercises", videos: "Videos" }[moveTab] || moveTab)
    : logResult
    ? "Log · Meal logged"
    : logOpen
    ? "Log · Search and add"
    : suffFlow
    ? "Sufficiency · " +
      ({
        learn: "What it is",
        profile: "Your targets",
        meals: "Your usual day",
        computing: "Kaira reading",
        result: "Your score",
        computing2: "Kaira reading",
        lifted: "Score lifted",
      }[suffFlow] || suffFlow)
    : streakOpen
    ? "Streak · " + (streakOpen === "guide" ? "How it works" : "Invite friends")
    : authStep
    ? "Signup · " +
      ({
        splash: "Splash",
        phone: "Mobile number",
        otp: "OTP",
        name: "Your name",
      }[authStep] || authStep)
    : chatsOpen
    ? "Chats"
    : programDetail
    ? programSub === "progress"
      ? "Program · Progress"
      : "Program detail"
    : eatDetail
    ? "Eat detail · " +
      eatTab +
      " · " +
      eatState.toUpperCase() +
      " " +
      ({
        ft: "First time",
        fad: "First activity done",
        kg: "Knowledge gap",
        wc: "Week completed",
        w2: "Week two",
        cg: "Capability gap",
      }[eatState] || "")
    : tour !== null && activeTab === "home" && isPaid
    ? "Home · Guided tour · step " + (tour + 1) + " of 3"
    : programIntro && activeTab === "home" && isPaid
    ? "Home · Program welcome · bottom sheet"
    : activeTab === "home"
    ? isPaid
      ? "Home · Program user · " +
        (sessionState === "booked" ? "Session booked" : "No sessions")
      : "Home · " + userState
    : activeTab === "med"
    ? "Measure · " +
      measureApproach.toUpperCase() +
      " " +
      ({
        a0: "Achieve",
        ms: "Metabolic score",
        a1: "Reflection first",
        msa2: "Refined score",
      }[measureApproach] || "")
    : TABS.find((t) => t.id === activeTab)?.label;

  const panelChip = (label, active, onClick, title, expanded, sub) => (
    <button
      key={label}
      onClick={onClick}
      title={title}
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
      {sub ? (
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

        <div
          style={{
            marginTop: 12,
            background: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 10,
            padding: "8px 10px",
          }}
        >
          <div style={{ fontSize: 9.5, color: "#98A2B3", letterSpacing: 0.6, fontWeight: 700 }}>
            NOW SHOWING
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginTop: 2 }}>{nowShowing}</div>
        </div>

        {/* The rail follows you: it carries the controls for the screen you are
            on, and everything else folds behind one switch. */}
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {[
            { on: false, label: "This screen", n: onScreen.length },
            { on: true, label: "All controls", n: ALL_GROUPS.length },
          ].map((v) => (
            <button
              key={v.label}
              onClick={() => setShowAll(v.on)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                fontSize: 10.5,
                fontWeight: 700,
                padding: "6px 0",
                borderRadius: 8,
                border: "1px solid " + (showAll === v.on ? GREEN : "#D0D5DD"),
                background: showAll === v.on ? GREEN : "#FFFFFF",
                color: showAll === v.on ? "#fff" : "#475467",
                cursor: "pointer",
              }}
            >
              {v.label}
              <span style={{ opacity: 0.6, fontWeight: 500 }}>{v.n}</span>
            </button>
          ))}
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
            {[
              { on: false, label: "Not yet" },
              { on: true, label: "Assigned" },
            ].map((v) => (
              <button
                key={v.label}
                onClick={() => {
                  // One switch for the whole handover: targets, routine, meal
                  // slots and the waiting strips all follow from it.
                  setKcalSource(v.on ? "coach" : "pending");
                  setMovePlan(v.on ? "assigned" : null);
                  setTodayOnboarded(true);
                  if (!eatDetail && !moveDetail && activeTab !== "track") {
                    setActiveTab("track");
                  }
                }}
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: "5px 11px",
                  borderRadius: 999,
                  border: "1px solid " + (planAssigned === v.on ? GREEN : "#D0D5DD"),
                  background: planAssigned === v.on ? GREEN : "#FFFFFF",
                  color: planAssigned === v.on ? "#fff" : "#475467",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {v.label}
              </button>
            ))}
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
            "Program welcome",
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
            "Guided tour",
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
          [
            { id: "off", label: "Closed", full: "Not open" },
            { id: "noplan", label: "No plan", full: "No coach routine yet, nothing logged" },
            { id: "plan", label: "Coach plan", full: "Coach has assigned a routine" },
            { id: "logged", label: "Logged", full: "One activity logged today" },
            { id: "videos", label: "Videos", full: "The videos tab" },
            { id: "log", label: "Log exercise", full: "The log exercise screen" },
          ].map((v) =>
            panelChip(
              v.label,
              v.id === "off" ? !moveDetail && !logExOpen : v.id === "log" ? logExOpen : false,
              () => {
                setLogExOpen(v.id === "log");
                setMoveDetail(v.id !== "off" && v.id !== "log");
                if (v.id === "noplan") {
                  setMovePlan(null);
                  setExLogs([]);
                  setMoveTab("routine");
                } else if (v.id === "plan") {
                  setMovePlan("assigned");
                  setMoveTab("routine");
                } else if (v.id === "logged") {
                  setExLogs([{ id: "briskwalk", minutes: 25, intensity: "moderate", timeMins: 7 * 60 + 30 }]);
                  setMoveTab("logged");
                } else if (v.id === "videos") {
                  setMoveTab("videos");
                }
                if (v.id === "off") setActiveTab("track");
              },
              v.full
            )
          ),
          logExOpen
            ? "Pick an activity, a duration and an intensity. The calorie figure updates live from the MET value."
            : !moveDetail
            ? "Closed. Open it from the Move heading on the To-do screen."
            : movePlan === "assigned"
            ? "Kaira hands over to the coach routine. Each item can be marked done."
            : "No routine yet, so Kaira asks for movement first so the coach has something to build from."
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
            { id: "result", label: "Result", full: "Meal logged, sufficiency rising" },
            { id: "toast", label: "Toast", full: "The confirmation toast" },
            { id: "reset", label: "Clear day", full: "Wipe everything logged today" },
          ].map((v) =>
            panelChip(
              v.label,
              v.id === "search" ? logOpen : v.id === "result" ? !!logResult : v.id === "off" && !logOpen && !logResult,
              () => {
                setLogOpen(v.id === "search");
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
                if (v.id === "reset") {
                  setMealsLogged([]);
                  setLogItems([]);
                  setEatDetail(true);
                }
                if (v.id === "search" || v.id === "off") setEatDetail(v.id === "off");
              },
              v.full
            )
          ),
          logResult
            ? "The score counts up from where it was and the four bars grow. Done pays Flipcoins and fires the toast."
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

        {panelGroup(
          "focus",
          "Today's focus",
          "Home row + To-do stack",
          FOCUS_PRESETS.map((v) =>
            panelChip(
              v.label,
              focusPreset === v.id,
              () => {
                setDailyState(focusState(v));
                setTodayOnboarded(!v.ftux);
                setTaskProgress(v.progress);
                // Ticking Eat off has to put food in the day too, or the Eat
                // card claims meals that Eat detail and the calorie strip know
                // nothing about.
                setMealsLogged(DEMO_DAY.slice(0, v.progress.eat || 0));
                setExLogs(DEMO_EXERCISE.slice(0, v.progress.move || 0));
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
          "nextaction",
          "Next actions card",
          "Home carousel, second card",
          [
            { id: "all", label: "All three waiting", v: ["score", "labs", "bca"] },
            { id: "two", label: "Score taken, two left", v: ["labs", "bca"] },
            { id: "one", label: "Only the BCA left", v: ["bca"] },
            { id: "none", label: "Nothing pending", v: [] },
          ].map((x) =>
            panelChip(
              x.label,
              x.v.join() === nextActions.join(),
              () => {
                setNextActions(x.v);
                if (x.v.length) setHomeProgramTab("next");
                setActiveTab("home");
              }
            )
          ),
          nextActions.length
            ? "The card is second in the Home rail and the tab wears the count. Each row goes to the screen that does the job."
            : "No card and no tab. A tab leading to nothing pending is worse than no tab.",
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
      </aside>
    )
  );
}
