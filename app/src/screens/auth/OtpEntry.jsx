import React, { useEffect, useRef, useState } from "react";
import { useWF } from "../../state";
import { GREEN, TEXT, MUTED, BG, BORDER, INDIGO, INDIGO_RING } from "../../tokens";
import { AuthScreen, AuthHeader, Title, FieldLabel, PrimaryCta, Sprig } from "./parts";
import CtaArrow from "../../components/CtaArrow";

const RESEND_SECONDS = 29;

export default function OtpEntry() {
  const { phone, otp, setOtp, setAuthStep } = useWF();
  const [left, setLeft] = useState(RESEND_SECONDS);
  const [focusIdx, setFocusIdx] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const boxes = useRef([]);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const complete = otp.every((d) => d !== "");

  const put = (i, v) => {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = otp.slice();
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) boxes.current[i + 1]?.focus();

    // The sixth digit is the answer, so nothing more should need pressing.
    // ponytail: fired from the keystroke, not an effect, so coming back to a
    // code that is already filled in does not re-verify on its own.
    if (next.every((d) => d !== "")) {
      setVerifying(true);
      boxes.current[i]?.blur();
      setTimeout(() => setAuthStep("name"), 620);
    }
  };

  // Backspace on an empty box steps back, which is what people expect.
  const onKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      const next = otp.slice();
      next[i - 1] = "";
      setOtp(next);
      boxes.current[i - 1]?.focus();
    }
  };

  return (
    <AuthScreen
      header={<AuthHeader step={1} onBack={() => setAuthStep("phone")} />}
      footer={
        <PrimaryCta
          disabled={!complete || verifying}
          onClick={() => complete && setAuthStep("name")}
        >
          {verifying ? "Verifying" : <>Verify<CtaArrow /></>}
        </PrimaryCta>
      }
    >
      <div style={{ padding: "18px 22px 0", position: "relative", overflow: "hidden" }}>
        <Sprig />
        <Title>Enter OTP</Title>

        <div style={{ position: "relative", zIndex: 1, marginTop: 10 }}>
          <span style={{ fontSize: 12.5, color: MUTED }}>Sent to </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
            +91 {phone || "00000 00000"}
          </span>
          <button
            onClick={() => setAuthStep("phone")}
            style={{
              marginLeft: 8,
              background: "none",
              border: "none",
              padding: 0,
              fontSize: 12.5,
              fontWeight: 700,
              color: GREEN,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
        </div>

        <div style={{ marginTop: 24, position: "relative", zIndex: 1 }}>
          <FieldLabel>Secure code</FieldLabel>
          <div style={{ display: "flex", gap: 8 }}>
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => (boxes.current[i] = el)}
                value={d}
                onChange={(e) => put(i, e.target.value)}
                onKeyDown={(e) => onKey(i, e)}
                onFocus={() => setFocusIdx(i)}
                inputMode="numeric"
                autoFocus={i === 0}
                aria-label={`Digit ${i + 1}`}
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: 52,
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  color: TEXT,
                  background: BG,
                  border: "1px solid " + (focusIdx === i ? INDIGO : d ? TEXT : BORDER),
                  borderRadius: 12,
                  outline: "none",
                  boxShadow: focusIdx === i ? "0 0 0 3px " + INDIGO_RING : "none",
                  transition: "border-color .15s, box-shadow .15s",
                }}
              />
            ))}
          </div>

          <div style={{ marginTop: 16, fontSize: 12, color: MUTED }}>
            Didn't receive it?{" "}
            {left > 0 ? (
              <>
                Resend in{" "}
                <span style={{ fontWeight: 700, color: TEXT }}>
                  00:{String(left).padStart(2, "0")}
                </span>
              </>
            ) : (
              <button
                onClick={() => setLeft(RESEND_SECONDS)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  color: GREEN,
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      </div>
    </AuthScreen>
  );
}
