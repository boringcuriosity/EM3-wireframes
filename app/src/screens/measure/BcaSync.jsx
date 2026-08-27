import React, { useState, useEffect } from "react";
import { useWF } from "../../state";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import {
  GREEN, GREEN_DEEP, GREEN_TINT, GREEN_WASH, TEXT, MUTED, FAINT, BG, BG_ALT,
  LINE, RULE,
} from "../../tokens";

/* The body composition sync, opened from the day's Measure row.

   Unlike glucose, this reading only exists if somebody stood on the scale, so
   the screen leads with the scale itself and one button. The sync is the whole
   interaction: press it, watch it work, and the new reading drops in at the
   top of the run of readings behind it. The task closes the moment the reading
   lands, which is the honest moment. */

const PAST = [
  { n: 3, day: "14 Dec", at: "02:47 PM", kg: "67.70" },
  { n: 2, day: "07 Dec", at: "08:12 AM", kg: "68.20" },
  { n: 1, day: "30 Nov", at: "07:55 AM", kg: "68.90" },
];

export default function BcaSync() {
  const {
    setBcaOpen, taskProgress, setTaskProgress, flipcoins, setFlipcoins, setToast,
  } = useWF();
  const [syncing, setSyncing] = useState(false);
  const [fresh, setFresh] = useState(null);

  const sync = () => {
    if (syncing) return;
    setSyncing(true);
  };

  useEffect(() => {
    if (!syncing) return;
    const t = setTimeout(() => {
      setSyncing(false);
      setFresh({ n: 4, day: "Today", at: "09:41 AM", kg: "67.40" });
      if (!taskProgress.measure) {
        setTaskProgress({ ...taskProgress, measure: 1 });
        setFlipcoins(flipcoins + 10);
        setToast({ title: "+10 Flipcoins earned", line: "Sync your BCA", coins: 10 });
      }
    }, 1800);
    return () => clearTimeout(t);
  }, [syncing, taskProgress, setTaskProgress, flipcoins, setFlipcoins, setToast]);

  const logs = fresh ? [fresh, ...PAST] : PAST;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
      <div style={{ flexShrink: 0, padding: "6px 18px 6px" }}>
        <button
          onClick={() => setBcaOpen(false)}
          aria-label="Back"
          style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: TEXT }}
        >
          <ChevronLeft size={20} strokeWidth={2.2} />
          Back
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <h1
          style={{
            margin: "8px 22px 0",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 25,
            fontWeight: 600,
            color: TEXT,
            letterSpacing: -0.3,
          }}
        >
          GoodFlip Smart Scale
        </h1>

        {/* The device, and the one thing to do with it. */}
        <div
          style={{
            position: "relative",
            marginTop: 18,
            padding: "22px 0 46px",
            background: "linear-gradient(180deg, " + GREEN_WASH + " 0%, " + BG + " 100%)",
          }}
        >
          <Scale live={syncing} />

          <button
            onClick={sync}
            aria-label={syncing ? "Syncing" : "Sync the scale"}
            style={{
              position: "absolute",
              left: "50%",
              bottom: 22,
              transform: "translateX(-50%)",
              width: 62,
              height: 62,
              borderRadius: "50%",
              background: "linear-gradient(160deg, " + GREEN + " 0%, " + GREEN_DEEP + " 100%)",
              border: "3px solid " + BG,
              boxShadow: "0 6px 18px rgba(41,157,107,0.32)",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              cursor: syncing ? "default" : "pointer",
              fontFamily: "inherit",
            }}
          >
            <RefreshCw
              size={17}
              strokeWidth={2.6}
              style={{ animation: syncing ? "spin .9s linear infinite" : undefined }}
            />
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.2 }}>
              {syncing ? "Syncing" : "Sync"}
            </span>
          </button>
        </div>

        {/* The run of readings, newest first. */}
        <div style={{ padding: "4px 22px 26px" }}>
          {logs.map((l, i) => {
            const isNew = fresh && i === 0;
            return (
              <div key={l.n} style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
                <div style={{ width: 52, flexShrink: 0, textAlign: "center", position: "relative" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: TEXT, paddingTop: 12 }}>{l.day}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: FAINT, marginTop: 2 }}>
                    {l.at}
                  </div>
                  {i < logs.length - 1 && (
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: 48,
                        bottom: -6,
                        width: 0,
                        borderLeft: "1.5px dashed " + RULE,
                      }}
                    />
                  )}
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: isNew ? GREEN_WASH : BG_ALT,
                    border: "1px solid " + (isNew ? GREEN_TINT : LINE),
                    borderRadius: 14,
                    padding: "12px 13px",
                    marginBottom: 12,
                    cursor: "pointer",
                    animation: isNew ? "popIn .5s cubic-bezier(.32,.72,0,1) both" : undefined,
                  }}
                >
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Log #{l.n}</span>
                      {isNew && (
                        <span
                          style={{
                            background: GREEN_TINT,
                            color: GREEN,
                            borderRadius: 999,
                            padding: "2px 7px",
                            fontSize: 8.5,
                            fontWeight: 700,
                            letterSpacing: 0.4,
                            textTransform: "uppercase",
                          }}
                        >
                          New
                        </span>
                      )}
                    </span>
                    <span style={{ display: "block", fontSize: 12, color: MUTED, marginTop: 3 }}>
                      Weight: <b style={{ color: TEXT }}>{l.kg} kgs</b>
                    </span>
                  </span>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: GREEN,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <ChevronRight size={14} color="#fff" strokeWidth={2.6} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* The scale, drawn rather than photographed, because a wireframe that ships a
   product shot is promising a photograph nobody has taken yet. */
function Scale({ live }) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          position: "relative",
          width: 176,
          height: 208,
          borderRadius: 22,
          background: "linear-gradient(160deg, #D8DCE0 0%, #C3C9CE 100%)",
          padding: 12,
          boxShadow: "0 16px 34px rgba(16,24,40,0.18)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 14,
            background: "linear-gradient(170deg, #2B3138 0%, #191D22 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* The readout */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: "50%",
              transform: "translateX(-50%)",
              width: 54,
              height: 15,
              borderRadius: 3,
              background: live ? "#4A5A52" : "#3A4048",
              transition: "background .3s ease",
            }}
          />

          {/* Two footprints, and a pulse through them while it reads. */}
          {[0, 1].map((s) => (
            <span
              key={s}
              style={{
                position: "absolute",
                top: 52,
                [s ? "right" : "left"]: 26,
                width: 46,
                height: 108,
                borderRadius: "48% 48% 44% 44% / 34% 34% 66% 66%",
                background: "#F4F6F5",
                opacity: live ? 0.72 : 1,
                animation: live ? "glowBreathe 1.2s ease-in-out infinite" : undefined,
                animationDelay: s ? ".2s" : undefined,
              }}
            />
          ))}
        </div>

        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: -10,
            borderRadius: 30,
            border: "2px solid " + GREEN,
            opacity: live ? 0.5 : 0,
            transition: "opacity .3s ease",
            animation: live ? "haloOut 1.4s ease-out infinite" : undefined,
          }}
        />
      </div>
    </div>
  );
}
