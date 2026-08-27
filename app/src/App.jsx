import React from "react";
import { useWF } from "./state";
import FreeHome from "./screens/FreeHome";
import PaidHome from "./screens/PaidHome";
import TrackPage, { TodayFtux } from "./screens/Today";
import CarePage from "./screens/Care";
import MorePage from "./screens/More";
import EatDetailPage from "./screens/EatDetail";
import OnboardingPage from "./screens/Onboarding";
import ChatsPage from "./screens/Chats";
import ProgramDetailPage from "./screens/ProgramDetail";
import ProgressPage from "./screens/measure/ProgressPage";
import MsPage from "./screens/measure/MsPage";
import A1Page from "./screens/measure/A1Page";
import Msa2Page from "./screens/measure/Msa2Page";
import ControlPanel from "./components/ControlPanel";
import ProgramWelcomeSheet from "./components/ProgramWelcomeSheet";
import StreakGuide from "./screens/StreakGuide";
import SufficiencyFlow from "./screens/sufficiency/SufficiencyFlow";
import LogMeal from "./screens/log/LogMeal";
import MealLogged from "./screens/log/MealLogged";
import Toast from "./components/Toast";
import PreparingDay from "./screens/PreparingDay";
import SpotlightTour from "./components/SpotlightTour";
import PillarScienceSheet from "./components/PillarScienceSheet";
import FlipcoinsSheet from "./components/FlipcoinsSheet";
import PlanWaitSheet from "./components/PlanWaitSheet";
import TaskDoneSheet from "./components/TaskDoneSheet";
import DayRowSheet from "./components/DayRowSheet";
import StreakOverlay from "./components/StreakOverlay";
import MealItemSheet from "./components/MealItemSheet";
import MetricInfoSheet from "./components/MetricInfoSheet";
import HealthConnectSheet from "./components/HealthConnectSheet";
import MindDetail from "./screens/mind/MindDetail";
import LogSleep from "./screens/mind/LogSleep";
import ToolSheet from "./screens/mind/ToolSheet";
import AddStepsSheet from "./screens/move/AddStepsSheet";
import StreakRewardsSheet from "./components/StreakRewardsSheet";
import ShareStreakSheet from "./components/ShareStreakSheet";
import MoveDetail from "./screens/move/MoveDetail";
import LogExercise from "./screens/move/LogExercise";
import Splash from "./screens/auth/Splash";
import PhoneEntry from "./screens/auth/PhoneEntry";
import OtpEntry from "./screens/auth/OtpEntry";
import NameEntry from "./screens/auth/NameEntry";

// Pre-app signup. While authStep is set nothing else in the frame renders.
const AUTH = { splash: Splash, phone: PhoneEntry, otp: OtpEntry, name: NameEntry };
import { GREEN, TEXT, MUTED, BG_ALT, BG, BORDER, TABS } from "./tokens";
import KairaFab from "./components/KairaFab";

// Full-screen takeovers hide the bottom nav. Order matters: the first
// truthy one wins, exactly as in the original wireframe.
function Takeover() {
  const { logExOpen, logSleepOpen, mindDetail, moveDetail, logResult, logOpen, suffFlow, streakOpen, onboardingOpen, chatsOpen, programDetail, eatDetail } = useWF();
  if (logSleepOpen) return <LogSleep />;
  if (logExOpen) return <LogExercise />;
  if (mindDetail) return <MindDetail />;
  if (moveDetail) return <MoveDetail />;
  if (logResult) return <MealLogged />;
  if (logOpen) return <LogMeal />;
  if (suffFlow) return <SufficiencyFlow />;
  if (streakOpen === "guide") return <StreakGuide />;
  if (onboardingOpen) return <OnboardingPage />;
  if (chatsOpen) return <ChatsPage />;
  if (programDetail) return <ProgramDetailPage />;
  if (eatDetail)
    return (
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <EatDetailPage />
      </div>
    );
  return null;
}

function Measure() {
  const { measureApproach } = useWF();
  if (measureApproach === "ms") return <MsPage />;
  if (measureApproach === "a1") return <A1Page />;
  if (measureApproach === "msa2") return <Msa2Page />;
  return <ProgressPage />;
}

function BottomNav() {
  const { activeTab, setActiveTab } = useWF();
  return (
    <div
      style={{
        flexShrink: 0,
        position: "relative",
        zIndex: 21,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "8px 6px 22px",
        background: BG,
        borderTop: "1px solid " + BORDER,
      }}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
            }}
          >
            <Icon size={22} color={active ? GREEN : MUTED} strokeWidth={active ? 2.4 : 1.8} />
            <span
              style={{
                fontSize: 10.5,
                fontWeight: active ? 600 : 500,
                color: active ? GREEN : MUTED,
                letterSpacing: 0.1,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function App() {
  const wf = useWF();
  const { activeTab, isPaid, todayOnboarded } = wf;
  const Auth = AUTH[wf.authStep];
  const takeover =
    wf.logSleepOpen ||
    wf.mindDetail ||
    wf.logExOpen ||
    wf.moveDetail ||
    wf.logResult ||
    wf.logOpen ||
    wf.suffFlow ||
    wf.streakOpen ||
    wf.onboardingOpen ||
    wf.chatsOpen ||
    wf.programDetail ||
    wf.eatDetail;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 24,
        background: "#F2F4F7",
        fontFamily: "Roboto, system-ui, sans-serif",
        padding: 24,
      }}
    >
      {/* Mobile frame */}
      <div
        style={{
          width: 390,
          height: 844,
          background: BG,
          borderRadius: 44,
          boxShadow: "0 24px 60px rgba(16,24,40,0.18)",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          border: "1px solid " + BORDER,
        }}
      >
        {/* Status bar */}
        <div
          style={{
            height: 44,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 26px",
            fontSize: 14,
            fontWeight: 600,
            color: TEXT,
          }}
        >
          <span>9:41</span>
          <span style={{ letterSpacing: 2 }}>•••</span>
        </div>

        {wf.preparing ? (
          <PreparingDay />
        ) : Auth ? (
          <Auth />
        ) : takeover ? (
          <>
            <Takeover />
            {/* The pillar screens carry their own bottom nav, so Kaira stays
                reachable there too. The rest of the takeovers are single
                tasks with nothing to ask her about. */}
            {(wf.eatDetail || wf.moveDetail || wf.mindDetail) && !wf.logOpen && !wf.logExOpen && !wf.logSleepOpen && !wf.logResult && (
              <KairaFab bottom={86} />
            )}
            <Toast />
            {wf.pillarInfo && <PillarScienceSheet />}
            {wf.coinsInfo && <FlipcoinsSheet />}
            {wf.planInfo && <PlanWaitSheet />}
            {wf.streakInfo && <StreakRewardsSheet />}
            {wf.shareOpen && <ShareStreakSheet />}
            {wf.taskDone && <TaskDoneSheet />}
            {wf.rowMenu && <DayRowSheet />}
            {wf.streakBurst && <StreakOverlay />}
            {wf.mealItem && <MealItemSheet />}
            {wf.metricInfo && <MetricInfoSheet />}
            {wf.healthSheet && <HealthConnectSheet />}
            {wf.mindTool && <ToolSheet />}
            {wf.stepsSheet && <AddStepsSheet />}
          </>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", background: BG_ALT }}>
              {activeTab === "track" && (todayOnboarded ? <TrackPage /> : <TodayFtux />)}
              {activeTab === "med" && <Measure />}
              {activeTab === "care" && <CarePage />}
              {activeTab === "more" && <MorePage />}
              {activeTab === "home" && (isPaid ? <PaidHome /> : <FreeHome />)}
            </div>

            <KairaFab />

            <BottomNav />

            {/* Program welcome, over the whole frame including the nav */}
            {wf.programIntro === "sheet" && activeTab === "home" && isPaid && (
              <ProgramWelcomeSheet />
            )}
            <SpotlightTour />
            {wf.pillarInfo && <PillarScienceSheet />}
            {wf.coinsInfo && <FlipcoinsSheet />}
            {wf.planInfo && <PlanWaitSheet />}
            {wf.streakInfo && <StreakRewardsSheet />}
            {wf.shareOpen && <ShareStreakSheet />}
            {wf.taskDone && <TaskDoneSheet />}
            {wf.rowMenu && <DayRowSheet />}
            {wf.streakBurst && <StreakOverlay />}
            {wf.mealItem && <MealItemSheet />}
            {wf.metricInfo && <MetricInfoSheet />}
            {wf.healthSheet && <HealthConnectSheet />}
            {wf.mindTool && <ToolSheet />}
            {wf.stepsSheet && <AddStepsSheet />}
            <Toast />
          </>
        )}
      </div>

      <ControlPanel />
    </div>
  );
}
