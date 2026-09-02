import React, { useEffect } from "react";
import { useWF } from "../../state";
import { TEXT, MUTED, BG } from "../../tokens";
import { KairaMark } from "../sufficiency/parts";
import Intro from "./Intro";
import Focus from "./Focus";
import ScoreProfile from "./ScoreProfile";
import Review from "./Review";
import Result from "./Result";

/* Router for the metabolic score walkthrough:
     intro -> focus -> profile -> review -> working -> result

   Every step is a value in state, so the control panel can open any one of
   them cold rather than making you walk the whole thing. Same shape as
   SufficiencyFlow, because it is the same kind of thing: a few questions that
   turn into a number, with the number explained at the end. */
export default function ScoreFlow() {
  const { scoreFlow } = useWF();

  return (
    scoreFlow === "intro" ? <Intro /> :
    scoreFlow === "focus" ? <Focus /> :
    scoreFlow === "profile" ? <ScoreProfile /> :
    scoreFlow === "review" ? <Review /> :
    scoreFlow === "working" ? <Working /> :
    scoreFlow === "result" ? <Result /> :
    null
  );
}

/* The pause where the score is worked out. Short, but not instant: a number
   that arrives the moment you tap reads as one that was already decided. */
function Working() {
  const { setScoreFlow } = useWF();

  useEffect(() => {
    const t = setTimeout(() => setScoreFlow("result"), 1700);
    return () => clearTimeout(t);
  }, [setScoreFlow]);

  return (
    <div
      style={{
        flex: 1,
        background: BG,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <span style={{ animation: "popIn .5s cubic-bezier(.32,.72,0,1) both" }}>
        <KairaMark size={44} />
      </span>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Working out your score</div>
        <div style={{ fontSize: 12.5, color: MUTED, marginTop: 5 }}>
          Reading what you told me
        </div>
      </div>
    </div>
  );
}
