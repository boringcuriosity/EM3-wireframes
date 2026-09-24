// Portal — circular portal shader with particle streak layers.
// Plain-JS core so React/Vue/Svelte wrappers stay trivial.

const VERT = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2  uRes;
uniform float uTime;
uniform vec3  uPrimary;
uniform vec3  uSecondary;
uniform vec3  uCenter;
uniform vec4  uBall;
uniform float uSpeed, uDensity, uLayers, uWaveAmp, uWaveFreq;
uniform float uVert, uDepth, uBright, uScale;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}

float fbm(vec2 p){
  float a = 0.5, v = 0.0;
  for (int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

mat3 rotX(float a){ float s = sin(a), c = cos(a); return mat3(1,0,0, 0,c,-s, 0,s,c); }
mat3 rotZ(float a){ float s = sin(a), c = cos(a); return mat3(c,-s,0, s,c,0, 0,0,1); }

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / (0.5 * min(uRes.x, uRes.y));
  uv *= max(uScale, 0.001);

  float r = length(uv);
  float aa = 2.0 * max(uScale, 0.001) / min(uRes.x, uRes.y);
  float disc = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, r);
  if (disc <= 0.0){ outColor = uBall; return; }

  float z = sqrt(max(0.0, 1.0 - r * r));
  vec3 sp = rotZ(0.30) * vec3(uv, z);

  float lat = asin(clamp(sp.y, -1.0, 1.0));
  float lon = atan(sp.x, sp.z);
  float t   = uTime * uSpeed;

  float acc = 0.0, tint = 0.0, wsum = 0.0;

  for (int i = 0; i < 7; i++){
    if (float(i) >= uLayers) break;
    float fi = float(i);
    float depth = fi / max(uLayers - 1.0, 1.0);

    float lo = lon + t * (0.55 + depth * 0.25) + fi * 2.4;
    float la = lat;
    la += uWaveAmp * 0.09 * sin(lo * (uWaveFreq * 45.0) + t * 0.8 + fi);
    la += uVert * 0.14 * sin(lo * 1.7 - t * 0.5 + fi * 1.9);

    float n = fbm(vec2(lo * 1.6 + fi * 7.3, la * (16.0 * uDensity) - t * 0.15));
    float s = smoothstep(0.41, 0.78, n);

    // layers behind the front sit deeper in the tunnel
    float w = mix(1.0, 1.0 - depth, clamp(uDepth * 2.4, 0.0, 1.0));
    acc  += s * w;
    tint += n * w;
    wsum += w;
  }

  acc  /= max(wsum, 0.001);
  tint /= max(wsum, 0.001);

  // hollow, receding core
  acc *= smoothstep(0.0, 0.30 + uDepth * 0.35, r);
  // rim compression glow
  acc *= 0.85 + 1.7 * pow(1.0 - z, 1.5);
  acc = pow(clamp(acc, 0.0, 2.0), 1.15) * uBright * 3.2;

  vec3 col = mix(uPrimary, uSecondary, smoothstep(0.35, 0.75, tint));
  col = mix(col, uCenter, smoothstep(0.7, 1.3, acc));
  col += vec3(1.0) * smoothstep(1.15, 2.2, acc) * 0.6;

  float a = clamp(acc, 0.0, 1.0);
  vec3 rgb = col * acc + uBall.rgb * uBall.a * (1.0 - a);
  outColor = vec4(rgb, max(uBall.a, a)) * disc;
}`;

const hexToRgb = (h) => {
  const s = String(h).replace('#', '');
  const n = parseInt(s.length === 3 ? s.split('').map(c => c + c).join('') : s, 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
};

const parseBg = (c) => {
  if (!c || c === 'transparent') return [0, 0, 0, 0];
  const m = String(c).match(/rgba?\(([^)]+)\)/);
  if (m) { const v = m[1].split(',').map(Number); return [v[0] / 255, v[1] / 255, v[2] / 255, v.length > 3 ? v[3] : 1]; }
  return [...hexToRgb(c), 1];
};

export const PORTAL_DEFAULTS = {
  primaryColor: '#C084FC', secondaryColor: '#E879F9', centerColor: '#F0ABFC',
  ballBgColor: 'transparent', speed: 1.0, density: 1.0, layerCount: 7,
  waveAmplitude: 1.0, waveFrequency: 0.08, verticalDistortion: 0.2,
  depthIntensity: 0.2, brightness: 1.0, scale: 1.0,
};

export function createPortal(canvas, options = {}) {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false, antialias: true });
  if (!gl) return { setOptions() {}, dispose() {} };

  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (n) => gl.getUniformLocation(prog, n);
  const U = {
    res: u('uRes'), time: u('uTime'), primary: u('uPrimary'), secondary: u('uSecondary'),
    center: u('uCenter'), ball: u('uBall'), speed: u('uSpeed'), density: u('uDensity'),
    layers: u('uLayers'), waveAmp: u('uWaveAmp'), waveFreq: u('uWaveFreq'),
    vert: u('uVert'), depth: u('uDepth'), bright: u('uBright'), scale: u('uScale'),
  };

  let opts = { ...PORTAL_DEFAULTS, ...options };
  let raf = 0;
  const start = performance.now();

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  const frame = () => {
    resize();
    const bg = parseBg(opts.ballBgColor);
    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform1f(U.time, (performance.now() - start) / 1000);
    gl.uniform3fv(U.primary, hexToRgb(opts.primaryColor));
    gl.uniform3fv(U.secondary, hexToRgb(opts.secondaryColor));
    gl.uniform3fv(U.center, hexToRgb(opts.centerColor));
    gl.uniform4fv(U.ball, bg);
    gl.uniform1f(U.speed, opts.speed);
    gl.uniform1f(U.density, opts.density);
    gl.uniform1f(U.layers, Math.max(1, Math.min(7, Math.round(opts.layerCount))));
    gl.uniform1f(U.waveAmp, opts.waveAmplitude);
    gl.uniform1f(U.waveFreq, opts.waveFrequency);
    gl.uniform1f(U.vert, opts.verticalDistortion);
    gl.uniform1f(U.depth, opts.depthIntensity);
    gl.uniform1f(U.bright, opts.brightness);
    gl.uniform1f(U.scale, opts.scale);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return {
    setOptions(next) { opts = { ...opts, ...next }; },
    dispose() { cancelAnimationFrame(raf); gl.deleteProgram(prog); gl.deleteBuffer(buf); },
  };
}
