/* Ferrofluid: a glossy ring of emerald ferrofluid, seen from slightly above.
   Spikes stand up along the first `score`% of the ring, clockwise from 12
   o'clock; the rest lies flat and calm, so the charged part reads at a glance.
   Raymarched in a single WebGL1 fragment shader. */
(function () {
  window.HEROES = window.HEROES || {};

  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes; uniform float uTime; uniform float uFill; uniform float uAmp;",
    "const float PI = 3.14159265;",
    "const vec3 DEEP = vec3(0.114, 0.302, 0.220);",   // #1D4D38
    "const vec3 MID  = vec3(0.161, 0.616, 0.420);",   // #299D6B
    "const vec3 MINT = vec3(0.796, 0.941, 0.878);",   // #CBF0E0
    "float map(vec3 p) {",
    "  const float R = 1.0; const float r = 0.25;",
    "  vec2 tq = vec2(length(p.xz) - R, p.y / 0.72);",
    "  float base = (length(tq) - r) * 0.72;",
    // position around the ring: 0 at 12 o'clock on screen, clockwise
    "  float u = fract(atan(p.x, -p.z) / (2.0 * PI));",
    "  float phi = atan(tq.y, tq.x);",
    "  float m = smoothstep(0.0, 0.03, u) * (1.0 - smoothstep(uFill - 0.035, uFill, u));",
    "  float up = smoothstep(0.35, 0.95, sin(phi) + 0.1 * cos(phi)) * smoothstep(-0.55, -0.05, cos(phi));",
    "  const float NA = 40.0; const float NP = 9.0;",
    "  float ia = floor(u * NA);",
    "  float row = floor((phi + PI) / (2.0 * PI) * NP);",
    "  float shift = mod(row, 2.0) * 0.5;",
    "  float ca = fract(u * NA + shift) - 0.5;",
    "  float cp = fract((phi + PI) / (2.0 * PI) * NP) - 0.5;",
    "  float d = length(vec2(ca, cp * 0.95));",
    "  float cone = max(0.0, 1.0 - d * 2.05);",
    "  float spike = pow(cone, 2.7) * (0.75 + 0.25 * cone);",
    "  float pulse = 0.86 + 0.14 * sin(uTime * 1.05 + ia * 0.7 + row * 1.3);",
    "  float h = 0.44 * m * up * spike * uAmp * pulse;",
    // calm part keeps a faint glossy ripple so it still reads as liquid
    "  float ripple = 0.004 * sin(u * 2.0 * PI * 11.0 + uTime * 0.8) * (1.0 - m);",
    "  return base - h - ripple;",
    "}",
    "vec3 calcNormal(vec3 p) {",
    "  vec2 e = vec2(0.0015, 0.0);",
    "  return normalize(vec3(map(p + e.xyy) - map(p - e.xyy), map(p + e.yxy) - map(p - e.yxy), map(p + e.yyx) - map(p - e.yyx)));",
    "}",
    "void main() {",
    "  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;",
    "  vec3 ro = vec3(0.0, 4.1, 3.55);",
    "  vec3 ta = vec3(0.0, -0.02, 0.0);",
    "  vec3 fw = normalize(ta - ro);",
    "  vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));",
    "  vec3 upv = cross(rt, fw);",
    "  vec3 rd = normalize(uv.x * rt + uv.y * upv + 1.9 * fw);",
    // bounding sphere
    "  float b = dot(ro, rd); float c = dot(ro, ro) - 1.75 * 1.75; float disc = b * b - c;",
    "  if (disc < 0.0) { gl_FragColor = vec4(0.0); return; }",
    "  float t = max(0.0, -b - sqrt(disc)); float tEnd = -b + sqrt(disc);",
    "  float dmin = 1e5; bool hit = false;",
    "  for (int i = 0; i < 150; i++) {",
    "    vec3 p = ro + rd * t;",
    "    float d = map(p);",
    "    dmin = min(dmin, d / max(t, 0.1));",
    "    if (d < 0.0012) { hit = true; break; }",
    "    t += d * 0.38;",
    "    if (t > tEnd) break;",
    "  }",
    "  float px = 1.6 / uRes.y;",
    "  if (!hit) {",
    "    float a = 1.0 - smoothstep(0.0, px * 1.5, dmin);",
    "    if (a <= 0.0) { gl_FragColor = vec4(0.0); return; }",
    "    t = t; ",
    "  }",
    "  vec3 p = ro + rd * t;",
    "  vec3 n = calcNormal(p);",
    "  vec3 v = -rd;",
    "  vec3 L = normalize(vec3(-0.45, 1.0, 0.55));",
    "  vec3 refl = reflect(rd, n);",
    "  float diff = max(dot(n, L), 0.0);",
    "  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);",
    // fake studio environment: deep floor, green horizon, mint and white sky
    "  vec3 env = mix(DEEP * 0.8, MID, smoothstep(-0.5, 0.15, refl.y));",
    "  env = mix(env, MINT, smoothstep(0.15, 0.75, refl.y));",
    "  env += vec3(1.0) * pow(max(dot(refl, normalize(vec3(-0.35, 0.85, 0.4))), 0.0), 36.0) * 1.1;",
    "  env += MINT * pow(max(dot(refl, normalize(vec3(0.6, 0.5, -0.6))), 0.0), 18.0) * 0.35;",
    "  vec3 body = mix(mix(DEEP, MID, 0.3), MID * 0.95, diff * diff);",
    "  vec3 col = mix(body, env, 0.42 + 0.55 * fres);",
    "  col += vec3(1.0) * pow(max(dot(refl, L), 0.0), 90.0) * 1.0;",
    "  col += MINT * pow(max(dot(refl, normalize(vec3(0.7, 0.35, 0.6))), 0.0), 24.0) * 0.45;",
    "  col = clamp(col, 0.0, 1.0);",
    "  float alpha = hit ? 1.0 : 1.0 - smoothstep(0.0, px * 1.5, dmin);",
    "  gl_FragColor = vec4(col * alpha, alpha);",
    "}"
  ].join("\n");

  var VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(s);
      gl.deleteShader(s);
      throw new Error(log);
    }
    return s;
  }

  function fallbackSVG(score) {
    var r = 118, c = 2 * Math.PI * r, len = (c * score) / 100;
    return (
      '<svg width="342" height="320" viewBox="0 0 342 320" style="position:absolute;inset:0">' +
      '<circle cx="171" cy="160" r="' + r + '" fill="none" stroke="#E4E7EC" stroke-width="30"/>' +
      '<circle cx="171" cy="160" r="' + r + '" fill="none" stroke="#299D6B" stroke-width="30" stroke-linecap="round"' +
      ' stroke-dasharray="' + len + " " + c + '" transform="rotate(-90 171 160)"/></svg>'
    );
  }

  window.HEROES.ferro = function (el, opts) {
    var score = opts && opts.score != null ? opts.score : 54;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var W = el.clientWidth || 342, H = el.clientHeight || 320;

    el.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.style.cssText = "position:absolute;inset:0;";
    el.appendChild(wrap);

    // soft contact shadow under the ring
    var shadow = document.createElement("div");
    shadow.style.cssText =
      "position:absolute;left:50%;top:56%;width:300px;height:170px;transform:translate(-50%,-50%);border-radius:50%;" +
      "background:radial-gradient(closest-side, rgba(29,77,56,0.10), rgba(41,157,107,0.04) 60%, rgba(255,255,255,0) 100%);filter:blur(6px);";
    wrap.appendChild(shadow);

    var canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:" + W + "px;height:" + H + "px;";
    wrap.appendChild(canvas);

    var label = document.createElement("div");
    label.style.cssText =
      "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;pointer-events:none;";
    label.innerHTML =
      '<div style="display:flex;align-items:flex-start;color:#1D4D38;font-family:\'Playfair Display\',Georgia,serif;font-weight:600;line-height:1;">' +
      '<span class="fv" style="font-size:50px;letter-spacing:-1px;">0</span><span style="font-size:20px;margin-top:5px;margin-left:2px;">%</span></div>' +
      '<div style="margin-top:4px;font-family:Roboto,system-ui,sans-serif;font-size:10px;font-weight:700;letter-spacing:1.6px;color:#1D4D38;">SUFFICIENT</div>';
    wrap.appendChild(label);
    var numEl = label.querySelector(".fv");

    var gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
    var raf = 0, disposed = false, prog, buf;

    function setNum(v) { numEl.textContent = String(Math.round(v)); }

    if (!gl) {
      canvas.remove();
      wrap.insertAdjacentHTML("afterbegin", fallbackSVG(score));
      setNum(score);
      return { dispose: function () { el.innerHTML = ""; } };
    }

    try {
      prog = gl.createProgram();
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (e) {
      canvas.remove();
      wrap.insertAdjacentHTML("afterbegin", fallbackSVG(score));
      setNum(score);
      return { dispose: function () { el.innerHTML = ""; } };
    }

    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(prog);

    buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, "uRes");
    var uTime = gl.getUniformLocation(prog, "uTime");
    var uFill = gl.getUniformLocation(prog, "uFill");
    var uAmp = gl.getUniformLocation(prog, "uAmp");
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);

    function draw(time, fill, amp) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uFill, fill);
      gl.uniform1f(uAmp, amp);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    var target = score / 100;
    if (reduce) {
      setNum(score);
      draw(0, target, 1);
    } else {
      var start = performance.now();
      var frame = function (now) {
        if (disposed) return;
        var t = (now - start) / 1000;
        var p = Math.min(t / 1.2, 1);
        var e = 1 - Math.pow(1 - p, 3);
        setNum(score * e);
        // spikes rise slightly behind the arc so the growth reads as a wave
        draw(t, target * e, Math.min(1, Math.max(0, (t - 0.1) / 1.2)));
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }

    return {
      dispose: function () {
        disposed = true;
        cancelAnimationFrame(raf);
        var ext = gl.getExtension("WEBGL_lose_context");
        if (ext) ext.loseContext();
        el.innerHTML = "";
      }
    };
  };
})();
