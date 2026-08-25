import React, { useState } from "react";
import { useWF } from "../../state";
import { TEXT, MUTED, GREEN, GREEN_WASH, BG, BORDER } from "../../tokens";
import PillarFlower from "../../components/PillarFlower";
import { AuthScreen, AuthHeader, PrimaryCta, inputStyle } from "./parts";
import CtaArrow from "../../components/CtaArrow";

/* Top half teaches the four pillars, bottom half asks for the number. The
   split is deliberate: the pitch has to land before we ask for anything. */
export default function PhoneEntry() {
  const { phone, setPhone, setAuthStep } = useWF();
  const [focused, setFocused] = useState(false);
  const valid = phone.length === 10;

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

        <p style={{ fontSize: 10.5, color: MUTED, lineHeight: 1.6, margin: "12px 0 20px" }}>
          By continuing you agree to GoodFlip's{" "}
          <span style={{ color: TEXT, fontWeight: 600, textDecoration: "underline" }}>
            Terms &amp; Conditions
          </span>{" "}
          and{" "}
          <span style={{ color: TEXT, fontWeight: 600, textDecoration: "underline" }}>
            Privacy Policy
          </span>
          .
        </p>
      </div>
    </AuthScreen>
  );
}
