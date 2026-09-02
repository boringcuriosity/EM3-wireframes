import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Home, BarChart3, Utensils, Check, Moon, Droplet, Flame } from "lucide-react";
import LotusIcon from "./components/LotusIcon";
import { buildDay, taskTitle, phasesFor, WATER_GOAL, STEP_GOAL } from "./screens/today/day";
import { totals as sumFoods, sufficiency as scoreOf, DEMO_DAY, DIVISION_TIME } from "./screens/log/foods";
import { GOALS, targetsFor } from "./screens/sufficiency/data";
import { MOODS } from "./screens/mind/tools";


/* Who is actually on this person's care team. Above the provider because the
   next session derives from it, and the program page names the same three. */
/* `role` is the professional one, which is what the program page and the
   booking screen show. `coach` is the same person said in the language the
   plans use, because somebody waiting on an Eat plan is waiting on their Eat
   coach rather than on a job title. `pillar` is what ties the two together. */
const CARE_TEAM = [
  { id: "eat", pillar: "eat", coach: "Your Eat coach", role: "Your nutritionist", name: "Sahana Chandra" },
  { id: "move", pillar: "move", coach: "Your Move coach", role: "Your physiotherapist", name: "Sahana Physio" },
  { id: "success", pillar: "mind", coach: "Your Mind coach", role: "Your success coach", name: "Manya Jain" },
];
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
  /* Who to greet. Signup fills userName in; anywhere the wireframe starts
     already signed in there has to be someone to be, so the card is not a
     template with a hole in it. */
  const firstName = (userName || "").trim().split(" ")[0] || "Shaheer";

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
  const [homeProgramTab, setHomeProgramTab] = useState(
    initial.homeProgramTab !== undefined ? initial.homeProgramTab : "program"
  );
  /* homeCard: which shape Home's one card takes. Three ways of saying the
     same day, kept switchable while we decide which one reads fastest.
     "split" = the day in the card and the pillars in their own section,
     "next" = the one thing next, "phase" = this part of the day, "task" = one
     named task over the rings. */
  const [homeCard, setHomeCard] = useState(initial.homeCard !== undefined ? initial.homeCard : "bubbles");

  /* What the Metabolism strip under the day is made of. "tiles" is the four
     squares that are only a way in; the rest are the same four as slim cards
     carrying each pillar's score, drawn a few ways while we pick one. The
     medal leads while it is the one being shown around. */
  const [metabCard, setMetabCard] = useState(initial.metabCard !== undefined ? initial.metabCard : "medal");
  /* What the Next actions card is carrying. An empty list means the card and
     its tab are not there at all. Three at most: a card that scrolls is a
     screen pretending to be a card. */
  const [nextActions, setNextActions] = useState(
    initial.nextActions !== undefined ? initial.nextActions : ["score", "labs", "assess", "book:eat", "book:move", "book:mind"]
  );
  // Which of them are ticked off. They stay on the card struck through, so the
  // last one is finished against something rather than alone.
  const [nextDone, setNextDone] = useState(
    initial.nextDone !== undefined ? initial.nextDone : []
  );
  // Set once the card has been let go, so the list clearing does not yank it
  // out from under the finger that ticked the last box.

  /* Put away from the top of the day, which is a different thing from being
     finished. The work is still open and still on Home; what has been let go
     is the reminder sitting above today's list. `prereqAsk` is the sheet that
     says where they went, because a section that vanishes without telling you
     where to find it again reads as one you broke. */
  const [prereqHidden, setPrereqHidden] = useState(initial.prereqHidden !== undefined ? initial.prereqHidden : false);
  const [prereqAsk, setPrereqAsk] = useState(initial.prereqAsk !== undefined ? initial.prereqAsk : false);

  /* Open or shut. null means nobody has said, so it follows the day: with no
     plan these are the job and the section leads; once a plan lands the day
     leads and they compress to a strip. A tap sets it either way and that
     answer then outranks the default. */
  const [prereqOpen, setPrereqOpen] = useState(initial.prereqOpen !== undefined ? initial.prereqOpen : null);
  const setNextList = (ids, done = []) => {
    setNextActions(ids);
    setNextDone(done);
    setPrereqHidden(false);
    setPrereqOpen(null);
  };
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
  // Coachmarks tour of Home. null is off, otherwise the index of the step being
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
  /* Set when somebody asks to be shown where their first steps went. Home
     reads it once on arrival and scrolls the program rail into view. */
  const [nextScrollDue, setNextScrollDue] = useState(false);
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
  // The CGM sync screen, opened from the day's Measure row.
  const [cgmOpen, setCgmOpen] = useState(initial.cgmOpen !== undefined ? initial.cgmOpen : false);
  // The body composition sync screen, opened from its own Measure row.
  const [bcaOpen, setBcaOpen] = useState(initial.bcaOpen !== undefined ? initial.bcaOpen : false);
  const [planInfo, setPlanInfo] = useState(initial.planInfo !== undefined ? initial.planInfo : null);
  // Which arrivals have been read. Anything not in here is still news.
  const [planSeen, setPlanSeen] = useState(initial.planSeen !== undefined ? initial.planSeen : []);
  // Which plan's "what changed" sheet is open.
  const [planChanged, setPlanChanged] = useState(
    initial.planChanged !== undefined ? initial.planChanged : null
  );
  // Welcome bottomsheet, for a care-program user landing on Home after onboarding.
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

  /* The metabolic score walkthrough, the first thing the program asks for.
     One value naming the step, so the panel can open any of them cold rather
     than making you walk the whole thing, the way SufficiencyFlow already
     works.

     The figures are staged. Four sub scores add up to the metabolic score, and
     the Diagnostic one stays shut until a lab test comes back, which is why
     the total reads as incomplete rather than as a low score: 277 of a
     possible 400 with one quarter missing is a different sentence from 277
     out of 400. */
  const [scoreFlow, setScoreFlow] = useState(initial.scoreFlow !== undefined ? initial.scoreFlow : null);
  const [scoreFocus, setScoreFocus] = useState(initial.scoreFocus !== undefined ? initial.scoreFocus : null);
  const [scoreStep, setScoreStep] = useState(initial.scoreStep !== undefined ? initial.scoreStep : 0);
  const SUB_SCORES = [
    { id: "profile",    label: "Profile",    value: 95, tone: "#6172F3" },
    { id: "wellness",   label: "Wellness",   value: 93, tone: "#2DA6A6" },
    { id: "habit",      label: "Habit",      value: 89, tone: "#E7C144" },
    { id: "diagnostic", label: "Diagnostic", value: null, tone: "#299D6B" },
  ];
  const metabolicScore = SUB_SCORES.reduce((n, s) => n + (s.value || 0), 0);
  // ---------- Movement ----------
  const [moveDetail, setMoveDetail] = useState(initial.moveDetail !== undefined ? initial.moveDetail : false);
  const [moveTab, setMoveTab] = useState(initial.moveTab !== undefined ? initial.moveTab : "today");
  // Has a coach assigned a routine yet? null until the consultation happens.
  /* How much of a week the two pillars have to read. Eat stages its trend
     through eatState; these two are their own switch, because a person can be
     three weeks into logging food and one night into logging sleep. */
  /* The Sunday read. "off" is any day that is not the end of a week, "ready"
     is a week Kaira has something to say about, "read" is once it has been
     opened. Measure, because Measure is the pillar that means knowing. */
  const [weekInsight, setWeekInsight] = useState(
    initial.weekInsight !== undefined ? initial.weekInsight : "ready"
  );
  const [weekOpen, setWeekOpen] = useState(initial.weekOpen !== undefined ? initial.weekOpen : false);
  /* Two ways to deliver the same week: one sheet that covers all of it, or one
     read per pillar spread across the day. Kept switchable while we decide. */
  const [weekMode, setWeekMode] = useState(initial.weekMode !== undefined ? initial.weekMode : "sheet");
  // Which pillars' weeks have been read, when they arrive one at a time.
  const [weekReads, setWeekReads] = useState(initial.weekReads !== undefined ? initial.weekReads : []);
  /* How a task is drawn: the tight row inside a phase container, or one card
     per task under a plain heading. Three card arrangements while we decide. */
  const [taskCard, setTaskCard] = useState(initial.taskCard !== undefined ? initial.taskCard : "row");
  /* How many parts the day is cut into: four with a night of its own, or the
     three it was built with. Four is the default, because dinner, the calm
     break and the bedtime snack are night, not evening. */
  const [phaseMode, setPhaseMode] = useState(initial.phaseMode !== undefined ? initial.phaseMode : 4);
  const [moveWeek, setMoveWeek] = useState(initial.moveWeek !== undefined ? initial.moveWeek : "week");
  const [mindWeek, setMindWeek] = useState(initial.mindWeek !== undefined ? initial.mindWeek : "week");
  const [movePlan, setMovePlan] = useState(initial.movePlan !== undefined ? initial.movePlan : null);
  /* The psychologist's plan, which is a third thing a consultation produces and
     was missing from the handover entirely. It gates Mind's worksheets rather
     than planAssigned, because worksheets need the person who writes them. */
  const [mindPlan, setMindPlan] = useState(initial.mindPlan !== undefined ? initial.mindPlan : null);
  const [exLogs, setExLogs] = useState(initial.exLogs !== undefined ? initial.exLogs : []);

  /* Where steps and sleep come from. Not a switch but a source per signal,
     because most people here have no wearable and a screen that only works
     with one is a screen they cannot use. "phone" is the OS health app,
     "manual" is them telling us, null is not decided yet. */
  const [healthSource, setHealthSource] = useState(
    initial.healthSource !== undefined ? initial.healthSource : { steps: null, sleep: null }
  );
  const [healthSheet, setHealthSheet] = useState(
    initial.healthSheet !== undefined ? initial.healthSheet : null
  );
  // Steps entered by hand, for anyone who did not connect Health Connect.
  const [manualSteps, setManualSteps] = useState(
    initial.manualSteps !== undefined ? initial.manualSteps : null
  );
  // Glasses of water, logged in a sheet of their own.
  const [waterSheet, setWaterSheet] = useState(initial.waterSheet !== undefined ? initial.waterSheet : false);
  const [stepsSheet, setStepsSheet] = useState(
    initial.stepsSheet !== undefined ? initial.stepsSheet : false
  );
  const healthOn = (k) => healthSource[k] === "phone";
  /* Which signal is mid-sync. Connecting is not instant, and a number that
     appears the same frame you tapped Connect reads as a fake. */
  const [healthSync, setHealthSync] = useState(
    initial.healthSync !== undefined ? initial.healthSync : null
  );
  /* Health Connect is one permission, not two.

     Granting it in Move hands over steps, workouts and sleep in the same
     breath, so asking again in Mind is asking the person for something their
     phone has already given. The other signal fills in behind them and that
     screen's gate never appears.

     Only when nobody has decided it, though. Somebody who chose to log steps by
     hand made a choice, and connecting later for sleep does not quietly undo
     it. And declining is per signal on purpose: saying you will count your own
     steps is not saying anything about your nights, so Mind still gets to ask
     once. */
  const pickSource = (k, v) => {
    const other = k === "steps" ? "sleep" : "steps";
    const spread = v === "phone" && healthSource[other] === null;
    setHealthSource({ ...healthSource, [k]: v, ...(spread ? { [other]: "phone" } : {}) });
    setHealthSync(v === "phone" ? k : null);
  };
  useEffect(() => {
    if (!healthSync) return;
    const t = setTimeout(() => setHealthSync(null), 1700);
    return () => clearTimeout(t);
  }, [healthSync]);
  // Nights are logged the way meals are: a record, not a counter.
  const [sleepLogs, setSleepLogs] = useState(initial.sleepLogs !== undefined ? initial.sleepLogs : []);
  const [logSleepOpen, setLogSleepOpen] = useState(
    initial.logSleepOpen !== undefined ? initial.logSleepOpen : false
  );
  // Which Mind tool is open, and what has been done today.
  const [mindTool, setMindTool] = useState(initial.mindTool !== undefined ? initial.mindTool : null);
  const [mindDone, setMindDone] = useState(initial.mindDone !== undefined ? initial.mindDone : []);
  /* What each Mind tool left behind, so a finished card can say what was
     actually done rather than "Done today". The mood keeps its own name
     because the hero and the panel already read it, but it is the same object:
     one place, three records. */
  const [mindKept, setMindKept] = useState(
    initial.mindKept !== undefined ? initial.mindKept : initial.mindMood ? { mood: initial.mindMood } : {}
  );
  const mindMood = mindKept.mood || null;
  const setMindMood = (v) => setMindKept((k) => ({ ...k, mood: v }));
  const keepMind = (id, what) => setMindKept((k) => ({ ...k, [id]: what }));
  /* Which worksheet is open, and what has been written in each. A template is
     finished by what somebody put in it, so the writing is the record rather
     than a tick beside it. */
  const [mindTemplate, setMindTemplate] = useState(
    initial.mindTemplate !== undefined ? initial.mindTemplate : null
  );
  const [templateKept, setTemplateKept] = useState(
    initial.templateKept !== undefined ? initial.templateKept : {}
  );
  const [mindDetail, setMindDetail] = useState(
    initial.mindDetail !== undefined ? initial.mindDetail : false
  );
  const [mindTab, setMindTab] = useState(initial.mindTab !== undefined ? initial.mindTab : "today");
  const [logExOpen, setLogExOpen] = useState(initial.logExOpen !== undefined ? initial.logExOpen : false);
  /* Which activity the movement logger opens already picked. The coach's
     routine is one of them, so a tap on the day's session row lands on the
     confirm rather than on a list the person has to find their own plan in. */
  const [logExPick, setLogExPick] = useState(initial.logExPick !== undefined ? initial.logExPick : null);
  const [routineDone, setRoutineDone] = useState(
    initial.routineDone !== undefined ? initial.routineDone : []
  );
  /* How each exercise felt, by id. The physio needs one thing back from a
     routine, whether it was pitched right, and this is the half of that loop
     that has to come from the person. It is answered instead of a tick rather
     than after one, so nobody spends a tap saying only that they did it. */
  const [routineFeel, setRoutineFeel] = useState(
    initial.routineFeel !== undefined ? initial.routineFeel : {}
  );
  /* Answering is what marks an exercise done, so the two move together. */
  const setFeel = (id, feel) => {
    setRoutineFeel((f) => ({ ...f, [id]: feel }));
    setRoutineDone((d) => (d.includes(id) ? d : d.concat(id)));
  };
  const clearFeel = (id) => {
    setRoutineFeel((f) => {
      const next = { ...f };
      delete next[id];
      return next;
    });
    setRoutineDone((d) => d.filter((x) => x !== id));
  };
  /* What the session just logged did, held for the screen that says so. Move's
     twin of logResult, so finishing a session lands somewhere rather than
     leaving on a toast. */
  const [moveResult, setMoveResult] = useState(
    initial.moveResult !== undefined ? initial.moveResult : null
  );
  /* Where the movement logger was opened from, so the result screen puts the
     person back. Move's twin of logReturn, and it exists for the same reason:
     landing everybody on Move sent somebody who tapped a row on their day to a
     permission gate about steps, straight after logging an exercise. */
  const [moveReturn, setMoveReturn] = useState(
    initial.moveReturn !== undefined ? initial.moveReturn : "move"
  );

  // ---------- Food logging ----------
  // logOpen is the Log a meal takeover. logItems is the meal being built.
  const [logOpen, setLogOpen] = useState(initial.logOpen !== undefined ? initial.logOpen : false);
  /* Which of the coach's options the logger was opened on, as { division, oi }.
     The logger's own list is Favourites and Frequent, neither of which knows
     what a coach planned, so arriving from a meal row used to mean hunting for
     your own plan by name. This is what puts it on screen. */
  const [logPlan, setLogPlan] = useState(initial.logPlan !== undefined ? initial.logPlan : null);
  /* Logging without typing: "snap" is a photo of the plate, "voice" is saying
     what you ate. Both are Kaira's, because reading a plate and hearing a
     sentence are the two things she is for, and typing a meal is the reason
     most people log once and never again. */
  const [kairaLog, setKairaLog] = useState(initial.kairaLog !== undefined ? initial.kairaLog : null);
  /* The WhatsApp message that lands when a plan is assigned, by pillar id.
     Not a screen in the app: it is what arrives before anybody opens it, and
     it is reachable from the control panel alone. */
  const [planNotif, setPlanNotif] = useState(initial.planNotif !== undefined ? initial.planNotif : null);
  /* Where the logger was opened from, so the result screen can put the person
     back. It used to land everybody on Eat, which is right for somebody who
     started there and wrong for somebody who tapped a row on their day and
     wants the list back with that row struck. */
  /* The meal being edited, by division, or null for a new one. Editing reopens
     the same logger rather than building a second screen, because changing a
     meal and recording one are the same job: say what you ate. */
  const [logEditing, setLogEditing] = useState(initial.logEditing !== undefined ? initial.logEditing : null);
  const [logReturn, setLogReturn] = useState(initial.logReturn !== undefined ? initial.logReturn : "eat");
  const [logItems, setLogItems] = useState([]);
  const [logTime, setLogTime] = useState(13 * 60 + 30); // minutes past midnight
  const [logTimeOpen, setLogTimeOpen] = useState(false);
  // Which food's macro sheet is open, by id.
  const [logInfo, setLogInfo] = useState(initial.logInfo !== undefined ? initial.logInfo : null);
  // Stands in front of the first log when targets do not exist yet.
  // Has the setup pitch been put in front of them at least once?
  /* Empty on a first run, because a heart is a choice somebody makes and the
     screen has no business claiming three of them before they have opened it
     once. The panel stages a returning day where they exist. */
  const [favorites, setFavorites] = useState(initial.favorites !== undefined ? initial.favorites : []);
  // Everything logged today: { division, timeMins, items: [{id, qty}] }
  const [mealsLogged, setMealsLogged] = useState(initial.mealsLogged !== undefined ? initial.mealsLogged : []);
  const [water, setWater] = useState(initial.water !== undefined ? initial.water : 0);
  /* Rows with no record anywhere else in the app: a supplement is taken or it
     is not, and there is nothing to open. Everything else derives its tick
     from the thing it actually made. */
  const [dayTicks, setDayTicks] = useState(initial.dayTicks !== undefined ? initial.dayTicks : []);
  /* Skipped today. Not a failure and not a tick: the row leaves today's count
     entirely, which is the whole point of being able to say no to one. */
  const [daySkipped, setDaySkipped] = useState(initial.daySkipped !== undefined ? initial.daySkipped : []);
  /* Which parts of the day the person has opened or shut by hand. It lives
     here rather than in the screen because logging a meal is a takeover: To-do
     unmounts, and a local copy came back empty, so somebody who left from the
     afternoon returned to a folded afternoon and had to go looking for the
     tick they had just earned. */
  const [openPhase, setOpenPhase] = useState(initial.openPhase !== undefined ? initial.openPhase : {});
  const [rowMenu, setRowMenu] = useState(initial.rowMenu !== undefined ? initial.rowMenu : null);
  /* Which coach tip is being explained, by row id.

     A tip and a meal sit on the same list and look the same, and they are not
     the same kind of ask: a meal is finished by a record going in somewhere, a
     tip is finished by doing it and saying so. The bulb on the row is what
     tells them apart, and this is what it opens. */
  const [tipInfo, setTipInfo] = useState(initial.tipInfo !== undefined ? initial.tipInfo : null);
  /* A question put to Kaira, by row id. The chat opens with it already sent,
     because the button that opened it was the question. */
  const [kairaAsk, setKairaAsk] = useState(initial.kairaAsk !== undefined ? initial.kairaAsk : null);
  // One hop, so the explainer hands over rather than stacking under the chat.
  const askKaira = (id) => { setTipInfo(null); setKairaAsk(id); };
  /* Which rows have already had their moment. Kept here rather than inside the
     row, because opening the Eat screen unmounts the whole day: a meal logged
     in there used to come back silently ticked, which is precisely the tap
     that most deserved the reward. */
  const [streakBurst, setStreakBurst] = useState(
    initial.streakBurst !== undefined ? initial.streakBurst : false
  );
  const [celebrated, setCelebrated] = useState(initial.celebrated !== undefined ? initial.celebrated : []);
  const celebrate = (id) => setCelebrated((c) => (c.includes(id) ? c : c.concat(id)));
  const uncelebrate = (id) => setCelebrated((c) => c.filter((x) => x !== id));
  /* Which option of a planned meal is showing. Lives here rather than inside
     the Eat screen, because To-do shows the same choice and the two would
     otherwise drift apart the moment you switched one of them. */
  const [planOption, setPlanOption] = useState(initial.planOption !== undefined ? initial.planOption : {});
  /* Which meal the Eat screen should land on, set by the row that sent you
     there, so a tap on Lunch does not drop you at the top of the day. */
  const [eatFocus, setEatFocus] = useState(initial.eatFocus !== undefined ? initial.eatFocus : null);
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
  const CARD_W = 312;
  const CARD_GAP = 12;
  const CARD_PAD = 22;
  // Both carousel cards are locked to this height so the sessions card does not
  // grow when a session is booked. Content inside each variant must fit.
  const CARD_H = 158;
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

  /* Who is actually on this person's care team. Lives here because the program
     page names them, and now a plan notification signs itself with one of them:
     a message from "Team GoodFlip" about work a named person did is the system
     taking credit for the relationship. */
  const careTeam = CARE_TEAM;

  /* What has been booked, by coach. Three consultations rather than one,
     because three people write three plans and each needs their own hour. */
  const [bookings, setBookings] = useState(initial.bookings !== undefined ? initial.bookings : {});
  /* Booking a consultation. `bookWith` is which of the care team, null while
     the list is showing, so one screen carries both steps the way the movement
     logger carries picking and confirming. */
  /* The one session Home shows: the soonest of whatever is booked. Derived
     rather than stored beside the bookings, so the card and the booking screen
     cannot end up disagreeing about what is next. The fallback is what the
     panel's own Booked chip demonstrates, for a session nobody walked through
     the flow to make. */
  const nextSession = (() => {
    const made = Object.entries(bookings).sort((a, b) => a[1].day - b[1].day);
    if (!made.length) {
      return { role: "Your Success Coach", coach: "Manya Jain", date: "17 Aug, 2026", time: "10:15 AM", cta: "Join Your Zoom Session" };
    }
    const [id, b] = made[0];
    const who = CARE_TEAM.find((c) => c.id === id);
    return { role: who.role, coach: who.name, date: b.full, time: b.time, cta: "Join Your Zoom Session" };
  })();
  /* A live session is not a consultation. Nobody books it, it is not yours,
     and it happens whether or not you turn up: a specialist runs an hour for
     everybody on the program. That is why it gets its own card rather than
     sitting in the queue of things you have booked, where every other entry is
     a slot with your name on it. */
  const LIVE_SESSION = {
    role: "Psychologist",
    host: "Shubha Dubey",
    date: "5 September",
    topic: "Breaking unhelpful habits, and building better ones",
  };
  const [liveState, setLiveState] = useState(initial.liveState !== undefined ? initial.liveState : "one");
  const liveSession = liveState === "none" ? null : LIVE_SESSION;

  const [bookOpen, setBookOpen] = useState(initial.bookOpen !== undefined ? initial.bookOpen : false);
  const [bookWith, setBookWith] = useState(initial.bookWith !== undefined ? initial.bookWith : null);
  const openBooking = (withId = null) => {
    // Landing on the picker with that coach already chosen, when the card that
    // sent you named one. Without it the list opens as it always did.
    setBookWith(withId);
    setPlanInfo(null);
    setBookOpen(true);
  };
  // Trailing space so the second card can actually reach the left edge.
  // Without it max scrollLeft < the snap target and the rail springs back.
  const CARD_TAIL = 390 - CARD_PAD - CARD_W;
  const carouselRef = useRef(null);
  const carouselLock = useRef(false);
  const carouselTimer = useRef(null);

  /* The Home rail, in order. The tabs above it are a view of this list, so
     adding a card here is all it takes to add a tab. */
  /* Booking is finished by a booking existing, which `bookings` already holds,
     rather than by anything ticking it. Everything else is ticked on the tap
     that hands off to another screen. */
  /* A booking is finished by a booking existing, which `bookings` already
     holds, rather than by anything ticking it. Everything else is ticked on
     the tap that hands off to another screen. */
  const COACH_OF = { eat: "eat", move: "move", mind: "success" };
  const nextIsDone = (id) =>
    nextDone.includes(id) ||
    (id.startsWith("book:") && !!bookings[COACH_OF[id.slice(5)]]);
  const nextOpen = nextActions.filter((id) => !nextIsDone(id));
  /* The prerequisites left the carousel and became the strip at the top of
     Home, which is `PrereqRail`, the same one To-do and the program page draw.
     They were the one thing on this screen blocking everything else, and a
     card somebody has to swipe sideways to find is a poor place for it.

     They read off `nextOpen` directly, so this rail is now the program, the
     bookings and any live session: the standing context rather than the work. */
  const HOME_CARDS = [
    "program",
    ...nextOpen.map((id) => "next:" + id),
    "sessions",
    ...(liveSession ? ["live"] : []),
  ];
  // A tab leading to nothing scheduled is worse than no tab.
  const HOME_TABS = [
    "program",
    nextOpen.length ? "next" : null,
    "sessions",
    liveSession ? "live" : null,
  ].filter(Boolean);
  // One tab, several cards: the first steps ride the rail one to a card.
  const tabOfCard = (c) => (c.startsWith("next:") ? "next" : c);
  const cardStep = CARD_W + CARD_GAP;
  // The card the tab is pointing at can stop existing, so fall back rather
  // than leaving no tab lit and the rail out of step.
  const homeTab = HOME_TABS.includes(homeProgramTab) ? homeProgramTab : "program";

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const target = Math.max(0, HOME_CARDS.findIndex((c) => tabOfCard(c) === homeTab)) * cardStep;
    if (Math.abs(el.scrollLeft - target) < 4) return;
    carouselLock.current = true;
    clearTimeout(carouselTimer.current);
    /* Instant, not smooth. A smooth programmatic scroll on a mandatory snap
       container gets cancelled the moment the layout moves under it, and the
       tab chip that was just tapped repaints in the same commit, so the rail
       used to set off and stop after thirty pixels. Tapping a tab is a jump
       anyway; there is nothing to follow along the way. */
    el.scrollTo({ left: target });
    carouselTimer.current = setTimeout(() => {
      carouselLock.current = false;
    }, 250);
  }, [homeTab, isPaid, activeTab]);

  // Only react once the swipe has settled, so the pill doesn't flicker mid-drag
  const handleCarouselScroll = (e) => {
    if (carouselLock.current) return;
    const left = e.currentTarget.scrollLeft;
    clearTimeout(carouselTimer.current);
    carouselTimer.current = setTimeout(() => {
      const i = Math.min(HOME_CARDS.length - 1, Math.max(0, Math.round(left / cardStep)));
      const next = tabOfCard(HOME_CARDS[i]);
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
  /* Shut by default, wherever it appears, unless somebody has opened it. It
     used to stand open before a plan landed, which made sense while it was a
     section on To-do. It is the strip at the top of Home now, and a strip that
     arrives already unfolded pushes the day itself below the fold on the one
     screen that is supposed to open on today. The header still says how many
     are left, so nothing is hidden by shutting it. */
  const prereqExpanded = prereqOpen === null ? false : prereqOpen;

  /* A plan lands while nobody is looking. These are the ones that have landed
     and have not been read yet, in EM3 order, so the card can announce one now
     and the other whenever it follows. Two plans arriving on two days is the
     normal case, not the edge one. */
  const PLAN_IN = { eat: () => kcalSource === "coach", move: () => !!movePlan, mind: () => !!mindPlan };
  const arrived =
    plan === "paid" ? ["eat", "move", "mind"].filter((id) => PLAN_IN[id]() && !planSeen.includes(id)) : [];
  const readPlan = (id) => setPlanSeen((s) => (s.includes(id) ? s : s.concat(id)));

  /* A coach's plan is a list of options per meal, and each option is a list of
     real foods. Storing food ids rather than names is what lets a plan item be
     tapped straight into the logger and come back ticked.

     `notes` are the parts of a plan that are not food: a supplement, a timing
     to hold to. They are ticked, not logged, and they belong to the meal they
     hang off, so the same instruction reaches both the day's list and the Eat
     screen from one place. */
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
      /* The coach's nudges. Small, free, and doable with what is already in
         the house: a bottle nobody has bought yet is not a habit. */
      notes: [
        {
          id: "note:methi",
          at: 6 * 60 + 30,
          when: "6:30 AM",
          verb: "Drink", name: "Warm water with methi",
          tip: "Soak a spoon of seeds overnight. Drink the water first thing.",
        },
        {
          id: "note:sun",
          at: 7 * 60 + 15,
          when: "7:15 AM",
          pillar: "mind",
          verb: "Get", name: "10 minutes of morning sun",
          tip: "Balcony or terrace, before nine. It sets your body clock for the day.",
        },
      ],
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
      notes: [
        {
          id: "note:almonds",
          at: 22 * 60 + 30,
          when: "10:30 PM",
          verb: "Soak", name: "5 almonds for tomorrow",
          tip: "In a small bowl of water, before bed. Peel them in the morning.",
        },
      ],
      plan: [
        [{ id: "walnut", qty: 2 }, { id: "chamomile", qty: 1 }],
      ],
    },
  ];

  /* Without a coach's plan there is nothing to say about a pre breakfast tea or
     a bedtime snack, so those slots are noise. Four meals is the day as a
     person would describe it; the plan is what adds the rest. */
  const CORE_DIVISIONS = ["breakfast", "lunch", "eveningsnack", "dinner"];
  const eatDivisions = (planAssigned
    ? eatDivisionsAll
    : eatDivisionsAll.filter((d) => CORE_DIVISIONS.includes(d.id))
  ).map((d) =>
    // A nudge is asked for on Eat and on the day's list, so it composes its
    // ask here, once, and both screens read the same words.
    d.notes ? { ...d, notes: d.notes.map((n) => ({ ...n, title: taskTitle(n) })) } : d
  );


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
      cat: "record", name: "Your 3 main meals",
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
      cat: "record", name: "20 minutes of movement",
      checks: 1,
      fill: { ftux: 0, empty: 0, partial: 0, done: 1 },
      hint: "Log whatever you did. Even a walk to the shop counts.",
      coins: 2,
    },
    {
      id: "mind",
      Icon: LotusIcon,
      cat: "habit", name: "A breathing break",
      checks: 1,
      fill: { ftux: 0, empty: 0, partial: 0, done: 1 },
      hint: "A short breather to lower stress. Calm counts too.",
      coins: 2,
    },
    {
      id: "measure",
      Icon: BarChart3,
      cat: "device", name: "Your BCA",
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
      cat: "device", name: "Your CGM",
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
  const dailyPillars = dailyPillarsAll
    .filter((p) => ((p.pillar || p.id) === "measure" ? planAssigned && shown.includes(p.id) : true))
    // The same composer the day's list uses, so a card and its row cannot
    // end up asking for the same work in two different words.
    .map((p) => ({ ...p, title: taskTitle(p) }));
  const dailyRepeating = dailyPillars;
  /* Three distinct meals, whichever three. It used to count breakfast, lunch
     and dinner alone, which told somebody whose day is a pre-breakfast tea, a
     4pm snack and a late dinner that they had eaten once. Any three slots is
     three readings of a day, and that is what a score needs. */
  const mealsIn = new Set(mealsLogged.map((m) => m.division)).size;

  /* Eat is the one task with a record behind it. Its progress is the meals
     actually in the day, never a separate counter, so the card, its header and
     its last-logged line cannot disagree the way they used to. */
  const fillWith = (prog, p) =>
    p.id === "eat"
      ? Math.min(p.checks, mealsIn)
      : p.id === "mind"
      ? Math.min(p.checks, Math.max(mindDone.length, prog[p.id] || 0))
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

  /* The one full screen moment in the app, on the crossing from an open day to
     a closed one. Landing on an already finished day is not a crossing, so the
     ref starts where the day is and nothing plays. */
  const wasComplete = useRef(dayComplete);
  useEffect(() => {
    if (dayComplete && !wasComplete.current) setStreakBurst(true);
    wasComplete.current = dayComplete;
  }, [dayComplete]);


  /* What the top of To-do shows. Two facts decide it: whether the care plan is
     in, and how much of today is logged. Both are read from the day itself, so
     the summary cannot claim an empty day while the Eat card claims a full
     one. */
  const heroState = !planAssigned
    ? "noplan"
    : mealsIn >= 3
    ? "full"
    : mealsIn > 0
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
    const owned = p.id === "eat" || p.id === "mind";
    const prog = owned ? taskProgress : { ...taskProgress, [p.id]: next };
    if (p.id === "eat") setMealsLogged(mealsLogged.concat(DEMO_DAY[next - 1]));
    else if (p.id === "mind") setMindDone(mindDone.concat("breathing"));
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
      // What was done, not what was asked. The ask is in the past by now.
      title: p.name || p.title,
      coins: p.coins || 0,
      before: dailyDoneCount / dailyPillars.length,
      after: count / dailyPillars.length,
      count,
      total: dailyPillars.length,
    });
    if (p.coins) {
      setToast({ title: "+" + p.coins + " Flipcoins earned", line: p.name || p.title, coins: p.coins });
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
  /* Steps and sleep are only there once a source exists. Null means unknown,
     which is a different thing from zero and has to read differently. */
  const daySteps = healthSync === "steps" ? null : healthOn("steps") ? 5008 : manualSteps;
  const lastNight = sleepLogs[sleepLogs.length - 1] || null;
  const sleepMins = healthSync === "sleep"
    ? null
    : healthOn("sleep")
    ? 5 * 60 + 20
    : lastNight
    ? (lastNight.wake - lastNight.bed + 1440) % 1440
    : null;

  /* Today as a diary. The pillars above are still what the streak counts, so
     the day cannot get harder just because the list got longer. These rows are
     the same work written out in the order it happens. */
  const measureRows = dailyPillars
    .filter((p) => (p.pillar || p.id) === "measure")
    .map((p) => ({ id: p.id, name: p.name, tip: p.hint, done: taskIsDone(p) }));

  /* A pillar's week, opened from its own row or from the sheet. It sets the
     pillar's trend to a week worth reading first, because sending somebody to
     a page that says "not enough days yet" is worse than not sending them. */
  const openWeek = (id) => {
    setWeekReads((r) => (r.includes(id) ? r : r.concat(id)));
    setWeekOpen(false);
    if (id === "eat") { setEatState("wc"); setEatTab("trend"); setEatDetail(true); }
    if (id === "move") {
      setMoveWeek("week");
      setMoveTab("trend");
      setHealthSource((h) => ({ ...h, steps: "phone" }));
      setMoveDetail(true);
    }
    if (id === "mind") {
      setMindWeek("week");
      setMindTab("trend");
      setHealthSource((h) => ({ ...h, sleep: "phone" }));
      setMindDetail(true);
    }
  };

  /* The mood said in words rather than as an id, so the day's list can print
     what was actually felt without keeping its own copy of the moods. */
  const moodLabel = (MOODS.find((m) => m.id === mindMood) || {}).label || null;

  const dayRows = buildDay({
    weekInsight, weekMode, weekReads,
    planAssigned, eatDivisions, mealsLogged, exLogs,
    sleepMins, daySteps, water, ticks: dayTicks, skipped: daySkipped, planOption,
    measureRows, healthSync, healthSource, phaseMode, moodLabel,
  });
  /* Skipped rows come out of the denominator rather than counting against it.
     A day you chose to make smaller should look smaller, not look failed. */
  const dayLive = dayRows.filter((r) => !r.skipped);
  /* The one task in front of you. A layout that expands only this and leaves
     the rest as lines needs to know which one it is, and it has to be derived
     from the day rather than tracked, or two screens would disagree about
     what is next. */
  const nextRowId = (dayLive.find((r) => !r.done) || {}).id;
  const dayRowsDone = dayLive.filter((r) => r.done).length;
  const dayPhases = phasesFor(phaseMode).map((f) => {
    const rows = dayRows.filter((r) => r.phase === f.id);
    const live = rows.filter((r) => !r.skipped);
    const done = live.filter((r) => r.done).length;
    return { ...f, rows, done, total: live.length, complete: rows.length > 0 && done === live.length };
  }).filter((f) => f.rows.length > 0);

  /* A task can finish a long way from the row that asked for it. Log a meal
     inside Eat and the diary row goes done while you are three screens away,
     so the moment comes to you as a toast instead of waiting on the list.

     Ticking a row on the diary itself already has its own strike, halo and
     confetti, so that case stays quiet rather than saying the same thing
     twice. And a finish that lands mid flow waits for the flow to end: the
     meal result screen is its own celebration and does not need a card
     dropping over it. */
  const doneKey = dayLive.filter((r) => r.done).map((r) => r.id).join("|");
  const wasRowDone = useRef(new Set(doneKey ? doneKey.split("|") : []));
  const [doneToastFor, setDoneToastFor] = useState(null);
  useEffect(() => {
    const now = new Set(doneKey ? doneKey.split("|") : []);
    const fresh = [...now].filter((id) => !wasRowDone.current.has(id));
    wasRowDone.current = now;
    /* One at a time. A whole set of rows arriving done together is a day
       being seeded, not a task being finished, and nobody wants a toast for
       that. */
    if (fresh.length !== 1) return;
    const onDiary = activeTab === "track" && !eatDetail && !moveDetail && !mindDetail;
    if (!onDiary) setDoneToastFor(fresh[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneKey]);
  useEffect(() => {
    if (!doneToastFor || logOpen || logResult) return;
    const r = dayRows.find((x) => x.id === doneToastFor);
    setDoneToastFor(null);
    if (!r) return;
    // Merge, so the coins the logging screen just awarded keep their pill.
    setToast((t) => ({
      ...(t || {}),
      title: "Done for today",
      line: (r.name || r.title) + " \u00b7 " + dayRowsDone + " of " + dayLive.length + " today",
      task: r.pillar,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneToastFor, logOpen, logResult]);

  /* Ticked, not logged. The supplement rows on To-do and the same rows inside
     the Eat plan both come through here, so a capsule cannot be taken on one
     screen and still outstanding on the other. */
  const toggleTick = (id) =>
    setDayTicks(dayTicks.includes(id) ? dayTicks.filter((x) => x !== id) : dayTicks.concat(id));

  const toggleSkip = (id) =>
    setDaySkipped(daySkipped.includes(id) ? daySkipped.filter((x) => x !== id) : daySkipped.concat(id));

  /* Every route into the logger goes through here, so where somebody came from
     is recorded once rather than guessed at the far end. */
  const openLog = (atMins, plan = null) => {
    if (atMins !== undefined) setLogTime(atMins);
    setLogPlan(plan);
    setLogEditing(null);
    setLogReturn(eatDetail ? "eat" : "track");
    setLogOpen(true);
  };

  /* Take a logged meal back off the day. It puts the task back on the list and
     the food back out of the totals, which is what somebody means when they
     say they logged the wrong thing. */
  const undoMeal = (division) => {
    setMealsLogged((ms) => ms.filter((m) => m.division !== division));
    setToast({ title: "Log removed", line: "Back on today's list" });
  };

  /* Reopen a meal already logged, with everything that went into it already in
     the basket. Saving replaces that meal rather than adding a second one, so
     a correction stays one meal in the day. */
  const editMeal = (division) => {
    const mine = mealsLogged.filter((m) => m.division === division);
    if (!mine.length) return;
    // Merged, because one slot can hold more than one entry from the old days
    // before editing existed.
    const items = [];
    mine.flatMap((m) => m.items).forEach((it) => {
      const at = items.findIndex((x) => x.id === it.id);
      if (at === -1) items.push({ ...it });
      else items[at].qty += it.qty;
    });
    setLogItems(items);
    setLogTime(mine[mine.length - 1].timeMins ?? DIVISION_TIME[division] ?? 13 * 60);
    setLogPlan(null);
    setLogEditing(division);
    setLogReturn(eatDetail ? "eat" : "track");
    setLogResult(null);
    setLogOpen(true);
  };

  /* The logger, opened on a coach's option with the food already picked.

     Three doors lead here and they all want the same thing: the meal row on
     the day's list, the Log all button under an option in Eat, and the circle
     beside a single line of that option. `only` is that last case; without it
     the whole option goes in, minus anything already logged, so a half eaten
     option offers the rest rather than asking for it twice.

     Nothing is recorded yet. The logger's own button is still what logs a
     meal, which keeps one meaning for the word across the app and leaves room
     to drop the thing you did not actually eat. */
  const openMealLog = (division, oi = 0, only) => {
    const d = eatDivisions.find((x) => x.id === division);
    const opts = planAssigned ? (d && d.plan) || [] : [];
    const already = new Set(
      mealsLogged.filter((m) => m.division === division).flatMap((m) => m.items.map((i) => i.id))
    );
    const pick = only ? [only] : (opts[oi] || []).filter((it) => !already.has(it.id));
    setLogItems(pick.map((it) => ({ id: it.id, qty: it.qty })));
    openLog(DIVISION_TIME[division], opts.length ? { division, oi } : null);
  };

  /* The movement logger, opened on what the person is most likely recording.

     Two doors: the session row on the day's list, and the logger's Your plan
     tab under
     the routine in Move. Both pass the routine, because both are somebody
     saying they did the coach's work. Passing nothing opens the pick list,
     which is what the free day's row and the Log exercise prompt want. */
  const openMoveLog = (id = null) => {
    setLogExPick(id);
    setMoveReturn(moveDetail ? "move" : "track");
    /* Deliberately does not open Move. The logger already wins over it in the
       takeover order, so leaving Move alone is what puts somebody back where
       they started: the day's list if they tapped the session row, Move if
       they tapped the routine inside it. Forcing Move open sent a person
       who had never answered the steps question to a permission gate about
       steps, straight after logging an exercise. */
    setLogExOpen(true);
  };

  /* One tap, two behaviours, no visual difference: a row either records itself
     here or sends you to the screen that owns the record. Nothing in the diary
     keeps its own copy of a fact, so it can never disagree with the pillar. */
  const openRow = (r) => {
    /* Hold the part of the day this came from open. Finishing the last task in
       a phase would otherwise fold it on the way back, which hides the tick at
       the exact moment it is worth seeing. */
    if (r.phase) setOpenPhase((p) => ({ ...p, [r.phase]: true }));
    if (r.kind === "tick") return toggleTick(r.id);
    /* Water opens its own sheet rather than toggling on the row. Two glasses
       was one ask while a coach set the number; without one it is a record,
       and a record needs somewhere to say how much and when. */
    if (r.to === "water") return setWaterSheet(true);
    /* Once the night is synced there is nothing left to do with it, so the
       row stops navigating. Opening Mind to show somebody a reading they can
       already see on the row is a trip for nothing. The three dot menu still
       carries the way to the record for anybody who wants it. */
    if (r.to === "sleep") {
      if (r.done) return;
      /* Nobody has said where nights come from yet, so ask here rather than on
         Mind. Granting Health Connect is a permission, not a screen, and
         sending somebody two screens away to give it means they come back to a
         different place than they left. The row shows the reading arriving. */
      if (healthSource.sleep === null) return setHealthSheet("sleep");
      if (healthSource.sleep === "manual") { setMindDetail(true); setLogSleepOpen(true); return; }
      setMindDetail(true);
      return;
    }
    /* Straight to the sheet the row names. Opening Mind and leaving somebody
       to find the breathing exercise is the work the tap was meant to save. */
    if (r.to.startsWith("mind:")) return setMindTool(r.to.slice(5));
    if (r.to === "mind") return setMindDetail(true);
    /* Straight to the logger, on the coach's routine when there is one. The
       session row names a thing that was done; landing on Move and hunting for
       where to say so is the work the tap was meant to save. */
    if (r.to === "move") return openMoveLog(planAssigned ? "routine" : null);
    if (r.to === "steps") { setMoveDetail(true); if (healthSource.steps === "manual") setStepsSheet(true); return; }
    /* The glucose sync has a screen of its own: the reading is the whole
       point of the tap, and Measure is a tab about everything. */
    /* Each device sync has a screen of its own: the reading is the whole point
       of the tap, and Measure is a tab about everything. */
    if (r.to === "week") return setWeekOpen(true);
    if (r.to.startsWith("week:")) return openWeek(r.to.slice(5));
    if (r.to === "measure") {
      if (r.id === "sync:cgm") return setCgmOpen(true);
      if (r.id === "sync:measure") return setBcaOpen(true);
      return setActiveTab("med");
    }
    /* Straight to the logger, on the option the row was showing. Landing on
       Eat and hunting for the meal you just named is the work the tap was
       meant to save. */
    /* A meal already logged has nothing left to ask for, so the tap opens the
       choice instead: change what went in, or take the log off. A meal half
       logged still opens the logger, carrying only what is still outstanding. */
    if (r.to.startsWith("eat:")) {
      if (r.done) return setRowMenu(r.id);
      return openMealLog(r.to.slice(4), r.oi ?? 0);
    }
  };

  /* Where a finished task was filed, which is a different question from how to
     do it. An unfinished meal opens the logger; asking where a logged one went
     opens Eat, because there is nothing left to log. */
  const goToRecord = (r) => {
    if (r.to && r.to.startsWith("eat:")) {
      setEatFocus(r.to.slice(4));
      setEatDetail(true);
      return;
    }
    // Same split on Move: the row's tap logs, the menu shows where it landed.
    if (r.to === "move") return setMoveDetail(true);
    openRow(r);
  };
  /* The macro furthest from where it should be. Sufficiency is the mean of the
     four capped ratios, so the lowest ratio is arithmetically the biggest thing
     anybody could fix today. It is what turns "Eat 35" into "fibre is the gap",
     which is the difference between a number and something to do about it.

     `why` is the mechanism, because a nutrient named without one is a scold. */
  const MACRO_KEY = { protein: "p", carbs: "c", fats: "f", fibre: "fibre" };
  const MACRO_WHY = {
    protein: "the part of food that keeps hunger away for hours",
    carbs: "your steadiest source of energy through the afternoon",
    fats: "what your body needs to absorb half its vitamins",
    fibre: "what slows the rise after a meal and feeds your gut",
  };
  const weakestMacro =
    mealsIn === 0
      ? null
      : dailyTargets
          .map((t) => ({
            ...t,
            have: Math.round(dayTotals[MACRO_KEY[t.id]] || 0),
            why: MACRO_WHY[t.id],
            ratio: (dayTotals[MACRO_KEY[t.id]] || 0) / (t.target || 1),
          }))
          .sort((a, b) => a.ratio - b.ratio)[0];

  const liveScore = scoreOf(dayTotals, dailyTargets);
  // The number exists either way. Whether it is legible is the gate.
  /* The score opens on the first meal, not the third.

     It used to wait for three on the reasoning that half a day reads worse
     than the day really is. That is true of a day's verdict and wrong for a
     number somebody is trying to move: a score that ignores the meal you just
     logged teaches that logging does nothing. It reads what is in so far and
     says how many slots are still to come, so the figure is honest about being
     partial without being hidden. */
  const scoreUnlocked = hasTargets && mealsIn > 0;
  // How many meal slots the day has, which is six with a plan and four without.
  const mealSlots = eatDivisions.length;

  /* One score per pillar, as the metabolism cards read them.

     Every lock comes off the day rather than a flag, so a card cannot show a
     number the day has not earned. Two of the figures are real: Eat's is
     today's sufficiency and Measure's is the score the Home card already
     carries. Momentum and Wellbeing have no formula yet, so they are staged
     here in one place rather than written into the card. Inventing a formula
     would make a product decision look settled that has not been made.

     `need` is why it is shut, and there are two kinds of shut. A countdown
     opens by itself if the day carries on. An act does not: no amount of
     logging produces a metabolic score, somebody has to take the check. Same
     lock, so the card draws them the same; opposite instruction, so the words
     are what tell them apart.

     No reading of the number here. "Light on protein" is a true thing to say
     and the wrong place to say it: a strip you swipe past has room for what a
     score is, not for what today's happens to mean. */
  const mealsLeft = Math.max(0, mealSlots - mealsIn);
  /* Momentum, the way the Move deck sets it out:

       Exercise 40  +  Steps 10  +  NEAT 10  +  Spread 40

     The coach's session carries most of it because it is the biggest lever the
     plan gives anybody. The small movements are the NEAT tenth, which is what
     makes the stairs and standing through a meeting count for something rather
     than being advice nobody can act on. Spread is ten a part of the day, so
     movement scattered across a day beats the same effort crammed into one
     block, which is the whole argument of the pillar.

     All four come off the day's own rows, so ticking one moves the bubble. */
  const moveRows = dayLive.filter((r) => r.pillar === "move");
  const neatRows = moveRows.filter((r) => r.kind === "tick");
  const neatDone = neatRows.filter((r) => r.done).length;
  const moveParts = new Set(moveRows.filter((r) => r.done).map((r) => r.phase)).size;
  const momentum = Math.round(
    (exLogs.length > 0 ? 40 : 0) +
      Math.min(1, (daySteps || 0) / STEP_GOAL) * 10 +
      (neatRows.length ? (neatDone / neatRows.length) * 10 : 0) +
      Math.min(40, moveParts * 10)
  );
  // Something has to have moved before there is a reading to show.
  const moveStarted = exLogs.length > 0 || (daySteps || 0) > 0 || neatDone > 0;

  const pillarScores = [
    {
      id: "eat", name: "Eat", score: "Nutrition sufficiency score", daily: true,
      open: scoreUnlocked,
      value: liveScore, out: "%",
      need: hasTargets ? "Log a meal to open this" : "Your coach sets your targets first",
    },
    {
      id: "move", name: "Move", score: "Momentum score", daily: true,
      open: moveStarted,
      value: momentum, out: "/100",
      need: "Move something to open this",
    },
    {
      id: "mind", name: "Mind", score: "Wellbeing score", daily: true,
      open: sleepLogs.length > 0 || mindDone.length > 0,
      value: 74, out: "/100",
      need: "Log last night's sleep to open this",
    },
    {
      /* The one score the day does not move. Eat, Move and Mind are earned
         by what you log today; a metabolic score comes from a check you go and
         take, so a day that has not touched it is not a day behind on it. */
      id: "measure", name: "Measure", score: "Metabolic score", daily: false,
      open: scoreState !== "locked",
      value: 68, out: "/100",
      need: "Find your Metabolic score in 5 min",
    },
  ];

  /* ---------- EM3, as four bubbles ----------

     To-do is adherence: the day as a list, in the order it happens. This is
     the other half. One pillar is drawn large, and it is the one worth a
     minute of somebody's attention right now.

     The rule, in order: whatever is due in this part of the day comes first,
     then anything left today at all, then the lowest score, then whoever owns
     the hour. Score leads over the clock on purpose, because being behind is
     a better reason to be looked at than being next.

     A pillar with no score yet shows the ask to go and log instead of a
     nought, since a percentage of nothing is a figure nobody has earned. */

  /* Whose hour it is, when nothing else separates them. Four pillars level on
     score is a real tie and each part of the day has one it belongs to:
     breakfast sets the morning, a reading suits the flat middle, the session
     goes before dinner, and the night is for winding down. */
  const SLOT_OWNER = { morning: "eat", afternoon: "measure", evening: "move", night: "mind" };

  /* What the big one says. Mind is the only one that changes through the day,
     because easing into a morning and winding down at night are opposite ends
     of the same pillar. */
  const NUDGE = {
    eat: { any: "Time to eat" },
    move: { any: "Time to move" },
    mind: { morning: "Ease into your day", night: "Time to wind down", any: "Take a breather" },
    measure: { any: "Time for a reading" },
  };
  const FIRST_ASK = {
    eat: "Log your first meal",
    move: "Log your first movement",
    mind: "Log last night's sleep",
    measure: "Take your first reading",
  };

  // The part of the day in front of you, the same one Home's card already reads.
  const bubblePhase = dayPhases.find((f) => !f.complete) || null;

  const bubbleRanked = pillarScores
    .map((p) => {
      const mine = dayLive.filter((r) => r.pillar === p.id);
      const openNow = bubblePhase
        ? mine.filter((r) => r.phase === bubblePhase.id && !r.done).sort((a, b) => a.at - b.at)
        : [];
      const done = mine.filter((r) => r.done).length;
      return {
        id: p.id,
        name: p.name,
        /* The pillar's own score, and only once it has one. Eat's is today's
           sufficiency, Measure's is the metabolic score, and Move and Mind are
           staged until their formulas land. */
        score: p.open ? p.value : null,
        started: p.open,
        /* Whether anything has gone in for this pillar today, which is a
           different question from whether the score has opened. Eat's opens on
           the first meal now, so the two agree there, but Measure's waits on a
           check nobody has taken and Mind's on a formula, so a pillar can have
           work done and still have no number. */
        logged: done > 0,
        total: mine.length,
        done,
        left: mine.filter((r) => !r.done).length,
        /* How full to draw it. The score once there is one, and how much of
           the pillar's day is in before that, so logging always moves
           something even while the number is still shut. */
        fill: p.open ? p.value : mine.length ? Math.round((done / mine.length) * 100) : 0,
        can: openNow.length > 0,
        daily: p.daily,
        nudge: (NUDGE[p.id] || {})[bubblePhase ? bubblePhase.id : ""] || (NUDGE[p.id] || {}).any,
        first: FIRST_ASK[p.id],
        // Why it is still shut, in the words `pillarScores` already wrote.
        need: p.need,
      };
    })
    .sort((a, b) => {
      const owner = bubblePhase ? SLOT_OWNER[bubblePhase.id] : null;
      /* Ranking value. A daily score nobody has opened yet sits at nought,
         because the whole of it is still to win today. A standing score with
         no figure sits out of the running instead: no amount of logging moves
         a metabolic score, so leading with it would point somebody at the one
         thing today cannot change. */
      const sc = (x) => (x.score !== null ? x.score : x.daily ? 0 : 101);
      return (
        b.can - a.can ||
        (b.left > 0) - (a.left > 0) ||
        /* Nothing logged sorts lowest of all, because a pillar nobody has
           started has the whole of itself still to win. */
        sc(a) - sc(b) ||
        (b.id === owner) - (a.id === owner) ||
        b.openNow - a.openNow ||
        0
      );
    });

  /* Only a finished day flattens the four. An hour with nothing due still has
     a pillar worth pointing at, and four identical circles would say the day
     had no shape at all. */
  const bubblesSettled = !bubblePhase;
  const bubbles = bubbleRanked.map((p, i) => ({
    ...p,
    hero: !bubblesSettled && i === 0 && p.left > 0,
  }));
  // The one Kaira has to talk about, so the two halves of the card agree.
  const bubbleHero = bubbles[0] && bubbles[0].hero ? bubbles[0] : null;

  /* What Kaira says under the bubbles.

     Two parts, always. A READ, the one true thing about where this pillar
     stands, and a LEVER, the specific act that moves it, with a real quantity
     or a real mechanism, named to the coach who chose it.

     She talks about the pillar in the big bubble and never another one,
     because a card whose halves disagree is worse than a card saying less.
     She never reads the number above her or the list below her back: both are
     already on screen, and repeating them costs her the only slot she has.

     Written out per state rather than composed, because the warmth is in the
     specifics and a sentence assembled from parts loses exactly that. */
  const KAIRA_LINE = {
    eat: {
      fresh: "Your Eat score is built from the meals you log, so it has nothing to work with yet. Log your first meal, whatever was actually on the plate, and the number appears.",
      morning: "Fibre usually runs short by the evening, and breakfast is the cheapest place to get ahead of it. The chilla option has 6 grams of the 30 you need today, so eat that one and log it.",
      afternoon: "You are at 44 grams of the 110 grams of protein you need today. The evening chana carries 9 grams on its own, which is the easiest 9 left, so make that your next meal and log it.",
      evening: "Your fibre is at 11 grams of 30 with dinner still to come. The multigrain roti option has 6 of them, so choosing that one and logging it closes most of tonight's gap.",
      night: "Finishing dinner two hours before bed gives your body the whole night for repair instead of digestion. The khichdi option is the lighter of the two, so pick that one and log it.",
    },
    move: {
      fresh: "Nothing has been logged for Move today, and sitting for long stretches quietly undoes the meals in between. Get ten minutes on your feet after your next meal and log it.",
      part: "Your session is the biggest single thing left in your day. Twenty minutes of it moves your score more than anything else you could do right now, so do it and log it.",
      any: "Your session does the most for your glucose when it lands before dinner. Half past six gives you the time, so get it done and log it.",
      night: "Walking after a meal does more for your glucose than walking before one. Take ten minutes after dinner and log the steps, and they count double.",
    },
    mind: {
      fresh: "Your body clock is set by the light you get in the first hour after waking. Ten minutes of sun before nine does more for tonight's sleep than anything you do at bedtime, so go out and tick it off.",
      part: "Sleep is the half of Mind a device can read, and how the day felt is the half only you can. Sync last night and log your mood, and both halves are in.",
      morning: "Ten minutes of sun before nine sets your body clock for the whole day, and that does more for tonight's sleep than anything you do at bedtime. Step outside and tick it off.",
      any: "How a day felt is the half of Mind no device can read for you. Log your mood in one tap and the pattern behind your weeks starts to show.",
      night: "A bedtime you keep every night does more for your glucose than the number of hours you get. Wind down now and mark it done, because the rhythm matters more than the total.",
    },
    measure: {
      fresh: "A body reading is the one number here that logging cannot give you. Take two minutes on the scale and sync it, because the next three months get built on what it says.",
      any: "A body reading is the one number here that logging cannot give you. Take two minutes on the scale and sync it, because the next three months get built on what it says.",
    },
  };

  const kairaLine = (() => {
    /* Nothing from her until a plan is in. Her whole job is joining a score to
       the work that moves it, and before a coach has written anything there is
       no plan to point at: the lines would be general nutrition advice from a
       companion who does not yet know anything about this person. The four
       cards above already say what the pillars are, which is all there is to
       say at that stage. */
    if (!planAssigned) return null;
    if (dayComplete)
      return "Everything on today's list is logged. Days like this are what turn into a pattern, and four of them in a week is when it starts to show.";
    if (!bubbleHero) return null;
    const set = KAIRA_LINE[bubbleHero.id] || {};
    if (!bubbleHero.logged) return set.fresh;
    if (!bubbleHero.started) return set.part || set.fresh;
    return set[bubblePhase ? bubblePhase.id : ""] || set.any || set.fresh;
  })();

  const value = {
    hasTargets, kcalTarget, dailyTargets, dayTotals, mealsIn, mealSlots, mealsLeft, liveScore, scoreUnlocked, weakestMacro,
    pillarScores, metabCard, setMetabCard,
    bubbles, bubbleHero, bubblePhase, bubblesSettled, kairaLine,
    activeGoal,
    authStep, setAuthStep, phone, setPhone, otp, setOtp, userName, setUserName, firstName,
    activeTab, setActiveTab, userState, setUserState, eatDetail, setEatDetail,
    eatState, setEatState, progressTab, setProgressTab, measureApproach, setMeasureApproach,
    msRange, setMsRange, msDetail, setMsDetail, a1Detail, setA1Detail,
    msa2Detail, setMsa2Detail, achieveRange, setAchieveRange, eatTab, setEatTab,
    deviceTab, setDeviceTab, deviceTabConnected, setDeviceTabConnected,
    plan, setPlan, homeProgramTab, setHomeProgramTab, homeCard, setHomeCard, sessionState, setSessionState,
    scoreState, setScoreState, setupState, setSetupState, dailyState, setDailyState,
    onboardingOpen, setOnboardingOpen, onboardingStep, setOnboardingStep,
    tour, setTour, tourName, setTourName,
    focusMarkDue, setFocusMarkDue, nextScrollDue, setNextScrollDue, preparing, setPreparing, tourTargets, pillarInfo, setPillarInfo, coinsInfo, setCoinsInfo, planInfo, setPlanInfo,
    planSeen, setPlanSeen, planChanged, setPlanChanged, arrived, readPlan, cgmOpen, setCgmOpen, bcaOpen, setBcaOpen, programIntro, setProgramIntro, armProgramIntro,
    programIntroSeen, setProgramIntroSeen, todayOnboarded, setTodayOnboarded,
    streakDays, setStreakDays, streakShown,
    moveDetail, setMoveDetail, moveTab, setMoveTab, movePlan, setMovePlan,
    moveWeek, setMoveWeek, mindWeek, setMindWeek, mindPlan, setMindPlan,
    weekInsight, setWeekInsight, weekOpen, setWeekOpen,
    weekMode, setWeekMode, weekReads, setWeekReads, openWeek, taskCard, setTaskCard,
    phaseMode, setPhaseMode,
    healthSource, setHealthSource, healthOn, healthSheet, setHealthSheet,
    manualSteps, setManualSteps, stepsSheet, setStepsSheet, waterSheet, setWaterSheet, healthSync, setHealthSync, pickSource,
    sleepLogs, setSleepLogs, logSleepOpen, setLogSleepOpen,
    mindTool, setMindTool, mindDone, setMindDone, mindMood, setMindMood, mindDetail, setMindDetail, mindTab, setMindTab,
    mindKept, setMindKept, keepMind, mindTemplate, setMindTemplate, templateKept, setTemplateKept,
    exLogs, setExLogs, daySteps, sleepMins, lastNight, logExOpen, setLogExOpen, routineDone, setRoutineDone,
    logExPick, setLogExPick, openMoveLog, routineFeel, setRoutineFeel, setFeel, clearFeel, moveResult, setMoveResult,
    moveReturn, setMoveReturn,
    logOpen, setLogOpen, logItems, setLogItems, logTime, setLogTime,
    logPlan, setLogPlan, logReturn, setLogReturn, openLog, openMealLog, goToRecord,
    logEditing, setLogEditing, editMeal, undoMeal,
    kairaLog, setKairaLog, planNotif, setPlanNotif, careTeam,
    logTimeOpen, setLogTimeOpen, logInfo, setLogInfo, 
     favorites, setFavorites,
    mealsLogged, setMealsLogged, mealItem, setMealItem, metricInfo, setMetricInfo, logResult, setLogResult, toast, setToast,
    suffFlow, setSuffFlow, suffLift, setSuffLift,
    scoreFlow, setScoreFlow, scoreFocus, setScoreFocus, scoreStep, setScoreStep,
    SUB_SCORES, metabolicScore,
    suffDone, setSuffDone, suffEdit, setSuffEdit, suffSheet, setSuffSheet, suffGoal, setSuffGoal, suffKcal, setSuffKcal,
    kcalSource, setKcalSource, suffMeals, setSuffMeals,
    suffAddons, setSuffAddons,
    streakState, setStreakState, streakOpen, setStreakOpen,
    setFlipcoins,
    programDetail, setProgramDetail, programSub, setProgramSub,
    chatsOpen, setChatsOpen, openGroups, setOpenGroups,
    flipcoins, isPaid, CARD_W, CARD_GAP, CARD_PAD, CARD_H,
    SHOW_PROGRAM_TABS, program, bookedSession: nextSession, CARD_TAIL, carouselRef,
    bookOpen, setBookOpen, bookWith, setBookWith, openBooking, bookings, setBookings,
    liveState, setLiveState, liveSession,
    nextActions, nextDone, setNextDone, nextOpen, setNextList,
    prereqHidden, setPrereqHidden, prereqAsk, setPrereqAsk,
    prereqOpen, setPrereqOpen, prereqExpanded,
    HOME_CARDS, HOME_TABS, homeTab,
    handleCarouselScroll, isReturning, isDevice, sufficiencyRings, eatDivisions,
    progressTabs, setupTasks, setupDoneCount, metPillars, dailyPillars,
    dailyRepeating, dailyDoneCount, dayFraction, dayComplete, taskFill, taskIsDone,
    planAssigned, heroState, measureTasks, setMeasureTasks, streakInfo, setStreakInfo, shareOpen, setShareOpen, shareClaimed, setShareClaimed,
    SHARE_COINS, STREAK_REWARDS,
    MILESTONES, milestones, setMilestones, milestoneStatus,
    completeTask, taskProgress, setTaskProgress, taskDone, setTaskDone,
    dayRows, dayLive, dayPhases, dayRowsDone, nextRowId, openRow, water, setWater, dayTicks, setDayTicks,
    daySkipped, setDaySkipped, toggleSkip, toggleTick, rowMenu, setRowMenu, planOption, setPlanOption,
    openPhase, setOpenPhase,
    tipInfo, setTipInfo, kairaAsk, setKairaAsk, askKaira,
    celebrated, celebrate, uncelebrate, streakBurst, setStreakBurst,
    eatFocus, setEatFocus,
    onbFinish, onbBack, pillarExplain,
  };
  return <WF.Provider value={value}>{children}</WF.Provider>;
}
