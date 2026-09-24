/* Caustic Pool: a round glass basin of clear water, filled to the score.
   The floor and body shimmer with caustic light; the empty glass above the
   waterline is the part of the day still to come. */
(function () {
  window.HEROES = window.HEROES || {};

  var W = 342, H = 320;
  // Basin geometry in CSS px, shared by the shader and the depth labels.
  var CX = 171, RX = 118, RY = 30, YT = 62, YB = 244;

  var VERT = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }";

  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes; uniform float uDpr; uniform float uTime; uniform float uFill; uniform float uTextOn;",
    "uniform sampler2D uText;",
    "const float CX=" + CX + ".0; const float RX=" + RX + ".0; const float RY=" + RY + ".0;",
    "const float YT=" + YT + ".0; const float YB=" + YB + ".0; const float TAU=6.28318530718;",
    "const vec3 B50=vec3(0.953,0.988,0.973); const vec3 B100=vec3(0.902,0.980,0.945);",
    "const vec3 B200=vec3(0.796,0.941,0.878); const vec3 B300=vec3(0.671,0.902,0.800);",
    "const vec3 B400=vec3(0.475,0.800,0.659); const vec3 B500=vec3(0.349,0.702,0.549);",
    "const vec3 B600=vec3(0.161,0.616,0.420);",
    "const vec3 G100=vec3(0.949,0.957,0.969); const vec3 G200=vec3(0.894,0.906,0.925);",
    "const vec3 G300=vec3(0.816,0.835,0.867); const vec3 G400=vec3(0.596,0.635,0.702);",
    // Tileable water caustic (after joltz0r / Dave Hoskins).
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
    "void main(){",
    "  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y)/uDpr;",
    "  float t = uTime; float Hd = YB - YT; vec4 o = vec4(0.0);",
    "  float dx = (p.x-CX)/RX; float adx = abs(dx);",
    "  float arc = RY*sqrt(max(0.0, 1.0-dx*dx));",
    "  float side = clamp(RX - abs(p.x-CX) + 0.5, 0.0, 1.0);",
    // contact shadow
    "  vec2 sq = vec2((p.x-CX)/(RX*0.95), (p.y-(YB+RY+10.0))/12.0);",
    "  o = over(o, vec3(0.063,0.094,0.157), exp(-dot(sq,sq)*2.4)*0.11);",
    // thick glass foot
    "  float inBase = side*clamp(p.y-(YB+arc)+0.5,0.,1.)*clamp((YB+arc+5.0)-p.y+0.5,0.,1.);",
    "  o = over(o, mix(B50, G200, 0.4), inBase*0.9);",
    "  float cyl = side*clamp(p.y-(YT-arc)+0.5,0.,1.)*clamp((YB+arc)-p.y+0.5,0.,1.);",
    "  if (cyl > 0.0) {",
    "    float fres = pow(adx, 5.0);",
    "    vec3 g = mix(vec3(0.972,0.978,0.984), G200, fres*0.7); float ga = 0.48 + fres*0.32;",
    "    float mouth = clamp((YT+arc)-p.y+0.5,0.,1.);",
    "    g = mix(g, G100, mouth*0.6);",
    "    float sheen = exp(-pow((dx+0.66)/0.045,2.0))*0.75 + exp(-pow((dx-0.8)/0.025,2.0))*0.45;",
    "    g = mix(g, vec3(1.0), clamp(sheen,0.,1.)); ga = max(ga, sheen*0.95);",
    "    o = over(o, g, ga*cyl);",
    "    if (uFill > 0.002) {",
    "      float yW = YB - Hd*uFill + sin(p.x*0.045 + t*1.25)*0.9 + sin(p.x*0.11 - t*0.8)*0.4;",
    "      float wIn = cyl*clamp(p.y-(yW-arc)+0.5, 0., 1.);",
    "      if (wIn > 0.0) {",
    "        float surf = clamp((yW+arc)-p.y+0.5, 0., 1.);",
    "        float depthT = clamp((p.y-(yW+arc))/max(YB-yW, 1.0), 0., 1.);",
    "        vec3 body = mix(B200, B500, depthT);",
    "        body = mix(body, B600, depthT*depthT*0.35 + fres*0.35);",
    "        float cb = caustic(vec2(dx*0.55, (p.y-yW)/150.0) + vec2(0.13, 0.0), t*0.45 + 23.0);",
    "        body += vec3(0.93,1.0,0.96)*cb*(0.42 - depthT*0.2);",
    "        vec2 q = vec2(dx, (p.y-yW)/RY); float rq = length(q);",
    "        vec3 sc = mix(B300, B400, smoothstep(0.2, 1.0, rq));",
    "        float cs = caustic(q*0.42 + vec2(0.5,0.31), t*0.5 + 23.0);",
    "        float cs2 = caustic(q*0.8 + vec2(0.2,0.7), t*0.35 + 11.0);",
    "        sc += vec3(0.95,1.0,0.97)*(cs*0.55 + cs2*0.25);",
    "        o = over(o, mix(body, sc, surf), wIn*0.94);",
    // meniscus: bright front edge, a soft glow beneath it, a fainter back edge
    "        o = over(o, vec3(1.0), side*smoothstep(1.4,0.0,abs(p.y-(yW+arc)))*0.95);",
    "        float under = p.y - (yW+arc);",
    "        o = over(o, B400, side*step(0.0,under)*smoothstep(2.2,0.0,abs(under-2.2))*0.45);",
    "        o = over(o, vec3(1.0), side*smoothstep(1.1,0.0,abs(p.y-(yW-arc)))*0.6);",
    "      }",
    "    }",
    // depth marks etched on the front of the glass
    "    float xin = clamp(p.x-(CX-RX+5.0)+0.5,0.,1.)*clamp((CX-RX+19.0)-p.x+0.5,0.,1.);",
    "    for (int k = 1; k <= 4; k++) {",
    "      float yL = YB - Hd*float(k)*0.25;",
    "      o = over(o, G400, xin*smoothstep(0.9,0.1,abs(p.y-(yL+arc)))*0.6);",
    "    }",
    "  }",
    // outlines: rim, walls, front base arc
    "  float onX = clamp(RX - abs(p.x-CX) + 0.5, 0., 1.);",
    "  float rim = onX*max(smoothstep(1.2,0.0,abs(p.y-(YT+arc))), smoothstep(1.2,0.0,abs(p.y-(YT-arc))));",
    "  o = over(o, G300, rim*0.9);",
    "  o = over(o, vec3(1.0), onX*smoothstep(1.0,0.0,abs(p.y-(YT-arc+1.6)))*0.9);",
    "  float yin = clamp(p.y-YT+0.5,0.,1.)*clamp(YB-p.y+0.5,0.,1.);",
    "  o = over(o, G300, smoothstep(1.2,0.0,abs(abs(p.x-CX)-RX))*yin*0.9);",
    "  o = over(o, G300, onX*smoothstep(1.2,0.0,abs(p.y-(YB+arc)))*0.8);",
    "  o = over(o, G200, onX*smoothstep(1.0,0.0,abs(p.y-(YB+arc+5.0)))*0.7);",
    // the number, refracted where it sits under water
    "  if (uTextOn > 0.5) {",
    "    float yWt = YB - Hd*uFill;",
    "    float uw = step(yWt + RY*0.6, p.y)*step(0.002, uFill);",
    "    vec2 off = uw*vec2(sin(p.y*0.19 + t*1.7)*1.0 + sin(p.y*0.061 - t*0.9)*0.5, cos(p.x*0.08 + t*1.2)*0.45);",
    "    vec4 tx = texture2D(uText, (gl_FragCoord.xy + vec2(off.x, -off.y)*uDpr)/uRes);",
    "    o = over(o, tx.rgb, tx.a*0.96);",
    "  }",
    "  gl_FragColor = vec4(o.rgb*o.a, o.a);",
    "}"
  ].join("\n");

  function arcAt(x) {
    var d = (x - CX) / RX;
    return RY * Math.sqrt(Math.max(0, 1 - d * d));
  }

  window.HEROES.pool = function (el, opts) {
    var score = opts && opts.score != null ? opts.score : 54;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var alive = true, raf = 0;

    var wrap = document.createElement("div");
    wrap.setAttribute("role", "img");
    wrap.setAttribute("aria-label", score + "% sufficient");
    wrap.style.cssText = "position:absolute;left:0;top:0;width:" + W + "px;height:" + H + "px;";
    el.appendChild(wrap);

    // Depth labels beside the etched marks.
    [25, 50, 75, 100].forEach(function (v) {
      var yL = YB - (YB - YT) * v / 100 + arcAt(CX - RX + 5);
      var s = document.createElement("span");
      s.textContent = v;
      s.style.cssText = "position:absolute;left:" + (CX - RX - 32) + "px;top:" + (yL - 7) + "px;width:26px;text-align:right;" +
        "font:500 9px/12px Roboto,system-ui,sans-serif;color:#98A2B3;letter-spacing:0.25px;pointer-events:none;";
      wrap.appendChild(s);
    });

    var cv = document.createElement("canvas");
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = "position:absolute;left:0;top:0;width:" + W + "px;height:" + H + "px;";
    wrap.insertBefore(cv, wrap.firstChild);

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
      cv.remove();
      return fallback();
    }
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {};
    ["uRes", "uDpr", "uTime", "uFill", "uTextOn", "uText"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    gl.uniform2f(U.uRes, cv.width, cv.height);
    gl.uniform1f(U.uDpr, dpr);
    gl.uniform1i(U.uText, 0);

    // The number lives in a 2D canvas so the shader can bend it under water.
    var tc = document.createElement("canvas");
    tc.width = cv.width; tc.height = cv.height;
    var tx = tc.getContext("2d");
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    var BASE = 234;
    function drawText(n) {
      tx.setTransform(1, 0, 0, 1, 0, 0);
      tx.clearRect(0, 0, tc.width, tc.height);
      tx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var num = String(n);
      var big = '600 58px "Playfair Display", Georgia, serif';
      var small = '600 20px "Playfair Display", Georgia, serif';
      tx.font = big; var mb = tx.measureText(num); var nw = mb.actualBoundingBoxRight != null ? mb.actualBoundingBoxRight : mb.width;
      tx.font = small; var pw = tx.measureText("%").width;
      var x0 = CX - (nw - 1 + pw) / 2;
      tx.shadowColor = "rgba(255,255,255,0.8)"; tx.shadowBlur = 10;
      tx.fillStyle = "#1D4D38";
      tx.font = big; tx.fillText(num, x0, BASE);
      tx.font = small; tx.fillText("%", x0 + nw - 1, BASE - 30);
      tx.font = '600 10px Roboto, system-ui, sans-serif';
      var label = "SUFFICIENT", sp = 2, lw = 0, i;
      for (i = 0; i < label.length; i++) lw += tx.measureText(label[i]).width + (i < label.length - 1 ? sp : 0);
      var lx = CX - lw / 2;
      for (i = 0; i < label.length; i++) { tx.fillText(label[i], lx, BASE + 19); lx += tx.measureText(label[i]).width + sp; }
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tc);
      gl.uniform1f(U.uTextOn, 1);
    }

    function render(fill, time) {
      gl.viewport(0, 0, cv.width, cv.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(U.uFill, fill);
      gl.uniform1f(U.uTime, time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    var shown = -1, t0 = performance.now(), start = t0, DUR = 1200;
    var target = Math.max(0, Math.min(100, score)) / 100;
    gl.uniform1f(U.uTextOn, 0);

    function frame(now) {
      if (!alive) return;
      var k = reduce ? 1 : Math.min(1, (now - start) / DUR);
      var e = 1 - Math.pow(1 - k, 3);
      var n = Math.round(e * score);
      if (n !== shown) { drawText(n); shown = n; }
      render(e * target, reduce ? 4.0 : (now - t0) / 1000);
      if (!reduce) raf = requestAnimationFrame(frame);
    }

    if (document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load('600 58px "Playfair Display"'),
        document.fonts.load("600 10px Roboto")
      ]).then(function () {
        if (!alive) return;
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

    // No WebGL: a still drawing of the basin at the score, number counting up.
    function fallback() {
      var yW = YB - (YB - YT) * score / 100;
      wrap.insertAdjacentHTML("afterbegin",
        '<svg width="' + W + '" height="' + H + '" style="position:absolute;left:0;top:0">' +
        '<defs><linearGradient id="poolW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CBF0E0"/><stop offset="1" stop-color="#59B38C"/></linearGradient></defs>' +
        '<ellipse cx="' + CX + '" cy="' + (YB + RY + 10) + '" rx="' + (RX * 0.9) + '" ry="10" fill="#101828" opacity="0.08"/>' +
        '<path d="M' + (CX - RX) + ' ' + YT + ' V' + YB + ' A' + RX + ' ' + RY + ' 0 0 0 ' + (CX + RX) + ' ' + YB + ' V' + YT + '" fill="#F2F4F7" opacity="0.7"/>' +
        '<path d="M' + (CX - RX) + ' ' + yW + ' V' + YB + ' A' + RX + ' ' + RY + ' 0 0 0 ' + (CX + RX) + ' ' + YB + ' V' + yW + ' A' + RX + ' ' + RY + ' 0 0 1 ' + (CX - RX) + ' ' + yW + '" fill="url(#poolW)"/>' +
        '<ellipse cx="' + CX + '" cy="' + yW + '" rx="' + RX + '" ry="' + RY + '" fill="#ABE6CC" stroke="#fff" stroke-width="1.4"/>' +
        '<ellipse cx="' + CX + '" cy="' + YT + '" rx="' + RX + '" ry="' + RY + '" fill="none" stroke="#D0D5DD" stroke-width="1.2"/>' +
        '<path d="M' + (CX - RX) + ' ' + YT + ' V' + YB + ' A' + RX + ' ' + RY + ' 0 0 0 ' + (CX + RX) + ' ' + YB + ' V' + YT + '" fill="none" stroke="#D0D5DD" stroke-width="1.2"/>' +
        '</svg>' +
        '<div style="position:absolute;left:0;right:0;top:' + (BASE0() - 52) + 'px;text-align:center;color:#1D4D38">' +
        '<span class="pool-n" style="font:600 58px/60px \'Playfair Display\',Georgia,serif">0</span>' +
        '<span style="font:600 20px \'Playfair Display\',Georgia,serif;vertical-align:28px">%</span>' +
        '<div style="font:600 10px Roboto,system-ui,sans-serif;letter-spacing:2px">SUFFICIENT</div></div>');
      var span = wrap.querySelector(".pool-n"), s0 = performance.now();
      (function tick(now) {
        if (!alive) return;
        var k = reduce ? 1 : Math.min(1, (now - s0) / 1200);
        span.textContent = Math.round((1 - Math.pow(1 - k, 3)) * score);
        if (k < 1) raf = requestAnimationFrame(tick);
      })(s0);
      return { dispose: function () { alive = false; cancelAnimationFrame(raf); wrap.remove(); } };
    }
    function BASE0() { return 234; }
  };
})();
