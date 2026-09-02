import React, { useState, useEffect } from "react";
import { useWF } from "../state";
import LotusIcon from "./LotusIcon";
import { ChevronRight, Plus, MoreVertical, Minus, Info, Utensils, Flame, BarChart3 } from "lucide-react";
import Skel from "./Skel";
import Confetti from "./Confetti";
import { byId } from "../screens/log/foods";
import { PILLAR, TEXT, TEXT_2, MUTED, FAINT, LINE, BG, BG_ALT, BORDER, GOLD, GOLD_TINT, GOLD_LINE, GOLD_DEEP, SH_SM } from "../tokens";

const PILLAR_NAME = { eat: "Eat", move: "Move", mind: "Mind", measure: "Measure" };
const PILLAR_ICON = { eat: Utensils, move: Flame, mind: LotusIcon, measure: BarChart3 };

/* The clock the whole wireframe is frozen at. Anything before it has happened,
   anything after it has not. */
const NOW_MIN = 9 * 60 + 41;

/* The spine's own column, and where the dot sits down it: level with the first
   line of the card beside it. */
const RAIL = 14;
const DOT_Y = 20;

/* A range keeps its meridiem when only the start is shown, so 6:00 - 7:00 AM
   does not become a bare "6:00" that could be either end of the day. */
const startTime = (when) => {
  if (!when) return "";
  const [a, b] = when.split(" - ");
  if (!b) return a;
  const m = (a.match(/[AP]M/) || b.match(/[AP]M/) || [""])[0];
  return a.replace(/\s*[AP]M/, "") + (m ? " " + m : "");
};

/* One thing to do, at the hour it happens.

   The circle is the only pillar mark on the row. A coloured pill on every line
   would be thirteen pills down a screen, and the colour says the same thing in
   none of the space. The name still reaches a screen reader through the label.

   Nothing is ever struck through until it is genuinely done. Strike-through
   means finished, not late, and a meal you have not logged yet is neither. */
export default function DayRow({ row: r, last, compact, now }) {
  const { openRow, setRowMenu, setTipInfo, planOption, setPlanOption, celebrated, celebrate, uncelebrate, taskCard, nextRowId } = useWF();
  const c = PILLAR[r.pillar].c;
  // A target with nothing to count towards has no bar to draw.
  const bar = r.kind === "target" && r.goal != null;
  const pct = bar && r.now ? Math.min(100, Math.round((r.now / r.goal) * 100)) : 0;
  const off = r.skipped;
  const PillarIcon = PILLAR_ICON[r.pillar];
  const words = r.title.split(" ");
  const tail = words.length > 1 ? words[words.length - 1] : r.title;
  const head = words.length > 1 ? words.slice(0, -1).join(" ") + " " : "";

  /* The moment a row goes done, once. Whether it happened here or on the Eat
     screen this row sent you to, the celebration plays the first time you see
     it ticked, so the tap that took the most effort is not the one that gets
     nothing back. Untick it and it can earn the moment again. */
  const seen = celebrated.includes(r.id);
  const [burst, setBurst] = useState(false);
  useEffect(() => {
    if (r.done && !seen && !off) {
      celebrate(r.id);
      setBurst(true);
      const t = setTimeout(() => setBurst(false), 1100);
      return () => clearTimeout(t);
    }
    if (!r.done && seen) uncelebrate(r.id);
  }, [r.done, seen, off, r.id, celebrate, uncelebrate]);

  /* Everything a card or a row is made of, built once. The variants differ in
     how these are arranged, not in what they say. */
  const tick = (
    <span
      style={{
        width: 21,
        height: 21,
        borderRadius: "50%",
        flexShrink: 0,
        background: r.done && !off ? c : BG,
        border: "1.8px solid " + (off ? BORDER : r.done ? c : c + "66"),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        transition: "background .18s ease",
        animation: burst ? "taskPop .55s cubic-bezier(.34,1.56,.64,1) both" : undefined,
      }}
    >
      {burst && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: "50%",
            border: "2px solid " + c,
            animation: "haloOut .8s cubic-bezier(.22,.7,.3,1) forwards",
          }}
        />
      )}
      {off ? <Minus size={11} color={FAINT} strokeWidth={3} /> : r.done ? <Tick draw={burst} /> : r.add && <Plus size={12} color={c} strokeWidth={2.8} />}
      {burst && !off && <Confetti pillar={r.pillar} />}
    </span>
  );

  /* The pillar named as well as drawn. It only fits where the badge has a line
     of its own; inline it would push the title off the row. */
  const badgeNamed = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: 22,
        borderRadius: 999,
        padding: "0 9px 0 7px",
        flexShrink: 0,
        background: off ? BG_ALT : PILLAR[r.pillar].t,
      }}
    >
      <PillarIcon size={11} color={off ? FAINT : c} strokeWidth={2.2} />
      <span style={{ fontSize: 10, fontWeight: 700, color: off ? FAINT : c, letterSpacing: 0.2 }}>
        {PILLAR_NAME[r.pillar]}
      </span>
    </span>
  );

  /* The pillar, as its own mark. An icon rather than a word: the four are
     learned in a day and the word costs a third of the line. */
  const badge = (
    <span
      aria-hidden
      style={{
        width: 22,
        height: 22,
        borderRadius: 7,
        flexShrink: 0,
        background: off ? BG_ALT : PILLAR[r.pillar].t,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <PillarIcon size={12} color={off ? FAINT : c} strokeWidth={2} />
    </span>
  );

  /* What the task pays. Absent on a coach tip, which is a reminder rather than
     work, so the gap itself tells the two kinds apart. */
  const coin = r.coins && !off && (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: r.done ? BG_ALT : GOLD_TINT,
        border: "1px solid " + (r.done ? LINE : GOLD_LINE),
        borderRadius: 999,
        padding: "2px 7px 2px 6px",
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          background: r.done ? FAINT : GOLD,
          clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
        }}
      />
      <span style={{ fontSize: 9.5, fontWeight: 700, color: r.done ? MUTED : GOLD_DEEP }}>
        {r.coins}
      </span>
    </span>
  );

  /* What tells a tip apart from everything else on the list.

     Every other row is finished by a record landing somewhere: a meal in Eat,
     a session in Move, a reading off a device. A tip is finished by doing it
     and ticking it, with no screen behind it, and on a list where the two sit
     side by side that difference was invisible. The bulb is the mark for it,
     and it opens the reason the coach asked.

     Neutral, and deliberately so. All four hues in this app are spoken for by
     a pillar, and this mark sits next to one of them: in gold it read as a
     Measure mark on an Eat row. The rest of the palette is no better, amber
     means something needs attention and red means something is wrong, and a
     tip is neither. So the mark is the shape, not the colour, and grey is the
     one thing on a row that claims nothing.

     It rides with the pillar mark rather than off at the end of the row: the
     two together are what the row is, its habit and its kind, and a control
     parked beside the three dots read as another way to open the menu.

     Bare, where the pillar chip beside it is filled. The glyph already draws
     its own circle, so putting it inside another one turned an 18px mark into
     a bullseye. It dims when done exactly as the coin pill does, because a
     finished tip is still a tip. Inline flex, so the same element works as a
     flex child in the card layouts and sits on the text baseline inside a
     wrapping title. */
  const info = r.kind === "tick" && !off && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setTipInfo(r.id);
      }}
      aria-label={"Why your coach asked: " + r.title}
      style={{
        flexShrink: 0,
        padding: 2,
        margin: 0,
        marginLeft: 3,
        verticalAlign: "middle",
        background: "none",
        border: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <Info size={14} color={r.done ? FAINT : TEXT_2} strokeWidth={2.2} />
    </button>
  );

  /* No clock on a row. The hours belong to the part of the day, which says
     them once in its heading, and a column of times down the list was the same
     fact repeated on every line. A meal's own window is still in its plan
     block, where it is the coach's instruction rather than a timestamp. */
  const when = null;

  const menu = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setRowMenu(r.id);
      }}
      aria-label={"More for " + r.title}
      style={{
        background: "none",
        border: "none",
        padding: "2px 0 2px 4px",
        margin: 0,
        cursor: "pointer",
        display: "flex",
        flexShrink: 0,
      }}
    >
      <MoreVertical size={15} color={FAINT} strokeWidth={2} />
    </button>
  );

  const titleText = (size) => (
    <span
      style={{
        display: "block",
        fontSize: size,
        fontWeight: r.done || off ? 600 : 700,
        color: r.done || off ? MUTED : TEXT,
        lineHeight: 1.35,
      }}
    >
      <span
        style={{
          display: "inline",
          WebkitBoxDecorationBreak: "clone",
          boxDecorationBreak: "clone",
          backgroundImage: r.done && !off ? "linear-gradient(" + MUTED + ", " + MUTED + ")" : undefined,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0 62%",
          backgroundSize: r.done && !off ? "100% 1.5px" : "0% 1.5px",
          animation: burst && r.done && !off ? "strikeWipe .42s cubic-bezier(.4,0,.2,1) .2s both" : undefined,
        }}
      >
        {r.title}
      </span>
    </span>
  );

  const body = off ? (
    <span style={{ display: "block", fontSize: 11.5, color: FAINT, lineHeight: 1.45, marginTop: 3 }}>
      You skipped this today.
    </span>
  ) : (
    <>
      {r.tip && !r.done && (
        <span style={{ display: "block", fontSize: 11.5, color: MUTED, lineHeight: 1.45, marginTop: 4 }}>
          {r.tip}
        </span>
      )}
      {/* What the task actually came back with, where the tip used to be. A
          row that says only "done" throws away the one number the sync went
          and got. While the reading is on its way it shimmers in that spot, so
          the answer lands where the wait was rather than somewhere else. */}
      {r.syncing ? (
        <span style={{ display: "block", marginTop: 5 }}>
          <Skel w={96} h={11} />
        </span>
      ) : (
        r.result && r.done && <Result r={r} />
      )}
      {(r.opts?.length > 0 || (r.done && r.items?.length > 0)) && (
        <Plan row={r} onPick={(i) => setPlanOption({ ...planOption, [r.division]: i })} />
      )}
      {bar && (
        <div style={{ marginTop: 8 }}>
          <div style={{ height: 4, borderRadius: 2, background: LINE, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: "100%",
                background: c,
                borderRadius: 2,
                /* Scaled rather than widened, so filling the bar does not make
                   the row lay itself out again on every frame. The track
                   already clips, and a 2px cap on a 4px bar is not something a
                   horizontal scale can visibly bend. */
                transformOrigin: "left",
                transform: "scaleX(" + pct / 100 + ")",
                transition: "transform .5s cubic-bezier(.32,.72,0,1)",
              }}
            />
          </div>
          <div style={{ fontSize: 10.5, color: MUTED, marginTop: 5 }}>
            {r.syncing ? (
              <Skel w={72} h={10} />
            ) : (
              (r.now === null ? 0 : r.now).toLocaleString() + " of " + r.goal.toLocaleString() + " " + r.unit
            )}
          </div>
        </div>
      )}
    </>
  );

  const open = () => (off ? setRowMenu(r.id) : openRow(r));
  const label = r.title + ", " + PILLAR_NAME[r.pillar] + (off ? ", skipped" : r.done ? ", done" : "");

  /* A day is a schedule, and a schedule reads best off a single spine. The
     times line up in one column so the eye travels down one edge instead of
     hunting across fourteen right margins, and the thread between the dots is
     what makes the gaps in a day visible. */
  if (!compact && (taskCard === "timeline" || taskCard === "timeline2")) {
    const past = taskCard === "timeline2" && r.at <= NOW_MIN;
    return (
      <>
      {now && (
        <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 8 }}>
          <span
            style={{
              width: 46,
              flexShrink: 0,
              textAlign: "right",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              fontWeight: 700,
              color: c,
            }}
          >
            9:41
          </span>
          <span style={{ position: "relative", width: RAIL, flexShrink: 0, height: 7 }}>
            <span
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: c,
              }}
            />
          </span>
          <span style={{ flex: 1, height: 1, background: c + "33" }} />
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.6, color: c }}>NOW</span>
        </div>
      )}
      <div
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(e) => e.key === "Enter" && open()}
        aria-label={label}
        style={{ display: "flex", gap: 11, opacity: off ? 0.62 : 1, cursor: "pointer" }}
      >
        <div style={{ width: 46, flexShrink: 0, textAlign: "right", paddingTop: 12 }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              fontWeight: 600,
              color: r.done ? FAINT : MUTED,
              whiteSpace: "nowrap",
            }}
          >
            {startTime(r.when)}
          </span>
        </div>

        {/* The spine gets a column of its own, and both the thread and the dot
            are centred on it. Drawn from the time column, the two sat six
            pixels apart and the line ran past the dots rather than through
            them. */}
        <div style={{ width: RAIL, flexShrink: 0, position: "relative" }}>
          {!last && (
            /* Solid behind you, dashed ahead. The thread itself says how far
               into the day you are, without a word or a number. */
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: "50%",
                marginLeft: -0.75,
                top: DOT_Y + 8,
                bottom: -8,
                width: 0,
                borderLeft:
                  (taskCard === "timeline2" && !past ? "1.5px dashed " : "1.5px solid ") + LINE,
              }}
            />
          )}
          <span
            style={{
              position: "absolute",
              left: "50%",
              top: DOT_Y,
              transform: "translate(-50%, -50%)",
              display: "flex",
              width: 13,
              height: 13,
              borderRadius: "50%",
              alignItems: "center",
              justifyContent: "center",
              background: r.done && !off ? c : BG,
              border: "2px solid " + (off ? BORDER : r.done ? c : c + "66"),
              animation: burst ? "taskPop .55s cubic-bezier(.34,1.56,.64,1) both" : undefined,
            }}
          >
            {burst && (
              <>
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: -4,
                    borderRadius: "50%",
                    border: "2px solid " + c,
                    animation: "haloOut .8s cubic-bezier(.22,.7,.3,1) forwards",
                  }}
                />
                <Confetti pillar={r.pillar} />
              </>
            )}
          </span>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            position: "relative",
            background: BG,
            border: "1px solid " + BORDER,
            borderRadius: 14,
            padding: "10px 12px 11px",
            marginBottom: 8,
            boxShadow: SH_SM,
          }}
        >
          {burst && (
            <span
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 14,
                background: PILLAR[r.pillar].t,
                animation: "flashOut .9s ease forwards",
                pointerEvents: "none",
              }}
            />
          )}
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 7 }}>
            {badge}
            {info}
            <span style={{ flex: 1, minWidth: 0 }}>{titleText(13)}</span>
            {coin}
            {menu}
          </div>
          <div style={{ position: "relative" }}>{body}</div>
        </div>
      </div>
      </>
    );
  }

  /* One thing at a time. The task in front of you is a card; everything else
     is a line. The screen answers "what now" without hiding the day, and the
     cost of reading fourteen tasks drops to reading one. */
  if (!compact && taskCard === "focus" && r.id !== nextRowId) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(e) => e.key === "Enter" && open()}
        aria-label={label}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "9px 4px",
          opacity: off ? 0.62 : 1,
          cursor: "pointer",
          borderBottom: last ? "none" : "1px solid " + LINE,
        }}
      >
        <span
          style={{
            width: 15,
            height: 15,
            borderRadius: "50%",
            flexShrink: 0,
            background: r.done && !off ? c : BG,
            border: "1.6px solid " + (off ? BORDER : r.done ? c : c + "55"),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {r.done && !off && <Tick draw={false} />}
        </span>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 12.5,
            fontWeight: r.done ? 500 : 600,
            color: r.done || off ? MUTED : TEXT,
            textDecoration: r.done && !off ? "line-through" : "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {r.title}
        </span>
        <PillarIcon size={11} color={off ? FAINT : c} strokeWidth={2} style={{ flexShrink: 0 }} />
        {info}
        {when}
      </div>
    );
  }

  /* Finished work stops competing. A done task shrinks to one dim line, so the
     list gets shorter as the day goes rather than standing there fully lit. */
  if (!compact && taskCard === "settle" && r.done && !off) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(e) => e.key === "Enter" && open()}
        aria-label={label}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "7px 12px",
          marginBottom: 6,
          background: BG_ALT,
          borderRadius: 12,
          cursor: "pointer",
        }}
      >
        <span
          style={{
            width: 15,
            height: 15,
            borderRadius: "50%",
            flexShrink: 0,
            background: c,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: burst ? "taskPop .55s cubic-bezier(.34,1.56,.64,1) both" : undefined,
          }}
        >
          <Tick draw={burst} />
        </span>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 12,
            fontWeight: 500,
            color: MUTED,
            textDecoration: "line-through",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {r.title}
        </span>
        {r.coins && (
          <span style={{ fontSize: 9.5, fontWeight: 700, color: FAINT }}>+{r.coins}</span>
        )}
      </div>
    );
  }

  /* One task, one card. Arrangements of the same parts, kept switchable while
     we decide which one reads fastest down a list of fourteen. */
  if (!compact && taskCard !== "row") {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(e) => e.key === "Enter" && open()}
        aria-label={label}
        style={{
          position: "relative",
          /* Every card is the same card. A tinted one for tasks that pay no
             coins read as disabled rather than as a reminder, and the missing
             coin already tells them apart. */
          background: BG,
          border: "1px solid " + BORDER,
          borderRadius: 16,
          padding: taskCard === "stack" ? "11px 13px 13px" : "12px 13px",
          marginBottom: 8,
          boxShadow: SH_SM,
          cursor: "pointer",
          opacity: off ? 0.62 : 1,
        }}
      >
        {burst && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 16,
              background: PILLAR[r.pillar].t,
              animation: "flashOut .9s ease forwards",
              pointerEvents: "none",
            }}
          />
        )}

        {taskCard === "stack" ? (
          /* Badge and pay on top, the task under them. The header reads as a
             label for the card before you read the task itself. */
          <>
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 7 }}>
              {badgeNamed}
              {info}
              {coin}
              <span style={{ flex: 1 }} />
              {when}
              {menu}
            </div>
            <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 11, marginTop: 9 }}>
              {tick}
              <span style={{ flex: 1, minWidth: 0 }}>
                {titleText(13.5)}
                {body}
              </span>
            </div>
          </>
        ) : taskCard === "inline" ? (
          /* Everything on one line, the way a row reads, with the card giving
             the body underneath room it never had. */
          /* The body runs the width of the card. Left inside the title's own
             column it wrapped at the column edge, so a meal's options broke a
             line early and left a gutter beside them. */
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              {tick}
              {badge}
              {info}
              <span style={{ flex: 1, minWidth: 0 }}>{titleText(13.5)}</span>
              {coin}
              {when}
              {menu}
            </div>
            <div style={{ marginLeft: 32 }}>{body}</div>
          </div>
        ) : (
          /* The quietest one: the circle carries the pillar until it is ticked,
             so a card needs no badge at all. */
          <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                flexShrink: 0,
                background: r.done && !off ? c : off ? BG_ALT : PILLAR[r.pillar].t,
                border: r.done && !off ? "none" : "1.5px solid " + (off ? BORDER : c + "33"),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transition: "background .18s ease",
                animation: burst ? "taskPop .55s cubic-bezier(.34,1.56,.64,1) both" : undefined,
              }}
            >
              {burst && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: -3,
                    borderRadius: "50%",
                    border: "2px solid " + c,
                    animation: "haloOut .8s cubic-bezier(.22,.7,.3,1) forwards",
                  }}
                />
              )}
              {/* Home shows what To-do shows. A row that names a meal and then hides
            the two things you might eat is asking you to go somewhere else to
            find out what it meant, which is the opposite of a shortlist. What
            still differs between the two is the menu, not the detail. */}
        {off ? (
                <Minus size={12} color={FAINT} strokeWidth={3} />
              ) : r.done ? (
                <Tick draw={burst} />
              ) : (
                <PillarIcon size={13} color={c} strokeWidth={2} />
              )}
              {burst && !off && <Confetti pillar={r.pillar} />}
            </span>

            {info}
            <span style={{ flex: 1, minWidth: 0 }}>{titleText(13.5)}</span>
            {coin}
            {when}
            {menu}
          </div>
          <div style={{ marginLeft: 37 }}>{body}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => (off ? setRowMenu(r.id) : openRow(r))}
      onKeyDown={(e) => e.key === "Enter" && (off ? setRowMenu(r.id) : openRow(r))}
      aria-label={r.title + ", " + PILLAR_NAME[r.pillar] + (off ? ", skipped" : r.done ? ", done" : "")}
      style={{
        borderBottom: last ? "none" : "1px solid " + LINE,
        padding: compact ? "9px 0" : "12px 0",
        cursor: "pointer",
        opacity: off ? 0.62 : 1,
        position: "relative",
      }}
    >
      {burst && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: "2px -10px",
            borderRadius: 12,
            background: PILLAR[r.pillar].t,
            animation: "flashOut .9s ease forwards",
            pointerEvents: "none",
          }}
        />
      )}
      {/* The name and its controls on one line; everything the row carries
          underneath, indented to the title and running the full width. Kept
          inside the content column, a meal's options ended a chevron short of
          the edge and wrapped a line early for it. */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
      <span
        style={{
          width: 21,
          height: 21,
          borderRadius: "50%",
          flexShrink: 0,
          marginTop: 1,
          background: r.done && !off ? c : BG,
          border: "1.8px solid " + (off ? BORDER : r.done ? c : c + "66"),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          transition: "background .18s ease",
          animation: burst ? "taskPop .55s cubic-bezier(.34,1.56,.64,1) both" : undefined,
        }}
      >
        {burst && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: -3,
              borderRadius: "50%",
              border: "2px solid " + c,
              animation: "haloOut .8s cubic-bezier(.22,.7,.3,1) forwards",
            }}
          />
        )}
        {off ? (
          <Minus size={11} color={FAINT} strokeWidth={3} />
        ) : r.done ? (
          <Tick draw={burst} />
        ) : (
          /* A row you add to says so in the circle it would be ticked in. A
             second plus off to the right was a second control for the same
             one action. */
          r.add && <Plus size={12} color={c} strokeWidth={2.8} />
        )}
        {burst && !off && <Confetti pillar={r.pillar} />}
      </span>

      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: 13.5,
            fontWeight: r.done || off ? 600 : 700,
            color: r.done || off ? MUTED : TEXT,
            lineHeight: 1.35,
          }}
        >
          {/* The strike runs with the words rather than across the box. As an
              absolutely positioned bar it drew one long rule through the middle
              of a title that wrapped; as a background rule cloned per line
              fragment it follows each line, and the pillar chip's own tint
              covers the part that would otherwise pass behind it.

              The last word and the mark travel together, so on a wrapped title
              the mark lands after the final word instead of alone on a line. */}
          <span
            style={{
              display: "inline",
              WebkitBoxDecorationBreak: "clone",
              boxDecorationBreak: "clone",
              backgroundImage: r.done && !off ? "linear-gradient(" + MUTED + ", " + MUTED + ")" : undefined,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0 62%",
              backgroundSize: r.done && !off ? "100% 1.5px" : "0% 1.5px",
              animation: burst && r.done && !off ? "strikeWipe .42s cubic-bezier(.4,0,.2,1) .2s both" : undefined,
            }}
          >
            {head}
            <span style={{ whiteSpace: "nowrap" }}>
              {tail}
              <span
                aria-hidden
                style={{
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  background: off ? BG_ALT : PILLAR[r.pillar].t,
                  marginLeft: 6,
                  verticalAlign: "middle",
                }}
              >
                <PillarIcon size={10} color={off ? FAINT : c} strokeWidth={2} />
              </span>
              {info}
            </span>
          </span>
        </span>
      </span>

      {/* Pinned to the first line rather than to the middle of the block.

          A title that wraps used to drag the hour down with it, so on a list
          where some titles run to two lines the times stopped sharing an edge
          and the column of hours came apart. The padding is what sits the
          small mono type optically on the first line rather than flush with
          the top of it. */}
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          flexShrink: 0,
          alignSelf: "flex-start",
          paddingTop: 2,
        }}
      >
        {/* No hour at the end of the row. The column of times down the page
            was the same fact restated on every line, and the part of the day
            now says it once in its own heading. The Timeline layouts keep
            theirs, because a spine of hours is the whole of what they are. */}
        {/* One glyph at the end of a row. A chevron and a three dot sitting
            three pixels apart read as one smudged control, so the full row
            keeps the menu and the compact rows on Home, which have no menu,
            keep the chevron. */}
        {compact && r.kind === "go" && !off && <ChevronRight size={15} color={FAINT} strokeWidth={2.2} />}

        {/* Skipping lives here rather than on the face of the row. A decline
            button beside every ask is a decision you are made to take thirteen
            times a day; a menu is one you can go and find. */}
        {!compact && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRowMenu(r.id);
            }}
            aria-label={"More for " + r.title}
            style={{
              background: "none",
              border: "none",
              padding: "2px 0 2px 4px",
              margin: 0,
              cursor: "pointer",
              display: "flex",
              flexShrink: 0,
            }}
          >
            <MoreVertical size={15} color={FAINT} strokeWidth={2} />
          </button>
        )}
      </span>
      </div>

      <div style={{ position: "relative", marginLeft: ROW_INDENT }}>
        {off ? (
          /* A skipped row is still a row you might change your mind about, so
             tapping anywhere on it reopens the sheet that put it here. The line
             does not need to say so. */
          <span style={{ display: "block", fontSize: 11.5, color: FAINT, lineHeight: 1.45, marginTop: 3 }}>
            You skipped this today.
          </span>
        ) : (
          <>
            {r.tip && !r.done && (
              <span style={{ display: "block", fontSize: 11.5, color: MUTED, lineHeight: 1.45, marginTop: 4 }}>
                {r.tip}
              </span>
            )}
            {r.syncing ? (
              <span style={{ display: "block", marginTop: 5 }}>
                <Skel w={96} h={11} />
              </span>
            ) : (
              r.result && r.done && <Result r={r} />
            )}
            {(r.opts?.length > 0 || (r.done && r.items?.length > 0)) && (
              <Plan row={r} onPick={(i) => setPlanOption({ ...planOption, [r.division]: i })} />
            )}
            {bar && (
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 4, borderRadius: 2, background: LINE, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: "100%",
                      background: c,
                      borderRadius: 2,
                      // Same reason as the bar on the timeline row above.
                      transformOrigin: "left",
                      transform: "scaleX(" + pct / 100 + ")",
                      transition: "transform .5s cubic-bezier(.32,.72,0,1)",
                    }}
                  />
                </div>
                <div style={{ fontSize: 10.5, color: MUTED, marginTop: 5 }}>
                  {r.syncing ? (
                    <Skel w={72} h={10} />
                  ) : (
                    (r.now === null ? 0 : r.now).toLocaleString() +
                    " of " +
                    r.goal.toLocaleString() +
                    " " +
                    r.unit
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* The tick, drawn rather than dropped in. One stroke, left to right, in step
   with the circle filling under it. */
function Tick({ draw }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5 10.5 18 19 7"
        stroke="#fff"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        style={
          draw
            ? { strokeDasharray: 1, strokeDashoffset: 1, animation: "checkDraw .34s cubic-bezier(.4,0,.2,1) .12s forwards" }
            : undefined
        }
      />
    </svg>
  );
}

// Circle plus the gap beside it, so anything below a row lines up with its name.
const ROW_INDENT = 33;

/* The reading a finished task came back with: hours slept, the mood you
   picked. Set in the same plain line the tip uses, because it is read the same
   way and a chip would make one row's subtext louder than every other. */
function Result({ r }) {
  return (
    <span style={{ display: "block", fontSize: 11.5, color: MUTED, lineHeight: 1.45, marginTop: 4 }}>
      {r.result}
    </span>
  );
}

/* What is in this meal, on the row that asks for it.

   Before it is logged that is the coach's options, alternates for the same
   meal, so only one shows and the pills swap between them. Once something has
   been eaten the choice is settled, the pills go, and the line becomes a
   record of what actually went in.

   That record does not need a plan behind it. Somebody logging their own
   breakfast with no coach yet has just as much right to see it on the row, and
   the block used to appear only where a plan had put options there. */
function Plan({ row: r, onPick }) {
  const c = PILLAR.eat.c;
  const opts = r.opts || [];
  /* Finished, the record of what went in. Still open with a plan behind it,
     the coach's whole option, so the items still owed stay on screen beside
     the ones already struck. */
  const items = r.done ? r.items : opts[r.oi] || [];
  if (!items.length) return null;
  /* Portion first, name second, the way a plan is written on paper: "1 bowl
     vegetable poha", not "Vegetable poha 1 bowl". */
  const said = (it) => {
    const f = byId(it.id);
    if (!f) return null;
    const [, per, rawNoun] = f.unit.match(/^(\d+)?\s*(.*)$/);
    // A serving can be more than one of a thing: idli comes as "2 pieces",
    // so two servings is four, not "2 x 2 pieces".
    const n = (Number(per) || 1) * it.qty;
    const noun = n > 1 && !rawNoun.endsWith("s") ? rawNoun + "s" : n === 1 ? rawNoun.replace(/s$/, "") : rawNoun;
    const name = f.name.toLowerCase();
    // "1 egg" plus "boiled egg" would read "1 egg boiled egg", so when the
    // name already ends in the unit's noun the noun is dropped.
    const ends = name.endsWith(noun) || name.endsWith(noun.replace(/s$/, ""));
    return ends ? n + " " + name : n + " " + noun + " " + name;
  };

  /* Each item on its own, so a coach's option can be half done. Logging two of
     three used to leave the whole line unstruck, which said nothing about
     which one was still owed. The ones already in are struck; the rest are
     what the row is still asking for. */
  const inAlready = new Set(r.loggedIds || []);
  const parts = items
    .map((it) => ({ key: it.id, text: said(it), on: r.done || inAlready.has(it.id) }))
    .filter((x) => x.text);
  const line = (
    <>
      {parts.map((x, i) => (
        <span key={x.key}>
          <span
            style={
              x.on && !r.done
                ? { textDecoration: "line-through", textDecorationColor: c, color: FAINT }
                : undefined
            }
          >
            {x.text}
          </span>
          {i < parts.length - 1 ? ", " : ""}
        </span>
      ))}
    </>
  );

  return (
    <span
      style={{
        display: "block",
        background: BG_ALT,
        border: "1px solid " + LINE,
        borderRadius: 11,
        padding: "8px 10px",
        marginTop: 8,
      }}
    >
      {opts.length > 1 && !r.optionLocked && (
        <span style={{ display: "flex", gap: 5, marginBottom: 7 }}>
          {opts.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                onPick(i);
              }}
              style={{
                background: i === r.oi ? c : BG,
                border: "1px solid " + (i === r.oi ? c : BORDER),
                borderRadius: 999,
                padding: "3px 9px",
                fontSize: 9.5,
                fontWeight: 700,
                color: i === r.oi ? "#fff" : MUTED,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              Option {i + 1}
            </button>
          ))}
        </span>
      )}
      <span style={{ display: "block", fontSize: 11.5, color: r.done ? MUTED : TEXT, lineHeight: 1.45 }}>
        {line || "Nothing planned for this one."}
      </span>
    </span>
  );
}
