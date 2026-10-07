/* Sprout: a plant that grows fuller as the day's nutrition does.
   Ten leaves stand for the whole day; each one unfurls as the score passes
   its tenth, and the ones still to come wait as faint outlines, so the
   missing share is as visible as the eaten one. SVG, no dependencies. */
(function () {
  window.HEROES = window.HEROES || {};

  var NS = "http://www.w3.org/2000/svg";
  var LEAVES = 10;

  function svg(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  window.HEROES.sprout = function (el, opts) {
    var score = (opts && opts.score) || 0;
    var id = "sp" + Math.random().toString(36).slice(2, 8);
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

    el.innerHTML = "";
    var root = svg("svg", { width: 342, height: 320, viewBox: "0 0 342 320", style: "position:absolute;inset:0;overflow:visible" }, el);

    var defs = svg("defs", {}, root);
    var glow = svg("radialGradient", { id: id + "glow", cx: "50%", cy: "55%", r: "50%" }, defs);
    svg("stop", { offset: "0%", "stop-color": "#E6FAF1", "stop-opacity": "1" }, glow);
    svg("stop", { offset: "55%", "stop-color": "#F3FCF8", "stop-opacity": "0.8" }, glow);
    svg("stop", { offset: "100%", "stop-color": "#FCFCFD", "stop-opacity": "0" }, glow);

    var leafA = svg("linearGradient", { id: id + "la", x1: "0", y1: "0", x2: "1", y2: "0" }, defs);
    svg("stop", { offset: "0%", "stop-color": "#246649" }, leafA);
    svg("stop", { offset: "55%", "stop-color": "#299D6B" }, leafA);
    svg("stop", { offset: "100%", "stop-color": "#79CCA8" }, leafA);
    var leafB = svg("linearGradient", { id: id + "lb", x1: "0", y1: "0", x2: "1", y2: "0" }, defs);
    svg("stop", { offset: "0%", "stop-color": "#2A805A" }, leafB);
    svg("stop", { offset: "60%", "stop-color": "#59B38C" }, leafB);
    svg("stop", { offset: "100%", "stop-color": "#ABE6CC" }, leafB);

    var stemG = svg("linearGradient", { id: id + "st", x1: "0", y1: "1", x2: "0", y2: "0" }, defs);
    svg("stop", { offset: "0%", "stop-color": "#1D4D38" }, stemG);
    svg("stop", { offset: "100%", "stop-color": "#59B38C" }, stemG);

    var stone = svg("radialGradient", { id: id + "stone", cx: "42%", cy: "30%", r: "75%" }, defs);
    svg("stop", { offset: "0%", "stop-color": "#59B38C" }, stone);
    svg("stop", { offset: "45%", "stop-color": "#2A805A" }, stone);
    svg("stop", { offset: "100%", "stop-color": "#1D4D38" }, stone);

    var soft = svg("filter", { id: id + "soft", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs);
    svg("feGaussianBlur", { stdDeviation: "6" }, soft);
    var mote = svg("filter", { id: id + "mote", x: "-100%", y: "-100%", width: "300%", height: "300%" }, defs);
    svg("feGaussianBlur", { stdDeviation: "1.2" }, mote);

    // Plant sits right of centre; the number balances it on the left.
    var BX = 222, BY = 276;

    svg("ellipse", { cx: BX, cy: 176, rx: 138, ry: 150, fill: "url(#" + id + "glow)" }, root);

    // Motes drift behind the plant.
    var motes = [];
    for (var m = 0; m < 6; m++) {
      var c = svg("circle", { r: 1.6 + (m % 3) * 0.8, fill: m % 2 ? "#FFFFFF" : "#ABE6CC", filter: "url(#" + id + "mote)" }, root);
      motes.push({ n: c, x: BX - 80 + ((m * 37) % 160), y: 90 + ((m * 53) % 150), p: m * 1.3, d: 7 + (m % 3) });
    }

    // Base: a smooth river stone of dark earth, with a shadow under it.
    svg("ellipse", { cx: BX, cy: BY + 16, rx: 62, ry: 7, fill: "#1D4D38", opacity: "0.16", filter: "url(#" + id + "soft)" }, root);
    svg("path", { d: "M" + (BX - 64) + " " + (BY + 8) + " C" + (BX - 60) + " " + (BY - 18) + " " + (BX + 60) + " " + (BY - 18) + " " + (BX + 64) + " " + (BY + 8) + " C" + (BX + 50) + " " + (BY + 20) + " " + (BX - 50) + " " + (BY + 20) + " " + (BX - 64) + " " + (BY + 8) + " Z", fill: "url(#" + id + "stone)" }, root);
    svg("path", { d: "M" + (BX - 38) + " " + (BY - 6) + " C" + (BX - 20) + " " + (BY - 13) + " " + (BX + 8) + " " + (BY - 13) + " " + (BX + 22) + " " + (BY - 9), stroke: "#ABE6CC", "stroke-width": "2", "stroke-linecap": "round", fill: "none", opacity: "0.45" }, root);

    var plant = svg("g", {}, root);
    var stemD = "M" + BX + " " + (BY - 8) + " C" + (BX - 8) + " 212 " + (BX + 12) + " 160 " + (BX - 2) + " 108 S" + (BX + 4) + " 56 " + BX + " 34";
    svg("path", { d: stemD, stroke: "#E4E7EC", "stroke-width": "3", "stroke-linecap": "round", fill: "none" }, plant);
    var stem = svg("path", { d: stemD, stroke: "url(#" + id + "st)", "stroke-width": "4", "stroke-linecap": "round", fill: "none" }, plant);
    var L = stem.getTotalLength();
    stem.setAttribute("stroke-dasharray", L + " " + L);

    var LEAF = "M0 0 C10 -12 34 -15 50 -2 C35 9 12 9 0 0 Z";
    var leaves = [];
    for (var i = 0; i < LEAVES; i++) {
      var t = 0.12 + i * 0.086;
      var pt = stem.getPointAtLength(L * t);
      var right = i % 2 === 0;
      var ang = right ? -24 - i * 2.5 : -156 + i * 2.5;
      var size = 1.22 - i * 0.055;
      var anchor = svg("g", { transform: "translate(" + pt.x.toFixed(1) + " " + pt.y.toFixed(1) + ") rotate(" + ang + ")" }, plant);
      // Ghost of the leaf still to come.
      svg("path", { d: LEAF, transform: "scale(" + size + ")", fill: "#F2F4F7", stroke: "#E4E7EC", "stroke-width": 1.2 / size, "stroke-dasharray": (3 / size) + " " + (3 / size) }, anchor);
      var live = svg("g", { opacity: "0" }, anchor);
      svg("path", { d: LEAF, fill: "url(#" + id + (right ? "lb" : "la") + ")" }, live);
      svg("path", { d: "M0 0 C12 3 32 3 50 -2 C35 9 12 9 0 0 Z", fill: "#1D4D38", opacity: "0.2" }, live);
      svg("path", { d: "M3 0 C16 -3 30 -3 44 -2", stroke: "#CBF0E0", "stroke-width": "1", fill: "none", opacity: "0.55", "stroke-linecap": "round" }, live);
      leaves.push({ g: live, size: size, thr: (i + 1) * (100 / LEAVES), phase: i * 0.7 });
    }
    // Bud at the crown, the day complete.
    var budPt = stem.getPointAtLength(L);
    var budG = svg("g", { transform: "translate(" + budPt.x.toFixed(1) + " " + budPt.y.toFixed(1) + ")" }, plant);
    svg("path", { d: "M0 2 C-7 -4 -5 -14 0 -18 C5 -14 7 -4 0 2 Z", fill: "#F2F4F7", stroke: "#E4E7EC", "stroke-width": "1.2", "stroke-dasharray": "3 3" }, budG);
    var bud = svg("path", { d: "M0 2 C-7 -4 -5 -14 0 -18 C5 -14 7 -4 0 2 Z", fill: "url(#" + id + "la)", opacity: "0" }, budG);

    // Number.
    var label = document.createElement("div");
    label.style.cssText = "position:absolute;left:30px;top:108px;display:flex;flex-direction:column;gap:6px;pointer-events:none";
    label.innerHTML =
      '<div style="display:flex;align-items:flex-start;color:#1D4D38;line-height:1">' +
      '<span data-n style="font-family:\'Playfair Display\',Georgia,serif;font-weight:600;font-size:72px;letter-spacing:-1px;font-variant-numeric:lining-nums">0</span>' +
      '<span style="font-family:Roboto,Arial,sans-serif;font-weight:500;font-size:22px;margin:8px 0 0 3px;color:#2A805A">%</span></div>' +
      '<span style="font-family:Roboto,Arial,sans-serif;font-weight:600;font-size:11px;letter-spacing:2.6px;color:#667085;padding-left:3px">SUFFICIENT</span>' +
      '<span data-c style="font-family:Roboto,Arial,sans-serif;font-size:12px;color:#98A2B3;padding-left:3px;margin-top:2px">0 of 10 leaves</span>';
    el.appendChild(label);
    var numEl = label.querySelector("[data-n]");
    var countEl = label.querySelector("[data-c]");

    function draw(p, time) {
      numEl.textContent = Math.round(p);
      var full = Math.floor(p / (100 / LEAVES) + 1e-6);
      countEl.textContent = full + " of " + LEAVES + " leaves";
      stem.setAttribute("stroke-dashoffset", (L * (1 - clamp(0.06 + p / 100 * 0.94, 0, 1))).toFixed(1));
      for (var i = 0; i < leaves.length; i++) {
        var lf = leaves[i];
        var g = easeOut(clamp((p - (lf.thr - 10)) / 10, 0, 1));
        var flutter = Math.sin(time / 1000 * (2 * Math.PI / 6.5) + lf.phase) * 3 * g;
        lf.g.setAttribute("opacity", g > 0 ? Math.min(1, g * 1.6).toFixed(3) : "0");
        lf.g.setAttribute("transform", "rotate(" + flutter.toFixed(2) + ") scale(" + (lf.size * (0.35 + 0.65 * g)).toFixed(3) + ")");
      }
      bud.setAttribute("opacity", p >= 100 ? "1" : "0");
      var sway = Math.sin(time / 1000 * (2 * Math.PI / 7.5)) * 1.4;
      plant.setAttribute("transform", "rotate(" + sway.toFixed(2) + " " + BX + " " + BY + ")");
      for (var k = 0; k < motes.length; k++) {
        var mo = motes[k];
        var ph = ((time / 1000 + mo.p) % mo.d) / mo.d;
        mo.n.setAttribute("cx", (mo.x + Math.sin(ph * Math.PI * 2) * 6).toFixed(1));
        mo.n.setAttribute("cy", (mo.y - ph * 40).toFixed(1));
        mo.n.setAttribute("opacity", (Math.sin(ph * Math.PI) * 0.8).toFixed(2));
      }
    }

    var raf = 0;
    if (reduce) {
      draw(score, 0);
    } else {
      var start = performance.now();
      var loop = function (now) {
        var e = easeOut(clamp((now - start) / 1200, 0, 1));
        draw(score * e, now - start);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return {
      dispose: function () {
        cancelAnimationFrame(raf);
        el.innerHTML = "";
      },
    };
  };
})();
