/* Vortex: a portal of swirling green energy. A thick ring of log-spiral fbm
   arms spins inward, but only the first 54% of the circumference (clockwise
   from 12 o'clock) is charged; the rest stays a calm, faint track. A bright
   leading edge marks the score, sparks are pulled toward a mint-white eye
   that holds the number. Sibling of the Portal, raw WebGL2. */
(function () {
  var VERT = "#version 300 es\nin vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";

  var FRAG = [
    "#version 300 es",
    "precision highp float;",
    "out vec4 outColor;",
    "uniform vec2 uRes; uniform float uTime; uniform float uProg; uniform float uIntro;",
    "uniform vec3 uDeep; uniform vec3 uPrimary; uniform vec3 uSecondary; uniform vec3 uMint; uniform vec3 uTrack;",
    "const float TAU = 6.2831853;",
    "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }",
    "float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);",
    "  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }",
    "float fbm(vec2 p){ float a = 0.5, v = 0.0; for (int i = 0; i < 5; i++){ v += a*noise(p); p = p*2.02 + 11.7; a *= 0.5; } return v; }",
    "vec4 over(vec4 top, vec4 bot){ float a = top.a + bot.a*(1.0-top.a); vec3 c = (top.rgb*top.a + bot.rgb*bot.a*(1.0-top.a)) / max(a, 1e-4); return vec4(c, a); }",
    "void main(){",
    "  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / (0.5*min(uRes.x, uRes.y));",
    "  uv *= 1.18;",
    "  float r = length(uv);",
    "  float px = 2.4 / min(uRes.x, uRes.y);",
    "  float ang = atan(uv.x, uv.y);",                       // 0 at 12 o'clock, clockwise positive
    "  float fr = ang < 0.0 ? ang/TAU + 1.0 : ang/TAU;",
    "  float t = uTime;",
    // charged arc mask, soft at both ends
    "  float charged = uProg > 0.001 ? (1.0 - smoothstep(uProg - 0.05, uProg + 0.012, fr)) * smoothstep(0.0, 0.04, fr) : 0.0;",
    "  float litHard = uProg > 0.001 ? 1.0 - smoothstep(uProg - 0.003, uProg + 0.003, fr) : 0.0;",
    // ring band geometry
    "  const float RC = 0.80; const float RW = 0.20;",
    "  float bw = r < RC ? RW*1.9 : RW*0.85;",
    "  float band = exp(-pow((r - RC) / bw, 2.0)) * smoothstep(0.34, 0.55, r);",
    "  float bandCore = exp(-pow((r - RC) / (RW*0.55), 2.0));",
    "  vec4 acc = vec4(0.0);",
    // soft outer halo, stronger on the charged arc
    "  float halo = exp(-pow((r - RC) / 0.2, 2.0)) * (1.0 - smoothstep(0.98, 1.12, r));",
    "  acc = over(vec4(uMint, halo * uIntro * mix(0.06, 0.42, charged)), acc);",
    // the swirl: log-spiral coordinates, arms twisting inward and spinning
    "  float lr = log(max(r, 0.05));",
    "  float spin = t * 0.55;",
    // twist the direction vector instead of feeding raw angle to noise, so there is no seam at 6 o'clock
    "  float tw = lr*5.5 - spin; float cs = cos(tw), sn = sin(tw);",
    "  vec2 dir = mat2(cs, -sn, sn, cs) * (uv / max(r, 0.2));",
    "  float n1 = fbm(dir*2.6 + vec2(0.0, lr*5.0 - t*0.9));",
    "  float n2 = fbm(dir*5.2 + n1*1.6 + vec2(lr*2.3 - t*0.4, 3.1));",
    "  float arms = smoothstep(0.38, 0.80, 0.55*n1 + 0.65*n2);",
    "  float streak = pow(max(0.0, sin((ang*6.0 + lr*15.0 - spin*2.4) + n1*3.0)*0.5 + 0.5), 5.0);",
    "  float energy = band * (0.55*arms + 0.45*streak*arms*1.6) + bandCore*0.18;",
    "  energy *= mix(0.10, 1.0, charged) * uIntro;",
    "  vec3 col = mix(uSecondary, uPrimary, smoothstep(0.15, 0.55, energy));",
    "  col = mix(col, uDeep, smoothstep(0.55, 1.05, energy));",
    "  col = mix(col, uSecondary, smoothstep(0.95, 1.4, energy) * 0.45);",
    "  float ea = smoothstep(0.04, 0.55, energy);",
    // calm track body where uncharged: faint gray-mint ring
    "  float trackBody = exp(-pow((r - RC) / (RW*0.75), 2.0)) * (1.0 - charged) * 0.34 * uIntro;",
    "  acc = over(vec4(uTrack, trackBody), acc);",
    "  acc = over(vec4(col, ea), acc);",
    // leading edge: a bright crescent where the charged arc ends
    "  if (uProg > 0.001) {",
    "    float da = fr - uProg; da -= floor(da + 0.5);",       // wrapped angular distance
    "    float trail = da < 0.0 ? exp(da / 0.07) : exp(-pow(da / 0.01, 2.0));",
    "    float edge = trail * exp(-pow((r - RC) / (RW*0.7), 2.0));",
    "    acc = over(vec4(mix(uMint, vec3(1.0), 0.5), edge * 0.7 * uIntro), acc);",
    "    float ha = uProg * TAU; vec2 hp = RC * vec2(sin(ha), cos(ha));",
    "    float d = length(uv - hp);",
    "    acc = over(vec4(uMint, (1.0 - smoothstep(0.03, 0.2, d)) * 0.9 * uIntro), acc);",
    "    acc = over(vec4(1.0, 1.0, 1.0, (1.0 - smoothstep(0.026 - px, 0.046 + px, d)) * uIntro), acc);",
    "  }",
    // sparks pulled from the charged arc toward the eye
    "  for (int i = 0; i < 28; i++){",
    "    float fi = float(i);",
    "    float h1 = hash(vec2(fi, 3.1)), h2 = hash(vec2(fi, 7.7)), h3 = hash(vec2(fi, 1.3));",
    "    float life = fract(t * (0.10 + 0.08*h2) + h1);",
    "    float sa = h3 * max(uProg, 0.0001);",                // born inside the charged arc
    "    float sr = mix(RC + 0.12, 0.50, pow(life, 1.35));",
    "    float a2 = (sa + life*0.22) * TAU;",                // curls clockwise as it falls in
    "    vec2 sp = sr * vec2(sin(a2), cos(a2));",
    "    float sd = length(uv - sp);",
    "    float fade = sin(life*3.14159) * (uProg > 0.001 ? 1.0 : 0.0);",
    "    float dotA = (1.0 - smoothstep(0.004, 0.018 + 0.01*h2, sd)) * fade * 0.85 * uIntro;",
    "    acc = over(vec4(mix(uPrimary, vec3(1.0), 0.35 + 0.4*h1), dotA), acc);",
    "  }",
    // the calm eye: mint-white glow that holds the number
    "  float eye = 1.0 - smoothstep(0.30, 0.62, r);",
    "  acc = over(vec4(mix(vec3(1.0), uMint, smoothstep(0.0, 0.6, r)), eye * 0.82), acc);",
"  outColor = acc;",
    "}"
  ].join("\n");

  var rgb = function (h) {
    var n = parseInt(h.replace("#", ""), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  };
  var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };

  function label(el) {
    var wrap = document.createElement("div");
    wrap.style.cssText =
      "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;color:#1D4D38;";
    wrap.innerHTML =
      '<div style="display:flex;align-items:flex-start;line-height:1;">' +
      '<span data-n style="font-family:\'Playfair Display\',Georgia,serif;font-weight:600;font-size:60px;letter-spacing:-1px;">0</span>' +
      '<span style="font-family:Roboto,system-ui,sans-serif;font-weight:600;font-size:19px;margin:8px 0 0 3px;color:#2A805A;">%</span>' +
      "</div>" +
      '<div style="font-family:Roboto,system-ui,sans-serif;font-weight:600;font-size:11px;letter-spacing:2.2px;margin-top:8px;color:#2A805A;">SUFFICIENT</div>';
    el.appendChild(wrap);
    return wrap.querySelector("[data-n]");
  }

  function svgFallback(el, side) {
    var NS = "http://www.w3.org/2000/svg";
    var R = side / 2 / 1.18 * 0.80, C = 2 * Math.PI * R, c = side / 2;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", side); svg.setAttribute("height", side);
    svg.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);";
    svg.innerHTML =
      '<circle cx="' + c + '" cy="' + c + '" r="' + R + '" fill="none" stroke="#E4E7EC" stroke-width="' + side * 0.06 + '" opacity=".6"/>' +
      '<circle data-arc cx="' + c + '" cy="' + c + '" r="' + R + '" fill="none" stroke="#299D6B" stroke-linecap="round" stroke-width="' + side * 0.07 +
      '" stroke-dasharray="0 ' + C + '" transform="rotate(-90 ' + c + ' ' + c + ')"/>';
    el.appendChild(svg);
    var arc = svg.querySelector("[data-arc]");
    return function (p) { arc.setAttribute("stroke-dasharray", C * p + " " + C); };
  }

  window.HEROES = window.HEROES || {};
  window.HEROES.vortex = function (el, opts) {
    var score = (opts && opts.score) || 0;
    var target = Math.max(0, Math.min(100, score)) / 100;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var DURATION = 1200;

    var side = Math.min(el.clientWidth || 342, el.clientHeight || 320);
    var canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:absolute;left:50%;top:50%;width:" + side + "px;height:" + side + "px;transform:translate(-50%,-50%);display:block;";
    el.appendChild(canvas);
    var num = label(el);

    var gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, antialias: true });
    var raf = 0, start = performance.now(), prog = null, buf = null, fallbackSet = null, U = {};

    if (gl) {
      try {
        var compile = function (type, src) {
          var sh = gl.createShader(type);
          gl.shaderSource(sh, src); gl.compileShader(sh);
          if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
          return sh;
        };
        prog = gl.createProgram();
        gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
        gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      } catch (e) {
        gl = null;
      }
    }

    if (!gl) {
      canvas.remove();
      fallbackSet = svgFallback(el, side);
    } else {
      gl.useProgram(prog);
      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ["uRes", "uTime", "uProg", "uIntro", "uDeep", "uPrimary", "uSecondary", "uMint", "uTrack"].forEach(function (n) {
        U[n] = gl.getUniformLocation(prog, n);
      });
      gl.uniform3fv(U.uDeep, rgb("#1D4D38"));
      gl.uniform3fv(U.uPrimary, rgb("#299D6B"));
      gl.uniform3fv(U.uSecondary, rgb("#79CCA8"));
      gl.uniform3fv(U.uMint, rgb("#CBF0E0"));
      gl.uniform3fv(U.uTrack, rgb("#D0D5DD"));
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(side * dpr);
      canvas.height = Math.round(side * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    var draw = function (timeSec, p, intro) {
      if (!gl) return;
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform1f(U.uTime, timeSec);
      gl.uniform1f(U.uProg, p);
      gl.uniform1f(U.uIntro, intro);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    if (reduce) {
      num.textContent = String(score);
      if (fallbackSet) fallbackSet(target);
      draw(4.0, target, 1);
    } else {
      var frame = function (now) {
        var elapsed = now - start;
        var k = easeOut(Math.min(1, elapsed / DURATION));
        num.textContent = String(Math.round(score * k));
        if (fallbackSet) {
          fallbackSet(target * k);
          if (k < 1) raf = requestAnimationFrame(frame);
          return;
        }
        // the charged arc spins up: extra rotation speed during the intro that settles
        draw(4.0 + elapsed / 1000 + (1 - k) * 0.0, target * k, Math.min(1, 0.3 + k));
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }

    return {
      dispose: function () {
        cancelAnimationFrame(raf);
        if (gl) {
          gl.deleteProgram(prog);
          gl.deleteBuffer(buf);
          var lose = gl.getExtension("WEBGL_lose_context");
          if (lose) lose.loseContext();
        }
        el.innerHTML = "";
      }
    };
  };
})();
