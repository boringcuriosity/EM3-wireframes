import React from "react";
import { useWF } from "../state";
import FtuxExplainer from "./FtuxExplainer";
import TourTarget from "./TourTarget";
import DayRow from "./DayRow";
import Em3Strip from "./Em3Strip";
import LotusIcon from "./LotusIcon";
import DayStreakBar, { DayDoneCard } from "./DayStreakBar";
import MetabolismCards from "./MetabolismCards";
import HomeToday from "./HomeToday";
import { ChevronRight, MoreHorizontal, Utensils, Flame, BarChart3 } from "lucide-react";
import { PILLAR, TEXT, MUTED, FAINT, LINE, BG, BORDER, SH_SM } from "../tokens";

/* Home, as one card.

   Three things used to say the day: a streak strip at the top of the screen, a
   task card in the middle and a pillar card under it. Same day, three places,
   three denominators. Now it is one card, so the link reads by itself: these
   tasks feed these four pillars and that is what keeps the streak.

   Three shapes are kept switchable while we decide which one a person reads
   fastest. They differ only in what sits between the streak line and the
   rings, because that is the only real question: how much of the list does
   Home owe you before you go to To-do for the rest. */
export default function DailyTasks() {
  const { dailyState, dayPhases, dayLive, dayComplete, homeCard, metabCard, setActiveTab,
          setEatDetail, setMoveDetail, setMindDetail } = useWF();

  if (dailyState === "ftux") return <FtuxExplainer />;

  /* The bubbles shape is a section rather than a card, and it owns its own
     heading, so it returns before any of the shared card machinery below. */
  if (homeCard === "bubbles")
    return (
      <TourTarget id="focus" style={{ padding: "4px 22px 18px" }}>
        <HomeToday />
      </TourTarget>
    );

  // The first phase with anything left in it, and what is open inside it.
  const phase = dayPhases.find((f) => !f.complete);
  /* What is still open. The split card looks at the whole day, because the
     line under it counts what is left today rather than what is left in this
     part of it. The other shapes stay inside the current phase. */
  const open =
    homeCard === "split"
      ? dayLive.filter((r) => !r.done)
      : phase
      ? phase.rows.filter((r) => !r.done && !r.skipped)
      : [];
  const shown =
    homeCard === "phase" ? open.slice(0, 3)
    : homeCard === "split" ? open.slice(0, 2)
    : open.slice(0, 1);
  const one = open[0];
  const rest = open.length - shown.length;

  /* The phase carries its own wording rather than having "This " glued to its
     heading. Three of the four take it and the fourth does not: nobody says
     "this night", they say tonight. */
  const label = homeCard === "phase" && phase ? phase.when : "Up next";

  /* The rows, plus the line that says the list keeps going. Shaped like a row
     rather than a caption, so it taps like one. */
  const list = phase && (
    <div style={{ padding: "0 14px", borderBottom: "1px solid " + LINE }}>
      <div style={{ padding: "11px 0 2px" }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          {label}
        </span>
      </div>

      {shown.map((r, i) => (
        <DayRow key={r.id} row={r} compact last={i === shown.length - 1 && rest === 0} />
      ))}

      {rest > 0 && (
        <button
          onClick={() => setActiveTab("track")}
          aria-label={"See " + rest + " more today"}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "none",
            border: "none",
            padding: "11px 0",
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "left",
          }}
        >
          <span
            style={{
              width: 21,
              height: 21,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MoreHorizontal size={16} color={FAINT} strokeWidth={2.4} />
          </span>
          <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: MUTED }}>
            {homeCard === "phase"
              ? rest + " more " + phase.when
              : rest + " more today"}
          </span>
          <ChevronRight size={15} color={FAINT} strokeWidth={2.2} style={{ flexShrink: 0 }} />
        </button>
      )}
    </div>
  );

  /* The next task named in words, the four pillars under it, and the streak as
     one slim line at the foot. Nothing on this card is a fraction except the
     bar, which is the only place today is counted. */
  const nextTask = one && (
    <div style={{ padding: "13px 14px 2px", borderBottom: "1px solid " + LINE }}>
      <span
        style={{
          display: "block",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: MUTED,
          marginBottom: 2,
        }}
      >
        Your next task is
      </span>
      <DayRow row={one} compact last />
    </div>
  );

  /* The four pillars as places to go, not as a score. All four, always: one
     with nothing due today is still somewhere you might want to look. */
  const METAB = [
    { id: "eat", label: "Eat", Icon: Utensils, go: () => setEatDetail(true) },
    { id: "move", label: "Move", Icon: Flame, go: () => setMoveDetail(true) },
    { id: "mind", label: "Mind", Icon: LotusIcon, go: () => setMindDetail(true) },
    { id: "measure", label: "Measure", Icon: BarChart3, go: () => setActiveTab("med") },
  ];

  const split = (
    <>
      {dayComplete ? <DayDoneCard /> : (
      <div
        style={{
          background: BG,
          border: "1px solid " + BORDER,
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: SH_SM,
        }}
      >
        <DayStreakBar edge="top" />
        <div style={{ padding: "0 14px" }}>
          {/* A label, so two rows out of fourteen read as a shortlist rather
              than as the whole day. */}
          <span
            style={{
              display: "block",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: MUTED,
              padding: "11px 0 1px",
            }}
          >
            Your next tasks
          </span>
          {shown.map((r, i) => (
            <DayRow key={r.id} row={r} compact last={i === shown.length - 1 && rest === 0} />
          ))}
          {rest > 0 && (
            <button
              onClick={() => setActiveTab("track")}
              aria-label={"See " + rest + " more today"}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "none",
                border: "none",
                padding: "11px 0",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 21,
                  height: 21,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MoreHorizontal size={16} color={FAINT} strokeWidth={2.4} />
              </span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: MUTED }}>
                {rest === 1 ? "1 more task left today" : rest + " more tasks left today"}
              </span>
              <ChevronRight size={15} color={FAINT} strokeWidth={2.2} style={{ flexShrink: 0 }} />
            </button>
          )}
        </div>
      </div>
      )}

      {metabCard !== "tiles" ? <MetabolismCards /> : (
      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 10 }}>Metabolism</div>
        <div style={{ display: "flex", gap: 10 }}>
          {METAB.map((m) => (
            <button
              key={m.id}
              onClick={m.go}
              aria-label={"Open " + m.label}
              style={{
                flex: 1,
                minWidth: 0,
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  display: "flex",
                  height: 62,
                  borderRadius: 16,
                  background: BG,
                  border: "1px solid " + BORDER,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 7,
                  boxShadow: SH_SM,
                }}
              >
                <m.Icon size={22} color={PILLAR[m.id].c} strokeWidth={1.8} />
              </span>
              <span style={{ display: "block", fontSize: 10.5, fontWeight: 600, color: TEXT }}>
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      )}
    </>
  );

  return (
    <TourTarget id="focus" style={{ padding: "4px 0 18px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          padding: "0 22px",
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Today's focus</span>
        <button
          onClick={() => setActiveTab("track")}
          aria-label="See your whole day"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: MUTED,
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {/* The way into the full day. The count it used to carry is said
              once, on the card below. */}
          See your day
          <ChevronRight size={15} color={MUTED} style={{ marginLeft: -1 }} />
        </button>
      </div>

      <div style={{ padding: "0 22px" }}>
        {homeCard === "split" ? (
          split
        ) : homeCard === "task" ? (
          <Em3Strip head={false} top={nextTask} bottom={<DayStreakBar edge="bottom" />} />
        ) : (
          <Em3Strip top={list} />
        )}
      </div>
    </TourTarget>
  );
}
