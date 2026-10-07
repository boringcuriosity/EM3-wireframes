/* Living Orb: a glass sphere with green liquid rising to the score.
   Raw WebGL1 fragment shader, analytic sphere (no mesh), transparent canvas.
   The number sits inside the liquid, where white always reads. */
(function () {
  window.HEROES = window.HEROES || {};

  var VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";

  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes; uniform float uTime; uniform float uLevel;",
    "uniform vec2 uCenter; uniform float uRadius;",
    "vec3 hex(float r,float g,float b){ return vec3(r,g,b)/255.0; }",
    "float hash(float n){ return fract(sin(n) * 43758.5453); }",
    "void main(){",
    "  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);",
    "  vec2 p = (frag - uCenter) / uRadius; p.y = -p.y;",
    "  float r = length(p);",
    "  float px = 1.5 / uRadius;",
    "  float edge = smoothstep(1.0, 1.0 - px, r);",
    "  if (edge <= 0.0) { gl_FragColor = vec4(0.0); return; }",
    "  vec3 n = normalize(vec3(p, sqrt(max(1.0 - dot(p,p), 0.0))));",
    "  float t = uTime;",
    "  vec3 B25 = hex(250.,255.,253.), B50 = hex(243.,252.,248.), B100 = hex(230.,250.,241.), B200 = hex(203.,240.,224.);",
    "  vec3 B300 = hex(171.,230.,204.), B400 = hex(121.,204.,168.), B500 = hex(89.,179.,140.);",
    "  vec3 B600 = hex(41.,157.,107.), B700 = hex(42.,128.,90.), B800 = hex(36.,102.,73.), B900 = hex(29.,77.,56.);",
    "  float a = t * 0.52;",
    "  vec3 L = normalize(vec3(-0.55 + 0.16*sin(a), 0.62 + 0.10*cos(a*0.8), 0.78));",
    "  float fres = pow(1.0 - n.z, 2.0);",

    // glass shell: clear centre, iridescent mint/white film at the rim
    "  float ang = atan(p.y, p.x);",
    "  float film = 0.5 + 0.5 * sin(8.0 * fres + ang * 1.6 + t * 0.32);",
    "  vec3 rim = mix(B300, vec3(1.0), film);",
    "  rim = mix(rim, B400, 0.30 * (1.0 - film) * smoothstep(0.3, 0.9, fres));",
    "  vec3 glass = mix(B25, rim, smoothstep(0.05, 0.9, fres));",
    "  float glassA = 0.07 + 0.78 * fres;",
    "  float veil = smoothstep(0.2, 0.9, p.y) * (0.5 + 0.5 * sin(p.x * 2.4 + t * 0.25));",
    "  glass = mix(glass, B100, veil * 0.35); glassA = max(glassA, veil * 0.10);",

    // back wall catches a faint green reflection of the liquid
    "  float backGlow = smoothstep(0.9, 0.0, length(p - vec2(0.0, 0.25))) * uLevel;",
    "  glass = mix(glass, B200, backGlow * 0.45); glassA = max(glassA, backGlow * 0.22);",

    // liquid volume, refracted by the shell
    "  vec2 q = p - n.xy * 0.05;",
    "  float inner = 0.91;",
    "  float lvl = step(0.001, uLevel);",
    "  float wave = 0.022 * sin(q.x * 3.1 + t * 0.78) + 0.012 * sin(q.x * 5.7 - t * 0.55 + 1.3);",
    "  float surfY = -inner + 2.0 * inner * uLevel;",
    "  float halfW = sqrt(max(inner*inner - surfY*surfY, 0.0));",
    "  float eh = max(0.11 * halfW, 0.001);",
    "  float ql = length(q);",
    "  float innerMask = smoothstep(inner + px, inner - px, ql) * smoothstep(0.965, 0.90, r);",
    // body below the front edge of the surface ellipse
    "  float frontY = surfY + wave - eh * sqrt(max(1.0 - pow(q.x / max(halfW,0.001), 2.0), 0.0));",
    "  float body = smoothstep(frontY + px, frontY - px, q.y) * innerMask * lvl;",
    // the surface itself: an ellipse seen from slightly above
    "  vec2 ev = vec2(q.x / max(halfW,0.001), (q.y - surfY - wave) / eh);",
    "  float ed = length(ev);",
    "  float surf = smoothstep(1.0 + 0.04, 1.0 - 0.04, ed) * lvl * step(q.y, surfY + wave + eh) * innerMask;",
    "  float depth = clamp((surfY - q.y) / (surfY + inner + 0.001), 0.0, 1.0);",
    "  vec3 liq = mix(B400, B600, smoothstep(0.0, 0.5, depth));",
    "  liq = mix(liq, B800, smoothstep(0.5, 1.05, depth));",
    "  float core = exp(-3.0 * length(q - vec2(0.0, -0.40))) * (0.55 + 0.07 * sin(t * 0.9));",
    "  liq = mix(liq, B300, core * 0.42);",
    "  liq *= 0.84 + 0.16 * n.z;",
    // bubbles drifting up through the liquid
    "  float bub = 0.0;",
    "  for (int i = 0; i < 7; i++) {",
    "    float fi = float(i);",
    "    float sp = 0.05 + 0.04 * hash(fi * 3.1);",
    "    float ph = fract(t * sp + hash(fi * 7.7));",
    "    float by = mix(-inner * 0.85, surfY - 0.04, ph);",
    "    float bx = (hash(fi * 1.9) - 0.5) * 1.1 + 0.03 * sin(t * 0.7 + fi);",
    "    float br = 0.012 + 0.018 * hash(fi * 5.3);",
    "    float d = length(q - vec2(bx, by));",
    "    bub += smoothstep(br, br - px*1.2, d) * (1.0 - smoothstep(br*0.35, br, d) * 0.55) * smoothstep(1.0, 0.85, ph);",
    "  }",
    "  liq = mix(liq, B100, clamp(bub, 0.0, 1.0) * body * 0.6);",
    "  vec3 surfCol = mix(B200, B300, smoothstep(-1.0, 1.0, ev.y));",
    "  surfCol = mix(surfCol, vec3(1.0), smoothstep(0.75, 1.0, ed) * 0.55);",

    "  vec3 col = glass; float alpha = glassA;",
    "  col = mix(col, liq, body); alpha = mix(alpha, 0.97, body);",
    "  col = mix(col, surfCol, surf); alpha = mix(alpha, 0.93, surf);",
    // liquid tints the lower rim, then the rim glass sits over everything
    "  float lowRim = smoothstep(0.62, 1.0, r) * smoothstep(0.1, -0.9, p.y) * uLevel;",
    "  col = mix(col, B500, lowRim * 0.30);",
    "  col = mix(col, rim, smoothstep(0.84, 1.0, r) * 0.6); alpha = max(alpha, smoothstep(0.84, 1.0, r) * 0.7);",

    // specular: a curved window highlight and a crisp point
    "  vec2 hp = p - vec2(-0.40, 0.42);",
    "  float cres = smoothstep(0.86, 0.80, r) * smoothstep(0.62, 0.74, length(p - vec2(0.10, -0.12)));",
    "  float arc = cres * smoothstep(0.0, 0.5, p.y - p.x * 0.35) * (1.0 - clamp(body + surf, 0.0, 1.0));",
    "  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));",
    "  float spec = pow(max(dot(n, H), 0.0), 90.0);",
    "  float sheen = pow(max(dot(n, L), 0.0), 8.0) * (1.0 - body * 0.7);",
    "  col += vec3(1.0) * (spec * 1.0 + sheen * 0.12 + arc * 0.42);",
    "  alpha = max(alpha, clamp(spec + arc * 0.6, 0.0, 1.0));",
    "  float ring = smoothstep(0.972, 0.992, r);",
    "  col = mix(col, vec3(1.0), ring * 0.45); alpha = max(alpha, ring * 0.65);",
    "  col = clamp(col, 0.0, 1.0);",
    "  alpha = clamp(alpha, 0.0, 1.0) * edge;",
    "  gl_FragColor = vec4(col * alpha, alpha);",
    "}"
  ].join("\n");

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  window.HEROES.orb = function (el, opts) {
    var score = (opts && opts.score) || 0;
    var W = 342, H = 320, R = 112, CX = W / 2, CY = 146;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    el.innerHTML = "";
    el.style.position = "relative";

    // page-side atmosphere: a soft brand glow behind and a contact shadow below
    var glow = document.createElement("div");
    glow.style.cssText = "position:absolute;left:" + (CX - 170) + "px;top:" + (CY - 150) + "px;width:340px;height:300px;" +
      "background:radial-gradient(closest-side, rgba(203,240,224,0.75), rgba(230,250,241,0.45) 55%, rgba(252,252,253,0) 100%);pointer-events:none;";
    var shadow = document.createElement("div");
    shadow.style.cssText = "position:absolute;left:" + (CX - 92) + "px;top:" + (CY + R + 8) + "px;width:184px;height:26px;border-radius:50%;" +
      "background:radial-gradient(closest-side, rgba(29,77,56,0.26), rgba(41,157,107,0.10) 55%, rgba(41,157,107,0) 100%);pointer-events:none;";
    el.appendChild(glow);
    el.appendChild(shadow);

    var canvas = document.createElement("canvas");
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.cssText = "position:absolute;left:0;top:0;width:" + W + "px;height:" + H + "px;";
    el.appendChild(canvas);

    // the number, inside the liquid body
    var label = document.createElement("div");
    label.style.cssText = "position:absolute;left:0;right:0;top:" + (CY + 10) + "px;display:flex;flex-direction:column;align-items:center;pointer-events:none;" +
      "color:#FFFFFF;text-shadow:0 1px 14px rgba(29,77,56,0.55), 0 1px 2px rgba(29,77,56,0.35);";
    label.innerHTML =
      '<div style="display:flex;align-items:flex-start;line-height:1;">' +
        '<span class="orb-num" style="font-family:\'Playfair Display\',Georgia,serif;font-weight:600;font-size:54px;letter-spacing:-1px;">0</span>' +
        '<span style="font-family:Roboto,sans-serif;font-weight:600;font-size:22px;margin:9px 0 0 1px;opacity:0.92;">%</span>' +
      '</div>' +
      '<div style="font-family:Roboto,sans-serif;font-weight:700;font-size:10px;letter-spacing:2px;margin-top:6px;opacity:0.95;">SUFFICIENT</div>';
    el.appendChild(label);
    var numEl = label.querySelector(".orb-num");

    var gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: true });
    var raf = 0, disposed = false;

    if (!gl) {
      // no WebGL: a still CSS orb so the page never shows a hole
      var fb = document.createElement("div");
      fb.style.cssText = "position:absolute;left:" + (CX - R) + "px;top:" + (CY - R) + "px;width:" + 2 * R + "px;height:" + 2 * R + "px;border-radius:50%;" +
        "background:linear-gradient(to top,#246649 0%,#299D6B " + score * 0.6 + "%,#79CCA8 " + score + "%,rgba(230,250,241,0.6) " + score + "%);" +
        "box-shadow:inset 0 0 0 2px rgba(255,255,255,0.7), inset -20px -30px 60px rgba(29,77,56,0.25);";
      el.insertBefore(fb, label);
      numEl.textContent = score;
      return { dispose: function () {} };
    }

    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var u = {
      res: gl.getUniformLocation(prog, "uRes"),
      time: gl.getUniformLocation(prog, "uTime"),
      level: gl.getUniformLocation(prog, "uLevel"),
      center: gl.getUniformLocation(prog, "uCenter"),
      radius: gl.getUniformLocation(prog, "uRadius")
    };
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.res, canvas.width, canvas.height);
    gl.uniform2f(u.center, CX * dpr, CY * dpr);
    gl.uniform1f(u.radius, R * dpr);
    gl.clearColor(0, 0, 0, 0);

    function draw(time, level) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(u.time, time);
      gl.uniform1f(u.level, level);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    var target = score / 100;
    if (reduce) {
      numEl.textContent = score;
      draw(0, target);
      return { dispose: function () { var ext = gl.getExtension("WEBGL_lose_context"); if (ext) ext.loseContext(); } };
    }

    var start = performance.now();
    var DUR = 1200;
    function frame(now) {
      if (disposed) return;
      var k = Math.min((now - start) / DUR, 1);
      var e = 1 - Math.pow(1 - k, 3);
      numEl.textContent = Math.round(score * e);
      draw((now - start) / 1000, target * e);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return {
      dispose: function () {
        disposed = true;
        cancelAnimationFrame(raf);
        var ext = gl.getExtension("WEBGL_lose_context");
        if (ext) ext.loseContext();
      }
    };
  };
})();
