import React, { useEffect } from "react";
import { useWF } from "../../state";
import { Moon } from "lucide-react";

import PillarScreen from "../../components/PillarScreen";
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
  const { setMindDetail, mindTab, setMindTab, setLogSleepOpen, healthSource, setHealthSheet } =
    useWF();

  // Same ask as Move, in the same sheet, for the same reason.
  useEffect(() => {
    if (healthSource.sleep === null) setHealthSheet("sleep");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

          {/* Only when it has something to offer. Where sleep comes off the
              phone this was a sentence telling somebody to read the list they
              were already looking at, in a bordered box, above the list. */}
          {healthSource.sleep === "manual" && (
            <LogPrompt
              line="Start with last night, then work through the list below."
              actions={[{ label: "Log sleep", Icon: Moon, onClick: () => setLogSleepOpen(true) }]}
            />
          )}

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
