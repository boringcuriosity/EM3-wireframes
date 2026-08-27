import React from "react";
import { useWF } from "../../state";
import { Moon } from "lucide-react";

import PillarScreen from "../../components/PillarScreen";
import HealthGate from "../../components/HealthGate";
import LogPrompt from "../../components/LogPrompt";
import LotusIcon from "../../components/LotusIcon";
import MindHero from "./MindHero";
import MindTrend from "./MindTrend";
import ToolList from "./ToolList";
import ArticleList from "../../components/ArticleList";
import { MIND_ARTICLES } from "./tools";

/* Mind, on the same shell as Eat and Move.

   Its subject is the quiet half of metabolism: the night, and what the day did
   to you. So the hero is sleep, the record is the things you can actually do
   about it, and the way in offers both. */
export default function MindDetail() {
  const { setMindDetail, mindTab, setMindTab, setLogSleepOpen, healthSource } =
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

          {/* No buttons: everything Kaira is asking for is listed directly
              below, and a pair of shortcuts on top of a list is the same list
              twice. */}
          <LogPrompt
            line={
              healthSource.sleep === "manual"
                ? "Start with last night, then work through the list below."
                : "Work through the list below. A few minutes of it is enough to matter."
            }
            actions={
              healthSource.sleep === "manual"
                ? [{ label: "Log sleep", Icon: Moon, onClick: () => setLogSleepOpen(true) }]
                : undefined
            }
          />

          <div style={{ padding: "18px 22px 26px" }}>
            <ToolList />
          </div>
        </>
      )}

      {mindTab === "trend" && (
        <div style={{ padding: "16px 22px 26px" }}>
          <MindTrend />
        </div>
      )}

      {mindTab === "learn" && (
        <div style={{ padding: "8px 22px 20px" }}>
          <ArticleList category="Rest, Rhythm & Stress" items={MIND_ARTICLES} />
        </div>
      )}
    </PillarScreen>
  );
}
