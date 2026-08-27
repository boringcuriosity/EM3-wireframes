import React, { useState, useEffect } from "react";
import { useWF } from "../state";
import LotusIcon from "./LotusIcon";
import { ChevronRight, Plus, MoreVertical, Minus, Utensils, Flame, BarChart3 } from "lucide-react";
import Skel from "./Skel";
import Confetti from "./Confetti";
import { byId } from "../screens/log/foods";
import { PILLAR, TEXT, MUTED, FAINT, LINE, BG, BG_ALT, BORDER } from "../tokens";

const PILLAR_NAME = { eat: "Eat", move: "Move", mind: "Mind", measure: "Measure" };
const PILLAR_ICON = { eat: Utensils, move: Flame, mind: LotusIcon, measure: BarChart3 };

/* One thing to do, at the hour it happens.

   The circle is the only pillar mark on the row. A coloured pill on every line
   would be thirteen pills down a screen, and the colour says the same thing in
   none of the space. The name still reaches a screen reader through the label.

   Nothing is ever struck through until it is genuinely done. Strike-through
   means finished, not late, and a meal you have not logged yet is neither. */
export default function DayRow({ row: r, last, compact }) {
  const { openRow, setRowMenu, planOption, setPlanOption, celebrated, celebrate, uncelebrate } = useWF();
  const c = PILLAR[r.pillar].c;
  const bar = r.kind === "target";
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
          {/* The last word and the pillar mark travel together, so on a title
              that wraps the mark lands after the final word instead of alone on
              a line of its own. */}
          <span style={{ position: "relative", display: "inline-block" }}>
            {head}
            <span style={{ whiteSpace: "nowrap" }}>
              {tail}
            {r.done && !off && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "54%",
                  height: 1.5,
                  borderRadius: 1,
                  background: MUTED,
                  transformOrigin: "left center",
                  transform: burst ? "scaleX(0)" : "scaleX(1)",
                  animation: burst ? "strikeIn .42s cubic-bezier(.4,0,.2,1) .2s forwards" : undefined,
                }}
              />
            )}
            {/* Which of the four this belongs to, said rather than implied.
                The circle carries the colour, but colour alone only works once
                you already know the code, so the mark sits next to the words
                while it is still being learned. It lives inside the title's own
                flow, so on a title that wraps it follows the last word rather
                than floating beside the whole block. Relative, so it paints
                over the strike rather than under it. */}
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
            </span>
          </span>
        </span>
      </span>

      <span style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
        {/* The hour at the end of the row, in line with every other hour, so
            the column of times reads as a schedule down the page. It can sit
            here now that a meal's options run underneath rather than beside
            it. */}
        {r.when && !off && (
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9.5,
              fontWeight: 600,
              color: FAINT,
              whiteSpace: "nowrap",
              marginRight: 4,
            }}
          >
            {r.when}
          </span>
        )}
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
            {r.tip && !r.done && !compact && (
              <span style={{ display: "block", fontSize: 11.5, color: MUTED, lineHeight: 1.45, marginTop: 4 }}>
                {r.tip}
              </span>
            )}
            {r.opts?.length > 0 && !compact && (
              <Plan row={r} onPick={(i) => setPlanOption({ ...planOption, [r.division]: i })} />
            )}
            {bar && !compact && (
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 4, borderRadius: 2, background: LINE, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: pct + "%",
                      background: c,
                      borderRadius: 2,
                      transition: "width .5s cubic-bezier(.32,.72,0,1)",
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

/* What the coach put in this meal, on the row that asks for it.

   The options are alternates for the same meal, so only one is ever shown and
   the pills swap between them. Once something has been eaten the choice is
   settled, the pills go, and the line becomes a record of what went in. */
function Plan({ row: r, onPick }) {
  const c = PILLAR.eat.c;
  const items = r.done ? r.items : r.opts[r.oi] || [];
  /* Portion first, name second, the way a plan is written on paper: "1 bowl
     vegetable poha", not "Vegetable poha 1 bowl". */
  const line = items
    .map((it) => {
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
      const said = name.endsWith(noun) || name.endsWith(noun.replace(/s$/, ""));
      return said ? n + " " + name : n + " " + noun + " " + name;
    })
    .filter(Boolean)
    .join(", ");

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
      {r.opts.length > 1 && !r.optionLocked && (
        <span style={{ display: "flex", gap: 5, marginBottom: 7 }}>
          {r.opts.map((_, i) => (
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
