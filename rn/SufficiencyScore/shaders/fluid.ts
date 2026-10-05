/* The Cloud Drop fluid: bloom, pour, bubble, glow, gauge ring and aura, as one SkSL runtime effect.

   Ported line by line from the main fragment shader in liquid-score/index.html (FS), embedded mode, with the
   Cloud Drop constants folded in:
     uLocal = 1 (the intro stays inside the gauge's own space), uGreenIn = 0, uGauge = 1, uTide = 0, uSeg = 0,
     uRingOn = 1, uQuad = 0, uPop = -10 (no taps, so the ripple term is ~1e-7 and dropped).
   The SDF union collapses to the bubble alone: with orbs on, the pearls' SDF radius is r*(1-orbMix) = 0, the
   macro drops are 0 and tap drops are unused. So scene() is one circle and its gradient is analytic.

   Coordinates: main(xy) gets dp, y down, in the fluid canvas. p is the web's shader space (origin at the centre,
   y up, 1 unit = height). uPx is one fluid pixel in those units (the web's 1/uRes.y).

   Output stays premultiplied, as embed mode writes it: the colour is split into ink and coverage over white
   (half4(col - m, 1 - m)), exact on a white page, and the round edge fade means the hero never shows a box.

   GLSL -> SkSL: vecN -> floatN, mat2 -> float2x2 (both column-major, so rot() keeps its meaning),
   pow(negative, 2.) -> z*z (pow of a negative base is undefined in SkSL as in GLSL). */

const F = (x: number) => (isFinite(x) ? +x : 1).toFixed(6);

export function fluidSource(SIZE: number): string {
  const S = SIZE / 0.75;
  const R0 = 0.112 * SIZE;
  const RING = 0.132 * SIZE;
  const ARC0 = 1.25 * Math.PI;
  const SWEEP = 1.5 * Math.PI;
  return `
uniform float2 uRes;
uniform float uPx;
uniform float uTime;
uniform float uRc;
uniform float uArm;
uniform float uVivid;
uniform float uSwirl;
uniform float uGlow;
uniform float uScale;
uniform float uFill;
uniform float uArcIn;
uniform float2 uEye;
uniform float uR;
uniform float3 uSA[6];
uniform float3 uSB[6];
uniform float3 uGlowC;
uniform float uGlowS;
uniform float uRim;
uniform float3 uEdge;
uniform float uEdgeAmt;
uniform float uLift;
uniform float uAura;

const float3 PAPER = float3(1.);
const float3 GA = float3(.196, .835, .514);
const float3 GB = float3(.012, .596, .333);
const float2 LIGHT = float2(-.55, .835);

float hash(float2 p) { p = fract(p*float2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x*p.y); }
float noise(float2 p) {
  float2 i = floor(p), f = fract(p), u = f*f*(3. - 2.*f);
  return mix(mix(hash(i), hash(i + float2(1., 0.)), u.x), mix(hash(i + float2(0., 1.)), hash(i + float2(1., 1.)), u.x), u.y);
}
float fbm(float2 p) {
  float v = 0., a = .5; float2x2 m = float2x2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) { v += a*noise(p); p = m*p + float2(3.1, 1.7); a *= .5; }
  return v;
}
float2x2 rot(float a) { float c = cos(a), s = sin(a); return float2x2(c, -s, s, c); }
float3 skyA(float h) {
  h = clamp(h, 0., 1.)*5.;
  float3 k = mix(uSA[0], uSA[1], smoothstep(0., 1., h));
  k = mix(k, uSA[2], smoothstep(1., 2., h));
  k = mix(k, uSA[3], smoothstep(2., 3., h));
  k = mix(k, uSA[4], smoothstep(3., 4., h));
  return mix(k, uSA[5], smoothstep(4., 5., h));
}
float3 skyB(float h) {
  h = clamp(h, 0., 1.)*5.;
  float3 k = mix(uSB[0], uSB[1], smoothstep(0., 1., h));
  k = mix(k, uSB[2], smoothstep(1., 2., h));
  k = mix(k, uSB[3], smoothstep(2., 3., h));
  k = mix(k, uSB[4], smoothstep(3., 4., h));
  return mix(k, uSB[5], smoothstep(4., 5., h));
}
// GoodFlip green along the gauge
float3 gauge(float u) { return mix(GA, GB, clamp(u, 0., 1.)); }

float3 fluid(float2 p) {
  float2 q = p - uEye;
  float r = length(q);
  // local: the twist and the texture are scaled to the drop, so it spirals rather than turning as a rigid disc
  float rl = r*(3.6/${F(S)});
  q = rot(uSwirl*(6.5*exp(-rl*3.2) + 1.1*exp(-rl*.9)))*q;
  q *= (1. + uSwirl*.55*exp(-rl*3.5))*(2.6/${F(S)});
  q += uEye;
  float t = uTime*.05;
  float2 w1 = float2(fbm(q*1.3 + float2(0., t)), fbm(q*1.3 + float2(5.2, 1.3) - t));
  float2 w2 = float2(fbm(q*1.5 + 2.2*w1 + float2(1.7, 9.2) + t*1.4), fbm(q*1.5 + 2.2*w1 + float2(8.3, 2.8) - t*.9));
  float f = fbm(q*1.2 + 2.*w2);
  float h = .5 - (q.y - uEye.y)*.95*(2.2/${F(S)}) + (f - .47)*1.2 + (w2.y - .47)*.4;
  h = mix(.52 + (h - .5)*.5, h, uVivid);   // soft middle of the sky while it opens
  float mv = clamp(.5 + .42*sin(uTime*.09) + (w2.x - .47)*1.8, 0., 1.);
  float3 col = mix(skyA(h), skyB(h), mv);
  col = mix(col, float3(.55, .90, .80), smoothstep(.58, .74, w1.y)*.3*(1. - abs(h - .5)));
  col += .06*smoothstep(.5, .85, f);
  return mix(mix(PAPER, col, .55), col, uVivid);
}

half4 main(float2 xy) {
  float2 p = float2(xy.x - .5*uRes.x, .5*uRes.y - xy.y)/uRes.y;
  float px = uPx;
  float2 q = p - uEye;
  float r = length(q), a = atan(q.y, q.x);
  float R0 = max(uR, .05);

  // white page with a faint, slowly breathing mint glow around the bubble
  float3 base = PAPER;
  float2 gw = float2(fbm(p*2.2 + uTime*.07), fbm(p*2.2 + 5. - uTime*.06)) - .47;
  float gr = length(q + gw*.14)/(R0*(1. + .04*sin(uTime*.8)));
  base = mix(base, uGlowC, exp(-pow(max(gr - 1., 0.)*.6, 1.5))*uGlowS*uGlow);

  // the coloured fluid: a drop of ink spreading on paper, then spiralling back into the bubble
  float ek = .3*${F(S)};
  float edge = uRc - r + uArm*.1*ek*sin(a*2. - r*(26./${F(S)}) + uTime*2.2) + (fbm(p*(7./${F(S)}) + uTime*.25) - .47)*.25*ek*(1. - uGlow*.9);
  float cm = smoothstep(0., .12*ek, edge);
  float3 col = base;
  if (cm > 0.) col = mix(base, fluid(p), cm) + float3(1., .9, .96)*.3*cm*(1. - cm);

  // gauge: coloured aura behind the filled orbs, then a thin ring (colour up to the score, grey after)
  float u = mod(${F(ARC0)} - a, 6.28318)/${F(SWEEP)};
  float onArc = step(u, 1.)*smoothstep(uArcIn + .01, uArcIn - .01, u);
  float done = smoothstep(uFill + .006, uFill - .006, u);
  float soft = smoothstep(uFill + .06, uFill - .06, u);
  float bz = (r - ${F(0.172 * SIZE)})/${F(0.04 * SIZE)};
  float band = exp(-bz*bz)*onArc;
  if (band > .002) {
    float3 tint = gauge(u);
    col = mix(col, mix(col, tint, .22), band*soft*uAura);
    col = mix(col, float3(.86, .87, .9), band*(1. - soft)*.35);
    float line = smoothstep(.0024 + px, .0024 - px, abs(r - ${F(RING)}))*onArc;
    col = mix(col, mix(float3(.74, .75, .79), tint*.95, done), line);
  }

  // the bubble: glass holding the settled liquid (scene() of the web, reduced to the one circle)
  if (uR >= 1e-4) {
    float R = uR;
    float d = length(q) - R*uScale;
    if (d < .08) {  // soft contact shadow so glass reads on white
      float ds = length(q + float2(-.004, .016)*${F(S)}) - R*uScale;
      col *= 1. - .06*uGlow*(1. - smoothstep(-.02, .035, ds))*smoothstep(-px, px, d);
    }
    if (d < 2.*px) {
      float2 g = q/max(length(q), 1e-6);
      float rr = clamp(1. + d/R, 0., 1.);
      float3 n = float3(g*rr, sqrt(max(0., 1. - rr*rr)));
      float2 off = -n.xy*R*1.3;
      // inside: the absorbed fluid, compressed and slowly churning, each channel refracted a little apart
      float2x2 ch = rot(uTime*.1);
      float2 s = q*3.*${F(R0)}/R;
      float3 inner = float3(fluid(uEye + ch*(s + off*2.)).r, fluid(uEye + ch*(s + off*2.2)).g, fluid(uEye + ch*(s + off*2.4)).b);
      inner = mix(inner, float3(.975, .99, .98), uLift*uGlow);   // the settled liquid pales to a whisper of colour
      float3 gc = inner*float3(1.02, 1.01, 1.05) + .02;
      float fres = pow(rr, 4.);
      float3 ir = .5 + .5*cos(6.2831*(float3(0., .33, .67) + rr*1.3 + p.y*1.2 + uTime*.06));
      ir = mix(ir, mix(float3(.67, .9, .8), float3(.35, .75, .56), .5 + .5*sin(rr*6. + uTime*.4)), uRim*.8);   // green-leaning sheen
      gc = mix(gc, ir*.85 + .15, fres*.28) + fres*.22;
      float3 L = normalize(float3(LIGHT, .12));
      float nh = max(dot(n, normalize(L + float3(0., 0., 1.))), 0.);
      gc += pow(nh, 160.)*1.3 + pow(nh, 9.)*.07;
      gc += pow(max(dot(n, normalize(float3(-LIGHT*.9, .5) + float3(0., 0., 1.))), 0.), 40.)*.18;
      gc = mix(gc, uEdge, fres*uEdgeAmt*1.4);
      gc = mix(gc, mix(float3(1.), uEdge*.9, uEdgeAmt*1.6), smoothstep(-2.5*px, 0., d)*.5);
      col = mix(col, gc, smoothstep(px, -px, d));
    }
  }
  // a round fade around the bubble, so the hero never shows a box
  col = mix(PAPER, col, 1. - smoothstep(.34, .49, r));
  col = clamp(col, 0., 1.);
  // ink and coverage over white
  float m = min(min(col.r, col.g), col.b);
  return half4(half3(col - m), half(1. - m));
}
`;
}
