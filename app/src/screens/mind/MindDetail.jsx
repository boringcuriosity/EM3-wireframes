import React from "react";
import { useWF } from "../../state";
import { Moon, Wind } from "lucide-react";
import PillarScreen from "../../components/PillarScreen";
import HealthGate from "../../components/HealthGate";
import LogPrompt from "../../components/LogPrompt";
import LotusIcon from "../../components/LotusIcon";
import MindHero from "./MindHero";
import ToolList from "./ToolList";
import { SLEEP_GOAL_MIN, fmtDur, MIND_TOOLS } from "./tools";
import { GREEN, TEXT, MUTED, BG, BORDER, SH } from "../../tokens";

/* Mind, on the same shell as Eat and Move.

   Its subject is the quiet half of metabolism: the night, and what the day did
   to you. So the hero is sleep, the record is the things you can actually do
   about it, and the way in offers both. */
export default function MindDetail() {
  const { setMindDetail, mindTab, setMindTab, setLogSleepOpen, setMindTool, sleepMins, mindDone, healthSource } =
    useWF();

  // Same gate as Move, for the same reason: no source, nothing to show.
  if (healthSource.sleep === null) return <HealthGate signal="sleep" />;

  return (
    <PillarScreen
      id="mind"
      Icon={LotusIcon}
      tab={mindTab}
      setTab={setMindTab}
      onBack={() => setMindDetail(false)}
    >
      {mindTab === "today" && (
        <>
          <div style={{ padding: "12px 22px 0" }}>
            <MindHero />
          </div>

          <LogPrompt
            line="Two things help most here: a night written down, and a few minutes of calm."
            actions={[
              { label: "Log sleep", Icon: Moon, onClick: () => setLogSleepOpen(true) },
              { label: "Breathe", Icon: Wind, onClick: () => setMindTool("breathing") },
            ]}
          />

          <div style={{ padding: "18px 22px 26px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 10 }}>
              Ways to settle today
            </div>
            <ToolList />
          </div>
        </>
      )}

      {mindTab === "trend" && (
        <div style={{ padding: "16px 22px 26px" }}>
          <MindTrend sleepMins={sleepMins} calm={mindDone.length} />
        </div>
      )}

      {mindTab === "learn" && (
        <div style={{ padding: "16px 22px 26px" }}>
          <MindLearn />
        </div>
      )}
    </PillarScreen>
  );
}

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function MindTrend({ sleepMins, calm }) {
  const week = [388, 402, 350, 0, 431, sleepMins || 0, 0];
  const nights = week.filter(Boolean).length;
  const avg = nights ? Math.round(week.filter(Boolean).reduce((a, b) => a + b, 0) / nights) : 0;
  const top = Math.max(SLEEP_GOAL_MIN, ...week);

  return (
    <div
      style={{ background: BG, border: "1px solid " + BORDER, borderRadius: 18, padding: 18, boxShadow: SH }}
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
        {nights < 3 ? "Not enough nights yet to read." : "Your nights are long enough, but they move around."}
      </div>
      <div style={{ fontSize: 13, color: TEXT, marginTop: 8, lineHeight: 1.5 }}>
        {nights < 3
          ? "Log a few more and I can tell you whether it is the length or the timing that needs work."
          : "Your body clock takes its cue from repetition, so a bedtime that swings by two hours costs you more than an hour less sleep would."}
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
        <strong style={{ color: TEXT }}>
          {nights ? fmtDur(avg) + " a night across " + nights + " nights." : "No nights logged yet."}
        </strong>{" "}
        {calm ? calm + " calm session" + (calm === 1 ? "" : "s") + " this week." : "No calm sessions yet."}
      </div>
    </div>
  );
}

function MindLearn() {
  return (
    <>
      {MIND_TOOLS.map((t) => (
        <div
          key={t.id}
          style={{
            background: BG,
            border: "1px solid " + BORDER,
            borderRadius: 16,
            padding: 15,
            marginBottom: 10,
            boxShadow: SH,
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>{t.label}</div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 4, lineHeight: 1.55 }}>{t.line}</div>
          {t.minutes > 0 && (
            <div style={{ fontSize: 11, color: MUTED, marginTop: 8 }}>About {t.minutes} minutes</div>
          )}
        </div>
      ))}
    </>
  );
}
