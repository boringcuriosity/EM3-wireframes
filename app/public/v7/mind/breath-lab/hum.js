/* Humming Bee Breath (Bhramari): in 4 s, hum 7 s. The out-breath is sound, so every variant makes the hum
   visible as a slow, low vibration and keeps the in-breath smooth and still. Classes "bh-", SVG ids "bh" + n. */
(function () {
  var L = LAB.L, C = L.C, uid = 0, TAU = Math.PI * 2;
  var ss = function (a, b, x) { x = L.clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  var outQ = function (x) { return 1 - (1 - x) * (1 - x); };
  var css = document.createElement("style");
  css.textContent =
    ".bh-cv,.bh-svg{position:absolute;left:0;top:0;width:320px;height:360px;display:block}" +
    ".bh-orb{position:absolute;left:50%;top:50%;width:200px;height:200px;transform:translate(-50%,-50%) scale(.5);will-change:transform}" +
    ".bh-orb svg{position:relative;display:block;filter:drop-shadow(0 14px 26px rgba(166,138,45,.20))}" +
    ".bh-orb i{position:absolute;inset:-22%;border-radius:50%;background:radial-gradient(circle,rgba(253,232,164,.45) 30%,rgba(255,248,224,.18) 54%,rgba(255,248,224,0) 70%)}";
  document.head.appendChild(css);

  function canvas(stage) {
    var c = document.createElement("canvas"), d = Math.min(2, window.devicePixelRatio || 1);
    c.className = "bh-cv"; c.width = 320 * d; c.height = 360 * d; stage.appendChild(c);
    var x = c.getContext("2d"); x.scale(d, d); return x;
  }
  /* a closed ring whose radius ripples like a cymatic plate: two slow standing modes */
  function ringPts(cx, cy, r, a, ph) {
    var pts = [];
    for (var i = 0; i <= 96; i++) {
      var th = i / 96 * TAU, rr = r + a * (.7 * Math.sin(6 * th + ph) + .3 * Math.sin(9 * th - ph * 1.3));
      pts.push([cx + rr * Math.cos(th), cy + rr * Math.sin(th)]);
    }
    return pts;
  }
  function ringD(cx, cy, r, a, ph) {
    return ringPts(cx, cy, r, a, ph).map(function (q, i) { return (i ? "L" : "M") + q[0].toFixed(1) + "," + q[1].toFixed(1); }).join("") + "Z";
  }
  function rgba(h, a) { var v = L.mix(h, h, 0).slice(4, -1); return "rgba(" + v + "," + a.toFixed(3) + ")"; }

  /* the hum rings, shared by the orb and the figure: born every 0.9 s, slowing as they spread, quiet before the next in-breath */
  function humRings(p, T, r0, r1, each) {
    if (p.k !== "out") return;
    var life = 4.2, end = 1 - ss(p.dur - 1.1, p.dur, p.sec), calm = 1 - .55 * p.t;
    for (var i = 0, b = .15; b < p.dur - 2; i++, b += .9) {
      var age = p.sec - b; if (age < 0 || age > life) continue;
      var x = age / life, r = r0 + (r1 - r0) * outQ(x);
      each(r, (1.6 + 1.3 * (1 - x)) * calm, T * .35 + i * 1.7, Math.pow(1 - x, 1.5) * ss(0, .12, x) * end, x);
    }
  }

  /* ---------- A. Ripples of sound: the gold orb hums rings out, the in-breath gathers them back ---------- */
  LAB.add("hum", {
    id: "hum-ripples", name: "Ripples of sound",
    note: "Breathe in and soft dotted rings flow into the gold orb as it fills. Hum and gentle rippled rings ring out from it, like sound on still water, fading to calm.",
    ref: "Cymatics, Apple Mindfulness, WHOOP breath rings",
    build: function (stage) {
      var ctx = canvas(stage), o = document.createElement("div");
      o.className = "bh-orb"; o.innerHTML = "<i></i>" + LAB.pearl(200); stage.appendChild(o);
      return { ctx: ctx, o: o };
    },
    frame: function (s, p) {
      var x = s.ctx, red = p.reduced, T = red ? 0 : p.time, cx = 160, cy = 180;
      var e = red ? (p.k === "in" ? 1 : .2) : p.e;
      var hum = p.k === "out" ? (red ? 1 : ss(0, .08, p.t) * (1 - ss(.8, 1, p.t))) : 0;
      var sc = .46 + .34 * e, R = 100 * sc * .92;
      x.clearRect(0, 0, 320, 360);
      /* a warm field that brightens with the breath */
      var g = x.createRadialGradient(cx, cy, R * .6, cx, cy, 170);
      g.addColorStop(0, rgba(C.gold300, .30 + .22 * e)); g.addColorStop(1, rgba(C.gold100, 0));
      x.fillStyle = g; x.fillRect(0, 0, 320, 360);
      if (p.k === "in") {
        x.lineCap = "round"; x.setLineDash([.5, 7]);
        if (red) { [[R + 26, .45], [R + 52, .25]].forEach(function (q) { x.beginPath(); x.arc(cx, cy, q[0], 0, TAU); x.strokeStyle = rgba(C.gold600, q[1]); x.lineWidth = 2.6; x.stroke(); }); }
        else for (var b = 0; b < p.dur - 1.4; b += .7) {
          var age = p.sec - b; if (age < 0 || age > 1.6) continue;
          var f = L.ease(age / 1.6), r = L.lerp(160, R + 6, f);
          x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.lineDashOffset = age * 10;
          x.strokeStyle = rgba(C.gold600, .6 * Math.sin(Math.PI * f)); x.lineWidth = 2.6; x.stroke();
        }
        x.setLineDash([]);
      } else {
        var draw = function (r, a, ph, al, k) {
          var pts = ringPts(cx, cy, r, a, ph);
          x.beginPath(); pts.forEach(function (q, i) { i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); }); x.closePath();
          x.fillStyle = rgba(C.gold300, .10 * al); x.fill();
          x.strokeStyle = rgba(C.gold600, .75 * al); x.lineWidth = .8 + 1.4 * (1 - k); x.stroke();
        };
        if (red) [[.12, 1], [.4, .7], [.68, .42]].forEach(function (q) { draw(R + (156 - R) * outQ(q[0]), 3, q[0] * 5, q[1], q[0]); });
        else humRings(p, T, R + 2, 156, draw);
        /* the orb's own skin hums: a halo that swells and settles about once a second */
        var hv = .5 + .5 * Math.sin(T * TAU * .9);
        x.beginPath(); x.arc(cx, cy, R + 6 + 4 * hv * hum, 0, TAU);
        x.strokeStyle = rgba(C.gold400, .35 * hum); x.lineWidth = 6; x.stroke();
      }
      var v = p.k === "out" && !red ? 1 + .012 * hum * Math.sin(T * TAU * .9) : 1;
      s.o.style.transform = "translate(-50%,-50%) scale(" + (sc * v).toFixed(4) + ")";
    }
  });

})();
