import React, { useEffect, useState } from "react";
import { useWF } from "../state";
import CtaArrow from "./CtaArrow";
import { Utensils, Flame, BarChart3, Check } from "lucide-react";
import LotusIcon from "./LotusIcon";
import { PILLAR, TEXT, MUTED } from "../tokens";

const ICONS = { eat: Utensils, move: Flame, mind: LotusIcon, measure: BarChart3 };

/* The four pillars, one of them bigger.

   To-do is adherence, the day as a list. This is the other half: where each
   pillar stands, and which one is worth a minute right now.

   Each keeps its own corner and its own size, so the shape is the same every
   time Home is opened. Only the big one moves, and it leans a little out of
   the corner it came from so the gap it leaves does not read as a hole.

   THE THREE THAT STAYED HAVE TO BE CLEARLY APART FROM THE BIG ONE, AND ALL
   THREE BY THE SAME AMOUNT. Touching is the whole vocabulary here: the hero
   and its satellite are joined because they are one pillar, and if a
   neighbour is also grazing the hero then touching says nothing. On the
   tighter frame this ran at first, the corner nearest the hero overlapped it
   by eight pixels and the one after that cleared it by four, so all of it read
   as one crowded cluster with a lump on the side.

   Fixed corners do not fix that, because the hero leans out of its own seat
   and so is nearer two of them and further from the third. Spread across a
   frame thirty two pixels taller, that came out as twenty two, thirty three
   and forty four, and the diagonal one read as having wandered off on its own.

   So the three are placed off the hero rather than off the frame: each one
   keeps the bearing of its own corner, and is set down at exactly the two
   radii plus the same gap. All three clear the big one by twenty two pixels in
   every arrangement, and the satellite is the only thing in the picture at
   nought. The corners still read as corners, and the cluster settling around
   whoever is asking is worth the small amount of travel it costs.

   The big one always asks for something. With a score it leads with the nudge
   and prints the figure under it; without one it leads with the ask to go and
   log, because a percentage of nothing is a figure nobody has earned. Which
   pillar is which comes from its colour and its corner, so the words on the
   big one are spent on the ask rather than on a label.

   TWO LAYERS, AND THEY HAVE TO STAY SEPARATE. The button owns where a bubble
   is and how big; the skin inside owns the drift. Putting both on one element
   makes the endless animation and the size change fight, and the size loses
   silently: the inline width reads 150px while the computed width sits at 70. */
const SEATS = {
  mind:    { x: 58,  y: 50,  d: 72 },
  move:    { x: 288, y: 50,  d: 76 },
  measure: { x: 288, y: 214, d: 70 },
  eat:     { x: 58,  y: 214, d: 74 },
};
const C = { x: 173, y: 134 };
const FRAME = { w: 346, h: 268 };
const HERO = 158;
// What every bubble that is not the hero keeps between itself and the hero.
const RING = 22;
// Out of step with each other on the first frame, so the four never pulse together.
const PERIOD = { eat: 8, move: 9.4, mind: 7.2, measure: 8.7 };
const DELAY = { eat: 0, move: 2.6, mind: 4.1, measure: 1.3 };
/* Settling, with a little overshoot. A handover is a thing arriving, and a
   bubble that eases politely into its size reads as a resize rather than as
   something that moved.

   A second, up from six tenths. This is the beat where one pillar comes up out
   of its corner and the last one goes back down into its, and at .62s the two
   crossed too fast to be read as one thing replacing another. It runs straight
   off the end of the pour, with the screen to itself. */
const EASE = "cubic-bezier(.34,1.3,.5,1)";
const GROW = "1.05s " + EASE;
/* The liquid has weight, so it takes longer to settle than the shell does.

   The liquid has weight, so it takes longer to settle than the shell does.
   The satellite's rise runs exactly as long as the big one's drain, so the
   level leaving one and the level arriving in the other are one movement
   rather than two that happen to overlap.

   THE CURVE MATTERS MORE THAN THE DURATION HERE. This was on the same eased
   out curve as everything else, which is about 85% finished a quarter of the
   way through, so lengthening it to two and a half seconds bought a half
   second of pour and two seconds of creep nobody can see. It read as a hang,
   and every attempt to fix it by making it slower made the hang longer.

   So the pour gets a curve of its own, near enough even that the level is
   visibly moving for the whole of it, with only enough shape at the ends to
   stop it starting and stopping dead. Everything else on the card keeps the
   eased out curve, because everything else is arriving somewhere rather than
   asking to be watched on the way. */
const POUR = "cubic-bezier(.42,.06,.36,.96)";

/* Depth, three ways.

   Flat is what these were: one tint, one hairline, one rectangular block of
   fill. It reads as a disc with a bar in it. The other two light the sphere
   from the top left and let the fill behave like liquid, which is what makes
   a circle read as a bubble rather than as a pie.

   Written as one function per skin rather than as a table of values, because
   every layer is derived from the pillar's own hue and a table would be the
   same three colours written twelve times. */
const SKINS = {
  flat: (c, on) => ({
    shell: {
      background: c.w,
      border: "1.5px solid " + (on ? c.c : c.t),
    },
    fill: { background: c.t },
    spec: null,
  }),
  glass: (c, on) => ({
    shell: {
      background:
        "radial-gradient(120% 120% at 30% 22%, #FFFFFF 0%, " + c.w + " 46%, " + c.t + " 100%)",
      /* One rim, drawn the same whether anything is in or not, just paler
         while it is empty. A dashed ring was meant to say "not filled in
         yet", but the liquid level and the missing number already say that,
         and four broken outlines on one card read as damage rather than as a
         state. A bubble with nothing in it is still a bubble. */
      border: "1.5px solid " + (on ? c.t : c.w),
      boxShadow:
        "0 10px 22px -9px " + c.c + "3D, inset 0 -12px 18px -12px " + c.c + "66, inset 0 7px 12px -7px #FFFFFF",
    },
    fill: {
      background: "linear-gradient(180deg, " + c.t + " 0%, " + c.c + "40 100%)",
    },
    spec: { top: "13%", left: "20%", width: "30%", height: "20%", opacity: 0.85, blur: 5 },
  }),
  orb: (c, on) => ({
    shell: {
      background:
        "radial-gradient(130% 130% at 28% 18%, #FFFFFF 0%, " + c.w + " 32%, " + c.t + " 74%, " + c.c + "59 100%)",
      border: "none",
      // The rim is an inner line rather than a border, so it curves with the
      // sphere instead of ringing it. Softer while the bubble is empty.
      boxShadow:
        "0 16px 30px -12px " + c.c + "59, 0 2px 5px " + c.c + "26, " +
        "inset 0 -16px 24px -13px " + c.c + "A6, inset 0 9px 15px -8px #FFFFFF, " +
        "inset 0 0 0 1px " + c.c + (on ? "26" : "14"),
    },
    fill: {
      background: "linear-gradient(180deg, " + c.t + " 0%, " + c.c + "59 100%)",
    },
    spec: { top: "10%", left: "17%", width: "34%", height: "23%", opacity: 1, blur: 6 },
  }),
};

/* The satellite: the hero's own bubble, still in its seat.

   The big one is spent on the question, so it has no room left for the name or
   the score, and once a pillar goes hero its corner empties and its detail page
   stops being reachable from Home at all. This is that corner, kept.

   It sits along the line from the middle out to the hero's own seat, landing
   within a few pixels of where that pillar's small bubble was. So the handover
   reads as the small bubble staying put while a question grows out of it, and
   because the hero always vacates exactly the corner the satellite wants, the
   four cases never collide with the three bubbles that stayed.

   Placed at exactly the two radii, rim touching rim, rather than overlapping.
   Blur and threshold turn two touching circles into one shape with a waist,
   which is the whole effect, and every pixel of overlap past that is a pixel of
   the label hidden under the hero. At nine pixels of overlap, which is what
   sitting exactly on the seat gives, the score was crowded against the big
   one's edge.

   Small enough to be a satellite and big enough to hit and to read: 58. */
const SAT = 58;
const SAT_OUT = HERO / 2 + SAT / 2;

/* Out from a centre, along the bearing of a seat, to a given distance. The one
   piece of arithmetic behind both the ring and the satellite: they differ only
   in how far out they stop. */
const outTo = (from, seat, dist) => {
  const dx = seat.x - from.x;
  const dy = seat.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: from.x + (dx / len) * dist, y: from.y + (dy / len) * dist };
};

/* Where all four sit this frame. With nobody asking they are in their seats;
   with a hero, the other three come to one ring around it. */
function place(bubbles, hero, heroAt) {
  const out = {};
  bubbles.forEach((p) => {
    const seat = SEATS[p.id];
    if (!hero) out[p.id] = { x: seat.x, y: seat.y, d: seat.d };
    else if (p.id === hero.id) out[p.id] = { x: heroAt.x, y: heroAt.y, d: HERO };
    else out[p.id] = { ...outTo(heroAt, seat, HERO / 2 + seat.d / 2 + RING), d: seat.d };
  });
  return out;
}

/* The neck, and why it is drawn behind rather than through.

   The obvious way is to run the goo filter over the bubbles themselves. It
   looks wrong: blur-then-threshold smears the specular highlight and eats the
   inset shadows, which are the whole reason these read as spheres.

   So the filter runs over a silhouette layer instead, two plain tinted circles
   at the same centres, and the real bubbles are drawn on top in register. The
   only part of the silhouette that survives in the open is the neck between
   them, which is the only part wanted.

   The silhouette is the pillar's 600 mixed a third of the way into white, not
   its tint. The tints are 100-level, near enough to white that the neck
   vanished against the card on the first pass, and a third of the 600 lands
   where a bubble is darkest anyway, which is its rim, and the rim is what a
   neck is made of.

   IT HAS TO BE OPAQUE. The threshold reads alpha: a colour written as the 600
   at 27% arrives with alpha .27, the matrix takes that to 22 x .27 - 10, which
   is below nought, and the entire silhouette clips away with no error and no
   neck. Mix into white to get the same colour at alpha 1, never fade it.

   ponytail: no highlight or rim of its own on the neck. If the join reads flat
   against the orb skin, the upgrade is a second filtered layer a pixel larger
   in a deeper mix, not a filter on the bubbles. */
function Goo({ c, hero, sat, period, delay }) {
  const blob = (x, y, d) => ({
    position: "absolute",
    left: x - d / 2,
    top: y - d / 2,
    width: d,
    height: d,
    borderRadius: "50%",
    background: "color-mix(in srgb, " + c.c + " 32%, #FFFFFF)",
    transition: ["left", "top", "width", "height"].map((k) => k + " " + GROW).join(", "),
    animation: "drift " + period + "s ease-in-out infinite",
    animationDelay: "-" + delay + "s",
  });
  return (
    <span aria-hidden style={{ position: "absolute", inset: 0, filter: "url(#em3goo)" }}>
      {/* Inset, so the threshold never leaves a coloured rim outside the real
          bubble sitting on top of it. Three pixels is enough to hide and small
          enough that the two still have a waist to make between them. */}
      <span style={blob(hero.x, hero.y, hero.d - 3)} />
      <span style={blob(sat.x, sat.y, SAT - 3)} />
    </span>
  );
}

/* Blur, then throw away everything under about half alpha. Two shapes that
   overlap blur into one hill and come back as one shape with a waist. */
function GooFilter() {
  return (
    <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <filter id="em3goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feColorMatrix
            in="blur"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
          />
        </filter>
      </defs>
    </svg>
  );
}

/* Which pillar just gained something, for as long as it takes to notice.

   Watched here rather than handed down, because the thing worth pointing at is
   whichever bubble's level rose, and after a log that is often not the hero any
   more: finishing lunch fills Eat and hands the front to Move in the same
   frame. Comparing the levels catches it wherever it lands.

   KEYED ON THE LEVELS, NOT ON THE ARRAY. `bubbles` is rebuilt every render, so
   an effect that depends on it runs every render, and its cleanup then cancels
   the pulse timer on the first unrelated re-render, a fifth of a second in. A
   string of the four levels changes only when a level does, which is the only
   thing this needs to hear about.

   The mark carries the levels it was raised at as well as the pillar, so two
   logs into the same pillar inside one pulse are two different values and the
   ring restarts rather than being bailed out of as an unchanged state.

   THE LEVELS ARE HELD OUTSIDE THE COMPONENT, and they have to be. The whole
   point of this is the return from a log: the big bubble sends you to the
   logger, the logger unmounts Home, and coming back is the moment the pillar
   is worth pointing at. Held in a ref, the memory of the old levels died with
   the card on the way out, so the one pulse that mattered was the one that
   never played, and every pulse that did fire was for a tick done on a screen
   already showing the bubbles.

   Safe as module state because exactly one of these is ever mounted: it lives
   on Home and nowhere else, and /play keeps its own copy of everything. */
let lastLevels = "";
let lastHero = "";

const readLevels = (str) =>
  Object.fromEntries(str.split(" ").filter(Boolean).map((p) => p.split(":")));

/* The handover, in four beats.

   CHARGE, the big one takes on a little liquid. It carries none the rest of
   the time: the satellite holds the score and the level, and a big bubble
   filling as well was the same reading twice, in the same colour, ten pixels
   apart. So the liquid here is not a state, it is the answer to the question
   arriving, and it only exists in order to leave.

   DRAIN, it empties down the neck and the satellite comes up. The two are one
   shape already, so the eye reads a transfer rather than two bubbles animating
   near each other. The question fades while this happens, because it has been
   answered and it is what is draining.

   HAND, straight off the back of it, the next pillar comes up out of its own
   corner and this one goes back down into its. Sequencing it after the pour is
   the difference between a story and two things happening at once.

   NOTHING WAITS BETWEEN THE BEATS. There was a pause here, and a delay before
   the satellite started, and both were the wrong tool: a still frame does not
   read as slow, it reads as a hitch, and the eye goes looking for what it
   missed. Every beat is motion, each one runs long enough to follow, and the
   next one starts the moment the last stops. */
const CHARGE = 460;
const DRAIN = 2300;
// How much the big one takes on before letting it go. Enough to see leaving.
const CHARGE_TO = 26;

// The satellite's rise, and the big one's two beats.
const POUR_IN = "height " + DRAIN + "ms " + POUR;
const CHARGE_IN = "height " + CHARGE + "ms cubic-bezier(.35,.1,.4,1)";
const DRAIN_OUT = "height " + DRAIN + "ms " + POUR;

function usePour(bubbles, covered) {
  const sig = bubbles.map((b) => b.id + ":" + b.fill).join(" ");
  const live = (bubbles.find((b) => b.hero) || {}).id || "";

  /* WHAT IS DRAWN LAGS WHAT IS TRUE, ON PURPOSE.

     A transition animates a change; it does nothing for the value an element
     is born with. Returning from a logger builds this card from scratch, so
     the new level was simply already there, and the pour the whole return was
     arranged around never ran once. So the levels start where they stood last
     time the card was on screen, and catch up when the sequence says to.

     AND IT WAITS OUT THE CELEBRATION. Ticking a task throws a full screen over
     Home for nearly three seconds, the flame rising to where the day now
     stands. Home is mounted underneath the whole time, so the pour was running
     behind a scrim and finishing before the scrim lifted: slowing it down only
     made a longer animation nobody could see. Nothing starts until the card is
     the thing on the screen, whether it was mounted before the scrim went up
     or built underneath it. */
  const [shown, setShown] = useState(() => readLevels(lastLevels));
  const [flow, setFlow] = useState(null);

  /* NOBODY GROWS UNTIL IT IS SETTLED WHO SHOULD.

     The ranking moves the instant a task lands, so between the log and this
     working out what to do with it there were renders where the next pillar
     was simply the hero. It grew, the sequence then put the pillar that had
     just been logged back in the middle, and the new one shrank again and
     regrew at the end: finish a Mind task and Eat swells, collapses, and
     swells a second time. Behind the celebration it was worse, because the
     swell happened unseen and the collapse was the first thing on screen.

     So the middle is held by whoever was last drawn there until the question
     is settled, which is a hundred and fifty milliseconds, or the length of
     the scrim. Nothing resizes on a guess. */
  const [deciding, setDeciding] = useState(true);
  const [held, setHeld] = useState(lastHero);

  /* 1. Notice a rise, once the card is really the thing on the screen.

     The look before committing is not a pause, nothing is moving yet. Ticking
     a task sets the level and raises the celebration in the same breath, and
     on a rebuild this can run in the gap between the two: it started a
     sequence, the scrim came down over the top of it a frame later, and the
     beat's timer went with the re-run. Checking again a moment later lands on
     the right side of that gap.

     It is also what makes the first paint the old level. A transition animates
     a change and does nothing for the value an element is born with, so the
     levels are drawn where they stood last time and only then set to the truth.
     A pair of animation frames would do it in a tab somebody is looking at,
     but a hidden tab suspends those outright and clamps timers instead, and a
     card that never catches up is worse than one that catches up late. */
  useEffect(() => {
    if (covered) {
      // Whatever was in the middle stays there for as long as the scrim is up.
      setHeld(lastHero);
      setDeciding(true);
      return;
    }
    /* Read here, not in the timer. The effect that remembers the drawn hero
       runs in this same commit, just below, and by the time the timer fires it
       has already moved `lastHero` on to whoever the ranking now favours. Read
       from inside the timer, the comparison was always against the new hero,
       never found a match, and the sequence quietly downgraded to a plain fill
       every single time a celebration had been up. Effects run top down, so
       reading in the body is reading before it moves. */
    const was = readLevels(lastLevels);
    const before = lastHero;
    setHeld(before);
    setDeciding(true);
    const arm = setTimeout(() => {
      setDeciding(false);
      lastLevels = sig;
      const rose = sig.split(" ").map((p) => p.split(":")).find(([id, f]) => was[id] !== undefined && +f > +was[id]);

      /* The full sequence only when the pillar that rose is the one that was
         drawn large. Tapping the big bubble, logging, and coming back is
         exactly that case, and the card is then continuous with the one left
         behind rather than staging a handover somebody never saw the start of.

         It is also what stops the next task announcing itself early. Logging
         last night's sleep leaves Mind still holding the middle, and its next
         open row is the mood one, so a live read flashed "How has your day
         been" for a second in the middle of the pour, before the last question
         had finished being put away. Through the sequence the bubble carries a
         tick instead of any question at all, and the next one is asked when
         the next pillar arrives to ask it.

         A rise somewhere else, from To-do or a sheet, is not a story about
         this bubble, so it just fills, with a ring to say which. */
      if (rose && rose[0] === before) {
        setFlow({ id: rose[0], beat: "charge" });
        return;
      }
      setShown(readLevels(sig));
      if (rose) setFlow({ id: rose[0], beat: "ring" });
    }, 150);
    return () => clearTimeout(arm);
  }, [sig, covered]);

  /* 2. Walk the beats, and hold wherever a scrim comes down over them.

     Each beat owns its own timer and nothing owns the sequence, so a
     celebration arriving mid pour parks it on whichever beat it reached and
     the next one starts when the card is visible again. Before this the beat's
     timer was cancelled and never replaced, and the bubble sat at a quarter
     full for as long as anybody left it there. */
  useEffect(() => {
    if (covered || !flow) return;
    if (flow.beat === "charge") {
      const t = setTimeout(() => {
        setFlow({ ...flow, beat: "drain" });
        setShown(readLevels(sig));
      }, CHARGE);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setFlow(null), DRAIN);
    return () => clearTimeout(t);
  }, [flow, covered, sig]);

  /* Who is drawn large. The pillar being poured holds the middle until its
     sequence is done, and before that the one already there holds it until
     there is an answer, however fast the ranking moved on underneath. */
  const heroId =
    flow && flow.beat !== "ring" ? flow.id
    : deciding && held && bubbles.some((b) => b.id === held) ? held
    : live;

  /* Remembered for the next time this card is built, which is what decides
     whether the return from a logger is a handover or just a fill. Not touched
     during a sequence: the whole point of the frozen question is that the
     live one has already moved on. */
  useEffect(() => {
    if (covered || flow) return;
    lastHero = heroId;
  }, [heroId, covered, flow]);

  // A pillar nobody has a remembered level for is drawn where it actually is.
  const fillOf = (b) => (shown[b.id] === undefined ? b.fill : +shown[b.id]);

  return { flow, fillOf, heroId };
}

/* The ring that says "this one". Sits on the rim of whichever bubble moved and
   swells off it twice. */
function Bump({ c }) {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        border: "2px solid " + c.c,
        animation: "satBump 1.5s cubic-bezier(.22,.7,.3,1) 2 both",
      }}
    />
  );
}

export default function ScoreBubbles() {
  const { bubbles, planAssigned, bubbleSkin, taskDone, openRow, setEatDetail, setMoveDetail, setMindDetail, setActiveTab } = useWF();

  const go = {
    eat: () => setEatDetail(true),
    move: () => setMoveDetail(true),
    mind: () => setMindDetail(true),
    measure: () => setActiveTab("med"),
  };

  // Before the early return, because a hook cannot be skipped.
  const { flow, fillOf, heroId } = usePour(bubbles, !!taskDone);

  /* Before a plan lands there is no day for a score to read and nothing for
     one pillar to be ahead of another on, so the four are four ways in rather
     than four readings. The bubbles arrive with the plan, which is also when
     they start having something to say. */
  if (!planAssigned) return <Tiles bubbles={bubbles} go={go} />;

  const hero = bubbles.find((p) => p.id === heroId) || null;
  // What the big one is holding: nothing, unless it is mid handover.
  const pouring = flow && flow.id === heroId && flow.beat !== "ring" ? flow.beat : null;
  const heroSeat = hero ? SEATS[hero.id] : null;
  const heroAt = hero
    ? { x: C.x + 0.13 * (heroSeat.x - C.x), y: C.y + 0.13 * (heroSeat.y - C.y), d: HERO }
    : null;
  const heroC = hero ? PILLAR[hero.id] : null;
  // Out from the hero's middle, along its own corner's bearing, to touching.
  const satAt = hero ? outTo(heroAt, heroSeat, SAT_OUT) : null;
  const at = place(bubbles, hero, heroAt);

  return (
    <div
      role="group"
      aria-label="Your four pillars"
      style={{ position: "relative", width: FRAME.w, height: FRAME.h, margin: "0 auto" }}
    >
      {hero && <GooFilter />}
      {hero && (
        <Goo
          c={heroC}
          hero={heroAt}
          sat={satAt}
          period={PERIOD[hero.id]}
          delay={DELAY[hero.id]}
        />
      )}

      {/* The satellite, drawn before the four so the hero sits over the join.
          The small one tucking under the big one is the right way round: the
          question is what the card is for, and the score is what it earned. */}
      {hero && (
        <button
          key={"sat:" + hero.id}
          onClick={go[hero.id]}
          aria-label={
            "Open " + hero.name +
            (hero.started ? ", " + hero.score + " percent" : ", no score yet")
          }
          style={{
            position: "absolute",
            left: satAt.x - SAT / 2,
            top: satAt.y - SAT / 2,
            width: SAT,
            height: SAT,
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontFamily: "inherit",
            animation: "satIn .62s " + EASE + " both",
          }}
        >
          <span
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              position: "relative",
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              ...(SKINS[bubbleSkin] || SKINS.flat)(heroC, hero.logged).shell,
              /* The hero's own period and delay, not one of its own. Two halves
                 of one blob drifting at different rates would tear the neck in
                 half every few seconds. */
              animation: "drift " + PERIOD[hero.id] + "s ease-in-out infinite",
              animationDelay: "-" + DELAY[hero.id] + "s",
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute", left: 0, right: 0, bottom: 0,
                height: fillOf(hero) + "%",
                ...(SKINS[bubbleSkin] || SKINS.flat)(heroC, hero.logged).fill,
                transition: POUR_IN,
              }}
            />
            <span style={{ position: "relative", display: "block", padding: "0 3px" }}>
              <span style={{ display: "block", fontSize: 9.5, fontWeight: 700, color: TEXT, letterSpacing: 0.2 }}>
                {hero.name}
              </span>
              {hero.started && (
                <span style={{ display: "block", fontFamily: "'Playfair Display', serif", fontSize: 17, color: TEXT, lineHeight: 1.05, marginTop: 1 }}>
                  {hero.score}
                  <span style={{ fontSize: "0.48em", color: MUTED }}>%</span>
                </span>
              )}
            </span>
          </span>
          {flow && flow.id === hero.id && flow.beat === "drain" && <Bump key="drain" c={heroC} />}
        </button>
      )}

      {bubbles.map((p) => {
        const { x: cx, y: cy, d } = at[p.id];
        const big = p.id === heroId;
        const c = PILLAR[p.id];
        const idle = p.total === 0;
        const skin = (SKINS[bubbleSkin] || SKINS.flat)(c, p.logged);

        return (
          <button
            key={p.id}
            /* The big one opens what it just asked about; a small one is a way
               into its pillar, because it is not asking anything specific. */
            onClick={big && p.next ? () => openRow(p.next) : go[p.id]}
            aria-label={
              p.name + ", " +
              (idle ? "nothing to do today"
                : !p.started ? (p.logged ? p.done + " of " + p.total + " done today" : "not logged yet")
                : p.score + " percent, " + p.done + " of " + p.total + " done today") +
              // The same three states the bubble draws, said in the same order.
              (big ? ". " + p.ask : "")
            }
            style={{
              position: "absolute",
              left: cx - d / 2,
              top: cy - d / 2,
              width: d,
              height: d,
              // Named rather than `all`, so nothing transitions by accident.
              transition: ["left", "top", "width", "height"].map((k) => k + " " + GROW).join(", "),
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <span
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                position: "relative",
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                /* Lit, rimmed and shadowed by the skin. Dashed until a
                   pillar has anything in it, because a dotted outline says
                   "not filled in yet" in every visual language there is, and
                   it costs no colour and no words. */
                ...skin.shell,
                animation: "drift " + PERIOD[p.id] + "s ease-in-out infinite",
                animationDelay: "-" + DELAY[p.id] + "s",
              }}
            >
              {/* Fills to the score once there is one, and to how much of the
                  pillar's day is in before that, so logging always moves
                  something. */}
              <span
                aria-hidden
                style={{
                  position: "absolute", left: 0, right: 0, bottom: 0,
                  /* The big one holds nothing of its own. Its level is the
                     answer arriving and then leaving down the neck; every
                     other bubble draws where it actually stands. */
                  height: (big ? (pouring === "charge" ? CHARGE_TO : 0) : fillOf(p)) + "%",
                  ...skin.fill,
                  transition:
                    pouring === "charge" ? CHARGE_IN : pouring === "drain" ? DRAIN_OUT : POUR_IN,
                }}
              >
                {/* The surface. A flat cut across a sphere reads as a chart;
                    a lit line that breathes reads as something poured in. */}
                {bubbleSkin !== "flat" && p.fill > 0 && (
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: "-10%", right: "-10%", top: -1,
                      height: 3,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,.62)",
                      animation: "meniscus 4.6s ease-in-out infinite",
                    }}
                  />
                )}
              </span>

              {/* Where the light lands. One highlight, high and left, which is
                  the whole difference between a disc and a sphere. */}
              {skin.spec && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: skin.spec.top, left: skin.spec.left,
                    width: skin.spec.width, height: skin.spec.height,
                    borderRadius: "50%",
                    background: "#FFFFFF",
                    opacity: p.logged ? skin.spec.opacity : skin.spec.opacity * 0.5,
                    filter: "blur(" + skin.spec.blur + "px)",
                  }}
                />
              )}

              {/* Keyed on the question, so a handover replays rather than
                  swapping the words under a circle that is already the right
                  size. The arrival is the half of the movement that says
                  something new is being asked. */}
              <span
                key={pouring ? "pour" : big ? "ask:" + p.ask : "small"}
                style={{
                  position: "relative",
                  display: "block",
                  padding: "0 9px",
                  animation: big ? "riseIn .5s cubic-bezier(.32,.72,0,1) both" : undefined,
                }}
              >
                {big && pouring ? (
                  /* WHAT REPLACES THE QUESTION IS AN ANSWER, NOT A GAP.

                     The question fading to nothing left a large empty bubble
                     for three seconds while the liquid moved, and an empty
                     shape does not read as slow, it reads as a hang: the eye
                     decides something has failed and stops watching the very
                     thing it was meant to watch. A tick costs the same room
                     and says the question was answered, which is exactly what
                     the drain underneath it is about. */
                  <Check size={40} strokeWidth={2.4} color={c.c} style={{ display: "block", margin: "0 auto" }} />
                ) : big ? (
                  /* The question, and nothing else.

                     It used to print the score under the ask. The satellite
                     beside it now holds that figure, and a number shown twice
                     nine pixels apart is the same fault this card was rebuilt
                     to remove, just at a smaller scale. The big one asks, the
                     small one scores. Long questions step the type down rather
                     than spilling out of the circle. */
                  <span style={{ display: "block", fontSize: p.ask.length > 30 ? 12.5 : 13.5, fontWeight: 700, color: TEXT, lineHeight: 1.34 }}>
                    {p.ask}
                    <CtaArrow size={12} style={{ color: c.c, marginLeft: 4, verticalAlign: -1.5 }} />
                  </span>
                ) : (
                  <>
                    {/* A small one keeps its name, because that is all it has
                        to identify itself by. */}
                    <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: idle ? MUTED : TEXT, letterSpacing: 0.2 }}>
                      {p.name}
                    </span>
                    {p.started && (
                      <span style={{ display: "block", fontFamily: "'Playfair Display', serif", fontSize: 17, color: TEXT, lineHeight: 1.1, marginTop: 1 }}>
                        {p.score}
                        <span style={{ fontSize: "0.48em", color: MUTED }}>%</span>
                      </span>
                    )}
                  </>
                )}
              </span>
            </span>
            {/* The big one wears no ring of its own: its satellite is the
                thing holding the number that just moved, so the ring belongs
                there. */}
            {flow && flow.id === p.id && !big && <Bump key={flow.beat} c={c} />}
          </button>
        );
      })}
    </div>
  );
}

/* The four as plain cards, for the days before a coach has written anything.
   Same order, same colours, same taps, so the day the plan lands nothing has
   to be relearned: the cards simply become the bubbles. */
function Tiles({ bubbles, go }) {
  const order = ["eat", "move", "mind", "measure"];
  return (
    <div role="group" aria-label="Your four pillars" style={{ display: "flex", gap: 10, padding: "0 14px" }}>
      {order.map((id) => {
        const p = bubbles.find((x) => x.id === id) || { id, name: id };
        const c = PILLAR[id];
        const Icon = ICONS[id];
        return (
          <button
            key={id}
            onClick={go[id]}
            aria-label={"Open " + p.name}
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
                background: c.w,
                border: "1px solid " + c.t,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 7,
              }}
            >
              <Icon size={22} color={c.c} strokeWidth={1.8} />
            </span>
            <span style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: TEXT }}>{p.name}</span>
          </button>
        );
      })}
    </div>
  );
}
