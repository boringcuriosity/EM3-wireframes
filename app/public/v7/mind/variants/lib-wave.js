/* The breath as a wave, for the info sheet: rises on the breath in, flat on a hold, falls on the breath out, widths in
   seconds on one 20 s scale, sliding under a fixed playhead at the real pace (from variant h). BLIB.wave(item) returns
   an element; it builds once it is on screen. Reduced motion: still, playhead at the top of the first breath in. */
(function () {
  var Q = new URLSearchParams(location.search), RM = Q.get("rm") === "1" || matchMedia("(prefers-reduced-motion: reduce)").matches;
  var WIN = 20, H = 64, PAD = 8, NS = "http://www.w3.org/2000/svg", uid = 0, live = [], t0 = performance.now();
  var css = document.createElement("style");
  css.textContent = ".blw{width:100%}.blw-w{border-radius:12px;background:linear-gradient(180deg,#FFFDF5,#FFFBEE);overflow:hidden}.blw-w svg{display:block;width:100%;height:" + H + "px}" +
    ".blw-wd{position:relative;height:24px}.blw-wd span{position:absolute;top:4px;transform:translateX(-50%);font:600 12px/16px Roboto,sans-serif;color:#A68A2D;letter-spacing:.4px;white-space:nowrap;font-variant-numeric:tabular-nums}" +
    ".blw-wd span i{font-style:normal;font-weight:400;color:#CDA935;margin-left:4px}";
  document.head.appendChild(css);
  function ease(f) { return (1 - Math.cos(Math.PI * f)) / 2; }
  function at(b, u) {
    var lv = 0, a = 0;
    for (var i = 0; i < b.seq.length; i++) { var s = b.seq[i]; if (u < a + s.s) { var f = (u - a) / s.s; return { lv: s.k === "in" ? ease(f) : s.k === "out" ? 1 - ease(f) : lv, ph: s, left: a + s.s - u }; } lv = s.k === "in" ? 1 : s.k === "out" ? 0 : lv; a += s.s; }
    return { lv: lv, ph: b.seq[b.seq.length - 1], left: 0 };
  }
  function word(s) { return s.k === "hold" ? "hold" : s.k === "in" ? "in" : /hum/i.test(s.word) ? "hum" : "out"; }
  function el(n, a) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); return e; }
  function build(c) {
    var b = c.b, W = Math.round(c.box.getBoundingClientRect().width); if (!W) return;
    var px = W / WIN, P = Math.round(W * 0.32), k = Math.ceil(P / px / b.cycle), n = k + 2 + Math.ceil((W - P) / px / b.cycle), end = n * b.cycle;
    var y = function (lv) { return H - PAD - lv * (H - 2 * PAD); }, d = "";
    for (var u = 0; u <= end + 1e-6; u += 0.1) d += (d ? "L" : "M") + (u * px).toFixed(1) + " " + y(at(b, u % b.cycle).lv).toFixed(1);
    var area = d + "L" + (end * px).toFixed(1) + " " + H + "L0 " + H + "Z", id = "blw" + (++uid);
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, "aria-hidden": "true" }), defs = el("defs", {}), gr = el("linearGradient", { id: id + "g", x1: 0, y1: 0, x2: 0, y2: 1 });
    gr.appendChild(el("stop", { offset: "0", "stop-color": "#F7DE85", "stop-opacity": ".55" })); gr.appendChild(el("stop", { offset: "1", "stop-color": "#FEF1C7", "stop-opacity": "0" }));
    var cp = el("clipPath", { id: id }); cp.appendChild(el("rect", { x: 0, y: 0, width: P, height: H })); defs.appendChild(gr); defs.appendChild(cp); svg.appendChild(defs);
    function layer(stroke) { var g = el("g", {}); g.appendChild(el("path", { d: area, fill: "url(#" + id + "g)" })); g.appendChild(el("path", { d: d, fill: "none", stroke: stroke, "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" })); return g; }
    var fut = layer("#F2DE9A"), past = el("g", { "clip-path": "url(#" + id + ")" }), pm = layer("#CDA935"), ticks = "";
    for (var s = 0; s <= end; s++) ticks += "M" + (s * px).toFixed(1) + " " + (H - 3) + "v3";
    fut.appendChild(el("path", { d: ticks, stroke: "#F2DE9A", "stroke-width": 1 })); past.appendChild(pm); svg.appendChild(fut); svg.appendChild(past);
    svg.appendChild(el("line", { x1: P, y1: 4, x2: P, y2: H, stroke: "#CDA935", "stroke-width": 1, "stroke-dasharray": "2 3" }));
    var dot = el("circle", { cx: P, r: 5, fill: "#CDA935", stroke: "#fff", "stroke-width": 2 }); svg.appendChild(dot);
    c.box.innerHTML = ""; c.box.appendChild(svg); c.wd.style.left = P + "px";
    Object.assign(c, { W: W, px: px, P: P, k: k, y: y, dot: dot, mv: [fut, pm] });
  }
  function frame(c, T) {
    var tm = T % c.b.cycle, x = c.P - c.px * (c.k * c.b.cycle + tm), a = at(c.b, tm), w = word(a.ph), n = Math.max(1, Math.ceil(a.left - 1e-3));
    c.mv.forEach(function (g) { g.setAttribute("transform", "translate(" + x.toFixed(2) + " 0)"); });
    c.dot.setAttribute("cy", c.y(a.lv).toFixed(1));
    var txt = w + (RM ? "" : n); if (txt !== c.last) { c.last = txt; c.wd.innerHTML = w + (RM ? "" : "<i>" + n + "</i>"); }
  }
  (function tick(now) {
    var T = (now - t0) / 1000;
    live = live.filter(function (c) { return !c.gone; });
    live.forEach(function (c) { if (!c.box.isConnected) return; if (!c.W) build(c); if (c.W) frame(c, RM ? c.b.seq[0].s - .01 : T); });
    requestAnimationFrame(tick);
  })(t0);
  BLIB.wave = function (b) {
    var e = document.createElement("div"); e.className = "blw"; e.innerHTML = '<div class="blw-w"></div><div class="blw-wd"><span></span></div>';
    live.push({ b: b, box: e.querySelector(".blw-w"), wd: e.querySelector(".blw-wd span") });
    return e;
  };
})();
