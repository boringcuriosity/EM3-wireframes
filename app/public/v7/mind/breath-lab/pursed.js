/* Pursed Lip Breathing: in 2 s through the nose, out 5 s through pursed lips, like blowing on a candle without
   putting it out. Every variant shows a short sniff in, then a long, soft, steady stream out. */
(function () {
  var n = 0, uid = function () { return "bpl" + (n++); };
  var PI = Math.PI, sin = Math.sin, cos = Math.cos;
  var ease = function (t) { return .5 - cos(PI * Math.max(0, Math.min(1, t))) / 2; };
  var frac = function (x) { return x - Math.floor(x); };
  var CYC = 7, IN = 2;                      /* in 2 s, out 5 s */

  var css = document.createElement("style");
  css.textContent =
    ".bp-svg{position:absolute;left:0;top:0;width:320px;height:360px;overflow:visible}" +
    ".bp-orb{position:absolute;width:150px;height:150px;will-change:transform}" +
    ".bp-orb svg{display:block;filter:drop-shadow(0 14px 24px rgba(166,138,45,.20))}";
  document.head.appendChild(css);

  /* one breath, shaped for drawing:
     e    lung fullness, s the steady out-breath (soft ramp in, long flat, soft ramp out), a the sniff,
     time a continuous clock, cyc seconds into the 7 s cycle. Reduced motion: still, readable end states. */
  function norm(p) {
    if (p.reduced) return p.k === "in" ? { e: 1, s: 0, a: 1, time: 0.9, cyc: 0.9, sec: 0.9, k: "in", t: .45, still: 1 }
                                         : { e: .45, s: 1, a: 0, time: 4.6, cyc: 4.6, sec: 2.6, k: "out", t: .52, still: 1 };
    var s = 0, a = 0;
    if (p.k === "out") s = ease(Math.min(1, p.t / .14)) * ease(Math.min(1, (1 - p.t) / .16));
    else a = ease(Math.min(1, p.t / .18)) * ease(Math.min(1, (1 - p.t) / .22));
    return { e: p.e, s: s, a: a, time: p.time, cyc: p.k === "in" ? p.sec : IN + p.sec, sec: p.sec, k: p.k, t: p.t, still: 0 };
  }
  /* is a particle that left `age` seconds ago part of an out-breath? 0..1 (soft at both ends) */
  function outAt(cyc, age) {
    var c = ((cyc - age) % CYC + CYC) % CYC;
    if (c < IN + .1 || c > CYC - .25) return 0;
    return Math.min(1, (c - IN - .1) / .45) * Math.min(1, (CYC - .25 - c) / .5);
  }
  function inAt(cyc, age) {
    var c = ((cyc - age) % CYC + CYC) % CYC;
    if (c > IN - .15) return 0;
    return Math.min(1, c / .2) * Math.min(1, (IN - .15 - c) / .3);
  }

  /* a refined flame: teardrop with a round base, the tip leaning with the breath */
  function flameD(cx, by, H, w, lean) {
    var tx = cx + lean, ty = by - H, my = by - H * .3, lx = cx - w + lean * .14, rx = cx + w + lean * .14, ul = lean * .42;
    return "M" + tx.toFixed(2) + "," + ty.toFixed(2) +
      "C" + (tx - w * .1).toFixed(2) + "," + (ty + H * .3).toFixed(2) + " " + (lx + ul).toFixed(2) + "," + (my - H * .26).toFixed(2) + " " + lx.toFixed(2) + "," + my.toFixed(2) +
      "C" + lx.toFixed(2) + "," + (my + H * .19).toFixed(2) + " " + (cx - w * .6).toFixed(2) + "," + by.toFixed(2) + " " + cx.toFixed(2) + "," + by.toFixed(2) +
      "C" + (cx + w * .6).toFixed(2) + "," + by.toFixed(2) + " " + rx.toFixed(2) + "," + (my + H * .19).toFixed(2) + " " + rx.toFixed(2) + "," + my.toFixed(2) +
      "C" + (rx + ul).toFixed(2) + "," + (my - H * .26).toFixed(2) + " " + (tx + w * .1).toFixed(2) + "," + (ty + H * .3).toFixed(2) + " " + tx.toFixed(2) + "," + ty.toFixed(2) + "Z";
  }
  function flameDefs(u) {
    return '<linearGradient id="' + u + 'fl" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#F09A3E" stop-opacity=".05"/><stop offset=".22" stop-color="#F5AE4A" stop-opacity=".8"/>' +
      '<stop offset=".55" stop-color="#F9CF6E"/><stop offset=".86" stop-color="#FFEDB8"/><stop offset="1" stop-color="#FFE29C" stop-opacity=".85"/></linearGradient>' +
      '<radialGradient id="' + u + 'co" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#FFF8E0" stop-opacity=".95"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient>' +
      '<filter id="' + u + 'sf" x="-60%" y="-30%" width="220%" height="160%"><feGaussianBlur stdDeviation="1.1"/></filter>' +
      '<filter id="' + u + 'gl" x="-150%" y="-80%" width="400%" height="260%"><feGaussianBlur stdDeviation="7"/></filter>';
  }
  function flameEls(u) {
    return '<path class="fg" fill="#FFC45C" opacity=".75" filter="url(#' + u + 'gl)"/>' +
      '<path class="fo" fill="url(#' + u + 'fl)" filter="url(#' + u + 'sf)"/>' +
      '<ellipse class="fb" fill="#8FB6EE" opacity=".32" filter="url(#' + u + 'sf)"/>' +
      '<path class="fw" fill="none" stroke="#3A2E18" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path class="fc" fill="url(#' + u + 'co)" filter="url(#' + u + 'sf)"/>';
  }
  function flameGet(g) { return { g: g.querySelector(".fg"), o: g.querySelector(".fo"), b: g.querySelector(".fb"), w: g.querySelector(".fw"), c: g.querySelector(".fc") }; }
  /* wick: from (cx, wy) up to the flame base */
  function flameSet(f, cx, by, H, w, lean, wy) {
    f.g.setAttribute("d", flameD(cx, by + 2, H * 1.08, w * 1.5, lean * 1.05));
    f.o.setAttribute("d", flameD(cx, by, H, w, lean));
    f.c.setAttribute("d", flameD(cx + lean * .05, by - 2, H * .5, w * .5, lean * .45));
    f.b.setAttribute("cx", (cx + lean * .04).toFixed(2)); f.b.setAttribute("cy", (by - 4).toFixed(2));
    f.b.setAttribute("rx", (w * .62).toFixed(2)); f.b.setAttribute("ry", (H * .09).toFixed(2));
    var wt = by - H * .1;
    f.w.setAttribute("d", "M" + cx + "," + wy + " Q" + (cx + .5) + "," + ((wy + wt) / 2) + " " + (cx + 1.6 + lean * .03).toFixed(2) + "," + wt.toFixed(2));
  }
  /* soft breath lines drifting toward the flame */
  function airEls(u, ys, x0, x1, col) {
    var h = '<linearGradient id="' + u + 'air" gradientUnits="userSpaceOnUse" x1="' + x0 + '" y1="0" x2="' + x1 + '" y2="0">' +
      '<stop offset="0" stop-color="' + col + '" stop-opacity="0"/><stop offset=".35" stop-color="' + col + '" stop-opacity=".9"/>' +
      '<stop offset=".78" stop-color="' + col + '" stop-opacity=".7"/><stop offset="1" stop-color="' + col + '" stop-opacity="0"/></linearGradient>';
    h += '<filter id="' + u + 'ab" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation=".6"/></filter>';
    var g = '<g class="air" opacity="0" fill="none" stroke="url(#' + u + 'air)" stroke-linecap="round" filter="url(#' + u + 'ab)">';
    ys.forEach(function (y, i) {
      var L = x1 - x0;
      g += '<path stroke-width="' + (i === 1 ? 2 : 1.4) + '" stroke-dasharray="' + (i === 1 ? "56 26" : "40 34") + '" d="M' + x0 + ',' + y +
        ' C' + (x0 + L * .3) + ',' + (y - 5) + ' ' + (x0 + L * .62) + ',' + (y + 5) + ' ' + x1 + ',' + (y + (i - 1) * 3 - 1) + '"/>';
    });
    return { defs: h, el: g + '</g>' };
  }

  /* ---------------------------------------------------------------- A: the candle that never goes out */
  LAB.add("pursed", {
    id: "pursed-candle", name: "Steady candle",
    note: "Breathe in and the flame stands tall and bright. Breathe out and it leans away and stays leaning, never flickering out: that is the slow, gentle blow.",
    ref: "The clinic cue \"blow out a candle, slowly\", lit like Calm's night scenes",
    dark: true,
    bg: "radial-gradient(130% 70% at 50% 42%, #3D3016 0%, #231C0F 52%, #15110A 100%)",
    build: function (stage) {
      var u = uid(), air = airEls(u, [170, 183, 196], 4, 134, "#FFE6B0");
      stage.innerHTML = '<svg class="bp-svg" viewBox="0 0 320 360" aria-hidden="true"><defs>' + flameDefs(u) + air.defs +
        '<radialGradient id="' + u + 'h"><stop offset="0" stop-color="#FFCF70" stop-opacity=".5"/><stop offset=".4" stop-color="#E7A947" stop-opacity=".16"/><stop offset="1" stop-color="#E7A947" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="' + u + 'wx" x1="0" x2="1"><stop offset="0" stop-color="#B9A57E"/><stop offset=".28" stop-color="#EFE3C8"/><stop offset=".52" stop-color="#FFF8E8"/><stop offset=".8" stop-color="#D8C7A3"/><stop offset="1" stop-color="#9C8962"/></linearGradient>' +
        '<linearGradient id="' + u + 'wv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD98A" stop-opacity=".55"/><stop offset=".35" stop-color="#FFD98A" stop-opacity="0"/><stop offset="1" stop-color="#2A2112" stop-opacity=".35"/></linearGradient>' +
        '<linearGradient id="' + u + 'br" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3D161"/><stop offset=".5" stop-color="#CDA935"/><stop offset="1" stop-color="#6E5A1E"/></linearGradient>' +
        '</defs>' +
                '<circle class="halo" cx="160" cy="180" r="150" fill="url(#' + u + 'h)"/>' +
        '<ellipse cx="160" cy="334" rx="120" ry="16" fill="url(#' + u + 'h)" class="pool"/>' +
        air.el +
        '<ellipse cx="160" cy="326" rx="54" ry="9" fill="#120E07" opacity=".55"/>' +
        '<ellipse cx="160" cy="320" rx="52" ry="10" fill="url(#' + u + 'br)"/>' +
        '<ellipse cx="160" cy="317" rx="44" ry="6.5" fill="#E7C144" opacity=".55"/>' +
        '<path d="M138,232 L138,314 Q160,320 182,314 L182,232 Z" fill="url(#' + u + 'wx)"/>' +
        '<path d="M138,232 L138,314 Q160,320 182,314 L182,232 Z" fill="url(#' + u + 'wv)"/>' +
        '<path d="M138,232 Q138,240 141,252 Q143,258 141,262 L138,262 Z" fill="#FFF6DF" opacity=".55"/>' +
        '<ellipse cx="160" cy="232" rx="22" ry="5" fill="#FFF3D6"/>' +
        '<ellipse cx="160" cy="232" rx="12" ry="2.6" fill="#FFE39A" opacity=".8" class="melt"/>' +
        '<g class="fl">' + flameEls(u) + '</g></svg>';
      var q = function (s) { return stage.querySelector(s); };
      return { f: flameGet(q(".fl")), halo: q(".halo"), pool: q(".pool"), air: q(".air"), lines: stage.querySelectorAll(".air path") };
    },
    frame: function (S, p) {
      var b = norm(p), T = b.still ? 0 : b.time;
      var flick = b.still ? 0 : sin(T * 6.1) * .6 + sin(T * 9.7 + 1) * .4;
      var H = (66 + 12 * b.e) * (1 - .12 * b.s) + (1 - b.s) * 1.2 * sin(T * 3.3);
      var lean = 26 * b.s + 2 * b.s * flick + (1 - b.s) * .7 * sin(T * 2.1);
      flameSet(S.f, 160, 226, H, 11.5 + 1.5 * b.e, lean, 233);
      var br = .55 + .45 * b.e - .08 * b.s;
      S.halo.setAttribute("r", (120 + 40 * b.e).toFixed(1)); S.halo.setAttribute("opacity", br.toFixed(3));
      S.halo.setAttribute("cx", (160 + lean * .25).toFixed(1));
      S.pool.setAttribute("opacity", (.5 + .5 * b.e).toFixed(3));
      S.air.setAttribute("opacity", (.95 * b.s).toFixed(3));
      for (var i = 0; i < S.lines.length; i++) S.lines[i].setAttribute("stroke-dashoffset", (-(T * (34 + i * 4)) % 1000).toFixed(1));
    }
  });

  /* ---------------------------------------------------------------- B: smell the flower, blow the diya */
  LAB.add("pursed", {
    id: "pursed-flower", name: "Flower, then diya",
    note: "Smell the flower, blow the diya. A soft light moves to the flower as you sniff in, then to the diya as you breathe out, and its flame leans but stays lit.",
    ref: "The pulmonary rehab cue \"smell the flower, blow the candle\" (COPD Foundation, Lee Health)",
    bg: "linear-gradient(180deg, #FFF8E0 0%, #FFFDF5 52%, #FFFFFF 100%)",
    build: function (stage, L) {
      var u = uid(), air = airEls(u, [226, 238, 250], 120, 252, "#CDA935");
      var leaf = L.mix("#75E0A7", "#A68A2D", .5), leafD = L.mix("#17B26A", "#5C4E1F", .55);
      var petal = "M0,0 C-14,-8 -23,-30 -11,-43 C-3,-51 13,-47 16,-33 C18,-21 9,-8 0,0Z", petals = "";
      for (var i = 0; i < 5; i++) petals += '<path d="' + petal + '" transform="rotate(' + (i * 72 - 8) + ')"/>';
      stage.innerHTML = '<svg class="bp-svg" viewBox="0 0 320 360" aria-hidden="true"><defs>' + flameDefs(u) + air.defs +
        '<radialGradient id="' + u + 'sp"><stop offset="0" stop-color="#FDE8A4" stop-opacity=".95"/><stop offset=".5" stop-color="#FDE8A4" stop-opacity=".35"/><stop offset="1" stop-color="#FFF8E0" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="' + u + 'pe" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="48"><stop offset="0" stop-color="#E7C144"/><stop offset=".26" stop-color="#F3D161"/><stop offset=".5" stop-color="#FDE8A4"/><stop offset=".78" stop-color="#FFF8E0"/><stop offset="1" stop-color="#FFFFFF"/></radialGradient>' +
        '<linearGradient id="' + u + 'lf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + leaf + '"/><stop offset="1" stop-color="' + leafD + '"/></linearGradient>' +
        '<linearGradient id="' + u + 'cl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4B46A"/><stop offset=".55" stop-color="#C38948"/><stop offset="1" stop-color="#8E5E2C"/></linearGradient>' +
        '<filter id="' + u + 'ds" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#A68A2D" flood-opacity=".22"/></filter>' +
        '<filter id="' + u + 'bl" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="1.4"/></filter>' +
        '</defs>' +
        '<circle class="spot" cx="96" cy="140" r="100" fill="url(#' + u + 'sp)"/>' +
        '<ellipse cx="108" cy="312" rx="38" ry="5" fill="#A68A2D" opacity=".12"/>' +
        '<ellipse cx="222" cy="312" rx="62" ry="7" fill="#A68A2D" opacity=".14"/>' +
        '<g class="fw">' +
          '<path d="M108,312 C104,270 116,230 104,190 C99,174 97,162 96,150" fill="none" stroke="' + leafD + '" stroke-width="3" stroke-linecap="round"/>' +
          '<path d="M107,262 C124,240 150,236 162,240 C148,256 126,266 107,262Z" fill="url(#' + u + 'lf)"/>' +
          '<path d="M107,262 C130,250 146,244 160,241" fill="none" stroke="#FFF8E0" stroke-opacity=".5" stroke-width="1"/>' +
          '<path d="M108,228 C90,206 66,202 54,206 C66,222 88,232 108,228Z" fill="url(#' + u + 'lf)" opacity=".9"/>' +
          '<path d="M108,228 C88,216 72,210 56,207" fill="none" stroke="#FFF8E0" stroke-opacity=".5" stroke-width="1"/>' +
          '<g class="fh" transform="translate(96,140)"><g class="pt" fill="url(#' + u + 'pe)" stroke="#E7C144" stroke-opacity=".45" stroke-width=".8" filter="url(#' + u + 'ds)">' + petals + '</g>' +
          '<circle r="5" fill="#E7C144"/><circle r="2.4" cx="-1" cy="-1" fill="#FFF8E0" opacity=".8"/></g>' +
        '</g>' +
        '<g class="sc" fill="#E7C144" filter="url(#' + u + 'bl)"></g>' +
        air.el +
        '<g class="dy"><g transform="translate(212,300) scale(1.2) translate(-229,-300)">' +
          '<path d="M172,282 C174,304 196,314 218,314 C240,314 254,304 262,292 C267,286 276,280 286,274 C274,272 263,274 255,278 C232,284 196,286 172,282Z" fill="url(#' + u + 'cl)"/>' +
          '<path d="M172,282 C196,272 236,270 255,278 C232,286 196,288 172,282Z" fill="#7A4C22"/>' +
          '<path d="M178,282 C200,276 232,275 250,280 C230,285 200,286 178,282Z" fill="#E7C144" opacity=".8"/>' +
          '<g fill="#FDE8A4" opacity=".75"><circle cx="196" cy="298" r="1.6"/><circle cx="209" cy="302" r="1.6"/><circle cx="222" cy="303" r="1.6"/><circle cx="235" cy="300" r="1.6"/><circle cx="246" cy="295" r="1.6"/></g>' +
          '<path d="M182,296 C200,308 236,308 252,296" fill="none" stroke="#FDE8A4" stroke-opacity=".5" stroke-width="1"/>' +
          '<g class="fl">' + flameEls(u) + '</g>' +
        '</g></g></svg>';
      var q = function (s) { return stage.querySelector(s); }, sc = q(".sc"), dots = [];
      for (var j = 0; j < 9; j++) { var c = L.svg("circle", { r: (1.6 + (j % 3) * .7).toFixed(1) }); sc.appendChild(c); dots.push(c); }
      return { f: flameGet(q(".fl")), spot: q(".spot"), fw: q(".fw"), fh: q(".fh"), dy: q(".dy"), air: q(".air"), lines: stage.querySelectorAll(".air path"), dots: dots };
    },
    frame: function (S, p) {
      var b = norm(p), T = b.still ? 0 : b.time;
      /* focus: 0 the flower, 1 the diya */
      var f = b.still ? (b.k === "in" ? 0 : 1) : b.k === "in" ? 1 - ease(b.t / .3) : ease(b.t / .18);
      S.spot.setAttribute("cx", (96 + (256 - 96) * f).toFixed(1)); S.spot.setAttribute("cy", (140 + (250 - 140) * f).toFixed(1));
      S.spot.setAttribute("r", (100 - 14 * f + 8 * b.a).toFixed(1));
      S.fw.setAttribute("opacity", (1 - .3 * f).toFixed(3)); S.dy.setAttribute("opacity", (.72 + .28 * f).toFixed(3));
      var sc = 1.18 + .08 * b.e;
      S.fh.setAttribute("transform", "translate(96," + (140 - 2 * b.e).toFixed(2) + ") scale(" + sc.toFixed(4) + ") rotate(" + (8 * b.e).toFixed(2) + ")");
      /* scent rising from the flower toward you */
      for (var i = 0; i < S.dots.length; i++) {
        var ph = frac(b.cyc * .7 + i / S.dots.length), age = ph / .7, v = inAt(b.cyc, age);
        if (b.still) v = b.k === "in" && ph < .85 ? 1 : 0;
        var x = 96 - 8 - 46 * ph + 7 * sin(ph * 7 + i * 1.7), y = 128 - 92 * ph;
        S.dots[i].setAttribute("cx", x.toFixed(1)); S.dots[i].setAttribute("cy", y.toFixed(1));
        S.dots[i].setAttribute("opacity", (v * sin(PI * ph) * .85).toFixed(3));
      }
      var flick = b.still ? 0 : sin(T * 6.3) * .6 + sin(T * 10.1 + 2) * .4;
      var lean = 10 * b.s + 1.2 * b.s * flick + (1 - b.s) * .5 * sin(T * 2.2);
      flameSet(S.f, 280, 270, (44 + 6 * b.e) * (1 - .1 * b.s), 8 + .8 * b.e, lean, 275);
      S.air.setAttribute("opacity", (.85 * b.s).toFixed(3));
      for (var k = 0; k < S.lines.length; k++) S.lines[k].setAttribute("stroke-dashoffset", (-(T * (30 + k * 4)) % 1000).toFixed(1));
    }
  });

  /* ---------------------------------------------------------------- C: a calm profile, breath of light */
  /* the face, facing right; lips purse with p (0 relaxed, 1 pursed) */
  function faceD(pu) {
    var lx = 3.5 * pu, ly = .8 * pu;
    return "M96,340 C98,306 100,284 96,266 C70,244 56,204 60,164 C64,100 112,62 160,66 C206,70 232,104 230,140 " +
      "C230,150 232,154 236,160 C240,170 248,182 254,194 C256,198 254,202 248,203 C244,204 242,206 242,209 " +
      "C" + (244 + lx * .6) + ",212 " + (248 + lx) + "," + (214 - ly) + " " + (250 + lx) + "," + (217 - ly) + " " +
      "C" + (252 + lx) + "," + (220 - ly) + " " + (250 + lx) + ",223 " + (246 + lx * .8) + ",224 " +
      "C" + (250 + lx) + "," + (226 + ly) + " " + (251 + lx) + "," + (230 + ly) + " " + (247 + lx * .7) + "," + (233 + ly) + " " +
      "C244,235 240,237 240,241 C242,249 240,257 232,261 C222,267 206,269 196,271 C188,275 184,294 186,340 Z";
  }
  LAB.add("pursed", {
    id: "pursed-profile", name: "Calm profile",
    note: "A calm face shows the whole technique: a quick breath of light into the nose, then lips softly pursed and a fine, steady stream flowing out.",
    ref: "Headspace's closed-eye breathing character, drawn as a side profile so the nose and lips can be seen",
    bg: "linear-gradient(180deg, #FFF8E0 0%, #FFFDF5 50%, #FFFFFF 100%)",
    build: function (stage, L) {
      var u = uid();
      stage.innerHTML = '<svg class="bp-svg" viewBox="0 0 320 360" aria-hidden="true"><defs>' +
        '<linearGradient id="' + u + 'sk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FDE8A4"/><stop offset=".55" stop-color="#F3D161"/><stop offset="1" stop-color="#E2BA3E"/></linearGradient>' +
        '<radialGradient id="' + u + 'hi" cx=".72" cy=".32" r=".55"><stop offset="0" stop-color="#FFF8E0" stop-opacity=".85"/><stop offset="1" stop-color="#FFF8E0" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="' + u + 'au"><stop offset="0" stop-color="#FDE8A4" stop-opacity=".7"/><stop offset=".6" stop-color="#FFF8E0" stop-opacity=".25"/><stop offset="1" stop-color="#FFF8E0" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="' + u + 'st" gradientUnits="userSpaceOnUse" x1="186" y1="0" x2="318" y2="0"><stop offset="0" stop-color="#CDA935" stop-opacity=".9"/><stop offset=".6" stop-color="#E7C144" stop-opacity=".45"/><stop offset="1" stop-color="#F3D161" stop-opacity="0"/></linearGradient>' +
        '<filter id="' + u + 'gl" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="2.2"/></filter>' +
        '<filter id="' + u + 'ds" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#A68A2D" flood-opacity=".18"/></filter>' +
        '<clipPath id="' + u + 'cp"><rect width="320" height="360"/></clipPath>' +
        '<linearGradient id="' + u + 'hr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7A6526"/><stop offset="1" stop-color="#3F3415"/></linearGradient>' +
        '<linearGradient id="' + u + 'fd" gradientUnits="userSpaceOnUse" x1="0" y1="250" x2="0" y2="336"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
        '<mask id="' + u + 'mk" maskUnits="userSpaceOnUse" x="-100" y="0" width="520" height="360"><rect x="-100" width="520" height="360" fill="url(#' + u + 'fd)"/></mask>' +
        '</defs>' +
        '<circle class="au" cx="120" cy="170" r="140" fill="url(#' + u + 'au)"/>' +
        '<g class="hd" clip-path="url(#' + u + 'cp)"><g mask="url(#' + u + 'mk)"><g class="hr" transform="translate(-64,6)">' +
          '<path class="fc" fill="url(#' + u + 'sk)" filter="url(#' + u + 'ds)"/>' +
          '<path class="fh" fill="url(#' + u + 'hi)"/>' +
          '<path d="M214,104 C204,72 160,56 120,66 C84,76 56,114 56,164 C56,200 66,228 84,248 C96,236 104,220 108,200 C111,184 114,168 122,152 C132,150 138,136 146,124 C160,110 186,100 214,104Z" fill="url(#' + u + 'hr)"/>' +
          '<path d="M188,84 C160,72 126,76 100,100" fill="none" stroke="#FDE8A4" stroke-opacity=".28" stroke-width="2.4" stroke-linecap="round"/>' +
          '<path d="M118,150 C128,146 134,156 132,168 C130,180 124,186 118,184" fill="none" stroke="#CDA935" stroke-width="2" stroke-linecap="round" opacity=".55"/>' +
          '<path d="M197,150 Q206,157 216,151" fill="none" stroke="#5C4E1F" stroke-width="2.2" stroke-linecap="round"/>' +
          '<path d="M199,138 Q209,133 220,137" fill="none" stroke="#A68A2D" stroke-width="1.6" stroke-linecap="round" opacity=".45"/>' +
          '<path d="M238,196 Q242,199 246,198" fill="none" stroke="#A68A2D" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>' +
          '<ellipse class="ck" cx="214" cy="190" rx="13" ry="8" fill="#F5B98A" opacity=".22"/>' +
        '</g></g></g>' +
        '<path class="core" fill="none" stroke="url(#' + u + 'st)" stroke-width="1.6" stroke-linecap="round" opacity="0"/>' +
        '<path class="glow" fill="none" stroke="url(#' + u + 'st)" stroke-width="6" stroke-linecap="round" opacity="0" filter="url(#' + u + 'gl)"/>' +
        '<g class="po"></g><g class="pi"></g></svg>';
      var q = function (s) { return stage.querySelector(s); }, po = [], pi = [];
      for (var i = 0; i < 28; i++) { var c = L.svg("circle", { r: (1 + (i * 7 % 5) * .35).toFixed(2), fill: i % 3 ? "#E7C144" : "#CDA935" }); q(".po").appendChild(c); po.push(c); }
      for (var j = 0; j < 12; j++) { var d = L.svg("circle", { r: (1.2 + (j % 3) * .5).toFixed(2), fill: "#7CD4FD" }); q(".pi").appendChild(d); pi.push(d); }
      return { fc: q(".fc"), fh: q(".fh"), hr: q(".hr"), au: q(".au"), core: q(".core"), glow: q(".glow"), po: po, pi: pi };
    },
    frame: function (S, p) {
      var b = norm(p), T = b.still ? 4.6 : b.time;
      var pu = b.still ? (b.k === "out" ? 1 : 0) : (b.k === "out" ? ease(Math.min(1, b.t / .1)) * ease(Math.min(1, (1 - b.t) / .08)) : 0);
      var d = faceD(pu); S.fc.setAttribute("d", d); S.fh.setAttribute("d", d);
      var lift = 2.5 * b.e, tilt = -1.6 * b.e;
      S.hr.setAttribute("transform", "translate(-64," + (6 - lift).toFixed(2) + ") rotate(" + tilt.toFixed(2) + " 140 300)");
      S.au.setAttribute("r", (124 + 30 * b.e).toFixed(1)); S.au.setAttribute("opacity", (.6 + .4 * b.e).toFixed(3));
      /* lips sit at about (190, 211) after the translate; the stream leaves them and travels right, steady */
      var mx = 188 + 3.5 * pu, my = 211 - lift, LEN = 124, SPD = 58;
      var dd = "M" + mx.toFixed(1) + "," + my.toFixed(1);
      for (var k = 1; k <= 24; k++) { var u2 = k / 24, x = mx + u2 * LEN, y = my + 2.2 * u2 * sin(u2 * 8 - T * 3); dd += " L" + x.toFixed(1) + "," + y.toFixed(1); }
      S.core.setAttribute("d", dd); S.glow.setAttribute("d", dd);
      S.core.setAttribute("opacity", (.8 * b.s).toFixed(3)); S.glow.setAttribute("opacity", (.5 * b.s).toFixed(3));
      for (var i = 0; i < S.po.length; i++) {
        var ph = frac(T * SPD / LEN + i / S.po.length), age = ph * LEN / SPD;
        var v = b.still ? (b.k === "out" ? 1 : 0) : outAt(b.cyc, age);
        var sp = 1.5 + 9 * ph, px = mx + ph * LEN, py = my + sp * sin(i * 2.39 + T * 1.3) + 2.2 * ph * sin(ph * 8 - T * 3);
        S.po[i].setAttribute("cx", px.toFixed(1)); S.po[i].setAttribute("cy", py.toFixed(1));
        S.po[i].setAttribute("opacity", (v * Math.min(1, ph * 6) * (1 - ph) * .95).toFixed(3));
      }
      /* sniff: small cool motes drawn quickly into the nostril */
      var nx = 180, ny = 194 - lift;
      for (var j = 0; j < S.pi.length; j++) {
        var q2 = frac(T * 1.1 + j / S.pi.length), a2 = q2 / 1.1, w = b.still ? (b.k === "in" ? 1 : 0) : inAt(b.cyc, 0) * (a2 >= 0 ? 1 : 0);
        var g2 = 1 - ease(q2), lane = (j % 4) - 1.5;
        S.pi[j].setAttribute("cx", (nx + 4 + 84 * g2).toFixed(1)); S.pi[j].setAttribute("cy", (ny - 26 * g2 + lane * 7 * g2).toFixed(1));
        S.pi[j].setAttribute("opacity", (w * sin(PI * q2) * .8).toFixed(3));
      }
    }
  });

  /* ---------------------------------------------------------------- D: the gold orb and its long thread */
  LAB.add("pursed", {
    id: "pursed-orb", name: "Orb and thread",
    note: "The gold orb fills fast on a short sniff, then lets its air out as one long, thin, steady thread of light while it slowly shrinks.",
    ref: "Today's Mind orb (Coherent), with Apple Mindfulness's single focal shape",
    build: function (stage, L) {
      var u = uid();
      stage.innerHTML = '<svg class="bp-svg" viewBox="0 0 320 360" aria-hidden="true"><defs>' +
        '<radialGradient id="' + u + 'h"><stop offset="0" stop-color="#FDE8A4" stop-opacity=".75"/><stop offset=".55" stop-color="#FFF8E0" stop-opacity=".3"/><stop offset="1" stop-color="#FFF8E0" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="' + u + 'th" gradientUnits="userSpaceOnUse" x1="120" y1="0" x2="314" y2="0"><stop offset="0" stop-color="#CDA935"/><stop offset=".55" stop-color="#E7C144" stop-opacity=".7"/><stop offset="1" stop-color="#F3D161" stop-opacity="0"/></linearGradient>' +
        '<filter id="' + u + 'gl" x="-20%" y="-300%" width="140%" height="700%"><feGaussianBlur stdDeviation="3"/></filter>' +
        '</defs>' +
        '<circle class="halo" cx="104" cy="176" r="110" fill="url(#' + u + 'h)"/>' +
        '<g class="rings" fill="none" stroke="#E7C144"><circle/><circle/></g>' +
        '<path class="tg" fill="none" stroke="url(#' + u + 'th)" stroke-width="8" stroke-linecap="round" filter="url(#' + u + 'gl)" opacity="0"/>' +
        '<path class="tc" fill="none" stroke="url(#' + u + 'th)" stroke-width="2" stroke-linecap="round" opacity="0"/>' +
        '<g class="bd" fill="#FFF8E0" stroke="#E7C144" stroke-width="1"></g></svg>' +
        '<div class="bp-orb">' + LAB.pearl(150) + '</div>';
      var q = function (s) { return stage.querySelector(s); }, bd = [];
      for (var i = 0; i < 6; i++) { var c = L.svg("circle", { r: 2.4 }); q(".bd").appendChild(c); bd.push(c); }
      var o = q(".bp-orb"); o.style.left = (104 - 75) + "px"; o.style.top = (176 - 75) + "px";
      return { o: o, halo: q(".halo"), rings: stage.querySelectorAll(".rings circle"), tg: q(".tg"), tc: q(".tc"), bd: bd };
    },
    frame: function (S, p) {
      var b = norm(p), T = b.still ? 4.6 : b.time, CX = 104, CY = 176;
      var sc = .6 + .4 * b.e, R = 75 * sc;
      S.o.style.transform = "scale(" + sc.toFixed(4) + ")";
      S.halo.setAttribute("r", (R * 1.55).toFixed(1)); S.halo.setAttribute("opacity", (.7 + .3 * b.e).toFixed(3));
      /* sniff: two rings close quickly in on the orb */
      for (var j = 0; j < 2; j++) {
        var q = b.still ? .5 + j * .3 : frac(b.t * 2 + j * .5), rr = R + 40 * (1 - ease(q));
        S.rings[j].setAttribute("cx", CX); S.rings[j].setAttribute("cy", CY); S.rings[j].setAttribute("r", rr.toFixed(1));
        S.rings[j].setAttribute("stroke-width", (1 + 1.2 * q).toFixed(2));
        S.rings[j].setAttribute("opacity", (b.a * sin(PI * q) * .55).toFixed(3));
      }
      /* the thread: leaves the orb's right edge and runs right; its head unrolls at the start, its tail lets go at the end */
      var x0 = CX + R - 3, x1 = 312, Lx = x1 - x0, head = 1, tail = 0;
      if (!b.still) {
        if (b.k === "out") head = Math.min(1, ease(b.sec / 1.4));
        else { tail = Math.min(1, ease(b.sec / 1.1)); }
      }
      var vis = b.still ? (b.k === "out" ? 1 : 0) : (b.k === "out" ? Math.min(1, b.sec / .25) * Math.min(1, (b.dur - b.sec) / .6 + .35) : 1 - tail);
      var d = "", N = 40, first = true;
      for (var i = 0; i <= N; i++) {
        var u2 = i / N; if (u2 > head || u2 < tail) continue;
        var x = x0 + u2 * Lx, y = CY + 5 * Math.pow(u2, 1.3) * sin(u2 * 7.5 - T * 2.6);
        d += (first ? "M" : " L") + x.toFixed(1) + "," + y.toFixed(1); first = false;
      }
      if (!d) d = "M0,0";
      var op = (b.k === "out" || b.still) ? vis : (1 - tail);
      if (b.k === "in" && !b.still) op *= .9;
      if (b.still && b.k === "in") op = 0;
      S.tc.setAttribute("d", d); S.tg.setAttribute("d", d);
      S.tc.setAttribute("opacity", (op * .95).toFixed(3)); S.tg.setAttribute("opacity", (op * .45).toFixed(3));
      /* beads travel the thread at one steady speed */
      for (var k = 0; k < S.bd.length; k++) {
        var ph = frac(T * .42 + k / S.bd.length), age = ph / .42;
        var v = b.still ? (b.k === "out" ? 1 : 0) : outAt(b.cyc, age);
        var bx = x0 + ph * Lx, by = CY + 5 * Math.pow(ph, 1.3) * sin(ph * 7.5 - T * 2.6);
        S.bd[k].setAttribute("cx", bx.toFixed(1)); S.bd[k].setAttribute("cy", by.toFixed(1));
        S.bd[k].setAttribute("r", (2.6 - 1.2 * ph).toFixed(2));
        S.bd[k].setAttribute("opacity", (v * Math.min(1, ph * 8) * (1 - ph) * .95).toFixed(3));
      }
    }
  });
})();
