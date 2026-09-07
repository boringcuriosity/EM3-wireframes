import React, { useState } from "react";
import { useWF } from "../../state";
import { Check } from "lucide-react";
import { TEXT, MUTED, GREEN, GREEN_WASH, BG, BORDER, SH_SM } from "../../tokens";
import PillarFlower from "../../components/PillarFlower";
import { AuthScreen, AuthHeader, PrimaryCta, inputStyle } from "./parts";
import CtaArrow from "../../components/CtaArrow";

/* Top half teaches the four pillars, bottom half asks for the number. The
   split is deliberate: the pitch has to land before we ask for anything. */
export default function PhoneEntry() {
  const { phone, setPhone, setAuthStep } = useWF();
  const [focused, setFocused] = useState(false);
  /* Consent, given rather than assumed.

     The line used to read "by continuing you agree", which takes the tap on
     Continue and counts it as two answers: one about the number and one about
     the terms. A box somebody has to reach for is one act meaning one thing,
     and it is the only version of this that a person could later say they did.

     It gates the button alongside the number, so the button means what it
     says. The button keeps one label either way: a control that renames itself
     to nag is louder than the box it is pointing at, and the box is right
     above it. */
  const [agreed, setAgreed] = useState(false);
  const valid = phone.length === 10 && agreed;

  return (
    <AuthScreen
      header={<AuthHeader step={0} />}
      footer={
        <PrimaryCta disabled={!valid} onClick={() => valid && setAuthStep("otp")}>
          Continue<CtaArrow />
        </PrimaryCta>
      }
    >
      {/* ---- Top half: the pitch ---- */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          // The pitch half gets the brand wash, the ask half stays white, so
          // the split is felt before it is read.
          background: "linear-gradient(180deg, " + GREEN_WASH + " 0%, " + BG + " 100%)",
          borderBottom: "1px solid " + BORDER,
          padding: "18px 22px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: -120,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(41,157,107,0.09) 0%, rgba(41,157,107,0) 70%)",
          }}
        />
        <div style={{ position: "relative", textAlign: "center" }}>
          <h1
            style={{
              margin: 0,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 22,
              fontWeight: 600,
              color: TEXT,
              lineHeight: 1.25,
              letterSpacing: -0.2,
            }}
          >
            Your metabolism, built on
            <br />
            four core pillars.
          </h1>
          <p style={{ margin: "7px 0 0", fontSize: 11.5, color: MUTED, lineHeight: 1.5 }}>
            Get these four right each day and you build habits that last.
          </p>
        </div>

        <div style={{ position: "relative" }}>
          <PillarFlower size={222} />
        </div>
      </div>

      {/* ---- Bottom half: the ask ---- */}
      <div style={{ padding: "22px 22px 0", background: BG }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Enter mobile number</div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 5, lineHeight: 1.5 }}>
          We'll send a one time code to verify it. No spam, ever.
        </div>

        <div style={{ marginTop: 16 }}>
          <div
            style={{
              ...inputStyle(focused),
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 14px",
            }}
          >
            <span
              style={{
                fontSize: 14.5,
                fontWeight: 700,
                color: GREEN,
                borderRight: "1px solid " + BORDER,
                paddingRight: 10,
                lineHeight: "46px",
              }}
            >
              +91
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              inputMode="numeric"
              onKeyDown={(e) => e.key === "Enter" && valid && setAuthStep("otp")}
              autoFocus
              placeholder="00000 00000"
              aria-label="Mobile number"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 15,
                fontFamily: "inherit",
                color: TEXT,
                letterSpacing: 1,
                height: 46,
              }}
            />
          </div>
        </div>

        {/* The whole row is the target, because a 20px box is a small thing to
            ask somebody to hit and the words beside it are what they are
            agreeing to. The two links keep their own taps inside it. */}
        <button
          onClick={() => setAgreed(!agreed)}
          role="checkbox"
          aria-checked={agreed}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            width: "100%",
            margin: "14px 0 20px",
            padding: 0,
            background: "none",
            border: "none",
            textAlign: "left",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 19,
              height: 19,
              flexShrink: 0,
              marginTop: 1,
              borderRadius: 6,
              background: agreed ? GREEN : BG,
              border: "1.5px solid " + (agreed ? GREEN : BORDER),
              /* Lifted off the page so it reads as something to press. A
                 hairline square on white is the same drawing as a disabled
                 field, and this is the one control on the screen a person has
                 to find on their own. Ticked, the shadow takes the brand's own
                 colour, so it looks pressed in rather than merely filled. */
              boxShadow: agreed
                ? "0 2px 5px -1px " + GREEN + "59, inset 0 1px 0 rgba(255,255,255,.25)"
                : SH_SM + ", inset 0 -1px 0 rgba(16,24,40,.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background .18s ease, border-color .18s ease, box-shadow .18s ease",
            }}
          >
            {agreed && <Check size={13} color="#fff" strokeWidth={3.2} />}
          </span>
          <span style={{ fontSize: 11, color: MUTED, lineHeight: 1.6 }}>
            I agree to GoodFlip's{" "}
            <span style={{ color: TEXT, fontWeight: 600, textDecoration: "underline" }}>
              Terms &amp; Conditions
            </span>{" "}
            and{" "}
            <span style={{ color: TEXT, fontWeight: 600, textDecoration: "underline" }}>
              Privacy Policy
            </span>
            , and to GoodFlip contacting me about my care.
          </span>
        </button>
      </div>
    </AuthScreen>
  );
}
