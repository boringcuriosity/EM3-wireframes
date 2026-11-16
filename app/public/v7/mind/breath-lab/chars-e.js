/* chars-e, Ink and gold: bold even black line, clothes filled solid black with a few white fold strokes,
   white skin with black-line features, solid black hair, one soft beige blob behind the figure.
   The breath cue is the only colour: Rhythm gold outlined in black, like an icon.
   Two characters (an Indian woman with a low bun, a clean-shaven Indian man) in four scenes.
   Classes "ce-", SVG ids "ce" + n. */
(function () {
  var L = LAB.L, C = L.C, n = 0, PI = Math.PI;
  var uid = function () { return "ce" + (n++) + Math.random().toString(36).slice(2, 5); };
  var f = function (v) { return Math.round(v * 10) / 10; };
  var ss = function (a, b, x) { x = L.clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };

  /* tones, defined once */
  var INK = C.g900, SKIN = C.white, BLOB = C.peach100, GOLD = C.gold400, GOLD2 = C.gold500, W = 2.75;
  var REF = "Reference illustration (black, white and gold meditation line art); Headspace and Calm character sets; Dribbble black-fill yoga line art; Apple Mindfulness for the calm pacing";

  var css = document.createElement("style");
  css.textContent =
    ".ce-svg{position:absolute;left:0;top:0;width:320px;height:360px;display:block;overflow:hidden}" +
    ".ce-svg *{vector-effect:non-scaling-stroke}" +
    ".ce-s{fill:" + SKIN + ";stroke:" + INK + ";stroke-width:" + W + ";stroke-linejoin:round;stroke-linecap:round}" +
    ".ce-b{fill:" + INK + ";stroke:" + INK + ";stroke-width:" + W + ";stroke-linejoin:round;stroke-linecap:round}" +
    ".ce-k{fill:none;stroke:" + INK + ";stroke-width:" + W + ";stroke-linejoin:round;stroke-linecap:round}" +
    ".ce-f{fill:none;stroke:" + INK + ";stroke-width:2.2;stroke-linecap:round}" +
    ".ce-w{fill:none;stroke:#fff;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}" +
    ".ce-g{fill:" + GOLD + ";stroke:" + INK + ";stroke-width:2.4;stroke-linejoin:round;stroke-linecap:round}" +
    ".ce-go{fill:none;stroke:" + INK + ";stroke-linecap:round;stroke-linejoin:round}" +
    ".ce-gi{fill:none;stroke:" + GOLD + ";stroke-linecap:round;stroke-linejoin:round}";
  document.head.appendChild(css);

  function mk(stage, inner) {
    stage.innerHTML = '<svg class="ce-svg" viewBox="0 0 320 360">' + inner + '</svg>';
    return stage.firstChild;
  }
  function q(svg, sel) { return svg.querySelector(sel); }
  function set(el, k, v) { if (el) el.setAttribute(k, v); }
  /* a gold line outlined in black: an ink stroke under a gold stroke, both share one path */
  function gl(cls, w, d) {
    return '<g class="' + cls + '"><path class="ce-go" stroke-width="' + (w + 4.6) + '" d="' + (d || "M0 0") + '"/>' +
      '<path class="ce-gi" stroke-width="' + w + '" d="' + (d || "M0 0") + '"/></g>';
  }
  function setGl(g, d) { var ps = g.querySelectorAll("path"); ps[0].setAttribute("d", d); ps[1].setAttribute("d", d); }
  /* lung fullness, with still end states under reduced motion */
  function full(p) { return p.reduced ? (p.k === "in" ? 1 : p.k === "out" ? 0 : (p.prev === "in" ? 1 : 0)) : p.e; }

  /* ---------- the head in profile, facing right, local units (about 70 wide). pu 0..1 purses the lips ---------- */
  function headPath(pu) {
    var x = 3.2 * pu;
    return "M-6,30 C-22,26 -32,10 -31,-4 C-30,-24 -14,-37 4,-37 C20,-37 30,-25 30,-11 L31,-4" +
      " C32,0 35.5,3 36.8,6.4 C37.4,8.4 35.4,9.6 32.4,9.8" +
      " C" + f(33 + x * .7) + ",10.6 " + f(33.4 + x) + ",11.8 " + f(32.8 + x) + ",13.2" +
      " C" + f(33.6 + x) + ",14.8 " + f(33.2 + x) + ",17 " + f(31.4 + x * .5) + ",18.4" +
      " C31,24 27,29.5 19,30.8 C12,32 4,32 -6,30Z";
  }
  var HAIR_W = "M27.5,-14 C27,-31 12,-41 -4,-40 C-23,-39 -36,-22 -34,-2 C-33,10 -28,19 -21,24 L-13,19 C-15,9 -13,0 -7,-7 C1,-15 15,-18 27.5,-14Z";
  var HAIR_M = "M25.5,-24 C24,-34 13,-40.5 -3,-40 C-21,-39.5 -33.5,-26 -32.5,-7 C-32,1 -30.5,7 -28,12 C-25,8 -21.5,3 -17.5,-1 C-16,-9 -10,-14.5 -3,-15.5 C6,-17.5 15,-21 25.5,-24Z";
  function headSide(ch, u, pursed) {
    var w = ch === "w";
    return (w ? '<circle class="ce-b" cx="-31" cy="19" r="11.5"/><path class="ce-w" d="M-37,14 C-39,18 -38,23 -35,26"/>' : '') +
      (w ? '<path class="ce-s" d="M-7,24 L-9,48 L15,48 L13,28"/>' : '<path class="ce-s" d="M-10,22 L-12,48 L17,48 L15,26"/>') +
      '<path class="ce-s ce-hd" d="' + headPath(pursed ? 1 : 0) + '"/>' +
      '<path class="ce-b" d="' + (w ? HAIR_W : HAIR_M) + '"/>' +
      (w ? '<path class="ce-w" d="M8,-30 C0,-30 -10,-26 -16,-18"/>' : '<path class="ce-w" d="M10,-34 C2,-35 -8,-32 -15,-26"/><path class="ce-w" d="M-25,0 C-26,4 -25.5,6 -24.5,8"/>') +
      '<path class="ce-s" d="M-1,-11 C-10,-14 -15,-6 -14,0 C-13,7 -8,10 -2,8"/><path class="ce-f" d="M-4,-5 C-8,-4 -8,2 -4,3"/>' +
      '<path class="ce-f" d="M12.5,-3 Q17,1.2 21.5,-3"/>' +
      '<path class="ce-f ce-sm" d="M25,15.6 Q28,17.8 31,15.2"/>' +
      '<g class="ce-o" opacity="0"><ellipse cx="' + f(35.2) + '" cy="14.2" rx="2.2" ry="2.6" fill="' + INK + '"/></g>';
  }
  /* the mouth: a small smile, or a small "o" as the lips purse */
  function setMouth(svg, pu) {
    set(q(svg, ".ce-hd"), "d", headPath(pu));
    set(q(svg, ".ce-sm"), "opacity", f(1 - ss(0, .5, pu)));
    var o = q(svg, ".ce-o"); set(o, "opacity", f(ss(.4, 1, pu)));
    set(o.firstChild, "cx", f(32.4 + 3.2 * pu));
  }

  /* ---------- the head from the front, local units ---------- */
  var HAIRF_W = "M-28,8 C-33,-18 -18,-37 2,-36 C21,-35 33,-19 28,8 C26,-3 22,-12 15,-17 C7,-9 -8,-5 -23,-7 C-25,-3 -26.5,2 -28,8Z";
  var HAIRF_M = "M-27,-3 C-29.5,-24 -16,-37.5 1,-37.5 C18,-37.5 30,-24 27,-3 C26,-9 24,-14 21,-17 C10,-21 -8,-21 -21,-17 C-24,-13 -26,-8 -27,-3Z";
  function headFront(ch) {
    var w = ch === "w";
    return (w ? '<circle class="ce-b" cx="-25" cy="-17" r="8.5"/><path class="ce-w" d="M-29,-21 C-31.5,-18 -31.5,-14 -29.5,-12"/>' : '') +
      (w ? '<path class="ce-s" d="M-10,22 L-11,44 L11,44 L10,22"/>' : '<path class="ce-s" d="M-12,22 L-13.5,44 L13.5,44 L12,22"/>') +
      '<path class="ce-s" d="M-25.5,-4 C-33,-7 -35,10 -25,11"/><path class="ce-s" d="M25.5,-4 C33,-7 35,10 25,11"/>' +
      '<ellipse class="ce-s" cx="0" cy="2" rx="26.5" ry="30.5"/>' +
      '<path class="ce-b" d="' + (w ? HAIRF_W : HAIRF_M) + '"/>' +
      (w ? '<path class="ce-w" d="M-6,-31 C-14,-29 -21,-23 -24,-15"/>' : '<path class="ce-w" d="M-4,-33 C-12,-32 -19,-27 -22,-20"/>') +
      '<path class="ce-f" d="M-17,4 Q-12,8 -7,4"/><path class="ce-f" d="M7,4 Q12,8 17,4"/>' +
      '<path class="ce-f" d="M0,9 C1.5,12 1.5,14 -1.5,15"/>' +
      '<path class="ce-f" d="M-6,21 Q0,25 6,21"/>';
  }

  var BLOB_D = {
    seated: "M60,150 C52,92 104,52 168,56 C236,60 282,106 276,176 C272,224 290,262 262,296 C232,330 120,330 82,300 C50,274 66,206 60,150Z",
    standing: "M70,120 C62,64 116,30 176,36 C240,42 270,96 262,154 C256,198 276,244 252,286 C226,328 132,334 96,300 C64,270 78,180 70,120Z",
    hum: "M48,140 C40,76 100,30 170,34 C244,38 290,92 280,162 C274,210 296,254 268,292 C238,330 108,334 72,304 C40,276 54,200 48,140Z",
    pursed: "M38,140 C30,72 92,26 160,30 C226,34 262,82 256,146 C252,196 270,248 246,290 C220,332 110,338 70,306 C36,278 46,208 38,140Z"
  };
  function blob(k) { return '<path fill="' + BLOB + '" d="' + BLOB_D[k] + '"/>'; }

  /* ---------- belly cue, the same in both belly scenes: two gold arcs and an arrow beside the belly ---------- */
  function bellyCue() {
    return '<g class="ce-cue">' + gl("ce-a1", 3.4) + gl("ce-a2", 3.4) +
      '<path class="ce-g ce-ar" d="M0,0"/></g>';
  }
  /* x: the belly front, y its middle, e fullness, p phase */
  function setBellyCue(svg, x, y, e, p) {
    var red = p.reduced, inn = p.k === "in", out = p.k === "out";
    var vis = red ? (p.k === "hold" ? 0 : 1) : (inn ? ss(0, .2, p.t) : out ? ss(0, .2, p.t) * (1 - ss(.85, 1, p.t)) : 0);
    var drift = red ? .5 : (inn ? p.t : out ? 1 - p.t : 0);
    var gx = x + 10 + 4 * drift;
    setGl(q(svg, ".ce-a1"), "M" + f(gx) + "," + f(y - 13) + " Q" + f(gx + 7) + "," + y + " " + f(gx) + "," + f(y + 13));
    setGl(q(svg, ".ce-a2"), "M" + f(gx + 10) + "," + f(y - 20) + " Q" + f(gx + 20) + "," + y + " " + f(gx + 10) + "," + f(y + 20));
    /* the arrow sits past the arcs: points out on the in-breath, back toward the belly on the out-breath */
    var ax = gx + 30, dir = out ? -1 : 1, s = 7;
    var tip = ax + dir * s, back = ax - dir * s;
    q(svg, ".ce-ar").setAttribute("d", "M" + f(tip) + "," + y + " L" + f(back) + "," + f(y - s) + " L" + f(back) + "," + f(y + s) + "Z");
    q(svg, ".ce-cue").setAttribute("opacity", f(vis));
  }

  /* ---------- 1. belly, seated cross-legged, side profile ---------- */
  function torsoSeated(b) {
    return "M140,131 C124,133 111,143 109,161 C106,190 108,228 114,258 L168,262" +
      " C" + f(170 + b * .6) + ",260 " + f(174 + b) + ",248 " + f(174 + b) + ",228" +
      " C" + f(174 + b) + ",212 " + f(173 + b * .35) + ",202 172,194" +
      " C177,178 177,156 167,139 C163,133 157,131 152,131Z";
  }
  function seated(ch) {
    var B = 11;
    return {
      build: function (stage) {
        var u = uid(), svg = mk(stage,
          blob("seated") +
          '<rect class="ce-s" x="84" y="300" width="198" height="22" rx="11"/>' +
          '<path class="ce-b ce-tor" d="' + torsoSeated(0) + '"/>' +
          '<path class="ce-w ce-fold" d="M0,0"/>' +
          /* lap: seat and near thigh sloping down to a low knee */
          '<path class="ce-b" d="M112,244 C102,266 104,298 128,305 L250,306 C264,306 270,296 268,284 C266,272 256,264 240,261 C220,256 196,253 168,252Z"/>' +
          /* far foot, tucked under the near knee, toes peeking out in front */
          '<path class="ce-s" d="M232,296 C244,288 262,286 274,290 C282,293 282,302 274,305 C262,309 244,308 234,305 C228,303 228,299 232,296Z"/>' +
          '<path class="ce-f" d="M268,289.5 C270,292 270,295 268,297 M274,291 C276,293 276,296 274,298"/>' +
          /* near shin crossing in front of the far one, from the knee down and back to the ankle, a white gap around it */
          '<path class="ce-b" style="stroke:#fff;stroke-width:2.6" d="M248,262 C262,262 270,276 264,288 C262,292 258,293 252,294 L172,306 C160,308 154,298 162,290 L232,268 C238,265 242,262 248,262Z"/>' +
          /* near foot at the ankle, sole turned out */
          '<path class="ce-s" d="M166,289 C154,283 138,286 132,294 C128,302 136,309 150,308 C160,307 168,300 166,289Z"/>' +
          '<path class="ce-f" d="M137,293 C136,296 136,299 138,301"/>' +
          /* near arm: upper arm down the side, elbow at the hip behind the belly, forearm along the thigh, a white gap around it */
          '<path fill="none" stroke="#fff" stroke-width="23" stroke-linecap="round" stroke-linejoin="round" d="M146,152 L141,238 Q140,252 154,253 L224,260"/>' +
          '<path fill="none" stroke="' + INK + '" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" d="M146,152 L141,238 Q140,252 154,253 L224,260"/>' +
          '<path class="ce-w" d="M136,170 C135,190 134,210 134,226"/>' +
          /* hand resting on the knee, fingers over the front */
          '<path class="ce-s" d="M222,252 C232,248 250,250 259,256 C266,261 268,270 264,276 C261,279 257,278 255,274 C253,270 248,268 242,268 C234,268 226,266 222,264 C217,261 217,255 222,252Z"/>' +
          '<path class="ce-f" d="M256,258 C260,262 262,267 261,272"/>' +
          '<g transform="translate(149 90) scale(1.04)">' + headSide(ch, u) + '</g>' +
          bellyCue());
        return { svg: svg, tor: q(svg, ".ce-tor"), fold: q(svg, ".ce-fold") };
      },
      frame: function (s, p) {
        var e = full(p), b = B * e;
        s.tor.setAttribute("d", torsoSeated(b));
        s.fold.setAttribute("d", "M" + f(158 + b * .8) + ",208 C" + f(163 + b * .9) + ",218 " + f(163 + b * .9) + ",230 " + f(157 + b * .8) + ",240");
        setBellyCue(s.svg, 174 + b, 222, e, p);
      }
    };
  }

  /* ---------- 2. belly, standing, side profile ---------- */
  function torsoStanding(b) {
    return "M150,97 C135,99 126,110 126,126 C124,152 126,178 130,202 L186,204" +
      " C" + f(186 + b * .5) + ",202 " + f(186 + b) + ",194 " + f(186 + b) + ",178" +
      " C" + f(186 + b) + ",162 " + f(182 + b * .35) + ",152 180,146" +
      " C186,132 184,112 172,100 C168,97 164,96 160,96Z";
  }
  function standing(ch) {
    var B = 11;
    return {
      build: function (stage) {
        var u = uid(), svg = mk(stage,
          blob("standing") +
          '<path class="ce-b ce-tor" d="' + torsoStanding(0) + '"/>' +
          '<path class="ce-w ce-fold" d="M0,0"/>' +
          /* trousers */
          '<path class="ce-b" d="M129,196 L186,198 C188,232 186,272 183,318 L141,318 C138,272 132,232 129,196Z"/>' +
          '<path class="ce-w" d="M158,236 L161,312"/>' +
          /* feet */
          '<path class="ce-s" d="M141,316 L182,316 C192,318 202,323 203,329 C203,332 200,334 196,334 L143,334 C139,334 137,330 138,322Z"/>' +
          /* arm hangs behind the belly line */
          '<path class="ce-w" d="M164,118 C168,146 167,172 162,192"/>' +
          '<path class="ce-s" d="M145,194 L162,194 C166,202 167,212 163,221 C159,227 151,227 147,221 C143,213 142,203 145,194Z"/>' +
          '<path class="ce-f" d="M160,204 C163,208 163,213 161,216"/>' +
          '<g transform="translate(158 58) scale(.92)">' + headSide(ch, u) + '</g>' +
          bellyCue());
        return { svg: svg, tor: q(svg, ".ce-tor"), fold: q(svg, ".ce-fold") };
      },
      frame: function (s, p) {
        var e = full(p), b = B * e;
        s.tor.setAttribute("d", torsoStanding(b));
        s.fold.setAttribute("d", "M" + f(172 + b * .8) + ",162 C" + f(177 + b * .9) + ",172 " + f(177 + b * .9) + ",182 " + f(171 + b * .8) + ",192");
        setBellyCue(s.svg, 186 + b, 176, e, p);
      }
    };
  }

  /* ---------- 3. Bhramari, front view, index fingers on the ear flaps ---------- */
  var HX = 160, HY = 92, HS = 1.2;
  /* one hand at the left ear, in local units: the ear flap is at (0,0), the hand sits outside it */
  var HAND = '<path class="ce-s" d="M-19,28 C-24,20 -24,8 -18,1 C-16,-3 -13,-4.5 -9,-4.5 L0,-3.6 C4,-3.4 5,2.2 1,2.6 L-8,3.4 C-5.5,7 -5.5,10.5 -8,12.5 C-5.5,15.5 -6.5,19 -10,20.5 C-10.5,24 -12,27 -13,28Z"/>' +
    '<path class="ce-f" d="M-8,3.4 C-11,4.5 -12.5,6.5 -12.5,8.5 M-8,12.5 C-10.5,12.5 -12,13.5 -12.5,15"/>';
  function torsoFront(k) {
    var x = 52 * k;
    return "M" + f(160 - x) + ",144 C" + f(138 - x * .3) + ",146 " + f(104 - (k - 1) * 20) + ",150 " + f(102 - (k - 1) * 20) + ",168" +
      " C102,204 112,236 118,262 L202,262 C208,236 218,204 " + f(218 + (k - 1) * 20) + ",168" +
      " C" + f(216 + (k - 1) * 20) + ",150 " + f(182 + x * .3) + ",146 " + f(160 + x) + ",144Z";
  }
  function hum(ch) {
    return {
      build: function (stage) {
        var u = uid(), rings = "";
        for (var i = 0; i < 3; i++) rings += gl("ce-r ce-r" + i, 3, "M0 0");
        var svg = mk(stage,
          blob("hum") +
          '<g class="ce-rings">' + rings + '</g>' +
          /* arms: elbows out at shoulder height, forearms up to the ears */
          '<path class="ce-k" style="stroke-width:24" d="M118,160 L62,170 L108,128"/>' +
          '<path class="ce-k" style="stroke-width:24" d="M202,160 L258,170 L212,128"/>' +
          '<path class="ce-b ce-tor" d="' + torsoFront(1) + '"/>' +
          '<path class="ce-w" d="M92,156 C84,160 76,164 72,170 M228,156 C236,160 244,164 248,170"/>' +
          '<path class="ce-w" d="M136,170 C140,190 140,214 136,234 M184,170 C180,190 180,214 184,234"/>' +
          /* lap, legs crossed, feet meeting in the middle */
          '<path class="ce-b" d="M120,250 C90,252 64,266 62,290 C60,308 76,316 100,316 L220,316 C244,316 260,308 258,290 C256,266 230,252 200,250Z"/>' +
          '<path class="ce-w" d="M84,296 C112,288 138,290 152,298 M236,296 C208,288 182,290 168,298"/>' +
          '<path class="ce-s" d="M126,300 C138,294 156,296 166,302 C170,306 166,312 158,312 L130,312 C122,310 120,304 126,300Z"/>' +
          '<path class="ce-s" d="M194,300 C182,294 164,296 154,302 C150,306 154,312 162,312 L190,312 C198,310 200,304 194,300Z"/>' +
          '<g transform="translate(' + HX + ' ' + HY + ') scale(' + HS + ')">' + headFront(ch) + '</g>' +
          '<g transform="translate(' + (HX - 34) + ' ' + (HY + 4) + ') scale(1.1)">' + HAND + '</g>' +
          '<g transform="translate(' + (HX + 34) + ' ' + (HY + 4) + ') scale(-1.1 1.1)">' + HAND + '</g>');
        if (ch === "m") q(svg, ".ce-tor").setAttribute("transform", "translate(160 0) scale(1.06 1) translate(-160 0)");
        return { svg: svg, tor: q(svg, ".ce-tor"), r: [].slice.call(svg.querySelectorAll(".ce-r")) };
      },
      frame: function (s, p) {
        var e = full(p);
        s.tor.setAttribute("d", torsoFront(1 + .03 * e));
        var humOn = p.k === "out";
        s.r.forEach(function (g, i) {
          var r, a;
          if (!humOn) { a = 0; r = 50; }
          else if (p.reduced) { r = 56 + i * 12; a = 1 - i * .25; }
          else {
            var x = ((p.sec / 2.1) + i / 3) % 1;
            r = 54 + 30 * x;
            a = ss(0, .15, x) * (1 - ss(.55, 1, x)) * ss(0, .06, p.t) * (1 - ss(.9, 1, p.t));
          }
          /* the upper part of each ring, an open arc over the head */
          var a0 = PI * 1.12, a1 = PI * 1.88;
          setGl(g, "M" + f(HX + r * Math.cos(a0)) + "," + f(HY + r * Math.sin(a0)) + " A" + f(r) + "," + f(r) + " 0 0 1 " + f(HX + r * Math.cos(a1)) + "," + f(HY + r * Math.sin(a1)));
          g.setAttribute("opacity", f(a));
        });
      }
    };
  }

  /* ---------- 4. pursed lip, profile bust ---------- */
  var PS = 2.05, PX = 124, PY = 120;
  function P(x, y) { return [PX + x * PS, PY + y * PS]; }
  function pursed(ch) {
    return {
      build: function (stage) {
        var u = uid(), nose = P(32.5, 9.5), lips = P(36.5, 14.2);
        var svg = mk(stage,
          '<defs><linearGradient id="' + u + 'f" gradientUnits="userSpaceOnUse" x1="' + f(nose[0]) + '" x2="312" y1="0" y2="0">' +
          '<stop offset="0" stop-color="#fff"/><stop offset=".75" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
          '<mask id="' + u + 'm" maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="360"><rect width="320" height="360" fill="url(#' + u + 'f)"/></mask></defs>' +
          blob("pursed") +
          /* bust, cropped at the chest with a neat rounded edge */
          '<path class="ce-b"' + (ch === "m" ? ' transform="translate(146 0) scale(1.07 1) translate(-146 0)"' : '') + ' d="M112,198 C84,202 64,220 60,250 L58,314 C58,328 66,336 80,336 L212,336 C226,336 234,328 234,314 L232,258 C230,230 212,208 182,202Z"/>' +
          '<path class="ce-w" d="M200,232 C210,250 214,276 212,300 M86,236 C80,256 80,284 84,304"/>' +
          '<g class="ce-hdg" transform="translate(' + PX + ' ' + PY + ') scale(' + PS + ')">' + headSide(ch, u) + '</g>' +
          '<g class="ce-in" mask="url(#' + u + 'm)">' + 
          '<path class="ce-l0" fill="none" stroke="' + GOLD2 + '" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="12 9" d="M0,0"/><path class="ce-l1" fill="none" stroke="' + GOLD2 + '" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="12 9" d="M0,0"/></g>' +
          '<g class="ce-ih">' + '<path class="ce-g ce-h0" d="M0,0"/><path class="ce-g ce-h1" d="M0,0"/></g>' +
          '<g class="ce-out"><path class="ce-g ce-st" d="M0,0"/><path class="ce-w ce-sd" stroke="' + C.gold100 + '" style="stroke:' + C.gold100 + ';stroke-width:2" d="M0,0"/></g>');
        return { svg: svg, u: u, nose: nose, lips: lips };
      },
      frame: function (s, p) {
        var red = p.reduced, inn = p.k === "in", out = p.k === "out";
        /* lips purse at the start of the out-breath and relax as the in-breath begins */
        var pu = out ? (red ? 1 : ss(0, .12, p.t)) : (red ? 0 : 1 - ss(0, .25, p.t));
        if (!out && p.prev !== "out") pu = 0;
        setMouth(s.svg, pu);
        /* in: two level lines flow toward the nostril, the far end fades in */
        var nx = s.nose[0] + 6, ny = s.nose[1];
        var vin = inn ? (red ? 1 : ss(0, .15, p.t) * (1 - ss(.85, 1, p.t))) : 0;
        var flow = red ? 0 : (p.time * 26) % 21;
        [[-4, 0], [6, 0]].forEach(function (o, i) {
          var y = ny + o[0], x0 = nx + 8 + i * 2, len = 88 - i * 12;
          var hl = q(s.svg, ".ce-l" + i);
          hl.setAttribute("d", "M" + f(x0 + len) + "," + f(y) + " L" + f(x0 + 1) + "," + f(y));
          hl.setAttribute("stroke-dashoffset", f(-flow));
          var h = q(s.svg, ".ce-h" + i), hx = x0 - 6;
          h.setAttribute("d", "M" + f(hx) + "," + f(y) + " L" + f(hx + 6) + "," + f(y - 4) + " L" + f(hx + 6) + "," + f(y + 4) + "Z");
        });
        q(s.svg, ".ce-in").setAttribute("opacity", f(vin));
        q(s.svg, ".ce-ih").setAttribute("opacity", f(vin));
        /* out: one long, soft, steady stream from the small "o" */
        var vout = out ? (red ? 1 : ss(.06, .2, p.t) * (1 - ss(.88, 1, p.t))) : 0;
        var grow = red ? 1 : ss(.06, .45, p.t);
        var x0 = s.lips[0] + 4, y0 = s.lips[1], len = 20 + 76 * grow, x1 = x0 + len;
        var w0 = 2.4, w1 = 4.4 + 1.2 * grow;
        s.svg.querySelector(".ce-st").setAttribute("d",
          "M" + f(x0) + "," + f(y0 - w0) + " C" + f(x0 + len * .5) + "," + f(y0 - w0 - 1) + " " + f(x1 - 10) + "," + f(y0 - w1) + " " + f(x1) + "," + f(y0 - w1) +
          " A" + f(w1) + "," + f(w1) + " 0 0 1 " + f(x1) + "," + f(y0 + w1) +
          " C" + f(x1 - 10) + "," + f(y0 + w1) + " " + f(x0 + len * .5) + "," + f(y0 + w0 + 1) + " " + f(x0) + "," + f(y0 + w0) + "Z");
        var sd = s.svg.querySelector(".ce-sd");
        sd.setAttribute("d", "M" + f(x0 + 4) + "," + f(y0) + " L" + f(x1 - 2) + "," + f(y0));
        sd.setAttribute("stroke-dasharray", "8 14");
        sd.setAttribute("stroke-dashoffset", f(red ? 0 : -(p.time * 22) % 22));
        q(s.svg, ".ce-out").setAttribute("opacity", f(vout));
      }
    };
  }

  /* ---------- register ---------- */
  var WHO = { w: "woman", m: "man" };
  ["w", "m"].forEach(function (ch) {
    var who = WHO[ch];
    LAB.add("belly", Object.assign({ id: "e-" + who + "-seated", name: "Ink and gold, " + who + ", seated", bg: C.white, ref: REF,
      note: "The belly outline swells forward on the in-breath and falls back on the out-breath while the chest stays still, and a gold arrow beside it shows which way to go." }, seated(ch)));
    LAB.add("belly", Object.assign({ id: "e-" + who + "-standing", name: "Ink and gold, " + who + ", standing", bg: C.white, ref: REF,
      note: "Standing side view: the belly pushes out past the gold arcs on the in-breath and draws back in on the out-breath, with the arm hanging behind it." }, standing(ch)));
    LAB.add("hum", Object.assign({ id: "e-" + who + "-hum", name: "Ink and gold, " + who + ", Bhramari", bg: C.white, ref: REF,
      note: "Index fingers rest on the ear flaps with elbows out; on the hum soft gold arcs ripple up and away from the head, and the in-breath stays still." }, hum(ch)));
    LAB.add("pursed", Object.assign({ id: "e-" + who + "-pursed", name: "Ink and gold, " + who + ", pursed lip", bg: C.white, ref: REF,
      note: "Two level gold lines flow into the nostril on the in-breath; on the out-breath the lips form a small o and one long gold stream flows out." }, pursed(ch)));
  });
})();
