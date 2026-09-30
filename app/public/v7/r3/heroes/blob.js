/* Liquid Blob: a soft, wobbling drop of clear glass holding green water.
   The water fills the score's share of the blob's area; the clear glass
   above the waterline is the part of the day still to come. Caustic light
   from pool.js, poured into a round shape. */
(function () {
  window.HEROES = window.HEROES || {};

  var W = 342, H = 320;
  var CX = 171, CY = 146, R = 122; // blob centre and base radius, CSS px

  var VERT = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }";

  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes; uniform float uDpr; uniform float uTime; uniform float uLevel; uniform float uFill; uniform float uTextOn;",
    "uniform sampler2D uText;",
    "const float CX=" + CX + ".0; const float CY=" + CY + ".0; const float R=" + R + ".0; const float TAU=6.28318530718;",
    "const vec3 B100=vec3(0.902,0.980,0.945); const vec3 B200=vec3(0.796,0.941,0.878);",
    "const vec3 B300=vec3(0.671,0.902,0.800); const vec3 B400=vec3(0.475,0.800,0.659);",
    "const vec3 B500=vec3(0.349,0.702,0.549); const vec3 B600=vec3(0.161,0.616,0.420);",
    "const vec3 B700=vec3(0.165,0.502,0.353); const vec3 B900=vec3(0.114,0.302,0.220);",
    "const vec3 G100=vec3(0.949,0.957,0.969); const vec3 G200=vec3(0.894,0.906,0.925);",
    "const vec3 G300=vec3(0.816,0.835,0.867);",
    // Tileable water caustic (after joltz0r / Dave Hoskins), same as pool.js.
    "float caustic(vec2 uv, float time){",
    "  vec2 p = mod(uv*TAU, TAU) - 250.0; vec2 i = p; float c = 1.0; float inten = 0.005;",
    "  for (int n = 0; n < 5; n++) {",
    "    float t = time * (1.0 - (3.5 / float(n+1)));",
    "    i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));",
    "    c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten), p.y / (cos(i.y+t)/inten)));",
    "  }",
    "  c /= 5.0; c = 1.17 - pow(c, 1.4);",
    "  return clamp(pow(abs(c), 8.0), 0.0, 1.0);",
    "}",
    "vec4 over(vec4 d, vec3 c, float a){",
    "  a = clamp(a, 0.0, 1.0); float oa = a + d.a*(1.0-a);",
    "  if (oa < 0.0001) return vec4(0.0);",
    "  return vec4((c*a + d.rgb*d.a*(1.0-a))/oa, oa);",
    "}",
    // The blob's edge: a circle whose radius breathes with slow low-frequency waves.
    "float radiusAt(float th, float t){",
    "  return R*(1.0 + 0.011*sin(3.0*th + t*0.55) + 0.007*sin(5.0*th - t*0.42 + 1.3) + 0.009*sin(2.0*th + t*0.8 + 2.1));",
    "}",
    "void main(){",
    "  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y)/uDpr;",
    "  float t = uTime; vec4 o = vec4(0.0);",
    "  vec2 d0 = p - vec2(CX, CY);",
    "  float th = atan(d0.y, d0.x);",
    "  float rEdge = radiusAt(th, t);",
    "  float dist = length(d0) - rEdge;",          // < 0 inside
    // contact shadow
    "  vec2 sq = vec2((p.x-CX)/(R*0.78), (p.y-(CY+R+16.0))/11.0);",
    "  o = over(o, vec3(0.063,0.157,0.110), exp(-dot(sq,sq)*2.2)*0.14);",
    // soft mint glow around the drop
    "  o = over(o, B200, exp(-max(dist,0.0)/14.0)*step(0.0,dist)*0.35);",
    "  float inside = clamp(0.5 - dist, 0.0, 1.0);",
    "  if (inside > 0.0) {",
    "    vec2 q = d0 / rEdge; float rr = min(length(q), 1.0);",
    "    float nz = sqrt(max(0.0, 1.0 - rr*rr));",
    "    float fres = pow(1.0 - nz, 2.2);",
    // empty glass: frosted, clear in the middle, milkier toward the edge
    "    vec3 g = mix(vec3(0.985,0.99,0.992), G200, fres*0.8);",
    "    float ga = 0.42 + fres*0.45;",
    "    o = over(o, g, ga*inside);",
    // water
    "    float yW = uLevel + sin(p.x*0.034 + t*0.9)*2.2 + sin(p.x*0.083 - t*0.65)*1.1;",
    "    if (uFill > 0.002) {",
    "      float wIn = inside*clamp(p.y - yW + 0.5, 0.0, 1.0);",
    "      if (wIn > 0.0) {",
    "        float bottom = CY + rEdge;",
    "        float depthT = clamp((p.y - yW)/max(bottom - yW, 1.0), 0.0, 1.0);",
    "        vec3 body = mix(B400, B600, smoothstep(0.0, 0.8, depthT));",
    "        body = mix(body, B700, depthT*depthT*0.55);",
    "        body = mix(body, B900, fres*0.45);",
    // refraction: caustics sampled through a lens bent by the drop's curvature
    "        vec2 lens = q*(0.35 + 0.65*nz);",
    "        float c1 = caustic(lens*0.55 + vec2(0.21, 0.08), t*0.42 + 17.0);",
    "        float c2 = caustic(lens*0.95 + vec2(0.63, 0.37), t*0.31 + 5.0);",
    "        float cl = (c1*0.75 + c2*0.35) * (0.95 - depthT*0.45) * (1.0 - fres*0.6);",
    "        body += vec3(0.92, 1.0, 0.95)*cl*0.8;",
    // brighter band just under the surface
    "        float band = exp(-(p.y - yW)/10.0);",
    "        body = mix(body, B200, band*0.55);",
    "        o = over(o, body, wIn*0.95);",
    // meniscus
    "        o = over(o, vec3(1.0), inside*smoothstep(1.6, 0.0, abs(p.y - yW))*0.95);",
    "      }",
    "    }",
    // rim light and glass edge
    "    float edge = smoothstep(3.0, 0.0, -dist);",
    "    o = over(o, G300, edge*0.55);",
    "    float inner = smoothstep(2.2, 0.0, abs(dist + 4.0));",
    "    float topLeft = clamp(dot(normalize(d0 + 0.0001), normalize(vec2(-0.6, -0.8))), 0.0, 1.0);",
    "    o = over(o, vec3(1.0), inner*pow(topLeft, 2.0)*0.9);",
    // speculars: a big soft window reflection top-left, a small sparkle bottom-right
    "    vec2 s1 = (p - vec2(CX - R*0.42, CY - R*0.5)) / vec2(R*0.20, R*0.11);",
    "    float a1 = -0.62; vec2 s1r = vec2(cos(a1)*s1.x - sin(a1)*s1.y, sin(a1)*s1.x + cos(a1)*s1.y);",
    "    o = over(o, vec3(1.0), smoothstep(1.0, 0.25, length(s1r))*0.85*inside);",
    "    vec2 s2 = (p - vec2(CX + R*0.52, CY + R*0.52)) / (R*0.05);",
    "    o = over(o, vec3(1.0), smoothstep(1.0, 0.0, length(s2))*0.7*inside);",
    "  }",
    // outer hairline
    "  o = over(o, G300, smoothstep(1.2, 0.0, abs(dist))*0.8);",
    // the number: deep green above the water, white beneath with a gentle refraction wobble
    "  if (uTextOn > 0.5) {",
    "    float yWt = uLevel + sin(p.x*0.034 + t*0.9)*2.2 + sin(p.x*0.083 - t*0.65)*1.1;",
    "    float uw = step(yWt, p.y)*step(0.002, uFill);",
    "    vec2 off = uw*vec2(sin(p.y*0.17 + t*1.4)*0.9, cos(p.x*0.07 + t*1.1)*0.4);",
    "    vec4 tx = texture2D(uText, (gl_FragCoord.xy + vec2(off.x, -off.y)*uDpr)/uRes);",
    // text canvas stores the glyph mask in alpha, a glow mask in red
    "    vec3 glowC = mix(vec3(1.0), B900, uw);",
    "    o = over(o, glowC, tx.r*mix(0.55, 0.28, uw));",
    "    vec3 inkC = mix(B900, vec3(1.0), uw);",
    "    o = over(o, inkC, tx.a);",
    "  }",
    "  gl_FragColor = vec4(o.rgb*o.a, o.a);",
    "}"
  ].join("\n");

  // Water depth that covers fraction f of a circle of radius R, returned as a y (CSS px).
  function levelFor(f) {
    if (f <= 0) return CY + R + 4;
    if (f >= 1) return CY - R - 4;
    var lo = 0, hi = 2 * R;
    for (var i = 0; i < 40; i++) {
      var h = (lo + hi) / 2;
      var a = R * R * Math.acos((R - h) / R) - (R - h) * Math.sqrt(Math.max(0, 2 * R * h - h * h));
      if (a / (Math.PI * R * R) < f) lo = h; else hi = h;
    }
    return CY + R - (lo + hi) / 2;
  }

  window.HEROES.blob = function (el, opts) {
    var score = opts && opts.score != null ? opts.score : 54;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var alive = true, raf = 0;

    var wrap = document.createElement("div");
    wrap.setAttribute("role", "img");
    wrap.setAttribute("aria-label", score + "% sufficient");
    wrap.style.cssText = "position:absolute;left:0;top:0;width:" + W + "px;height:" + H + "px;";
    el.appendChild(wrap);

    var cv = document.createElement("canvas");
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = "position:absolute;left:0;top:0;width:" + W + "px;height:" + H + "px;";
    wrap.appendChild(cv);

    var gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return fallback();

    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    var prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (e) {
      console.error(e);
      cv.remove();
      return fallback();
    }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {};
    ["uRes", "uDpr", "uTime", "uLevel", "uFill", "uTextOn", "uText"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    gl.uniform2f(U.uRes, cv.width, cv.height);
    gl.uniform1f(U.uDpr, dpr);
    gl.uniform1i(U.uText, 0);
    gl.uniform1f(U.uTextOn, 0);

    // The number is drawn to a 2D canvas: glyph coverage in alpha, a soft glow in red,
    // so the shader can colour it per pixel (green in air, white under water).
    var tc = document.createElement("canvas");
    tc.width = cv.width; tc.height = cv.height;
    var tx = tc.getContext("2d");
    var gc = document.createElement("canvas");
    gc.width = cv.width; gc.height = cv.height;
    var gx = gc.getContext("2d");
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    var BASE = CY + 66; // the number sits fully under water, so it never splits at the surface
    function paintGlyphs(ctx, blur) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, tc.width, tc.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.filter = blur ? "blur(" + (6 * dpr) + "px)" : "none";
      ctx.fillStyle = "#fff";
      var num = String(shown);
      var big = '600 72px Roboto, Arial, sans-serif';
      var small = '600 24px Roboto, Arial, sans-serif';
      ctx.font = big; var mb = ctx.measureText(num);
      var nw = mb.actualBoundingBoxRight != null ? mb.actualBoundingBoxRight : mb.width;
      ctx.font = small; var pw = ctx.measureText("%").width;
      var x0 = CX - (nw + pw) / 2;
      ctx.font = big; ctx.fillText(num, x0, BASE);
      ctx.font = small; ctx.fillText("%", x0 + nw + 1, BASE - 38);
      ctx.font = "600 12px Roboto, system-ui, sans-serif";
      var label = "SUFFICIENT", sp = 2.4, lw = 0, i;
      for (i = 0; i < label.length; i++) lw += ctx.measureText(label[i]).width + (i < label.length - 1 ? sp : 0);
      var lx = CX - lw / 2;
      for (i = 0; i < label.length; i++) { ctx.fillText(label[i], lx, BASE + 24); lx += ctx.measureText(label[i]).width + sp; }
      ctx.filter = "none";
    }
    function drawText() {
      paintGlyphs(tx, false);
      paintGlyphs(gx, true);
      // compose: red = glow, alpha = glyph coverage
      var a = tx.getImageData(0, 0, tc.width, tc.height);
      var g = gx.getImageData(0, 0, tc.width, tc.height).data;
      var d = a.data;
      for (var i = 0; i < d.length; i += 4) {
        var cov = d[i + 3];
        d[i] = g[i + 3]; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = cov;
      }
      gl.bindTexture(gl.TEXTURE_2D, tex);
      // unpremultiplied upload so red survives where alpha is 0
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tc.width, tc.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(d.buffer));
      gl.uniform1f(U.uTextOn, 1);
    }

    function render(fill, time) {
      gl.viewport(0, 0, cv.width, cv.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(U.uFill, fill);
      gl.uniform1f(U.uLevel, levelFor(fill));
      gl.uniform1f(U.uTime, time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    var shown = -1, t0 = performance.now(), start = t0, DUR = 1200, fontsReady = false;
    var target = Math.max(0, Math.min(100, score)) / 100;

    function frame(now) {
      if (!alive) return;
      var k = reduce ? 1 : Math.min(1, (now - start) / DUR);
      var e = 1 - Math.pow(1 - k, 3);
      var n = Math.round(e * score);
      if (n !== shown) { shown = n; drawText(); }
      render(e * target, reduce ? 6.0 : (now - t0) / 1000);
      if (!reduce) raf = requestAnimationFrame(frame);
    }

    if (document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load('600 72px "Playfair Display"'),
        document.fonts.load("600 12px Roboto")
      ]).then(function () {
        if (!alive) return;
        fontsReady = true;
        shown = -1;
        if (reduce) frame(performance.now());
      }, function () {});
    }
    raf = requestAnimationFrame(frame);

    return {
      dispose: function () {
        alive = false;
        cancelAnimationFrame(raf);
        var lose = gl.getExtension("WEBGL_lose_context");
        if (lose) lose.loseContext();
        wrap.remove();
      }
    };

    // No WebGL: a still drawing of the blob at the score, number counting up.
    function fallback() {
      var yW = levelFor(score / 100);
      wrap.insertAdjacentHTML("afterbegin",
        '<svg width="' + W + '" height="' + H + '" style="position:absolute;left:0;top:0">' +
        '<defs><clipPath id="blobC"><circle cx="' + CX + '" cy="' + CY + '" r="' + R + '"/></clipPath>' +
        '<linearGradient id="blobW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ABE6CC"/><stop offset="1" stop-color="#2A805A"/></linearGradient></defs>' +
        '<ellipse cx="' + CX + '" cy="' + (CY + R + 16) + '" rx="' + (R * 0.75) + '" ry="10" fill="#101828" opacity="0.08"/>' +
        '<circle cx="' + CX + '" cy="' + CY + '" r="' + R + '" fill="#F2F4F7"/>' +
        '<rect x="0" y="' + yW + '" width="' + W + '" height="' + H + '" fill="url(#blobW)" clip-path="url(#blobC)"/>' +
        '<circle cx="' + CX + '" cy="' + CY + '" r="' + R + '" fill="none" stroke="#D0D5DD" stroke-width="1.2"/>' +
        '</svg>' +
        '<div style="position:absolute;left:0;right:0;top:' + (BASE - 64) + 'px;text-align:center;color:#1D4D38;text-shadow:0 0 10px #fff">' +
        '<span class="blob-n" style="font:600 72px/74px \'Playfair Display\',Georgia,serif">0</span>' +
        '<span style="font:600 24px \'Playfair Display\',Georgia,serif;vertical-align:36px">%</span>' +
        '<div style="font:600 12px Roboto,system-ui,sans-serif;letter-spacing:2.4px">SUFFICIENT</div></div>');
      var span = wrap.querySelector(".blob-n"), s0 = performance.now();
      (function tick(now) {
        if (!alive) return;
        var k = reduce ? 1 : Math.min(1, (now - s0) / 1200);
        span.textContent = Math.round((1 - Math.pow(1 - k, 3)) * score);
        if (k < 1) raf = requestAnimationFrame(tick);
      })(s0);
      return { dispose: function () { alive = false; cancelAnimationFrame(raf); wrap.remove(); } };
    }
  };
})();
