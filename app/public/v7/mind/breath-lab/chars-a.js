/* chars-a: "Soft flat". Two characters (a neutral figure and an Indian man) in four breathing scenes.
   Flat shapes with no outlines, one or two tonal steps, warm skin, calm clothes, a soft halo,
   and the Rhythm gold wherever the breath goes. Classes "ca-", SVG ids "ca" + random + n. */
(function () {
  var L = LAB.L, C = L.C, PI = Math.PI, TAU = PI * 2, sin = Math.sin, cos = Math.cos;
  var n = 0, pre = "ca" + Math.random().toString(36).slice(2, 6);
  function uid() { return pre + (n++); }
  function f(v) { return Math.round(v * 100) / 100; }
  function full(p) { return p.reduced ? (p.k === "out" ? 0 : 1) : p.e; }
  var ss = function (a, b, x) { x = L.clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  var outQ = function (x) { return 1 - (1 - x) * (1 - x); };
  var mix = L.mix;

  /* skin and hair, defined once */
  var SKIN_N = "#D19A74", SKIN_M = "#A86F4C", HAIR_N = "#4A3A33", HAIR_M = "#2A211E";
  function cast(sk, hr, man, top, topD, pant, pantD) {
    return { man: man, sk: sk, skd: mix(sk, C.gold900, .26), ear: mix(sk, C.gold900, .12), hr: hr, ln: mix(hr, sk, .12), bd: mix(hr, sk, .32),
      top: top, topD: topD, pant: pant, pantD: pantD };
  }
  var CH = {
    neutral: cast(SKIN_N, HAIR_N, false, mix(C.lav100, C.lav300, .42), mix(C.lav300, C.g500, .3), mix(C.lav300, C.g500, .55), mix(C.lav300, C.g700, .62)),
    man: cast(SKIN_M, HAIR_M, true, mix(C.sage100, C.g300, .5), mix(C.sage300, C.g500, .62), mix(C.g500, C.g700, .35), mix(C.g700, C.g900, .3))
  };

  var css = document.createElement("style");
  css.textContent = ".ca-svg{position:absolute;left:0;top:0;width:320px;height:360px;display:block}";
  document.head.appendChild(css);

  /* a tapered limb: a capsule from (a,b) radius r1 to (c,d) radius r2, joints overlap into soft round elbows */
  function limb(a, b, c, d, r1, r2) {
    var dx = c - a, dy = d - b, l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l, ny = dx / l;
    return "M" + f(a + nx * r1) + " " + f(b + ny * r1) + "L" + f(c + nx * r2) + " " + f(d + ny * r2) +
      "A" + r2 + " " + r2 + " 0 0 0 " + f(c - nx * r2) + " " + f(d - ny * r2) + "L" + f(a - nx * r1) + " " + f(b - ny * r1) +
      "A" + r1 + " " + r1 + " 0 0 0 " + f(a + nx * r1) + " " + f(b + ny * r1) + "Z";
  }
  function P(d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '"' + (extra || "") + '/>'; }
  function defs(u) {
    return '<radialGradient id="' + u + 'h" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="' + C.gold100 + '"/><stop offset=".7" stop-color="' + C.gold100 + '" stop-opacity=".6"/><stop offset="1" stop-color="' + C.gold100 + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + u + 'g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="' + C.gold400 + '"/><stop offset=".5" stop-color="' + C.gold300 + '" stop-opacity=".8"/><stop offset="1" stop-color="' + C.gold300 + '" stop-opacity="0"/></radialGradient>';
  }
  /* the shared belly cue: two gold arcs that open forward of the belly */
  var ARCS = '<path d="M0 -12Q6 0 0 12" stroke-width="2.4"/><path d="M9 -19Q18 0 9 19" stroke-width="1.7" opacity=".55"/>';

  /* ---------- the head in profile, facing right, centred on the skull; lx pushes the lips forward ---------- */
  function faceD(lx) {
    lx = lx || 0;
    return "M-10 26C-22 20 -27 6 -26 -6C-25 -20 -13 -29 2 -29C17 -29 26 -19 26 -7C26 -3 27 0 28 3L32 9.5" +
      "C32.6 10.8 31.6 11.8 29.6 11.8C" + f(30 + lx) + " 12.8 " + f(30.6 + lx) + " 14.4 " + f(29.6 + lx) + " 15.8" +
      "C" + f(28.9 + lx * .8) + " 16.4 " + f(28.9 + lx * .8) + " 17 " + f(29.6 + lx) + " 17.6" +
      "C" + f(30.2 + lx) + " 18.8 " + f(29.4 + lx) + " 20.2 27.4 20.8C27.8 23.5 27 27 23 29C17 32 8 32 0 30C-4 29 -7 28 -10 26Z";
  }
  function neckP(c, x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' + P("M-9 18L13 18L14 46L-8 46Z", c.skd) + '</g>';
  }
  function headP(c, x, y, s, purse) {
    var lw = f(1.7 / s), o = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">';
    o += '<path class="ca-fc" d="' + faceD(0) + '" fill="' + c.sk + '"/>';
    o += '<ellipse cx="17" cy="9.5" rx="5.5" ry="3.2" fill="' + C.rose300 + '" opacity=".26"/>';
    if (c.man) {
      o += P("M-4 2C-3 8 -1 12 2 14C4 20 7 24 11 26.6C15 29.2 20 30 24 29.4C27 28.6 28.4 25 28.2 21.2C26.6 21.8 24.8 21.6 23.6 20.6C20.5 20.6 17 18.6 14.5 15.6C10 15.8 5.6 13.6 3 9.6C1.6 7.6 0.6 4.6 0.2 1Z", c.bd);
      o += P("M23 13.6C24.8 12.4 27.2 12.4 28.4 13.4C26.8 14.3 24.8 14.4 23 13.6Z", c.bd);
    }
    o += '<ellipse cx="-1.5" cy="4" rx="4.6" ry="6.6" fill="' + c.ear + '"/>' +
      '<path d="M-1 1Q1.4 4 -0.6 7.4" fill="none" stroke="' + c.skd + '" stroke-width="' + lw + '" stroke-linecap="round"/>';
    o += '<path d="M12.6 -1.2Q16.4 1.8 20.2 -0.8" fill="none" stroke="' + c.ln + '" stroke-width="' + lw + '" stroke-linecap="round"/>';
    o += '<path d="M12.4 -8.4Q16.6 -10.6 21 -9" fill="none" stroke="' + c.hr + '" stroke-width="' + lw + '" stroke-linecap="round" opacity=".55"/>';
    o += c.man
      ? P("M-19 17C-28 8 -30 -13 -17 -27C-7 -35 14 -35 23 -25C27 -21 29 -16 28 -11C27 -10 25 -10 23 -11C17 -13 10 -13 5 -11C1 -9 -2 -5 -4 -1C-5 3 -5 8 -7 11C-10 14 -14 16 -19 17Z", c.hr)
      : P("M-20 18C-28 8 -30 -12 -18 -26C-8 -34 12 -34 22 -24C26 -20 28 -15 27 -10C22 -13 16 -14 10 -13C4 -12 -1 -9 -4 -4C-6 0 -6 6 -8 10C-11 14 -15 17 -20 18Z", c.hr);
    o += P(c.man ? "M-14 -26C-6 -30 6 -30 14 -27" : "M-14 -25C-6 -29 6 -29 14 -26", "none", ' stroke="' + mix(c.hr, "#FFFFFF", .16) + '" stroke-width="' + f(2.2 / s * 1.2) + '" stroke-linecap="round" opacity=".35"');
    if (purse) o += '<ellipse class="ca-o" cx="30.6" cy="16.8" rx="1" ry="1.35" fill="' + mix(c.hr, c.sk, .2) + '" opacity="0"/>';
    return o + '</g>';
  }
  /* the head from the front, eyes closed */
  function frontHeadP(c, x, y, s) {
    var lw = f(1.7 / s), o = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">';
    o += P("M-9 16L9 16L10 44L-10 44Z", c.skd);
    o += '<ellipse cx="-23.4" cy="3" rx="4.6" ry="7" fill="' + c.ear + '"/><ellipse cx="23.4" cy="3" rx="4.6" ry="7" fill="' + c.ear + '"/>';
    o += P("M0 -29C15 -29 24 -17 24 -2C24 15 14 29 0 29C-14 29 -24 15 -24 -2C-24 -17 -15 -29 0 -29Z", c.sk);
    o += '<ellipse cx="-13" cy="9" rx="5" ry="3" fill="' + C.rose300 + '" opacity=".26"/><ellipse cx="13" cy="9" rx="5" ry="3" fill="' + C.rose300 + '" opacity=".26"/>';
    if (c.man) {
      o += P("M-22.8 6C-21 18 -12 30 0 31C12 30 21 18 22.8 6C20.8 12 18 15 14 16.6C10 14.8 6 14 0 14.2C-6 14 -10 14.8 -14 16.6C-18 15 -20.8 12 -22.8 6Z", c.bd);
      o += '<ellipse cx="0" cy="18.4" rx="5.6" ry="3" fill="' + c.sk + '"/>';
      o += P("M-7.4 13.8C-4 11.6 4 11.6 7.4 13.8C4 15 -4 15 -7.4 13.8Z", c.bd);
    }
    var st = '" fill="none" stroke-width="' + lw + '" stroke-linecap="round"';
    o += '<path d="M-13.4 -0.6Q-9.2 2.6 -5 -0.6M5 -0.6Q9.2 2.6 13.4 -0.6' + st + ' stroke="' + c.ln + '"/>';
    o += '<path d="M-13.6 -8Q-9.4 -10.2 -5.2 -8.6M5.2 -8.6Q9.4 -10.2 13.6 -8' + st + ' stroke="' + c.hr + '" opacity=".5"/>';
    o += '<path d="M-1.8 9.4Q0 10.8 1.8 9.4' + st + ' stroke="' + c.skd + '"/>';
    o += '<path d="M-3.6 18Q0 19.4 3.6 18' + st + ' stroke="' + mix(c.skd, c.hr, .4) + '"/>';
    o += c.man
      ? P("M-25 1C-27 -20 -14 -35 1 -35C16 -35 27 -21 25 1C24 -6 22 -11 19 -14C12 -18 3 -18 -5 -16C-12 -15 -17 -14 -20 -11C-23 -8 -24 -4 -25 1Z", c.hr)
      : P("M-25 2C-27 -18 -14 -33 0 -33C14 -33 27 -18 25 2C24 -5 22 -10 18 -13C10 -17 -10 -17 -18 -13C-22 -10 -24 -5 -25 2Z", c.hr);
    o += P("M-12 -27C-4 -30.5 6 -30.5 13 -27.5", "none", ' stroke="' + mix(c.hr, "#FFFFFF", .16) + '" stroke-width="' + f(2.4 / s * 1.2) + '" stroke-linecap="round" opacity=".7"');
    return o + '</g>';
  }
  function svgOpen(u) { return '<svg class="ca-svg" viewBox="0 0 320 360" aria-hidden="true"><defs>' + defs(u); }

  /* ================= A. Belly, seated: cross-legged side profile on a cushion ================= */
  function seated(key, label) {
    var c = CH[key];
    function torso(B) {
      return "M158 136L182 136C194 142 204 156 204 174C204 188 201 198 199 206" +
        "C" + f(199 + B * .4) + " 212 " + f(201 + B) + " 220 " + f(201 + B) + " 230" +
        "C" + f(201 + B) + " 242 " + f(198 + B * .5) + " 254 190 262" +
        "L144 266C146 250 146 232 144 214C140 192 138 170 142 152C145 142 150 137 158 136Z";
    }
    return {
      id: "a-" + key + "-seated", name: "Soft flat, " + label + ", seated",
      note: "A calm seated figure in side view. The lower belly swells forward and warms to gold on the in-breath, then settles back, while the chest and shoulders stay still.",
      ref: "Headspace character style, Calm body scan, the approved Seated profile, Streamline Barcelona meditation set",
      build: function (stage) {
        var u = uid();
        stage.innerHTML = svgOpen(u) + '<clipPath id="' + u + 'c"><path class="ca-tc"/></clipPath></defs>' +
          '<circle cx="176" cy="186" r="140" fill="url(#' + u + 'h)"/>' +
          '<ellipse cx="188" cy="316" rx="96" ry="7" fill="' + C.gold700 + '" opacity=".08"/>' +
          P("M104 298C104 286 140 282 188 282C236 282 272 286 272 298C272 310 236 314 188 314C140 314 104 310 104 298Z", mix(C.lav100, C.g300, .55)) +
          P("M108 292C108 284 142 281 188 281C234 281 268 284 268 292C268 300 234 303 188 303C142 303 108 300 108 292Z", mix(C.lav100, C.g100, .5)) +
          neckP(c, 166, 86, 1.2) +
          '<path class="ca-t" fill="' + c.top + '"/>' +
          '<g clip-path="url(#' + u + 'c)"><ellipse cx="141" cy="206" rx="11" ry="74" fill="' + c.topD + '" opacity=".55"/>' +
          '<ellipse class="ca-gl" cx="198" cy="228" rx="30" ry="27" fill="url(#' + u + 'g)"/></g>' +
          (c.man ? P("M160 132L182 132L184 141L159 141Z", c.topD) : P("M162 136Q172 142 182 136", "none", ' stroke="' + c.topD + '" stroke-width="2" stroke-linecap="round"')) +
          P("M144 256C158 248 198 248 230 252C258 256 272 264 272 276C272 288 260 292 244 292L156 292C142 292 136 282 138 272C138 264 141 259 144 256Z", c.pant) +
          P("M160 278C190 274 226 274 252 280", "none", ' stroke="' + c.pantD + '" stroke-width="1.6" stroke-linecap="round" opacity=".7"') +
          P("M246 282C258 280 270 282 274 287C273 291 262 292 252 291C246 290 244 285 246 282Z", c.sk) +
          P(limb(172, 152, 160, 246, 9, 7.4), c.topD) +
          P(limb(160, 246, 234, 254, 7.4, 6), c.topD) +
          P("M230 252C238 247 251 249 256 255C257 260 248 263 240 262C233 261 228 256 230 252Z", c.sk) +
          headP(c, 166, 86, 1.2) +
          '<g class="ca-rp" fill="none" stroke="' + C.gold500 + '" stroke-linecap="round">' + ARCS + '</g></svg>';
        var q = function (s) { return stage.querySelector(s); };
        return { t: q(".ca-t"), tc: q(".ca-tc"), gl: q(".ca-gl"), rp: q(".ca-rp") };
      },
      frame: function (s, p) {
        var e = full(p), B = 10 * e, d = torso(B);
        s.t.setAttribute("d", d); s.tc.setAttribute("d", d);
        s.gl.setAttribute("opacity", f(.1 + .9 * e)); s.gl.setAttribute("transform", "translate(" + f(B) + " 0)");
        s.rp.setAttribute("transform", "translate(" + f(214 + B * 1.3) + " 226)");
        s.rp.setAttribute("opacity", f(Math.max(0, (e - .2) / .8)));
      }
    };
  }

  /* ================= B. Belly, standing: a calm side view, belly out on the in-breath ================= */
  function standing(key, label) {
    var c = CH[key];
    function torso(B) {
      return "M152 106L176 106C190 112 198 126 198 146C198 160 196 170 193 178" +
        "C" + f(193 + B * .4) + " 188 " + f(195 + B) + " 198 " + f(195 + B) + " 210" +
        "C" + f(195 + B) + " 222 " + f(193 + B * .5) + " 232 189 240C188 246 188 252 189 258" +
        "L135 258C134 246 135 236 137 226C140 214 140 202 138 190C134 172 132 150 136 132C139 118 144 110 152 106Z";
    }
    return {
      id: "a-" + key + "-standing", name: "Soft flat, " + label + ", standing",
      note: "A standing side view, like a breathing diagram made gentle. The belly moves out and glows on the in-breath and draws back in on the out-breath; nothing else moves.",
      ref: "Diaphragmatic breathing diagrams, Headspace character style, Open and Balance onboarding figures",
      build: function (stage) {
        var u = uid();
        stage.innerHTML = svgOpen(u) + '<clipPath id="' + u + 'c"><path class="ca-tc"/></clipPath></defs>' +
          '<circle cx="168" cy="178" r="146" fill="url(#' + u + 'h)"/>' +
          '<ellipse cx="174" cy="336" rx="58" ry="5" fill="' + C.gold700 + '" opacity=".09"/>' +
          P("M138 246L188 246C190 272 186 298 183 322L159 322C155 298 140 272 138 246Z", c.pant) +
          P("M164 262C166 284 168 304 170 322", "none", ' stroke="' + c.pantD + '" stroke-width="1.6" stroke-linecap="round" opacity=".6"') +
          P("M150 320L174 320C184 322 194 326 197 330C198 334 192 335 184 335L154 335C149 335 148 328 150 320Z", c.skd) + P("M158 318L182 318C192 320 202 324 205 329C206 333 200 335 192 335L162 335C157 335 156 328 158 318Z", c.sk) +
          neckP(c, 162, 62, 1.1) +
          '<path class="ca-t" fill="' + c.top + '"/>' +
          '<g clip-path="url(#' + u + 'c)"><ellipse cx="134" cy="186" rx="10" ry="84" fill="' + c.topD + '" opacity=".55"/>' +
          '<ellipse class="ca-gl" cx="192" cy="208" rx="28" ry="26" fill="url(#' + u + 'g)"/>' +
          '<rect x="130" y="250" width="70" height="10" fill="' + c.topD + '" opacity=".35"/></g>' +
          (c.man ? P("M156 104L176 104L178 113L155 113Z", c.topD) : P("M158 108Q167 114 176 108", "none", ' stroke="' + c.topD + '" stroke-width="2" stroke-linecap="round"')) +
          P(limb(154, 126, 145, 190, 8.6, 7), c.topD) +
          P(limb(145, 190, 151, 234, 7, 5.6), c.topD) + '<g transform="translate(-7 0)">' +
          P("M152.4 234C153 229 163.6 229 164 235L165 247C165 254 157 256 154.6 251C153.2 248 152.2 242 152.4 234Z", c.sk) + P("M163.6 238Q166.4 241 164.6 245", "none", ' stroke="' + c.skd + '" stroke-width="1.2" stroke-linecap="round"') + '</g>' +
          headP(c, 162, 62, 1.1) +
          '<g class="ca-rp" fill="none" stroke="' + C.gold500 + '" stroke-linecap="round">' + ARCS + '</g></svg>';
        var q = function (s) { return stage.querySelector(s); };
        return { t: q(".ca-t"), tc: q(".ca-tc"), gl: q(".ca-gl"), rp: q(".ca-rp") };
      },
      frame: function (s, p) {
        var e = full(p), B = 10 * e, d = torso(B);
        s.t.setAttribute("d", d); s.tc.setAttribute("d", d);
        s.gl.setAttribute("opacity", f(.1 + .9 * e)); s.gl.setAttribute("transform", "translate(" + f(B) + " 0)");
        s.rp.setAttribute("transform", "translate(" + f(207 + B * 1.3) + " 208)");
        s.rp.setAttribute("opacity", f(Math.max(0, (e - .2) / .8)));
      }
    };
  }

  /* ================= C. Bhramari: seated front view, index fingers on the ear flaps, rings of sound on the hum ================= */
  function ringD(cx, cy, r, a, ph) {
    var d = "";
    for (var i = 0; i <= 72; i++) {
      var th = i / 72 * TAU, rr = r + a * (.7 * sin(6 * th + ph) + .3 * sin(9 * th - ph * 1.3));
      d += (i ? "L" : "M") + f(cx + rr * cos(th)) + " " + f(cy + rr * sin(th));
    }
    return d + "Z";
  }
  function bhramari(key, label) {
    var c = CH[key], HX = 160, HY = 104, NR = 6;
    /* one arm, for the left of the picture; the other is its mirror */
    var arm = P(limb(124, 166, 80, 160, 9, 7.6), c.topD) +
      P(limb(80, 160, 98, 140, 7.6, 6.6), c.topD) +
      P(limb(98, 140, 110, 126, 5.6, 5), c.sk) +
      '<ellipse cx="115.5" cy="115" rx="7.2" ry="9.6" transform="rotate(18 115.5 115)" fill="' + c.sk + '"/>' +
      P(limb(118, 106.5, 130, 108.6, 2.8, 2.5), c.sk) +
      P("M111 110Q115 108.6 119 110.6", "none", ' stroke="' + c.skd + '" stroke-width="1.2" stroke-linecap="round" opacity=".7"');
    return {
      id: "a-" + key + "-hum", name: "Soft flat, " + label + ", humming bee",
      note: "Seated with eyes closed and index fingers resting on the ear flaps. The chest fills quietly on the in-breath, then soft gold rings of sound ripple out from the head on the hum.",
      ref: "The approved Ripples of sound, yoga teaching cards for Bhramari, Headspace character style",
      build: function (stage) {
        var u = uid(), rings = "";
        for (var i = 0; i < NR; i++) rings += '<path class="ca-r" fill="' + C.gold300 + '" fill-opacity="0" stroke="' + C.gold600 + '" opacity="0"/>';
        stage.innerHTML = svgOpen(u) + '<clipPath id="' + u + 'c"><path d="M112 172C112 158 126 150 146 148L174 148C194 150 208 158 208 172C208 200 202 228 198 254L122 254C118 228 112 200 112 172Z"/></clipPath></defs>' +
          '<circle cx="160" cy="176" r="150" fill="url(#' + u + 'h)"/>' +
          '<circle class="ca-hh" cx="' + HX + '" cy="' + HY + '" r="46" fill="' + C.gold300 + '" opacity="0"/>' +
          '<g>' + rings + '</g>' +
          '<ellipse cx="160" cy="324" rx="110" ry="6" fill="' + C.gold700 + '" opacity=".08"/>' +
          P("M52 304C52 292 100 286 160 286C220 286 268 292 268 304C268 316 220 322 160 322C100 322 52 316 52 304Z", mix(C.lav100, C.g300, .55)) +
          P("M58 298C58 290 104 286 160 286C216 286 262 290 262 298C262 306 216 310 160 310C104 310 58 306 58 298Z", mix(C.lav100, C.g100, .5)) +
          P("M66 284C66 264 96 250 128 248L192 248C224 250 254 264 254 284C254 298 234 304 210 304L110 304C86 304 66 298 66 284Z", c.pant) +
          P("M160 258C152 276 152 292 160 302M104 270C120 266 136 268 150 276M216 270C200 266 184 268 170 276", "none", ' stroke="' + c.pantD + '" stroke-width="1.6" stroke-linecap="round" opacity=".55"') +
          '<ellipse cx="96" cy="292" rx="12" ry="6.4" fill="' + c.sk + '"/><ellipse cx="224" cy="292" rx="12" ry="6.4" fill="' + c.sk + '"/>' +
          '<g class="ca-up">' +
          '<g class="ca-ch">' + P("M112 172C112 158 126 150 146 148L174 148C194 150 208 158 208 172C208 200 202 228 198 254L122 254C118 228 112 200 112 172Z", c.top) +
          '<g clip-path="url(#' + u + 'c)"><ellipse class="ca-gl" cx="160" cy="194" rx="34" ry="30" fill="url(#' + u + 'g)" opacity="0"/>' +
          '<rect x="100" y="244" width="120" height="12" fill="' + c.topD + '" opacity=".35"/></g>' +
          (c.man ? P("M148 145L172 145L172 152L160 160L148 152Z", c.topD) + P("M155 151L160 158L165 151Z", c.sk) : P("M150 148Q160 160 170 148Z", c.sk)) +
          '</g>' +
          frontHeadP(c, HX, HY, 1.25) +
          arm + '<g transform="matrix(-1 0 0 1 320 0)">' + arm + '</g>' +
          '</g></svg>';
        var q = function (s) { return stage.querySelector(s); };
        return { r: [].slice.call(stage.querySelectorAll(".ca-r")), ch: q(".ca-ch"), up: q(".ca-up"), gl: q(".ca-gl"), hh: q(".ca-hh") };
      },
      frame: function (s, p) {
        var red = p.reduced, e = red ? (p.k === "in" ? 1 : .2) : p.e;
        s.ch.setAttribute("transform", "translate(160 254) scale(" + f(1 + .03 * e) + " " + f(1 + .02 * e) + ") translate(-160 -254)");
        s.up.setAttribute("transform", "translate(0 " + f(-2 * e) + ")");
        s.gl.setAttribute("opacity", f(p.k === "in" ? .9 * e : red ? 0 : .9 * e * (1 - ss(0, .2, p.t))));
        var used = 0, T = p.time;
        function draw(r, a, ph, al, k) {
          var el = s.r[used++]; if (!el) return;
          el.setAttribute("d", ringD(HX, HY - 2 * e, r, a, ph));
          el.setAttribute("opacity", f(al)); el.setAttribute("fill-opacity", ".1");
          el.setAttribute("stroke-width", f(.9 + 1.3 * (1 - k)));
        }
        var hum = 0;
        if (p.k === "out") {
          if (red) { [[.1, .9], [.38, .6], [.66, .34]].forEach(function (q) { draw(48 + 52 * outQ(q[0]), 2.4, q[0] * 5, q[1], q[0]); }); hum = 1; }
          else {
            hum = ss(0, .08, p.t) * (1 - ss(.82, 1, p.t));
            var life = 4.2, end = 1 - ss(p.dur - 1.1, p.dur, p.sec), calm = 1 - .5 * p.t;
            for (var i = 0, b = .15; b < p.dur - 2; i++, b += .9) {
              var age = p.sec - b; if (age < 0 || age > life) continue;
              var x = age / life;
              draw(46 + 56 * outQ(x), (1.4 + 1.2 * (1 - x)) * calm, T * .35 + i * 1.7, Math.pow(1 - x, 1.5) * ss(0, .1, x) * end, x);
            }
          }
        }
        for (; used < s.r.length; used++) s.r[used].setAttribute("opacity", "0");
        var hv = red ? 1 : .5 + .5 * sin(T * TAU * .9);
        s.hh.setAttribute("opacity", f(.35 * hum * (.6 + .4 * hv)));
        s.hh.setAttribute("r", f(44 + 3 * hv * hum));
      }
    };
  }

  /* ================= D. Pursed lip: half body in profile, air in through the nose, a steady stream out ================= */
  function pursed(key, label) {
    var c = CH[key], HX = 138, HY = 84, S = 1.8;
    function torso(B) {
      return "M124 156L162 156C182 162 196 180 196 206C196 222 193 232 190 240" +
        "C" + f(190 + B * .4) + " 252 " + f(192 + B) + " 264 " + f(192 + B) + " 278" +
        "C" + f(192 + B) + " 296 " + f(190 + B * .5) + " 312 190 324Q190 330 184 330L92 330Q86 330 86 324C84 290 82 256 86 222C90 188 104 164 124 156Z";
    }
    var IN1 = "M300 64C262 64 232 80 199 100", IN2 = "M300 86C266 88 234 96 199 104";
    var OUT = "M196 116C232 117 270 122 312 119";
    return {
      id: "a-" + key + "-pursed", name: "Soft flat, " + label + ", pursed lip",
      note: "A side view. Two lines of air flow into the nose on the short in-breath; then the lips purse into a small o and one long, even stream flows out while small marks show the belly drawing in.",
      ref: "The approved Calm profile, the person's pursed lip reference panels, Headspace character style",
      build: function (stage) {
        var u = uid();
        stage.innerHTML = svgOpen(u) +
          '<linearGradient id="' + u + 'f" gradientUnits="userSpaceOnUse" x1="0" y1="286" x2="0" y2="338"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
          '<mask id="' + u + 'm" maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="360"><rect width="320" height="360" fill="url(#' + u + 'f)"/></mask>' +
          '<linearGradient id="' + u + 's" gradientUnits="userSpaceOnUse" x1="196" y1="0" x2="314" y2="0"><stop offset="0" stop-color="' + C.gold600 + '"/><stop offset=".65" stop-color="' + C.gold500 + '" stop-opacity=".6"/><stop offset="1" stop-color="' + C.gold400 + '" stop-opacity="0"/></linearGradient>' +
          '<linearGradient id="' + u + 'i" gradientUnits="userSpaceOnUse" x1="308" y1="0" x2="196" y2="0"><stop offset="0" stop-color="' + C.gold400 + '" stop-opacity="0"/><stop offset=".4" stop-color="' + C.gold500 + '" stop-opacity=".7"/><stop offset="1" stop-color="' + C.gold600 + '"/></linearGradient>' +
          '<clipPath id="' + u + 'c"><path class="ca-tc"/></clipPath></defs>' +
          '<circle cx="150" cy="170" r="146" fill="url(#' + u + 'h)"/>' +
          '<g class="ca-bd">' +
          '<g>' + neckP(c, HX, HY, S) +
          '<path class="ca-t" fill="' + c.top + '"/>' +
          '<g clip-path="url(#' + u + 'c)"><ellipse cx="86" cy="250" rx="13" ry="96" fill="' + c.topD + '" opacity=".5"/></g>' +
          (c.man ? P("M126 150L162 150L165 162L124 162Z", c.topD) : P("M128 156Q145 166 162 156", "none", ' stroke="' + c.topD + '" stroke-width="2.4" stroke-linecap="round"')) +
          '</g>' +
          headP(c, HX, HY, S, true) + '</g>' +
          '<g fill="none" stroke-linecap="round">' +
          '<path class="ca-i1" d="' + IN1 + '" stroke="url(#' + u + 'i)" stroke-width="2"/><path class="ca-i2" d="' + IN2 + '" stroke="url(#' + u + 'i)" stroke-width="2"/>' +
          '<path class="ca-j1" d="' + IN1 + '" stroke="' + C.gold600 + '" stroke-width="2.6" pathLength="100" stroke-dasharray="22 200"/>' +
          '<path class="ca-j2" d="' + IN2 + '" stroke="' + C.gold600 + '" stroke-width="2.6" pathLength="100" stroke-dasharray="22 200"/>' +
          '<g class="ca-ch2" stroke="' + C.gold600 + '" stroke-width="2" stroke-linejoin="round" opacity="0"><path d="M237 85.5L229 91.5L237 97.5" fill="none" stroke-linecap="round"/></g>' +
          '<path class="ca-so" d="' + OUT + '" stroke="url(#' + u + 's)" stroke-width="12" opacity="0"/>' +
          '<path class="ca-sc" d="' + OUT + '" stroke="url(#' + u + 's)" stroke-width="2.2" opacity="0"/>' +
          '<path class="ca-sd" d="' + OUT + '" stroke="' + C.gold500 + '" stroke-width="2.6" stroke-dasharray="0.1 12" opacity="0"/>' +
          '' +
          '</g></svg>';
        var q = function (s) { return stage.querySelector(s); };
        return { t: q(".ca-t"), tc: q(".ca-tc"), bd: q(".ca-bd"), fc: q(".ca-fc"), o: q(".ca-o"), i1: q(".ca-i1"), i2: q(".ca-i2"), j1: q(".ca-j1"), j2: q(".ca-j2"),
          so: q(".ca-so"), cv: q(".ca-ch2"), sc: q(".ca-sc"), sd: q(".ca-sd") };
      },
      frame: function (s, p) {
        var red = p.reduced, e = full(p), a = 0, st = 0, pu = 0, T = red ? 0 : p.time;
        if (p.k === "in") a = red ? 1 : L.ease(Math.min(1, p.t / .15)) * L.ease(Math.min(1, (1 - p.t) / .2));
        else {
          st = red ? 1 : L.ease(Math.min(1, p.t / .12)) * L.ease(Math.min(1, (1 - p.t) / .14));
          pu = red ? 1 : L.ease(Math.min(1, p.t / .08)) * L.ease(Math.min(1, (1 - p.t) / .08));
        }
        var B = 3 * e;
        var td = torso(B); s.t.setAttribute("d", td); s.tc.setAttribute("d", td);
        s.fc.setAttribute("d", faceD(2.2 * pu)); s.o.setAttribute("opacity", f(pu)); s.o.setAttribute("cx", f(30.6 + 2.2 * pu));
        s.bd.setAttribute("transform", "translate(0 " + f(-1.5 * e) + ")");
        /* air in: a faint path and a bright dash drawn along it into the nose, twice a second */
        var k = red ? .7 : (p.sec / .9) % 1;
        s.cv.setAttribute("opacity", f(.9 * a)); s.i1.setAttribute("opacity", f(.3 * a)); s.i2.setAttribute("opacity", f(.3 * a));
        s.j1.setAttribute("stroke-dashoffset", f(22 - 122 * k)); s.j2.setAttribute("stroke-dashoffset", f(22 - 122 * ((k + .35) % 1)));
        s.j1.setAttribute("opacity", f(a * ss(0, .35, k) * (1 - ss(.85, 1, k)))); s.j2.setAttribute("opacity", f(a * ss(0, .35, (k + .35) % 1) * (1 - ss(.85, 1, (k + .35) % 1))));
        /* air out: one steady stream with a slow, even flow along it */
        s.so.setAttribute("opacity", f(.28 * st)); s.sc.setAttribute("opacity", f(.95 * st)); s.sd.setAttribute("opacity", f(.9 * st));
        s.sd.setAttribute("stroke-dashoffset", f(-T * 26));
      }
    };
  }

  [["neutral", "neutral"]].forEach(function (x) { LAB.add("belly", seated(x[0], x[1])); });
  [["neutral", "neutral"]].forEach(function (x) { LAB.add("belly", standing(x[0], x[1])); });
  [["neutral", "neutral"]].forEach(function (x) { LAB.add("hum", bhramari(x[0], x[1])); });
  [["neutral", "neutral"]].forEach(function (x) { LAB.add("pursed", pursed(x[0], x[1])); });
})();
