/* Metal Hexagon: Liquid Metal poured into Kaira's hexagon. A thick rounded
   hexagonal ring sits on a short extrusion so it reads as a physical object;
   the first 54% of its perimeter (clockwise from the top vertex) is green
   chrome, the rest a soft gray track. The shape is sampled once as a dense
   polyline, so the SVG track, the extrusion, the shader's shape image and the
   clockwise reveal all agree on where 54% of the perimeter is. */
(function () {
  window.HEROES = window.HEROES || {};

  var SVGNS = "http://www.w3.org/2000/svg";
  var BOX = 272;          // css px
  var R = 116;            // circumradius of the ring centre line, css px
  var STROKE = 30;        // ring thickness, css px
  var CORNER = 0.22;      // how far along each edge the corner rounding reaches
  var DEPTH = 7;          // extrusion depth, css px
  var TEX = 1024;
  var K = TEX / BOX;      // css -> texture scale

  function el(tag, css, parent) {
    var n = document.createElement(tag);
    if (css) n.style.cssText = css;
    if (parent) parent.appendChild(n);
    return n;
  }
  function svg(tag, attrs, parent) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  // Dense clockwise polyline of a pointy-top rounded hexagon, starting at the
  // apex of the top corner. Returns points and cumulative lengths.
  function sampleHex(cx, cy) {
    var V = [];
    for (var i = 0; i < 6; i++) {
      var a = (-90 + 60 * i) * Math.PI / 180;
      V.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
    }
    function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
    function quad(p0, c, p1, t) {
      var u = 1 - t;
      return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
    }
    var pts = [];
    var N = 48;
    for (var j = 0; j < 6; j++) {
      var v = V[j], prev = V[(j + 5) % 6], next = V[(j + 1) % 6], nn = V[(j + 2) % 6];
      var p1 = lerp(v, prev, CORNER), p2 = lerp(v, next, CORNER);
      // second half of this corner (apex -> p2)
      for (var s = 0; s <= N; s++) pts.push(quad(p1, v, p2, 0.5 + 0.5 * s / N));
      // straight edge to the next corner's entry
      var q1 = lerp(next, v, CORNER);
      for (var e = 1; e <= N; e++) pts.push(lerp(p2, q1, e / N));
      // first half of the next corner (q1 -> apex)
      var q2 = lerp(next, nn, CORNER);
      for (var s2 = 1; s2 <= N; s2++) pts.push(quad(q1, next, q2, 0.5 * s2 / N));
    }
    var len = [0];
    for (var k = 1; k < pts.length; k++) {
      var dx = pts[k][0] - pts[k - 1][0], dy = pts[k][1] - pts[k - 1][1];
      len.push(len[k - 1] + Math.sqrt(dx * dx + dy * dy));
    }
    return { pts: pts, len: len, total: len[len.length - 1] };
  }

  function pointAt(h, d) {
    var lo = 0, hi = h.len.length - 1;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (h.len[mid] < d) lo = mid; else hi = mid; }
    var span = h.len[hi] - h.len[lo] || 1, t = (d - h.len[lo]) / span;
    return [h.pts[lo][0] + (h.pts[hi][0] - h.pts[lo][0]) * t, h.pts[lo][1] + (h.pts[hi][1] - h.pts[lo][1]) * t];
  }

  function pathD(h) {
    var d = "M" + h.pts[0][0].toFixed(2) + " " + h.pts[0][1].toFixed(2);
    for (var i = 1; i < h.pts.length; i++) d += "L" + h.pts[i][0].toFixed(2) + " " + h.pts[i][1].toFixed(2);
    return d + "Z";
  }

  function shapeDataUrl(h, frac) {
    var c = document.createElement("canvas");
    c.width = c.height = TEX;
    var g = c.getContext("2d");
    g.lineWidth = STROKE * K;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.strokeStyle = "#000";
    g.beginPath();
    var end = h.total * frac;
    g.moveTo(h.pts[0][0] * K, h.pts[0][1] * K);
    for (var i = 1; i < h.pts.length && h.len[i] <= end; i++) g.lineTo(h.pts[i][0] * K, h.pts[i][1] * K);
    var last = pointAt(h, end);
    g.lineTo(last[0] * K, last[1] * K);
    g.stroke();
    return c.toDataURL("image/png");
  }

  function loadImage(src) {
    return new Promise(function (res, rej) {
      var img = new Image();
      img.onload = function () { res(img); };
      img.onerror = rej;
      img.src = src;
    });
  }

  window.HEROES.metalhex = function (root, opts) {
    var score = Math.max(0, Math.min(100, (opts && opts.score) || 0));
    var frac = score / 100;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var alive = true, raf = 0, mount = null, blobUrl = null, metalReady = false;

    var cx = BOX / 2, cy = BOX / 2 - 2;
    var hex = sampleHex(cx, cy);
    var d = pathD(hex);
    var capDeg = (STROKE / 2) / (R * 0.9) * 180 / Math.PI;

    var stage = el("div", "position:absolute;inset:0;overflow:visible;", root);
    var TOP = 20;

    // soft glow + contact shadow so the object sits on the page
    el("div", "position:absolute;left:50%;top:" + (TOP + cy) + "px;width:330px;height:330px;transform:translate(-50%,-50%);" +
      "border-radius:50%;pointer-events:none;background:radial-gradient(closest-side, rgba(203,240,224,0.6), rgba(230,250,241,0.28) 55%, rgba(252,252,253,0) 100%);", stage);
    el("div", "position:absolute;left:50%;top:" + (TOP + cy + R + 18) + "px;width:190px;height:18px;transform:translate(-50%,-50%);" +
      "border-radius:50%;pointer-events:none;background:radial-gradient(closest-side, rgba(29,77,56,0.16), rgba(29,77,56,0));", stage);

    var box = el("div", "position:absolute;left:" + (342 - BOX) / 2 + "px;top:" + TOP + "px;width:" + BOX + "px;height:" + BOX + "px;", stage);

    // Track: extrusion side, face, bevel lips
    var s = svg("svg", { width: BOX, height: BOX, viewBox: "0 0 " + BOX + " " + BOX }, box);
    s.style.cssText = "position:absolute;inset:0;overflow:visible;";
    var defs = svg("defs", {}, s);
    var face = svg("linearGradient", { id: "mhFace", x1: "0", y1: "0", x2: "0", y2: "1" }, defs);
    svg("stop", { offset: "0%", "stop-color": "#F2F4F7" }, face);
    svg("stop", { offset: "100%", "stop-color": "#E4E7EC" }, face);
    var fbg = svg("linearGradient", { id: "mhFallback", x1: "0", y1: "0", x2: "1", y2: "1" }, defs);
    svg("stop", { offset: "0%", "stop-color": "#CBF0E0" }, fbg);
    svg("stop", { offset: "45%", "stop-color": "#299D6B" }, fbg);
    svg("stop", { offset: "100%", "stop-color": "#1D4D38" }, fbg);

    var common = { d: d, fill: "none", "stroke-linejoin": "round", pathLength: 1000 };
    function path(attrs) { var o = {}; for (var k in common) o[k] = common[k]; for (var j in attrs) o[j] = attrs[j]; return svg("path", o, s); }

    path({ stroke: "#D0D5DD", "stroke-width": STROKE, transform: "translate(0 " + DEPTH + ")" });      // track side
    var metalSide = path({ stroke: "#1D4D38", "stroke-width": STROKE, "stroke-linecap": "round", transform: "translate(0 " + DEPTH + ")", "stroke-dasharray": "0 1000" });
    path({ stroke: "url(#mhFace)", "stroke-width": STROKE });                                              // track face
    // inner and outer lips give the face a bevel
    var inner = svg("path", { d: d, fill: "none", stroke: "#D0D5DD", "stroke-width": 1, transform: "translate(" + cx + " " + cy + ") scale(" + ((R - STROKE / 2 + 0.8) / R) + ") translate(" + (-cx) + " " + (-cy) + ")" }, s);
    var outer = svg("path", { d: d, fill: "none", stroke: "#FFFFFF", "stroke-width": 1.4, opacity: 0.9, transform: "translate(" + cx + " " + cy + ") scale(" + ((R + STROKE / 2 - 0.8) / R) + ") translate(" + (-cx) + " " + (-cy) + ")" }, s);
    inner.setAttribute("vector-effect", "non-scaling-stroke");
    outer.setAttribute("vector-effect", "non-scaling-stroke");

    // fallback / loading metal (also shown if WebGL2 is unavailable)
    var fb = path({ stroke: "url(#mhFallback)", "stroke-width": STROKE, "stroke-linecap": "round", "stroke-dasharray": "0 1000" });
    fb.style.transition = "opacity .5s ease";

    // Liquid metal layer, revealed clockwise by a conic mask
    var metal = el("div", "position:absolute;inset:0;opacity:0;transition:opacity .6s ease;" +
      "filter:brightness(1.05) saturate(1.05) drop-shadow(0 3px 5px rgba(29,77,56,0.25));", box);
    var metalInner = el("div", "position:absolute;inset:0;", metal);
    var shapeUrl = shapeDataUrl(hex, frac);
    el("div", "position:absolute;inset:0;z-index:2;pointer-events:none;mix-blend-mode:color;" +
      "background:linear-gradient(150deg,#79CCA8 0%,#299D6B 50%,#246649 100%);" +
      "-webkit-mask-image:url(" + shapeUrl + ");mask-image:url(" + shapeUrl + ");-webkit-mask-size:100% 100%;mask-size:100% 100%;", metalInner);

    // Number
    var label = el("div", "position:absolute;left:0;right:0;top:" + (TOP + cy + 2) + "px;transform:translateY(-50%);" +
      "display:flex;flex-direction:column;align-items:center;pointer-events:none;", stage);
    var numRow = el("div", "display:flex;align-items:flex-start;color:#1D4D38;font-family:Roboto,Arial,sans-serif;font-weight:600;", label);
    var num = el("span", "font-size:58px;line-height:60px;letter-spacing:-1px;font-variant-numeric:lining-nums tabular-nums;", numRow);
    el("span", "font-size:21px;line-height:28px;margin-left:2px;", numRow).textContent = "%";
    el("div", "margin-top:3px;font-family:Roboto,system-ui,sans-serif;font-size:10.5px;font-weight:600;letter-spacing:2.4px;color:#2A805A;", label).textContent = "SUFFICIENT";

    function angleAt(dist) {
      var p = pointAt(hex, dist);
      var a = Math.atan2(p[0] - cx, -(p[1] - cy)) * 180 / Math.PI;
      return a < 0 ? a + 360 : a;
    }

    function setMask(p) {
      var m;
      if (p >= 1) m = "none";
      else {
        var a = (p <= 0 ? 0 : angleAt(hex.total * frac * p)) + capDeg + 1;
        m = "conic-gradient(from " + (-capDeg - 1) + "deg at " + (cx / BOX * 100) + "% " + (cy / BOX * 100) + "%, #000 0deg, #000 " + a.toFixed(2) + "deg, transparent " + (a + 0.6).toFixed(2) + "deg)";
      }
      metalInner.style.webkitMaskImage = m;
      metalInner.style.maskImage = m;
    }

    function render(p) {
      num.textContent = Math.round(score * p);
      var dash = (1000 * frac * p).toFixed(1) + " 1000";
      metalSide.setAttribute("stroke-dasharray", dash);
      fb.setAttribute("stroke-dasharray", dash);
      metalSide.setAttribute("opacity", p > 0 ? 1 : 0);
      if (!metalReady) fb.setAttribute("opacity", p > 0 ? 1 : 0);
      setMask(p);
    }

    var t0 = 0, DUR = 1300;
    function ease(x) { return 1 - Math.pow(1 - x, 3); }
    function tick(now) {
      if (!alive) return;
      if (!t0) t0 = now;
      var x = Math.min(1, (now - t0) / DUR);
      render(ease(x));
      if (x < 1) raf = requestAnimationFrame(tick);
    }
    if (reduce) render(1); else { render(0); raf = requestAnimationFrame(tick); }

    var PS = window.PaperShaders;
    if (PS && PS.ShaderMount && PS.toProcessedLiquidMetal) {
      PS.toProcessedLiquidMetal(shapeUrl).then(function (result) {
        if (!alive) return null;
        blobUrl = URL.createObjectURL(result.pngBlob);
        return loadImage(blobUrl);
      }).then(function (img) {
        if (!alive || !img) return;
        var col = PS.getShaderColorFromString;
        var sizing = PS.defaultObjectSizing || {};
        mount = new PS.ShaderMount(metalInner, PS.liquidMetalFragmentShader, {
          u_colorBack: [0, 0, 0, 0],
          u_colorTint: col("#FFFFFF"),
          u_image: img,
          u_contour: 0.35,
          u_distortion: 0.1,
          u_softness: 0.25,
          u_repetition: 2.6,
          u_shiftRed: 0,
          u_shiftBlue: 0,
          u_angle: 60,
          u_isImage: true,
          u_shape: 0,
          u_fit: 1,
          u_scale: 1,
          u_rotation: 0,
          u_offsetX: 0,
          u_offsetY: 0,
          u_originX: sizing.originX != null ? sizing.originX : 0.5,
          u_originY: sizing.originY != null ? sizing.originY : 0.5,
          u_worldWidth: 0,
          u_worldHeight: 0
        }, { premultipliedAlpha: true, alpha: true, antialias: true }, reduce ? 0 : 0.45, reduce ? 1400 : 0, 2, undefined, ["u_image"]);
        metalReady = true;
        metal.style.opacity = "1";
        fb.style.opacity = "0";
      }).catch(function () { /* keep the SVG metal */ });
    }

    return {
      dispose: function () {
        alive = false;
        cancelAnimationFrame(raf);
        try { if (mount) mount.dispose(); } catch (e) {}
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        root.innerHTML = "";
      }
    };
  };
})();
