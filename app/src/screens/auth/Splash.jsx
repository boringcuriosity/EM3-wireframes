import React, { useEffect } from "react";
import { useWF } from "../../state";
import { GREEN_WASH, BG } from "../../tokens";
import PillarFlower from "../../components/PillarFlower";

/* Splash. The flower is the whole screen: it already carries the four names,
   their icons and the word the shape exists to say. Anything printed above it
   would only repeat one of those. Tapping anywhere skips the wait. */
export default function Splash() {
  const { setAuthStep } = useWF();

  useEffect(() => {
    const t = setTimeout(() => setAuthStep("phone"), 2600);
    return () => clearTimeout(t);
  }, [setAuthStep]);

  return (
    <div
      onClick={() => setAuthStep("phone")}
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(175deg, " + GREEN_WASH + " 0%, " + BG + " 62%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        minHeight: 0,
      }}
    >
      {/* A slow brand glow behind it, so the screen has a centre of gravity
          before the petals have drawn. */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          width: 460,
          height: 460,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(41,157,107,0.11) 0%, rgba(41,157,107,0) 68%)",
          animation: "glowBreathe 5s ease-in-out infinite",
        }}
      />

      <div style={{ position: "relative" }}>
        <PillarFlower size={318} animate />
      </div>
    </div>
  );
}
