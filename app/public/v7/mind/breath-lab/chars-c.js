/* chars-c: "Soft light". Matte clay figures shaded with SVG gradients, soft ambient occlusion and a blurred ground
   shadow, no outlines. The breath is warm gold light inside the body or flowing air. Classes "cc-", SVG ids "cc" + n. */
(function () {
  var L = LAB.L, C = L.C, n = 0, PI = Math.PI, TAU = PI * 2;
  /* skin and hair tones, defined once */
  var SKIN_N = "#D8A27D", SKIN_M = "#A0683F", HAIR_M = "#2A201B", HAIR_N = "#6E4E38";

  function hx(h) { h = h.replace("#", ""); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function mx(a, b, f) { var x = hx(a), y = hx(b); return "#" + x.map(function (v, i) { return ("0" + Math.round(v + (y[i] - v) * f).toString(16)).slice(-2); }).join(""); }
  function f2(v) { return Math.round(v * 100) / 100; }
  var ease = L.ease;
  var ss = function (a, b, x) { x = L.clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  var outQ = function (x) { return 1 - (1 - x) * (1 - x); };
  var frac = function (x) { return x - Math.floor(x); };
  function full(p) { return p.reduced ? (p.k === "out" ? 0 : 1) : p.e; }
  /* a capsule from (a,b) radius r1 to (c,d) radius r2, so joints overlap into soft round elbows and knees */
  function limb(a, b, c, d, r1, r2) {
    var dx = c - a, dy = d - b, l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l, ny = dx / l;
    return "M" + f2(a + nx * r1) + " " + f2(b + ny * r1) + "L" + f2(c + nx * r2) + " " + f2(d + ny * r2) +
      "A" + r2 + " " + r2 + " 0 0 0 " + f2(c - nx * r2) + " " + f2(d - ny * r2) + "L" + f2(a - nx * r1) + " " + f2(b - ny * r1) +
      "A" + r1 + " " + r1 + " 0 0 0 " + f2(a + nx * r1) + " " + f2(b + ny * r1) + "Z";
  }

  var CH = {
    neutral: { key: "neutral", label: "neutral figure", skin: SKIN_N, hair: HAIR_N, beard: false, kurta: false,
      top: mx(C.lav100, C.lav300, .55), pants: mx(mx(C.lav300, C.lav500, .3), C.g500, .3) },
    man: { key: "man", label: "man", skin: SKIN_M, hair: HAIR_M, beard: true, kurta: true,
      top: mx(mx(C.sage100, C.sage300, .45), C.g300, .35), pants: mx(C.g500, C.sky500, .18) }
  };
  var REF = "Calm and Headspace breathing characters, Apple Fitness+ soft-light figures, clay 3D illustration trend on Dribbble (Evolum meditation style exploration), the approved Seated profile and Calm profile";

  var css = document.createElement("style");
  css.textContent = ".cc-svg{position:absolute;left:0;top:0;width:320px;height:360px;display:block}";
  document.head.appendChild(css);

  /* ---------- materials: light from the top left, a soft dark falloff bottom right ---------- */
  function defs(u, ch) {
    function lin(id, c) {
      return '<linearGradient id="' + u + id + '" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="' + mx(c, C.white, .3) +
        '"/><stop offset=".55" stop-color="' + c + '"/><stop offset="1" stop-color="' + mx(c, C.g900, .22) + '"/></linearGradient>';
    }
    function blur(id, s) { return '<filter id="' + u + id + '" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="' + s + '"/></filter>'; }
    return lin("sk", ch.skin) + lin("skd", mx(ch.skin, C.g900, .12)) + lin("tp", ch.top) + lin("tpa", mx(ch.top, C.g900, .07)) +
      lin("pa", ch.pants) + lin("pad", mx(ch.pants, C.g900, .14)) + lin("hr", ch.hair || C.g700) +
      '<linearGradient id="' + u + 'nk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + mx(ch.skin, C.g900, .32) + '"/><stop offset=".7" stop-color="' + mx(ch.skin, C.g900, .06) + '"/></linearGradient>' +
      '<linearGradient id="' + u + 'cu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.gold300 + '"/><stop offset=".45" stop-color="' + C.gold400 + '"/><stop offset="1" stop-color="' + C.gold600 + '"/></linearGradient>' +
      '<linearGradient id="' + u + 'mt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.sage100 + '"/><stop offset="1" stop-color="' + mx(C.sage300, C.g500, .4) + '"/></linearGradient>' +
      '<radialGradient id="' + u + 'hl" cx=".36" cy=".24" r=".6"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".42"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + u + 'gl"><stop offset="0" stop-color="' + C.gold400 + '"/><stop offset=".45" stop-color="' + C.gold300 + '" stop-opacity=".8"/><stop offset="1" stop-color="' + C.gold300 + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + u + 'ha"><stop offset="0" stop-color="' + C.gold100 + '"/><stop offset=".7" stop-color="' + C.gold100 + '" stop-opacity=".55"/><stop offset="1" stop-color="' + C.gold100 + '" stop-opacity="0"/></radialGradient>' +
      blur("b6", 6) + blur("b3", 3) + blur("b1", 1.4);
  }
  function svg(stage, d, body) { stage.innerHTML = '<svg class="cc-svg" viewBox="0 0 320 360" aria-hidden="true"><defs>' + d + '</defs>' + body + '</svg>'; }
  function shadow(u, x, y, rx, ry) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + C.gold900 + '" opacity=".18" filter="url(#' + u + 'b6)"/>'; }
  function halo(u, x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#' + u + 'ha)"/>'; }
  /* the belly cue, the same in every belly scene: two soft gold arcs in front of the belly */
  function arcs() {
    return '<g class="cc-ar" fill="none" stroke="' + C.gold600 + '" stroke-linecap="round"><path d="M0 -13Q7 0 0 13" stroke-width="2.6"/><path d="M10 -21Q20 0 10 21" stroke-width="2" opacity=".5"/></g>';
  }

  /* ---------- profile head, facing right, origin at the skull centre; pu purses the lips ---------- */
  function faceD(pu) {
    return "M-14 44C-26 30-34 10-32-8C-30-32-10-46 8-44C24-42 32-28 32-14C32-8 32-4 34 0C36 4 39 9 40 12C41 14 39 16 35 16" +
      "C34.5 18 " + f2(35 + 1.5 * pu) + " 20 " + f2(35 + 2.5 * pu) + " 22.5C" + f2(36 + 3 * pu) + " 24.5 " + f2(36 + 3 * pu) + " 26.5 " + f2(35 + 2.5 * pu) + " 28" +
      "C" + f2(34 + 1.5 * pu) + " 30 33 31 31.5 32C32 35 30 38.5 25 39.5C18 40.5 12 38.5 6 40.5C3 42 1 44 0 46Z";
  }
  function pHead(u, ch) {
    var ink = mx(ch.skin, C.g900, .5), lip = mx(ch.skin, C.rose300, .3), hole = mx(ch.skin, C.g900, .6);
    return '<path class="cc-fc" d="' + faceD(0) + '" fill="url(#' + u + 'sk)"/>' +
      '<path class="cc-fh" d="' + faceD(0) + '" fill="url(#' + u + 'hl)"/>' +
      '<path d="' + (ch.beard ? 'M27 -27C22 -42 2 -50 -16 -44C-32 -38 -38 -18 -34 -2C-33 12 -29 22 -24 28C-18 22 -11 12 -7 2C-4 -6 2 -13 5 -9L9 6C9 -4 11 -14 14 -18C18 -22 23 -22 27 -27Z'
        : 'M25 -29C20 -41 2 -47 -14 -43C-29 -38 -35 -19 -33 0C-32 12 -29 22 -24 28C-18 22 -10 12 -6 2C-3 -4 3 -7 7 -6C9 -14 14 -21 20 -23C23 -24 25 -26 25 -29Z') + '" fill="url(#' + u + 'hr)"/>' +
        '<path d="M18 -38C8 -44 -8 -44 -20 -36" fill="none" stroke="#FFFFFF" stroke-opacity=".1" stroke-width="3" stroke-linecap="round"/>' +
      '<ellipse cx="17" cy="13" rx="7" ry="4" fill="' + C.rose300 + '" opacity=".22"/>' +
      (ch.beard ? '<path d="M6 6C6 18 10 27 17 31C22 32.5 27 30 31 30.5C33 33 32.5 37 28 39.8C22 41.8 14 40.3 7 41.8C3 38 1 26 2 12Z" fill="url(#' + u + 'hr)" opacity=".96"/>' : '') +
      '<ellipse cx="2" cy="5" rx="5.2" ry="8" fill="url(#' + u + 'skd)"/>' +
      '<path d="M1.6 1Q4.6 5 2.2 9.5" fill="none" stroke="' + ink + '" stroke-opacity=".3" stroke-width="1.4" stroke-linecap="round"/>' +
      '<g class="cc-mo">' +
        (ch.beard ? '<path d="M26.5 20.4C29.5 18.6 33.5 18.8 35.8 20.5C33.8 22.1 29.8 22.3 26.5 21.6Z" fill="' + ch.hair + '"/>' : '') +
        '<g class="cc-o" opacity="0"><ellipse cx="36.6" cy="25.4" rx="2.7" ry="3.1" fill="' + lip + '"/><ellipse cx="37.3" cy="25.4" rx="1.15" ry="1.6" fill="' + hole + '"/></g>' +
      '</g>' +
      '<path class="cc-mc" d="M29.5 26.3Q32.5 26.7 34.8 25.8" fill="none" stroke="' + ink + '" stroke-opacity=".55" stroke-width="1.4" stroke-linecap="round"/>' +
      '<path d="M14.5 -3Q19.5 1.4 24.5 -2" fill="none" stroke="' + ink + '" stroke-width="1.9" stroke-linecap="round"/>';
  }
  /* front head, origin at the face centre */
  function fHead(u, ch) {
    var ink = mx(ch.skin, C.g900, .5), F = "M0 -36C18 -36 30 -24 30 -4C30 16 20 34 0 36C-20 34 -30 16 -30 -4C-30 -24 -18 -36 0 -36Z";
    return '<ellipse cx="-29.5" cy="3" rx="5.5" ry="8.5" fill="url(#' + u + 'sk)"/><ellipse cx="29.5" cy="3" rx="5.5" ry="8.5" fill="url(#' + u + 'skd)"/>' +
      '<path d="' + F + '" fill="url(#' + u + 'sk)"/><path d="' + F + '" fill="url(#' + u + 'hl)"/>' +
      (ch.hair ? '<path d="' + (ch.beard ? 'M-31 -2C-34 -28 -16 -43 0 -43C16 -43 34 -28 31 -2C29 -12 24 -20 14 -23C6 -20 -6 -20 -14 -23C-24 -20 -29 -12 -31 -2Z'
        : 'M-30.5 -6C-33 -29 -16 -41 0 -41C16 -41 33 -29 30.5 -6C28 -16 22 -24 12 -26C4 -23.5 -4 -23.5 -12 -26C-22 -24 -28 -16 -30.5 -6Z') + '" fill="url(#' + u + 'hr)"/>' +
        '<path d="M-14 -37C-6 -40 6 -40 14 -37" fill="none" stroke="#FFFFFF" stroke-opacity=".1" stroke-width="3" stroke-linecap="round"/>' : '') +
      '<ellipse cx="-16" cy="12" rx="6.5" ry="3.6" fill="' + C.rose300 + '" opacity=".2"/><ellipse cx="16" cy="12" rx="6.5" ry="3.6" fill="' + C.rose300 + '" opacity=".2"/>' +
      '<ellipse cx="2" cy="8" rx="3" ry="6" fill="' + mx(ch.skin, C.g900, .2) + '" opacity=".35"/>' +
      '<path d="M-3 13.5Q0 15.6 3 13.5" fill="none" stroke="' + ink + '" stroke-opacity=".4" stroke-width="1.4" stroke-linecap="round"/>' +
      (ch.beard ? '<path d="M-29 6C-28 24 -16 38 0 39.5C16 38 28 24 29 6C27 16 22 24 14 27C8 25 -8 25 -14 27C-22 24 -27 16 -29 6Z" fill="url(#' + u + 'hr)" opacity=".96"/>' +
        '<path d="M-9 18.6C-4 16.4 4 16.4 9 18.6C5 20.2 -5 20.2 -9 18.6Z" fill="' + ch.hair + '"/>' : '') +
      '<path d="M-5 22.6Q0 24 5 22.6" fill="none" stroke="' + ink + '" stroke-opacity=".55" stroke-width="1.4" stroke-linecap="round"/>' +
      '<path d="M-16 1Q-11 5-6 1M6 1Q11 5 16 1" fill="none" stroke="' + ink + '" stroke-width="1.9" stroke-linecap="round"/>';
  }

  /* ================= 1. Belly, seated: cross-legged side profile on a gold cushion ================= */
  function seatedD(B) {
    return "M162 122C182 120 198 128 205 144C211 160 212 180 207 198C205 204 204 207 205 212C" + f2(205 + B * .5) + " 220 " + f2(209 + B) + " 226 " + f2(209 + B) + " 238" +
      "C" + f2(209 + B) + " 252 " + f2(203 + B * .5) + " 264 192 270L150 272C142 272 137 264 137 254C135 240 134 220 136 196C138 168 144 136 162 122Z";
  }
  function seated(ch) {
    return {
      id: "c-" + ch.key + "-seated", name: "Soft light, " + ch.label + ", seated",
      note: "A soft clay figure sits on a gold cushion; on the in-breath the lower belly swells forward about 10px and fills with gold light, the hand rests on the knee to keep it clear, and the chest and shoulders stay still.",
      ref: REF,
      build: function (stage) {
        var u = "cc" + (n++), AU = limb(172, 156, 160, 256, 12.5, 10), AF = limb(160, 258, 242, 266, 8.5, 6.5);
        svg(stage, defs(u, ch) + '<clipPath id="' + u + 'tc"><path class="cc-tc"/></clipPath>',
          halo(u, 180, 190, 160) + shadow(u, 178, 326, 116, 7) +
          /* cushion */
          '<path d="M100 300C100 288 136 284 171 284C206 284 242 288 242 300L242 308C242 318 206 324 171 324C136 324 100 318 100 308Z" fill="url(#' + u + 'cu)"/>' +
          '<ellipse cx="166" cy="292" rx="60" ry="5" fill="' + C.gold100 + '" opacity=".55" filter="url(#' + u + 'b3)"/>' +
          /* crossed legs and the near foot */
          '<path d="M138 262C170 256 226 258 258 270C278 278 284 298 270 306C256 314 210 312 160 308C136 306 128 290 130 278C131 270 134 265 138 262Z" fill="url(#' + u + 'pa)"/>' +
          '<path d="M156 292C190 286 232 288 262 296" fill="none" stroke="' + mx(ch.pants, C.g900, .3) + '" stroke-width="3" stroke-linecap="round" opacity=".45" filter="url(#' + u + 'b1)"/>' +
          '<path d="M238 300C246 294 262 294 270 298C274 302 268 307 258 307C248 307 238 306 238 300Z" fill="url(#' + u + 'sk)"/>' +
          (ch.kurta ? '<path d="M140 258L196 260C214 263 232 266 244 274C242 281 236 285 228 286L142 288C135 280 135 268 140 258Z" fill="url(#' + u + 'tpa)"/>' : '') +
          /* neck, torso, the light inside */
          '<path d="' + limb(171, 104, 170, 128, 11, 12) + '" fill="url(#' + u + 'nk)"/>' +
          '<path class="cc-t" fill="url(#' + u + 'tp)"/>' +
          '<g clip-path="url(#' + u + 'tc)"><ellipse class="cc-gl" cx="196" cy="236" rx="36" ry="32" fill="url(#' + u + 'gl)"/>' +
          '<path d="' + AU + '" fill="' + C.g900 + '" opacity=".13" filter="url(#' + u + 'b3)" transform="translate(-4 5)"/></g>' +
          '<g transform="translate(178 76) rotate(4)">' + pHead(u, ch) + '</g>' +
          /* near arm, hand resting on the knee */
          '<path d="' + AU + '" fill="url(#' + u + 'tpa)"/><path d="' + AF + '" fill="url(#' + u + 'sk)"/>' +
          '<ellipse cx="249" cy="267" rx="11" ry="6.5" transform="rotate(8 249 267)" fill="url(#' + u + 'sk)"/>' +
          arcs());
        var q = function (s) { return stage.querySelector(s); };
        return { t: q(".cc-t"), tc: q(".cc-tc"), gl: q(".cc-gl"), ar: q(".cc-ar") };
      },
      frame: function (s, p) {
        var e = full(p), B = 10 * e, d = seatedD(B);
        s.t.setAttribute("d", d); s.tc.setAttribute("d", d);
        s.gl.setAttribute("opacity", f2(.12 + .88 * e)); s.gl.setAttribute("transform", "translate(" + f2(B) + " 0)");
        s.ar.setAttribute("transform", "translate(" + f2(224 + B * 1.4) + " 232)");
        s.ar.setAttribute("opacity", f2(Math.max(0, (e - .2) / .8)));
      }
    };
  }

  /* ================= 2. Belly, standing: side profile on a mat ================= */
  function standD(B) {
    return "M154 104C172 102 186 110 192 124C198 138 199 156 196 172C195 178 194 182 195 186C" + f2(195 + B * .5) + " 196 " + f2(198 + B) + " 204 " + f2(198 + B) + " 214" +
      "C" + f2(198 + B) + " 224 " + f2(194 + B * .4) + " 232 186 236L144 238C138 218 136 196 137 174C138 148 140 120 154 104Z";
  }
  function standing(ch) {
    return {
      id: "c-" + ch.key + "-standing", name: "Soft light, " + ch.label + ", standing",
      note: "Standing side view: breathing in, the belly swells forward with gold light and the soft dome inside it eases down; breathing out, both settle back while the chest stays still.",
      ref: REF + ", diaphragmatic breathing side-profile diagrams",
      build: function (stage) {
        var u = "cc" + (n++), AU = limb(160, 124, 155, 180, 11, 8.5), AF = limb(155, 180, 160, 228, 7.5, 6);
        var foot = function (dx, fill) { return '<path transform="translate(' + dx + ' 0)" d="M150 308C150 300 160 298 172 302C184 305 194 310 194 316C194 320 186 321 170 321L154 321C150 321 149 314 150 308Z" fill="' + fill + '"/>'; };
        svg(stage, defs(u, ch) + '<clipPath id="' + u + 'tc"><path class="cc-tc"/></clipPath>',
          halo(u, 166, 170, 160) + shadow(u, 170, 328, 104, 6) +
          '<rect x="66" y="319" width="210" height="8" rx="4" fill="url(#' + u + 'mt)"/>' +
          /* far leg and foot, near leg and foot */
          '<path d="' + limb(158, 224, 154, 308, 20, 10.5) + '" fill="url(#' + u + 'pad)"/>' + foot(-7, "url(#" + u + "skd)") +
          '<path d="' + limb(170, 224, 164, 308, 21, 11) + '" fill="url(#' + u + 'pa)"/>' + foot(0, "url(#" + u + "sk)") +
          (ch.kurta ? '<path d="M142 226L190 226C196 242 199 256 200 268L140 268C137 254 138 240 142 226Z" fill="url(#' + u + 'tpa)"/>' : '') +
          '<path d="' + limb(153, 90, 152, 110, 9, 10) + '" fill="url(#' + u + 'nk)"/>' +
          '<path class="cc-t" fill="url(#' + u + 'tp)"/>' +
          '<g clip-path="url(#' + u + 'tc)"><ellipse class="cc-gl" cx="184" cy="206" rx="30" ry="28" fill="url(#' + u + 'gl)"/>' +
          '<path class="cc-dm" fill="none" stroke="' + C.gold500 + '" stroke-width="3" stroke-linecap="round" opacity=".3" filter="url(#' + u + 'b1)"/>' +
          '<path d="' + AU + '" fill="' + C.g900 + '" opacity=".13" filter="url(#' + u + 'b3)" transform="translate(-3 5)"/></g>' +
          '<g transform="translate(160 62) rotate(3) scale(.8)">' + pHead(u, ch) + '</g>' +
          '<path d="' + AU + '" fill="url(#' + u + 'tpa)"/><path d="' + AF + '" fill="url(#' + u + 'sk)"/>' +
          '<ellipse cx="161" cy="234" rx="6.5" ry="9.5" transform="rotate(-8 161 234)" fill="url(#' + u + 'sk)"/>' +
          arcs());
        var q = function (x) { return stage.querySelector(x); };
        return { t: q(".cc-t"), tc: q(".cc-tc"), gl: q(".cc-gl"), ar: q(".cc-ar"), dm: q(".cc-dm") };
      },
      frame: function (s, p) {
        var e = full(p), B = 7 * e, d = standD(B);
        s.t.setAttribute("d", d); s.tc.setAttribute("d", d);
        s.gl.setAttribute("opacity", f2(.12 + .88 * e)); s.gl.setAttribute("transform", "translate(" + f2(B) + " 0)");
        s.dm.setAttribute("opacity", f2(.12 + .3 * e)); s.dm.setAttribute("d", "M150 " + f2(170 + 5 * e) + "Q170 " + f2(146 + 22 * e) + " 200 " + f2(168 + 5 * e));
        s.ar.setAttribute("transform", "translate(" + f2(212 + B * 1.6) + " 206)");
        s.ar.setAttribute("opacity", f2(Math.max(0, (e - .2) / .8)));
      }
    };
  }

  /* ================= 3. Bhramari: front view, index fingers on the ear flaps, rings of hum ================= */
  function ringD(cx, cy, r, a, ph, sx) {
    var s = "";
    for (var i = 0; i <= 96; i++) {
      var th = i / 96 * TAU, rr = r + a * (.7 * Math.sin(6 * th + ph) + .3 * Math.sin(9 * th - ph * 1.3));
      s += (i ? "L" : "M") + (cx + rr * sx * Math.cos(th)).toFixed(1) + "," + (cy + rr * Math.sin(th)).toFixed(1);
    }
    return s + "Z";
  }
  function hummer(ch) {
    var M = function (x) { return 320 - x; };
    function arm(side, u) {
      var X = side ? M : function (x) { return x; }, g = side ? "skd" : "sk", t = side ? "tpa" : "tp";
      return '<path d="' + limb(X(196), 152, X(246), 157, 13.5, 11) + '" fill="url(#' + u + t + ')"/>' +
        '<path d="' + limb(X(246), 157, X(209), 118, 10, 8) + '" fill="url(#' + u + g + ')"/>' +
        /* an open, relaxed palm facing forward, its top at ear level */
        '<path d="M' + X(198) + ' 100C' + X(198) + ' 93 ' + X(203) + ' 89 ' + X(208) + ' 89C' + X(213) + ' 89 ' + X(217) + ' 94 ' + X(216) + ' 102C' + X(215) + ' 111 ' + X(212) + ' 119 ' + X(206) + ' 119C' + X(200) + ' 118 ' + X(198) + ' 109 ' + X(198) + ' 100Z" fill="url(#' + u + g + ')"/>' +
        '<path d="M' + X(202) + ' 95Q' + X(207.5) + ' 92.5 ' + X(213) + ' 95.5M' + X(202) + ' 100Q' + X(207.5) + ' 98 ' + X(213.5) + ' 101" fill="none" stroke="' + C.g900 + '" stroke-opacity=".1" stroke-width="1.4" stroke-linecap="round"/>' +
        /* the index finger rests on the ear flap */
        '<path d="' + limb(X(202), 96.5, X(190.5), 95, 3.8, 3.3) + '" fill="url(#' + u + g + ')"/>';
    }
    return {
      id: "c-" + ch.key + "-hum", name: "Soft light, " + ch.label + ", Bhramari",
      note: "Seated with elbows out and index fingers resting on the ear flaps, palms open: breathing in, gold light gently fills the chest; on the hum, soft rippling rings of light spread out from the head.",
      ref: REF + ", the approved Ripples of sound",
      build: function (stage) {
        var u = "cc" + (n++), rings = "";
        for (var i = 0; i < 6; i++) rings += '<path class="cc-rg" fill="' + C.gold300 + '" fill-opacity="0" stroke="' + C.gold600 + '" opacity="0"/>';
        svg(stage, defs(u, ch),
          halo(u, 160, 170, 160) +
          '<g class="cc-rgs">' + rings + '</g>' +
          '<g fill="none" stroke="' + C.gold600 + '" stroke-width="2.6" stroke-linecap="round" stroke-dasharray=".5 7"><ellipse class="cc-ci" cx="160" cy="94" rx="0" ry="0" opacity="0"/><ellipse class="cc-ci" cx="160" cy="94" rx="0" ry="0" opacity="0"/></g>' +
          '<circle class="cc-hh" cx="160" cy="88" r="48" fill="none" stroke="' + C.gold400 + '" stroke-width="7" opacity="0" filter="url(#' + u + 'b3)"/>' +
          shadow(u, 160, 330, 122, 7) +
          '<path d="M58 306C58 294 104 290 160 290C216 290 262 294 262 306L262 312C262 322 216 328 160 328C104 328 58 322 58 312Z" fill="url(#' + u + 'cu)"/>' +
          '<ellipse cx="156" cy="297" rx="80" ry="5" fill="' + C.gold100 + '" opacity=".55" filter="url(#' + u + 'b3)"/>' +
          '<path d="M104 236C84 240 56 254 52 274C48 292 68 302 96 302L224 302C252 302 272 292 268 274C264 254 236 240 216 236Z" fill="url(#' + u + 'pa)"/>' +
          '<path d="M100 284C134 270 186 270 220 284" fill="none" stroke="' + mx(ch.pants, C.g900, .3) + '" stroke-width="3" stroke-linecap="round" opacity=".45" filter="url(#' + u + 'b1)"/>' +
          '<ellipse cx="128" cy="292" rx="15" ry="6" transform="rotate(8 128 292)" fill="url(#' + u + 'sk)"/>' +
          '<ellipse cx="192" cy="292" rx="15" ry="6" transform="rotate(-8 192 292)" fill="url(#' + u + 'skd)"/>' +
          '<g class="cc-tg">' +
            '<path class="cc-tor" d="M126 140C140 134 180 134 194 140C206 145 212 154 212 168C210 192 204 216 202 ' + (ch.kurta ? '236C208 252 212 264 214 274Q160 280 106 274C108 264 112 252 118 236' : '244L118 244') + 'C116 216 110 192 108 168C108 154 114 145 126 140Z" fill="url(#' + u + 'tp)"/>' +
            '<ellipse class="cc-gl" cx="160" cy="182" rx="40" ry="36" fill="url(#' + u + 'gl)" opacity="0"/>' +
          '</g>' +
          '<g class="cc-up">' +
            '<path d="' + limb(160, 122, 160, 146, 12.5, 13) + '" fill="url(#' + u + 'nk)"/>' +
            '<g transform="translate(160 92)">' + fHead(u, ch) + '</g>' +
            arm(0, u) + arm(1, u) +
          '</g>');
        var q = function (x) { return stage.querySelector(x); };
        return { rg: [].slice.call(stage.querySelectorAll(".cc-rg")), ci: [].slice.call(stage.querySelectorAll(".cc-ci")),
          hh: q(".cc-hh"), tg: q(".cc-tg"), gl: q(".cc-gl"), up: q(".cc-up") };
      },
      frame: function (s, p) {
        var red = p.reduced, T = red ? 0 : p.time, e = full(p), cx = 160, cy = 94 - 2.2 * e;
        var hum = p.k === "out" ? (red ? 1 : ss(0, .08, p.t) * (1 - ss(.85, 1, p.t))) : 0;
        s.up.setAttribute("transform", "translate(0 " + f2(-2.2 * e) + ")");
        s.tg.setAttribute("transform", "translate(160 244) scale(" + f2(1 + .03 * e) + " " + f2(1 + .015 * e) + ") translate(-160 -244)");
        s.gl.setAttribute("opacity", f2(.08 + .8 * e));
        /* in: two dotted rings drift in toward the head */
        s.ci.forEach(function (c, i) {
          var o = 0, r = 0;
          if (p.k === "in") {
            if (red) { r = 66 + 18 * i; o = .5 - .2 * i; }
            else { var age = (p.sec + i * .9) % 1.8, f = ease(age / 1.8); r = L.lerp(88, 52, f); o = .5 * Math.sin(PI * f) * (1 - ss(.8, 1, p.t)); }
          }
          c.setAttribute("cy", f2(cy)); c.setAttribute("rx", f2(r * 1.4)); c.setAttribute("ry", f2(r)); c.setAttribute("opacity", f2(o)); c.setAttribute("stroke-dashoffset", f2(T * 10));
        });
        /* hum: rippled rings born every 0.9 s, slowing as they spread, quiet before the next breath */
        var used = 0;
        if (p.k === "out") {
          var put = function (r, a, ph, al, k) {
            var el = s.rg[used++]; if (!el) return;
            el.setAttribute("d", ringD(cx, cy, r, a, ph, 1.4)); el.setAttribute("opacity", f2(al));
            el.setAttribute("fill-opacity", ".1"); el.setAttribute("stroke-width", f2(.8 + 1.5 * (1 - k)));
          };
          if (red) [[.12, .9], [.42, .6], [.7, .35]].forEach(function (q) { put(52 + 34 * outQ(q[0]), 2.5, q[0] * 5, q[1], q[0]); });
          else {
            var life = 4.2, end = 1 - ss(p.dur - 1.1, p.dur, p.sec), calm = 1 - .55 * p.t;
            for (var i = 0, b = .15; b < p.dur - 2; i++, b += .9) {
              var age = p.sec - b; if (age < 0 || age > life) continue;
              var x = age / life;
              put(52 + 34 * outQ(x), (1.6 + 1.3 * (1 - x)) * calm, T * .35 + i * 1.7, .8 * Math.pow(1 - x, 1.5) * ss(0, .12, x) * end, x);
            }
          }
        }
        for (; used < s.rg.length; used++) s.rg[used].setAttribute("opacity", "0");
        var hv = .5 + .5 * Math.sin(T * TAU * .9);
        s.hh.setAttribute("cy", f2(cy)); s.hh.setAttribute("r", f2(46 + 3 * hv * hum)); s.hh.setAttribute("opacity", f2(.45 * hum));
      }
    };
  }

  /* ================= 4. Pursed lip: half-body profile ================= */
  var BUST = "M104 172C136 166 166 172 178 190C188 206 192 230 192 254C192 274 190 290 186 300Q126 318 66 300C62 282 60 262 62 240C66 206 80 182 104 172Z";
  function pursed(ch) {
    var HX = 132, HY = 100, HS = 1.3;
    return {
      id: "c-" + ch.key + "-pursed", name: "Soft light, " + ch.label + ", pursed lip",
      note: "Breathing in, beads of gold light travel along two soft lines into the nostril with the mouth closed; breathing out, the lips round into a small o and one long, soft stream of light flows out.",
      ref: REF + ", the person's line-art pursed-lip reference",
      build: function (stage) {
        var u = "cc" + (n++), AU = limb(120, 208, 116, 312, 17, 14);
        var motes = "";
        for (var i = 0; i < 14; i++) motes += '<circle class="cc-pm" r="' + (1.1 + (i * 7 % 5) * .3).toFixed(2) + '" fill="' + (i % 3 ? C.gold500 : C.gold600) + '" opacity="0"/>';
        var comets = "";
        for (var j = 0; j < 20; j++) comets += '<circle class="cc-cm" r="' + (2.6 - (j % 5) * .4).toFixed(2) + '" fill="' + C.gold600 + '" opacity="0"/>';
        svg(stage, defs(u, ch) + '<clipPath id="' + u + 'tc"><path d="' + BUST + '"/></clipPath>' +
          '<linearGradient id="' + u + 'st" gradientUnits="userSpaceOnUse" x1="180" y1="0" x2="316" y2="0"><stop offset="0" stop-color="' + C.gold600 + '"/><stop offset=".6" stop-color="' + C.gold500 + '" stop-opacity=".5"/><stop offset="1" stop-color="' + C.gold400 + '" stop-opacity="0"/></linearGradient>' +
          '<linearGradient id="' + u + 'in" gradientUnits="userSpaceOnUse" x1="306" y1="0" x2="186" y2="0"><stop offset="0" stop-color="' + C.gold400 + '" stop-opacity="0"/><stop offset=".45" stop-color="' + C.gold500 + '" stop-opacity=".8"/><stop offset="1" stop-color="' + C.gold600 + '"/></linearGradient>',
          halo(u, 150, 150, 160) +
          '<path d="' + limb(124, 146, 124, 182, 20, 21) + '" fill="url(#' + u + 'nk)"/>' +
          '<path d="' + BUST + '" fill="url(#' + u + 'tp)"/>' +
          '<g clip-path="url(#' + u + 'tc)"><path d="' + AU + '" fill="' + C.g900 + '" opacity=".13" filter="url(#' + u + 'b3)" transform="translate(-4 6)"/>' +
          '<path d="' + AU + '" fill="url(#' + u + 'tpa)"/></g>' +
          '<g class="cc-hd" transform="translate(' + HX + ' ' + HY + ') scale(' + HS + ')">' + pHead(u, ch) + '</g>' +
          /* in: two lines of air into the nose */
          '<g class="cc-in" fill="none" stroke="url(#' + u + 'in)" stroke-linecap="round" opacity="0">' +
            '<path class="cc-tk" d="M306 106C262 103 224 110 191 116" stroke-width="2"/><path class="cc-tk" d="M306 130C262 131 224 125 191 121" stroke-width="2"/></g>' +
          '<path class="cc-ah" d="M185 118.5L193.5 113.5Q191.5 118.5 193.5 123.5Z" fill="' + C.gold600 + '" opacity="0"/>' +
          '<g>' + comets + '</g>' +
          /* out: one long, soft, steady stream */
          '<path class="cc-sg" fill="none" stroke="url(#' + u + 'st)" stroke-width="7" stroke-linecap="round" opacity="0" filter="url(#' + u + 'b3)"/>' +
          '<path class="cc-sc" fill="none" stroke="url(#' + u + 'st)" stroke-width="2" stroke-linecap="round" opacity="0"/>' +
          '<g>' + motes + '</g>');
        var q = function (x) { return stage.querySelector(x); };
        var tk = [].slice.call(stage.querySelectorAll(".cc-tk"));
        return { tk: tk, tl: tk.map(function (x) { return x.getTotalLength(); }), cm: [].slice.call(stage.querySelectorAll(".cc-cm")), ah: q(".cc-ah"), fc: q(".cc-fc"), fh: q(".cc-fh"), o: q(".cc-o"), mo: q(".cc-mo"), mc: q(".cc-mc"),
          inl: q(".cc-in"), sg: q(".cc-sg"), sc: q(".cc-sc"), pm: [].slice.call(stage.querySelectorAll(".cc-pm")) };
      },
      frame: function (s, p) {
        var red = p.reduced, out = p.k === "out", T = red ? 3 : p.time;
        var pu = red ? (out ? 1 : 0) : (out ? ease(Math.min(1, p.t / .1)) * ease(Math.min(1, (1 - p.t) / .08)) : 0);
        var a = red ? (out ? 0 : 1) : (out ? 0 : ease(Math.min(1, p.t / .2)) * ease(Math.min(1, (1 - p.t) / .25)));
        var st = red ? (out ? 1 : 0) : (out ? ease(Math.min(1, p.t / .14)) * ease(Math.min(1, (1 - p.t) / .16)) : 0);
        var fd = faceD(pu);
        s.fc.setAttribute("d", fd); s.fh.setAttribute("d", fd);
        s.mo.setAttribute("transform", "translate(" + f2(1.2 * pu) + " 0)");
        s.o.setAttribute("opacity", f2(pu)); s.mc.setAttribute("opacity", f2(1 - pu));
        s.inl.setAttribute("opacity", f2(.4 * a)); s.ah.setAttribute("opacity", f2(.9 * a));
        /* in: comets of light travel along each track toward the nostril, a bright head with a fading tail behind it */
        for (var c = 0; c < s.cm.length; c++) {
          var j = c / 10 | 0, k = c % 5, u0 = frac(T * .6 + ((c / 5 | 0) % 2) * .5 + j * .25);
          var len = s.tl[j], at = Math.max(0, u0 * len - k * 7), pt = s.tk[j].getPointAtLength(at);
          s.cm[c].setAttribute("cx", f2(pt.x)); s.cm[c].setAttribute("cy", f2(pt.y));
          s.cm[c].setAttribute("opacity", f2(a * ss(0, .2, u0) * (1 - ss(.9, 1, u0)) * (1 - k * .19)));
        }
        /* the lips sit at local (37, 25.5) */
        var mx0 = HX + (36.6 + 1.2 * pu + 2.4) * HS, my = HY + 25.4 * HS, LEN = 128, dd = "M" + f2(mx0) + "," + f2(my);
        for (var k = 1; k <= 24; k++) { var w = k / 24; dd += "L" + f2(mx0 + w * LEN) + "," + f2(my + 2 * w * Math.sin(w * 7 - T * 2.4)); }
        s.sc.setAttribute("d", dd); s.sg.setAttribute("d", dd);
        s.sc.setAttribute("opacity", f2(.85 * st)); s.sg.setAttribute("opacity", f2(.45 * st));
        for (var i = 0; i < s.pm.length; i++) {
          var ph = frac(T * 0.45 + i / s.pm.length), sp = 1 + 8 * ph;
          s.pm[i].setAttribute("cx", f2(mx0 + ph * LEN));
          s.pm[i].setAttribute("cy", f2(my + sp * Math.sin(i * 2.39 + T * 1.2) + 2 * ph * Math.sin(ph * 7 - T * 2.4)));
          s.pm[i].setAttribute("opacity", f2(st * Math.min(1, ph * 6) * (1 - ph) * .9));
        }
      }
    };
  }

  [CH.neutral].forEach(function (ch) {
    LAB.add("belly", seated(ch));
    LAB.add("belly", standing(ch));
    LAB.add("hum", hummer(ch));
    LAB.add("pursed", pursed(ch));
  });
})();
