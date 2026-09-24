/* Gem Ring: Paper Shaders' Gem Smoke poured into a thick ring, so the band
   reads as emerald crystal with smoke swirling inside it. The first 54% of the
   ring (clockwise from 12) is the gem; the rest is a frosted pale track, so it
   reads as the score before it reads as an effect. The ring shape is drawn on
   a canvas at runtime, run through toProcessedGemSmoke once, then revealed
   clockwise by a conic mask while the number counts up. An SVG gradient arc
   stands in until the shader is ready, and stays if WebGL2 is unavailable. */
(function () {
  window.HEROES = window.HEROES || {};

  var SVGNS = "http://www.w3.org/2000/svg";
  var BOX = 272;            // ring box, css px
  var STROKE = 34;          // ring thickness, css px
  var TEX = 1024;           // shape canvas size
  var R_TEX = 420;          // ring radius on the shape canvas
  var W_TEX = STROKE / BOX * TEX;
  var R_CSS = R_TEX / TEX * BOX;
  var CAP_DEG = (W_TEX / 2) / R_TEX * 180 / Math.PI;

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

  // The gem shape is the score's own arc, round-capped, so the shader bevels
  // both ends like a cut stone rather than slicing them flat.
  function arcShapeDataUrl(frac) {
    var c = document.createElement("canvas");
    c.width = c.height = TEX;
    var g = c.getContext("2d");
    g.lineWidth = W_TEX;
    g.lineCap = "round";
    g.strokeStyle = "#000";
    g.beginPath();
    g.arc(TEX / 2, TEX / 2, R_TEX, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
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

  function injectKeyframes() {
    if (document.getElementById("gemRingKeys")) return;
    var st = document.createElement("style");
    st.id = "gemRingKeys";
    st.textContent =
      "@keyframes gemTwinkle{0%,100%{opacity:0;transform:translate(-50%,-50%) scale(.4) rotate(0deg)}" +
      "45%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(45deg)}70%{opacity:.2;transform:translate(-50%,-50%) scale(.6) rotate(70deg)}}" +
      "@keyframes gemHead{0%,100%{opacity:.75;transform:translate(-50%,-50%) scale(.92)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}}";
    document.head.appendChild(st);
  }

  function sparkle(color, size) {
    // four point star, drawn crisp so it reads as a glint, not a dot
    return "<svg width='" + size + "' height='" + size + "' viewBox='0 0 20 20'><path d='M10 0 C10.9 7 13 9.1 20 10 C13 10.9 10.9 13 10 20 C9.1 13 7 10.9 0 10 C7 9.1 9.1 7 10 0Z' fill='" + color + "'/></svg>";
  }

  window.HEROES.gem = function (root, opts) {
    var score = Math.max(0, Math.min(100, (opts && opts.score) || 0));
    var frac = score / 100;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var alive = true, raf = 0, mount = null, blobUrl = null;
    injectKeyframes();

    var stage = el("div", "position:absolute;inset:0;overflow:visible;", root);
    var TOP = 22;
    var cxPage = 171, cyPage = TOP + BOX / 2;

    // soft emerald bloom so the ring sits in light rather than on the page
    el("div", "position:absolute;left:50%;top:" + cyPage + "px;width:340px;height:340px;" +
      "transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;" +
      "background:radial-gradient(closest-side, rgba(171,230,204,0.50), rgba(230,250,241,0.28) 55%, rgba(252,252,253,0) 100%);", stage);

    var box = el("div", "position:absolute;left:" + (342 - BOX) / 2 + "px;top:" + TOP + "px;width:" + BOX + "px;height:" + BOX + "px;", stage);
    var cx = BOX / 2;

    // frosted track: pale glass with an inner lip and a top rim light
    var s = svg("svg", { width: BOX, height: BOX, viewBox: "0 0 " + BOX + " " + BOX }, box);
    s.style.cssText = "position:absolute;inset:0;overflow:visible;";
    var defs = svg("defs", {}, s);
    var tg = svg("linearGradient", { id: "gemTrackGrad", x1: "0", y1: "0", x2: "0", y2: "1" }, defs);
    svg("stop", { offset: "0%", "stop-color": "#F3FCF8" }, tg);
    svg("stop", { offset: "100%", "stop-color": "#E4E7EC" }, tg);
    var fg = svg("linearGradient", { id: "gemFallbackGrad", x1: "0", y1: "0", x2: "1", y2: "1" }, defs);
    svg("stop", { offset: "0%", "stop-color": "#CBF0E0" }, fg);
    svg("stop", { offset: "40%", "stop-color": "#299D6B" }, fg);
    svg("stop", { offset: "100%", "stop-color": "#1D4D38" }, fg);
    svg("circle", { cx: cx, cy: cx, r: R_CSS, fill: "none", stroke: "url(#gemTrackGrad)", "stroke-width": STROKE }, s);
    svg("circle", { cx: cx, cy: cx, r: R_CSS - STROKE / 2 + 0.8, fill: "none", stroke: "#D0D5DD", "stroke-width": 1, opacity: 0.7 }, s);
    svg("circle", { cx: cx, cy: cx, r: R_CSS + STROKE / 2 - 1, fill: "none", stroke: "#FFFFFF", "stroke-width": 1.4, opacity: 0.95 }, s);

    // fallback arc (also the loading state)
    var circ = 2 * Math.PI * R_CSS;
    var fb = svg("circle", {
      cx: cx, cy: cx, r: R_CSS, fill: "none", stroke: "url(#gemFallbackGrad)", "stroke-width": STROKE,
      "stroke-linecap": "round", transform: "rotate(-90 " + cx + " " + cx + ")",
      "stroke-dasharray": "0 " + circ
    }, s);
    fb.style.transition = "opacity .6s ease";

    // the gem layer; drop shadow in deep green gives it weight on the page
    var gem = el("div", "position:absolute;inset:-12px;opacity:0;transition:opacity .7s ease;" +
      "filter:saturate(1.08) drop-shadow(0 8px 14px rgba(29,77,56,0.28));", box);
    var gemInner = el("div", "position:absolute;inset:0;", gem);

    // cut-stone edges: a bright outer bevel and a mint inner bevel that follow the gem
    var edges = svg("svg", { width: BOX, height: BOX, viewBox: "0 0 " + BOX + " " + BOX }, box);
    edges.style.cssText = "position:absolute;inset:0;overflow:visible;pointer-events:none;mix-blend-mode:screen;opacity:0;transition:opacity .7s ease;";
    var rot = "rotate(-90 " + cx + " " + cx + ")";
    var rOut = R_CSS + STROKE / 2 - 4, rIn = R_CSS - STROKE / 2 + 4;
    var bevelOut = svg("circle", { cx: cx, cy: cx, r: rOut, fill: "none", stroke: "#FFFFFF", "stroke-width": 1.6, opacity: 0.55, "stroke-linecap": "round", transform: rot }, edges);
    var bevelIn = svg("circle", { cx: cx, cy: cx, r: rIn, fill: "none", stroke: "#CBF0E0", "stroke-width": 1.2, opacity: 0.5, "stroke-linecap": "round", transform: rot }, edges);
    function setBevels(p) {
      var o = 2 * Math.PI * rOut, i = 2 * Math.PI * rIn;
      bevelOut.setAttribute("stroke-dasharray", (o * frac * p * 0.96).toFixed(2) + " " + o);
      bevelOut.setAttribute("stroke-dashoffset", (-o * frac * p * 0.02).toFixed(2));
      bevelIn.setAttribute("stroke-dasharray", (i * frac * p * 0.94).toFixed(2) + " " + i);
      bevelIn.setAttribute("stroke-dashoffset", (-i * frac * p * 0.03).toFixed(2));
    }

    // glints ride the gem: a pulsing head at the tip, a few twinkles along it
    var glints = el("div", "position:absolute;inset:0;pointer-events:none;", box);
    var head = el("div", "position:absolute;width:30px;height:30px;border-radius:50%;opacity:0;" +
      "background:radial-gradient(closest-side, #FFFFFF 0%, rgba(230,250,241,.9) 35%, rgba(121,204,168,.35) 70%, rgba(121,204,168,0) 100%);" +
      "transform:translate(-50%,-50%);", glints);
    var twinkles = [
      { t: 0.14, c: "#FFFFFF", s: 13, d: 0.0 },
      { t: 0.33, c: "#FFFFFF", s: 10, d: 1.3 },
      { t: 0.52, c: "#E7C144", s: 9, d: 2.4 },
      { t: 0.74, c: "#FFFFFF", s: 12, d: 0.7 },
      { t: 0.90, c: "#FFFFFF", s: 8, d: 3.1 }
    ].map(function (tw) {
      var n = el("div", "position:absolute;opacity:0;transform:translate(-50%,-50%);line-height:0;" +
        "filter:drop-shadow(0 0 4px rgba(255,255,255,.9));", glints);
      n.innerHTML = sparkle(tw.c, tw.s);
      tw.node = n;
      return tw;
    });
    function atAngle(p, offR) {
      var a = -Math.PI / 2 + p * frac * Math.PI * 2;
      var r = R_CSS + (offR || 0);
      return { x: cx + Math.cos(a) * r, y: cx + Math.sin(a) * r };
    }
    twinkles.forEach(function (tw, i) {
      var pt = atAngle(tw.t, (i % 2 ? -1 : 1) * STROKE * 0.18);
      tw.node.style.left = pt.x + "px";
      tw.node.style.top = pt.y + "px";
    });

    // number
    var label = el("div", "position:absolute;left:0;right:0;top:" + cyPage + "px;transform:translateY(-50%);" +
      "display:flex;flex-direction:column;align-items:center;pointer-events:none;", stage);
    var numRow = el("div", "display:flex;align-items:flex-start;color:#1D4D38;font-family:'Playfair Display',Georgia,serif;font-weight:600;", label);
    var num = el("span", "font-size:60px;line-height:62px;letter-spacing:-1px;font-variant-numeric:lining-nums tabular-nums;", numRow);
    el("span", "font-size:22px;line-height:30px;margin-left:2px;", numRow).textContent = "%";
    el("div", "margin-top:4px;font-family:Roboto,system-ui,sans-serif;font-size:10.5px;font-weight:600;letter-spacing:2.4px;color:#2A805A;", label).textContent = "SUFFICIENT";

    var INSET_SCALE = (BOX + 24) / BOX; // gem layer is 12px larger each side
    function setMask(p) {
      var m;
      if (p >= 1) m = "none";
      else {
        var a = p * (frac * 360) + CAP_DEG * 1.4 + 1;
        m = "conic-gradient(from " + (-CAP_DEG * 1.4 - 1) + "deg at 50% 50%, #000 0deg, #000 " + a.toFixed(2) + "deg, transparent " + (a + 0.8).toFixed(2) + "deg)";
      }
      gemInner.style.webkitMaskImage = m;
      gemInner.style.maskImage = m;
    }

    var gemReady = false;
    function render(p) {
      num.textContent = Math.round(score * p);
      var len = circ * frac * p;
      fb.setAttribute("stroke-dasharray", (p > 0 ? len.toFixed(2) : 0) + " " + circ);
      if (p <= 0) fb.setAttribute("opacity", 0); else if (!gemReady) fb.setAttribute("opacity", 1);
      setMask(p);
      setBevels(p);
      var hp = atAngle(p, 0);
      head.style.left = hp.x + "px";
      head.style.top = hp.y + "px";
      head.style.opacity = p > 0.02 ? 1 : 0;
    }

    function settle() {
      if (reduce) return;
      head.style.animation = "gemHead 4.5s ease-in-out infinite";
      twinkles.forEach(function (tw) {
        tw.node.style.animation = "gemTwinkle 4.8s ease-in-out " + tw.d + "s infinite";
      });
    }
    if (reduce) {
      twinkles.forEach(function (tw) { tw.node.style.opacity = 0.9; });
    }

    var t0 = 0, DUR = 1300;
    function ease(x) { return 1 - Math.pow(1 - x, 3); }
    function tick(now) {
      if (!alive) return;
      if (!t0) t0 = now;
      var x = Math.min(1, (now - t0) / DUR);
      render(ease(x));
      if (x < 1) raf = requestAnimationFrame(tick);
      else settle();
    }
    if (reduce) render(1);
    else { render(0); raf = requestAnimationFrame(tick); }

    // build the shader
    var PS = window.PaperShaders;
    var shapeUrl = arcShapeDataUrl(frac);
    if (PS && PS.ShaderMount && PS.toProcessedGemSmoke) {
      PS.toProcessedGemSmoke(shapeUrl).then(function (result) {
        if (!alive) return null;
        blobUrl = URL.createObjectURL(result.pngBlob);
        return loadImage(blobUrl);
      }).then(function (img) {
        if (!alive || !img) return;
        var col = PS.getShaderColorFromString;
        var sizing = PS.defaultObjectSizing || {};
        var colors = ["#1D4D38", "#299D6B", "#79CCA8", "#E6FAF1", "#FFFFFF"];
        var u = {
          u_colors: colors.map(col),
          u_colorsCount: colors.length,
          u_colorBack: [0, 0, 0, 0],
          u_colorInner: col("#2A805A"),
          u_image: img,
          u_innerDistortion: 0.55,
          u_outerDistortion: 0,
          u_outerGlow: 0,
          u_innerGlow: 1,
          u_offset: 0,
          u_angle: 0,
          u_size: 1,
          u_isImage: true,
          u_shape: 0,
          u_fit: 1,
          u_scale: 1 / INSET_SCALE,
          u_rotation: 0,
          u_offsetX: 0,
          u_offsetY: 0,
          u_originX: sizing.originX != null ? sizing.originX : 0.5,
          u_originY: sizing.originY != null ? sizing.originY : 0.5,
          u_worldWidth: 0,
          u_worldHeight: 0
        };
        mount = new PS.ShaderMount(gemInner, PS.gemSmokeFragmentShader, u,
          { premultipliedAlpha: true, alpha: true, antialias: true },
          reduce ? 0 : 0.35, reduce ? 2400 : 0, 2, undefined, ["u_image"]);
        gemReady = true;
        gem.style.opacity = "1";
        edges.style.opacity = "1";
        fb.style.opacity = "0";
      }).catch(function () { /* keep the SVG arc */ });
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
