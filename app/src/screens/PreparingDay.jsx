import React, { useEffect, useState } from "react";
import { useWF } from "../state";
import { Check } from "lucide-react";
import { GREEN, GREEN_DEEP, TEXT, MUTED, BG, PILLAR } from "../tokens";

/* The beat between finishing the EM3 explainer and landing on To-do. Building
   a day out of the pillars is the app's whole premise, so it gets shown
   happening rather than appearing already done. Each pillar ticks in turn.
   No count is named: how many tasks a day has depends on whether the coach
   plan is in yet. */
export default function PreparingDay() {
  const { pillarExplain } = useWF();
  const [done, setDone] = useState(0);

  useEffect(() => {
    const timers = pillarExplain.map((_, i) =>
      setTimeout(() => setDone(i + 1), 320 + i * 340)
    );
    return () => timers.forEach(clearTimeout);
  }, [pillarExplain]);

  return (
    <div
      style={{
        flex: 1,
        background: BG,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 34px",
        minHeight: 0,
      }}
    >
      <div style={{ position: "relative", width: 78, height: 78 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "3px solid #F2F4F7",
            borderTopColor: GREEN,
            animation: "onbspin .9s linear infinite",
          }}
        />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span
            style={{
              width: 32,
              height: 35,
              background: "linear-gradient(150deg, " + GREEN + " 0%, " + GREEN_DEEP + " 100%)",
              clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            K
          </span>
        </div>
      </div>

      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 21,
          fontWeight: 600,
          color: TEXT,
          marginTop: 20,
          textAlign: "center",
        }}
      >
        Setting up your day
      </div>
      <div style={{ fontSize: 12.5, color: MUTED, marginTop: 7, textAlign: "center", lineHeight: 1.5 }}>
        Putting your tasks together.
      </div>

      {/* The pillars, arriving one at a time */}
      <div style={{ width: "100%", maxWidth: 240, marginTop: 24 }}>
        {pillarExplain.map((p, i) => {
          const on = i < done;
          return (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "7px 0",
                opacity: on ? 1 : 0.32,
                transition: "opacity .35s ease",
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: PILLAR[p.id].t,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <p.Icon size={13} color={PILLAR[p.id].c} strokeWidth={2} />
              </span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: TEXT }}>{p.label}</span>
              {on && (
                <Check
                  size={15}
                  color={GREEN}
                  strokeWidth={3}
                  style={{ animation: "popIn .32s cubic-bezier(.32,.72,0,1) both" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
