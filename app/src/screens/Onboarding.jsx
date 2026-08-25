import React from "react";
import { useWF } from "../state";
import { ChevronLeft } from "lucide-react";
import Em3Explainer from "../components/Em3Explainer";
import CtaArrow from "../components/CtaArrow";
import { GREEN, GREEN_DEEP, TEXT, BG, BORDER } from "../tokens";

/* The onboarding takeover. It is the EM3 explainer with a way back and a way
   on. Nothing is asked for here: the metabolic score questionnaire already
   collects age, sex, height and weight, and asking twice would be the app
   forgetting its own conversation. */
export default function OnboardingPage() {
  const { onbFinish, onbBack } = useWF();

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
      <div style={{ padding: "8px 22px 0", flexShrink: 0 }}>
        <button
          onClick={onbBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "none",
            background: "transparent",
            padding: "4px 0",
            fontSize: 15,
            fontWeight: 600,
            color: TEXT,
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={20} color={TEXT} /> Back
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 22px 0", minHeight: 0 }}>
        <Em3Explainer />
      </div>

      <div style={{ flexShrink: 0, padding: "12px 22px", borderTop: "1px solid " + BORDER, background: BG }}>
        <button
          onClick={onbFinish}
          style={{
            width: "100%",
            background: GREEN,
            border: "none",
            borderRadius: 14,
            padding: "15px 0",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 2px 0 " + GREEN_DEEP,
          }}
        >
          Take me to my day
          <CtaArrow size={16} />
        </button>
      </div>
    </div>
  );
}
