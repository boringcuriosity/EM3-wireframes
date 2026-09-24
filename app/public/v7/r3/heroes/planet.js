/* Planet Phase: a small green world whose sunlit share of the visible disc is
   the score. The lit fraction of a sphere seen from the viewer is (1 + cos a) / 2,
   where a is the angle between the sun and the viewer, so the sun direction is
   solved from the fraction rather than eyeballed. The night side is a soft
   gray-green so it reads as "still to fill" on a light page. */
(function () {
  window.HEROES = window.HEROES || {};

  var VERT = "attribute vec2 p; varying vec2 v; void main(){ v = p; gl_Position = vec4(p, 0.0, 1.0); }";

  var FRAG = [
    "precision highp float;",
    "varying vec2 v;",
    "uniform float uTime, uFrac, uAspect;",
    "float h(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }",
    "float n3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.0-2.0*f);",
    "  return mix(mix(mix(h(i), h(i+vec3(1,0,0)), f.x), mix(h(i+vec3(0,1,0)), h(i+vec3(1,1,0)), f.x), f.y),",
    "             mix(mix(h(i+vec3(0,0,1)), h(i+vec3(1,0,1)), f.x), mix(h(i+vec3(0,1,1)), h(i+vec3(1,1,1)), f.x), f.y), f.z); }",
    "float fbm(vec3 p){ float a = 0.5, s = 0.0; for(int i = 0; i < 5; i++){ s += a * n3(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }",
    "mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c,0.,-s, 0.,1.,0., s,0.,c); }",
    "mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.,0.,0., 0.,c,s, 0.,-s,c); }",
    "void main(){",
    "  vec2 q = v * vec2(uAspect, 1.0) * 1.18;",
    "  float r2 = dot(q, q);",
    // sun direction from the lit fraction: cos(a) = 2k - 1, viewer on +z, sun from the right
    "  float ca = clamp(2.0 * uFrac - 1.0, -1.0, 1.0); float sa = sqrt(1.0 - ca*ca);",
    "  vec3 L = normalize(vec3(sa, 0.12 * sa, ca));",
    "  vec3 ocean = vec3(0.114,0.302,0.220), land = vec3(0.161,0.616,0.420), high = vec3(0.475,0.800,0.659), cloud = vec3(0.796,0.941,0.878), mint = vec3(0.671,0.902,0.800);",
    "  vec3 col = vec3(0.0); float alpha = 0.0;",
    "  if (r2 < 1.0) {",
    "    vec3 n = vec3(q, sqrt(1.0 - r2));",
    "    vec3 t = rotX(0.35) * rotY(uTime * 0.045) * n;",
    "    float e = fbm(t * 2.2 + 3.0);",
    "    float landMask = smoothstep(0.50, 0.56, e);",
    "    vec3 surf = mix(ocean * (0.85 + 0.3 * fbm(t * 6.0)), mix(land, high, smoothstep(0.62, 0.78, e)), landMask);",
    "    vec3 tc = rotY(uTime * 0.075) * t;",
    "    float cl = smoothstep(0.55, 0.78, fbm(tc * 3.1 + vec3(0.0, uTime * 0.01, 9.0)));",
    "    surf = mix(surf, cloud, cl * 0.75);",
    "    float d = dot(n, L);",
    "    float day = smoothstep(-0.035, 0.035, d);",
    "    vec3 lit = surf * (0.86 + 0.42 * max(d, 0.0)) + vec3(0.9,1.0,0.95) * pow(max(dot(reflect(-L, n), vec3(0,0,1)), 0.0), 24.0) * 0.18 * (1.0 - landMask);",
    // night: pale gray-green with a whisper of the terrain so it is still the same world
    "    vec3 night = mix(vec3(0.894,0.906,0.925), vec3(0.690,0.745,0.733), 0.35 + 0.45 * n.z * 0.5) ;",
    "    night = mix(night, night * vec3(0.93,0.97,0.95), landMask * 0.6 + cl * 0.2);",
    "    col = mix(night, lit, day);",
    "    col += mint * exp(-abs(d) * 26.0) * 0.55;",               // glowing terminator
    "    float rim = pow(1.0 - n.z, 3.0);",
    "    col = mix(col, mint * mix(0.9, 1.15, day), rim * 0.55);",
    "    alpha = smoothstep(1.0, 0.992, r2);",
    "    col *= alpha;",
    "  }",
    // atmosphere halo outside the disc, stronger on the sunlit side
    "  float r = sqrt(r2);",
    "  if (r > 0.985) {",
    "    float g = exp(-(r - 1.0) * 16.0) * smoothstep(0.985, 1.005, r);",
    "    vec2 dir = q / max(r, 1e-4);",
    "    float side = 0.35 + 0.65 * smoothstep(-0.6, 0.8, dot(dir, normalize(L.xy + vec2(1e-4))));",
    "    float a = g * side * 0.75;",
    "    col += mint * a; alpha = max(alpha, a);",
    "  }",
    "  gl_FragColor = vec4(col, alpha);",
    "}"
  ].join("\n");

  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  window.HEROES.planet = function (el, opts) {
    var score = (opts && opts.score) || 54;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var raf = 0, gl = null, dead = false;

    el.style.position = el.style.position || "relative";
    var wrap = document.createElement("div");
    wrap.style.cssText = "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;";
    el.appendChild(wrap);

    // stage: planet canvas with an orbit ring split behind and in front of it
    var S = 236;
    var stage = document.createElement("div");
    stage.style.cssText = "position:relative;width:" + S + "px;height:" + S + "px;margin-top:6px;";
    wrap.appendChild(stage);

    var soft = document.createElement("div");
    soft.style.cssText = "position:absolute;left:50%;top:50%;width:250px;height:250px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(closest-side,rgba(203,240,224,.55),rgba(243,252,248,.35) 60%,rgba(252,252,253,0));";
    stage.appendChild(soft);

    var NS = "http://www.w3.org/2000/svg";
    function ringSvg(front) {
      var s = document.createElementNS(NS, "svg");
      s.setAttribute("viewBox", "0 0 " + S + " " + S);
      s.setAttribute("width", S); s.setAttribute("height", S);
      s.style.cssText = "position:absolute;inset:0;overflow:visible;pointer-events:none;";
      var g = document.createElementNS(NS, "g");
      g.setAttribute("transform", "rotate(-16 " + S / 2 + " " + S / 2 + ")");
      var path = document.createElementNS(NS, "path");
      var cx = S / 2, cy = S / 2, rx = 150, ry = 26;
      // front half is the lower arc, back half the upper arc
      var d = front
        ? "M " + (cx - rx) + " " + cy + " A " + rx + " " + ry + " 0 0 0 " + (cx + rx) + " " + cy
        : "M " + (cx - rx) + " " + cy + " A " + rx + " " + ry + " 0 0 1 " + (cx + rx) + " " + cy;
      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", front ? "#79CCA8" : "#CBF0E0");
      path.setAttribute("stroke-width", front ? "1.4" : "1.2");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("opacity", front ? "0.85" : "0.7");
      g.appendChild(path);
      if (front) {
        var moon = document.createElementNS(NS, "circle");
        moon.setAttribute("r", "4.2"); moon.setAttribute("fill", "#299D6B");
        moon.setAttribute("stroke", "#FFFFFF"); moon.setAttribute("stroke-width", "1.5");
        g.appendChild(moon);
        s._moon = moon; s._cx = cx; s._cy = cy; s._rx = rx; s._ry = ry;
      }
      s.appendChild(g);
      return s;
    }
    var back = ringSvg(false);
    stage.appendChild(back);

    var canvas = document.createElement("canvas");
    canvas.width = S * dpr; canvas.height = S * dpr;
    canvas.style.cssText = "position:absolute;inset:0;width:" + S + "px;height:" + S + "px;";
    stage.appendChild(canvas);

    var front = ringSvg(true);
    stage.appendChild(front);

    var shadow = document.createElement("div");
    shadow.style.cssText = "width:150px;height:12px;margin-top:-8px;border-radius:50%;background:radial-gradient(closest-side,rgba(29,77,56,.14),rgba(29,77,56,0));";
    wrap.appendChild(shadow);

    var label = document.createElement("div");
    label.style.cssText = "display:flex;flex-direction:column;align-items:center;margin-top:6px;";
    label.innerHTML =
      '<div style="display:flex;align-items:flex-start;color:#1D4D38;font-family:\'Playfair Display\',Georgia,serif;font-weight:600;line-height:1;">' +
      '<span class="pp-num" style="font-size:44px;letter-spacing:-0.5px;font-variant-numeric:lining-nums;">0</span>' +
      '<span style="font-size:20px;margin-top:4px;margin-left:2px;">%</span></div>' +
      '<div style="margin-top:6px;font-family:Roboto,system-ui,sans-serif;font-size:10.5px;font-weight:700;letter-spacing:2.2px;color:#2A805A;">SUFFICIENT</div>';
    wrap.appendChild(label);
    var numEl = label.querySelector(".pp-num");

    function placeMoon(t) {
      var m = front._moon; if (!m) return;
      // travel only along the visible front arc
      var a = Math.PI * (0.07 + 0.12 * (0.5 + 0.5 * Math.sin(t * 0.00025)));
      m.setAttribute("cx", front._cx - Math.cos(a) * front._rx);
      m.setAttribute("cy", front._cy + Math.sin(a) * front._ry);
    }

    // WebGL, with an SVG phase fallback
    try { gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: true }); } catch (e) { gl = null; }
    var uTime, uFrac, uAspect;
    if (gl) {
      var sh = function (type, src) {
        var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
      };
      try {
        var prog = gl.createProgram();
        gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
        gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
        gl.useProgram(prog);
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        var loc = gl.getAttribLocation(prog, "p");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        uTime = gl.getUniformLocation(prog, "uTime");
        uFrac = gl.getUniformLocation(prog, "uFrac");
        uAspect = gl.getUniformLocation(prog, "uAspect");
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
      } catch (e) { gl = null; }
    }

    var fallback = null;
    if (!gl) {
      canvas.style.display = "none";
      fallback = document.createElementNS(NS, "svg");
      fallback.setAttribute("viewBox", "-1.2 -1.2 2.4 2.4");
      fallback.setAttribute("width", S); fallback.setAttribute("height", S);
      fallback.style.cssText = "position:absolute;inset:0;";
      fallback.innerHTML = '<circle r="1" fill="#E4E7EC"/><path class="lit" fill="#299D6B"/>';
      stage.insertBefore(fallback, front);
    }
    function drawFallback(k) {
      // lit region: right half-disc plus/minus an elliptical terminator
      var x = 1 - 2 * k; // terminator ellipse semi-axis, signed
      var p = fallback.querySelector(".lit");
      p.setAttribute("d", "M 0 -1 A 1 1 0 0 1 0 1 A " + Math.abs(x) + " 1 0 0 " + (x > 0 ? 1 : 0) + " 0 -1 Z");
    }

    var start = performance.now();
    var DUR = 1200;
    var target = score / 100;

    function frame(now) {
      if (dead) return;
      var p = reduce ? 1 : Math.min(1, (now - start) / DUR);
      var e = ease(p);
      var k = 0.04 + (target - 0.04) * e;
      numEl.textContent = Math.round(score * e);
      placeMoon(reduce ? 12000 : now);
      if (gl) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uTime, reduce ? 20.0 : 20.0 + (now - start) / 1000);
        gl.uniform1f(uFrac, k);
        gl.uniform1f(uAspect, 1.0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      } else {
        drawFallback(k);
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return {
      dispose: function () {
        dead = true;
        cancelAnimationFrame(raf);
        if (gl) { var ext = gl.getExtension("WEBGL_lose_context"); if (ext) ext.loseContext(); }
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
      }
    };
  };
})();
