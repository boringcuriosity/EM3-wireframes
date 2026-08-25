import React, { useEffect, useState } from "react";
import { useWF } from "../state";
import StreakFlame from "./StreakFlame";
import { GOLD } from "../tokens";

/* What ticking a task did, shown and then gone. No card, no button: the dim
   comes up, the flame rises to where the day now stands, and it lets itself
   out. Tapping ends it sooner. */

const LIFE = 2900;

export default function TaskDoneSheet() {
  const { taskDone: t, setTaskDone } = useWF();
  const [shownCount, setShownCount] = useState(t ? t.count - 1 : 0);
  const [out, setOut] = useState(false);

  useEffect(() => {
    if (!t) return;
    const a = setTimeout(() => setShownCount(t.count), 620);
    const b = setTimeout(() => setOut(true), LIFE - 320);
    const c = setTimeout(() => setTaskDone(null), LIFE);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
      clearTimeout(c);
    };
  }, [t, setTaskDone]);

  if (!t) return null;

  const left = t.total - t.count;
  const complete = left === 0;

  return (
    <div
      onClick={() => setTaskDone(null)}
      role="status"
      aria-live="polite"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 58,
        background: "rgba(16,24,40,0.72)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 34,
        textAlign: "center",
        opacity: out ? 0 : 1,
        transition: "opacity .32s ease",
        animation: "scrimIn .26s ease both",
      }}
    >
      <div style={{ animation: "popIn .5s cubic-bezier(.32,.72,0,1) both" }}>
        <StreakFlame size={132} fraction={t.after} from={t.before} delay={260} outline={false} />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 7,
          marginTop: 22,
          animation: "riseIn .45s .12s ease both",
        }}
      >
        <span
          key={shownCount}
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 40,
            fontWeight: 600,
            color: "#fff",
            lineHeight: 1,
            animation: "popIn .4s cubic-bezier(.32,.72,0,1) both",
          }}
        >
          {shownCount}
        </span>
        <span style={{ fontSize: 15, color: "rgba(255,255,255,0.72)" }}>of {t.total} done today</span>
      </div>

      {/* One pip per task, filling in as the count catches up */}
      <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
        {Array.from({ length: t.total }).map((_, i) => (
          <span
            key={i}
            style={{
              width: 28,
              height: 5,
              borderRadius: 3,
              background: i < shownCount ? GOLD : "rgba(255,255,255,0.24)",
              transition: "background .35s ease " + i * 0.09 + "s",
            }}
          />
        ))}
      </div>

      <div
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.86)",
          lineHeight: 1.55,
          marginTop: 18,
          maxWidth: 270,
          animation: "riseIn .45s .2s ease both",
        }}
      >
        {complete
          ? "That is today's list done. The streak is yours."
          : "Finish the other " + left + " and today's streak is yours."}
      </div>

      {t.coins > 0 && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.14)",
            borderRadius: 999,
            padding: "6px 14px 6px 11px",
            marginTop: 14,
            fontSize: 12.5,
            fontWeight: 700,
            color: "#fff",
            animation: "riseIn .45s .28s ease both",
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              background: GOLD,
              clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
            }}
          />
          +{t.coins} Flipcoins
        </div>
      )}
    </div>
  );
}
