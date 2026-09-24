/* Liquid Metal: Paper Shaders' liquid metal poured into a ring. The first 54%
   of the ring is green chrome, the rest a flat gray track, so it reads as the
   score before it reads as an effect. The metal shape is generated at runtime
   (a round-capped arc drawn on a canvas), run through toProcessedLiquidMetal
   once, then revealed clockwise by a conic mask while the number counts up.
   A plain SVG gradient arc stands in until the shader is ready, and stays if
   WebGL2 is not available. */
(function () {
  window.HEROES = window.HEROES || {};

  var SVGNS = "http://www.w3.org/2000/svg";
  var BOX = 272;            // ring box, css px
  var STROKE = 30;          // ring thickness, css px
  var TEX = 1024;           // shape canvas size
  var R_TEX = 436;          // ring radius on the shape canvas
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

  window.HEROES.metal = function (root, opts) {
    var score = Math.max(0, Math.min(100, (opts && opts.score) || 0));
    var frac = score / 100;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var alive = true, raf = 0, mount = null, blobUrl = null;

    var stage = el("div", "position:absolute;inset:0;overflow:visible;", root);

    // soft ground glow so the ring sits on the page
    el("div", "position:absolute;left:50%;top:" + (18 + BOX / 2) + "px;width:320px;height:320px;" +
      "transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;" +
      "background:radial-gradient(closest-side, rgba(203,240,224,0.55), rgba(230,250,241,0.25) 55%, rgba(252,252,253,0) 100%);", stage);

    var box = el("div", "position:absolute;left:" + (342 - BOX) / 2 + "px;top:18px;width:" + BOX + "px;height:" + BOX + "px;", stage);

    // track
    var s = svg("svg", { width: BOX, height: BOX, viewBox: "0 0 " + BOX + " " + BOX }, box);
    s.style.cssText = "position:absolute;inset:0;overflow:visible;";
    var defs = svg("defs", {}, s);
    var lg = svg("linearGradient", { id: "metalFallbackGrad", x1: "0", y1: "0", x2: "1", y2: "1" }, defs);
    svg("stop", { offset: "0%", "stop-color": "#CBF0E0" }, lg);
    svg("stop", { offset: "45%", "stop-color": "#299D6B" }, lg);
    svg("stop", { offset: "100%", "stop-color": "#1D4D38" }, lg);
    var cx = BOX / 2;
    svg("circle", { cx: cx, cy: cx, r: R_CSS, fill: "none", stroke: "#E4E7EC", "stroke-width": STROKE }, s);
    // a faint inner lip gives the track a pressed-in feel
    svg("circle", { cx: cx, cy: cx, r: R_CSS - STROKE / 2 + 1, fill: "none", stroke: "#D9DDE3", "stroke-width": 1 }, s);
    svg("circle", { cx: cx, cy: cx, r: R_CSS + STROKE / 2 - 1, fill: "none", stroke: "#FFFFFF", "stroke-width": 1.2, opacity: 0.9 }, s);

    // fallback arc (also the loading state)
    var circ = 2 * Math.PI * R_CSS;
    var fb = svg("circle", {
      cx: cx, cy: cx, r: R_CSS, fill: "none", stroke: "url(#metalFallbackGrad)", "stroke-width": STROKE,
      "stroke-linecap": "round", transform: "rotate(-90 " + cx + " " + cx + ")",
      "stroke-dasharray": "0 " + circ
    }, s);
    fb.style.transition = "opacity .5s ease";

    // liquid metal layer
    var metal = el("div", "position:absolute;inset:0;opacity:0;transition:opacity .6s ease;" +
      "filter:brightness(1.06) saturate(1.05) drop-shadow(0 6px 10px rgba(29,77,56,0.22));", box);
    var metalInner = el("div", "position:absolute;inset:0;", metal);
    // the shader draws neutral chrome; this layer pours brand green into it,
    // clipped to the same arc so the page around it stays untouched
    var shapeUrl = arcShapeDataUrl(frac);
    var tint = el("div", "position:absolute;inset:0;z-index:2;pointer-events:none;mix-blend-mode:color;background:linear-gradient(145deg,#59B38C 0%,#299D6B 55%,#246649 100%);" +
      "-webkit-mask-image:url(" + shapeUrl + ");mask-image:url(" + shapeUrl + ");-webkit-mask-size:100% 100%;mask-size:100% 100%;", metalInner);

    // number
    var label = el("div", "position:absolute;left:0;right:0;top:" + (18 + BOX / 2) + "px;transform:translateY(-50%);" +
      "display:flex;flex-direction:column;align-items:center;pointer-events:none;", stage);
    var numRow = el("div", "display:flex;align-items:flex-start;color:#1D4D38;font-family:'Playfair Display',Georgia,serif;font-weight:600;", label);
    var num = el("span", "font-size:60px;line-height:62px;letter-spacing:-1px;font-variant-numeric:lining-nums tabular-nums;", numRow);
    el("span", "font-size:22px;line-height:30px;margin-left:2px;", numRow).textContent = "%";
    el("div", "margin-top:4px;font-family:Roboto,system-ui,sans-serif;font-size:10.5px;font-weight:600;letter-spacing:2.4px;color:#2A805A;", label).textContent = "SUFFICIENT";

    function setMask(p) {
      // p: 0..1 of the score's own arc; beyond 1 shows the whole shape
      var m;
      if (p >= 1) m = "none";
      else {
        var a = p * (frac * 360) + CAP_DEG + 1;
        m = "conic-gradient(from " + (-CAP_DEG - 1) + "deg at 50% 50%, #000 0deg, #000 " + a.toFixed(2) + "deg, transparent " + (a + 0.6).toFixed(2) + "deg)";
      }
      metalInner.style.webkitMaskImage = m;
      metalInner.style.maskImage = m;
    }

    function render(p) {
      var v = Math.round(score * p);
      num.textContent = v;
      var len = circ * frac * p;
      fb.setAttribute("stroke-dasharray", (p > 0 ? len.toFixed(2) : 0) + " " + circ);
      if (p <= 0) fb.setAttribute("opacity", 0); else if (!metalReady) fb.setAttribute("opacity", 1);
      setMask(p >= 1 ? 1 : p);
    }

    var metalReady = false;
    var t0 = 0, DUR = 1300;
    function ease(x) { return 1 - Math.pow(1 - x, 3); }
    function tick(now) {
      if (!alive) return;
      if (!t0) t0 = now;
      var x = Math.min(1, (now - t0) / DUR);
      render(ease(x));
      if (x < 1) raf = requestAnimationFrame(tick);
    }

    if (reduce) render(1);
    else { render(0); raf = requestAnimationFrame(tick); }

    // build the shader
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
          u_contour: 0.3,
          u_distortion: 0.12,
          u_softness: 0.3,
          u_repetition: 3,
          u_shiftRed: 0,
          u_shiftBlue: 0,
          u_angle: 70,
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
        }, { premultipliedAlpha: true, alpha: true, antialias: true }, reduce ? 0 : 0.55, reduce ? 1200 : 0, 2, undefined, ["u_image"]);
        metalReady = true;
        metal.style.opacity = "1";
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
