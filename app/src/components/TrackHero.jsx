import React, { useState } from "react";
import { useWF } from "../state";
import { Lock, Info } from "lucide-react";
import CoachHandoffCard from "./CoachHandoffCard";
import { TDEE } from "../screens/sufficiency/data";
import {
  GREEN, GREEN_DEEP, GREEN_TINT, GREEN_WASH, GOLD_DEEP, GOLD_TINT,
  MOVE_C, MOVE_T, MIND_C, MIND_T, MEASURE_C, MEASURE_T,
  TEXT, MUTED, FAINT, BG, BG_ALT, BORDER, LINE, RULE, SH,
} from "../tokens";

/* The top of the To-do screen, in four states. Two facts decide it: whether
   the care plan is in, and how much of today is logged.

     noplan   the coach handoff card, because there is nothing to summarise
     nodata   the plan is in but the day is empty, so the card asks for a meal
     partial  calories are real, the score is not, so the score sits locked
     full     three main meals in, so the score opens and the lift appears

   Every card shares the same skeleton: a title, a band of figures at a fixed
   height, then one line from Kaira. That is what keeps the three variants the
   same shape as you swipe between them. */

const BAND = 186;

const MACROS = {
  partial: [
    { label: "Protein", pct: 24, val: "23/94g", c: GREEN, t: GREEN_TINT },
    { label: "Carbs", pct: 70, val: "165/236g", c: MOVE_C, t: MOVE_T },
    { label: "Fats", pct: 56, val: "35/62g", c: MIND_C, t: MIND_T },
    { label: "Fibre", pct: 60, val: "18/30g", c: MEASURE_C, t: MEASURE_T },
  ],
  full: [
    { label: "Protein", pct: 78, val: "73/94g", c: GREEN, t: GREEN_TINT },
    { label: "Carbs", pct: 92, val: "217/236g", c: MOVE_C, t: MOVE_T },
    { label: "Fats", pct: 81, val: "50/62g", c: MIND_C, t: MIND_T },
    { label: "Fibre", pct: 88, val: "26/30g", c: MEASURE_C, t: MEASURE_T },
  ],
  nodata: [
    { label: "Protein", pct: 0, val: "0/94g", c: GREEN, t: GREEN_TINT },
    { label: "Carbs", pct: 0, val: "0/236g", c: MOVE_C, t: MOVE_T },
    { label: "Fats", pct: 0, val: "0/62g", c: MIND_C, t: MIND_T },
    { label: "Fibre", pct: 0, val: "0/30g", c: MEASURE_C, t: MEASURE_T },
  ],
};
const SCORE = { nodata: 0, partial: 53, full: 85 };

/* The day's calories. Eaten is the only figure entered; the deficit falls out
   of it, so the three orbs can never disagree with each other. */
const GOAL = 1885;
const EATEN = { nodata: null, partial: 640, full: 1785 };

export default function TrackHero({ state, onSeeTasks }) {
  const { setPillarInfo, setMetricInfo, mainMealsDone } = useWF();
  // The demo's part-way state stages two meals; a real session counts its own.
  const mealsIn = Math.min(3, mainMealsDone || 2);
  const [page, setPage] = useState(0);

  if (state === "noplan") {
    return (
      <div style={{ marginBottom: 26 }}>
        <CoachHandoffCard onSeeTasks={onSeeTasks} />
      </div>
    );
  }

  // With a plan there are always two cards. The score is locked until the
  // third main meal, which is a different thing from not being there.

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        onScroll={(e) => setPage(e.currentTarget.scrollLeft > 60 ? 1 : 0)}
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 12,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          padding: "6px 0 14px",
          margin: "-6px 0 -6px",
        }}
      >
        <Card>
          <Head>Your daily summary</Head>
          <Band>
            <Numbers empty={state === "nodata"} />
          </Band>
          <Kaira>
            {state === "nodata" ? (
              <>
                Finish today's tasks below and I can start telling you what your day is doing to
                your metabolism.
              </>
            ) : state === "partial" ? (
              <>
                Your breakfast was mostly poha and chai, so it leaned on carbs with very little
                <strong> protein</strong>, the part of food that keeps hunger away for hours.
                Without it you will probably be looking for a snack well before lunch.
              </>
            ) : (
              <>
                Rice, roti and khichdi carried most of today, so your energy came mainly from
                carbs. A little more <strong>protein at dinner</strong> would keep you full
                overnight and protect your muscle while the weight comes off.
              </>
            )}
          </Kaira>
        </Card>

        <Card>
            <Head
              right={
                <button
                  onClick={() => setPillarInfo("eat")}
                  aria-label="What is sufficiency"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 2, margin: -2, display: "flex" }}
                >
                  <Info size={15} color={MUTED} strokeWidth={2.2} />
                </button>
              }
            >
              Today's sufficiency
            </Head>
            <Band h={118}>
              <Score locked={state !== "full"} pct={SCORE[state] ?? 0} />
            </Band>
            <Macros set={MACROS[state] || MACROS.partial} />
            {state === "full" ? (
              <Kaira>All three main meals in and a strong day. Protein is the one still worth a look.</Kaira>
            ) : (
              <Meals done={state === "nodata" ? 0 : mealsIn} />
            )}
        </Card>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 6, margin: "10px 0 20px" }}>
          {[0, 1].map((i) => (
          <span
              key={i}
              style={{
                width: i === page ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background: i === page ? TEXT : BORDER,
                transition: "width .25s ease, background .25s ease",
              }}
            />
        ))}
      </div>
    </div>
  );

  /* ---- the bands ---- */

  function Numbers({ empty }) {
    const eaten = EATEN[state] ?? 0;
    return (
      /* Not a row. Eaten is the number of the day, so it sits large on the
         left and the other two hang off it on a diagonal. */
      <div style={{ position: "relative", width: "100%", height: BAND }}>
        <Orb size={150} from={GREEN_TINT} to={GREEN_WASH} at={{ left: 26, top: 26 }}>
          <Cap onInfo={() => setMetricInfo("eaten")}>Eaten</Cap>
          <Big color={empty ? RULE : GREEN_DEEP}>{empty ? "—" : eaten.toLocaleString()}</Big>
          <Sub>of {GOAL.toLocaleString()} kcal</Sub>
        </Orb>

        <Orb size={92} from={MOVE_T} to="#F5F8FF" at={{ right: 26, top: 0 }}>
          <Cap small onInfo={() => setMetricInfo("tdee")}>TDEE</Cap>
          <span style={{ fontSize: 20, fontWeight: 800, color: MOVE_C, lineHeight: 1.2 }}>
            {TDEE.toLocaleString()}
          </span>
        </Orb>

        <Orb size={80} from={GOLD_TINT} to="#FFFDF5" at={{ right: 26, bottom: 0 }}>
          <Cap small onInfo={() => setMetricInfo("deficit")}>Deficit</Cap>
          <span
            style={{
              fontSize: 19,
              fontWeight: 800,
              color: empty ? RULE : GOLD_DEEP,
              lineHeight: 1.2,
            }}
          >
            {empty ? "—" : "−" + (TDEE - eaten).toLocaleString()}
          </span>
        </Orb>
      </div>
    );
  }

  function Score({ locked, pct }) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <span
          style={{
            width: 88,
            height: 96,
            background: "linear-gradient(150deg, " + GREEN + " 0%, " + GREEN_DEEP + " 100%)",
            clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            filter: locked ? "blur(9px)" : "none",
            transition: "filter .6s ease",
          }}
        >
          <span style={{ fontSize: 27, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{pct}%</span>
          <span
            style={{
              fontSize: 7.5,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: 1,
              opacity: 0.85,
              marginTop: 3,
            }}
          >
            SUFFICIENT
          </span>
        </span>

        {locked && (
          <span
            style={{
              position: "absolute",
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: BG,
              border: "1px solid " + LINE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: SH,
            }}
          >
            <Lock size={15} color={RULE} />
          </span>
        )}
      </div>
    );
  }
}

/* ---- pieces ---- */

function Card({ children }) {
  return (
    <div
      style={{
        flex: "0 0 100%",
        scrollSnapAlign: "center",
        display: "flex",
        flexDirection: "column",
        background: BG,
        border: "1px solid " + BORDER,
        borderRadius: 20,
        padding: "15px 16px 16px",
        boxShadow: SH,
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}

function Head({ children, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: TEXT }}>{children}</span>
      {right}
    </div>
  );
}

/* Every variant's figures sit in a band of the same height, which is what
   stops the cards jumping as the rail moves. */
function Band({ children, h }) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: h || BAND,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
}

function Orb({ size, from, to, at, children }) {
  return (
    <div
      style={{
        position: at ? "absolute" : "relative",
        ...at,
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: "linear-gradient(160deg, " + from + " 0%, " + to + " 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
}

/* The label on an orb. Each of these three is a term the person did not
   choose, so each carries a way to ask what it means. */
const Cap = ({ children, small, onInfo }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
    <span style={{ fontSize: small ? 10 : 11, color: MUTED }}>{children}</span>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onInfo();
      }}
      aria-label={"What is " + children + "?"}
      style={{
        background: "none",
        border: "none",
        padding: 2,
        margin: -2,
        display: "flex",
        cursor: "pointer",
      }}
    >
      <Info size={small ? 11 : 12} color={FAINT} strokeWidth={2.2} />
    </button>
  </span>
);
const Big = ({ children, color }) => (
  <span style={{ fontSize: 29, fontWeight: 800, color, lineHeight: 1.15, letterSpacing: -0.5 }}>
    {children}
  </span>
);
const Sub = ({ children }) => (
  <span style={{ fontSize: 10, color: MUTED }}>{children}</span>
);

function Macros({ set }) {
  return (
    <div style={{ display: "flex", gap: 4, marginTop: 10, marginBottom: 12 }}>
      {set.map((m) => (
        <div key={m.label} style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
          <Ring pct={m.pct} color={m.c} track={m.t} />
          <div style={{ fontSize: 10.5, fontWeight: 700, color: TEXT, marginTop: 5 }}>{m.label}</div>
          <div style={{ fontSize: 9.5, color: MUTED, marginTop: 1 }}>{m.val}</div>
        </div>
      ))}
    </div>
  );
}

function Ring({ pct, color, track }) {
  const R = 20;
  const C = 2 * Math.PI * R;
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 50, height: 50 }}>
      <svg width="50" height="50" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r={R} fill="none" stroke={track} strokeWidth="6" />
        <circle
          cx="25"
          cy="25"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct / 100)}
          transform="rotate(-90 25 25)"
          style={{ transition: "stroke-dashoffset .9s cubic-bezier(.32,.72,0,1)" }}
        />
      </svg>
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 800,
          color: TEXT,
        }}
      >
        {pct}
      </span>
    </span>
  );
}

/* The gate, drawn as the three meals it is waiting on rather than described in
   a sentence. */
function Meals({ done }) {
  const NAMES = ["Breakfast", "Lunch", "Dinner"];
  return (
    <div
      style={{
        background: BG_ALT,
        border: "1px solid " + LINE,
        borderRadius: 13,
        padding: "11px 12px",
        marginTop: "auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: TEXT }}>{done} of 3 main meals</span>
        <span style={{ fontSize: 10.5, color: MUTED }}>unlocks your score</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {NAMES.map((n, i) => (
          <div key={n} style={{ flex: 1 }}>
            <div
              style={{
                height: 5,
                borderRadius: 3,
                background: i < done ? GREEN : LINE,
                transition: "background .4s ease " + i * 0.08 + "s",
              }}
            />
            <div
              style={{
                fontSize: 9.5,
                color: i < done ? TEXT : MUTED,
                marginTop: 4,
                textAlign: "center",
              }}
            >
              {n}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function Kaira({ children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 9,
        background: GREEN_WASH,
        border: "1px solid " + GREEN_TINT,
        borderRadius: 13,
        padding: "10px 12px",
        marginTop: "auto",
      }}
    >
      <span
        style={{
          width: 20,
          height: 22,
          flexShrink: 0,
          marginTop: 1,
          background: "linear-gradient(150deg, " + GREEN + " 0%, " + GREEN_DEEP + " 100%)",
          clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 9,
          fontWeight: 600,
          fontFamily: "'Playfair Display', Georgia, serif",
        }}
      >
        K
      </span>
      <div style={{ fontSize: 11.5, color: TEXT, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}
