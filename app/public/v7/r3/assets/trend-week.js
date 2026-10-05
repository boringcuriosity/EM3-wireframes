/* ============================================================
   Trend: the week, as built and signed off in trend-options.

   GFTrendWeek.render(host, m)   m = {
     mode: "filling" | "week",
     days: [7 scores or null], today (index, filling only),
     filled (days in, filling), score, tag ("solid"|"grow"|"attention"),
     macros: [{ k, lab, had, goal, unit }],
     insight: { head, p1, well[], gap, steps[] },
     kaira: "locked" | "ready" | "revealed", folded,
     onUnlock()                  called once the gift has opened
   }

   Order on the page: KAIRA's card, Your week so far, Your macros this week.
   The gift box is the Metabolic Kickstarter's (mk-dynamic,
   Metabolic-kickstarter/src/assets/Gift_animation.json).
   ============================================================ */
(function () {
  var BASE = (document.currentScript && document.currentScript.src || "").replace(/[^/]*$/, "");
  var REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EASE = "cubic-bezier(.4,0,.2,1)", INOUT = "cubic-bezier(.65,0,.35,1)", OUT = "cubic-bezier(.2,0,0,1)";
  var DK = ["M", "T", "W", "T", "F", "S", "S"];
  var TAG = { solid: "Solid Week", grow: "Room To Grow", attention: "Needs Attention" };

  var UNLOCK = '<svg class="ico" viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 7.75-1.4"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg>';
  var BUL = '<img src="' + BASE + 'trend-bullet.svg" width="16" height="16" alt="">';
  function mark(px) { return window.GFKaira ? GFKaira.mark(px, { halo: false }) : ""; }

  /* ---------------------------------------------------------- KAIRA */
  function kLocked(m) {
    var seg = DK.map(function (d, i) { return '<span class="' + (i < m.filled ? "on" : "") + '"></span>'; }).join("");
    var left = 7 - m.filled;
    return '<div class="kc"><div class="kin">' +
      '<div class="krow"><span class="kmk">' + mark(30) + '</span><div>' +
        '<div class="kt">Your insight unlocks in ' + left + (left === 1 ? " day" : " days") + '</div>' +
        '<div class="ks">Keep logging your food consistently to get your personalised insight.</div></div></div>' +
      '<div class="prog" aria-hidden="true">' + seg + '</div>' +
      '<div class="plab"><b>' + m.filled + ' of 7 days</b> are in.</div></div></div>';
  }
  function revHead() { return '<div class="krow"><span class="kmk">' + mark(28) + '</span><div class="keb">KAIRA\'s analysis</div></div>'; }
  function revBody(ins, folded) {
    return '<div class="kh">' + ins.head + '</div><p class="kp">' + ins.p1 + '</p>' +
      '<div class="kmore"><div>' +
        '<div class="ksec">What went well</div>' +
        '<ul class="kl">' + ins.well.map(function (t) { return '<li><i>' + BUL + '</i><span>' + t + '</span></li>'; }).join("") + '</ul>' +
        '<div class="ksec">The one gap, and how to close it</div>' +
        '<p class="kp">' + ins.gap + '</p>' +
        '<ul class="kl next">' + ins.steps.map(function (t) { return '<li><i>' + BUL + '</i><span>' + t + '</span></li>'; }).join("") + '</ul>' +
      '</div></div>' +
      '<button class="kfold" type="button" aria-expanded="' + !folded + '"><span>' + (folded ? "Read the full insight" : "Show less") + '</span>' + CHEV + '</button>';
  }
  function kReady(m) {
    return '<div class="kc ready"><div class="kgift"><div class="gbox"></div></div>' +
      '<div class="kin in-ready"><div class="krow"><span class="kmk">' + mark(36) + '</span><div>' +
        '<div class="kt">Your insight is ready</div>' +
        '<div class="ks">Your personalised insight, made from this week\'s food logs.</div></div></div>' +
        '<button class="unlock" type="button">' + UNLOCK + 'Unlock my insight</button></div>' +
      '<div class="kin in-rev" style="display:none">' + revHead() + revBody(m.insight) + '</div></div>';
  }
  function kRevealed(m) {
    return '<div class="kc' + (m.folded ? " folded" : "") + '"><div class="kin">' + revHead() + revBody(m.insight, m.folded) + '</div></div>';
  }

  /* --------------------------------------------- Your week so far */
  function gauge(s) {
    var n = s === null ? 0 : Math.round(s / 100 * 30), dots = "";
    for (var i = 0; i < 30; i++) {
      var a = 1.25 * Math.PI - i / 29 * 1.5 * Math.PI, odd = i % 2;
      var r = odd ? 19 : 15.6, rr = odd ? 1.25 : 1.85;
      dots += '<circle cx="' + (22 + Math.cos(a) * r).toFixed(2) + '" cy="' + (22 - Math.sin(a) * r).toFixed(2) + '" r="' + rr +
        '" fill="' + (i < n ? "#12B76A" : "#D3D9E2") + '"/>';
    }
    return '<svg width="64" height="58" viewBox="0 0 44 40" aria-hidden="true">' + dots +
      '<text x="22" y="26.5" text-anchor="middle" font-family="Roboto, sans-serif" font-size="13" font-weight="600" fill="' +
      (s === null ? "#98A2B3" : "#101828") + '">' + (s === null ? "&ndash;" : s) + '</text></svg>';
  }
  function weekCard(m) {
    /* a week in progress shows the average of the days logged so far, with its
       verdict; only KAIRA's insight waits for the week to close */
    var score = m.score, tag = m.tag;
    if (m.mode === "filling") {
      var got = m.days.slice(0, m.filled).filter(function (s) { return s !== null; });
      score = got.length ? Math.round(got.reduce(function (a, b) { return a + b; }, 0) / got.length) : null;
      tag = score === null ? null : score >= 70 ? "solid" : score >= 50 ? "grow" : "attention";
    }
    var head = score === null
      ? '<div class="cn wait"><b>&ndash;</b><span class="stag" data-s="none">Log your meals to unlock score</span></div>'
      : '<div class="cn"><b>' + score + '<i>%</i></b><span class="stag" data-s="' + tag + '">' + TAG[tag] + '</span></div>';
    var cols = m.days.map(function (s, i) {
      var fut = m.mode === "filling" && i >= m.filled;
      var v = fut ? null : s;
      var cls = "c" + (fut ? " fut" : v === null ? " none" : "") + (m.mode === "filling" && i === m.filled - 1 ? " sel" : "");
      return '<div class="' + cls + '"><span class="gz">' + gauge(v) + '</span><span class="dk">' + DK[i] + '</span></div>';
    }).join("");
    return '<div class="cc"><div class="ch"><div class="l">Your week so far</div>' + head + '</div><div class="az">' + cols + '</div></div>';
  }

  /* ---------------------------------------- Your macros this week */
  function macros(m) {
    var HALF = Math.PI * 88;
    return '<div><div class="mh2">Your macros this week</div><div class="trail">' + m.macros.map(function (x) {
      var none = x.had === null, p = none ? 0 : Math.min(1, x.had / x.goal);
      return '<div class="gt"><i class="mg glyph-' + x.k + '"></i><span class="gl">' + x.lab + '</span>' +
        '<span class="gv">' + (none ? "&ndash;" : x.had) + '<s>/' + x.goal + x.unit + '</s></span>' +
        '<svg width="196" height="102" viewBox="0 0 196 102" aria-hidden="true">' +
          '<path d="M10 98a88 88 0 0 1 176 0" fill="none" stroke="#EAECF0" stroke-width="16"/>' +
          '<path class="arc" d="M10 98a88 88 0 0 1 176 0" fill="none" stroke="#299D6B" stroke-width="16" stroke-dasharray="' +
            (p * HALF).toFixed(1) + " " + HALF.toFixed(1) + '"/></svg></div>';
    }).join("") + '</div></div>';
  }

  /* ---------------------------------------------------- render */
  function render(host, m) {
    var k = m.kaira === "locked" ? kLocked(m) : m.kaira === "ready" ? kReady(m) : kRevealed(m);
    host.innerHTML = '<div class="tw">' + k + weekCard(m) + macros(m) + '<div class="fx"></div></div>';
    var tw = host.firstElementChild;
    tw._m = m;
    if (m.kaira === "ready") initGift(tw);
    var u = tw.querySelector(".unlock");
    if (u) u.addEventListener("click", function () { if (!tw._busy) unlock(tw); });
    /* the arcs and gauges arrive rather than print */
    if (!REDUCED) {
      [].slice.call(tw.querySelectorAll(".gt .arc")).forEach(function (a, i) {
        var d = a.getAttribute("stroke-dasharray"), tot = d.split(" ")[1];
        a.animate([{ strokeDasharray: "0 " + tot }, { strokeDasharray: d }], { duration: 900, delay: 120 + i * 60, easing: EASE, fill: "backwards" });
      });
    }
    return tw;
  }

  /* Show less / Read the full insight */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".tw .kfold"); if (!b) return;
    var c = b.closest(".kc"), shut = !c.classList.contains("folded");
    c.classList.toggle("folded", shut);
    b.setAttribute("aria-expanded", String(!shut));
    b.querySelector("span").textContent = shut ? "Read the full insight" : "Show less";
  });

  /* ------------------------------------------------- the gift */
  var giftData = null, giftWait = [];
  function giftJSON(cb) {
    if (giftData) return cb(giftData);
    giftWait.push(cb);
    if (giftWait.length > 1) return;
    fetch(BASE + "gift.json").then(function (r) { return r.json(); }).then(function (d) {
      giftData = d; giftWait.splice(0).forEach(function (f) { f(d); });
    });
  }
  /* 100 frames at 60fps: 15 to 60 the lid hops and the ribbons wiggle, 18 to
     100 the gold stars bloom. Resting, it plays the hop alone now and then. */
  function initGift(tw) {
    var g = tw.querySelector(".gbox");
    if (!g || !window.lottie) return;
    giftJSON(function (d) {
      var an = lottie.loadAnimation({ container: g, renderer: "svg", loop: false, autoplay: false, animationData: JSON.parse(JSON.stringify(d)) });
      an.goToAndStop(0, true);
      tw._gift = an;
      if (REDUCED) return;
      var t = setInterval(function () {
        if (!document.contains(g)) { clearInterval(t); return; }
        if (!tw._opened && !tw._busy) an.playSegments([15, 62], true);
      }, 4200);
      setTimeout(function () { if (!tw._opened) an.playSegments([15, 62], true); }, 900);
    });
  }

  function A(el, kf, dur, delay, ease) {
    if (!el) return null;
    return el.animate(kf, { duration: dur, delay: delay || 0, easing: ease || EASE, fill: "both" });
  }
  function resolveIn(el, delay, dur) {
    return A(el, [{ opacity: 0, filter: "blur(6px)", transform: "translateY(8px)" }, { opacity: 1, filter: "blur(0px)", transform: "none" }], dur || 520, delay, OUT);
  }
  function at(tw, el) {
    var s = tw.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2 };
  }
  function later(ms, fn) { return setTimeout(fn, ms); }

  /* the card grows from ready to the full insight; the height is released once
     it lands, or Show less could never fold it again */
  function morph(tw, atMs, dur, revealAt) {
    var card = tw.querySelector(".kc"), rdy = card.querySelector(".in-ready"), rev = card.querySelector(".in-rev");
    var items = [].slice.call(rev.children);
    A(rdy, [{ opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(4px)" }], 280, atMs - 280);
    later(atMs, function () {
      var h1 = card.offsetHeight;
      rdy.style.display = "none"; rev.style.display = "";
      card.querySelector(".kgift").style.display = "none";
      card.classList.remove("ready");
      items.forEach(function (n) { n.style.opacity = 0; });
      var h2 = card.offsetHeight;
      var grow = A(card, [{ height: h1 + "px" }, { height: h2 + "px" }], dur, 0, INOUT);
      if (grow) grow.onfinish = function () { grow.cancel(); };
      items.forEach(function (n, i) { resolveIn(n, (revealAt - atMs) + i * 110); });
    });
  }

  /* Unlock: the box lifts out of its corner to the middle of the card and
     opens in a burst of gold light, the card grows under a soft shimmer, then
     KAIRA's insight arrives line by line. About 3.4s. */
  function unlock(tw) {
    tw._busy = true; tw._opened = true;
    var m = tw._m, card = tw.querySelector(".kc"), g = card.querySelector(".gbox"), fx = tw.querySelector(".fx");
    var done = function () { tw._busy = false; if (m.onUnlock) m.onUnlock(); };
    if (REDUCED || !g) {
      card.querySelector(".kgift").style.display = "none";
      card.querySelector(".in-ready").style.display = "none";
      card.classList.remove("ready");
      var rv = card.querySelector(".in-rev"); rv.style.display = "";
      A(rv, [{ opacity: 0 }, { opacity: 1 }], 200);
      return done();
    }
    var an = tw._gift, btn = card.querySelector(".unlock");
    A(btn, [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(.94)" }], 260, 60);
    A(card.querySelector(".in-ready .krow"), [{ opacity: 1 }, { opacity: 0 }], 300, 120);
    var p = at(tw, g), c = at(tw, card), S = 92;
    fx.appendChild(g);
    g.style.cssText = "position:absolute;left:0;top:0;width:" + S + "px;height:" + S + "px;will-change:transform,opacity";
    var from = "translate(" + (p.x - S / 2) + "px," + (p.y - S / 2) + "px)", to = "translate(" + (c.x - S / 2) + "px," + (c.y - S / 2) + "px)";
    A(g, [{ transform: from + " scale(1)" }, { transform: to + " scale(1.7)" }], 650, 120, INOUT);
    shine(fx, g, c);
    later(760, function () { if (an) { an.goToAndStop(0, true); an.setSpeed(1.15); an.play(); } });
    A(g, [{ transform: to + " scale(1.7)", opacity: 1 }, { transform: to + " scale(2)", opacity: 0 }], 420, 2050, EASE);
    var AT = 2150, DUR = 600, REVEAL = AT + DUR + 650;
    morph(tw, AT, DUR, REVEAL);
    later(AT, function () {
      var sk = document.createElement("div"); sk.className = "ksk";
      sk.innerHTML = '<i style="width:86%"></i><i style="width:64%"></i><i style="width:92%"></i><i style="width:78%"></i><i style="width:58%"></i><i style="width:84%"></i>';
      card.appendChild(sk);
      A(sk, [{ opacity: 0 }, { opacity: 1 }], 260, 80);
      A(sk, [{ opacity: 1 }, { opacity: 0 }], 260, REVEAL - AT - 180);
      later(REVEAL - AT + 120, function () { sk.remove(); });
    });
    later(3600, function () { if (g.parentNode === fx) g.remove(); });
    later(3900, done);
  }

  /* the shine behind the gift: a warm gold glow, sixteen sunrays turning
     slowly, a white flash as the lid pops, gold stars twinkling round it */
  function shine(fx, g, c) {
    var rays = "", sp = "";
    for (var i = 0; i < 16; i++) rays += '<i style="transform:rotate(' + (i * 22.5) + 'deg);width:' + (i % 2 ? 120 : 175) + 'px"></i>';
    [[-20, 88, 1], [35, 120, .7], [80, 70, .9], [125, 110, .6], [160, 84, 1], [200, 130, .7], [240, 76, .8], [285, 116, .6], [320, 92, 1],
     [10, 150, .5], [60, 160, .6], [105, 145, .5], [150, 162, .6], [190, 150, .5], [230, 165, .6], [270, 148, .5], [300, 158, .6], [345, 142, .5]]
      .forEach(function (q) {
        var a = q[0] * Math.PI / 180;
        sp += '<b style="left:' + (Math.cos(a) * q[1]).toFixed(1) + 'px;top:' + (Math.sin(a) * q[1] * .8).toFixed(1) + 'px;--s:' + q[2] + '"></b>';
      });
    var sh = document.createElement("div");
    sh.className = "gshine"; sh.style.left = c.x + "px"; sh.style.top = c.y + "px";
    sh.innerHTML = '<i class="glow"></i><div class="rays">' + rays + '</div><i class="flash"></i>' + sp;
    fx.insertBefore(sh, g);
    var C = "translate(-50%,-50%) ";
    A(sh.querySelector(".glow"), [{ opacity: 0, transform: C + "scale(.3)" }, { opacity: 1, transform: C + "scale(1)", offset: .3 },
      { opacity: .9, transform: C + "scale(1.12)", offset: .75 }, { opacity: 0, transform: C + "scale(1.3)" }], 2000, 560);
    A(sh.querySelector(".rays"), [{ opacity: 0, scale: ".4" }, { opacity: 1, scale: "1", offset: .3 }, { opacity: 1, scale: "1.08", offset: .78 },
      { opacity: 0, scale: "1.15" }], 1950, 680);
    A(sh.querySelector(".flash"), [{ opacity: 0, transform: C + "scale(.4)" }, { opacity: .95, transform: C + "scale(1)", offset: .3 },
      { opacity: 0, transform: C + "scale(1.7)" }], 700, 1080, OUT);
    [].slice.call(sh.querySelectorAll("b")).forEach(function (b, i) {
      A(b, [{ opacity: 0, transform: "translate(-50%,-50%) scale(0) rotate(0deg)" },
        { opacity: 1, transform: "translate(-50%,-50%) scale(var(--s)) rotate(45deg)", offset: .45 },
        { opacity: 0, transform: "translate(-50%,-50%) scale(0) rotate(90deg)" }], 900, 960 + (i % 9) * 110 + (i > 8 ? 260 : 0));
    });
    later(3300, function () { sh.remove(); });
  }

  window.GFTrendWeek = { render: render };
})();
