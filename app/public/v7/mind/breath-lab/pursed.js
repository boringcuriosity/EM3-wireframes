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

})();
