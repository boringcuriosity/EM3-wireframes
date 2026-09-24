/* Merge: four nutrient blobs drift in from the rim and fuse into one glossy
   core whose AREA is the score. The dashed ring is the whole day (100%), the
   solid mint ring is where 54% of that area ends, so the gap between them is
   what is still to come.

   Own metaball shader rather than Paper's Metaballs: Paper's balls wander on
   their own clock, and this needs the core to land on an exact radius. */
(function () {
  window.HEROES = window.HEROES || {};

  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes;",
    "uniform vec3 uB[8];",
    "uniform float uDpr;",
    "uniform float uScale;",
    "float field(vec2 p){",
    "  float s = 0.0;",
    "  for (int i = 0; i < 8; i++) {",
    "    vec3 b = uB[i];",
    "    if (b.z <= 0.0) continue;",
    "    vec2 d = p - b.xy;",
    "    s += b.z * b.z / (dot(d, d) + 1.0);",
    "  }",
    "  return s;",
    "}",
    "void main(){",
    "  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);",
    "  float f = field(p);",
    "  if (f < 0.35) { gl_FragColor = vec4(0.0); return; }",
    "  float h  = sqrt(max(1.0 - 1.0 / f, 0.0));",
    "  float hx = sqrt(max(1.0 - 1.0 / field(p + vec2(1.0, 0.0)), 0.0));",
    "  float hy = sqrt(max(1.0 - 1.0 / field(p + vec2(0.0, 1.0)), 0.0));",
    "  vec2 g = vec2(field(p + vec2(1.0, 0.0)) - f, field(p + vec2(0.0, 1.0)) - f);",
    "  float gl = max(length(g), 1e-5);",
    "  float alpha = clamp((f - 1.0) / gl + 0.5, 0.0, 1.0);",
    "  vec3 n = normalize(vec3(-(hx - h) * uScale, -(hy - h) * uScale, 1.0));",
    "  vec3 L = normalize(vec3(-0.6, -0.78, 0.45));",
    "  float diff = max(dot(n, L), 0.0);",
    "  float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 36.0);",
    "  float rim = pow(1.0 - n.z, 1.6);",
    "  vec3 deep = vec3(0.114, 0.302, 0.220);",   // #1D4D38
    "  vec3 mid  = vec3(0.161, 0.616, 0.420);",   // #299D6B
    "  vec3 lite = vec3(0.475, 0.800, 0.659);",   // #79CCA8
    "  vec3 mint = vec3(0.796, 0.941, 0.878);",   // #CBF0E0
    "  vec3 col = mix(deep, mid, smoothstep(0.05, 0.75, diff));",
    "  col = mix(col, lite, smoothstep(0.75, 1.0, diff) * 0.6);",
    "  col += mint * rim * 0.35;",
    "  col = mix(col, vec3(1.0), spec * 0.9);",
    "  gl_FragColor = vec4(col * alpha, alpha);",
    "}"
  ].join("\n");

  var VERT = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }";

  window.HEROES.merge = function (el, opts) {
    var score = (opts && opts.score) || 54;
    var W = 342, H = 320, CX = 171, CY = 160;
    var R = 125;                                   // 100% boundary
    var RC = R * Math.sqrt(score / 100);           // core radius: area = score
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var raf = 0, disposed = false;

    el.style.position = "relative";
    el.innerHTML = "";

    // soft glow under everything
    var glow = document.createElement("div");
    glow.style.cssText = "position:absolute;left:" + (CX - 150) + "px;top:" + (CY - 150) + "px;width:300px;height:300px;border-radius:50%;" +
      "background:radial-gradient(closest-side, rgba(203,240,224,0.7), rgba(230,250,241,0.35) 55%, rgba(252,252,253,0) 100%);pointer-events:none;";
    el.appendChild(glow);

    var canvas = document.createElement("canvas");
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.cssText = "position:absolute;left:0;top:0;width:" + W + "px;height:" + H + "px;";
    el.appendChild(canvas);

    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", W); svg.setAttribute("height", H);
    svg.style.cssText = "position:absolute;left:0;top:0;pointer-events:none;overflow:visible;";
    svg.innerHTML =
      '<circle cx="' + CX + '" cy="' + CY + '" r="' + R + '" fill="none" stroke="#D0D5DD" stroke-width="1.5" stroke-dasharray="3 5" stroke-linecap="round"/>' +
      '<circle id="ring54" cx="' + CX + '" cy="' + CY + '" r="' + (RC + 5) + '" fill="none" stroke="#CBF0E0" stroke-width="1.5" opacity="0"/>' +
      '<text x="' + (CX + R * 0.74) + '" y="' + (CY - R * 0.74 - 6) + '" font-family="Roboto, sans-serif" font-size="10" font-weight="500" fill="#98A2B3" letter-spacing="0.5">100%</text>';
    el.appendChild(svg);
    var ring54 = svg.querySelector("#ring54");

    var label = document.createElement("div");
    label.style.cssText = "position:absolute;left:" + (CX - 80) + "px;top:" + (CY - 40) + "px;width:160px;height:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;transition:color .5s ease;color:#1D4D38;";
    label.innerHTML =
      '<div style="display:flex;align-items:flex-start;line-height:1;"><span class="n" style="font-family:\'Playfair Display\',Georgia,serif;font-weight:600;font-size:52px;letter-spacing:-1px;">0</span>' +
      '<span style="font-family:\'Playfair Display\',Georgia,serif;font-weight:600;font-size:20px;margin-top:6px;margin-left:2px;">%</span></div>' +
      '<div style="font-family:Roboto,sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;margin-top:6px;opacity:.9;">SUFFICIENT</div>';
    el.appendChild(label);
    var num = label.querySelector(".n");

    var gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });

    // No WebGL: a still, honest version of the same picture.
    if (!gl) {
      var c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", CX); c.setAttribute("cy", CY); c.setAttribute("r", RC);
      c.setAttribute("fill", "#299D6B");
      svg.insertBefore(c, svg.firstChild);
      ring54.setAttribute("opacity", "1");
      num.textContent = score; label.style.color = "#fff";
      return { dispose: function () {} };
    }

    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s;
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uRes = gl.getUniformLocation(prog, "uRes");
    var uB = gl.getUniformLocation(prog, "uB");
    var uDpr = gl.getUniformLocation(prog, "uDpr");
    var uScale = gl.getUniformLocation(prog, "uScale");
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uDpr, dpr);
    gl.uniform1f(uScale, RC * dpr);
    gl.clearColor(0, 0, 0, 0);

    var balls = new Float32Array(24);
    function set(i, x, y, r) {
      balls[i * 3] = x * dpr; balls[i * 3 + 1] = y * dpr; balls[i * 3 + 2] = Math.max(r, 0) * dpr;
    }
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

    var ARRIVE = 0.9, MERGE = 1.25;                // seconds
    var starts = [-0.8, 0.75, 2.35, 3.9];           // four nutrients, from the rim

    function frame(t) {
      // intro progress
      var a = clamp(t / ARRIVE);                   // blobs drift in
      var m = clamp((t - 0.35) / (MERGE - 0.35));  // core grows, blobs dissolve into it
      var me = easeInOut(m);
      var breathe = t > MERGE ? Math.sin((t - MERGE) * (Math.PI * 2 / 5)) * 1.4 : 0;
      var core = 18 + (RC - 18) * me + breathe;
      set(0, CX, CY, core);

      for (var i = 0; i < 4; i++) {
        var ang = starts[i];
        var dist = (R * 0.86) * (1 - easeOut(a) * 0.55) * (1 - me);
        var rad = (24 - i * 1.5) * (1 - Math.pow(me, 1.4));
        set(1 + i, CX + Math.cos(ang) * dist, CY + Math.sin(ang) * dist, rad);
      }

      // satellites fade in after the merge and orbit slowly in the 46% still to come
      var s = clamp((t - MERGE) / 0.8);
      var orbit = [
        { d: RC + 19, r: 4.8, w: 2 * Math.PI / 16, p: 0.6 },
        { d: RC + 22, r: 4, w: -2 * Math.PI / 22, p: 2.8 },
        { d: RC + 16, r: 3.4, w: 2 * Math.PI / 28, p: 4.4 }
      ];
      for (var k = 0; k < 3; k++) {
        var o = orbit[k], an = o.p + o.w * Math.max(t - MERGE, 0);
        set(5 + k, CX + Math.cos(an) * o.d, CY + Math.sin(an) * o.d, o.r * easeOut(s));
      }

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform3fv(uB, balls);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      var cnt = clamp(t / 1.2);
      num.textContent = Math.round(score * easeOut(cnt));
      label.style.color = core > 44 ? "#FFFFFF" : "#1D4D38";
      ring54.setAttribute("opacity", String(0.35 + 0.65 * clamp((t - 0.9) / 0.5)));
    }

    if (reduce) {
      frame(MERGE + 1.2);                          // settled state, satellites visible
      return { dispose: function () { var e = gl.getExtension("WEBGL_lose_context"); if (e) e.loseContext(); } };
    }

    var t0 = performance.now();
    function loop(now) {
      if (disposed) return;
      frame((now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return {
      dispose: function () {
        disposed = true;
        cancelAnimationFrame(raf);
        var e = gl.getExtension("WEBGL_lose_context");
        if (e) e.loseContext();
      }
    };
  };
})();
