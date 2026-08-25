import React, { useState } from "react";
import { useWF } from "../../state";
import { GREEN, GREEN_DEEP, TEXT, MUTED } from "../../tokens";
import { AuthScreen, AuthHeader, Title, PrimaryCta, inputStyle, Sprig } from "./parts";
import CtaArrow from "../../components/CtaArrow";

/* Kaira introduces herself and asks for a name. This is the first time the
   hexagon speaks, so it gets the full mark rather than the small chat avatar. */
export default function NameEntry() {
  const { userName, setUserName, setAuthStep, setActiveTab, isPaid, armProgramIntro } = useWF();
  const [focused, setFocused] = useState(false);
  const valid = userName.trim().length > 0;

  const finish = () => {
    setActiveTab("home");
    setAuthStep(null);
    // A brand new program user meets their program on the first Home they see.
    if (isPaid) armProgramIntro();
  };

  return (
    <AuthScreen
      header={<AuthHeader step={2} onBack={() => setAuthStep("otp")} />}
      footer={
        <PrimaryCta disabled={!valid} onClick={() => valid && finish()}>
          Continue<CtaArrow />
        </PrimaryCta>
      }
    >
      <div style={{ padding: "14px 22px 0", position: "relative", overflow: "hidden" }}>
        <Sprig />

        {/* Kaira introduces herself, in her own voice. A name card would tell
            you who she is. Her saying it is how you meet someone. */}
        <div style={{ display: "flex", alignItems: "center", gap: 13, position: "relative", zIndex: 1 }}>
          <span style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
            <span
              aria-hidden
              style={{
                position: "absolute",
                inset: -5,
                background: GREEN,
                clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                animation: "kairaPulse 2.6s ease-in-out infinite",
              }}
            />
            <span
              style={{
                position: "relative",
                width: 50,
                height: 55,
                background: "linear-gradient(150deg, " + GREEN + " 0%, " + GREEN_DEEP + " 100%)",
                clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 22,
                fontWeight: 600,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              K
            </span>
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Hey, I'm Kaira.</div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 2, lineHeight: 1.45 }}>
              Your AI health companion. I'll guide you through your health journey.
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <Title sub="So I can keep things personal as we go.">What should I call you?</Title>
        </div>

        <div style={{ marginTop: 20, position: "relative", zIndex: 1 }}>
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === "Enter" && valid && finish()}
            autoFocus
            placeholder="Enter your name"
            aria-label="Your name"
            style={inputStyle(focused)}
          />
        </div>

      </div>
    </AuthScreen>
  );
}
