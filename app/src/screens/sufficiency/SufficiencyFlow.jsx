import React, { useEffect } from "react";
import { useWF } from "../../state";
import { TEXT, MUTED, BG, BG_ALT, BORDER } from "../../tokens";
import { KairaMark } from "./parts";
import Learn from "./Learn";
import Profile from "./Profile";
import Meals from "./Meals";
import Result from "./Result";
import LiftSheet from "./LiftSheet";
import CaloriesSheet from "./CaloriesSheet";
import MacroSheet from "./MacroSheet";

/* Router for the sufficiency walkthrough:
     learn -> profile -> meals -> computing -> result
       result -> lift sheet -> computing2 -> lifted
   Every step is a value in state, so the control panel can open any one of them
   cold rather than making you walk the whole thing. */
export default function SufficiencyFlow() {
  const { suffFlow, suffLift, suffSheet } = useWF();

  const screen =
    suffFlow === "learn" ? <Learn /> :
    suffFlow === "profile" ? <Profile /> :
    suffFlow === "meals" ? <Meals /> :
    suffFlow === "computing" ? <Computing next="result" line="Reading your usual day" /> :
    suffFlow === "computing2" ? <Computing next="lifted" line="Adding that to your day" /> :
    suffFlow === "result" ? <Result /> :
    suffFlow === "lifted" ? <Result lifted /> :
    null;

  return (
    <>
      {screen}
      {suffLift && <LiftSheet />}
      {suffSheet === "kcal" && <CaloriesSheet />}
      {suffSheet && suffSheet !== "kcal" && <MacroSheet />}
    </>
  );
}

/* The pause where Kaira does the arithmetic. Short, but not instant: the number
   that follows should feel worked out rather than looked up. */
function Computing({ next, line }) {
  const { setSuffFlow } = useWF();

  useEffect(() => {
    const t = setTimeout(() => setSuffFlow(next), 1700);
    return () => clearTimeout(t);
  }, [next, setSuffFlow]);

  return (
    <div
      style={{
        flex: 1,
        background: BG,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
        minHeight: 0,
      }}
    >
      <div style={{ position: "relative", width: 96, height: 96 }}>
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid " + BORDER,
            borderTopColor: TEXT,
            animation: "onbspin 0.9s linear infinite",
          }}
        />
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <KairaMark size={34} />
        </span>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{line}</div>
        <div style={{ fontSize: 11.5, color: MUTED, marginTop: 5 }}>
          Checking protein, carbs, fats and fibre
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          background: BG_ALT,
          border: "1px solid " + BORDER,
          borderRadius: 999,
          padding: "7px 14px",
        }}
      >
        {["Protein", "Carbs", "Fats", "Fibre"].map((n, i) => (
          <span
            key={n}
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: MUTED,
              animation: `tourpop .5s ${i * 0.18}s ease both`,
            }}
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}
