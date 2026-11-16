/* j. Clock-ring cards: each card's art is a small, neutral breath clock drawn from the exercise's own timings.
   The ring is cut into in (ink), hold (dotted) and out (light) arcs in proportion to their seconds, and a bead walks it
   at the real pace (Box walks a square). Greys and ink with one soft indigo accent, so it never reads as the gold Rhythm score.
   The card opens the info sheet; Start opens the player. ?rm=1 rests every bead at the start. */
BLIB.add("j", { render: function (host, B) {
  var css = document.createElement("style");
  css.textContent =
    ".blj-w{display:flex;flex-direction:column;gap:16px;text-align:left}" +
    ".blj-hd{display:flex;flex-direction:column;gap:4px}.blj-hd h2{margin:0;font:400 14px/16.8px Roboto,sans-serif;letter-spacing:.25px;color:#101828}" +
    ".blj-hd p{margin:0;font:400 12px/16px Roboto,sans-serif;color:#667085}" +
    ".blj-key{display:flex;gap:16px;flex-wrap:wrap;font:400 12px/16px Roboto,sans-serif;color:#475467}.blj-key span{display:inline-flex;align-items:center;gap:6px}.blj-key svg{width:20px;height:6px}" +
    ".blj-g{display:grid;grid-template-columns:1fr 1fr;gap:12px}" +
    ".blj-c{position:relative;display:flex;flex-direction:column;background:#fff;border:1px solid #E4E7EC;border-radius:16px;box-shadow:2px 2px 0 #E4E7EC;cursor:pointer;overflow:hidden}" +
    ".blj-c:focus-visible{outline:2px solid #299D6B;outline-offset:2px}" +
    ".blj-art{display:grid;place-items:center;padding:20px 0 12px;background:linear-gradient(180deg,#F9FAFB 0%,#fff 100%)}" +
    ".blj-art svg{display:block;width:96px;height:96px;overflow:visible}" +
    ".blj-tx{flex:1;display:flex;flex-direction:column;gap:4px;padding:0 12px 12px}" +
    ".blj-tx b{font:600 14px/20px Roboto,sans-serif;letter-spacing:.25px;color:#101828}.blj-tx span{font:400 12px/16px Roboto,sans-serif;color:#667085}" +
    ".blj-i{position:absolute;top:0;right:0;width:44px;height:44px;border:0;background:none;display:grid;place-items:center;cursor:pointer;color:#667085}" +
    ".blj-i svg{width:18px;height:18px}" +
    ".blj-tag{align-self:flex-start;margin-top:4px;font-style:normal;display:inline-flex;align-items:center;height:20px;padding:0 6px;border-radius:6px;font:500 11px/1 Roboto,sans-serif;color:#039855;" +
      "background:linear-gradient(90deg,#D1FADF 0%,#ECFDF3 19%,#ECFDF3 84%,#D1FADF 100%);box-shadow:inset 0 0 0 1px #A6F4C5}" +
    ".blj-go{display:flex;align-items:center;justify-content:center;gap:6px;height:44px;border:0;border-top:1px solid #F2F4F7;background:none;cursor:pointer;" +
      "font:600 14px/1 Roboto,sans-serif;letter-spacing:.25px;color:#299D6B}.blj-go svg{width:14px;height:14px}.blj-go em{font-style:normal;font-weight:400;color:#667085}" +
    ".blj-go:focus-visible,.blj-i:focus-visible{outline:2px solid #299D6B;outline-offset:-4px;border-radius:8px}" +
    /* the odd seventh card runs the full width, ring beside the words */
    ".blj-c.wide{grid-column:1/-1;flex-direction:row;flex-wrap:wrap}.blj-c.wide .blj-art{padding:16px 12px 16px 16px;background:linear-gradient(90deg,#F9FAFB 0%,#fff 100%)}" +
    ".blj-c.wide .blj-tx{justify-content:center;padding:16px 44px 16px 4px}.blj-c.wide .blj-go{flex:0 0 100%}" +
    ".blj-ct{font:600 18px/1 Roboto,sans-serif;fill:#101828;font-variant-numeric:tabular-nums}.blj-cw{font:500 9px/1 Roboto,sans-serif;fill:#667085;letter-spacing:.4px}";
  document.head.appendChild(css);

  var NS = "http://www.w3.org/2000/svg", R = 40, C = 50, GAP = 6, SW = 4;
  var INK = "#344054", LIGHT = "#C3CAD5", DOT = "#98A2B3", ACC = "#6172F3";
  function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function pt(deg) { var r = (deg - 90) * Math.PI / 180; return [C + R * Math.cos(r), C + R * Math.sin(r)]; }
  function arc(a0, a1) { var p = pt(a0), q = pt(a1); return "M" + p[0].toFixed(2) + " " + p[1].toFixed(2) + "A" + R + " " + R + " 0 " + (a1 - a0 > 180 ? 1 : 0) + " 1 " + q[0].toFixed(2) + " " + q[1].toFixed(2); }
  function style(k) { return k === "in" ? { stroke: INK, "stroke-width": SW, "stroke-linecap": "round" }
    : k === "hold" ? { stroke: DOT, "stroke-width": SW - .5, "stroke-linecap": "round", "stroke-dasharray": "0 7" }
    : { stroke: LIGHT, "stroke-width": SW, "stroke-linecap": "round" }; }
  var S = 33, SQ = [[C - S, C - S], [C + S, C - S], [C + S, C + S], [C - S, C + S]];   /* Box: a square, one side per step, starting top left */

  /* draws one clock and returns { seg: [{t0, t1, from, to}], bead, ct, cw } */
  function clock(b) {
    var svg = el("svg", { viewBox: "0 0 100 100", "aria-hidden": "true" }), sq = b.key === "box", t = 0, segs = [];
    var g = el("g", { fill: "none" }, svg);
    if (!sq) el("circle", { cx: C, cy: C, r: R, stroke: "#F2F4F7", "stroke-width": SW + 6, fill: "none" }, g);
    else el("rect", { x: C - S, y: C - S, width: 2 * S, height: 2 * S, rx: 3, stroke: "#F2F4F7", "stroke-width": SW + 6, fill: "none" }, g);
    b.seq.forEach(function (x, i) {
      var sg = { k: x.k, word: x.k === "in" ? "IN" : x.k === "hold" ? "HOLD" : /hum/i.test(x.word) ? "HUM" : "OUT", t0: t, t1: t + x.s };
      if (sq) {
        var p = SQ[i], q = SQ[(i + 1) % 4], d = [q[0] - p[0], q[1] - p[1]], L = 2 * S, o = GAP * .7 / L;
        sg.from = [p[0] + d[0] * o, p[1] + d[1] * o]; sg.to = [q[0] - d[0] * o, q[1] - d[1] * o];
        el("path", Object.assign({ d: "M" + sg.from.join(" ") + "L" + sg.to.join(" ") }, style(x.k)), g);
        sg.trace = el("path", Object.assign(style(x.k), { d: "", stroke: ACC, opacity: .55 }), g);
      } else {
        sg.a0 = t / b.cycle * 360 + GAP / 2; sg.a1 = (t + x.s) / b.cycle * 360 - GAP / 2;
        el("path", Object.assign({ d: arc(sg.a0, sg.a1) }, style(x.k)), g);
        sg.trace = el("path", Object.assign(style(x.k), { d: "", stroke: ACC, opacity: .55 }), g);
      }
      t += x.s; segs.push(sg);
    });
    var bead = el("g", {}, svg);
    el("circle", { r: 7, fill: ACC, opacity: .14 }, bead);
    el("circle", { r: 4.2, fill: "#fff", stroke: ACC, "stroke-width": 2.4 }, bead);
    var ct = el("text", { x: C, y: C + 3, "text-anchor": "middle", class: "blj-ct" }, svg);
    var cw = el("text", { x: C, y: C + 16, "text-anchor": "middle", class: "blj-cw" }, svg);
    return { svg: svg, segs: segs, bead: bead, ct: ct, cw: cw, b: b, sq: sq, last: -1 };
  }
  function frame(c, T) {
    var tt = T % c.b.cycle, s = c.segs.filter(function (x) { return tt >= x.t0 && tt < x.t1; })[0] || c.segs[0];
    var f = (tt - s.t0) / (s.t1 - s.t0), P;
    if (c.sq) {
      P = [s.from[0] + (s.to[0] - s.from[0]) * f, s.from[1] + (s.to[1] - s.from[1]) * f];
      s.trace.setAttribute("d", "M" + s.from.join(" ") + "L" + P.join(" "));
    } else {
      var a = s.a0 + (s.a1 - s.a0) * f; P = pt(a);
      s.trace.setAttribute("d", f > .01 ? arc(s.a0, a) : "");
    }
    if (c.last !== s) { c.segs.forEach(function (x) { if (x !== s) x.trace.setAttribute("d", ""); }); c.last = s; c.cw.textContent = s.word; }
    c.bead.setAttribute("transform", "translate(" + P[0].toFixed(2) + " " + P[1].toFixed(2) + ")");
    c.ct.textContent = Math.max(1, Math.ceil(s.t1 - s.t0 - (tt - s.t0) - 1e-6));
  }

  var INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z"/></svg>';
  var intro = B.state === "plan" ? "Do any of these, any time. The ones in your plan count towards Rhythm."
    : B.state === "noplan" ? "Do any of these, any time, while your coach sets up your plan."
    : "Free to use, any time. Pick one and breathe along.";
  function key(k) { var s = style(k); return '<svg viewBox="0 0 20 6"><path d="M3 3H17" fill="none" stroke="' + s.stroke + '" stroke-width="' + s["stroke-width"] + '" stroke-linecap="round"' + (s["stroke-dasharray"] ? ' stroke-dasharray="' + s["stroke-dasharray"] + '"' : '') + '/></svg>'; }

  host.className = "gut sect";
  host.innerHTML = '<div class="blj-w"><div class="blj-hd"><h2>All breathing exercises</h2><p>' + intro + '</p></div>' +
    '<div class="blj-key" aria-label="How to read the clocks"><span>' + key("in") + 'Breathe in</span><span>' + key("hold") + 'Hold</span><span>' + key("out") + 'Breathe out</span></div>' +
    '<div class="blj-g">' + B.list.map(function (b, i) {
      return '<div class="blj-c' + (i === B.list.length - 1 && B.list.length % 2 ? ' wide' : '') + '" role="button" tabindex="0" data-blinfo="' + b.key + '" aria-label="' + b.name + ', ' + b.pat + '">' +
        '<div class="blj-art" data-k="' + b.key + '"></div><div class="blj-tx"><b>' + b.name.replace(/\s*\(4-4-4-4\)/, "") + '</b><span>' + b.pat + '</span>' +
        (B.state === "plan" && b.inPlan ? '<i class="blj-tag">In your plan</i>' : '') + '</div>' +
        '<button class="blj-i" data-blinfo="' + b.key + '" aria-label="About ' + b.name + '">' + INFO + '</button>' +
        '<button class="blj-go" data-blplay="' + b.key + '">' + PLAY + 'Start <em>· ' + b.min + ' min</em></button></div>';
    }).join("") + '</div></div>';

  var clocks = [];
  host.querySelectorAll(".blj-art").forEach(function (a) { var c = clock(B.get(a.dataset.k)); a.appendChild(c.svg); clocks.push(c); });
  var U = new URLSearchParams(location.search), RM = U.get("rm") === "1" || matchMedia("(prefers-reduced-motion: reduce)").matches, t0 = performance.now();
  if (RM || U.get("jt")) clocks.forEach(function (c) { frame(c, +U.get("jt") || 0); });   /* ?jt=<seconds> holds every clock at that moment, for screenshots */
  else (function tick(now) { if (!host.isConnected) return; var T = (now - t0) / 1000; clocks.forEach(function (c) { frame(c, T); }); requestAnimationFrame(tick); })(t0);
  host.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".blj-c")) { e.preventDefault(); e.target.click(); } });
} });
