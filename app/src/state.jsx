import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Home, BarChart3, Utensils, Check, Moon, Droplet, Flame } from "lucide-react";
import LotusIcon from "./components/LotusIcon";
import { totals as sumFoods, sufficiency as scoreOf, DEMO_DAY } from "./screens/log/foods";
import { GOALS, targetsFor } from "./screens/sufficiency/data";

// Snacks are not meals. Only these three count towards unlocking the day.
const MAIN_DIVISIONS = ["breakfast", "lunch", "dinner"];
import { GREEN, TEXT, EAT_C, MOVE_C, MIND_C, MEASURE_C, EAT_T, MOVE_T, MIND_T, MEASURE_T } from "./tokens";

// ponytail: one fat context holding every wireframe toggle. Split it when a
// screen re-renders too often to be comfortable — not before.
const WF = createContext(null);
export const useWF = () => useContext(WF);

// `initial` overrides the enum states that gate whole branches. Only the smoke
// test passes it; the app never does.
export function WFProvider({ children, initial = {} }) {
  // ---------- Pre-app signup flow ----------
  // authStep gates everything: while it is set the app renders the signup
  // takeover instead of the tab bar. null means the user is through.
  // "splash" -> "phone" -> "otp" -> "name" -> null
  const [authStep, setAuthStep] = useState(initial.authStep !== undefined ? initial.authStep : "splash");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [userName, setUserName] = useState("");

  const [activeTab, setActiveTab] = useState(initial.activeTab !== undefined ? initial.activeTab : "home");
  // userState: "free" | "returning" | "device" | "deviceReturning"
  const [userState, setUserState] = useState(initial.userState !== undefined ? initial.userState : "free");
  // eatDetail: full-screen Eat page (no bottom nav)
  const [eatDetail, setEatDetail] = useState(initial.eatDetail !== undefined ? initial.eatDetail : false);
  // eatState: "ft" | "fad" | "wc" | "w2"
  const [eatState, setEatState] = useState(initial.eatState !== undefined ? initial.eatState : "ft");
  // progressTab: "achieve" | "medScore" | "vitals"
  const [progressTab, setProgressTab] = useState("achieve");
  // measureApproach: "a0" (current Measure) | "ms" (metabolic-score anchored)
  const [measureApproach, setMeasureApproach] = useState(initial.measureApproach !== undefined ? initial.measureApproach : "ms");
  // msRange: "week" | "month" | "custom"
  const [msRange, setMsRange] = useState("week");
  // msDetail: null | "score" | "pillars"
  const [msDetail, setMsDetail] = useState(null);
  // a1Detail: null | "movers"
  const [a1Detail, setA1Detail] = useState(null);
  // msa2Detail: null | "score"
  const [msa2Detail, setMsa2Detail] = useState(null);
  // achieveRange: "week" | "month" | "custom"
  const [achieveRange, setAchieveRange] = useState("week");
  // eatTab: "today" | "trend" | "learn"
  const [eatTab, setEatTab] = useState("today");
  // deviceTab: "ring" | "cgm" | "bca" — Smart Devices card
  const [deviceTab, setDeviceTab] = useState("ring");
  // deviceTabConnected: active tab in the connected-state card (device users); CGM is the connected device
  const [deviceTabConnected, setDeviceTabConnected] = useState("cgm");
  // plan: "free" | "paid" — paid = enrolled in a Care program
  const [plan, setPlan] = useState(initial.plan !== undefined ? initial.plan : "paid");
  // homeProgramTab: "program" | "sessions" — paid Home carousel
  const [homeProgramTab, setHomeProgramTab] = useState("program");
  // sessionState: "none" | "booked" — second carousel card on paid Home
  const [sessionState, setSessionState] = useState("none");
  // scoreState: MET Score card on Home.
  // "locked"  — FTUX, no score yet (default)
  // "first"   — first score, shown as a risk band, no delta
  // "down" | "flat" | "up" — subsequent updates
  const [scoreState, setScoreState] = useState(initial.scoreState !== undefined ? initial.scoreState : "locked");
  // setupState: "new" | "partial" | "done" — the first week checklist above the score
  const [setupState, setSetupState] = useState(initial.setupState !== undefined ? initial.setupState : "new");
  // dailyState — today's task row on Home.
  // "ftux"     — first day, teaching state, meals not yet understood
  // "empty"    — returning user, new day, nothing logged yet
  // "partial"  — some logged today (Eat 1 of 3, others open)
  // "done"     — all three cleared today
  const [dailyState, setDailyState] = useState(initial.dailyState !== undefined ? initial.dailyState : "ftux");
  // How far into each of today's four the user has actually got, by id, and
  // the celebration owed for the last completion. A task with three checks
  // takes three taps, so the count is what is stored, not a done flag.
  const [taskProgress, setTaskProgress] = useState(
    initial.taskProgress !== undefined ? initial.taskProgress : {}
  );
  // Which device syncs Measure asks for once the care plan is in.
  const [measureTasks, setMeasureTasks] = useState(
    initial.measureTasks !== undefined ? initial.measureTasks : "bca"
  );
  const [taskDone, setTaskDone] = useState(initial.taskDone !== undefined ? initial.taskDone : null);
  // The streak rewards sheet, opened from the card that appears once the day
  // is cleared.
  const [streakInfo, setStreakInfo] = useState(initial.streakInfo !== undefined ? initial.streakInfo : false);
  // Sharing a streak. The sheet opens any number of times; the reward is once.
  const [shareOpen, setShareOpen] = useState(initial.shareOpen !== undefined ? initial.shareOpen : false);
  const [shareClaimed, setShareClaimed] = useState(
    initial.shareClaimed !== undefined ? initial.shareClaimed : false
  );
  const SHARE_COINS = 5;
  // Which monthly milestones have been hit and which were let go.
  const [milestones, setMilestones] = useState(
    initial.milestones !== undefined ? initial.milestones : { earned: [], missed: [] }
  );
  // Onboarding takeover launched from the FTUX "Let's start" CTA. It is one
  // screen now: Kaira explains the four pillars, then the user lands on To-do.
  // The age, sex, height and weight questions moved out, because the metabolic
  // score questionnaire asks for the same things and asking twice is worse
  // than asking late.
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  // Guided tour of Home. null is off, otherwise the index of the step being
  // spotlit. Steps and copy live in SpotlightTour; the elements they point at
  // register themselves here by wrapping in <TourTarget>.
  const [tour, setTour] = useState(initial.tour !== undefined ? initial.tour : null);
  // Which sequence `tour` is an index into: the five-stop tour of Home, or the
  // single mark that explains the task row the first time it is seen there.
  const [tourName, setTourName] = useState(initial.tourName !== undefined ? initial.tourName : "home");
  // Set when onboarding finishes. The user lands on To-do, so the mark waits
  // until they actually open Home.
  // The beat between finishing the EM3 explainer and landing on To-do.
  const [preparing, setPreparing] = useState(initial.preparing !== undefined ? initial.preparing : false);
  const [focusMarkDue, setFocusMarkDue] = useState(
    initial.focusMarkDue !== undefined ? initial.focusMarkDue : false
  );
  const tourTargets = useRef({});
  // Which calorie figure on the daily summary is being explained, or null.
  const [metricInfo, setMetricInfo] = useState(initial.metricInfo !== undefined ? initial.metricInfo : null);
  // Which pillar's science sheet is open, by id, or null.
  const [pillarInfo, setPillarInfo] = useState(initial.pillarInfo !== undefined ? initial.pillarInfo : null);
  // The Flipcoins explainer, opened from the one pill that names them.
  const [coinsInfo, setCoinsInfo] = useState(initial.coinsInfo !== undefined ? initial.coinsInfo : false);
  // Which pillar's "plan not here yet" explainer is open, by id, or null.
  const [planInfo, setPlanInfo] = useState(initial.planInfo !== undefined ? initial.planInfo : null);
  // Program welcome, for a care-program user landing on Home after onboarding.
  // "sheet" is the bottom sheet, "mark" is the coach mark on the program card,
  // null is off. The sheet hands off to the mark, the mark to the daily tour.
  // Off by default: it is a welcome, so it is armed by signing up or by
  // finishing onboarding, and never greets a returning user again.
  const [programIntro, setProgramIntro] = useState(initial.programIntro !== undefined ? initial.programIntro : null);
  // A welcome shows once, and only from finishing signup. The control panel
  // sets programIntro directly, because that is what a testing panel is for.
  const [programIntroSeen, setProgramIntroSeen] = useState(
    initial.programIntroSeen !== undefined ? initial.programIntroSeen : false
  );
  const armProgramIntro = () => {
    if (programIntroSeen) return;
    setProgramIntroSeen(true);
    setProgramIntro("sheet");
  };
  // todayOnboarded: has the user completed the Today-tab FTUX (pillar explainer
  // + questions)? When false, opening the Today tab shows onboarding first.
  const [todayOnboarded, setTodayOnboarded] = useState(initial.todayOnboarded !== undefined ? initial.todayOnboarded : false);
  /* The streak, in full: clear all four of today's tasks and the day counts.
     Miss a day and it goes back to zero. There is no revive and no rest day,
     because a rule you can explain in two sentences is one people trust.
       streakDays  the current run, today included once it is cleared
       streakState "new" before the first day, "active" while running,
                   "broken" the day after one was missed */
  const [streakDays, setStreakDays] = useState(initial.streakDays !== undefined ? initial.streakDays : 0);
  const [streakState, setStreakState] = useState(initial.streakState !== undefined ? initial.streakState : "new");
  // Sufficiency walkthrough, run from the Eat FTUX card.
  // null | "learn" | "profile" | "meals" | "computing" | "result"
  //      | "computing2" | "lifted"
  const [suffFlow, setSuffFlow] = useState(initial.suffFlow !== undefined ? initial.suffFlow : null);
  // ---------- Movement ----------
  const [moveDetail, setMoveDetail] = useState(initial.moveDetail !== undefined ? initial.moveDetail : false);
  const [moveTab, setMoveTab] = useState(initial.moveTab !== undefined ? initial.moveTab : "routine");
  // Has a coach assigned a routine yet? null until the consultation happens.
  const [movePlan, setMovePlan] = useState(initial.movePlan !== undefined ? initial.movePlan : null);
  const [exLogs, setExLogs] = useState(initial.exLogs !== undefined ? initial.exLogs : []);
  const [logExOpen, setLogExOpen] = useState(initial.logExOpen !== undefined ? initial.logExOpen : false);
  const [routineDone, setRoutineDone] = useState([]);

  // ---------- Food logging ----------
  // logOpen is the Log a meal takeover. logItems is the meal being built.
  const [logOpen, setLogOpen] = useState(initial.logOpen !== undefined ? initial.logOpen : false);
  const [logItems, setLogItems] = useState([]);
  const [logTime, setLogTime] = useState(13 * 60 + 30); // minutes past midnight
  const [logTimeOpen, setLogTimeOpen] = useState(false);
  // Which food's macro sheet is open, by id.
  const [logInfo, setLogInfo] = useState(initial.logInfo !== undefined ? initial.logInfo : null);
  // Stands in front of the first log when targets do not exist yet.
  // Has the setup pitch been put in front of them at least once?
  const [favorites, setFavorites] = useState(["poha", "chana", "chai"]);
  // Everything logged today: { division, timeMins, items: [{id, qty}] }
  const [mealsLogged, setMealsLogged] = useState(initial.mealsLogged !== undefined ? initial.mealsLogged : []);
  // Which logged or planned item the three dot menu is open on.
  const [mealItem, setMealItem] = useState(initial.mealItem !== undefined ? initial.mealItem : null);
  // The celebration after a meal lands, holding before and after numbers.
  const [logResult, setLogResult] = useState(initial.logResult !== undefined ? initial.logResult : null);
  // Small confirmation that outlives the screen it came from.
  const [toast, setToast] = useState(initial.toast !== undefined ? initial.toast : null);

  const [suffLift, setSuffLift] = useState(false);
  // True when the targets step was opened to edit a goal rather than as step
  // two of the walkthrough. Changes where its button goes.
  const [suffEdit, setSuffEdit] = useState(initial.suffEdit !== undefined ? initial.suffEdit : false);
  // Has the walkthrough been completed? Flips the Eat card from "set it up"
  // to "log your first meal".
  const [suffDone, setSuffDone] = useState(initial.suffDone !== undefined ? initial.suffDone : false);
  // Which sub-sheet is open on the targets step:
  // null | "kcal" | "protein" | "carbs" | "fats" | "fibre"
  const [suffSheet, setSuffSheet] = useState(initial.suffSheet !== undefined ? initial.suffSheet : null);
  // Goal retunes the macro split. Calories can be nudged from the sheet.
  const [suffGoal, setSuffGoal] = useState(initial.suffGoal !== undefined ? initial.suffGoal : "steady");
  const [suffKcal, setSuffKcal] = useState(null); // null means use the goal's own number
  // Who owns the calorie target:
  //   "you"     the user sets it
  //   "pending" a program user whose coach has not run the consultation yet
  //   "coach"   the coach has set it, so it is fixed
  const [kcalSource, setKcalSource] = useState(initial.kcalSource !== undefined ? initial.kcalSource : "pending");
  // Info sheet behind the dot on the sufficiency card. Independent of the
  // walkthrough, because it has to work in every eatState.
  const [suffMeals, setSuffMeals] = useState({ breakfast: [], lunch: [], dinner: [] });
  const [suffAddons, setSuffAddons] = useState([]);

  // Full-screen streak layer: null | "guide".
  const [streakOpen, setStreakOpen] = useState(initial.streakOpen !== undefined ? initial.streakOpen : null);
  const [flipcoins, setFlipcoins] = useState(initial.flipcoins !== undefined ? initial.flipcoins : 101);
  // programDetail: full-screen program page (no bottom nav)
  const [programDetail, setProgramDetail] = useState(false);
  // programSub: null | "progress" — sub-page inside the program
  const [programSub, setProgramSub] = useState(null);
  // chatsOpen: full-screen chat list (no bottom nav)
  const [chatsOpen, setChatsOpen] = useState(false);


  const isPaid = plan === "paid";

  // Paid Home carousel — tab selection slides the rail; swiping updates the tab.
  const CARD_W = 300;
  const CARD_GAP = 12;
  const CARD_PAD = 22;
  // Both carousel cards are locked to this height so the sessions card does not
  // grow when a session is booked. Content inside each variant must fit.
  const CARD_H = 128;
  // Paid Home: set to true to bring back the "Your Program / Upcoming Session(s)"
  // pill switch above the carousel. When false the carousel is swipe only.
  const SHOW_PROGRAM_TABS = true;

  // Program on the first carousel card. Every field here is dynamic — swap the
  // condition, duration or care type and the card re-renders. icon is any
  // lucide component.
  const program = {
    status: "Active",
    icon: Droplet,
    name: "Diabetes Management",
    duration: "Comprehensive 12 months",
    category: "Diabetes Care",
  };

  // Booked session shown on the second card when sessionState === "booked".
  const bookedSession = {
    role: "Your Success Coach",
    coach: "Manya Jain",
    date: "17 Aug, 2026",
    time: "10:15 AM",
    cta: "Join Your Zoom Session",
  };
  // Trailing space so the second card can actually reach the left edge.
  // Without it max scrollLeft < the snap target and the rail springs back.
  const CARD_TAIL = 390 - CARD_PAD - CARD_W;
  const carouselRef = useRef(null);
  const carouselLock = useRef(false);
  const carouselTimer = useRef(null);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const target = homeProgramTab === "sessions" ? CARD_W + CARD_GAP : 0;
    if (Math.abs(el.scrollLeft - target) < 4) return;
    carouselLock.current = true;
    clearTimeout(carouselTimer.current);
    el.scrollTo({ left: target, behavior: "smooth" });
    carouselTimer.current = setTimeout(() => {
      carouselLock.current = false;
    }, 500);
  }, [homeProgramTab, isPaid, activeTab]);

  // Only react once the swipe has settled, so the pill doesn't flicker mid-drag
  const handleCarouselScroll = (e) => {
    if (carouselLock.current) return;
    const left = e.currentTarget.scrollLeft;
    clearTimeout(carouselTimer.current);
    carouselTimer.current = setTimeout(() => {
      const next = left > (CARD_W + CARD_GAP) / 2 ? "sessions" : "program";
      setHomeProgramTab((prev) => (prev === next ? prev : next));
    }, 130);
  };

  const isReturning = userState === "returning" || userState === "deviceReturning";
  const isDevice = userState === "device" || userState === "deviceReturning";


  const sufficiencyRings = [
    { label: "Protein", pct: 24, val: "23/94g", color: GREEN },
    { label: "Carbs", pct: 70, val: "165/236g", color: "#444CE7" },
    { label: "Fats", pct: 56, val: "35/62g", color: "#2DA6A6" },
    { label: "Fibre", pct: 60, val: "18/30g", color: "#98A2B3" },
  ];


  // Meal divisions. `plan` options show for paid; `logged` shows what the user ate.
  /* The one fact that decides what a care user sees: has the consultation
     happened and have the coaches written the plans. Declared here because the
     meal divisions below already depend on it. */
  const planAssigned = plan === "paid" && kcalSource === "coach" && !!movePlan;

  /* A coach's plan is a list of options per meal, and each option is a list of
     real foods. Storing food ids rather than names is what lets a plan item be
     tapped straight into the logger and come back ticked. */
  const eatDivisionsAll = [
    {
      id: "prebreakfast", name: "Pre Breakfast", time: "6:00 - 7:00 AM",
      plan: [
        [{ id: "blacktea", qty: 1 }],
        [{ id: "jeerawater", qty: 1 }],
      ],
    },
    {
      id: "breakfast", name: "Breakfast", time: "8:00 - 10:00 AM",
      plan: [
        [{ id: "eggs", qty: 1 }, { id: "chilla", qty: 2 }, { id: "chutney", qty: 2 }],
        [{ id: "poha", qty: 1 }, { id: "curd", qty: 1 }],
        [{ id: "idli", qty: 1 }, { id: "sambar", qty: 1 }],
      ],
    },
    {
      id: "lunch", name: "Lunch", time: "1:00 - 3:00 PM",
      plan: [
        [{ id: "dahi", qty: 1 }, { id: "gardensalad", qty: 1 }, { id: "quinoa", qty: 1 }],
        [{ id: "roti", qty: 2 }, { id: "sabzi", qty: 1 }, { id: "dal", qty: 1 }],
      ],
    },
    {
      id: "eveningsnack", name: "Evening Snack", time: "5:00 - 6:30 PM",
      plan: [
        [{ id: "makhana", qty: 1 }],
        [{ id: "chana", qty: 1 }],
      ],
    },
    {
      id: "dinner", name: "Dinner", time: "8:00 - 9:30 PM",
      plan: [
        [{ id: "multiroti", qty: 2 }, { id: "sabzi", qty: 1 }],
        [{ id: "khichdi", qty: 1 }, { id: "curd", qty: 1 }],
      ],
    },
    {
      id: "bedtime", name: "Bed time", time: "10:00 - 11:00 PM",
      plan: [
        [{ id: "walnut", qty: 2 }, { id: "chamomile", qty: 1 }],
      ],
    },
  ];

  /* Without a coach's plan there is nothing to say about a pre breakfast tea or
     a bedtime snack, so those slots are noise. Four meals is the day as a
     person would describe it; the plan is what adds the rest. */
  const CORE_DIVISIONS = ["breakfast", "lunch", "eveningsnack", "dinner"];
  const eatDivisions = planAssigned
    ? eatDivisionsAll
    : eatDivisionsAll.filter((d) => CORE_DIVISIONS.includes(d.id));


  const progressTabs = [
    { id: "achieve", label: "Achieve" },
    { id: "medScore", label: "MET Score" },
    { id: "vitals", label: "Vitals" },
  ];


  const setupTasks = [
    { id: "meal", label: "Log your first meal", sub: "Takes about 30 seconds" },
    { id: "move", label: "Log your first workout", sub: "A walk counts" },
    { id: "mind", label: "Log your first breathing", sub: "Two minutes, guided" },
  ].map((t, i) => ({
    ...t,
    done: setupState === "done" || (setupState === "partial" && i === 0),
  }));
  const setupDoneCount = setupTasks.filter((t) => t.done).length;


  const metPillars = [
    { id: "eat", label: "Eat", Icon: Utensils, note: "Fuel", color: EAT_C, tint: EAT_T },
    { id: "move", label: "Move", Icon: Flame, note: "Burn", color: MOVE_C, tint: MOVE_T },
    { id: "mind", label: "Mind", Icon: LotusIcon, note: "Calm", color: MIND_C, tint: MIND_T },
    { id: "measure", label: "Measure", Icon: BarChart3, note: "Know", color: MEASURE_C, tint: MEASURE_T },
  ];


  const dailyPillarsAll = [
    {
      id: "eat",
      Icon: Utensils,
      title: "Log your 3 main meals",
      checks: 3,
      step: "meal",
      // filled checks by state
      fill: { ftux: 0, empty: 0, partial: 1, done: 3 },
      hint: "Check protein and fibre. Log all three for your score.",
      coins: 4,
    },
    {
      id: "move",
      Icon: Flame,
      title: "Move for 20 minutes",
      checks: 1,
      fill: { ftux: 0, empty: 0, partial: 0, done: 1 },
      hint: "Log whatever you did. Even a walk to the shop counts.",
      coins: 2,
    },
    {
      id: "mind",
      Icon: LotusIcon,
      title: "Take a breathing break",
      checks: 1,
      fill: { ftux: 0, empty: 0, partial: 0, done: 1 },
      hint: "A short breather to lower stress. Calm counts too.",
      coins: 2,
    },
    {
      id: "measure",
      Icon: BarChart3,
      title: "Sync your BCA",
      checks: 1,
      fill: { ftux: 0, empty: 0, partial: 0, done: 1 },
      hint: "See how your muscle and fat are changing.",
      coins: 10,
    },
    {
      // Measure can carry more than one device task, so this one names the
      // pillar it belongs to rather than being it.
      id: "cgm",
      pillar: "measure",
      // Same mark as the BCA task: both are Measure, and the pillar is what
      // the icon names.
      Icon: BarChart3,
      title: "Sync your CGM",
      checks: 1,
      fill: { ftux: 0, empty: 0, partial: 0, done: 1 },
      hint: "See how each meal moves your glucose, as it happens.",
      coins: 10,
    },
  ];

  /* All four cards are today's list, so all four count. `dailyState` still
     stages the demo, and taskProgress records what has actually been ticked in
     this session. Whichever says done, wins.

     Measure is a device task that arrives with the care plan, so before the
     plan exists there is nothing to sync and the pillar stays off the list.
     The day is three tasks then, not four, and everything counts against
     dailyPillars rather than a hard-coded number. */
  const MEASURE_SHOWN = { bca: ["measure"], cgm: ["cgm"], both: ["measure", "cgm"] };
  const shown = MEASURE_SHOWN[measureTasks] || MEASURE_SHOWN.bca;
  const dailyPillars = dailyPillarsAll.filter((p) =>
    (p.pillar || p.id) === "measure" ? planAssigned && shown.includes(p.id) : true
  );
  const dailyRepeating = dailyPillars;
  // Distinct main meals, so three snacks do not unlock a day's score.
  const mainMealsDone = new Set(
    mealsLogged.filter((m) => MAIN_DIVISIONS.includes(m.division)).map((m) => m.division)
  ).size;

  /* Eat is the one task with a record behind it. Its progress is the meals
     actually in the day, never a separate counter, so the card, its header and
     its last-logged line cannot disagree the way they used to. */
  const fillWith = (prog, p) =>
    p.id === "eat"
      ? Math.min(p.checks, mainMealsDone)
      : Math.min(p.checks, Math.max(p.fill[dailyState], prog[p.id] || 0));
  const taskFill = (p) => fillWith(taskProgress, p);
  const taskIsDone = (p) => taskFill(p) >= p.checks;
  const dailyDoneCount = dailyPillars.filter(taskIsDone).length;
  const dayFraction = dailyDoneCount / dailyPillars.length;
  const dayComplete = dailyDoneCount >= dailyPillars.length;
  /* The number every surface prints. Today counts the moment the day is
     cleared, whether the streak was bumped by finishing a task or set straight
     from the control panel. Each screen used to patch this for itself, which is
     how the top bar ended up reading 0 beside a card saying day 1. */
  const streakShown = dayComplete ? Math.max(1, streakDays) : streakDays;

  /* What the top of To-do shows. Two facts decide it: whether the care plan is
     in, and how much of today is logged. Both are read from the day itself, so
     the summary cannot claim an empty day while the Eat card claims a full
     one. */
  const heroState = !planAssigned
    ? "noplan"
    : mainMealsDone >= 3
    ? "full"
    : mainMealsDone > 0
    ? "partial"
    : "nodata";
  const STREAK_REWARDS = [
    { days: 7, coins: 20 },
    { days: 30, coins: 50 },
  ];

  /* The long game, above the daily streak: book at least one consultation a
     month and the reward grows the longer the run holds. */
  const MILESTONES = [
    { months: 1, coins: 50 },
    { months: 3, coins: 100 },
    { months: 6, coins: 200 },
    { months: 9, coins: 300 },
    { months: 12, coins: 400 },
  ];
  const milestoneStatus = (m) =>
    milestones.earned.includes(m.months)
      ? "earned"
      : milestones.missed.includes(m.months)
      ? "missed"
      : "open";

  /* Ticking a card is the whole interaction: it pays, it says so, and it shows
     what the day now looks like. Nothing navigates away.

     A card with three checks takes three taps. The first two fill a pip and
     say so quietly; only the last one finishes the task, pays out and lifts
     the day's flame, because that is when the task is actually done. */
  const completeTask = (p) => {
    if (taskIsDone(p)) return;
    const next = taskFill(p) + 1;
    /* Eat keeps no counter of its own, so ticking it off has to put a real
       meal in the day. Otherwise the card would say three meals while Eat
       detail showed an empty one. */
    const prog = p.id === "eat" ? taskProgress : { ...taskProgress, [p.id]: next };
    if (p.id === "eat") setMealsLogged(mealsLogged.concat(DEMO_DAY[next - 1]));
    else setTaskProgress(prog);

    if (next < p.checks) {
      const thing = p.step || "part";
      setToast({
        title: thing[0].toUpperCase() + thing.slice(1) + " " + next + " of " + p.checks + " logged",
        line: p.checks - next + " more to finish " + p.label,
      });
      return;
    }

    const count = dailyPillars.filter((x) =>
      x.id === p.id ? next >= x.checks : fillWith(prog, x) >= x.checks
    ).length;
    if (count === dailyPillars.length && dailyDoneCount < dailyPillars.length) {
      setStreakDays(streakDays + 1);
      setStreakState("active");
    }
    if (p.coins) setFlipcoins(flipcoins + p.coins);
    setTaskDone({
      id: p.id,
      title: p.title,
      coins: p.coins || 0,
      before: dailyDoneCount / dailyPillars.length,
      after: count / dailyPillars.length,
      count,
      total: dailyPillars.length,
    });
    if (p.coins) {
      setToast({ title: "+" + p.coins + " Flipcoins earned", line: p.title, coins: p.coins });
    }
  };


  /* One way out of onboarding, shared by the takeover and the To-do FTUX, so
     both leave the app in exactly the same state. It deliberately does not arm
     the program welcome: that belongs to signing up, not to finishing this,
     and a returning user switching tabs should never be greeted. */
  const onbFinish = () => {
    setOnboardingOpen(false);
    setOnboardingStep(0);
    // Building the day is a real moment, so it gets shown rather than skipped.
    // The rest of the finish happens when it is over.
    setPreparing(true);
  };

  useEffect(() => {
    if (!preparing) return;
    const t = setTimeout(() => {
      setDailyState("empty");
      setTodayOnboarded(true);
      setActiveTab("track");
      // Home has not been seen with a real task row yet, so it owes an
      // explanation the first time it is opened.
      setFocusMarkDue(true);
      setPreparing(false);
    }, 2000);
    return () => clearTimeout(t);
  }, [preparing]);
  const onbBack = () => setOnboardingOpen(false);


  /* EM3, in one place. `line` is the one-liner the To-do first run shows;
     `concept` and `long` are the fuller version the onboarding screen teaches.
     Same four ideas either way, so the app never explains itself twice with
     two different stories. */
  const pillarExplain = [
    {
      id: "eat",
      Icon: Utensils,
      label: "Eat",
      concept: "Nutrition sufficiency",
      line: "Getting enough protein, carbs, fats and fibre, not just eating less.",
    },
    {
      id: "move",
      Icon: Flame,
      label: "Move",
      concept: "Everyday movement",
      line: "Walking, stairs and chores burn more across a day than the gym does.",
    },
    {
      id: "mind",
      Icon: LotusIcon,
      label: "Mind",
      concept: "Your body clock",
      line: "Steady sleep, daylight and meal times keep your body clock in rhythm.",
    },
    {
      id: "measure",
      Icon: BarChart3,
      label: "Measure",
      concept: "Measure and tune",
      line: "Labs, devices and your logs in one number you can watch move.",
    },
  ];


  const [openGroups, setOpenGroups] = useState([]);

  /* The task row's explanation waits for Home. Firing it on To-do would point
     at a row the user is already looking at. */
  useEffect(() => {
    if (!focusMarkDue || activeTab !== "home" || dailyState === "ftux") return;
    setFocusMarkDue(false);
    setTourName("focus");
    setTour(0);
  }, [focusMarkDue, activeTab, dailyState]);

  /* ---------- Derived nutrition truth ----------
     One place decides whether a percentage may be shown at all, and what it
     is. Every surface reads these rather than working it out again. */
  // A percentage needs targets the user has actually seen and agreed to, or
  // that a coach set for them. Defaults are not consent.
  const hasTargets = suffDone || (plan === "paid" && kcalSource === "coach");
  const activeGoal = GOALS.find((g) => g.id === suffGoal) || GOALS[0];
  const kcalTarget = suffKcal ?? activeGoal.kcal;
  const dailyTargets = targetsFor(suffGoal, kcalTarget);
  const dayTotals = sumFoods(mealsLogged);
  // Steps come off the phone, not from logging, so they are there whatever
  // else the day does or does not have in it.
  const daySteps = 5008;
  // Last night's sleep, the same way: read from the device, not logged.
  const sleepMins = 5 * 60 + 20;
  const liveScore = scoreOf(dayTotals, dailyTargets);
  // The number exists either way. Whether it is legible is the gate.
  const scoreUnlocked = hasTargets && mainMealsDone >= 3;

  const value = {
    hasTargets, kcalTarget, dailyTargets, dayTotals, mainMealsDone, liveScore, scoreUnlocked,
    activeGoal, MAIN_DIVISIONS,
    authStep, setAuthStep, phone, setPhone, otp, setOtp, userName, setUserName,
    activeTab, setActiveTab, userState, setUserState, eatDetail, setEatDetail,
    eatState, setEatState, progressTab, setProgressTab, measureApproach, setMeasureApproach,
    msRange, setMsRange, msDetail, setMsDetail, a1Detail, setA1Detail,
    msa2Detail, setMsa2Detail, achieveRange, setAchieveRange, eatTab, setEatTab,
    deviceTab, setDeviceTab, deviceTabConnected, setDeviceTabConnected,
    plan, setPlan, homeProgramTab, setHomeProgramTab, sessionState, setSessionState,
    scoreState, setScoreState, setupState, setSetupState, dailyState, setDailyState,
    onboardingOpen, setOnboardingOpen, onboardingStep, setOnboardingStep,
    tour, setTour, tourName, setTourName,
    focusMarkDue, setFocusMarkDue, preparing, setPreparing, tourTargets, pillarInfo, setPillarInfo, coinsInfo, setCoinsInfo, planInfo, setPlanInfo, programIntro, setProgramIntro, armProgramIntro,
    programIntroSeen, setProgramIntroSeen, todayOnboarded, setTodayOnboarded,
    streakDays, setStreakDays, streakShown,
    moveDetail, setMoveDetail, moveTab, setMoveTab, movePlan, setMovePlan,
    exLogs, setExLogs, daySteps, sleepMins, logExOpen, setLogExOpen, routineDone, setRoutineDone,
    logOpen, setLogOpen, logItems, setLogItems, logTime, setLogTime,
    logTimeOpen, setLogTimeOpen, logInfo, setLogInfo, 
     favorites, setFavorites,
    mealsLogged, setMealsLogged, mealItem, setMealItem, metricInfo, setMetricInfo, logResult, setLogResult, toast, setToast,
    suffFlow, setSuffFlow, suffLift, setSuffLift,
    suffDone, setSuffDone, suffEdit, setSuffEdit, suffSheet, setSuffSheet, suffGoal, setSuffGoal, suffKcal, setSuffKcal,
    kcalSource, setKcalSource, suffMeals, setSuffMeals,
    suffAddons, setSuffAddons,
    streakState, setStreakState, streakOpen, setStreakOpen,
    setFlipcoins,
    programDetail, setProgramDetail, programSub, setProgramSub,
    chatsOpen, setChatsOpen, openGroups, setOpenGroups,
    flipcoins, isPaid, CARD_W, CARD_GAP, CARD_PAD, CARD_H,
    SHOW_PROGRAM_TABS, program, bookedSession, CARD_TAIL, carouselRef,
    handleCarouselScroll, isReturning, isDevice, sufficiencyRings, eatDivisions,
    progressTabs, setupTasks, setupDoneCount, metPillars, dailyPillars,
    dailyRepeating, dailyDoneCount, dayFraction, dayComplete, taskFill, taskIsDone,
    planAssigned, heroState, measureTasks, setMeasureTasks, streakInfo, setStreakInfo, shareOpen, setShareOpen, shareClaimed, setShareClaimed,
    SHARE_COINS, STREAK_REWARDS,
    MILESTONES, milestones, setMilestones, milestoneStatus,
    completeTask, taskProgress, setTaskProgress, taskDone, setTaskDone,
    onbFinish, onbBack, pillarExplain,
  };
  return <WF.Provider value={value}>{children}</WF.Provider>;
}
