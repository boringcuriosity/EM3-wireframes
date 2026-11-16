/* chars-b: Warm line art. One even warm brown outline with round joins, flat pastel fills held a hair inside the
   line, closed-eye faces. Air, sound and belly cues are drawn in the same line, in Rhythm gold.
   Two characters (neutral figure, Indian man) in four scenes: belly seated, belly standing, Bhramari, pursed lip. */
(function () {
  var L = LAB.L, C = L.C, PI = Math.PI, sin = Math.sin, cos = Math.cos;
  var LINE = "#3D2C23", LW = 2.25, GOLD = C.gold600, GOLDS = C.gold500;
  var n = 0, pre = "cb" + Math.random().toString(36).slice(2, 6) + "_";
  var r2 = function (v) { return Math.round(v * 100) / 100; };
  var ease = L.ease;
  function full(p) { return p.reduced ? (p.k === "out" ? 0 : 1) : p.e; }
  /* envelope inside a phase: soft at both ends */
  function env(t, a, b) { return ease(Math.min(1, t / a)) * ease(Math.min(1, (1 - t) / b)); }

  /* the two characters: skin and hair defined once here, clothes from the calm wider palette */
  var CH = {
    n: { key: "n", label: "neutral figure", skin: "#EEC7A6", hair: "#7A5646", beard: false, long: false,
         top: L.mix(C.sage100, C.sage300, .32), bot: L.mix(C.lav100, C.lav300, .45) },
    m: { key: "m", label: "man", skin: "#B67A52", hair: "#2E221C", beard: true, long: true,
         top: L.mix(C.sky100, C.sky300, .3), bot: L.mix(C.peach100, C.g300, .3) }
  };
  /* a shade of an rgb() colour, for the far leg and the crossed shin */
  function dk(c, f) { var v = c.match(/\d+/g).map(Number); return "rgb(" + v.map(function (x) { return Math.round(x * f); }).join(",") + ")"; }
  var CUSH = L.mix(C.gold300, C.white, .1), DISC = C.gold100, CHEEK = C.rose300;

  var css = document.createElement("style");
  css.textContent = ".cb-svg{position:absolute;left:0;top:0;width:320px;height:360px;display:block}";
  document.head.appendChild(css);

  /* place a path written in local units: every "x y" pair is scaled, mirrored if asked, and moved */
  function tf(d, ox, oy, s, mx) {
    return d.replace(/(-?\d*\.?\d+)[ ,]+(-?\d*\.?\d+)/g, function (m, a, b) { return r2(ox + s * (mx ? -a : +a)) + " " + r2(oy + s * b); });
  }

  /* a tiny drawing kit: every shape is a fill, a paper gap, then the line */
  function kit() {
    var u = pre + (n++) + "_", defs = [], body = [], k = 0;
    var K = {
      u: u, defs: defs, body: body,
      id: function () { return u + (k++); },
      shape: function (d, fill, extra) {
        var id = K.id(); defs.push('<path id="' + id + '" d="' + d + '"/>');
        body.push('<g' + (extra || "") + '><use href="#' + id + '" fill="' + fill + '"/>' +
          '<use href="#' + id + '" fill="none" stroke="' + LINE + '" stroke-width="' + LW + '" stroke-linejoin="round" stroke-linecap="round"/></g>');
        return id;
      },
      tube: function (d, w, fill) {
        var id = K.id(); defs.push('<path id="' + id + '" d="' + d + '"/>');
        body.push('<g fill="none" stroke-linecap="round" stroke-linejoin="round">' +
          '<use href="#' + id + '" stroke="' + LINE + '" stroke-width="' + (w + 2 * LW) + '"/><use href="#' + id + '" stroke="' + fill + '" stroke-width="' + w + '"/></g>');
        return id;
      },
      line: function (d, col, w, extra) {
        var id = K.id();
        body.push('<path id="' + id + '" d="' + d + '" fill="none" stroke="' + (col || LINE) + '" stroke-width="' + (w || LW) + '" stroke-linecap="round" stroke-linejoin="round"' + (extra || "") + '/>');
        return id;
      },
      raw: function (s) { body.push(s); },
      /* fill clipped inside a shape already drawn, soft at its inner edge, then the shape's line again on top */
      inside: function (shapeId, ds, fill) {
        var cp = K.id(), fl = K.id();
        defs.push('<clipPath id="' + cp + '"><use href="#' + shapeId + '"/></clipPath><filter id="' + fl + '" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation=".7"/></filter>');
        body.push('<g clip-path="url(#' + cp + ')"><g filter="url(#' + fl + ')" fill="' + fill + '">' + ds.map(function (d) { return '<path d="' + d + '"/>'; }).join("") + '</g></g>' +
          '<use href="#' + shapeId + '" fill="none" stroke="' + LINE + '" stroke-width="' + LW + '" stroke-linejoin="round"/>');
      },
      svg: function () { return '<svg class="cb-svg" viewBox="0 0 320 360" aria-hidden="true"><defs>' + defs.join("") + '</defs>' + body.join("") + '</svg>'; }
    };
    return K;
  }
  function refs(stage, ids) { var o = {}; for (var k in ids) o[k] = stage.querySelector("#" + ids[k]); return o; }

  /* ---------- heads ---------- */
  /* profile, facing right, local origin at the middle of the skull */
  var HP = {
    neck: "M-14 24 C-13 34 -13 42 -14 54 L12 54 C10 44 10 36 11 30 Z",
    head: "M6 36 C18 38 26 34 28 28 C29 26 30 25 31 23 C30.5 21.8 30 21.2 30.4 20.2 C31 19 31.6 17 30.6 15.6 C32 15 35.5 13.5 35.5 11 C35.5 9 32 4 29.5 0 " +
          "C30 -6 29 -14 26 -20 C20 -32 4 -36 -8 -33 C-24 -29 -32 -14 -30 2 C-29 16 -20 26 -10 30 C-4 33 0 35 6 36 Z",
    hairN: "M28 -16 C23 -33 3 -40 -13 -35 C-28 -30 -35 -13 -31 4 C-30 10 -28 14 -25 17 C-22 11 -17 6 -11 4 C-9 -4 -3 -10 5 -12 C13 -13.5 22 -12 28 -16 Z",
    hairM: "M28 -17 C24 -33 5 -39 -11 -35 C-26 -31 -33 -16 -30 0 C-29 6 -27 10 -25 12 C-22 6 -17 2 -12 1 C-10 -6 -4 -10.5 4 -11.5 C12 -12.5 19 -10 24 -12 C26 -13 27.5 -15 28 -17 Z",
    beard: "M-11 3 C-9 12 -3 19 5 21.5 C12 23.5 18 23 22 24.6 C24.5 25.6 27 25.4 32 24.6 L44 34 L44 52 L-24 52 Z",
    mous: "M23.5 17.8 C26.5 16.6 30 16.8 33 17.6 L33 19.2 C29.5 19.8 26 19.6 23.5 18.8 Z",
    ear: "M-4 0 C-12 -2 -15 13 -6.5 15 C-3.5 15.4 -2.4 12 -3 8 Z",
    earIn: "M-6 4 C-9 5 -9 10 -6.5 11",
    eye: "M11 2.5 Q15.5 6 20 2.5",
    brow: "M10.5 -5 Q15.5 -7.5 20.5 -5.5",
    mouth: "M26 20.6 Q28.2 21.6 30.2 20.6"
  };
  function headProfile(K, ch, ox, oy, s, opt) {
    opt = opt || {};
    var ids = {};
    var hid = K.shape(tf(HP.head, ox, oy, s), ch.skin);
    var ck = tf("M10 13 C10 10.5 18 10.5 18 13 C18 15.5 10 15.5 10 13 Z", ox, oy, s);
    K.raw('<path d="' + ck + '" fill="' + CHEEK + '" opacity=".4"/>');
    if (ch.beard) K.inside(hid, [tf(HP.beard, ox, oy, s), tf(HP.mous, ox, oy, s)], ch.hair);
    K.shape(tf(ch.beard ? HP.hairM : HP.hairN, ox, oy, s), ch.hair);
    K.shape(tf(HP.ear, ox, oy, s), ch.skin);
    K.line(tf(HP.earIn, ox, oy, s), LINE, 1.6);
    K.line(tf(HP.eye, ox, oy, s));
    K.line(tf(HP.brow, ox, oy, s), LINE, 1.6, ' opacity=".55"');
    ids.mouth = K.line(tf(HP.mouth, ox, oy, s), LINE, 2);
    if (opt.purse) {
      var cx = ox + 32.8 * s, cy = oy + 21 * s;
      ids.o = K.id();
      K.raw('<g id="' + ids.o + '" opacity="0"><ellipse cx="' + r2(cx) + '" cy="' + r2(cy) + '" rx="' + r2(2.2 * s) + '" ry="' + r2(2.7 * s) + '" fill="' + L.mix(LINE, ch.skin, .45) + '" stroke="' + LINE + '" stroke-width="' + LW + '"/></g>');
    }
    return ids;
  }
  /* front, local origin at the middle of the face */
  var HF = {
    neck: "M-11 34 C-11 44 -12 52 -15 62 L15 62 C12 52 11 44 11 34 Z",
    head: "M0 -46 C24 -46 39 -28 39 -4 C39 22 22 44 0 44 C-22 44 -39 22 -39 -4 C-39 -28 -24 -46 0 -46 Z",
    ear: "M-37 -8 C-47 -10 -49 11 -37.5 13 Z",
    earIn: "M-40 -2 C-43 0 -43 6 -40 8",
    hairN: "M-41 0 C-45 -30 -25 -53 0 -53 C25 -53 45 -30 41 0 C37 -11 31 -19 23 -24 C11 -17 -6 -19 -18 -28 C-27 -22 -36 -13 -41 0 Z",
    hairM: "M-39.5 -6 C-42 -32 -22 -51 0 -51 C22 -51 42 -32 39.5 -6 C37 -16 33 -23 26 -27 C14 -23 -4 -24 -20 -29 C-28 -24 -35 -16 -39.5 -6 Z",
    beard: "M-41 -8 C-36 12 -26 22 -14 25 C-8 26.5 -6 31 0 31.5 C6 31 8 26.5 14 25 C26 22 36 12 41 -8 L50 60 L-50 60 Z",
    mous: "M-10 21.6 C-5 19 5 19 10 21.6 C6 23.4 -6 23.4 -10 21.6 Z",
    eyeL: "M-21 2 Q-15 6.5 -9 2", eyeR: "M9 2 Q15 6.5 21 2",
    browL: "M-22 -8 Q-15 -11 -8 -8.5", browR: "M8 -8.5 Q15 -11 22 -8",
    nose: "M-1 8 C-2.5 12 -3.5 15 0.5 16",
    mouth: "M-6 26.5 Q0 29.5 6 26.5"
  };
  function headFront(K, ch, ox, oy, s) {
    K.shape(tf(HF.ear, ox, oy, s), ch.skin); K.shape(tf(HF.ear, ox, oy, s, 1), ch.skin);
    K.line(tf(HF.earIn, ox, oy, s), LINE, 1.6); K.line(tf(HF.earIn, ox, oy, s, 1), LINE, 1.6);
    var hid = K.shape(tf(HF.head, ox, oy, s), ch.skin);
    [-1, 1].forEach(function (sg) {
      K.raw('<ellipse cx="' + r2(ox + sg * 21 * s) + '" cy="' + r2(oy + 14 * s) + '" rx="' + r2(5.5 * s) + '" ry="' + r2(3.2 * s) + '" fill="' + CHEEK + '" opacity=".4"/>');
    });
    if (ch.beard) K.inside(hid, [tf(HF.beard, ox, oy, s), tf(HF.mous, ox, oy, s)], ch.hair);
    K.shape(tf(ch.beard ? HF.hairM : HF.hairN, ox, oy, s), ch.hair);
    K.line(tf(HF.eyeL, ox, oy, s)); K.line(tf(HF.eyeR, ox, oy, s));
    K.line(tf(HF.browL, ox, oy, s), LINE, 1.6, ' opacity=".55"'); K.line(tf(HF.browR, ox, oy, s), LINE, 1.6, ' opacity=".55"');
    K.line(tf(HF.nose, ox, oy, s), LINE, 1.8);
    K.line(tf(HF.mouth, ox, oy, s), LINE, 2);
  }

  /* ---------- the belly cue: three short gold marks fanning out from the front of the belly ---------- */
  function bellyCue(K) {
    var ids = [K.line("M0 0", GOLD), K.line("M0 0", GOLD), K.line("M0 0", GOLD)];
    return ids;
  }
  function setCue(els, x, y, len, a, r0) {
    var ang = [-.62, 0, .62];
    for (var i = 0; i < 3; i++) {
      var c = cos(ang[i]), s = sin(ang[i]), l = len * (i === 1 ? 1 : .8);
      els[i].setAttribute("d", "M" + r2(x + r0 * c) + " " + r2(y + r0 * s) + "L" + r2(x + (r0 + l) * c) + " " + r2(y + (r0 + l) * s));
      els[i].setAttribute("opacity", r2(a));
    }
  }
  /* soft gold warmth inside the belly, clipped to the clothes */
  function bellyGlow(K, torsoId) {
    var cp = K.id(), gr = K.id(), id = K.id();
    K.defs.push('<clipPath id="' + cp + '"><use href="#' + torsoId + '"/></clipPath>' +
      '<radialGradient id="' + gr + '"><stop offset="0" stop-color="' + C.gold400 + '" stop-opacity=".75"/><stop offset=".6" stop-color="' + C.gold300 + '" stop-opacity=".45"/><stop offset="1" stop-color="' + C.gold300 + '" stop-opacity="0"/></radialGradient>');
    K.raw('<g clip-path="url(#' + cp + ')"><ellipse id="' + id + '" cx="0" cy="0" rx="34" ry="30" fill="url(#' + gr + ')" opacity="0"/></g>');
    return id;
  }
  function disc(K, x, y, r) { K.raw('<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + DISC + '"/>'); }

  /* ---------- scene 1: belly, seated in profile ---------- */
  function seatedTorso(B) {
    return "M148 128 C160 123 174 123 186 128 C200 136 207 152 206 170 C205 182 202 190 201 196 C" + r2(201 + .35 * B) + " 204 " + r2(204 + B) + " 210 " + r2(204 + B) + " 222 " +
      "C" + r2(204 + B) + " 234 " + r2(200 + .5 * B) + " 244 194 252 L140 256 C135 230 134 200 137 170 C139 150 141 136 148 128 Z";
  }
  function seated(ch) {
    return {
      build: function (stage) {
        var K = kit(), ids = {};
        disc(K, 176, 186, 134);
        K.shape("M98 308 C98 298 140 295 196 295 C252 295 294 298 294 308 C294 322 252 327 196 327 C140 327 98 322 98 308 Z", CUSH);
        K.line("M126 311 C170 315 226 315 268 311", C.gold600, 1.6, ' opacity=".35"');
        K.shape(tf(HP.neck, 168, 78, 1.15), ch.skin);
        ids.t = K.shape(seatedTorso(0), ch.top);
        ids.g = bellyGlow(K, ids.t);
        K.line("M150 132 C158 136 172 136 182 131", LINE, 1.6, ' opacity=".5"');
        K.shape("M134 250 C152 242 212 244 248 252 C268 257 278 268 276 282 C274 294 262 300 246 300 L148 302 C132 302 126 284 134 250 Z", ch.bot);
        K.shape("M150 292 C158 284 176 283 190 288 C196 291 196 300 188 302 L156 303 C149 303 146 297 150 292 Z", ch.skin);
        K.tube("M262 286 Q226 300 186 298", 19, dk(ch.bot, .94));
        K.shape("M222 294 C228 286 246 285 258 290 C264 293 263 301 255 302 L228 303 C221 303 218 298 222 294 Z", ch.skin);
        headProfile(K, ch, 168, 78, 1.15);
        if (ch.long) K.tube("M160 146 Q154 196 160 236 Q196 240 234 250", 21, ch.top);
        else { K.tube("M157 188 Q155 214 160 236 Q196 240 234 250", 16, ch.skin); K.tube("M160 146 Q157 168 157 182", 24, ch.top); }
        K.tube("M234 250 L252 254", 14, ch.skin);
        ids.cue = bellyCue(K);
        stage.innerHTML = K.svg();
        var S = refs(stage, { t: ids.t, g: ids.g });
        S.cue = ids.cue.map(function (i) { return stage.querySelector("#" + i); });
        return S;
      },
      frame: function (S, p) {
        var e = full(p), B = 11 * e;
        S.t.setAttribute("d", seatedTorso(B));
        S.g.setAttribute("transform", "translate(" + r2(196 + B) + " 222)"); S.g.setAttribute("opacity", r2(.1 + .9 * e));
        setCue(S.cue, 204 + B, 222, 4 + 8 * e, Math.pow(e, .8), 7);
      }
    };
  }

  /* ---------- scene 2: belly, standing in profile ---------- */
  function standTorso(B, kurta) {
    return "M150 116 C162 111 176 111 188 116 C200 124 205 140 204 158 C203 170 201 178 200 186 C" + r2(200 + .35 * B) + " 194 " + r2(203 + B) + " 202 " + r2(203 + B) + " 214 " +
      "C" + r2(203 + B) + " 228 " + r2(199 + .5 * B) + " 238 192 244" +
      (kurta ? " C195 256 198 266 200 277 L140 279 C140 266 141 256 142 246" : " L146 246") +
      " C141 222 139 190 141 160 C142 138 144 124 150 116 Z";
  }
  function standing(ch) {
    var kurta = ch.long, botD = dk(ch.bot, .9);
    return {
      build: function (stage) {
        var K = kit(), ids = {};
        disc(K, 172, 182, 134);
        K.line("M112 338 L232 338", C.gold400, LW);
        /* far leg and foot, then hips, near leg and foot */
        K.shape("M150 326 C155 320 170 320 182 325 C188 328 187 336 180 336 L153 336 C148 336 147 330 150 326 Z", L.mix(C.g300, C.white, .2));
        K.tube("M163 246 Q166 288 160 318", 25, botD);
        K.shape("M144 232 L194 232 C196 248 192 262 184 272 L152 272 C146 260 143 246 144 232 Z", ch.bot);
        K.shape("M162 326 C167 320 182 320 194 325 C200 328 199 336 192 336 L165 336 C160 336 159 330 162 326 Z", L.mix(C.g300, C.white, .2));
        K.tube("M174 248 Q177 288 172 318", 25, ch.bot);
        K.shape(tf(HP.neck, 170, 72, 1.05), ch.skin);
        ids.t = K.shape(standTorso(0, kurta), ch.top);
        ids.g = bellyGlow(K, ids.t);
        K.line("M152 120 C160 124 174 124 184 119", LINE, 1.6, ' opacity=".5"');
        headProfile(K, ch, 170, 72, 1.05);
        if (kurta) K.tube("M168 130 Q160 186 168 236", 21, ch.top);
        else { K.tube("M165 170 Q162 204 168 236", 16, ch.skin); K.tube("M168 130 Q164 152 164 168", 24, ch.top); }
        K.tube("M168 238 Q171 247 172 252", 14, ch.skin);
        ids.cue = bellyCue(K);
        stage.innerHTML = K.svg();
        var S = refs(stage, { t: ids.t, g: ids.g });
        S.cue = ids.cue.map(function (i) { return stage.querySelector("#" + i); });
        return S;
      },
      frame: function (S, p) {
        var e = full(p), B = 11 * e;
        S.t.setAttribute("d", standTorso(B, kurta));
        S.g.setAttribute("transform", "translate(" + r2(195 + B) + " 214)"); S.g.setAttribute("opacity", r2(.1 + .9 * e));
        setCue(S.cue, 203 + B, 214, 4 + 8 * e, Math.pow(e, .8), 7);
      }
    };
  }

  /* ---------- scene 3: Bhramari, seated, facing us, index fingers on the ear flaps ---------- */
  var HX = 160, HY = 104;
  function ringD(r, a, ph) {
    var d = "";
    for (var i = 0; i <= 72; i++) {
      var th = i / 72 * 2 * PI, rr = r + a * (.7 * sin(6 * th + ph) + .3 * sin(9 * th - ph * 1.3));
      d += (i ? "L" : "M") + r2(HX + rr * cos(th)) + " " + r2(HY + rr * sin(th));
    }
    return d + "Z";
  }
  function bhramari(ch) {
    return {
      build: function (stage) {
        var K = kit(), ids = { r: [] };
        disc(K, 160, 196, 132);
        for (var i = 0; i < 7; i++) ids.r.push(K.line("M0 0", GOLDS, LW, ' opacity="0"'));
        K.shape("M58 318 C58 308 100 304 160 304 C220 304 262 308 262 318 C262 332 220 336 160 336 C100 336 58 332 58 318 Z", CUSH);
        ids.up = K.id(); ids.ch = K.id();
        K.raw('<g id="' + ids.ch + '">');
        K.shape("M112 178 C124 168 140 166 160 166 C180 166 196 168 208 178 C214 200 212 240 206 284 L114 284 C108 240 106 200 112 178 Z", ch.top);
        if (ch.long) { K.line("M150 170 Q160 180 170 170", LINE, 1.6, ' opacity=".55"'); K.line("M160 178 L160 206", LINE, 1.6, ' opacity=".55"'); }
        else K.line("M146 169 Q160 180 174 169", LINE, 1.6, ' opacity=".55"');
        K.raw('</g>');
        K.shape("M74 300 C78 276 116 270 160 272 C204 270 242 276 246 300 C248 314 232 320 210 318 L110 318 C88 320 72 314 74 300 Z", ch.bot);
        K.line("M98 300 C122 292 150 295 166 309", LINE, 1.8, ' opacity=".7"');
        K.line("M222 300 C198 292 170 295 154 309", LINE, 1.8, ' opacity=".7"');
        K.raw('<g id="' + ids.up + '">');
        K.shape(tf(HF.neck, HX, HY, 1), ch.skin);
        /* re-cover the neckline so the collar sits over the neck */
        K.raw('</g>');
        K.raw('<g id="' + ids.up + 'b">');
        if (!ch.long) K.line("M146 169 Q160 180 174 169", LINE, 1.6, ' opacity=".55"');
        else K.line("M150 170 Q160 180 170 170", LINE, 1.6, ' opacity=".55"');
        headFront(K, ch, HX, HY, 1);
        [0, 1].forEach(function (m) {
          var t = function (d) { return tf(d, m ? 320 : 0, 0, 1, m); };
          if (ch.long) K.tube(t("M120 186 Q92 190 66 196 Q82 164 100 142"), 22, ch.top);
          else { K.tube(t("M94 192 Q78 194 66 196 Q82 164 100 142"), 17, ch.skin); K.tube(t("M120 186 Q104 189 90 191"), 24, ch.top); }
          K.tube(t("M103 135 L119 118.5"), 6.5, ch.skin);
          K.tube(t("M98 147 L103.5 137"), 15, ch.skin);
        });
        K.raw('</g>');
        stage.innerHTML = K.svg();
        var S = { r: ids.r.map(function (i) { return stage.querySelector("#" + i); }), ch: stage.querySelector("#" + ids.ch),
          up: [stage.querySelector("#" + ids.up), stage.querySelector("#" + ids.up + "b")] };
        return S;
      },
      frame: function (S, p) {
        var e = full(p), red = p.reduced, T = red ? 0 : p.time;
        S.ch.setAttribute("transform", "translate(160 284) scale(" + r2(1 + .035 * e) + " " + r2(1 + .022 * e) + ") translate(-160 -284)");
        S.up.forEach(function (g) { g.setAttribute("transform", "translate(0 " + r2(-2.5 * e) + ")"); });
        var used = 0, put = function (r, a, al, dots) {
          var el = S.r[used++]; if (!el) return;
          el.setAttribute("d", ringD(r, a, T * .35 + used * 1.7));
          el.setAttribute("opacity", r2(al));
          el.setAttribute("stroke-dasharray", dots ? ".5 7" : "none");
          el.setAttribute("stroke", dots ? GOLD : GOLDS);
        };
        if (p.k === "in") {
          /* dotted rings gather in toward the head as the chest fills */
          if (red) { put(84, 0, .5, 1); put(116, 0, .28, 1); }
          else for (var b = 0; b < p.dur - 1.4; b += .8) {
            var age = p.sec - b; if (age < 0 || age > 1.8) continue;
            var f = ease(age / 1.8); put(L.lerp(170, 62, f), 0, .65 * sin(PI * f), 1);
          }
        } else if (p.k === "out") {
          /* the hum: soft rippled rings ring out from the head and fade */
          if (red) { put(66, .8, .75, 0); put(98, .6, .45, 0); put(130, .4, .22, 0); }
          else {
            var life = 3.8, end = 1 - ease(Math.max(0, (p.sec - (p.dur - 1.1)) / 1.1)), calm = 1 - .5 * p.t;
            for (var i = 0, bb = .15; bb < p.dur - 1.6; i++, bb += .9) {
              var ag = p.sec - bb; if (ag < 0 || ag > life) continue;
              var x = ag / life, r = 56 + 104 * (1 - (1 - x) * (1 - x));
              put(r, (1.4 + 1.4 * (1 - x)) * calm, Math.pow(1 - x, 1.5) * Math.min(1, x / .1) * end * .95, 0);
            }
          }
        }
        for (var j = used; j < S.r.length; j++) S.r[j].setAttribute("opacity", 0);
      }
    };
  }

  /* ---------- scene 4: pursed lip, head and body in profile ---------- */
  var PX = 136, PY = 98, PS = 1.72;
  function pursedTorso(B) { return tf(pursedTorso0(B), 0, 12, 1); }
  function pursedTorso0(B) {
    return "M100 172 C120 162 150 162 170 170 C190 180 199 198 198 220 C197 232 195 240 194 248 C" + r2(194 + .4 * B) + " 256 " + r2(197 + B) + " 262 " + r2(197 + B) + " 274 " +
      "C" + r2(197 + B) + " 288 " + r2(194 + .5 * B) + " 300 190 312 L189 322 L90 322 C87 300 86 280 86 250 C86 214 90 186 100 172 Z";
  }
  function pursed(ch) {
    return {
      build: function (stage) {
        var K = kit(), ids = {}, fd = K.id(), mk = K.id(), ig = K.id(), og = K.id();
        K.defs.push('<linearGradient id="' + fd + '" gradientUnits="userSpaceOnUse" x1="0" y1="302" x2="0" y2="338"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
          '<mask id="' + mk + '" maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="360"><rect width="320" height="360" fill="url(#' + fd + ')"/></mask>' +
          '<linearGradient id="' + ig + '" gradientUnits="userSpaceOnUse" x1="306" y1="0" x2="196" y2="0"><stop offset="0" stop-color="' + GOLD + '" stop-opacity="0"/><stop offset=".6" stop-color="' + GOLD + '" stop-opacity=".8"/><stop offset="1" stop-color="' + GOLD + '"/></linearGradient>' +
          '<linearGradient id="' + og + '" gradientUnits="userSpaceOnUse" x1="198" y1="0" x2="314" y2="0"><stop offset="0" stop-color="' + GOLD + '"/><stop offset=".55" stop-color="' + GOLD + '" stop-opacity=".8"/><stop offset="1" stop-color="' + GOLD + '" stop-opacity="0"/></linearGradient>');
        disc(K, 150, 170, 134);
        K.shape(tf(HP.neck, PX, PY, PS), ch.skin);
        ids.t = K.shape(pursedTorso(0), ch.top);
        K.line("M104 184 C120 192 146 192 166 183", LINE, 1.6, ' opacity=".5"');
        K.line("M124 192 C136 200 142 222 143 250 C144 274 145 300 146 333", LINE, LW);
        var h = headProfile(K, ch, PX, PY, PS, { purse: 1 });
        ids.mouth = h.mouth; ids.o = h.o;
        ids.i1 = K.line("M306 92 C268 90 240 116 216 124 C204 128 196 126 189 121", "url(#" + ig + ")", LW, ' stroke-dasharray="22 30" opacity="0"');
        ids.i2 = K.line("M306 150 C266 152 238 136 216 130 C205 127.5 197 127 190 123", "url(#" + ig + ")", LW, ' stroke-dasharray="22 30" opacity="0"');
        ids.out = K.line("M0 0", "url(#" + og + ")", LW, ' stroke-dasharray="22 8" opacity="0"');
        ids.cue = bellyCue(K);
        stage.innerHTML = K.svg();
        var S = refs(stage, { t: ids.t, mouth: ids.mouth, o: ids.o, i1: ids.i1, i2: ids.i2, out: ids.out });
        S.cue = ids.cue.map(function (i) { return stage.querySelector("#" + i); });
        return S;
      },
      frame: function (S, p) {
        var red = p.reduced, T = red ? 0 : p.time, e = full(p);
        var a = p.k === "in" ? (red ? 1 : env(p.t, .2, .25)) : 0;
        var s = p.k === "out" ? (red ? 1 : env(p.t, .12, .14)) : 0;
        var pu = p.k === "out" ? (red ? 1 : env(p.t, .08, .07)) : 0;
        var B = 5 * e;
        S.t.setAttribute("d", pursedTorso(B));
        S.mouth.setAttribute("opacity", r2(1 - pu)); S.o.setAttribute("opacity", r2(pu));
        S.i1.setAttribute("opacity", r2(a)); S.i2.setAttribute("opacity", r2(a));
        S.i1.setAttribute("stroke-dashoffset", r2(-T * 60)); S.i2.setAttribute("stroke-dashoffset", r2(-T * 60 - 26));
        /* one long, soft, steady stream leaving the lips */
        var mx = PX + 35.5 * PS, my = PY + 21 * PS, d = "M" + r2(mx) + " " + r2(my);
        for (var k = 1; k <= 30; k++) { var u = k / 30, x = mx + u * 118, y = my + 6 * u + 3.2 * u * sin(u * 7 - T * 2.2); d += "L" + r2(x) + " " + r2(y); }
        S.out.setAttribute("d", d); S.out.setAttribute("opacity", r2(s)); S.out.setAttribute("stroke-dashoffset", r2(-T * 26));
        /* the belly draws gently in on the long out-breath */
        setCue(S.cue, 197 + B, 286, 9, .9 * s, 7 + 4 * (1 - e));
      }
    };
  }

  var REF = "Finch's soft characters, Headspace breathing illustrations, Icons8 Notion line art, Japanese wellness line illustration, the pursed lip line-art reference";
  ["n"].forEach(function (k) {
    var ch = CH[k], nm = "Warm line art, " + ch.label;
    LAB.add("belly", Object.assign({ id: "b-" + k + "-seated", name: nm + ", seated", bg: "#FFFFFF", ref: REF,
      note: "Seated in profile on a cushion. The lower belly swells forward and warms gold with three small marks as you breathe in, while the chest and shoulders stay still." }, seated(ch)));
    LAB.add("belly", Object.assign({ id: "b-" + k + "-standing", name: nm + ", standing", bg: "#FFFFFF", ref: REF,
      note: "Standing in profile. The belly pushes forward with gold marks fanning out on the in-breath and settles back on the out-breath." }, standing(ch)));
    LAB.add("hum", Object.assign({ id: "b-" + k + "-bhramari", name: nm + ", Bhramari", bg: "#FFFFFF", ref: REF + ", Ripples of sound",
      note: "Index fingers rest on the ear flaps, elbows out. Dotted rings gather in as the chest fills, then soft rings hum out around the head." }, bhramari(ch)));
    LAB.add("pursed", Object.assign({ id: "b-" + k + "-pursed", name: nm + ", pursed lip", bg: "#FFFFFF", ref: REF,
      note: "Two gold air lines flow into the nose, then the lips form a small o and one long, steady line flows out while marks show the belly drawing in." }, pursed(ch)));
  });
})();
