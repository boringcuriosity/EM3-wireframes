/* ============================================================
   KAIRA speaks: the Aurora intervention, on the Eat day view.
   Explored on /kaira-fab/ (variant "Aurora") and brought here.

   Curtains of indigo, violet and teal light rise from the top of the bottom
   nav, a white veil lifts behind the words so they read over the page, and
   "Log your whole day in a minute / with KAIRA" arrives word by word with
   three chevrons pointing into the FAB.

   When: once a session, a few seconds after the day has settled; and any time
   the FAB is tapped. It drains away on its own after a few seconds, or as soon
   as the page is scrolled. Tapping the words opens KAIRA's logger, the same
   as "Log with KAIRA" on a meal card.
   ============================================================ */
(function () {
  var fabHost = document.getElementById("kairaFab");
  if (!fabHost) return;
  var REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var Q = new URLSearchParams(location.search);
  var DELAY = 6000, HOLD = 7.2;

  var css = document.createElement("style");
  css.textContent = [
    ".kau{position:fixed;left:50%;top:0;width:100%;max-width:390px;transform:translateX(-50%);z-index:19;pointer-events:none;overflow:hidden;display:none}",
    ".kau canvas{position:absolute;left:0;top:0;width:100%}",
    ".kau .msg{position:absolute;left:24px;color:#101828;cursor:pointer;pointer-events:none;text-shadow:0 0 10px rgba(255,255,255,.75)}",
    ".kau .msg.live{pointer-events:auto}",
    ".kau .t{font:500 15px/20px Roboto,sans-serif;letter-spacing:.1px;white-space:nowrap}",
    ".kau .s{margin-top:2px;font:400 14px/18px Roboto,sans-serif;white-space:nowrap}",
    ".kau .s b{font-weight:500;letter-spacing:.04em;color:#444CE7}",
    ".kau .msg span{display:inline-block;will-change:transform,opacity,filter}",
    ".kau .cues{position:absolute;display:flex;gap:1px;color:#444CE7;opacity:0}",
    ".kau .cues svg{width:9px;height:14px;animation:kauCue 1.5s ease-in-out infinite}",
    ".kau .cues svg:nth-child(2){animation-delay:.17s}.kau .cues svg:nth-child(3){animation-delay:.34s}",
    "@keyframes kauCue{0%,100%{opacity:.25;transform:translateX(0)}40%{opacity:1;transform:translateX(2px)}}"
  ].join("");
  document.head.appendChild(css);

  var CHEV = '<svg viewBox="0 0 9 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 2l5 5-5 5"/></svg>';
  var host = document.createElement("div");
  host.className = "kau"; host.setAttribute("aria-live", "polite");
  host.innerHTML = '<canvas></canvas>' +
    '<div class="msg" role="button" tabindex="-1" aria-label="Log your whole day in a minute with KAIRA">' +
      '<div class="t">' + "Log your whole day in a minute".split(" ").map(function (w) { return "<span>" + w + "</span>"; }).join(" ") + "</div>" +
      '<div class="s"><span>with</span> <span><b>KAIRA</b></span></div></div>' +
    '<div class="cues" aria-hidden="true">' + CHEV + CHEV + CHEV + "</div>";
  document.body.appendChild(host);
  var cv = host.querySelector("canvas"), msg = host.querySelector(".msg"), cues = host.querySelector(".cues");
  var WORDS = [].slice.call(msg.querySelectorAll("span")).filter(function (s) { return !s.querySelector("span"); });

  var FS = [
    "precision mediump float;",
    "uniform vec2 uRes; uniform float uDpr, uTime, uK, uReach, uVeilY, uVeil, uRingR, uRingA; uniform vec2 uFab;",
    "float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x*p.y); }",
    "float noise(vec2 p){ vec2 i = floor(p), f = fract(p), u = f*f*(3. - 2.*f);",
    "  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }",
    "float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 4; i++) { v += a*noise(p); p = p*2.03 + 3.1; a *= .5; } return v; }",
    "vec4 over(vec4 o, vec3 c, float a){ return o*(1. - a) + vec4(c*a, a); }",
    "void main(){",
    "  vec2 p = vec2(gl_FragCoord.x, uRes.y*uDpr - gl_FragCoord.y)/uDpr;",
    "  vec4 o = vec4(0.);",
    /* the veil: a white fog from the bottom to just above the words */
    "  o = over(o, vec3(.98, .985, 1.), uVeil*smoothstep(uVeilY, uVeilY + 70., p.y)*.95);",
    /* one small ripple from the FAB as KAIRA draws breath */
    "  float lf = length(p - uFab);",
    "  o += vec4(vec3(.2, .7, .85)*uRingA*exp(-pow((lf - uRingR)/2.4, 2.))*.35, uRingA*exp(-pow((lf - uRingR)/2.4, 2.))*.35);",
    /* the aurora: curtains of light rising from the bottom edge */
    "  float y = (uRes.y - p.y)/max(uReach, 1.);",
    "  float band = fbm(vec2(p.x*.011 + uTime*.05, uTime*.08));",
    "  float streak = .55 + .45*sin(p.x*.05 + fbm(vec2(p.x*.02, uTime*.15))*6. + uTime*.7);",
    "  float k = pow(1. - smoothstep(0., 1., y), 1.6)*(.55 + .45*streak)*uK;",
    "  vec3 c = mix(vec3(.27, .3, .9), vec3(.52, .38, .96), smoothstep(.3, .7, band));",
    "  c = mix(c, vec3(.13, .7, .78), smoothstep(.45, .9, p.x/uRes.x + (band - .5)*.8));",
    "  o = over(o, c, k*.26);   // a lighter curtain, so it sits under the page rather than on it",
    "  gl_FragColor = o;",
    "}"
  ].join("\n");

  var gl = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return;
  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  var pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, "attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}"));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
  gl.bindAttribLocation(pr, 0, "a"); gl.linkProgram(pr); gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  var U = {};
  ["uRes", "uDpr", "uTime", "uK", "uReach", "uVeilY", "uVeil", "uRingR", "uRingA", "uFab"].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });

  var cl = function (x) { return Math.min(1, Math.max(0, x)); };
  var seg = function (t, a, b) { return cl((t - a) / (b - a)); };
  var eOut = function (x) { return 1 - Math.pow(1 - x, 3); };
  var eIO = function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

  var W = 0, H = 0, DPR = 1, talkAt = 0, endAt = 0, raf = 0, T0 = performance.now();
  function layout() {
    var nav = document.querySelector(".nav"), base = nav ? nav.getBoundingClientRect().top : innerHeight;
    var box = host.getBoundingClientRect();
    W = box.width; H = base; DPR = Math.min(devicePixelRatio || 1, 2);
    host.style.height = H + "px"; cv.style.height = H + "px";
    cv.width = W * DPR | 0; cv.height = H * DPR | 0; gl.viewport(0, 0, cv.width, cv.height);
    var f = fabHost.getBoundingClientRect();
    return { fx: f.left - box.left + f.width / 2, fy: f.top + f.height / 2, fr: f.width / 2 };
  }
  var L = null;

  function frame(now) {
    var T = (now - talkAt) / 1000, time = (now - T0) / 1000;
    var exit = endAt ? seg((now - endAt) / 1000, 0, 1) : seg(T, HOLD, HOLD + 1);
    if (exit >= 1) { stop(); return; }
    var k = eIO(seg(T, .3, 1.6)) * (1 - eIO(exit));
    var textY = L.fy - 20;
    // words arrive one at a time once the light is up, and leave together before it drains
    WORDS.forEach(function (w, i) {
      var a = eOut(seg(T, 1.05 + i * .065, 1.5 + i * .065)) * (1 - eIO(seg(exit, 0, .3)));
      w.style.opacity = a; w.style.filter = a < 1 ? "blur(" + (1 - a) * 6 + "px)" : ""; w.style.transform = "translateY(" + (1 - a) * 7 + "px)";
    });
    msg.style.top = textY + "px";
    msg.classList.toggle("live", T > 1 && !endAt && exit === 0);
    cues.style.left = (L.fx - L.fr - 36) + "px"; cues.style.top = (L.fy - 7) + "px";
    cues.style.opacity = eOut(seg(T, 1.7, 2.2)) * (1 - eIO(seg(exit, 0, .25)));
    var r = seg(T, 0, 1.1);
    gl.uniform2f(U.uRes, W, H); gl.uniform1f(U.uDpr, DPR); gl.uniform1f(U.uTime, time);
    gl.uniform1f(U.uK, k); gl.uniform1f(U.uReach, 250 * (.6 + .4 * k));
    gl.uniform1f(U.uVeilY, textY - 96);   /* high enough that whatever sits just above the words is quieted too */ gl.uniform1f(U.uVeil, eIO(seg(T, .15, .9)) * (1 - eIO(seg(exit, .35, 1))));
    gl.uniform1f(U.uRingR, L.fr + 28 * eOut(r)); gl.uniform1f(U.uRingA, T > 0 && r < 1 ? 1 - r : 0);
    gl.uniform2f(U.uFab, L.fx, L.fy);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
    // the FAB draws a small breath as it speaks
    fabHost.style.transform = "scale(" + (1 + .07 * Math.sin(Math.PI * seg(T, .15, .7))) + ")";
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    cancelAnimationFrame(raf); raf = 0; endAt = 0;
    host.style.display = "none"; fabHost.style.transform = "";
  }
  function talk() {
    if (REDUCED) return;
    if (document.querySelector(".sheet.open, .sheet.on, .scrim.on")) return;   // never over an open sheet
    host.style.display = "block"; L = layout();
    talkAt = performance.now(); endAt = 0;
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function hush() { if (raf && !endAt) endAt = performance.now(); }

  // tapping the FAB makes KAIRA speak; tapping the words opens her logger
  fabHost.addEventListener("click", talk);
  msg.addEventListener("click", function () {
    hush();
    var b = document.querySelector(".kairabtn");
    if (!b) { b = document.createElement("button"); b.className = "kairabtn"; b.hidden = true; document.body.appendChild(b); setTimeout(function () { b.remove(); }, 0); }
    b.click();
  });
  // scrolling away means not now
  addEventListener("scroll", function () { if (raf && (performance.now() - talkAt) > 400) hush(); }, { passive: true });
  addEventListener("resize", function () { if (raf) L = layout(); });

  // once a session, after the day has settled (?kaira=now plays it straight away, for reviewing)
  var said = false;
  try { said = sessionStorage.getItem("gfKairaSpoke") === "1"; } catch (e) {}
  if (Q.get("kaira") === "now") setTimeout(talk, 800);
  else if (!said) setTimeout(function () {
    if (window.scrollY > 200) return;   // they are busy lower down; the FAB is still there
    try { sessionStorage.setItem("gfKairaSpoke", "1"); } catch (e) {}
    talk();
  }, DELAY);
})();
