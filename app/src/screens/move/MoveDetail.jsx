import React from "react";
import { useWF } from "../../state";
import { Flame } from "lucide-react";
import PillarScreen from "../../components/PillarScreen";
import HealthGate from "../../components/HealthGate";
import LogPrompt from "../../components/LogPrompt";
import MoveHero from "./MoveHero";
import MoveIntroCard from "./MoveIntroCard";
import RoutineList from "./RoutineList";
import LoggedList from "./LoggedList";
import VideoList from "./VideoList";
import { dayMinutes } from "./exercises";
import { GREEN, TEXT, MUTED, BG, BORDER, SH } from "../../tokens";

/* Move, on the same shell as Eat. Today is the hero, the way in, the coach's
   routine and what has been logged. Trend and Learn sit behind the pillar's
   own nav, exactly as they do on Eat. */
export default function MoveDetail() {
  const { setMoveDetail, moveTab, setMoveTab, exLogs, setLogExOpen, movePlan, healthSource } =
    useWF();
  const mins = dayMinutes(exLogs);

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
            {movePlan === "assigned" ? <MoveHero /> : <MoveIntroCard />}
          </div>

          <LogPrompt
            line="Anything you did today counts. A walk, the stairs, a full workout."
            actions={[{ label: "Log exercise", Icon: Flame, onClick: () => setLogExOpen(true) }]}
          />

          <div style={{ padding: "16px 22px 26px" }}>
            {movePlan === "assigned" && <RoutineList />}

            <div style={{ marginTop: movePlan === "assigned" ? 22 : 0 }}>
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
          <MoveTrend mins={mins} count={exLogs.length} />
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
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function MoveTrend({ mins, count }) {
  const week = [22, 0, 35, 12, 0, mins, 0];
  const logged = week.filter((x) => x > 0).length;
  const total = week.reduce((a, b) => a + b, 0);
  const top = Math.max(40, ...week);

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
          <span
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
          </span>
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
          {logged < 3
            ? "Not enough days yet to call it a pattern."
            : "Your movement comes in bursts rather than most days."}
        </div>
        <div style={{ fontSize: 13, color: TEXT, marginTop: 8, lineHeight: 1.5 }}>
          {logged < 3
            ? "Log a few more days and I can tell you where your week actually goes."
            : "Two good days and three empty ones does less for your blood sugar than five modest ones. Twenty minutes on a quiet day beats an hour you cannot repeat."}
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 66, marginTop: 18 }}>
          {week.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  width: "100%",
                  height: v ? Math.max(8, Math.round((v / top) * 66)) : 66,
                  borderRadius: 6,
                  background: v ? GREEN : "transparent",
                  border: v ? "none" : "1.5px dashed " + BORDER,
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          {DAYS.map((d, i) => (
            <span key={i} style={{ flex: 1, textAlign: "center", fontSize: 11, color: week[i] ? TEXT : MUTED }}>
              {d}
            </span>
          ))}
        </div>

        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid " + BORDER,
            fontSize: 12,
            color: MUTED,
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: TEXT }}>{total} minutes across {logged} days.</strong>{" "}
          {count ? "Today is in." : "Nothing logged today yet."}
        </div>
      </div>
    </div>
  );
}
