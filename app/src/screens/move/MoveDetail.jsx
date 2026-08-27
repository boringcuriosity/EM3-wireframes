import React from "react";
import { useWF } from "../../state";
import { Flame, Footprints } from "lucide-react";
import PillarScreen from "../../components/PillarScreen";
import HealthGate from "../../components/HealthGate";
import LogPrompt from "../../components/LogPrompt";
import MoveHero from "./MoveHero";
import MoveTrend from "./MoveTrend";
import MoveIntroCard from "./MoveIntroCard";
import RoutineList from "./RoutineList";
import LoggedList from "./LoggedList";
import VideoList from "./VideoList";
import { TEXT } from "../../tokens";

/* Move, on the same shell as Eat. Today is the hero, the way in, the coach's
   routine and what has been logged. Trend and Learn sit behind the pillar's
   own nav, exactly as they do on Eat. */
export default function MoveDetail() {
  const { setMoveDetail, moveTab, setMoveTab, setLogExOpen, planAssigned, healthSource, setStepsSheet } =
    useWF();

  /* Asked before anything else, once. Move cannot show a step count without
     knowing where steps come from, so this is a gate rather than a card. */
  if (healthSource.steps === null) return <HealthGate signal="steps" />;

  return (
    <PillarScreen
      id="move"
      Icon={Flame}
      tab={moveTab}
      setTab={setMoveTab}
      onBack={() => setMoveDetail(false)}
    >
      {moveTab === "today" && (
        <>
          {/* Two states, decided by one fact, exactly as Eat is. */}
          <div style={{ padding: "12px 22px 0" }}>
            {planAssigned ? <MoveHero /> : <MoveIntroCard />}
          </div>

          {/* Steps are a second way in only when nobody else is counting
              them. Connected, they are not something you do. */}
          <LogPrompt
            line="Anything you did today counts. A walk, the stairs, a full workout."
            actions={[
              { label: "Log exercise", Icon: Flame, onClick: () => setLogExOpen(true) },
              ...(healthSource.steps === "manual"
                ? [{ label: "Add steps", Icon: Footprints, onClick: () => setStepsSheet(true) }]
                : []),
            ]}
          />

          <div style={{ padding: "16px 22px 26px" }}>
            {planAssigned && <RoutineList />}

            <div style={{ marginTop: planAssigned ? 22 : 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 10 }}>
                Logged today
              </div>
              <LoggedList />
            </div>
          </div>
        </>
      )}

      {moveTab === "trend" && (
        <div style={{ padding: "16px 22px 26px" }}>
          <MoveTrend />
        </div>
      )}

      {moveTab === "learn" && (
        <div style={{ padding: "16px 22px 26px" }}>
          <VideoList />
        </div>
      )}
    </PillarScreen>
  );
}

/* Move's week. Same shape as Eat's, so the two read as one app: Kaira first,
   then the seven days, then what it adds up to. */
