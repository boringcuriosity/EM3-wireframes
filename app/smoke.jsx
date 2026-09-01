// ponytail: throwaway smoke test. Renders every screen under the provider so a
// missing import or identifier from the split fails loudly. Delete when bored.
import React from "react";
import { renderToString } from "react-dom/server";
import { WFProvider } from "./src/state";
import App from "./src/App";
import FreeHome from "./src/screens/FreeHome";
import PaidHome from "./src/screens/PaidHome";
import MindDetail from "./src/screens/mind/MindDetail";
import LogSleep from "./src/screens/mind/LogSleep";
import ToolSheet from "./src/screens/mind/ToolSheet";
import HealthConnectSheet from "./src/components/HealthConnectSheet";
import HealthGate from "./src/components/HealthGate";
import AddStepsSheet from "./src/screens/move/AddStepsSheet";
import TrackPage, { TodayFtux } from "./src/screens/Today";
import CarePage from "./src/screens/Care";
import MorePage from "./src/screens/More";
import EatDetailPage from "./src/screens/EatDetail";
import OnboardingPage from "./src/screens/Onboarding";
import ChatsPage from "./src/screens/Chats";
import ProgramDetailPage from "./src/screens/ProgramDetail";
import ProgramProgressPage from "./src/screens/ProgramProgress";
import ProgressPage from "./src/screens/measure/ProgressPage";
import MsPage from "./src/screens/measure/MsPage";
import A1Page from "./src/screens/measure/A1Page";
import Msa2Page from "./src/screens/measure/Msa2Page";
import SmartDevices from "./src/components/SmartDevices";
import HomeTopBar from "./src/components/HomeTopBar";
import FirstWeekSetup from "./src/components/FirstWeekSetup";
import FtuxExplainer from "./src/components/FtuxExplainer";
import DailyTasks from "./src/components/DailyTasks";
import ControlPanel from "./src/components/ControlPanel";
import Splash from "./src/screens/auth/Splash";
import PhoneEntry from "./src/screens/auth/PhoneEntry";
import OtpEntry from "./src/screens/auth/OtpEntry";
import NameEntry from "./src/screens/auth/NameEntry";
import PillarFlower from "./src/components/PillarFlower";
import ProgramWelcomeSheet from "./src/components/ProgramWelcomeSheet";
import StreakStrip from "./src/components/StreakStrip";
import StreakGuide from "./src/screens/StreakGuide";
import SufficiencyFlow from "./src/screens/sufficiency/SufficiencyFlow";
import LiftSheet from "./src/screens/sufficiency/LiftSheet";
import CaloriesSheet from "./src/screens/sufficiency/CaloriesSheet";
import LogMeal from "./src/screens/log/LogMeal";
import MealLogged from "./src/screens/log/MealLogged";
import TimeSheet from "./src/screens/log/TimeSheet";
import FoodInfoSheet from "./src/screens/log/FoodInfoSheet";
import PillarScienceSheet from "./src/components/PillarScienceSheet";
import SufficiencyCard from "./src/screens/log/SufficiencyCard";
import MoveDetail from "./src/screens/move/MoveDetail";
import LogExercise from "./src/screens/move/LogExercise";
import Toast from "./src/components/Toast";
import MacroSheet from "./src/screens/sufficiency/MacroSheet";

const screens = { App, FreeHome, PaidHome, TrackPage, TodayFtux, CarePage, MorePage,
  ProgramProgressPage, ProgressPage, MsPage, A1Page, Msa2Page, SmartDevices,
  HomeTopBar, FirstWeekSetup, FtuxExplainer, DailyTasks, StreakStrip, ControlPanel,
  EatDetailPage, OnboardingPage, StreakGuide, MoveDetail, Splash, PhoneEntry };

let fails = 0;
for (const [name, C] of Object.entries(screens)) {
  try {
    const html = renderToString(<WFProvider><C /></WFProvider>);
    console.log(`ok   ${name.padEnd(22)} ${html.length} chars`);
  } catch (e) {
    fails++;
    console.log(`FAIL ${name.padEnd(22)} ${e.message}`);
  }
}

// Branch coverage: the same screen in every state that gates a different tree.
const MATRIX = [
  ["strip:new",        StreakStrip,      { streakState: "new" }],
  ["strip:active",     StreakStrip,      { streakState: "active" }],
  ["strip:broken",     StreakStrip,      { streakState: "broken" }],
  ["strip:doneToday",  StreakStrip,      { streakState: "active", dailyState: "done" }],
  ["guide:new",        StreakGuide,      { streakState: "new" }],
  ["guide:running",    StreakGuide,      { streakState: "active" }],
  ["daily:ftux",       DailyTasks,       { dailyState: "ftux" }],
  ["daily:empty",      DailyTasks,       { dailyState: "empty" }],
  ["daily:partial",    DailyTasks,       { dailyState: "partial" }],
  ["daily:done",       DailyTasks,       { dailyState: "done" }],
  ["home:free",        App,              { plan: "free", authStep: null, programIntro: null }],
  ["home:paid",        App,              { plan: "paid", authStep: null, programIntro: null }],
  ["home:sheet",       App,              { plan: "paid", authStep: null, programIntro: "sheet" }],
  ["home:tour:0",      App,              { plan: "paid", authStep: null, programIntro: null, tour: 0 }],
  ["home:tour:2",      App,              { plan: "paid", authStep: null, programIntro: null, tour: 2 }],
  ["home:tour:2b",      App,              { plan: "paid", authStep: null, programIntro: null, tour: 2, dailyState: "ftux" }],
  ["sci:eat",          App,              { authStep: null, onboardingOpen: true, pillarInfo: "eat" }],
  ["sci:move",         App,              { authStep: null, onboardingOpen: true, pillarInfo: "move" }],
  ["sci:mind",         App,              { authStep: null, onboardingOpen: true, pillarInfo: "mind" }],
  ["sci:measure",      App,              { authStep: null, onboardingOpen: true, pillarInfo: "measure" }],
  ["coins:info",       App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", coinsInfo: true }],
  ["eat:sci",          App,              { authStep: null, eatDetail: true, pillarInfo: "eat" }],
  ["task:done:1",      App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", taskProgress: { eat: 3 }, taskDone: { id: "eat", title: "Log your 3 main meals", coins: 4, before: 0, after: 0.25, count: 1, total: 4 } }],
  ["task:done:all",    App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", taskProgress: { eat: 3, move: 1, mind: 1, measure: 1 }, taskDone: { id: "measure", title: "Sync your BCA", coins: 10, before: 0.75, after: 1, count: 4, total: 4 } }],
  ["task:partial",     App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", taskProgress: { eat: 3, move: 1 } }],
  ["task:midmeal",     App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", taskProgress: { eat: 2 } }],
  ["plan:pending",     App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", kcalSource: "pending", movePlan: null }],
  ["plan:assigned",    App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", kcalSource: "coach", movePlan: "assigned" }],
  ["plan:free",        App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", plan: "free" }],
  ["planinfo:eat",     App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", planInfo: "eat" }],
  ["planinfo:move",    App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", planInfo: "move" }],
  ["focus:noplan",     App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", kcalSource: "pending", movePlan: null }],
  ["focus:withplan",   App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", kcalSource: "coach", movePlan: "assigned" }],
  ["focus:cgm",        App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", kcalSource: "coach", movePlan: "assigned", measureTasks: "cgm" }],
  ["focus:bothdev",    App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", kcalSource: "coach", movePlan: "assigned", measureTasks: "both" }],
  ["home:bothdev",     App,              { plan: "paid", authStep: null, programIntro: null, dailyState: "empty", kcalSource: "coach", movePlan: "assigned", measureTasks: "both" }],
  ["move:plantab",     App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", logExOpen: true, logExPick: "routine", healthSource: { steps: "phone", sleep: "phone" } }],
  ["move:plantab:part", App,             { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", logExOpen: true, logExPick: "routine", routineFeel: { neck: "easy", arms: "hard" }, routineDone: ["neck", "arms"], healthSource: { steps: "phone", sleep: "phone" } }],
  ["move:result",      App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", exLogs: [{ id: "routine", minutes: 20, intensity: "light", timeMins: 1120 }], moveResult: { entry: { id: "routine", minutes: 20, intensity: "light", timeMins: 1120 }, before: 0, after: 20, count: 4, total: 4, feel: "hard" } }],
  ["move:result:walk", App,              { authStep: null, activeTab: "track", todayOnboarded: true, exLogs: [{ id: "walk", minutes: 12, intensity: "moderate", timeMins: 1000 }], moveResult: { entry: { id: "walk", minutes: 12, intensity: "moderate", timeMins: 1000 }, before: 0, after: 12 } }],
  ["move:logroutine",  App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", moveDetail: true, logExOpen: true, logExPick: "routine", healthSource: { steps: "phone", sleep: "phone" } }],
  ["move:logpick",     App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", moveDetail: true, logExOpen: true, healthSource: { steps: "phone", sleep: "phone" } }],
  ["move:routineticked", App,            { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", moveDetail: true, healthSource: { steps: "phone", sleep: "phone" } }],
  ["mind:tpl:smart",   App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", mindPlan: "assigned", mindTemplate: "smart" }],
  ["mind:tpl:worry",   App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", mindPlan: "assigned", mindTemplate: "worry" }],
  ["mind:tpl:week",    App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", mindPlan: "assigned", mindTemplate: "tracker" }],
  ["mind:tpl:saved",   App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", mindPlan: "assigned", mindTemplate: "smart", templateKept: { smart: { answers: { goal: "Walk after dinner" }, summary: "Walk after dinner · 1 of 6 answered" } } }],
  ["mind:tools:done",  App,              { authStep: null, activeTab: "track", todayOnboarded: true, mindDetail: true, healthSource: { steps: "phone", sleep: "phone" }, mindDone: ["mood", "breathing", "affirmation"], mindKept: { mood: "Calm", affirmation: "I release what no longer serves me." } }],
  ["mind:plan:list",   App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", mindPlan: "assigned", mindDetail: true, healthSource: { steps: "phone", sleep: "phone" } }],
  ["book:list",        App,              { authStep: null, activeTab: "track", todayOnboarded: true, bookOpen: true }],
  ["book:slots",       App,              { authStep: null, activeTab: "track", todayOnboarded: true, bookOpen: true, bookWith: "eat" }],
  ["plan:wait:both",   App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "pending", movePlan: null, planInfo: "both" }],
  ["metric:eaten",     App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", dailyState: "partial", metricInfo: "eaten" }],
  ["metric:tdee",      App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", dailyState: "partial", metricInfo: "tdee" }],
  ["metric:balance",   App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", dailyState: "partial", metricInfo: "balance" }],
  ["plan:card:none",   App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "pending", movePlan: null, mindPlan: null }],
  ["plan:card:one",    App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: null, mindPlan: null }],
  ["plan:card:two",    App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", mindPlan: null }],
  ["plan:card:all",    App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", mindPlan: "assigned" }],
  ["plan:whatsapp",    App,              { authStep: null, activeTab: "track", todayOnboarded: true, planNotif: "whatsapp" }],
  ["plan:push",        App,              { authStep: null, activeTab: "track", todayOnboarded: true, planNotif: "push" }],
  ["log:snap",         App,              { authStep: null, activeTab: "track", todayOnboarded: true, logOpen: true, kairaLog: "snap" }],
  ["log:voice",        App,              { authStep: null, activeTab: "track", todayOnboarded: true, logOpen: true, kairaLog: "voice" }],
  ["log:onplan",       App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", logOpen: true, logPlan: { division: "breakfast", oi: 0 }, logItems: [] }],
  ["log:onplan:opt2",  App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", logOpen: true, logPlan: { division: "lunch", oi: 1 } }],
  ["log:noplan:tab",   App,              { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", logOpen: true, logPlan: { division: "breakfast", oi: 9 } }],
  ["log:back:track",   App,              { authStep: null, activeTab: "track", todayOnboarded: true, logReturn: "track", logResult: { before: 0, after: 21, mealCount: 1, meal: { division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }] } } }],
  ["tip:sheet",        App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", kcalSource: "coach", movePlan: "assigned", tipInfo: "note:methi" }],
  ["tip:sheet:mind",   App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", kcalSource: "coach", movePlan: "assigned", tipInfo: "note:sun" }],
  ["tip:kaira",        App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", kcalSource: "coach", movePlan: "assigned", kairaAsk: "note:almonds" }],
  ["tip:kaira:noans",  App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", kcalSource: "coach", movePlan: "assigned", kairaAsk: "meal:lunch" }],
  ["tip:eat",          App,              { authStep: null, activeTab: "track", todayOnboarded: true, eatDetail: true, kcalSource: "coach", movePlan: "assigned", tipInfo: "note:methi" }],
  ["day:4parts",       App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", kcalSource: "coach", movePlan: "assigned", phaseMode: 4 }],
  ["day:3parts",       App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", kcalSource: "coach", movePlan: "assigned", phaseMode: 3 }],
  ["prereq:strip",     App,             { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", nextDone: ["score"] }],
  ["prereq:open",      App,             { authStep: null, activeTab: "track", todayOnboarded: true, kcalSource: "coach", movePlan: "assigned", prereqOpen: true }],
  ["prereq:hidesheet", App,             { authStep: null, activeTab: "track", todayOnboarded: true, prereqAsk: true }],
  ["prereq:hidden",    App,             { authStep: null, activeTab: "track", todayOnboarded: true, prereqHidden: true }],
  ["metab:peek",       App,              { authStep: null, activeTab: "home", todayOnboarded: true, dailyState: "partial", metabCard: "peek", kcalSource: "coach", movePlan: "assigned" }],
  ["metab:medal",      App,              { authStep: null, activeTab: "home", todayOnboarded: true, dailyState: "partial", metabCard: "medal", kcalSource: "coach", movePlan: "assigned" }],
  ["metab:gauge",      App,              { authStep: null, activeTab: "home", todayOnboarded: true, dailyState: "partial", metabCard: "gauge", kcalSource: "coach", movePlan: "assigned" }],
  ["metab:headline",   App,              { authStep: null, activeTab: "home", todayOnboarded: true, dailyState: "empty", metabCard: "headline" }],
  ["day:night:home",   App,              { authStep: null, activeTab: "home", todayOnboarded: true, dailyState: "empty", homeCard: "phase", phaseMode: 4 }],
  ["todo:withdata",    App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "partial" }],
  ["todo:daydone",     App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "done", streakDays: 1 }],
  ["hero:noplan",      App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", kcalSource: "pending", movePlan: null }],
  ["hero:nodata",      App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", kcalSource: "coach", movePlan: "assigned" }],
  ["hero:partial",     App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "partial", kcalSource: "coach", movePlan: "assigned" }],
  ["hero:full",        App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "done", kcalSource: "coach", movePlan: "assigned" }],
  ["streak:won:todo",  App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", streakDays: 1, taskProgress: { eat: 3, move: 1, mind: 1, measure: 1 } }],
  ["streak:won:home",  App,              { plan: "paid", authStep: null, programIntro: null, dailyState: "empty", streakDays: 1, taskProgress: { eat: 3, move: 1, mind: 1, measure: 1 } }],
  ["streak:rewards",   App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", streakDays: 6, taskProgress: { eat: 3, move: 1, mind: 1, measure: 1 }, streakInfo: true }],
  ["strip:none",       App,              { plan: "paid", authStep: null, programIntro: null, dailyState: "empty", streakState: "new", streakDays: 0 }],
  ["strip:running",    App,              { plan: "paid", authStep: null, programIntro: null, dailyState: "empty", streakState: "active", streakDays: 5, taskProgress: { eat: 3 } }],
  ["guide:broken",     StreakGuide,      { streakState: "broken", streakDays: 0 }],
  ["guide:day5",       StreakGuide,      { streakState: "active", streakDays: 5, dailyState: "empty", taskProgress: { eat: 3, move: 1 } }],
  ["guide:miles",      StreakGuide,      { streakState: "active", streakDays: 9, milestones: { earned: [1], missed: [3] } }],
  ["share:new",        App,              { authStep: null, streakOpen: "guide", streakDays: 6, shareOpen: true, shareClaimed: false }],
  ["share:claimed",    App,              { authStep: null, streakOpen: "guide", streakDays: 6, shareOpen: true, shareClaimed: true }],
  ["guide:shared",     StreakGuide,      { streakState: "active", streakDays: 6, shareClaimed: true }],
  ["home:focusmark",   App,              { plan: "paid", authStep: null, programIntro: null, dailyState: "empty", tourName: "focus", tour: 0 }],
  ["home:mark",        App,              { plan: "paid", authStep: null, programIntro: "mark" }],
  ["measure:a0",       App,              { authStep: null, activeTab: "med", measureApproach: "a0", programIntro: null }],
  ["measure:ms",       App,              { authStep: null, activeTab: "med", measureApproach: "ms", programIntro: null }],
  ["measure:a1",       App,              { authStep: null, activeTab: "med", measureApproach: "a1", programIntro: null }],
  ["measure:msa2",     App,              { authStep: null, activeTab: "med", measureApproach: "msa2", programIntro: null }],
  ["today:ftux",       App,              { authStep: null, activeTab: "track", todayOnboarded: false, programIntro: null }],
  ["preparing",        App,              { authStep: null, preparing: true }],
  ["today:on",         App,              { authStep: null, activeTab: "track", todayOnboarded: true, programIntro: null }],
  ["today:nodata",     App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", programIntro: null }],
  ["today:nodata:set", App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", suffDone: true, programIntro: null }],
  ["today:hasdata",    App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "partial", programIntro: null }],
  ["today:preconsult", App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", kcalSource: "pending", programIntro: null }],
  ["today:coachset",   App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", kcalSource: "coach", programIntro: null }],
  ["today:free:empty", App,              { authStep: null, activeTab: "track", todayOnboarded: true, dailyState: "empty", plan: "free", programIntro: null }],
  ["suff:learn",       SufficiencyFlow,  { suffFlow: "learn" }],
  ["suff:profile",     SufficiencyFlow,  { suffFlow: "profile" }],
  ["suff:meals",       SufficiencyFlow,  { suffFlow: "meals" }],
  ["suff:computing",   SufficiencyFlow,  { suffFlow: "computing" }],
  ["suff:result",      SufficiencyFlow,  { suffFlow: "result" }],
  ["suff:computing2",  SufficiencyFlow,  { suffFlow: "computing2" }],
  ["suff:lifted",      SufficiencyFlow,  { suffFlow: "lifted" }],
  ["suff:liftsheet",   LiftSheet,        {}],
  ["suff:profile:edit",SufficiencyFlow,  { suffFlow: "profile", suffEdit: true }],
  ["suff:goal:steady", SufficiencyFlow,  { suffFlow: "profile", suffGoal: "steady" }],
  ["suff:goal:muscle", SufficiencyFlow,  { suffFlow: "profile", suffGoal: "muscle" }],
  ["suff:goal:lose",   SufficiencyFlow,  { suffFlow: "profile", suffGoal: "lose" }],
  ["kcal:pending",     SufficiencyFlow,  { suffFlow: "profile", kcalSource: "pending" }],
  ["kcal:coachset",    SufficiencyFlow,  { suffFlow: "profile", kcalSource: "coach" }],
  ["kcal:free",        SufficiencyFlow,  { suffFlow: "profile", plan: "free" }],
  ["sheet:kcal",       CaloriesSheet,    { suffFlow: "profile" }],
  ["sheet:kcal:lock",  CaloriesSheet,    { suffFlow: "profile", kcalSource: "coach" }],
  ["sheet:protein",    MacroSheet,       { suffSheet: "protein" }],
  ["sheet:carbs",      MacroSheet,       { suffSheet: "carbs" }],
  ["sheet:fats",       MacroSheet,       { suffSheet: "fats" }],
  ["sheet:fibre",      MacroSheet,       { suffSheet: "fibre" }],
  ["eat:wc",           App,              { authStep: null, eatDetail: true, eatState: "wc", programIntro: null }],
  ["eat:ft",           App,              { authStep: null, eatDetail: true, eatState: "ft", programIntro: null }],
  ["eat:ft:setup",     App,              { authStep: null, eatDetail: true, eatState: "ft", suffDone: true, programIntro: null }],
  ["log:search",       LogMeal,          {}],
  ["log:timesheet",    TimeSheet,        {}],
  ["suff:science",     PillarScienceSheet, { pillarInfo: "eat" }],
  ["suff:science:plan", PillarScienceSheet, { pillarInfo: "eat", kcalSource: "coach", movePlan: "assigned" }],
  ["science:move",     PillarScienceSheet, { pillarInfo: "move", kcalSource: "coach", movePlan: "assigned", healthSource: { steps: "phone", sleep: null } }],
  ["science:move:man", PillarScienceSheet, { pillarInfo: "move", healthSource: { steps: "manual", sleep: null } }],
  ["science:mind",     PillarScienceSheet, { pillarInfo: "mind", healthSource: { steps: null, sleep: "phone" } }],
  ["mind:gate",        MindDetail,       { mindDetail: true }],
  ["move:gate",        MoveDetail,       { moveDetail: true }],
  ["gate:steps",       (p) => <HealthGate signal="steps" {...p} />, {}],
  ["gate:sleep",       (p) => <HealthGate signal="sleep" {...p} />, {}],
  ["mind:today",       MindDetail,       { mindDetail: true, healthSource: { steps: null, sleep: "manual" } }],
  ["mind:phone",       MindDetail,       { mindDetail: true, healthSource: { steps: null, sleep: "phone" } }],
  ["mind:slept",       MindDetail,       { mindDetail: true, healthSource: { steps: null, sleep: "phone" } }],
  ["mind:trend",       MindDetail,       { mindDetail: true, mindTab: "trend", healthSource: { steps: null, sleep: "manual" } }],
  ["mind:learn",       MindDetail,       { mindDetail: true, mindTab: "learn", healthSource: { steps: null, sleep: "manual" } }],
  ["mind:logsleep",    LogSleep,         { logSleepOpen: true }],
  ["mind:tool:mood",   ToolSheet,        { mindTool: "mood" }],
  ["mind:tool:breath", ToolSheet,        { mindTool: "breathing" }],
  ["mind:tool:aff",    ToolSheet,        { mindTool: "affirmation" }],
  ["mind:tool:journal", ToolSheet,       { mindTool: "journal" }],
  ["health:steps",     HealthConnectSheet, { healthSheet: "steps" }],
  ["health:sleep",     HealthConnectSheet, { healthSheet: "sleep" }],
  ["home:next",        PaidHome,         { homeProgramTab: "next" }],
  ["home:next:tick",   PaidHome,         { homeProgramTab: "next", nextDone: ["score", "labs"] }],
  ["home:next:none",   PaidHome,         { homeProgramTab: "next", nextActions: [] }],
  ["log:foodinfo",     FoodInfoSheet,    { logInfo: "poha" }],
  ["log:foodinfo:hi",  FoodInfoSheet,    { logInfo: "chicken" }],
  ["log:result:first", MealLogged,       { mealsLogged: [{ division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }, { id: "chai", qty: 2 }] }], logResult: { before: 0, after: 21, meal: { division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }, { id: "chai", qty: 2 }] }, mealCount: 1 } }],
  ["log:result:third", MealLogged,       { mealsLogged: [{ division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }, { id: "chai", qty: 2 }] }], logResult: { before: 40, after: 62, meal: { division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }, { id: "chai", qty: 2 }] }, mealCount: 3 } }],
  ["log:result:flat",  MealLogged,       { mealsLogged: [{ division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }, { id: "chai", qty: 2 }] }], logResult: { before: 21, after: 21, meal: { division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }, { id: "chai", qty: 2 }] }, mealCount: 2 } }],
  ["log:toast",        Toast,            { toast: { title: "Meal logged", line: "Breakfast at 8:30 AM", coins: 4 } }],
  ["move:noplan",      MoveDetail,       { moveTab: "today", healthSource: { steps: "manual", sleep: null } }],
  ["move:plan",        MoveDetail,       { moveTab: "today", kcalSource: "coach", movePlan: "assigned", healthSource: { steps: "manual", sleep: null } }],
  ["move:logged:none", MoveDetail,       { moveTab: "today", exLogs: [], healthSource: { steps: "manual", sleep: null } }],
  ["move:logged:two",  MoveDetail,       { healthSource: { steps: "manual", sleep: null }, moveTab: "today", exLogs: [{ id: "briskwalk", minutes: 25, intensity: "moderate", timeMins: 450 }, { id: "yoga", minutes: 45, intensity: "light", timeMins: 1140 }] }],
  ["move:learn",       MoveDetail,       { moveTab: "learn", healthSource: { steps: "manual", sleep: null } }],
  ["move:trend",       MoveDetail,       { moveTab: "trend", healthSource: { steps: "manual", sleep: null } }],
  ["move:steps",       MoveDetail,       { moveTab: "today", healthSource: { steps: "phone", sleep: null } }],
  ["move:handsteps",   MoveDetail,       { moveTab: "today", healthSource: { steps: "manual", sleep: null }, manualSteps: 4000 }],
  ["move:syncing",     MoveDetail,       { moveTab: "today", healthSource: { steps: "phone", sleep: null }, healthSync: "steps" }],
  ["move:stepsonly",   MoveDetail,       { moveTab: "today", healthSource: { steps: "phone", sleep: null }, exLogs: [] }],
  ["mind:syncing",     MindDetail,       { mindDetail: true, healthSource: { steps: null, sleep: "phone" }, healthSync: "sleep" }],
  ["move:addsteps",    AddStepsSheet,    { stepsSheet: true }],
  ["move:free",        MoveDetail,       { plan: "free", moveTab: "today", healthSource: { steps: "manual", sleep: null } }],
  ["move:goalmet",     MoveDetail,       { healthSource: { steps: "manual", sleep: null }, moveTab: "today", exLogs: [{ id: "briskwalk", minutes: 25, intensity: "moderate", timeMins: 450 }] }],
  ["move:logexercise", LogExercise,      {}],
  ["move:logex:after", LogExercise,      { exLogs: [{ id: "walk", minutes: 20, intensity: "moderate", timeMins: 600 }] }],
  ["move:fromtodo",    App,              { authStep: null, moveDetail: true, programIntro: null }],
  ["card:0meals",      SufficiencyCard,  { suffDone: true }],
  ["card:1meal",       SufficiencyCard,  { suffDone: true, mealsLogged: [{ division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }] }] }],
  ["card:2meals",      SufficiencyCard,  { suffDone: true, mealsLogged: [{ division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }] }, { division: "lunch", timeMins: 810, items: [{ id: "dal", qty: 1 }] }] }],
  ["card:snackonly",   SufficiencyCard,  { suffDone: true, mealsLogged: [{ division: "eveningsnack", timeMins: 1050, items: [{ id: "chana", qty: 1 }] }] }],
  ["card:3meals",      SufficiencyCard,  { suffDone: true, mealsLogged: [{ division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }] }, { division: "lunch", timeMins: 810, items: [{ id: "dal", qty: 1 }] }, { division: "dinner", timeMins: 1230, items: [{ id: "paneer", qty: 1 }] }] }],
  ["card:coachset",    SufficiencyCard,  { kcalSource: "coach", mealsLogged: [{ division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }] }] }],
  ["logged:notargets", MealLogged,       { suffDone: false, kcalSource: "pending", mealsLogged: [{ division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }] }], logResult: { before: 0, after: 12, meal: { division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }] }, mealCount: 1 } }],
  ["logged:blurred",   MealLogged,       { suffDone: true, mealsLogged: [{ division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }] }], logResult: { before: 0, after: 12, meal: { division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }] }, mealCount: 1 } }],
  ["logged:revealed",  MealLogged,       { suffDone: true, mealsLogged: [{ division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }] }, { division: "lunch", timeMins: 810, items: [{ id: "dal", qty: 1 }] }, { division: "dinner", timeMins: 1230, items: [{ id: "paneer", qty: 1 }] }], logResult: { before: 40, after: 63, meal: { division: "dinner", timeMins: 1230, items: [{ id: "paneer", qty: 1 }] }, mealCount: 3 } }],
  ["eat:notargets",    App,              { authStep: null, eatDetail: true, suffDone: false, kcalSource: "pending", programIntro: null }],
  ["eat:targets:0",    App,              { authStep: null, eatDetail: true, suffDone: true, programIntro: null }],
  ["eat:targets:3",    App,              { authStep: null, eatDetail: true, suffDone: true, programIntro: null, mealsLogged: [{ division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }] }, { division: "lunch", timeMins: 810, items: [{ id: "dal", qty: 1 }] }, { division: "dinner", timeMins: 1230, items: [{ id: "paneer", qty: 1 }] }] }],
  ["eat:withlogs",     App,              { authStep: null, eatDetail: true, eatState: "ft", programIntro: null, mealsLogged: [{ division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }, { id: "chai", qty: 2 }] }] }],
  ["eat:noplan:divs",  App,              { authStep: null, eatDetail: true, kcalSource: "pending" }],
  ["eat:nojudge",      App,              { authStep: null, eatDetail: true, plan: "paid", kcalSource: "pending", suffDone: false }],
  ["eat:free:setup",   App,              { authStep: null, eatDetail: true, plan: "free", suffDone: false }],
  ["eat:afterwalk",    App,              { authStep: null, eatDetail: true, plan: "paid", kcalSource: "pending", suffDone: true }],
  ["suff:first",       App,              { authStep: null, eatDetail: true, plan: "paid", kcalSource: "coach", suffDone: true, mealsLogged: [] }],
  ["suff:one",         App,              { authStep: null, eatDetail: true, plan: "paid", kcalSource: "coach", suffDone: true, mealsLogged: [{ division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }] }] }],
  ["suff:two",         App,              { authStep: null, eatDetail: true, plan: "paid", kcalSource: "coach", suffDone: true, mealsLogged: [{ division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }] }, { division: "lunch", timeMins: 810, items: [{ id: "dal", qty: 1 }] }] }],
  ["suff:three",       App,              { authStep: null, eatDetail: true, plan: "paid", kcalSource: "coach", suffDone: true, mealsLogged: [{ division: "breakfast", timeMins: 510, items: [{ id: "poha", qty: 1 }] }, { division: "lunch", timeMins: 810, items: [{ id: "dal", qty: 1 }] }, { division: "dinner", timeMins: 1230, items: [{ id: "paneer", qty: 1 }] }] }],
  ["eat:plan:divs",    App,              { authStep: null, eatDetail: true, kcalSource: "coach" }],
];

for (const [name, C, initial] of MATRIX) {
  try {
    renderToString(<WFProvider initial={initial}><C /></WFProvider>);
    console.log(`ok   ${name}`);
  } catch (e) {
    fails++;
    console.log(`FAIL ${name.padEnd(22)} ${e.message}`);
  }
}

console.log(fails ? `\n${fails} screen(s) failed` : "\nall screens render");
process.exit(fails ? 1 : 0);
