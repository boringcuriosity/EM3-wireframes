import React, { useLayoutEffect, useRef, useState } from "react";
import { useWF } from "../../state";
import { X, Moon, Sun, HeartPulse } from "lucide-react";
import { fmtTime } from "../log/foods";
import { fmtDur } from "./tools";
import CtaArrow from "../../components/CtaArrow";
import { GREEN, GREEN_DEEP, MIND_C, MIND_T, MIND_W, TEXT, MUTED, BG, BG_ALT, BORDER, LINE } from "../../tokens";

const COINS = 2;

/* Log a night. Bedtime and wake time, duration worked out from them.

   Nobody is asked how many hours they slept, because nobody knows and the
   answer would be a guess. Two times they do know, and the number falls out.
   It also gives us the part that matters for the body clock: when. */
export default function LogSleep() {
  const { setLogSleepOpen, sleepLogs, setSleepLogs, flipcoins, setFlipcoins, setToast, setHealthSheet } = useWF();

  const [bed, setBed] = useState(23 * 60);
  const [wake, setWake] = useState(6 * 60 + 40);
  const dur = (wake - bed + 1440) % 1440;

  // Half hours across the evening and the morning, which is where real
  // bedtimes and wake times actually fall.
  const bedSlots = [];
  for (let t = 20 * 60; t <= 26 * 60 + 30; t += 30) bedSlots.push(t % 1440);
  const wakeSlots = [];
  for (let t = 4 * 60; t <= 11 * 60; t += 30) wakeSlots.push(t);

  const submit = () => {
    setSleepLogs(sleepLogs.concat({ bed, wake }));
    setFlipcoins(flipcoins + COINS);
    setToast({
      title: "Sleep logged",
      line: fmtDur(dur) + " · " + fmtTime(bed) + " to " + fmtTime(wake),
      coins: COINS,
    });
    setLogSleepOpen(false);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "6px 22px 12px" }}>
        <button
          onClick={() => setLogSleepOpen(false)}
          aria-label="Close"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: BG_ALT,
            border: "1px solid " + BORDER,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <X size={17} color={TEXT} />
        </button>
        <span style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 700, color: TEXT }}>
          Log your sleep
        </span>
        <span style={{ width: 34 }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {/* The answer, before the questions, so it is obvious what the two
            rails are adding up to. */}
        <div style={{ padding: "6px 22px 0" }}>
          <div
            style={{
              background: MIND_T,
              borderRadius: 18,
              padding: "18px 16px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 800, color: TEXT, lineHeight: 1 }}>{fmtDur(dur)}</div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>
              {fmtTime(bed)} to {fmtTime(wake)}
            </div>
          </div>
        </div>

        <div style={{ padding: "18px 22px 0", display: "flex", alignItems: "center", gap: 7 }}>
          <Moon size={14} color={MUTED} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>When did you go to bed?</span>
        </div>
        <Rail slots={bedSlots} value={bed} onPick={setBed} />

        <div style={{ height: 1, background: LINE, margin: "16px 22px 0" }} />

        <div style={{ padding: "16px 22px 0", display: "flex", alignItems: "center", gap: 7 }}>
          <Sun size={14} color={MUTED} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>When did you wake up?</span>
        </div>
        <Rail slots={wakeSlots} value={wake} onPick={setWake} />

        <div style={{ padding: "16px 22px 0", fontSize: 11.5, color: MUTED, lineHeight: 1.5 }}>
          Roughly is fine. Your coach is looking at the pattern across the week, not the exact minute.
        </div>

        {/* The offer stays on the screen whatever was chosen before, and
            whether or not a plan is in. Somebody who said they would tell us
            themselves in week one often has a watch by week three, and the
            only way back used to be a settings row nobody goes looking for. */}
        <button
          onClick={() => setHealthSheet("sleep")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "calc(100% - 44px)",
            margin: "16px 22px 0",
            background: MIND_W,
            border: "1px solid " + MIND_T,
            borderRadius: 14,
            padding: "12px 13px",
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "left",
          }}
        >
          <HeartPulse size={16} color={MIND_C} strokeWidth={2.2} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: TEXT }}>
              Let Health Connect fill this in
            </span>
            <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 1, lineHeight: 1.4 }}>
              If your phone or watch tracks your nights, it already has them.
            </span>
          </span>
          <CtaArrow size={13} style={{ color: MIND_C }} />
        </button>
      </div>

      <div style={{ flexShrink: 0, padding: "14px 22px 24px" }}>
        <button
          onClick={submit}
          style={{
            width: "100%",
            background: GREEN,
            border: "none",
            borderRadius: 14,
            padding: "14px 0",
            color: "#fff",
            fontSize: 14.5,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 2px 0 " + GREEN_DEEP,
          }}
        >
          Log this night
        </button>
      </div>
    </div>
  );
}

function Rail({ slots, value, onPick }) {
  /* The chosen hour starts centred rather than wherever the rail happens to
     begin. A row of times that opens on 8 PM when the answer is 10:30 asks
     somebody to go looking for their own selection. */
  const pick = useRef(null);
  useLayoutEffect(() => {
    const el = pick.current;
    if (el) el.scrollIntoView({ block: "nearest", inline: "center" });
  }, []);

  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "10px 22px 2px", scrollbarWidth: "none" }}>
      {slots.map((t) => {
        const on = t === value;
        return (
          <button
            key={t}
            ref={on ? pick : null}
            onClick={() => onPick(t)}
            style={{
              flexShrink: 0,
              background: on ? MIND_C : BG,
              border: "1px solid " + (on ? MIND_C : BORDER),
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: on ? 700 : 500,
              color: on ? "#fff" : TEXT,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {fmtTime(t)}
          </button>
        );
      })}
    </div>
  );
}
