/* Portal: the React Bits Pro portal shader (see _portal-core.reference.js),
   recoloured to brand greens and re-composited for a near-white page. The
   streaks run the full ring, but only the first 54% of the circumference is
   lit; the rest stays a faint track, so the ring reads as the score. */
(function () {
  var VERT = "#version 300 es\nin vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";

  var FRAG = [
    "#version 300 es",
    "precision highp float;",
    "out vec4 outColor;",
    "uniform vec2 uRes; uniform float uTime; uniform float uProg; uniform float uIntro;",
    "uniform vec3 uPrimary; uniform vec3 uSecondary; uniform vec3 uDeep; uniform vec3 uMint; uniform vec3 uTrack;",
    "const float SPEED = 0.55, DENSITY = 1.0, LAYERS = 7.0, WAVE_AMP = 1.0, WAVE_FREQ = 0.08, VERT_D = 0.2, DEPTH = 0.2;",
    "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }",
    "float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);",
    "  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }",
    "float fbm(vec2 p){ float a = 0.5, v = 0.0; for (int i = 0; i < 4; i++){ v += a*noise(p); p *= 2.03; a *= 0.5; } return v; }",
    "mat3 rotZ(float a){ float s = sin(a), c = cos(a); return mat3(c,-s,0, s,c,0, 0,0,1); }",
    // source-over for straight-alpha colours
    "vec4 over(vec4 top, vec4 bot){ float a = top.a + bot.a*(1.0-top.a); vec3 c = (top.rgb*top.a + bot.rgb*bot.a*(1.0-top.a)) / max(a, 1e-4); return vec4(c, a); }",
    "void main(){",
    "  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / (0.5*min(uRes.x, uRes.y));",
    "  uv *= 1.2;",
    "  float r = length(uv);",
    "  float px = 2.4 / min(uRes.x, uRes.y);",
    // clockwise from 12 o'clock, 0..1
    "  float ang = atan(uv.x, uv.y);",
    "  float fr = ang < 0.0 ? ang/6.2831853 + 1.0 : ang/6.2831853;",
    "  float lit = uProg > 0.001 ? 1.0 - smoothstep(uProg - 0.004, uProg + 0.004, fr) : 0.0;",
    "  float litSoft = uProg > 0.001 ? (1.0 - smoothstep(uProg - 0.06, uProg + 0.02, fr)) * smoothstep(0.0, 0.045, fr) : 0.0;",
    "  vec4 acc4 = vec4(0.0);",
    // soft outer glow, strongest along the lit arc
    "  float halo = exp(-pow((r - 1.0) / 0.10, 2.0));",
    "  acc4 = over(vec4(uMint, halo * uIntro * mix(0.10, 0.55, litSoft)), acc4);",
    "  float disc = 1.0 - smoothstep(1.0 - px, 1.0 + px, r);",
    "  if (disc > 0.0) {",
    "    float z = sqrt(max(0.0, 1.0 - r*r));",
    "    vec3 sp = rotZ(0.30) * vec3(uv, z);",
    "    float lat = asin(clamp(sp.y, -1.0, 1.0));",
    "    float lon = atan(sp.x, sp.z);",
    "    float t = uTime * SPEED;",
    "    float acc = 0.0, tint = 0.0, wsum = 0.0;",
    "    for (int i = 0; i < 7; i++){",
    "      float fi = float(i); float depth = fi / (LAYERS - 1.0);",
    "      float lo = lon + t*(0.55 + depth*0.25) + fi*2.4;",
    "      float la = lat + WAVE_AMP*0.09*sin(lo*(WAVE_FREQ*45.0) + t*0.8 + fi) + VERT_D*0.14*sin(lo*1.7 - t*0.5 + fi*1.9);",
    "      float n = fbm(vec2(lo*1.6 + fi*7.3, la*(16.0*DENSITY) - t*0.15));",
    "      float s = smoothstep(0.41, 0.78, n);",
    "      float w = mix(1.0, 1.0 - depth, clamp(DEPTH*2.4, 0.0, 1.0));",
    "      acc += s*w; tint += n*w; wsum += w;",
    "    }",
    "    acc /= wsum; tint /= wsum;",
    // wide clean core for the number, glow compressed towards the rim
    "    acc *= smoothstep(0.30, 0.82, r);",
    "    acc *= 0.85 + 1.7*pow(1.0 - z, 1.5);",
    "    acc = pow(clamp(acc, 0.0, 2.0), 1.15) * 3.0;",
    // the score: full strength on the lit arc, a whisper elsewhere
    "    acc *= mix(0.09, 1.0, litSoft) * uIntro;",
    "    float a = smoothstep(0.12, 1.05, acc);",
    "    vec3 col = mix(uSecondary, uPrimary, smoothstep(0.35, 0.75, tint));",
    "    col = mix(col, uDeep, smoothstep(0.9, 1.8, acc));",
    // faint mint body under the streaks, denser near the rim
    "    float body = (0.03 + 0.22*pow(1.0 - z, 3.0)) * mix(0.35, 1.0, litSoft) * uIntro;",
    "    vec4 inside = over(vec4(col, a*0.88), vec4(uMint, body));",
    "    inside.a *= disc;",
    "    acc4 = over(inside, acc4);",
    "  }",
    // crisp rim: gray track all round, green over the score
    "  float rimW = 0.013;",
    "  float rim = 1.0 - smoothstep(rimW - px, rimW + px, abs(r - 1.035));",
    "  vec3 rimCol = mix(uTrack, uDeep, lit);",
    "  acc4 = over(vec4(rimCol, rim * mix(0.9, 1.0, lit)), acc4);",
    // leading dot at the head of the arc
    "  if (uProg > 0.001) {",
    "    float ha = uProg * 6.2831853;",
    "    vec2 hp = 1.035 * vec2(sin(ha), cos(ha));",
    "    float d = length(uv - hp);",
    "    acc4 = over(vec4(uMint, (1.0 - smoothstep(0.05, 0.12, d)) * 0.85 * uIntro), acc4);",
    "    acc4 = over(vec4(uDeep, 1.0 - smoothstep(0.036 - px, 0.036 + px, d)), acc4);",
    "    acc4 = over(vec4(1.0, 1.0, 1.0, 1.0 - smoothstep(0.015 - px, 0.015 + px, d)), acc4);",
    "  }",
    "  outColor = acc4;",
    "}"
  ].join("\n");

  var rgb = function (h) {
    var n = parseInt(h.replace("#", ""), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  };
  var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };

  function label(el, score) {
    var wrap = document.createElement("div");
    wrap.style.cssText =
      "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;color:#1D4D38;";
    wrap.innerHTML =
      '<div style="display:flex;align-items:flex-start;line-height:1;">' +
      '<span data-n style="font-family:\'Playfair Display\',Georgia,serif;font-weight:600;font-size:64px;letter-spacing:-1px;">0</span>' +
      '<span style="font-family:Roboto,system-ui,sans-serif;font-weight:600;font-size:20px;margin:9px 0 0 3px;color:#2A805A;">%</span>' +
      "</div>" +
      '<div style="font-family:Roboto,system-ui,sans-serif;font-weight:600;font-size:11px;letter-spacing:2.2px;margin-top:8px;color:#2A805A;">SUFFICIENT</div>';
    el.appendChild(wrap);
    return wrap.querySelector("[data-n]");
  }

  function svgFallback(el, score, reduce) {
    var NS = "http://www.w3.org/2000/svg";
    var size = Math.min(el.clientWidth || 342, el.clientHeight || 320);
    var R = size / 2 / 1.2 * 1.035, C = 2 * Math.PI * R;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", size); svg.setAttribute("height", size);
    svg.setAttribute("viewBox", "0 0 " + size + " " + size);
    svg.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);";
    var c = size / 2;
    svg.innerHTML =
      '<defs><radialGradient id="pgGlow"><stop offset="55%" stop-color="#E6FAF1" stop-opacity="0"/>' +
      '<stop offset="82%" stop-color="#CBF0E0" stop-opacity=".55"/><stop offset="100%" stop-color="#E6FAF1" stop-opacity="0"/></radialGradient></defs>' +
      '<circle cx="' + c + '" cy="' + c + '" r="' + (R * 1.12) + '" fill="url(#pgGlow)"/>' +
      '<circle cx="' + c + '" cy="' + c + '" r="' + R + '" fill="none" stroke="#E4E7EC" stroke-width="' + (size * 0.011) + '"/>' +
      '<circle data-arc cx="' + c + '" cy="' + c + '" r="' + R + '" fill="none" stroke="#299D6B" stroke-linecap="round" stroke-width="' + (size * 0.022) +
      '" stroke-dasharray="0 ' + C + '" transform="rotate(-90 ' + c + ' ' + c + ')"/>';
    el.appendChild(svg);
    var arc = svg.querySelector("[data-arc]");
    return function (p) { arc.setAttribute("stroke-dasharray", C * p + " " + C); };
  }

  window.HEROES = window.HEROES || {};
  window.HEROES.portal = function (el, opts) {
    var score = (opts && opts.score) || 0;
    var target = Math.max(0, Math.min(100, score)) / 100;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var DURATION = 1200;

    var canvas = document.createElement("canvas");
    var side = Math.min(el.clientWidth || 342, el.clientHeight || 320);
    canvas.style.cssText =
      "position:absolute;left:50%;top:50%;width:" + side + "px;height:" + side + "px;transform:translate(-50%,-50%);display:block;";
    el.appendChild(canvas);
    var num = label(el, score);

    var gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, antialias: true });
    var raf = 0, start = performance.now(), prog = null, buf = null, fallbackSet = null;

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
      fallbackSet = svgFallback(el, score, reduce);
    } else {
      gl.useProgram(prog);
      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      var U = {};
      ["uRes", "uTime", "uProg", "uIntro", "uPrimary", "uSecondary", "uDeep", "uMint", "uTrack"].forEach(function (n) {
        U[n] = gl.getUniformLocation(prog, n);
      });
      gl.uniform3fv(U.uPrimary, rgb("#299D6B"));
      gl.uniform3fv(U.uSecondary, rgb("#79CCA8"));
      gl.uniform3fv(U.uDeep, rgb("#2A805A"));
      gl.uniform3fv(U.uMint, rgb("#ABE6CC"));
      gl.uniform3fv(U.uTrack, rgb("#E4E7EC"));
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
      draw(6.0, target, 1);
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
        draw(6.0 + elapsed / 1000, target * k, Math.min(1, 0.25 + k));
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
