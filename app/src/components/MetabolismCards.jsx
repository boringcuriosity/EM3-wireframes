import React from "react";
import { useWF } from "../state";
import { Utensils, Flame, BarChart3, Lock } from "lucide-react";
import LotusIcon from "./LotusIcon";
import { TEXT, MUTED, FAINT, BG, BG_ALT, BORDER, LINE, RULE, PILLAR, SH_SM } from "../tokens";

/* The four pillars as their own scores, in a rail you swipe.

   The tiles this replaces were four ways in and nothing else: the same four
   words every day, whatever the day had done. A score is the smallest thing
   that makes the strip worth a second look.

   Drawn several ways, switched from the panel, because the only honest way
   to choose between them is to see them on a real day.

   Four drawings, no two the same anatomy. Only the gauge answers a question a
   bare figure cannot: 62 out of 100 says nothing about whether 62 is a good
   week, and a bar says it without a sentence, which matters here because the
   strip has no room for one. It is the default for that reason.

     peek     solid hexagon in the pillar's colour, a third of it past the edge
     medal    upright, the badge over the name, four of them as a shelf
     gauge    the score's position drawn along the foot of the card
     headline the figure as the whole point, the pillar named beside it */

const HEX = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";
const ICONS = { eat: Utensils, move: Flame, mind: LotusIcon, measure: BarChart3 };

/* Both scales run to a hundred, so the figure is its own percentage and no
   card has to be told twice what it is out of. */
const pctOf = (p) => Math.max(0, Math.min(100, p.value));

export default function MetabolismCards() {
  const { pillarScores, metabCard, setEatDetail, setMoveDetail, setMindDetail, setActiveTab } = useWF();

  const go = {
    eat: () => setEatDetail(true),
    move: () => setMoveDetail(true),
    mind: () => setMindDetail(true),
    measure: () => setActiveTab("med"),
  };

  const cfg = VARIANTS[metabCard] || VARIANTS.peek;
  const Card = cfg.card;

  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 10 }}>Metabolism</div>

      {/* Runs the full width of the frame rather than stopping at the page
          gutter, so a swipe moves edge to edge and the next card shows as a
          strip instead of being clipped by the padding. */}
      <div
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollPaddingLeft: 22,
          scrollbarWidth: "none",
          padding: "4px 22px 8px",
          margin: "-4px -22px -8px",
        }}
      >
        {pillarScores.map((p) => (
          <Shell key={p.id} p={p} cfg={cfg} onOpen={go[p.id]}>
            <Card p={p} c={PILLAR[p.id]} Icon={ICONS[p.id]} cfg={cfg} />
          </Shell>
        ))}
      </div>
    </div>
  );
}

/* Every layout sits in the same button, so a card's size, its edge and the way
   it takes a tap are decided once. */
function Shell({ p, cfg, onOpen, children }) {
  return (
    <button
      onClick={onOpen}
      aria-label={p.name + ", " + p.score}
      style={{
        flex: "0 0 " + cfg.w + "px",
        height: cfg.h,
        scrollSnapAlign: "start",
        position: "relative",
        overflow: "hidden",
        background: BG,
        border: "1px solid " + BORDER,
        borderRadius: 18,
        boxShadow: SH_SM,
        padding: 0,
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: "left",
        boxSizing: "border-box",
      }}
    >
      {children}
    </button>
  );
}

/* ---- shared pieces ---- */

/* The pillar's mark, tinted, so four cards are told apart at a glance rather
   than by reading them. */
const Mark = ({ Icon, c, size = 38, r = 12 }) => (
  <span
    style={{
      width: size,
      height: size,
      flexShrink: 0,
      borderRadius: r,
      background: c.w,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Icon size={size * 0.5} color={c.c} strokeWidth={1.9} />
  </span>
);

const Name = ({ children, size = 13.5 }) => (
  <span style={{ display: "block", fontSize: size, fontWeight: 700, color: TEXT }}>{children}</span>
);

/* One line, whatever the state. Open, it is what the score is called; shut, it
   is what opens it. Both grey and regular, because a strip you swipe past
   should not shout from one card and not the others. */
const Line = ({ p, style }) => (
  <span
    style={{
      display: "block",
      fontSize: 11,
      color: MUTED,
      lineHeight: 1.35,
      marginTop: 3,
      ...style,
    }}
  >
    {p.open ? p.score : p.need}
  </span>
);

const Figure = ({ p, size, color }) => (
  <span style={{ fontSize: size, fontWeight: 800, color, lineHeight: 1, letterSpacing: -0.5 }}>
    {p.value}
    {p.out === "%" && <span style={{ fontSize: size * 0.5, fontWeight: 700 }}>%</span>}
  </span>
);

/* ---- 1-3 · the hexagon off the edge ---- */

function EdgeCard({ p, c, Icon, cfg }) {
  const { size, out } = cfg.hex;
  const ink = p.open ? c.c : RULE;

  return (
    <span style={{ display: "flex", alignItems: "center", gap: 11, height: "100%", padding: "0 14px" }}>
      <Mark Icon={Icon} c={c} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <Name>{p.name}</Name>
        {/* Clear of the shape, so the two never collide on a long line. */}
        <Line p={p} style={{ paddingRight: size + out + 8 }} />
      </span>

      <span
        aria-hidden
        style={{
          position: "absolute",
          right: out,
          top: "50%",
          transform: "translateY(-50%)",
          width: size,
          height: size * 1.09,
          clipPath: HEX,
          /* Shut, the shape goes grey. A lock drawn in the pillar's own colour
             still reads as the pillar's badge, and the one thing this state
             has to say is that there is no badge yet. */
          background: p.open
            ? "linear-gradient(150deg, " + ink + " 0%, " + ink + "D9 100%)"
            : BG_ALT,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingRight: Math.abs(out) * 0.85,
          boxSizing: "border-box",
        }}
      >
        {!p.open ? (
          <Lock size={15} color={RULE} strokeWidth={2.2} />
        ) : (
          <>
            <Figure p={p} size={19} color="#fff" />
            {p.out !== "%" && (
              <span style={{ fontSize: 7.5, color: "#fff", opacity: 0.8, marginTop: 2 }}>
                out of 100
              </span>
            )}
          </>
        )}
      </span>
    </span>
  );
}

/* ---- 4 · medal ---- */

/* Upright and narrow, so the four sit as a shelf rather than a queue and more
   than one is readable without swiping. The badge leads, because a shelf is
   for looking along. */
function MedalCard({ p, c, Icon }) {
  const ink = p.open ? c.c : RULE;
  return (
    <span
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "0 10px",
        textAlign: "center",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 56,
          height: 61,
          clipPath: HEX,
          background: p.open ? "linear-gradient(150deg, " + ink + " 0%, " + ink + "D9 100%)" : BG_ALT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {p.open ? <Figure p={p} size={19} color="#fff" /> : <Lock size={15} color={RULE} strokeWidth={2.2} />}
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10 }}>
        <Icon size={13} color={c.c} strokeWidth={2} />
        <Name size={12.5}>{p.name}</Name>
      </span>
      <Line p={p} style={{ fontSize: 10, marginTop: 2 }} />
    </span>
  );
}

/* ---- 5 · gauge ---- */

/* The figure with somewhere to stand. A bar along the foot says whether 62 is
   most of the way or barely started, which is the thing a number on its own
   refuses to answer and the thing a person actually wants to know. */
function GaugeCard({ p, c, Icon }) {
  return (
    <span style={{ display: "block", height: "100%", position: "relative" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 10, height: "100%", padding: "0 14px 5px" }}>
        <Mark Icon={Icon} c={c} size={32} r={10} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <Name size={13}>{p.name}</Name>
          <Line p={p} style={{ fontSize: 10.5, marginTop: 1 }} />
        </span>
        {p.open ? (
          <Figure p={p} size={22} color={c.c} />
        ) : (
          <Lock size={16} color={RULE} strokeWidth={2.2} />
        )}
      </span>

      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 5,
          background: LINE,
          display: "block",
        }}
      >
        {p.open && (
          <span
            style={{
              display: "block",
              height: "100%",
              width: "100%",
              background: c.c,
              /* Scaled rather than widened. The bar is a plain rectangle with
                 square ends, so the two are identical to look at, and this one
                 does not make the browser lay the card out again 60 times a
                 second. */
              transformOrigin: "left",
              transform: "scaleX(" + pctOf(p) / 100 + ")",
              transition: "transform .8s cubic-bezier(.32,.72,0,1)",
            }}
          />
        )}
      </span>
    </span>
  );
}

/* ---- 6 · headline ---- */

/* The figure as the whole point, with the pillar's colour as a stripe down the
   edge and its mark as a watermark behind. Nothing here reads the number,
   which is the argument for it: at a glance you get four figures and whose
   they are, and the explaining happens on the screen it opens. */
function HeadlineCard({ p, c, Icon }) {
  return (
    <span style={{ display: "block", height: "100%", position: "relative" }}>
      <span
        aria-hidden
        style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: p.open ? c.c : LINE }}
      />
      <span
        aria-hidden
        style={{ position: "absolute", right: -12, top: "50%", transform: "translateY(-50%)" }}
      >
        <Icon size={74} color={c.w} strokeWidth={1.4} />
      </span>

      <span
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 12,
          height: "100%",
          padding: "0 14px 0 16px",
        }}
      >
        {p.open ? (
          <Figure p={p} size={38} color={c.c} />
        ) : (
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: BG_ALT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Lock size={16} color={RULE} strokeWidth={2.2} />
          </span>
        )}
        <span style={{ flex: 1, minWidth: 0 }}>
          <Name size={13}>{p.name}</Name>
          <Line p={p} style={{ fontSize: 10.5, marginTop: 2, color: p.open ? MUTED : FAINT }} />
        </span>
      </span>
    </span>
  );
}

/* Declared last because each entry names a component above it. Width and
   height belong here rather than inside the layouts, so the rail can be read
   as one table of shapes. */
const VARIANTS = {
  peek:     { w: 244, h: 84,  card: EdgeCard, hex: { size: 62, out: -19 } },
  medal:    { w: 134, h: 138, card: MedalCard },
  gauge:    { w: 232, h: 74,  card: GaugeCard },
  headline: { w: 226, h: 96,  card: HeadlineCard },
};
