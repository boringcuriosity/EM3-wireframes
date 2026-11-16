/* Belly Breathing: three ways to show "your belly rises, your chest stays still". Breathe in 4 s, out 6 s.
   Each variant reads p.e (lung fullness, already sine eased). Reduced motion: full on "in", empty on "out". */
(function () {
  var n = 0, pre = "bb" + Math.random().toString(36).slice(2, 6);
  function uid() { return pre + (n++); }
  function full(p) { return p.reduced ? (p.k === "out" ? 0 : 1) : p.e; }
  function f(v) { return Math.round(v * 100) / 100; }
  /* a tapered limb: a capsule from (a,b) radius r1 to (c,d) radius r2, so joints overlap into soft round elbows */
  function limb(a, b, c, d, r1, r2) {
    var dx = c - a, dy = d - b, l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l, ny = dx / l;
    return "M" + f(a + nx * r1) + " " + f(b + ny * r1) + "L" + f(c + nx * r2) + " " + f(d + ny * r2) +
      "A" + r2 + " " + r2 + " 0 0 0 " + f(c - nx * r2) + " " + f(d - ny * r2) + "L" + f(a - nx * r1) + " " + f(b - ny * r1) +
      "A" + r1 + " " + r1 + " 0 0 0 " + f(a + nx * r1) + " " + f(b + ny * r1) + "Z";
  }
  var GLOW = function (id) { return '<radialGradient id="' + id + '" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#F3D161"/><stop offset=".5" stop-color="#FDE8A4" stop-opacity=".8"/><stop offset="1" stop-color="#FDE8A4" stop-opacity="0"/></radialGradient>'; };
  var HALO = function (id) { return '<radialGradient id="' + id + '" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF8E0"/><stop offset=".7" stop-color="#FFF8E0" stop-opacity=".65"/><stop offset="1" stop-color="#FFF8E0" stop-opacity="0"/></radialGradient>'; };

  var css = document.createElement("style");
  css.textContent =
    ".bb-svg{position:absolute;inset:0;width:320px;height:360px;display:block;overflow:visible}" +
    ".bb-pearl{position:absolute;left:0;top:0;width:120px;height:120px;will-change:transform}" +
    ".bb-pearl svg{display:block;position:relative;filter:drop-shadow(0 8px 16px rgba(166,138,45,.28))}" +
    ".bb-pearl i{position:absolute;inset:-22%;border-radius:50%;background:radial-gradient(circle,rgba(253,232,164,.55) 34%,rgba(255,248,224,.22) 54%,rgba(255,248,224,0) 70%)}" +
    ".bb-tag{position:absolute;font:500 12px/16px Roboto,sans-serif;letter-spacing:.4px;color:#A68A2D;white-space:nowrap}";
  document.head.appendChild(css);

  /* shared character colours: warm skin, soft lavender kurta, deeper lavender trousers, gold for the breath */
  var SK = "#C68B62", SKD = "#B07A54", HR = "#3D302A", KU = "#C9C2F2", KUD = "#B4ABEA", KUS = "#A79DE3", PA = "#8F86C9", PAD = "#7E74BD";

  /* A. Seated side profile: a soft forward swell of the lower belly, the chest line never moves */
  LAB.add("belly", {
    id: "belly-seated", name: "Seated profile",
    note: "A calm seated person in side view. The lower belly swells softly forward and glows gold as you breathe in, while the chest stays still.",
    ref: "Headspace character illustrations, Calm body scan",
    build: function (stage) {
      var g = uid(), c = uid(), h = uid(), sh = uid();
      stage.innerHTML =
        '<svg class="bb-svg" viewBox="0 0 320 360" aria-hidden="true"><defs>' + HALO(h) + GLOW(g) +
        '<linearGradient id="' + sh + '" x1="146" y1="0" x2="176" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="' + KUS + '" stop-opacity=".7"/><stop offset="1" stop-color="' + KUS + '" stop-opacity="0"/></linearGradient>' +
        '<clipPath id="' + c + '"><path class="bb-tc"/></clipPath></defs>' +
        '<circle cx="168" cy="176" r="134" fill="url(#' + h + ')"/>' +
        '<ellipse cx="168" cy="296" rx="98" ry="8" fill="#A68A2D" opacity=".08"/>' +
        '<g transform="translate(-16 10)">' +
        /* cushion */
        '<path d="M98 272C98 262 126 258 160 258C194 258 222 262 222 272C222 282 194 286 160 286C126 286 98 282 98 272Z" fill="#E7C144"/>' +
        '<path d="M102 268C102 262 128 259 160 259C192 259 218 262 218 268C218 274 192 277 160 277C128 277 102 274 102 268Z" fill="#F3D161"/>' +
        /* neck */
        '<path d="M170 88C172 96 172 102 170 108L190 108C187 102 186 96 187 88Z" fill="' + SKD + '"/>' +
        /* torso and its soft shading */
        '<path class="bb-t" fill="' + KU + '"/>' +
        '<g clip-path="url(#' + c + ')"><rect x="140" y="96" width="40" height="150" fill="url(#' + sh + ')"/>' +
        '<ellipse class="bb-gl" cx="196" cy="214" rx="30" ry="28" fill="url(#' + g + ')"/></g>' +
        '<path class="bb-rim" fill="none" stroke="' + KU + '" stroke-width="2.4"/>' +
        '<path d="M188 108Q192 114 192 120" fill="none" stroke="' + KUS + '" stroke-width="1.5" stroke-linecap="round"/>' +
        /* crossed legs, a fold line, the near foot */
        '<path d="M142 236C152 228 192 230 222 234C248 238 262 246 262 258C262 268 252 272 238 272L152 272C140 272 134 264 136 254C136 246 138 240 142 236Z" fill="' + PA + '"/>' +
        '<path d="M158 260C188 256 226 256 250 262" fill="none" stroke="' + PAD + '" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>' +
        '<path d="M244 262C252 260 262 262 264 266C264 270 254 271 246 270Z" fill="' + SK + '"/>' +
        /* near arm: shoulder, soft elbow, hand resting on the knee */
        '<path d="' + limb(178, 120, 170, 202, 10.5, 8) + '" fill="' + KUD + '"/>' +
        '<path d="' + limb(170, 202, 226, 236, 8, 6) + '" fill="' + KUD + '"/>' +
        '<path d="M224 230C232 228 242 230 246 236C246 240 236 242 228 242C222 241 220 233 224 230Z" fill="' + SK + '"/>' +
        /* head in profile: skull, brow, nose, lips, chin */
        '<path d="M164 84C154 74 154 54 168 46C180 39 196 44 200 58C201 62 201 66 203 70L207 77C207.6 78.4 206.6 79.6 204.6 79.6C205 82 204.6 84 203.4 85.4C203.6 87.6 202.4 90.4 199 92C194 94 188 95 184 96C176 96 168 92 164 84Z" fill="' + SK + '"/>' +
        '<path d="M200 58C196 44 180 38 168 44C154 51 150 68 158 82C160 86 163 89 166 90C165 82 167 72 173 66C180 60 190 60 198 62Z" fill="' + HR + '"/>' +
        '<ellipse cx="176" cy="74" rx="4" ry="5.5" fill="' + SKD + '"/>' +
        '<path d="M190 70Q193.5 72.6 197 70.4" fill="none" stroke="' + HR + '" stroke-width="1.5" stroke-linecap="round"/>' +
        /* the breath arcs in front of the belly */
        '<g class="bb-rp" fill="none" stroke="#E7C144" stroke-linecap="round"><path d="M0 -13Q6 0 0 13" stroke-width="2.2"/><path d="M9 -20Q18 0 9 20" stroke-width="1.6" opacity=".55"/></g>' +
        '</g></svg>';
      var q = function (s) { return stage.querySelector(s); };
      return { t: q(".bb-t"), tc: q(".bb-tc"), gl: q(".bb-gl"), rp: q(".bb-rp"), rim: q(".bb-rim") };
    },
    frame: function (s, p) {
      var e = full(p), B = 7 * e;
      /* nape, neck front, chest (still), ribs (still), lower belly (swells), lap, sacrum, back */
      var d = "M170 104L188 104C198 110 207 120 207 136C207 152 202 164 200 176" +
        "C" + f(200 + B * .35) + " 188 " + f(202 + B) + " 198 " + f(202 + B) + " 212" +
        "C" + f(202 + B) + " 226 " + f(199 + B * .5) + " 236 192 242" +
        "L148 244C152 228 153 212 151 196C148 174 146 152 149 132C151 118 158 108 170 104Z";
      s.t.setAttribute("d", d); s.tc.setAttribute("d", d); s.rim.setAttribute("d", d);
      s.gl.setAttribute("opacity", f(.12 + .88 * e));
      s.gl.setAttribute("transform", "translate(" + f(B) + " 0)");
      s.rp.setAttribute("transform", "translate(" + f(215 + B * 1.6) + " 212)");
      s.rp.setAttribute("opacity", f(Math.max(0, (e - .2) / .8)));
    }
  });

})();
