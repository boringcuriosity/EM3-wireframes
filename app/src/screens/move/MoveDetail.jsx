import React, { useEffect } from "react";
import { useWF } from "../../state";
import { Flame, Footprints } from "lucide-react";
import PillarScreen from "../../components/PillarScreen";
import LogPrompt from "../../components/LogPrompt";
import MoveHero from "./MoveHero";
import MoveTrend from "./MoveTrend";
import MoveIntroCard from "./MoveIntroCard";
import RoutineList from "./RoutineList";
import SmallMoves from "../../components/SmallMoves";
import LoggedList from "./LoggedList";
import VideoList from "./VideoList";
import { TEXT, MUTED } from "../../tokens";

/* The label over each half of the plan. Small, spaced and upper case, which is
   how every other section heading in the app says "this is a group" without
   competing with the names inside it. */
function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: MUTED,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

/* Move, on the same shell as Eat. Today is the hero, the way in, the coach's
   routine and what has been logged. Trend and Learn sit behind the pillar's
   own nav, exactly as they do on Eat. */
export default function MoveDetail() {
  const {
    setMoveDetail, moveTab, setMoveTab, openMoveLog, planAssigned,
    healthSource, setStepsSheet, setHealthSheet, momentumParts,
  } = useWF();

  /* Asked once, on the way in, and asked in the sheet rather than on a screen
     of its own. A full page standing between somebody and their pillar reads
     as a wall; the same question over the screen they came for reads as a
     question. Closing it leaves the line at the foot of the card, which is
     the way back to it. */
  useEffect(() => {
    if (healthSource.steps === null) setHealthSheet("steps");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              { label: "Log workout", Icon: Flame, onClick: () => openMoveLog() },
              ...(healthSource.steps === "manual"
                ? [{ label: "Add steps", Icon: Footprints, onClick: () => setStepsSheet(true) }]
                : []),
            ]}
          />

          <div style={{ padding: "16px 22px 26px" }}>
            {/* One plan, two blocks.

                The workout and the small movements come from the same physio
                and are read by the same score, so they sit under one heading
                rather than in two places. Before this the small movements were
                only tickable from To-do, which put half of a Move plan on a
                different screen from the other half: somebody opening Move to
                do their plan could work through the routine and had no way at
                all to say they had taken the stairs.

                Each block keeps its own subhead, so the physio's programme
                still reads as a programme and the small asks still read as the
                loose change between the sessions. */}
            {planAssigned && (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Your plan today</span>
                  <span style={{ marginLeft: "auto", fontSize: 11.5, fontWeight: 700, color: MUTED, fontVariantNumeric: "tabular-nums" }}>
                    {momentumParts.routineTicked + momentumParts.neatDone} of{" "}
                    {momentumParts.routineTotal + momentumParts.neat.length}
                  </span>
                </div>

                <SectionLabel>Workout</SectionLabel>
                <RoutineList />

                <div style={{ marginTop: 20 }}>
                  <SectionLabel>Small moves</SectionLabel>
                  <SmallMoves />
                </div>
              </>
            )}

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
