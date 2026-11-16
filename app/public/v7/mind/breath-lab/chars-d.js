/* chars-d, Gold minimal: an almost iconographic figure drawn in one fine gold-ink line on white, skin and hair
   given by tone alone, and one luminous accent (the Rhythm pearl, a glow or a light stream) where the breath goes.
   Two characters (a neutral figure and an Indian man) in four scenes. Classes "cd-", SVG ids "cd" + n. */
(function () {
  var L = LAB.L, C = L.C, n = 0, PI = Math.PI, TAU = PI * 2, sin = Math.sin, cos = Math.cos;
  var uid = function () { return "cd" + (n++) + Math.random().toString(36).slice(2, 5); };
  var f = function (v) { return Math.round(v * 10) / 10; };
  var ss = function (a, b, x) { x = L.clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  var ease = L.ease;
  function full(p) { return p.reduced ? (p.k === "out" ? 0 : 1) : p.e; }

  /* skin and hair, defined once; clothes stay in the gold-white family */
  var CH = {
    n: { k: "n", skin: "#E3BE97", hair: "#6B5536", top: C.white, low: C.gold100, name: "neutral" },
    m: { k: "m", skin: "#A26C47", hair: "#2B221C", top: C.gold50, low: C.gold100, name: "man" }
  };
  var INK = C.gold900;

  var css = document.createElement("style");
  css.textContent =
    ".cd-svg{position:absolute;left:0;top:0;width:320px;height:360px;display:block;overflow:hidden}" +
    ".cd-o{stroke:" + INK + ";stroke-width:2;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke}" +
    ".cd-n{fill:none;stroke:" + INK + ";stroke-width:2;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke}" +
    ".cd-l{fill:none;stroke:" + C.gold700 + ";stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}" +
    ".cd-a{fill:none;stroke:" + C.gold600 + ";stroke-width:2.2;stroke-linecap:round;vector-effect:non-scaling-stroke}";
  document.head.appendChild(css);

  /* a tapered limb: a capsule from (a,b) radius r1 to (c,d) radius r2 */
  function limb(a, b, c, d, r1, r2) {
    var dx = c - a, dy = d - b, l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l, ny = dx / l;
    return "M" + f(a + nx * r1) + " " + f(b + ny * r1) + "L" + f(c + nx * r2) + " " + f(d + ny * r2) +
      "A" + r2 + " " + r2 + " 0 0 0 " + f(c - nx * r2) + " " + f(d - ny * r2) + "L" + f(a - nx * r1) + " " + f(b - ny * r1) +
      "A" + r1 + " " + r1 + " 0 0 0 " + f(a + nx * r1) + " " + f(b + ny * r1) + "Z";
  }
  var GLOW = function (id) { return '<radialGradient id="' + id + '"><stop offset="0" stop-color="' + C.gold400 + '" stop-opacity=".9"/><stop offset=".45" stop-color="' + C.gold300 + '" stop-opacity=".55"/><stop offset="1" stop-color="' + C.gold300 + '" stop-opacity="0"/></radialGradient>'; };
  var HALO = function (id) { return '<radialGradient id="' + id + '"><stop offset="0" stop-color="' + C.gold100 + '"/><stop offset=".7" stop-color="' + C.gold100 + '" stop-opacity=".55"/><stop offset="1" stop-color="' + C.gold100 + '" stop-opacity="0"/></radialGradient>'; };
  /* the Rhythm pearl, placed by centre and diameter */
  function pearl(cls) { return '<g class="' + cls + '">' + LAB.pearl(14) + '</g>'; }
  function place(el, cx, cy, d) { var s = d / 14; el.setAttribute("transform", "translate(" + f(cx - d / 2) + " " + f(cy - d / 2) + ") scale(" + s.toFixed(3) + ")"); }

  /* ---------- the head in profile, facing right, local units (about 64 wide). pu purses the lips ---------- */
  function headP(pu) {
    var lx = 2.4 * pu;
    return "M-10,34 C-26,24 -32,4 -28,-12 C-24,-30 -6,-38 8,-34 C22,-30 28,-20 28,-8 C28,-2 29,0 31,4 L35,11 C36,13.5 34,14.5 31,14.5" +
      " C" + f(31 + lx * .6) + ",16.5 " + f(32.5 + lx) + ",18 " + f(31.5 + lx) + ",20 C" + f(32.5 + lx) + ",22 " + f(32 + lx) + ",24 " + f(30 + lx * .6) + ",25.5" +
      " C30,28.5 28,31 23,32 C18,33 14,35 12,40 L12,48 L-8,48 C-8,42 -9,37 -10,34Z";
  }
  var HAIR_S = {
    n: "M27,-11 C24,-32 4,-42 -12,-36 C-28,-30 -34,-8 -28,12 C-26,16 -22,18 -19,16 C-20,4 -16,-6 -8,-10 C4,-15 18,-14 27,-11Z",
    m: "M28.5,-10 C31,-27 18,-41 -2,-41 C-22,-41 -35,-24 -30,0 C-29,8 -26,14 -21,15 C-21,4 -17,-4 -10,-8 C2,-14 16,-9 28.5,-10Z"
  };
  var BEARD_S = "M-9,9 C-9,30 4,40 20,38 C28,37 34,32 34,26 L30.5,25.5 C27,27.5 21,28 15,27 C7,25.5 0,19 -3,9Z";
  function headSide(ch, u) {
    var hp = headP(0);
    return '<path class="cd-hd cd-o" fill="' + ch.skin + '" d="' + hp + '"/>' +
      (ch.k === "m" ? '<clipPath id="' + u + 'hc"><path d="' + hp + '"/></clipPath><path clip-path="url(#' + u + 'hc)" fill="' + ch.hair + '" d="' + BEARD_S + '"/>' +
        '<path d="M25.5,18.6 Q29,17.4 31.6,18.8" fill="none" stroke="' + ch.hair + '" stroke-width="2.4" stroke-linecap="round"/>' : '') +
      '<path fill="' + ch.hair + '" d="' + HAIR_S[ch.k] + '"/>' +
      '<path class="cd-l" d="M-5,1 C-11,0 -12,10 -5,11"/>' +
      '<path class="cd-n" d="M13,-1 Q17,2.6 21.5,-1"/>';
  }
  /* collar: a soft scoop for the neutral figure, a band collar and placket for the man's kurta (profile) */
  function collarSide(ch, x, y, s) {
    s = s || 1;
    var t = "translate(" + x + " " + y + ") scale(" + s + ")";
    return ch.k === "m"
      ? '<g transform="' + t + '"><path class="cd-o" fill="' + ch.top + '" d="M-1,-3 C4,-7 16,-7 22,-3 L22,3 C15,0 6,0 -1,3Z"/>' +
        '<path class="cd-l" d="M23,4 C28,12 32,22 33,34"/><circle cx="27.5" cy="13" r="1.3" fill="' + C.gold700 + '"/><circle cx="31" cy="24" r="1.3" fill="' + C.gold700 + '"/></g>'
      : '<g transform="' + t + '"><path class="cd-l" d="M0,0 C6,6 16,6 22,0"/></g>';
  }

  /* belly cue, the same in every scene: the pearl grows inside the belly, a glow fills it, two arcs open in front */
  function bellyCue(u) {
    return '<ellipse class="cd-gl" rx="30" ry="30" fill="url(#' + u + 'gl)" clip-path="url(#' + u + 'tc)"/>' + pearl("cd-pl");
  }
  var ARCS = '<g class="cd-ar"><path class="cd-a" d="M0,-11 Q6,0 0,11"/><path class="cd-a" d="M9,-16 Q17,0 9,16" opacity=".5"/></g>';
  function setBelly(s, e, bx, by, B) {
    place(s.pl, bx + B * .5, by, 16 + 20 * e);
    s.gl.setAttribute("cx", f(bx + B * .5)); s.gl.setAttribute("cy", by);
    s.gl.setAttribute("rx", f(18 + 18 * e)); s.gl.setAttribute("ry", f(20 + 18 * e));
    s.gl.setAttribute("opacity", f(.25 + .75 * e));
    s.pl.setAttribute("opacity", f(.55 + .45 * e));
  }
  function setArcs(s, x, y, e, B) {
    s.ar.setAttribute("transform", "translate(" + f(x + B * 1.2) + " " + y + ")");
    s.ar.setAttribute("opacity", f(ss(.15, .9, e)));
  }

  /* ================================================================ 1. Belly, seated */
  function seatTorso(B) {
    return "M166,120 C156,128 150,142 149,162 C148,188 150,226 154,266 L206,266" +
      " C" + f(208 + .4 * B) + ",262 " + f(214 + .8 * B) + ",252 " + f(216 + B) + ",236 C" + f(218 + B) + ",220 " + f(213 + .6 * B) + ",204 206,194" +
      " C208,182 212,170 212,156 C212,140 204,126 190,120 C184,126 172,126 166,120Z";
  }
  function seated(ch) {
    return {
      id: "d-" + ch.name + "-seated", name: "Gold minimal, " + ch.name + ", seated",
      note: "A fine gold-line figure sits in profile; the gold pearl grows inside the lower belly and two soft arcs open in front of it on the in-breath, while the chest line never moves.",
      ref: "Apple Mindfulness pictograms, continuous line yoga drawings (Shankar Ramakrishnan), Headspace seated profile, the approved Seated profile",
      build: function (stage) {
        var u = uid(), t0 = seatTorso(0);
        stage.innerHTML = '<svg class="cd-svg" viewBox="0 0 320 360" aria-hidden="true"><defs>' + HALO(u + "h") + GLOW(u + "gl") +
          '<clipPath id="' + u + 'tc"><path class="cd-tc" d="' + t0 + '"/></clipPath></defs>' +
          '<circle cx="178" cy="190" r="140" fill="url(#' + u + 'h)"/>' +
          '<g transform="translate(-14 4)">' +
          '<ellipse cx="210" cy="314" rx="104" ry="13" fill="' + C.gold100 + '" stroke="' + C.gold700 + '" stroke-width="1.2"/>' +
          '' +
          '<g transform="translate(176 74)">' + headSide(ch, u) + '</g>' +
          '<path class="cd-t" fill="' + ch.top + '" d="' + t0 + '"/>' + bellyCue(u) +
          '<path class="cd-t2 cd-n" d="' + t0 + '"/>' + collarSide(ch, 167, 121) +
          '<path class="cd-o" fill="' + ch.low + '" d="M144,258 C166,250 216,252 252,258 C274,262 288,270 288,284 C288,298 280,306 266,308 L160,308 C146,308 138,298 140,284 C140,270 141,262 144,258Z"/>' +
          '<path class="cd-l" d="M266,293 C236,288 200,287 166,292"/>' +
          '<path class="cd-o" fill="' + ch.skin + '" d="M240,301 C250,296 270,296 280,301 C284,305 278,309 264,309 C250,309 239,306 240,301Z"/>' +
          '<path class="cd-l" d="M262,264 C272,270 275,282 270,292"/>' +
          '<path class="cd-o" fill="' + ch.top + '" d="' + limb(178, 136, 168, 244, 9.5, 8) + '"/>' +
          '<path class="cd-o" fill="' + (ch.k === "m" ? ch.top : ch.skin) + '" d="' + limb(168, 244, 258, 260, 8, 6) + '"/>' +
          '<path class="cd-o" fill="' + ch.skin + '" d="M256,253 C264,250 274,253 276,260 C276,265 266,267 258,265 C252,263 251,256 256,253Z"/>' +
          ARCS + '</g></svg>';
        var q = function (x) { return stage.querySelector(x); };
        return { t: q(".cd-t"), t2: q(".cd-t2"), tc: q(".cd-tc"), gl: q(".cd-gl"), pl: q(".cd-pl"), ar: q(".cd-ar") };
      },
      frame: function (s, p) {
        var e = full(p), B = 10 * e, d = seatTorso(B);
        s.t.setAttribute("d", d); s.t2.setAttribute("d", d); s.tc.setAttribute("d", d);
        setBelly(s, e, 202, 230, B); setArcs(s, 230, 232, e, B);
      }
    };
  }

  /* ================================================================ 2. Belly, standing */
  function standBody(B) {
    return "M164,108 C154,116 148,132 148,154 C148,178 152,196 150,214 C148,232 150,248 156,264 C160,290 160,312 161,332" +
      " L190,332 C188,306 190,284 193,264" +
      " C" + f(199 + .5 * B) + ",256 " + f(204 + B) + ",246 " + f(204 + B) + ",230 C" + f(204 + B) + ",216 " + f(201 + .4 * B) + ",204 198,194" +
      " C200,184 206,170 206,150 C206,132 198,118 184,108 C178,114 170,114 164,108Z";
  }
  function standing(ch) {
    var hem = ch.k === "m" ? 292 : 256;
    return {
      id: "d-" + ch.name + "-standing", name: "Gold minimal, " + ch.name + ", standing",
      note: "A standing gold-line figure in profile: on the in-breath the belly line moves forward with the pearl and arcs, the faint diaphragm curve flattens, and the chest stays put.",
      ref: "Diaphragmatic breathing side-profile diagrams, Apple pictograms, continuous line figure drawings, Open and Balance app restraint",
      build: function (stage) {
        var u = uid(), b0 = standBody(0);
        stage.innerHTML = '<svg class="cd-svg" viewBox="0 0 320 360" aria-hidden="true"><defs>' + HALO(u + "h") + GLOW(u + "gl") +
          '<clipPath id="' + u + 'tc"><path class="cd-tc" d="' + b0 + '"/></clipPath></defs>' +
          '<circle cx="176" cy="180" r="140" fill="url(#' + u + 'h)"/>' +
          '<g transform="translate(-16 0)">' +
          '<ellipse cx="184" cy="336" rx="52" ry="5" fill="' + C.gold700 + '" opacity=".12"/>' +
          '<g transform="translate(170 64)">' + headSide(ch, u) + '</g>' +
          '<path class="cd-t" fill="' + ch.top + '" d="' + b0 + '"/>' +
          '<rect x="140" y="' + hem + '" width="80" height="60" fill="' + ch.low + '" clip-path="url(#' + u + 'tc)"/>' +
          '<path class="cd-dm" fill="none" stroke="' + C.gold600 + '" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="2 5" opacity=".9"/>' +
          bellyCue(u) +
          '<path class="cd-t2 cd-n" d="' + b0 + '"/>' +
          '<path class="cd-l" d="M' + (ch.k === "m" ? "158," + hem + " C170," + (hem + 2) + " 182," + (hem + 2) + " 191," + hem : "154," + hem + " C168," + (hem + 3) + " 182," + (hem + 3) + " 194," + (hem - 1)) + '"/>' +
          collarSide(ch, 164, 109) +
          '<path class="cd-o" fill="' + ch.skin + '" d="M161,330 L190,330 L204,333 C210,335 210,340 204,340 L166,340 C160,340 158,336 161,330Z"/>' +
          '<path class="cd-o" fill="' + ch.top + '" d="' + limb(166, 126, 160, 198, 9.5, 8) + '"/>' +
          '<path class="cd-o" fill="' + (ch.k === "m" ? ch.top : ch.skin) + '" d="' + limb(160, 198, 163, 254, 8, 6.5) + '"/>' +
          '<path class="cd-o" fill="' + ch.skin + '" d="M157,252 C161,248 169,250 170,258 C171,266 167,270 163,269 C158,268 155,258 157,252Z"/>' +
          ARCS + '</g></svg>';
        var q = function (x) { return stage.querySelector(x); };
        return { t: q(".cd-t"), t2: q(".cd-t2"), tc: q(".cd-tc"), gl: q(".cd-gl"), pl: q(".cd-pl"), ar: q(".cd-ar"), dm: q(".cd-dm") };
      },
      frame: function (s, p) {
        var e = full(p), B = 10 * e, d = standBody(B);
        s.t.setAttribute("d", d); s.t2.setAttribute("d", d); s.tc.setAttribute("d", d);
        s.dm.setAttribute("d", "M156,196 Q178," + f(172 + 18 * e) + " 199,194");
        setBelly(s, e, 191, 228, B); setArcs(s, 216, 228, e, B);
      }
    };
  }

  /* ================================================================ 3. Bhramari, front view */
  var HAIR_F = {
    n: "M-31,-2 C-33,-28 -16,-43 0,-43 C16,-43 33,-28 31,-2 C27,-16 16,-25 0,-25 C-16,-25 -27,-16 -31,-2Z",
    m: "M-31,0 C-34,-30 -16,-45 0,-45 C18,-45 34,-30 31,0 C29,-12 24,-20 15,-24 C5,-21 -9,-22 -20,-20 C-26,-14 -30,-7 -31,0Z"
  };
  var BEARD_F = "M-31,4 C-31,34 -14,45 0,45 C14,45 31,34 31,4 C24,8 20,15 13,19 C10,29.5 -10,29.5 -13,19 C-20,15 -24,8 -31,4Z";
  function ringD(cx, cy, r, a, ph) {
    var d = "";
    for (var i = 0; i <= 72; i++) {
      var th = i / 72 * TAU, rr = r + a * (.7 * sin(6 * th + ph) + .3 * sin(9 * th - ph * 1.3));
      d += (i ? "L" : "M") + f(cx + rr * cos(th)) + "," + f(cy + rr * .94 * sin(th));
    }
    return d + "Z";
  }
  function hum(ch) {
    var arm = ch.k === "m" ? ch.top : ch.skin;
    return {
      id: "d-" + ch.name + "-hum", name: "Gold minimal, " + ch.name + ", Bhramari",
      note: "Seated front on, index fingers resting on the ear flaps: the chest fills quietly on the in-breath, then a small light wakes at the throat and fine gold rings hum out around the head.",
      ref: "The approved Ripples of sound, cymatics, Apple Mindfulness rings, minimal line yoga figures",
      build: function (stage) {
        var u = uid(), R = [];
        var fx = function (sg) { /* one arm, mirrored by sg: sleeve, forearm, hand, index finger to the ear flap */
          var X = function (x) { return 160 + sg * x; };
          return '<path class="cd-o" fill="' + ch.top + '" d="' + limb(X(36), 162, X(88), 152, 10, 8.5) + '"/>' +
            '<path class="cd-o" fill="' + arm + '" d="' + limb(X(88), 152, X(46), 120, 8.5, 6.5) + '"/>' +
            '<path class="cd-o" fill="' + ch.skin + '" d="' + limb(X(42), 112, X(30.5), 101, 3.4, 2.8) + '"/>' +
            '<ellipse class="cd-o" fill="' + ch.skin + '" cx="' + X(45) + '" cy="119" rx="8" ry="10" transform="rotate(' + (sg * -28) + ' ' + X(45) + ' 119)"/>' +
            '<path class="cd-l" d="M' + X(40) + ',123 Q' + X(44) + ',126 ' + X(49) + ',124"/>';
        };
        var h = '<svg class="cd-svg" viewBox="0 0 320 360" aria-hidden="true"><defs>' + HALO(u + "h") + GLOW(u + "gl") +
          '<clipPath id="' + u + 'tc"><path d="M116,160 C108,170 108,186 112,204 C116,226 116,246 114,266 L206,266 C204,246 204,226 208,204 C212,186 212,170 204,160Z"/></clipPath></defs>' +
          '<circle cx="160" cy="170" r="150" fill="url(#' + u + 'h)"/><g class="cd-rg"></g>' +
          '<ellipse cx="160" cy="316" rx="116" ry="13" fill="' + C.gold100 + '" stroke="' + C.gold700 + '" stroke-width="1.2"/>' +
          '<g class="cd-up">' +
          '<path class="cd-o" fill="' + ch.skin + '" d="M150,126 L170,126 L171,152 L149,152Z"/>' +
          '<path class="cd-o" fill="' + ch.top + '" d="M160,148 C142,148 126,150 116,158 C108,164 106,178 110,198 C114,222 116,246 114,268 L206,268 C204,246 206,222 210,198 C214,178 212,164 204,158 C194,150 178,148 160,148Z"/>' +
          (ch.k === "m" ? '<path class="cd-o" fill="' + ch.top + '" d="M148,147 C152,143 168,143 172,147 L172,152 C166,149.5 154,149.5 148,152Z"/><path class="cd-l" d="M160,152 L160,172"/><circle cx="160" cy="163" r="1.4" fill="' + C.gold700 + '"/>'
            : '<path class="cd-l" fill="' + ch.skin + '" d="M149,148.5 C152,159 168,159 171,148.5Z"/>') +
          '<ellipse class="cd-gl" rx="30" ry="30" fill="url(#' + u + 'gl)"/>' + pearl("cd-pl") +
          '<g transform="translate(160 98)">' +
          '<ellipse class="cd-o" fill="' + ch.skin + '" cx="-30.5" cy="2" rx="5" ry="8"/><ellipse class="cd-o" fill="' + ch.skin + '" cx="30.5" cy="2" rx="5" ry="8"/>' +
          '<ellipse class="cd-o" fill="' + ch.skin + '" cx="0" cy="0" rx="30" ry="35"/>' +
          (ch.k === "m" ? '<clipPath id="' + u + 'fc"><ellipse cx="0" cy="0" rx="30" ry="35"/></clipPath><path clip-path="url(#' + u + 'fc)" fill="' + ch.hair + '" d="' + BEARD_F + '"/>' +
            '<path d="M-8,19.5 Q0,16.5 8,19.5" fill="none" stroke="' + ch.hair + '" stroke-width="2.6" stroke-linecap="round"/>' : '') +
          '<path fill="' + ch.hair + '" d="' + HAIR_F[ch.k] + '"/>' +
          '<path class="cd-n" d="M-17,2 Q-11,6 -5,2"/><path class="cd-n" d="M5,2 Q11,6 17,2"/>' +
          '<path class="cd-l" d="M0,6 L-2,14 L1.5,15"/>' +
          '<path class="cd-n" d="M-5,' + (ch.k === "m" ? 23.5 : 23) + ' Q0,25 5,' + (ch.k === "m" ? 23.5 : 23) + '"/></g>' +
          fx(-1) + fx(1) + '</g>' +
          '<path class="cd-o" fill="' + ch.low + '" d="M104,262 C82,264 58,276 56,292 C54,306 72,316 100,314 L220,314 C248,316 266,306 264,292 C262,276 238,264 216,262Z"/>' +
          '<path class="cd-l" d="M160,276 C142,292 112,300 82,301"/><path class="cd-l" d="M160,276 C178,292 208,300 238,301"/>' +
          '</svg>';
        stage.innerHTML = h;
        var g = stage.querySelector(".cd-rg");
        for (var i = 0; i < 6; i++) { var r = L.svg("path", { fill: C.gold300, "fill-opacity": "0", stroke: C.gold600, "stroke-linejoin": "round" }); g.appendChild(r); R.push(r); }
        var q = function (x) { return stage.querySelector(x); };
        return { R: R, up: q(".cd-up"), gl: q(".cd-gl"), pl: q(".cd-pl") };
      },
      frame: function (s, p) {
        var red = p.reduced, e = red ? (p.k === "in" ? 1 : 0) : p.e, T = red ? 0 : p.time, cx = 160, cy = 98;
        s.up.setAttribute("transform", "translate(0 " + f(-2.4 * e) + ")");
        /* the light sits at the throat, where the hum is made: quiet on the in-breath, lit and softly pulsing on the hum */
        var hm = p.k === "out" ? (red ? 1 : ss(0, .08, p.t) * (1 - ss(.82, 1, p.t))) : 0, pv = red ? 0 : .5 + .5 * sin(T * TAU * .9);
        var ty = 143 - 2.4 * e;
        place(s.pl, 160, ty, 10 + 8 * hm + 1.6 * hm * pv);
        s.pl.setAttribute("opacity", f(.3 + .7 * hm));
        s.gl.setAttribute("cx", 160); s.gl.setAttribute("cy", f(ty));
        s.gl.setAttribute("rx", f(12 + 22 * hm + 3 * hm * pv)); s.gl.setAttribute("ry", f(12 + 22 * hm + 3 * hm * pv)); s.gl.setAttribute("opacity", f(.15 + .85 * hm));
        var used = 0;
        var draw = function (r, a, ph, al, k) {
          var el = s.R[used++]; if (!el) return;
          el.setAttribute("d", ringD(cx, cy, r, a, ph));
          el.setAttribute("stroke-opacity", f(.85 * al)); el.setAttribute("fill-opacity", f(.07 * al));
          el.setAttribute("stroke-width", f(.8 + 1.4 * (1 - k)));
        };
        if (p.k === "out") {
          if (red) [[.08, 1], [.36, .7], [.64, .42]].forEach(function (q) { draw(46 + 96 * (1 - (1 - q[0]) * (1 - q[0])), 1.2, q[0] * 5, q[1], q[0]); });
          else {
            var life = 4.2, end = 1 - ss(p.dur - 1.1, p.dur, p.sec), calm = 1 - .5 * p.t;
            for (var i = 0, b = .15; b < p.dur - 2; i++, b += .9) {
              var age = p.sec - b; if (age < 0 || age > life) continue;
              var x = age / life, r = 46 + 96 * (1 - (1 - x) * (1 - x));
              draw(r, (.7 + .9 * (1 - x)) * calm, T * .35 + i * 1.7, Math.pow(1 - x, 1.5) * ss(0, .12, x) * end, x);
            }
          }
        }
        for (; used < s.R.length; used++) s.R[used].setAttribute("stroke-opacity", "0"), s.R[used].setAttribute("fill-opacity", "0");
      }
    };
  }

  /* ================================================================ 4. Pursed lip, half body profile */
  var HS = 1.3, HX = 128, HY = 94;              /* head scale and place */
  function pTorso(B) {
    return "M116,152 C102,164 92,184 90,212 C88,244 90,300 92,370 L196,370 C196,352 " + f(197 + .5 * B) + ",336 " + f(200 + B) + ",316" +
      " C" + f(203 + B) + ",296 " + f(201 + .6 * B) + ",280 194,266 C196,250 198,232 194,212 C190,188 174,166 150,154 C142,160 124,160 116,152Z";
  }
  function pursed(ch) {
    return {
      id: "d-" + ch.name + "-pursed", name: "Gold minimal, " + ch.name + ", pursed lip",
      note: "In profile: on the short in-breath two dotted gold lines flow into the nose, then the lips purse into a small o and one long, soft gold stream flows out while three small marks show the belly easing in.",
      ref: "The person's line-art pursed-lip reference, the approved Calm profile, Apple pictograms, continuous line portrait drawings",
      build: function (stage) {
        var u = uid(), t0 = pTorso(0);
        stage.innerHTML = '<svg class="cd-svg" viewBox="0 0 320 360" aria-hidden="true"><defs>' + HALO(u + "h") +
          '<linearGradient id="' + u + 'fd" gradientUnits="userSpaceOnUse" x1="0" y1="322" x2="0" y2="348"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
          '<mask id="' + u + 'mk" maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="360"><rect width="320" height="360" fill="url(#' + u + 'fd)"/></mask>' +
          '<linearGradient id="' + u + 'st" gradientUnits="userSpaceOnUse" x1="186" y1="0" x2="314" y2="0"><stop offset="0" stop-color="' + C.gold600 + '"/><stop offset=".6" stop-color="' + C.gold500 + '" stop-opacity=".55"/><stop offset="1" stop-color="' + C.gold400 + '" stop-opacity="0"/></linearGradient>' +
          '<linearGradient id="' + u + 'in" gradientUnits="userSpaceOnUse" x1="300" y1="0" x2="220" y2="0"><stop offset="0" stop-color="' + C.gold500 + '" stop-opacity="0"/><stop offset=".4" stop-color="' + C.gold600 + '" stop-opacity=".8"/><stop offset="1" stop-color="' + C.gold600 + '"/></linearGradient>' +
          '<marker id="' + u + 'ah" viewBox="0 0 10 10" refX="7" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto"><path d="M2,1.5 L7.5,5 L2,8.5" fill="none" stroke="' + C.gold600 + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></marker>' +
          '<filter id="' + u + 'bl" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="2.4"/></filter></defs>' +
          '<circle cx="150" cy="180" r="150" fill="url(#' + u + 'h)"/>' +
          '<g mask="url(#' + u + 'mk)">' +
          '<g transform="translate(' + HX + ' ' + HY + ') scale(' + HS + ')">' + headSide(ch, u) +
          '<ellipse class="cd-o2" cx="33" cy="21.5" rx="1.7" ry="2.2" fill="' + INK + '" opacity="0"/></g>' +
          '<path class="cd-t cd-o" fill="' + ch.top + '" d="' + t0 + '"/>' + collarSide(ch, 117, 153, 1.2) +
          '<path class="cd-o" fill="' + ch.top + '" d="' + limb(122, 178, 114, 250, 11, 9.5) + '"/>' +
          '<path class="cd-o" fill="' + (ch.k === "m" ? ch.top : ch.skin) + '" d="' + limb(114, 250, 128, 300, 9.5, 8) + '"/>' +
          '<path class="cd-o" fill="' + ch.skin + '" d="M122,298 C127,293 136,295 138,302 C140,310 136,316 131,316 C125,316 120,306 122,298Z"/>' +
          '</g>' +
          '<g class="cd-mk"><path class="cd-a" d="M0,-15 Q4,-11 0,-7"/><path class="cd-a" d="M4,-4 Q8,0 4,4"/><path class="cd-a" d="M0,7 Q4,11 0,15"/></g>' +
          '<path class="cd-i1" fill="none" stroke="url(#' + u + 'in)" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="0.1 8" marker-end="url(#' + u + 'ah)" d="M306,150 C256,152 206,142 183,117"/>' +
          '<path class="cd-i2" fill="none" stroke="url(#' + u + 'in)" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="0.1 8" marker-end="url(#' + u + 'ah)" d="M298,196 C244,194 198,172 181,125"/>' +
          '<path class="cd-sg" fill="none" stroke="url(#' + u + 'st)" stroke-width="7" stroke-linecap="round" filter="url(#' + u + 'bl)" opacity="0"/>' +
          '<path class="cd-sc" fill="none" stroke="url(#' + u + 'st)" stroke-width="2" stroke-linecap="round" opacity="0"/>' +
          '</svg>';
        var q = function (x) { return stage.querySelector(x); };
        return { hd: q(".cd-hd"), o: q(".cd-o2"), t: q(".cd-t"), mk: q(".cd-mk"), i1: q(".cd-i1"), i2: q(".cd-i2"), sg: q(".cd-sg"), sc: q(".cd-sc") };
      },
      frame: function (s, p) {
        var red = p.reduced, e = full(p), T = red ? 1.2 : p.time, B = 8 * e;
        var a = 0, st = 0, pu = 0;
        if (p.k === "in") a = red ? 1 : ease(Math.min(1, p.t / .2)) * ease(Math.min(1, (1 - p.t) / .2));
        else { st = red ? 1 : ease(Math.min(1, p.t / .14)) * ease(Math.min(1, (1 - p.t) / .16)); pu = red ? 1 : ease(Math.min(1, p.t / .1)) * ease(Math.min(1, (1 - p.t) / .08)); }
        s.hd.setAttribute("d", headP(pu));
        s.o.setAttribute("opacity", f(pu)); s.o.setAttribute("cx", f(33 + 2.4 * pu));
        s.t.setAttribute("d", pTorso(B));
        /* air in: dotted lines drawn toward the nostril */
        var off = f(-((T * 26) % 8.1));
        [s.i1, s.i2].forEach(function (el) { el.setAttribute("stroke-dashoffset", off); el.setAttribute("opacity", f(a)); });
        /* air out: one long steady stream from the pursed lips */
        var mx = HX + (33 + 2.4 * pu) * HS + 2, my = HY + 21.5 * HS, LEN = 116, d = "M" + f(mx) + "," + f(my);
        for (var k = 1; k <= 24; k++) { var w = k / 24; d += " L" + f(mx + w * LEN) + "," + f(my + 2.4 * w * sin(w * 7 - T * 2.6)); }
        s.sg.setAttribute("d", d); s.sc.setAttribute("d", d);
        s.sg.setAttribute("opacity", f(.55 * st)); s.sc.setAttribute("opacity", f(.95 * st));
        /* belly easing in: three small marks in front of the belly on the out-breath */
        var drift = red ? 0 : 3 * ease(p.k === "out" ? p.t : 0);
        s.mk.setAttribute("transform", "translate(" + f(212 + B - drift) + " 300)");
        s.mk.setAttribute("opacity", f(.9 * st));
      }
    };
  }

  ["n"].forEach(function (k) {
    var ch = CH[k];
    LAB.add("belly", seated(ch));
    LAB.add("belly", standing(ch));
    LAB.add("hum", hum(ch));
    LAB.add("pursed", pursed(ch));
  });
})();
