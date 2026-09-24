/* Chrome Number: the score is the hero. "54" is cast in Paper Shaders' liquid
   metal, tinted brand green, with a slim bar of the same metal poured to 54%
   over a gray track underneath so it still reads as a share of a whole.
   One shape canvas holds both the digits and the bar, so a single ShaderMount
   (one WebGL context) draws everything. During the intro the digits count up
   in plain deep green on a 2D canvas drawn with the same metrics, then melt
   into chrome with a crossfade while the bar pours. */
(function () {
  window.HEROES = window.HEROES || {};

  var W = 342, H = 320;          // hero box, css px
  var K = 2;                     // shape canvas scale
  var FONT_PX = 170;
  var DIGIT_BASE = 168;          // baseline of the digits, css px (set in layout)
  var DIGIT_TOP = 22, DIGIT_BOT = 204; // region the digit mask layer covers (set in layout)
  var BAR_W = 248, BAR_H = 14, BAR_Y = 264;
  var BAR_X = (W - BAR_W) / 2;
  var GREEN = "#1D4D38";

  function el(tag, css, parent) {
    var n = document.createElement(tag);
    if (css) n.style.cssText = css;
    if (parent) parent.appendChild(n);
    return n;
  }

  function loadImage(src) {
    return new Promise(function (res, rej) {
      var img = new Image();
      img.onload = function () { res(img); };
      img.onerror = rej;
      img.src = src;
    });
  }

  function roundRect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  window.HEROES.chrome = function (root, opts) {
    var score = Math.max(0, Math.min(100, (opts && opts.score) || 0));
    var frac = score / 100;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var alive = true, raf = 0, mount = null, blobUrl = null, fadeRaf = 0;
    var dpr = Math.min(2, window.devicePixelRatio || 1);

    var stage = el("div", "position:absolute;inset:0;overflow:visible;", root);

    // soft light pooling under the number
    el("div", "position:absolute;left:50%;top:112px;width:360px;height:260px;transform:translate(-50%,-50%);" +
      "border-radius:50%;pointer-events:none;" +
      "background:radial-gradient(closest-side, rgba(203,240,224,0.6), rgba(230,250,241,0.28) 55%, rgba(252,252,253,0) 100%);", stage);

    // group layout: digits centred with the % hung off their right edge
    var measure = document.createElement("canvas").getContext("2d");
    var digitsCx = W / 2 - 12;
    function layout() {
      measure.font = "600 " + FONT_PX + "px 'Playfair Display', Georgia, serif";
      var dw = measure.measureText(String(score)).width;
      measure.font = "600 30px Roboto, system-ui, sans-serif";
      var pw = measure.measureText("%").width;
      var total = dw - 6 + pw;
      digitsCx = (W - total) / 2 + dw / 2;
      measure.font = "600 " + FONT_PX + "px 'Playfair Display', Georgia, serif";
      var mt = measure.measureText(String(score));
      var asc = mt.actualBoundingBoxAscent || FONT_PX * 0.7, desc = mt.actualBoundingBoxDescent || 0;
      // ink centred in the 26..204 band
      DIGIT_BASE = Math.round(26 + (178 - (asc + desc)) / 2 + asc);
      DIGIT_TOP = Math.round(DIGIT_BASE - asc - 8);
      DIGIT_BOT = Math.round(DIGIT_BASE + desc + 8);
      pct.style.top = Math.round(DIGIT_BASE - asc + 6) + "px";
      shadow.style.top = (DIGIT_BASE + desc - 4) + "px";
      refl.style.top = (DIGIT_BASE + desc) + "px";
      reflOffset = desc;
      pct.style.left = ((W - total) / 2 + dw - 6).toFixed(1) + "px";
    }

    // ground shadow and reflection sit under the digits
    var reflOffset = 0;
    var shadow = el("div", "position:absolute;left:50%;top:" + (DIGIT_BASE + 6) + "px;width:210px;height:18px;transform:translateX(-50%);" +
      "border-radius:50%;pointer-events:none;filter:blur(6px);background:radial-gradient(closest-side, rgba(29,77,56,0.28), rgba(29,77,56,0));", stage);
    var refl = el("canvas", "position:absolute;left:0;top:" + DIGIT_BASE + "px;width:" + W + "px;height:44px;pointer-events:none;" +
      "-webkit-mask-image:linear-gradient(to bottom, rgba(0,0,0,0.55), transparent 80%);mask-image:linear-gradient(to bottom, rgba(0,0,0,0.55), transparent 80%);", stage);
    refl.width = W * dpr; refl.height = 44 * dpr;

    // plain digits (intro, and fallback)
    var plain = el("canvas", "position:absolute;left:0;top:0;width:" + W + "px;height:" + H + "px;pointer-events:none;", stage);
    plain.width = W * dpr; plain.height = H * dpr;

    // gray track
    var track = el("div", "position:absolute;left:" + BAR_X + "px;top:" + BAR_Y + "px;width:" + BAR_W + "px;height:" + BAR_H + "px;" +
      "border-radius:9999px;background:#E4E7EC;box-shadow:inset 0 1px 2px rgba(16,24,40,0.10), 0 1px 0 #FFFFFF;", stage);
    // fallback / loading bar
    var fbBar = el("div", "position:absolute;left:0;top:0;bottom:0;width:0;border-radius:9999px;transition:opacity .5s ease;" +
      "background:linear-gradient(180deg,#ABE6CC 0%,#299D6B 55%,#1D4D38 100%);", track);

    // metal layer: one shader, masked per region
    var metal = el("div", "position:absolute;left:0;top:0;width:" + W + "px;height:" + H + "px;pointer-events:none;" +
      "filter:brightness(1.12) contrast(0.92) saturate(1.1) drop-shadow(0 5px 9px rgba(29,77,56,0.20));", stage);
    var metalInner = el("div", "position:absolute;inset:0;", metal);

    var pct = el("div", "position:absolute;top:66px;font-family:Roboto,system-ui,sans-serif;font-weight:600;font-size:30px;line-height:30px;color:" + GREEN + ";pointer-events:none;", stage);
    pct.textContent = "%";
    el("div", "position:absolute;left:0;right:0;top:222px;text-align:center;font-family:Roboto,system-ui,sans-serif;" +
      "font-size:11px;font-weight:600;letter-spacing:2.6px;color:#2A805A;pointer-events:none;", stage).textContent = "SUFFICIENT";
    el("div", "position:absolute;left:" + (BAR_X + BAR_W - 40) + "px;width:40px;top:" + (BAR_Y + BAR_H + 7) + "px;text-align:right;" +
      "font-family:Roboto,system-ui,sans-serif;font-size:10px;color:#98A2B3;pointer-events:none;", stage).textContent = "100%";
    el("div", "position:absolute;left:" + BAR_X + "px;top:" + (BAR_Y + BAR_H + 7) + "px;" +
      "font-family:Roboto,system-ui,sans-serif;font-size:10px;color:#98A2B3;pointer-events:none;", stage).textContent = "0";

    layout();

    function drawDigits(g, text, color, scale) {
      g.save();
      g.scale(scale, scale);
      g.font = "600 " + FONT_PX + "px 'Playfair Display', Georgia, serif";
      g.textAlign = "center";
      g.textBaseline = "alphabetic";
      g.fillStyle = color;
      g.fillText(text, digitsCx, DIGIT_BASE);
      g.restore();
    }

    function drawPlain(v, alpha) {
      var g = plain.getContext("2d");
      g.clearRect(0, 0, plain.width, plain.height);
      g.globalAlpha = alpha;
      drawDigits(g, String(v), GREEN, dpr);
      g.globalAlpha = 1;
      var r = refl.getContext("2d");
      r.clearRect(0, 0, refl.width, refl.height);
      // mirrored copy hanging from the baseline (the canvas starts at DIGIT_BASE)
      r.save();
      r.setTransform(dpr, 0, 0, -dpr, 0, 0);
      r.globalAlpha = 0.14;
      r.font = "600 " + FONT_PX + "px 'Playfair Display', Georgia, serif";
      r.textAlign = "center";
      r.fillStyle = "#299D6B";
      r.fillText(String(v), digitsCx, -4 - reflOffset);
      r.restore();
    }

    function shapeDataUrl() {
      var c = document.createElement("canvas");
      c.width = W * K; c.height = H * K;
      var g = c.getContext("2d");
      drawDigits(g, String(score), "#000", K);
      g.save();
      g.scale(K, K);
      g.fillStyle = "#000";
      roundRect(g, BAR_X, BAR_Y, Math.max(BAR_H, BAR_W * frac), BAR_H, BAR_H / 2);
      g.fill();
      g.restore();
      return c.toDataURL("image/png");
    }

    // masks: layer 1 covers the digits with alpha a, layer 2 reveals the bar left to right
    var digitAlpha = 0, barP = 0;
    function applyMask() {
      var a = digitAlpha.toFixed(3);
      var barEnd = BAR_X + Math.max(BAR_H, BAR_W * frac) * barP + 2;
      var stop = (barEnd / W * 100).toFixed(2);
      var m = "linear-gradient(rgba(0,0,0," + a + "), rgba(0,0,0," + a + ")), " +
        "linear-gradient(to right, #000 " + stop + "%, transparent " + stop + "%)";
      var pos = "0px " + DIGIT_TOP + "px, 0px " + (BAR_Y - 6) + "px";
      var size = W + "px " + (DIGIT_BOT - DIGIT_TOP) + "px, " + W + "px " + (BAR_H + 12) + "px";
      var st = metalInner.style;
      st.webkitMaskImage = m; st.maskImage = m;
      st.webkitMaskPosition = pos; st.maskPosition = pos;
      st.webkitMaskSize = size; st.maskSize = size;
      st.webkitMaskRepeat = "no-repeat"; st.maskRepeat = "no-repeat";
    }

    var metalReady = false, introDone = false, melted = false;

    function renderIntro(p) {
      var v = Math.round(score * p);
      drawPlain(v, 1);
      barP = p;
      fbBar.style.width = (Math.max(BAR_H, BAR_W * frac) * p).toFixed(1) + "px";
      fbBar.style.opacity = p > 0 ? 1 : 0;
      applyMask();
    }

    function melt() {
      if (melted || !metalReady || !introDone || !alive) return;
      melted = true;
      fbBar.style.opacity = "0";
      if (reduce) { digitAlpha = 1; applyMask(); drawPlain(score, 0); return; }
      var t0 = 0, D = 800;
      function f(now) {
        if (!alive) return;
        if (!t0) t0 = now;
        var x = Math.min(1, (now - t0) / D);
        var e = x * x * (3 - 2 * x);
        digitAlpha = e;
        applyMask();
        drawPlain(score, 1 - e);
        if (x < 1) fadeRaf = requestAnimationFrame(f);
      }
      fadeRaf = requestAnimationFrame(f);
    }

    var tStart = 0, DUR = 1300;
    function ease(x) { return 1 - Math.pow(1 - x, 3); }
    function tick(now) {
      if (!alive) return;
      if (!tStart) tStart = now;
      var x = Math.min(1, (now - tStart) / DUR);
      renderIntro(ease(x));
      if (x < 1) raf = requestAnimationFrame(tick);
      else { introDone = true; melt(); }
    }

    function start() {
      if (!alive) return;
      layout();
      if (reduce) { renderIntro(1); introDone = true; }
      else { renderIntro(0); raf = requestAnimationFrame(tick); }
      buildMetal();
    }

    function buildMetal() {
      var PS = window.PaperShaders;
      if (!(PS && PS.ShaderMount && PS.toProcessedLiquidMetal)) return;
      var shapeUrl = shapeDataUrl();
      // the shader draws neutral chrome; this layer pours brand green into it
      var maskCss = "-webkit-mask-image:url(" + shapeUrl + ");mask-image:url(" + shapeUrl + ");-webkit-mask-size:100% 100%;mask-size:100% 100%;";
      // hue first, then a light mint multiply so chrome highlights never go page-white
      el("div", "position:absolute;inset:0;z-index:2;pointer-events:none;mix-blend-mode:color;" +
        "background:linear-gradient(165deg,#59B38C 0%,#299D6B 55%,#246649 100%);" + maskCss, metalInner);
      el("div", "position:absolute;inset:0;z-index:3;pointer-events:none;mix-blend-mode:multiply;" +
        "background:linear-gradient(170deg,#E6FAF1 0%,#CBF0E0 45%,#ABE6CC 100%);" + maskCss, metalInner);
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
          u_contour: 0.4,
          u_distortion: 0.1,
          u_softness: 0.3,
          u_repetition: 2.5,
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
        }, { premultipliedAlpha: true, alpha: true, antialias: true }, reduce ? 0 : 0.45, reduce ? 1400 : 0, 2, undefined, ["u_image"]);
        metalReady = true;
        melt();
      }).catch(function () { /* plain digits and gradient bar stay */ });
    }

    applyMask();
    drawPlain(0, 1);
    if (document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load("600 " + FONT_PX + "px 'Playfair Display'", String(score)),
        document.fonts.load("600 30px Roboto", "%")
      ]).then(start, start);
    } else start();

    return {
      dispose: function () {
        alive = false;
        cancelAnimationFrame(raf);
        cancelAnimationFrame(fadeRaf);
        try { if (mount) mount.dispose(); } catch (e) {}
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        root.innerHTML = "";
      }
    };
  };
})();
