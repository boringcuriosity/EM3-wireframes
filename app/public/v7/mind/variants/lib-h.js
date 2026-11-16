/* All breathing exercises, variant h: "Breath waveform". Each card draws its breath as a smooth wave: it rises on the
   breath in, runs flat on a hold and falls on the breath out, with widths in proportion to the seconds.
   Every card shares one time scale (20 seconds across the card), so Pursed Lip reads as quick short peaks and 4-7-8
   as one long plateau and tail. The wave slides under a fixed playhead at the real pace; the word under the playhead
   says what to do now. Reduced motion (?rm=1): the wave rests with the playhead at the top of the first breath in. */
(function () {
  var Q = new URLSearchParams(location.search);
  var RM = Q.get("rm") === "1" || matchMedia("(prefers-reduced-motion: reduce)").matches;
  var WIN = 20, H = 64, PAD = 8, NS = "http://www.w3.org/2000/svg";
  var INFO = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
  var INTRO = {
    plan: "Each wave is one breath at its real pace: up as you breathe in, flat while you hold, down as you breathe out.",
    noplan: "Try any of them while your coach sets up your plan. Up as you breathe in, flat while you hold, down as you breathe out.",
    free: "Each wave is one breath at its real pace: up as you breathe in, flat while you hold, down as you breathe out."
  };
  var css = document.createElement("style");
  css.textContent =
    ".blh-in{font:400 14px/20px Roboto,sans-serif;color:#667085;margin:-8px 0 16px}" +
    ".blh-l{display:flex;flex-direction:column;gap:12px}" +
    ".blh-c{position:relative;border-radius:20px;border:1px solid #EAECF0;background:#fff;box-shadow:2px 2px 0 #E4E7EC;padding:16px 16px 4px;display:flex;flex-direction:column;gap:12px;cursor:pointer;" +
      "transition:transform .2s cubic-bezier(.4,0,.2,1),box-shadow .2s cubic-bezier(.4,0,.2,1);-webkit-tap-highlight-color:transparent}" +
    ".blh-c:active{transform:translate(1px,1px);box-shadow:1px 1px 0 #E4E7EC}" +
    ".blh-hd{display:flex;align-items:flex-start;gap:8px;padding-right:36px}" +
    ".blh-n{font:600 16px/22px Roboto,sans-serif;color:#101828}" +
    ".blh-p{font:400 12px/16px Roboto,sans-serif;color:#667085;margin-top:4px}" +
    ".blh-i{position:absolute;right:4px;top:4px;width:44px;height:44px;border:0;background:none;display:grid;place-items:center;color:#475467;cursor:pointer;border-radius:50%}" +
    /* the wave sits in a soft gold field; the part already breathed is deeper gold */
    ".blh-w{position:relative;border-radius:12px;background:linear-gradient(180deg,#FFFDF5,#FFFBEE);overflow:hidden}" +
    ".blh-w svg{display:block;width:100%;height:" + H + "px}" +
    ".blh-wd{height:44px;position:relative;margin-top:-4px;display:flex;align-items:center;justify-content:flex-end}" +
    ".blh-wd span{position:absolute;top:8px;transform:translateX(-50%);font:600 12px/16px Roboto,sans-serif;color:#A68A2D;letter-spacing:.4px;white-space:nowrap;font-variant-numeric:tabular-nums}" +
    ".blh-wd span i{font-style:normal;font-weight:400;color:#CDA935;margin-left:4px}" +
    ".blh-tag{display:inline-block;margin-left:6px;font:500 11px/16px Roboto,sans-serif;color:#2A805A;background:#E6FAF1;border:1px solid #CBF0E0;border-radius:8px;padding:1px 6px}" +
    ".blh-go{height:44px;display:inline-flex;align-items:center;border:0;background:none;padding:0;cursor:pointer}" +
    ".blh-go b{height:32px;display:inline-flex;align-items:center;gap:6px;padding:0 14px 0 12px;border-radius:999px;border:1px solid #A6E9C9;background:#F3FCF8;color:#2A805A;font:600 13px Roboto,sans-serif}";
  document.head.appendChild(css);

  function nm(b) { return b.name.replace(/\s*\([0-9][0-9:-]*\)$/, ""); }
  function ease(f) { return (1 - Math.cos(Math.PI * f)) / 2; }
  /* where the breath is at u seconds into the cycle: level 0 (empty) to 1 (full), and the phase */
  function at(b, u) {
    var lv = 0, a = 0;
    for (var i = 0; i < b.seq.length; i++) {
      var s = b.seq[i];
      if (u < a + s.s) {
        var f = (u - a) / s.s;
        return { lv: s.k === "in" ? ease(f) : s.k === "out" ? 1 - ease(f) : lv, ph: s, left: a + s.s - u };
      }
      lv = s.k === "in" ? 1 : s.k === "out" ? 0 : lv; a += s.s;
    }
    return { lv: lv, ph: b.seq[b.seq.length - 1], left: 0 };
  }
  function word(s) { return s.k === "hold" ? "hold" : s.k === "in" ? "in" : /hum/i.test(s.word) ? "hum" : "out"; }
  function el(n, a) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); return e; }

  var cards = [], t0 = performance.now(), uid = 0;
  function build(c) {
    var b = c.b, W = Math.round(c.box.getBoundingClientRect().width) || 326, px = W / WIN, P = Math.round(W * 0.32);
    var k = Math.ceil(P / px / b.cycle), n = k + 2 + Math.ceil((W - P) / px / b.cycle), end = n * b.cycle;
    var y = function (lv) { return H - PAD - lv * (H - 2 * PAD); }, d = "";
    for (var u = 0; u <= end + 1e-6; u += 0.1) { var x = (u * px).toFixed(1); d += (d ? "L" : "M") + x + " " + y(at(b, u % b.cycle).lv).toFixed(1); }
    var area = d + "L" + (end * px).toFixed(1) + " " + H + "L0 " + H + "Z", id = "blhc" + (++uid);
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, "aria-hidden": "true" });
    var defs = el("defs", {}), gr = el("linearGradient", { id: id + "g", x1: 0, y1: 0, x2: 0, y2: 1 });
    gr.appendChild(el("stop", { offset: "0", "stop-color": "#F7DE85", "stop-opacity": ".55" }));
    gr.appendChild(el("stop", { offset: "1", "stop-color": "#FEF1C7", "stop-opacity": "0" }));
    var cp = el("clipPath", { id: id }); cp.appendChild(el("rect", { x: 0, y: 0, width: P, height: H }));
    defs.appendChild(gr); defs.appendChild(cp); svg.appendChild(defs);
    function layer(stroke, fill) {
      var g = el("g", {}); g.appendChild(el("path", { d: area, fill: fill })); g.appendChild(el("path", { d: d, fill: "none", stroke: stroke, "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }));
      return g;
    }
    var fut = layer("#F2DE9A", "url(#" + id + "g)"), past = el("g", { "clip-path": "url(#" + id + ")" }), pm = layer("#CDA935", "url(#" + id + "g)");
    /* faint one-second ticks on the floor, so the pace reads even on a hold */
    var ticks = ""; for (var s = 0; s <= end; s++) ticks += "M" + (s * px).toFixed(1) + " " + (H - 3) + "v3";
    fut.appendChild(el("path", { d: ticks, stroke: "#F2DE9A", "stroke-width": 1 }));
    past.appendChild(pm); svg.appendChild(fut); svg.appendChild(past);
    svg.appendChild(el("line", { x1: P, y1: 4, x2: P, y2: H, stroke: "#CDA935", "stroke-width": 1, "stroke-dasharray": "2 3" }));
    var dot = el("circle", { cx: P, r: 5, fill: "#CDA935", stroke: "#fff", "stroke-width": 2 }); svg.appendChild(dot);
    c.box.innerHTML = ""; c.box.appendChild(svg);
    c.wd.style.left = P + "px";
    Object.assign(c, { W: W, px: px, P: P, k: k, y: y, dot: dot, mv: [fut, pm] });
  }
  function frame(c, T) {
    var tm = T % c.b.cycle, x = c.P - c.px * (c.k * c.b.cycle + tm), a = at(c.b, tm), w = word(a.ph);
    c.mv.forEach(function (g) { g.setAttribute("transform", "translate(" + x.toFixed(2) + " 0)"); });
    c.dot.setAttribute("cy", c.y(a.lv).toFixed(1));
    var txt = w + (RM ? "" : "|" + Math.max(1, Math.ceil(a.left - 1e-3)));
    if (txt !== c.last) { c.last = txt; c.wd.innerHTML = w + (RM ? "" : "<i>" + Math.max(1, Math.ceil(a.left - 1e-3)) + "</i>"); }
  }
  (function tick(now) {
    var T = (now - t0) / 1000;
    cards.forEach(function (c) {
      if (!c.box.isConnected) return;
      if (!c.W) build(c);
      frame(c, RM ? c.b.seq[0].s - 0.01 : T);
    });
    requestAnimationFrame(tick);
  })(t0);

  BLIB.add("h", {
    render: function (host, B) {
      host.className = "gut";
      var plan = B.state === "plan";
      cards = [];
      host.innerHTML = '<div class="sec"><h2>All breathing exercises</h2><span>7 to try</span></div><p class="blh-in">' + INTRO[B.state] + '</p><div class="blh-l"></div>';
      var L = host.querySelector(".blh-l");
      B.list.forEach(function (b) {
        var c = document.createElement("div");
        c.className = "blh-c"; c.setAttribute("data-blinfo", b.key); c.setAttribute("role", "button"); c.tabIndex = 0;
        c.setAttribute("aria-label", b.name + ", " + b.pat + ", " + b.min + " minutes. Tap for how it works");
        c.innerHTML = '<div class="blh-hd"><div><div class="blh-n">' + nm(b) + '</div><div class="blh-p">' + b.pat + ' · ' + b.min + ' min' + (plan && b.inPlan ? '<span class="blh-tag">In your plan</span>' : '') + '</div></div></div>' +
          '<button class="blh-i" data-blinfo="' + b.key + '" aria-label="How ' + b.name + ' works">' + INFO + '</button>' +
          '<div><div class="blh-w"></div><div class="blh-wd"><span></span>' +
          '<button class="blh-go" data-blplay="' + b.key + '" aria-label="Start ' + b.name + '"><b>' + PLAY + 'Start</b></button></div>';
        L.appendChild(c);
        cards.push({ b: b, box: c.querySelector(".blh-w"), wd: c.querySelector(".blh-wd span") });
      });
    }
  });
})();
