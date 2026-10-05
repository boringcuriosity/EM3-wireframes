/* The Cloud Drop timeline, ported from liquid-score/index.html (frame(), clock(), reset()).

   Every function here is a Reanimated worklet: it runs on the UI thread inside useDerivedValue, so the score
   animates with no React renders. They are also plain functions, so the CanvasKit check renders frames with them.

   Units, as in the web shader: origin at the centre of the hero, y up, 1 unit = the hero's height (H). toPx()
   maps that to dp, y down, the way the web's toPx() maps it to CSS px. */

export const INTRO = 11.5; // the intro is choreographed on an 11.5s score...
export const SPEED = 2.3; // ...and played 2.3x faster (embedded mode always uses 2.3)
export const ARC0 = 1.25 * Math.PI;
export const SWEEP = 1.5 * Math.PI;
export const P = 30; // orbs round the gauge
export const ORB_PAD = 0.5; // the orb fills half its tile (orb.png: 128px orb in a 256px tile)
export const Y1 = 0.03; // cloud.js embeds with y=.03: the gauge sits a little high in its frame
export const LIGHT: [number, number] = [-0.55, 0.835];

export type Lock = 'lit' | 'quiet' | null;

export interface Geo {
  W: number;
  H: number;
  SIZE: number; // scales the whole gauge; embedded it keeps the gauge at the designed 874px-screen size
  S: number; // SIZE against the design (.75)
  R0: number; // the bubble's radius
  pearls: { ro: number; r: number }[];
}

export function makeGeo(W: number, H: number): Geo {
  'worklet';
  const SIZE = (0.75 * 874) / H;
  const pearls: { ro: number; r: number }[] = [];
  for (let i = 0; i < P; i++) {
    pearls.push({
      ro: (i % 2 ? 0.19 : 0.165) * SIZE,
      r: (i % 2 ? 0.0075 : 0.0115) * SIZE * (1 + 0.1 * Math.sin(i * 2.3)),
    });
  }
  return { W, H, SIZE, S: SIZE / 0.75, R0: 0.112 * SIZE, pearls };
}

export const toPx = (g: Geo, x: number, y: number): [number, number] => {
  'worklet';
  return [x * g.H + g.W / 2, g.H / 2 - y * g.H];
};

/* easing, exactly as the web */
export const cl = (x: number, a = 0, b = 1) => {
  'worklet';
  return Math.min(b, Math.max(a, x));
};
export const seg = (t: number, a: number, b: number) => {
  'worklet';
  return cl((t - a) / (b - a));
};
export const eOut = (x: number) => {
  'worklet';
  return 1 - Math.pow(1 - x, 3);
};
export const eIO = (x: number) => {
  'worklet';
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const eExpo = (x: number) => {
  'worklet';
  return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
};
export const mix = (a: number, b: number, k: number) => {
  'worklet';
  return a + (b - a) * k;
};

/* The score clock: the intro plays SPEED times faster, then the idle (churn, drift, breathing) runs at normal speed. */
export const clock = (r: number) => {
  'worklet';
  const e = INTRO / SPEED;
  return r < e ? r * SPEED : INTRO + (r - e);
};

/* ---- palettes (SKY in the web) ---- */
const SKY = {
  orb: [0.02, 0.376, 0.227, 0.012, 0.596, 0.333, 0.07, 0.718, 0.416, 0.196, 0.835, 0.514, 0.424, 0.914, 0.651, 0.82, 0.98, 0.875],
  orbsoft: [0.03, 0.3, 0.2, 0.05, 0.5, 0.3, 0.2, 0.72, 0.48, 0.42, 0.88, 0.62, 0.7, 0.95, 0.8, 0.96, 0.99, 0.97],
  cloud: [0.7, 0.8, 0.76, 0.8, 0.88, 0.84, 0.88, 0.93, 0.9, 0.93, 0.96, 0.94, 0.97, 0.985, 0.975, 1, 1, 1],
  cloudsoft: [0.74, 0.83, 0.79, 0.84, 0.9, 0.87, 0.9, 0.95, 0.92, 0.95, 0.97, 0.96, 0.98, 0.99, 0.98, 1, 1, 1],
  mist: [0.55, 0.64, 0.6, 0.66, 0.74, 0.71, 0.77, 0.83, 0.81, 0.86, 0.9, 0.89, 0.93, 0.96, 0.95, 1, 1, 1],
};

/* The part of the web's variant pack that differs between the variants Cloud Drop passes through.
   Layout: skyA[18] skyB[18] glow[3] glowS rim edge[3] edgeAmt lift aura  (47 numbers).
   The web starts every page on the "Orbs" variant and lerps (rate 3/s, real time) to the one it was asked for,
   so for the first second the bubble's rim and glow still carry a little of Orbs' deeper green. Kept. */
const pack = (sa: number[], sb: number[], glow: number[], glowS: number, rim: number, edge: number[], edgeAmt: number, lift: number, aura: number) =>
  [...sa, ...sb, ...glow, glowS, rim, ...edge, edgeAmt, lift, aura];

export const ORBS_PACK = pack(SKY.orb, SKY.orbsoft, [0.82, 0.98, 0.875], 0.7, 0.8, [0.012, 0.596, 0.333], 0.3, 0.88, 1);

export function targetPack(lock: Lock): number[] {
  if (!lock) return pack(SKY.cloud, SKY.cloudsoft, [0.88, 0.96, 0.92], 0.55, 1, [0.7, 0.82, 0.76], 0.3, 0.5, 0.6);
  // locked: the same pour in mist; lit keeps a mint halo (the day nothing has happened), quiet does not
  return pack(SKY.mist, SKY.cloud, lock === 'lit' ? [0.84, 0.95, 0.9] : [0.93, 0.95, 0.94], lock === 'lit' ? 0.6 : 0.3, 1, [0.7, 0.82, 0.76], 0.3, 0.72, 0);
}
/* introSky: the bloom and pour play in these colours, then the settled bubble fades to the variant's own */
export function introPack(lock: Lock): number[] {
  return lock ? [...SKY.mist, ...SKY.mist] : [...SKY.orb, ...SKY.orbsoft];
}

/* ---- everything one frame needs ---- */
export interface Cfg {
  geo: Geo;
  score: number; // 0..100 (0 when locked)
  from: number | null; // step-up mode
  lock: Lock;
  start: number[]; // ORBS_PACK
  target: number[]; // targetPack(lock)
  intro: number[]; // introPack(lock)
}

/* the bubble: born in place (Cloud Drop is "local"), grows as the colour pours in, then breathes */
export const bubble = (c: Cfg, t: number) => {
  'worklet';
  const y = Y1 + 0.005 * Math.sin(t * 0.7) * seg(t, 6.3, 7.5);
  const r = c.geo.R0 * eIO(seg(t, 2.5, 5.0)) * (1 + 0.008 * Math.sin(t * 1.3) * seg(t, 6, 7));
  return { x: 0, y, r };
};

/* how much of the score has poured into the gauge so far */
export const filledAt = (c: Cfg, t: number, since: number) => {
  'worklet';
  if (c.from != null) return mix(c.from, c.score, eIO(seg(since, 0.5, 1.9)));
  return c.score * eExpo(seg(t, 6.8, 8.8));
};

/* Uniforms for shaders/fluid.ts. vk: how much of the start variant is left (1 at mount, e^-3 after a second).
   fluidW/H: the fluid canvas in dp; dpr: its pixel ratio (px = one fluid pixel in shader units). */
export function fluidUniforms(c: Cfg, t: number, since: number, vk: number, pulse: number, fluidW: number, fluidH: number, dpr: number) {
  'worklet';
  const g = c.geo;
  const main = bubble(c, t);
  const filled = filledAt(c, t, since);
  const v: number[] = [];
  for (let j = 0; j < c.target.length; j++) v.push(mix(c.target[j], c.start[j], vk));
  const ik = 1 - eIO(seg(t, 4.6, 6.8));
  const sa: number[] = [];
  const sb: number[] = [];
  for (let j = 0; j < 18; j++) {
    sa.push(mix(v[j], c.intro[j], ik));
    sb.push(mix(v[18 + j], c.intro[18 + j], ik));
  }
  const grow = Math.min(0.28 * g.SIZE, 0.44) * eOut(seg(t, 0.2, 2));
  const pk = seg(t, 2.4, 5.2);
  const back = 0.5 * (pk + pk * pk * (3 - 2 * pk));
  return {
    uRes: [fluidW, fluidH],
    uPx: 1 / (fluidH * dpr),
    uTime: t,
    // geometric shrink reads as a steady pour
    uRc: back ? grow * Math.pow(Math.max(main.r * 0.85, 0.02) / grow, back) : grow,
    uArm: Math.sin(Math.PI * seg(t, 1.6, 5.2)),
    uVivid: eIO(seg(t, 1.4, 3.6)),
    uSwirl: eIO(seg(t, 1.2, 3.2)) * (1 - 0.7 * eIO(seg(t, 4, 7.5))),
    uGlow: eIO(seg(t, 4.4, 6.8)),
    uScale: 1 + pulse,
    uFill: filled / 100,
    uArcIn: eIO(seg(t, 5.9, 7.2)),
    uEye: [main.x, main.y],
    uR: main.r,
    uSA: sa,
    uSB: sb,
    uGlowC: [v[36], v[37], v[38]],
    uGlowS: v[39],
    uRim: v[40],
    uEdge: [v[41], v[42], v[43]],
    uEdgeAmt: v[44],
    uLift: v[45],
    uAura: v[46],
  };
}

/* The 30 orbs: bud out of the bubble's edge, then orbit, each on its own small circle. Returns 30 x
   [x dp, y dp, tile half-size dp, fill], ready for shaders/orbs.ts. Fill runs 0..1 along the arc; locked, a
   single glint passes along the empty orbs instead. */
export function orbUniforms(c: Cfg, t: number, since: number): number[] {
  'worklet';
  const g = c.geo;
  const main = bubble(c, t);
  const filled = filledAt(c, t, since);
  const out: number[] = [];
  for (let i = 0; i < P; i++) {
    const q = g.pearls[i];
    const tb = 6.0 + i * 0.035;
    const k = eOut(seg(t, tb, tb + 1.2));
    let fill = cl((filled / 100 * P - i) * 2);
    // the glint: one pass along the empty orbs, 0 toward 100, just after the padlock clicks shut, then still
    if (c.lock) {
      const gp = seg(t, 7.6, 10.2) * (P + 8) - i;
      fill = gp > 0 && gp < 8 ? Math.sin(gp / 8 * Math.PI) * 0.28 : 0;
    }
    const pr = k ? q.r * (1.3 - 0.3 * fill) * eOut(seg(t, tb, tb + 0.6)) : 0;
    if (pr <= 0) {
      out.push(0, 0, 0, 0);
      continue;
    }
    const th = ARC0 - i / (P - 1) * SWEEP + 0.012 * Math.sin(t * 0.4 + i);
    const w = 0.7 + 0.2 * (i % 3);
    const ph = i * 2.4;
    const hx = main.x + Math.cos(th) * q.ro + 0.003 * Math.cos(t * w + ph);
    const hy = main.y + Math.sin(th) * q.ro + 0.003 * Math.sin(t * w + ph);
    // orbs rise from the bubble's edge rather than its centre, since they sit above it
    const e = mix(main.r / q.ro, 1, k);
    const [x, y] = toPx(g, mix(main.x, hx, e), mix(main.y, hy, e));
    out.push(x, y, (pr / ORB_PAD) * g.H, fill);
  }
  return out;
}

/* ---- the text layer ---- */

/* number and word: centred on the bubble (following its breath), fading and un-blurring in, pulsing with it */
export function scoreState(c: Cfg, t: number, pulse: number) {
  'worklet';
  const main = bubble(c, t);
  const [bx, by] = toPx(c.geo, main.x, main.y);
  const op = eOut(seg(t, 6.0, 6.9));
  return { bx, by, op, blur: (1 - op) * 8, scale: (0.92 + 0.08 * op) * (1 + pulse) };
}

/* one slot-machine column: how far its strip has run (in digits) and its motion blur.
   n = strip length - 1 = (2 + j) * 10 + digit */
export function slotState(t: number, j: number, n: number) {
  'worklet';
  const x = seg(t, 6.8 + j * 0.2, 8.1 + j * 0.45);
  const sp = Math.pow(1 - x, 3);
  return { off: (1 - sp * (1 - x)) * n, blur: sp > 0.02 ? Math.min(1.2, sp * 2) : 0 };
}

/* the status chip: arrives under the number, rising 6px, scaling from .96, un-blurring */
export function tagState(t: number) {
  'worklet';
  const p = eIO(seg(t, 8.7, 9.5));
  return { op: p, dy: (1 - p) * 6, scale: 0.96 + 0.04 * p, blur: p < 1 ? (1 - p) * 3 : 0 };
}

/* the 0 and 100 labels */
export function endsOpacity(c: Cfg, t: number) {
  'worklet';
  return eOut(seg(t, 7.0, 7.8)) * (c.lock ? 0.55 : 1);
}

/* step-up: the +n pill rises off the number and fades */
export function gainState(since: number) {
  'worklet';
  const gk = seg(since, 0.6, 2.4);
  return { op: Math.sin(Math.PI * gk), dy: -58 - 22 * eOut(gk) };
}

/* Still anchors for the chip and labels: the bubble's resting seat, snapped to whole pixels like the web
   (a 12px label nudged by fractions of a pixel every frame shimmers). */
export function anchors(g: Geo) {
  const seatY = Y1;
  const [tx, ty] = toPx(g, 0, seatY + Math.sin(ARC0) * 0.2 * g.SIZE - 0.019);
  const lo = toPx(g, Math.cos(ARC0) * 0.2 * g.SIZE, seatY + Math.sin(ARC0) * 0.2 * g.SIZE - 0.02).map(Math.round);
  const hi = toPx(g, Math.cos(ARC0 - SWEEP) * 0.2 * g.SIZE, seatY + Math.sin(ARC0 - SWEEP) * 0.2 * g.SIZE - 0.02).map(Math.round);
  return { tag: [tx, ty], lo, hi };
}

/* timings the component triggers from the UI thread */
export const LOCK_PLAY_AT = 6.1; // score clock: the padlock starts locking as the number would arrive
export const STEP_PULSE_AT = 0.5; // real seconds into step-up mode: one pulse as the number starts counting
