/* chars-f: "Bright flat". A woman and a man in four breathing scenes.
   Flat colour shapes with no outlines, simple rounded geometry, closed-eye arcs and a tiny mouth,
   warm tan skin, navy-black hair, cheerful calm clothes, a few short darker strokes for folds,
   a clean white ground and only the breath cue in Rhythm gold. Classes "cf-", SVG ids "cf" + random + n. */
(function () {
  var L = LAB.L, C = L.C, PI = Math.PI, TAU = PI * 2, sin = Math.sin, cos = Math.cos;
  var n = 0, pre = "cf" + Math.random().toString(36).slice(2, 6);
  function uid() { return pre + (n++); }
  function f(v) { return Math.round(v * 100) / 100; }
  function full(p) { return p.reduced ? (p.k === "out" ? 0 : 1) : p.e; }
  var ss = function (a, b, x) { x = L.clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  var outQ = function (x) { return 1 - (1 - x) * (1 - x); };

  /* skin and hair, defined once */
  var SK = "#D99A70", SKD = "#C4835B", SKL = "#A8643F", HR = "#1E2638";
  var CH = {
    woman: { w: true, top: "#E8907A", topD: "#D67D67", fold: "#B9604E", pant: "#5E9F98", pantD: "#4F8E87", pfold: "#3D736D", feet: SK, feetD: SKD },
    man: { w: false, top: "#7DAA5B", topD: "#6E9A4D", fold: "#4F7A36", pant: "#F3E4C4", pantD: "#E8D5AF", pfold: "#C7AB7C", feet: "#D9744A", feetD: "#BF6038" }
  };
  var GOLD = C.gold600, GOLDL = C.gold500;

  var css = document.createElement("style");
  css.textContent = ".cf-svg{position:absolute;left:0;top:0;width:320px;height:360px;display:block}";
  document.head.appendChild(css);

  function P(d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '"' + (extra || "") + '/>'; }
  /* a short darker stroke, for folds and texture */
  function K(d, col, w) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + (w || 1.8) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  /* a tapered limb: a capsule from (a,b) radius r1 to (c,d) radius r2 */
  function limb(a, b, c, d, r1, r2) {
    var dx = c - a, dy = d - b, l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l, ny = dx / l;
    return "M" + f(a + nx * r1) + " " + f(b + ny * r1) + "L" + f(c + nx * r2) + " " + f(d + ny * r2) +
      "A" + r2 + " " + r2 + " 0 0 0 " + f(c - nx * r2) + " " + f(d - ny * r2) + "L" + f(a - nx * r1) + " " + f(b - ny * r1) +
      "A" + r1 + " " + r1 + " 0 0 0 " + f(a + nx * r1) + " " + f(b + ny * r1) + "Z";
  }
  function svgOpen() { return '<svg class="cf-svg" viewBox="0 0 320 360" aria-hidden="true"><defs>'; }
  function shadow(cx, cy, rx) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="6" fill="' + C.g100 + '"/>'; }
  /* the one belly cue, the same in every belly scene: two gold arcs opening forward */
  var ARCS = '<path d="M0 -12Q7 0 0 12" stroke-width="3"/><path d="M10 -19Q20 0 10 19" stroke-width="2.4" opacity=".5"/>';

  /* ---------- head in profile, facing right, centred on the skull. lx pushes the lips forward ---------- */
  function faceD(lx) {
    lx = lx || 0;
    return "M-12 27C-23 20 -28 6 -27 -8C-26 -22 -14 -31 1 -31C16 -31 26 -21 27 -8C27.4 -3 28 0 29 2.5L33.6 9.6" +
      "C34.4 11 33.6 12.6 31.4 12.8" +
      "C" + f(32.2 + lx) + " 14 " + f(32.4 + lx) + " 15.6 " + f(31 + lx) + " 16.6" +
      "C" + f(30.4 + lx * .8) + " 17.2 " + f(30.4 + lx * .8) + " 17.8 " + f(31 + lx) + " 18.4" +
      "C" + f(32 + lx) + " 19.8 " + f(31.2 + lx) + " 21.6 29 22.4" +
      "C29.6 25.6 28 29 23 30.6C16 32.6 4 31.6 -12 27Z";
  }
  function neckSide(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' + P("M-8 18L13 18L14 48L-7 48Z", SKD) + '</g>';
  }
  function headSide(c, x, y, s, purse) {
    var lw = f(1.9 / s), o = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">';
    if (c.w) o += '<circle cx="-22" cy="17" r="10" fill="' + HR + '"/>';
    o += '<path class="cf-fc" d="' + faceD(0) + '" fill="' + SK + '"/>';
    var ear = '<ellipse cx="0" cy="5" rx="4.6" ry="6.4" fill="' + SKD + '"/>' + K("M0.6 2Q2.6 5 0.4 8.2", SKL, lw);
    if (!c.w) o += ear;
    o += c.w
      ? P("M-15 22C-27 14 -31 -4 -26 -17C-21 -29 -8 -34 6 -33C19 -32 28 -23 28 -12C22 -16 14 -15 8 -11C3 -8 0 -4 -2 0C-5 6 -7 12 -10 17C-12 20 -13 21 -15 22Z", HR) +
        K("M-22 11Q-17 15 -21 22", "#36415A", lw) + K("M10 -26Q2 -22 -6 -12", "#36415A", lw)
      : P("M-21 14C-28 4 -29 -10 -24 -19C-19 -29 -7 -35 6 -34C18 -33 27 -25 28 -13C29 -9 27 -8 24 -9C18 -11 12 -11 8 -9C4 -7 2 -4 1 -1L-5 -1C-9 2 -12 8 -15 11C-17 13 -19 14 -21 14Z", HR) +
        K("M6 -29Q14 -27 20 -21", "#36415A", lw);
    if (c.w) o += ear;
    o += K("M13 0.4Q17 3.6 21 0.6", HR, lw);
    o += '<path class="cf-m" d="M26.4 17.2Q28.4 18.8 30.2 17.6" fill="none" stroke="' + SKL + '" stroke-width="' + lw + '" stroke-linecap="round"/>';
    if (purse) o += '<ellipse class="cf-o" cx="31.4" cy="17.5" rx="1.2" ry="1.6" fill="' + SKL + '" opacity="0"/>';
    return o + '</g>';
  }
  /* ---------- head from the front, eyes closed ---------- */
  function headFront(c, x, y, s) {
    var lw = f(1.9 / s), o = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">';
    o += P("M-9 18L9 18L10 46L-10 46Z", SKD);
    if (c.w) o += P("M-27 10C-30 -18 -16 -35 0 -35C16 -35 30 -18 27 10C24 16 -24 16 -27 10Z", HR);
    o += '<ellipse cx="-24.4" cy="4" rx="4.6" ry="7" fill="' + SKD + '"/><ellipse cx="24.4" cy="4" rx="4.6" ry="7" fill="' + SKD + '"/>';
    o += P("M0 -30C16 -30 25 -17 25 -1C25 16 14 29 0 29C-14 29 -25 16 -25 -1C-25 -17 -16 -30 0 -30Z", SK);
    o += K("M-14 2.4Q-10 5.8 -6 2.4M6 2.4Q10 5.8 14 2.4", HR, lw);
    o += K("M-3.6 15.4Q0 17.8 3.6 15.4", SKL, lw);
    o += c.w
      ? P("M-25.6 4C-27 -20 -14 -33 0 -33C14 -33 27 -20 25.6 4C24 -8 17 -18 3 -21L0 -17L-3 -21C-17 -18 -24 -8 -25.6 4Z", HR) +
        K("M-6 -27Q-14 -22 -18 -12M6 -27Q14 -22 18 -12", "#36415A", lw)
      : P("M-26 4C-28 -22 -14 -38 2 -37C18 -36 30 -24 26 4C25 -6 23 -12 18 -15C13 -12 4 -13 -4 -15C-10 -16 -16 -15 -20 -12C-23 -9 -25 -3 -26 4Z", HR) +
        K("M-8 -30Q2 -33 12 -30", "#36415A", lw);
    return o + '</g>';
  }

  /* ================= 1. Belly, seated: cross-legged side profile ================= */
  function seated(key, label) {
    var c = CH[key];
    function torso(B) {
      return "M162 130L188 130C200 136 208 150 208 168C208 182 205 190 201 197" +
        "C" + f(199 + B * .4) + " 206 " + f(198 + B) + " 218 " + f(198 + B) + " 232" +
        "C" + f(198 + B) + " 246 " + f(196 + B * .5) + " 258 190 266" +
        "L146 268C146 252 146 236 144 218C141 196 140 174 143 154C146 140 152 132 162 130Z";
    }
    return {
      id: "f-" + key + "-seated", name: "Bright flat, " + label + ", seated",
      note: "Seated cross-legged in side view. The belly outline swells forward with two gold arcs on the in-breath and settles back on the out-breath, while the chest and shoulders stay still.",
      ref: "The person's flat seated meditation reference, Headspace character style, Notion and Humaaans style flat people, Dribbble flat yoga sets",
      bg: "#FFFFFF",
      build: function (stage) {
        stage.innerHTML = svgOpen() + '</defs>' + shadow(212, 314, 96) +
          /* far foot tucked at the back, then the lap and the crossed shin */
          P("M150 298C158 292 176 292 184 298C186 304 176 307 164 306C154 306 148 303 150 298Z", c.feetD) +
          P("M142 258C160 250 212 246 248 248C270 250 284 262 284 276C284 290 272 296 256 296L162 296C146 296 136 288 138 276C138 268 139 262 142 258Z", c.pant) +
          P(limb(270, 290, 176, 302, 9, 8), c.pantD) +
          K("M190 290C214 287 240 286 262 286", c.pfold) + K("M236 268q10 2 16 7", c.pfold) +
          /* near foot crossed in front, under the knee */
          P("M246 294C256 288 276 289 286 296C290 302 282 306 268 306C256 306 244 302 246 294Z", c.feet) +
          K("M252 298q3 3 2 6", c.feetD, 1.6) +
          neckSide(176, 84, 1.25) +
          '<path class="cf-t" fill="' + c.top + '"/>' +
          K("M152 176q-2 12 1 22", c.fold) + K("M160 240q6 4 14 4", c.fold) +
          /* near arm: elbow at the hip behind the belly line, forearm along the thigh, hand on the knee */
          P(limb(174, 148, 168, 232, 8.6, 7.6), SK) +
          P(limb(174, 146, 171, 182, 11.5, 10.6), c.topD) + K("M166 170q4 4 9 3", c.fold, 1.6) +
          P(limb(168, 232, 246, 252, 7.6, 6.2), SK) +
          P("M240 250C248 243 264 244 272 251C275 257 266 262 254 261C245 260 238 256 240 250Z", SK) +
          K("M254 254q6 2 10 1", SKD, 1.5) +
          headSide(c, 176, 84, 1.25) +
          '<g class="cf-rp" fill="none" stroke="' + GOLD + '" stroke-linecap="round">' + ARCS + '</g></svg>';
        var q = function (s) { return stage.querySelector(s); };
        return { t: q(".cf-t"), rp: q(".cf-rp") };
      },
      frame: function (s, p) {
        var e = full(p), B = 10 * e;
        s.t.setAttribute("d", torso(B));
        s.rp.setAttribute("transform", "translate(" + f(211 + B * 1.2) + " 230)");
        s.rp.setAttribute("opacity", f(ss(.15, .9, e)));
      }
    };
  }

  /* ================= 2. Belly, standing: side profile ================= */
  function standing(key, label) {
    var c = CH[key];
    function torso(B) {
      return "M156 104L180 104C193 110 200 122 200 140C200 154 198 163 195 170" +
        "C" + f(193 + B * .4) + " 180 " + f(191 + B) + " 192 " + f(191 + B) + " 206" +
        "C" + f(191 + B) + " 220 " + f(189 + B * .5) + " 232 186 242" +
        "L188 250L134 250C133 240 134 228 136 218C138 204 138 192 136 178C132 158 132 140 136 126C139 114 146 107 156 104Z";
    }
    return {
      id: "f-" + key + "-standing", name: "Bright flat, " + label + ", standing",
      note: "Standing in side view with the arm resting behind the body. Only the belly outline moves: forward with gold arcs on the in-breath, gently back on the out-breath.",
      ref: "Diaphragmatic breathing side diagrams, the person's flat meditation reference, Headspace character style, Humaaans style flat people",
      bg: "#FFFFFF",
      build: function (stage) {
        stage.innerHTML = svgOpen() + '</defs>' + shadow(176, 336, 60) +
          P("M136 240L190 240C192 266 188 298 184 324L158 324C154 298 140 270 136 240Z", c.pant) +
          K("M164 262C166 284 168 302 170 320", c.pfold) + K("M178 300q2 8 1 14", c.pfold, 1.5) +
          (c.w
            ? P("M156 320L182 320C192 322 204 326 207 331C208 335 202 336 192 336L158 336C152 336 152 328 156 320Z", c.feet)
            : P("M154 318L184 318C196 320 208 325 210 331C211 335 204 337 194 337L156 337C150 337 150 328 154 318Z", c.feet) + K("M158 318L184 318", c.feetD, 2)) +
          neckSide(170, 62, 1.12) +
          '<path class="cf-t" fill="' + c.top + '"/>' +
          K("M142 150q-3 14 0 26", c.fold) + K("M150 238q10 3 22 2", c.fold) +
          /* arm hangs behind the belly line */
          P(limb(158, 124, 151, 186, 8, 7), SK) +
          P(limb(151, 186, 154, 228, 7, 5.8), SK) +
          P(limb(160, 122, 156, 158, 11, 10), c.topD) + K("M150 146q4 4 9 3", c.fold, 1.6) +
          P("M148 226C150 220 160 220 162 226L163 238C163 245 155 247 152 242C150 239 148 233 148 226Z", SK) +
          headSide(c, 170, 62, 1.12) +
          '<g class="cf-rp" fill="none" stroke="' + GOLD + '" stroke-linecap="round">' + ARCS + '</g></svg>';
        var q = function (s) { return stage.querySelector(s); };
        return { t: q(".cf-t"), rp: q(".cf-rp") };
      },
      frame: function (s, p) {
        var e = full(p), B = 10 * e;
        s.t.setAttribute("d", torso(B));
        s.rp.setAttribute("transform", "translate(" + f(204 + B * 1.2) + " 206)");
        s.rp.setAttribute("opacity", f(ss(.15, .9, e)));
      }
    };
  }

  /* ================= 3. Bhramari: front view, index fingers on the ear flaps, rings on the hum ================= */
  function bhramari(key, label) {
    var c = CH[key], HX = 160, HY = 112, HS = 1.3, NR = 6;
    /* one arm, for the left of the picture; the other is its mirror */
    var arm = P(limb(124, 176, 82, 168, 9, 7.6), SK) +
      P(limb(82, 168, 104, 130, 7.6, 6.4), SK) +
      P(limb(126, 174, 100, 170, 12, 10.5), c.topD) + K("M108 164q2 5 0 10", c.fold, 1.6) +
      P("M100 119C100 111 108 107 114 109C119 111 120 119 119 127C118 134 112 138 106 136C101 134 100 127 100 119Z", SK) +
      P(limb(112, 113, 130, 115.5, 3.4, 3), SK) +
      K("M104 125q4 2 8 1M104 130q4 2 8 1", SKD, 1.4);
    return {
      id: "f-" + key + "-hum", name: "Bright flat, " + label + ", humming bee",
      note: "Seated cross-legged with eyes closed, elbows out and index fingers resting on the ear flaps. The chest fills a little on the in-breath, then gold rings of sound spread from the head on the hum.",
      ref: "The person's flat seated meditation reference, the approved Ripples of sound, yoga teaching cards for Bhramari, Headspace character style",
      bg: "#FFFFFF",
      build: function (stage) {
        var rings = "";
        for (var i = 0; i < NR; i++) rings += '<circle class="cf-r" cx="' + HX + '" cy="' + HY + '" r="60" fill="none" stroke="' + GOLD + '" opacity="0"/>';
        stage.innerHTML = svgOpen() + '</defs>' +
          '<g>' + rings + '</g>' + shadow(160, 322, 110) +
          P("M64 290C64 268 96 254 128 252L192 252C224 254 256 268 256 290C256 304 236 312 212 312L108 312C84 312 64 304 64 290Z", c.pant) +
          K("M96 282q16 -6 34 -2M224 282q-16 -6 -34 -2", c.pfold) + K("M150 272q10 8 20 0", c.pfold) +
          /* crossed feet in front */
          P("M164 300C150 296 128 298 114 304C106 308 110 316 122 316L160 314Z", c.feet) +
          P("M156 300C170 296 192 298 206 304C214 308 210 316 198 316L160 314Z", c.feetD) +
          K("M152 302q6 6 16 0", c.w ? SKL : c.pfold, 1.6) +
          '<g class="cf-up">' +
          '<path class="cf-ch" d="M114 182C114 168 128 162 146 160L174 160C192 162 206 168 206 182C206 210 203 236 201 262L119 262C117 236 114 210 114 182Z" fill="' + c.top + '"/>' +
          K("M132 252q8 3 16 2M188 252q-8 3 -16 2", c.fold) +
          (c.w ? P("M148 160Q160 172 172 160Z", SKD) : P("M147 160Q160 170 173 160L170 160Q160 166 150 160Z", c.fold)) +
          headFront(c, HX, HY, HS) +
          arm + '<g transform="matrix(-1 0 0 1 320 0)">' + arm + '</g>' +
          '</g></svg>';
        var q = function (s) { return stage.querySelector(s); };
        return { r: [].slice.call(stage.querySelectorAll(".cf-r")), ch: q(".cf-ch"), up: q(".cf-up") };
      },
      frame: function (s, p) {
        var red = p.reduced, e = red ? (p.k === "in" ? 1 : .2) : p.e;
        s.ch.setAttribute("transform", "translate(160 262) scale(" + f(1 + .035 * e) + " " + f(1 + .02 * e) + ") translate(-160 -262)");
        s.up.setAttribute("transform", "translate(0 " + f(-2 * e) + ")");
        var used = 0;
        function draw(r, al, w) {
          var el = s.r[used++]; if (!el) return;
          el.setAttribute("r", f(r)); el.setAttribute("cy", f(HY - 2 * e));
          el.setAttribute("opacity", f(al)); el.setAttribute("stroke-width", f(w));
        }
        if (p.k === "out") {
          if (red) { [[.1, .9], [.45, .6], [.8, .3]].forEach(function (q) { draw(58 + 38 * q[0], q[1], 2.6 - 1.2 * q[0]); }); }
          else {
            var life = 3.6, end = 1 - ss(p.dur - 1, p.dur, p.sec);
            for (var b = .1; b < p.dur - 1.6; b += .9) {
              var age = p.sec - b; if (age < 0 || age > life) continue;
              var x = age / life;
              draw(56 + 40 * outQ(x), Math.pow(1 - x, 1.4) * ss(0, .12, x) * end, 2.8 - 1.6 * x);
            }
          }
        }
        for (; used < s.r.length; used++) s.r[used].setAttribute("opacity", "0");
      }
    };
  }

  /* ================= 4. Pursed lip: profile bust, air in through the nose, a steady stream out ================= */
  function pursed(key, label) {
    var c = CH[key], HX = 136, HY = 118, S = 2;
    var IN1 = "M306 136C276 136 246 139 214 143.6", IN2 = "M306 154C276 154 246 151 214 146.4";
    var OUT = "M210 153C240 153.5 272 155 310 155";
    return {
      id: "f-" + key + "-pursed", name: "Bright flat, " + label + ", pursed lip",
      note: "A side view. Two level lines of air flow into the nose on the short in-breath; then the lips purse into a small o and one long, even gold stream flows out.",
      ref: "The approved Calm profile, the person's pursed lip reference panels, the person's flat meditation reference, Headspace character style",
      bg: "#FFFFFF",
      build: function (stage) {
        var u = uid();
        stage.innerHTML = svgOpen() +
          '<linearGradient id="' + u + 'i" gradientUnits="userSpaceOnUse" x1="306" y1="0" x2="214" y2="0"><stop offset="0" stop-color="' + GOLDL + '" stop-opacity="0"/><stop offset=".45" stop-color="' + GOLDL + '" stop-opacity=".8"/><stop offset="1" stop-color="' + GOLD + '"/></linearGradient>' +
          '<linearGradient id="' + u + 's" gradientUnits="userSpaceOnUse" x1="210" y1="0" x2="312" y2="0"><stop offset="0" stop-color="' + GOLD + '"/><stop offset=".7" stop-color="' + GOLDL + '" stop-opacity=".7"/><stop offset="1" stop-color="' + GOLDL + '" stop-opacity="0"/></linearGradient>' +
          '</defs>' +
          '<g class="cf-bd">' + neckSide(HX, HY, S) +
          P("M104 192L172 192C202 200 224 226 228 264L232 322Q232 334 220 334L86 334Q74 334 74 322L72 264C72 226 82 200 104 192Z", c.top) +
          (c.w ? P("M118 192Q142 210 166 192Z", SKD) : P("M116 192Q142 208 168 192L162 192Q142 202 122 192Z", c.fold)) +
          K("M98 244q-4 18 -2 34", c.fold) + K("M206 254q4 12 4 24", c.fold) +
          headSide(c, HX, HY, S, true) + '</g>' +
          '<g fill="none" stroke-linecap="round">' +
          '<g class="cf-in"><path d="' + IN1 + '" stroke="url(#' + u + 'i)" stroke-width="2.4" pathLength="100" stroke-dasharray="16 9" class="cf-d"/>' +
          '<path d="' + IN2 + '" stroke="url(#' + u + 'i)" stroke-width="2.4" pathLength="100" stroke-dasharray="16 9" class="cf-d"/>' +
          '<path d="M221 140L214.5 145L221 150" stroke="' + GOLD + '" stroke-width="2.4" stroke-linejoin="round"/></g>' +
          '<g class="cf-out" opacity="0"><path d="' + OUT + '" stroke="url(#' + u + 's)" stroke-width="10" opacity=".22"/>' +
          '<path d="' + OUT + '" stroke="url(#' + u + 's)" stroke-width="3"/>' +
          '<path class="cf-sd" d="' + OUT + '" stroke="' + C.white + '" stroke-width="1.6" stroke-dasharray="0.1 14" opacity=".9"/></g>' +
          '</g></svg>';
        var q = function (s) { return stage.querySelector(s); };
        return { bd: q(".cf-bd"), fc: q(".cf-fc"), o: q(".cf-o"), m: q(".cf-m"), ing: q(".cf-in"), d: [].slice.call(stage.querySelectorAll(".cf-d")), out: q(".cf-out"), sd: q(".cf-sd") };
      },
      frame: function (s, p) {
        var red = p.reduced, e = full(p), a = 0, st = 0, pu = 0, T = red ? 0 : p.time;
        if (p.k === "in") a = red ? 1 : L.ease(Math.min(1, p.t / .15)) * L.ease(Math.min(1, (1 - p.t) / .2));
        else {
          st = red ? 1 : L.ease(Math.min(1, p.t / .12)) * L.ease(Math.min(1, (1 - p.t) / .14));
          pu = red ? 1 : L.ease(Math.min(1, p.t / .08)) * L.ease(Math.min(1, (1 - p.t) / .08));
        }
        s.fc.setAttribute("d", faceD(2.4 * pu));
        s.o.setAttribute("opacity", f(pu)); s.o.setAttribute("cx", f(31.6 + 2.4 * pu));
        s.m.setAttribute("opacity", f(1 - pu));
        s.bd.setAttribute("transform", "translate(0 " + f(-1.5 * e) + ")");
        s.ing.setAttribute("opacity", f(a));
        var off = red ? 0 : -p.sec * 40;
        s.d.forEach(function (el) { el.setAttribute("stroke-dashoffset", f(off)); });
        s.out.setAttribute("opacity", f(st));
        s.sd.setAttribute("stroke-dashoffset", f(-T * 26));
      }
    };
  }

  [["woman", "woman"], ["man", "man"]].forEach(function (x) { LAB.add("belly", seated(x[0], x[1])); });
  [["woman", "woman"], ["man", "man"]].forEach(function (x) { LAB.add("belly", standing(x[0], x[1])); });
  [["woman", "woman"], ["man", "man"]].forEach(function (x) { LAB.add("hum", bhramari(x[0], x[1])); });
  [["woman", "woman"], ["man", "man"]].forEach(function (x) { LAB.add("pursed", pursed(x[0], x[1])); });
})();
