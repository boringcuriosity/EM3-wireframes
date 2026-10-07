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

  /* ------------------------- Your week so far, as an orb and bars (default) */
  /* ?week=gauges brings back the seven dial gauges and the arc tiles */
  var OLD = /[?&]week=gauges/.test(location.search);
  function avgOf(m) {
    var got = m.days.slice(0, m.mode === "filling" ? m.filled : 7).filter(function (s) { return s !== null; });
    return got.length ? Math.round(got.reduce(function (a, b) { return a + b; }, 0) / got.length) : null;
  }
  /* the week's average as a glass orb: green liquid filled to the score, the
     number floating in it, a slow swell on the surface */
  function orb(score) {
    return '<div class="orb' + (score === null ? " empty" : "") + '" style="--lv:' + (score || 0) + '%">' +
      '<i class="liq"></i><i class="gloss"></i>' +
      '<span class="on">' + (score === null ? "&ndash;" : score + "<small>%</small>") + "</span></div>";
  }
  function weekCard2(m) {
    var score = m.mode === "filling" ? avgOf(m) : m.score;
    var tag = score === null ? null : m.mode === "filling" ? (score >= 70 ? "solid" : score >= 50 ? "grow" : "attention") : m.tag;
    var n = m.days.slice(0, m.mode === "filling" ? m.filled : 7).filter(function (s) { return s !== null; }).length;
    /* the week's average drawn by the score itself, Cloud Drop, exactly as the
       Eat screen shows a day: the same pearls, 0 and 100, Sufficient with its info */
    var hero = BASE + "../heroes/cloud/index.html?build=25&embed=1&bare=1&still=1&k=.42&er=.102&ey=-.095&y=.03&v=Cloud%20Drop" +
      (score === null ? "&lock=quiet" : "&score=" + score);
    /* After the ring's weekly vitals page: the title and the verdict, the
       number (here Cloud Drop, small) with one line saying what it means,
       then two facts side by side */
    var best = null, bi = -1;
    m.days.slice(0, m.mode === "filling" ? m.filled : 7).forEach(function (s, i) { if (s !== null && (best === null || s > best)) { best = s; bi = i; } });
    var LONGD = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    var head = '<div class="wh2"><div class="t2">Your week so far</div>' +
      (score === null ? '<span class="stag" data-s="none">Log to see your week</span>'
                      : '<span class="stag" data-s="' + tag + '">' + TAG[tag] + "</span>") + "</div>" +
      '<div class="wsum"><div class="whero"><iframe src="' + hero + '" title="" tabindex="-1" aria-hidden="true"></iframe></div>' +
      '<p class="wexp">Your average nutrition sufficiency score this week.</p></div>' +
      '<div class="wstats"><div><span>Days logged</span><b>' + n + " of 7</b></div>" +
      "<div><span>Best day</span><b>" + (bi < 0 ? "&ndash;" : LONGD[bi]) + "</b></div></div>";
    /* seven bars, one a day, on the same 0 to 100 as the score; the dashed
       line is the week's average, so a bar above it is a better than usual day */
    var cols = m.days.map(function (s, i) {
      var fut = m.mode === "filling" && i >= m.filled, v = fut ? null : s;
      var sel = m.mode === "filling" && i === m.filled - 1;
      return '<div class="bc' + (fut ? " fut" : v === null ? " none" : "") + (sel ? " sel" : "") + '">' +
        '<span class="bv">' + (v === null ? (fut ? "" : "&ndash;") : v) + "</span>" +
        '<i class="bb" style="--v:' + (v === null ? 0 : v / 100) + '"></i></div>';
    }).join("");
    var days = DK.map(function (d, i) {
      var sel = m.mode === "filling" && i === m.filled - 1, fut = m.mode === "filling" && i >= m.filled;
      return '<span class="dk' + (sel ? " on" : "") + (fut ? " fut" : "") + '">' + d + "</span>";
    }).join("");
    var avg = score === null ? "" : '<div class="avgl" style="--a:' + score / 100 + '"><span>Avg ' + score + "</span></div>";
    var key = '<div class="lgd"><span><i class="k-bar"></i>Logged</span><span><i class="k-none"></i>No log</span><span><i class="k-avg"></i>Week average</span></div>';
    return '<div class="cc wk2">' + head + '<div class="bars"><div class="plot">' + avg + cols + '</div><div class="bdays">' + days + "</div></div>" + key + "</div>";
  }

  /* ------------------------------- Your macros this week, as a trend chart */
  /* The data carries each macro's week total, not its days, so the prototype
     spreads it across the logged days: each day moves with that day's score,
     with a small steady wobble so the three lines read as three. */
  var WOB = [[1, .94, 1.06, .98, 1.03, .97, 1.02], [.97, 1.04, .95, 1.03, .99, 1.05, .98], [1.05, .96, 1.02, .94, 1.06, 1, .97]];
  /* three macros compared, so three of GoodFlip's own families: indigo 600,
     gold 700 and teal 800 (goodflip-ui.css) */
  var LINE = ["#444CE7", "#CDA935", "#2DA6A6"];
  function dailyOf(m) {
    var avg = avgOf(m) || 1, upto = m.mode === "filling" ? m.filled : 7;
    return m.macros.map(function (x, j) {
      var base = x.had === null ? null : x.had / x.goal;
      return m.days.map(function (s, i) {
        if (base === null || s === null || i >= upto) return null;
        return Math.max(.2, Math.min(1.5, base * Math.pow(s / avg, .8) * WOB[j % 3][i]));
      });
    });
  }
  function smooth(pts) {
    /* a soft curve through the points; a missing day breaks the line */
    var d = "", run = [];
    function flush() {
      if (!run.length) return;
      d += "M" + run[0][0] + " " + run[0][1];
      for (var i = 1; i < run.length; i++) {
        var p0 = run[i - 2] || run[i - 1], p1 = run[i - 1], p2 = run[i], p3 = run[i + 1] || p2, t = .18;
        d += "C" + (p1[0] + (p2[0] - p0[0]) * t).toFixed(1) + " " + (p1[1] + (p2[1] - p0[1]) * t).toFixed(1) + " " +
          (p2[0] - (p3[0] - p1[0]) * t).toFixed(1) + " " + (p2[1] - (p3[1] - p1[1]) * t).toFixed(1) + " " + p2[0] + " " + p2[1];
      }
      run = [];
    }
    pts.forEach(function (p) { if (p) run.push(p); else flush(); });
    flush();
    return d;
  }
  function macros2(m) {
    var W = 320, H = 120, PX = 16, TOP = 10, BOT = 110, MIN = .45, MAX = 1.25;
    var X = function (i) { return +(PX + i * (W - PX * 2) / 6).toFixed(1); };
    var Y = function (r) { return +(BOT - (Math.max(MIN, Math.min(MAX, r)) - MIN) / (MAX - MIN) * (BOT - TOP)).toFixed(1); };
    var data = dailyOf(m), any = data.some(function (l) { return l.some(function (v) { return v !== null; }); });
    var chips = m.macros.map(function (x, j) {
      var p = x.had === null ? null : Math.round(x.had / x.goal * 100);
      return '<button class="mchip" type="button" data-j="' + j + '" aria-pressed="false" style="--c:' + LINE[j] + '">' +
        '<i class="mg glyph-' + x.k + '"></i><span>' + x.lab + "</span><b>" + (p === null ? "&ndash;" : p + "%") + "</b></button>";
    }).join("");
    var lines = data.map(function (l, j) {
      var pts = l.map(function (v, i) { return v === null ? null : [X(i), Y(v)]; });
      return '<g class="ml" data-j="' + j + '" style="--c:' + LINE[j] + '"><path class="mp" d="' + smooth(pts) + '" pathLength="1"/>' +
        pts.map(function (p) { return p ? '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.2"/>' : ""; }).join("") + "</g>";
    }).join("");
    var days = DK.map(function (d, i) { return '<span style="left:' + (X(i) / W * 100) + '%">' + d + "</span>"; }).join("");
    var svg = '<svg class="mchart" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<rect x="0" y="' + Y(1.1) + '" width="' + W + '" height="' + (Y(.9) - Y(1.1)) + '" class="band"/>' +
      '<line x1="0" x2="' + W + '" y1="' + Y(1) + '" y2="' + Y(1) + '" class="tgt"/>' + lines + "</svg>";
    return '<div class="cc mk2"><div class="mh2">Your macros this week</div>' +
      '<div class="msub">Each day, as a share of its daily target</div>' +
      '<div class="mchips">' + chips + "</div>" +
      (any ? '<div class="mplot">' + svg + '<span class="tlab" style="top:' + (Y(1) / H * 100) + '%">Target</span><div class="mdays">' + days + "</div></div>"
           : '<div class="mempty">Your macros appear here as you log.</div>') +
      '<div class="lgd">' + m.macros.map(function (x, j) { return '<span><i class="k-line" style="--c:' + LINE[j] + '"></i>' + x.lab + "</span>"; }).join("") +
      '<span><i class="k-tgt"></i>Target</span></div>' + "</div>";
  }

  /* ---------------------------------------- Your macros this week */
  function macros(m) {
    /* the card crops the bottom of the half circle, so only 34 to 146 degrees
       of it ever shows. The arc is drawn over that visible span alone, or a
       91 percent week would hide its unfilled tail below the card and read as full. */
    var ARC = "M25.04 48.79A88 88 0 0 1 170.96 48.79", HALF = 172.0;
    return '<div><div class="mh2">Your macros this week</div><div class="trail">' + m.macros.map(function (x) {
      var none = x.had === null, p = none ? 0 : Math.min(1, x.had / x.goal);
      return '<div class="gt"><i class="mg glyph-' + x.k + '"></i><span class="gl">' + x.lab + '</span>' +
        '<span class="gv">' + (none ? "&ndash;" : x.had) + '<s>/' + x.goal + x.unit + '</s></span>' +
        '<svg width="196" height="102" viewBox="0 0 196 102" aria-hidden="true">' +
          '<path d="' + ARC + '" fill="none" stroke="#EAECF0" stroke-width="16"/>' +
          '<path class="arc" d="' + ARC + '" fill="none" stroke="#299D6B" stroke-width="16" stroke-dasharray="' +
            (p * HALF).toFixed(1) + " " + HALF.toFixed(1) + '"/></svg></div>';
    }).join("") + '</div></div>';
  }

  /* ---------------------------------------------------- render */
  function render(host, m) {
    var k = m.kaira === "locked" ? kLocked(m) : m.kaira === "ready" ? kReady(m) : kRevealed(m);
    host.innerHTML = '<div class="tw">' + k + (OLD ? weekCard(m) + macros(m) : weekCard2(m) + macros2(m)) + '<div class="fx"></div></div>';
    var tw = host.firstElementChild;
    tw._m = m;
    if (m.kaira === "ready") initGift(tw);
    var u = tw.querySelector(".unlock");
    if (u) u.addEventListener("click", function () { if (!tw._busy) unlock(tw); });
    /* the orb fills, the bars rise one after another, the lines draw in */
    if (!REDUCED && !OLD) {
      [].slice.call(tw.querySelectorAll(".wk2 .bb")).forEach(function (b, i) {
        A(b, [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], 700, 250 + i * 70, OUT);
      });
      [].slice.call(tw.querySelectorAll(".wk2 .bv")).forEach(function (b, i) {
        A(b, [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], 300, 650 + i * 70, OUT);
      });
      [].slice.call(tw.querySelectorAll(".mk2 .mp")).forEach(function (p, i) {
        A(p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], 1100, 300 + i * 160, INOUT);
      });
      [].slice.call(tw.querySelectorAll(".mk2 circle")).forEach(function (c, i) {
        A(c, [{ opacity: 0 }, { opacity: 1 }], 250, 900 + i * 25, OUT);
      });
    }
    /* a chip brings its macro forward and quiets the other two; again lets them all back */
    [].slice.call(tw.querySelectorAll(".mchip")).forEach(function (b) {
      b.addEventListener("click", function () {
        var on = b.getAttribute("aria-pressed") !== "true", j = b.dataset.j;
        [].slice.call(tw.querySelectorAll(".mchip")).forEach(function (x) { x.setAttribute("aria-pressed", String(on && x === b)); });
        var chart = tw.querySelector(".mchart");
        if (chart) {
          chart.classList.toggle("foc", on);
          [].slice.call(chart.querySelectorAll(".ml")).forEach(function (g) { g.classList.toggle("on", on && g.dataset.j === j); });
        }
      });
    });
    /* the arcs and gauges arrive rather than print */
    if (!REDUCED && OLD) {
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
