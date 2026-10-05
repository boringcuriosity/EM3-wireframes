/* The Rise timeline, ported line by line from v7/r3/assets/win-moment.js (rise(), content(), frame()).

   Every function here is a worklet: the frame callback in index.tsx runs them on the UI thread and the results go
   straight into animated props, so the animation never waits on React.

   Clocks, all in seconds, as on the web:
     t   since begin() (the button was pressed)
     w   since the payoff started (win() plus the 700ms minimum charge), or -1 before it
     ex  since the exit started (2.8s after the payoff), or -1 before it */

/* ---------------------------------------------------------------- easing (same names as the web) */
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
/* the disc's entrance: a back-out curve that peaks at 1.053 at x = .64 (the web's eBack) */
export const eBack = (x: number) => {
  'worklet';
  return 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
};
export const mix = (a: number, b: number, k: number) => {
  'worklet';
  return a + (b - a) * k;
};

/* ---------------------------------------------------------------- constants */
export const POOL_S = 0.9; // the pool wells up over 0.9s, to 36% of the screen
export const POOL_LEVEL = 0.36;
export const SURGE_S = 0.7; // the win sends it over the top in 0.7s, to 112%
export const BLOB_S = 0.5; // the button's green blob fades as it swells
export const MIN_CHARGE_S = 0.7; // never pay off before the charge has had a moment to read
export const CONTENT_AT = 0.45; // the content starts this long into the payoff
export const GAIN_BUZZ_AT = 0.5; // web: buzz(18) when w passes .5
export const EXIT_AFTER_S = 2.8; // rise: the exit starts 2.8s after the payoff
export const DRAIN_S = 0.6;
export const DONE_AT = 0.7; // done() fires 0.7s into the exit
export const TICK_DASH = 76; // stroke-dasharray / dashoffset of the tick (in viewBox units)
/* text entrances (data-in) and the count-up (data-at, default .1), in content seconds (w - .45) */
export const IN_N = 0.12;
export const IN_SAY = 0.3;
export const COUNT_AT = 0.1;

/* Android draws the wave a little coarser: 8px between points instead of the web's 6 (51 points against 68 on a
   402pt wide phone). The wave's shortest wavelength is 2π/.057 = 110px, so 8px still reads as a smooth curve. */
export type Geo = { W: number; H: number; Bx: number; By: number; Bw: number; Bh: number; Cx: number; Cy: number; step: number };

export function makeGeo(W: number, H: number, btn: { x: number; y: number; width: number; height: number }, step: number): Geo {
  return {
    W,
    H,
    // the button's centre and size, in the overlay's coordinates
    Bx: btn.x + btn.width / 2,
    By: btn.y + btn.height / 2,
    Bw: btn.width,
    Bh: btn.height,
    // where the burst centres: on the tick (layout B)
    Cx: W / 2,
    Cy: H / 2 - 88,
    step,
  };
}

/* ---------------------------------------------------------------- the liquid */
export type Liquid = { top: number; amp: number; surge: number; drain: number };

export function liquid(g: Geo, t: number, w: number, ex: number): Liquid {
  'worklet';
  // while saving the liquid wells out of the button and pools; the win sends it over the top
  const pool = eOut(seg(t, 0, POOL_S)) * POOL_LEVEL;
  const surge = w < 0 ? 0 : eIO(seg(w, 0, SURGE_S));
  const level = mix(pool, 1.12, surge);
  const drain = ex >= 0 ? eIO(seg(ex, 0, DRAIN_S)) : 0;
  const top = g.H - level * g.H + drain * (g.H * 1.15);
  const amp = 10 + 14 * Math.sin(Math.PI * surge);
  return { top, amp, surge, drain };
}

const f1 = (n: number) => {
  'worklet';
  return Math.round(n * 10) / 10;
};

/* The surface at x, with (fill) or without (edge line) the dip above the button, as the web draws them. */
function surfaceY(g: Geo, L: Liquid, t: number, px: number, dip: boolean) {
  'worklet';
  let y = L.top + Math.sin(px * 0.024 + t * 3.6) * L.amp + Math.sin(px * 0.057 - t * 2.4) * L.amp * 0.4;
  if (dip && Math.abs(px - g.Bx) < 70) y += -Math.cos(((px - g.Bx) / 70) * (Math.PI / 2)) * 18 * (1 - L.surge);
  return y;
}

/* The fill: from below the screen, along the surface, and back down. The fill's gradient is mapped onto
   top..H by the caller (see index.tsx), so the path is drawn in plain screen coordinates. */
export function fillPath(g: Geo, L: Liquid, t: number) {
  'worklet';
  let d = `M0 ${f1(g.H + 40)}`;
  let px = 0;
  for (; px <= g.W; px += g.step) d += `L${f1(px)} ${f1(surfaceY(g, L, t, px, true))}`;
  if (px - g.step < g.W) d += `L${f1(g.W)} ${f1(surfaceY(g, L, t, g.W, true))}`;
  return d + `L${f1(g.W)} ${f1(g.H + 40)}Z`;
}

/* The white edge line along the surface (no dip, as on the web). */
export function edgePath(g: Geo, L: Liquid, t: number) {
  'worklet';
  let d = '';
  let px = 0;
  for (; px <= g.W; px += g.step) d += `${px ? 'L' : 'M'}${f1(px)} ${f1(surfaceY(g, L, t, px, false))}`;
  if (px - g.step < g.W) d += `L${f1(g.W)} ${f1(surfaceY(g, L, t, g.W, false))}`;
  return d;
}

/* A circle as two arcs, so many circles fit in one path (one native view instead of one per circle). */
function circle(cx: number, cy: number, r: number) {
  'worklet';
  return `M${f1(cx - r)} ${f1(cy)}a${r} ${r} 0 1 0 ${f1(2 * r)} 0a${r} ${r} 0 1 0 ${f1(-2 * r)} 0`;
}

/* ---------------------------------------------------------------- bubbles: 40 rings rising under the surface */
export const BUBBLES = 40;
/* packed [x, sp, r, ph] per bubble, as the web's R(0,W), R(80,220), R(2,6), R(0,6.28) */
export function makeBubbles(W: number) {
  const R = (a: number, b: number) => a + Math.random() * (b - a);
  const out: number[] = [];
  for (let i = 0; i < BUBBLES; i++) out.push(R(0, W), R(80, 220), R(2, 6), R(0, 6.28));
  return out;
}

export function bubblesPath(g: Geo, L: Liquid, t: number, b: number[]) {
  'worklet';
  let d = '';
  for (let i = 0; i < b.length; i += 4) {
    const by = g.H - ((t * b[i + 1] + b[i + 3] * 60) % (g.H + 40));
    if (by < L.top + 8) continue;
    d += circle(b[i] + Math.sin(t * 2 + b[i + 3]) * 6, by, b[i + 2]);
  }
  return d || 'M0 0';
}

/* ---------------------------------------------------------------- the blob leaving the button */
export function blob(g: Geo, t: number) {
  'worklet';
  const bl = seg(t, 0, BLOB_S);
  if (bl >= 1) return { d: 'M0 0', op: 0 };
  const rx = (g.Bw / 2) * (1 + bl * 0.4);
  const ry = (g.Bh / 2) * (1 + bl * 2);
  const d = `M${f1(g.Bx - rx)} ${f1(g.By)}a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(2 * rx)} 0a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(-2 * rx)} 0`;
  return { d, op: 1 - bl };
}

/* ---------------------------------------------------------------- the food chips */
export const MAX_CHIPS = 4;
/* packed [x, del, drift] per chip: x = B.x + R(-60,60), del = j*.12, drift = R(-30,30) */
export function makeChips(Bx: number, n: number) {
  const R = (a: number, b: number) => a + Math.random() * (b - a);
  const out: number[] = [];
  for (let j = 0; j < Math.min(n, MAX_CHIPS); j++) out.push(Bx + R(-60, 60), j * 0.12, R(-30, 30));
  return out;
}

export function chipState(g: Geo, c: number[], j: number, w: number, drain: number) {
  'worklet';
  const x = c[j * 3];
  const del = c[j * 3 + 1];
  const drift = c[j * 3 + 2];
  const u = w < 0 ? 0 : seg(w, del, del + 0.9);
  const cy = mix(g.By - 30, g.Cy + 130 - j * 12, eOut(u));
  const a = u <= 0 ? 0 : 1 - seg(u, 0.75, 1);
  const cx = x + drift * u;
  const burst = seg(u, 0.75, 1);
  return { cx, cy, op: a * (1 - drain), scale: 1 + 0.15 * burst, u, burst };
}

/* 8 dots flying out from the chip as it bursts at the surface */
export function sparklePath(g: Geo, c: number[], j: number, w: number) {
  'worklet';
  const s = chipState(g, c, j, w, 0);
  if (!(s.u > 0.75 && s.u < 1)) return { d: 'M0 0', op: 0 };
  const rr = 40 * s.burst;
  let d = '';
  for (let k = 0; k < 8; k++) {
    const aa = (k / 8) * 6.28;
    d += circle(s.cx + Math.cos(aa) * rr, s.cy + 8 + Math.sin(aa) * rr, 2);
  }
  return { d, op: 1 - s.burst };
}

/* ---------------------------------------------------------------- the content (layout B) */
/* wl = w - .45: the tick lands first, then each line rises in on its own beat, and the number counts up */
export function contentOpacity(wl: number, ex: number) {
  'worklet';
  return (wl > 0 ? 1 : 0) * (ex >= 0 ? 1 - seg(ex, 0, 0.3) : 1);
}
export function discScale(wl: number) {
  'worklet';
  return wl < 0.3 ? eBack(seg(wl, 0, 0.3)) : 1;
}
export function tickOffset(wl: number) {
  'worklet';
  return TICK_DASH * (1 - eOut(seg(wl, 0.15, 0.4)));
}
export function dataIn(wl: number, at: number) {
  'worklet';
  const k = eOut(seg(wl, at, at + 0.45));
  return { op: k, dy: (1 - k) * 12 };
}
export function countUp(wl: number, to: number) {
  'worklet';
  return Math.round(to * eOut(seg(wl, COUNT_AT, COUNT_AT + 0.8)));
}

/* leave into white, the day view's own ground, so the logger never shows through on the way out */
export function whiteOpacity(ex: number) {
  'worklet';
  return ex >= 0 ? eIO(seg(ex, 0.05, 0.55)) : 0;
}
