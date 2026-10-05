/* ============================================================
   Trend options: the phone screens and the three unlock motions.

   window.TM.screen(opts)   one Trend screen as an HTML string
   window.TM.mount(el, opts) builds it into el and wires its taps
   window.TM.play(scr, kind) runs an unlock: "gather" | "aurora" | "seal"

   One week of data drives every phone, so the numbers can never
   disagree: five logged days, 70 82 60 75 83, two not logged, a
   week score that is their mean (74), and last week at 68.
   ============================================================ */
(function () {
  var BASE = (document.currentScript && document.currentScript.src || "").replace(/[^/]*$/, "");
  var GAUGE = BASE + "../r3/heroes/cloud/index.html?build=17&embed=1&y=.03&v=Cloud%20Drop&score=";
  var REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var DAYS = [
    { k: "M", name: "Monday", date: "8 Mar", s: 70 },
    { k: "T", name: "Tuesday", date: "9 Mar", s: 82 },
    { k: "W", name: "Wednesday", date: "10 Mar", s: 60 },
    { k: "T", name: "Thursday", date: "11 Mar", s: 75 },
    { k: "F", name: "Friday", date: "12 Mar", s: 83 },
    { k: "S", name: "Saturday", date: "13 Mar", s: null },
    { k: "S", name: "Sunday", date: "14 Mar", s: null }
  ];
  var LAST_WEEK = 68;
  var TODAY = 2;            /* in the filling state, Wednesday */
  var logged = DAYS.filter(function (d) { return d.s !== null; });
  var WEEK = Math.round(logged.reduce(function (a, d) { return a + d.s; }, 0) / logged.length);   /* 74 */

  function status(s) { return s === null ? "none" : s >= 70 ? "solid" : s >= 50 ? "grow" : "attention"; }
  var TAG = { solid: "Solid Day", grow: "Room To Grow", attention: "Needs Attention", none: "No Data Available" };
  var ORB = { solid: BASE + "orb-solid.svg", grow: BASE + "orb-grow.svg", attention: BASE + "orb-attention.svg" };
  function orb(s, cls) { return '<img class="orb' + (cls ? " " + cls : "") + '" src="' + ORB[status(s)] + '" alt="">'; }

  /* -------------------------------------------------------------- icons */
  var IC = {
    trend: '<svg class="ico" viewBox="0 0 24 24" style="width:18px;height:18px"><path d="M22 7l-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></svg>',
    info: '<svg class="ico inf" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    left: '<svg class="ico" viewBox="0 0 24 24" style="width:24px;height:24px"><path d="M15 18l-6-6 6-6"/></svg>',
    right: '<svg class="ico" viewBox="0 0 24 24" style="width:24px;height:24px"><path d="M9 18l6-6-6-6"/></svg>',
    cal: '<svg class="ico" viewBox="0 0 24 24" style="width:18px;height:18px"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    unlock: '<svg class="ico" viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 7.75-1.4"/></svg>',
    x: '<svg width="32" height="32" fill="none" viewBox="0 0 32 32"><path style="fill:var(--g-400)" d="M16 3a13 13 0 1 0 13 13A13.013 13.013 0 0 0 16 3m4.708 16.293a1 1 0 0 1-1.415 1.415L16 17.414l-3.293 3.293a1 1 0 0 1-1.415-1.415L14.587 16l-3.293-3.293a1 1 0 1 1 1.415-1.415L16 14.587l3.293-3.293a1 1 0 0 1 1.415 1.415L17.414 16z"/></svg>'
  };
  var STATUS_BAR = '<div class="sb" aria-hidden="true"><span class="t">9:41</span><span class="i">' +
    '<svg viewBox="0 0 18 12" width="18" height="12"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor"/><rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor"/></svg>' +
    '<svg viewBox="0 0 16 12" width="16" height="12"><path d="M8 10.6 6.2 8.7a2.6 2.6 0 0 1 3.6 0z" fill="currentColor"/><path d="M4.4 6.9a5.1 5.1 0 0 1 7.2 0" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M1.9 4.3a8.6 8.6 0 0 1 12.2 0" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>' +
    '<svg viewBox="0 0 26 12" width="26" height="12"><rect x="0.5" y="0.5" width="22" height="11" rx="3.2" stroke="currentColor" stroke-opacity=".35" fill="none"/><rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor"/><path d="M24 4.2v3.6a2 2 0 0 0 0-3.6z" fill="currentColor" fill-opacity=".4"/></svg>' +
    '</span></div>';
  var NAV = '<nav class="nav" aria-hidden="true">' +
    '<span><svg class="back" viewBox="0 0 22 22" fill="none"><path fill="currentColor" d="M9.409 3.444c-.015-.015-.473-.13-1.018-.255s-.997-.208-1.004-.185-.064.401-.125.84c-.124.882-.424 1.911-.744 2.555-1 2.006-2.791 3.334-4.964 3.68L1 10.165v1.773l.502.084c3.286.551 5.429 3.008 5.83 6.686.026.24.057.436.069.436.11 0 1.947-.443 1.982-.478.025-.025.006-.25-.042-.5-.531-2.765-2.053-5.015-4.027-5.955l-.474-.226 9.74-.018 6.16-.01v-1.794l-6.176-.011-9.717-.018.598-.303c1.552-.786 2.78-2.328 3.503-4.397.206-.59.517-1.934.46-1.99"/></svg>Back</span>' +
    '<span><svg class="ico" viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>Eat</span>' +
    '<span class="on"><svg class="ico" viewBox="0 0 24 24"><path d="M22 7l-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></svg>Trend</span>' +
    '<span><svg class="ico" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>Learn</span>' +
    '</nav><div class="home" aria-hidden="true"></div>';

  function mark(px, halo) { return window.GFKaira ? GFKaira.mark(px, { halo: !!halo }) : ""; }

  /* -------------------------------------------------------------- copy */
  var COPY = {
    lockT: "Your insight unlocks in 4 days",
    lockS: "Keep logging your food consistently to get your personalised insight.",
    readyT: "Your insight is ready",
    readyS: "Your personalised insight, made from this week's food logs.",
    readyBtn: "Unlock my insight",
    eyebrow: "KAIRA's analysis",
    head: "A solid week, held back by one thing: protein.",
    p1: "You logged <b>5 of 7 days</b> and landed at <b>74%</b>, up 6 on last week.",
    wellL: "What went well",
    well: ["Your most consistent week yet, 5 days logged",
      "Carbs and fats landed close to target on most days",
      "<b>Tuesday and Friday</b> were your best, both started with eggs or paneer"],
    gapL: "The one gap, and how to close it",
    gap: "Protein fell short on <b>4 of 5 days</b>, about <b>23g a day</b> under your 94g.",
    steps: ["Add eggs, paneer or curd at breakfast on 3 mornings",
      "That alone takes your week past 80"]
  };

  /* ------------------------------------------------------- KAIRA cards */
  function kLocked() {
    var seg = DAYS.map(function (d, i) { return '<span class="' + (i <= TODAY ? "on" : "") + '"></span>'; }).join("");
    /* No shimmer here: there is no insight yet, so nothing to hint at. The
       seven segments and the count are the only progress on the card. */
    return '<div class="kc soft"><div class="kin">' +
      '<div class="krow"><span class="kmk">' + mark(30) + '</span><div><div class="kt">' + COPY.lockT + '</div>' +
      '<div class="ks">' + COPY.lockS + '</div></div></div>' +
      '<div class="prog" aria-hidden="true">' + seg + '</div>' +
      '<div class="plab"><b>3 of 7 days</b> are in.</div>' +
      '</div></div>';
  }

  /* The unlocked insight, all type and no boxes: a one-line lead, the week in
     a sentence, What went well, then The one gap and how to close it. Below
     the lead it folds away (Show less), so the card can sit small. */
  /* every bullet in the card is the same gold elbow arrow */
  var BUL = '<img src="trend-options/bullet.svg" width="16" height="16" alt="">';
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg>';
  function revBody(cls) {
    cls = cls ? " " + cls : "";
    return '<div class="kh' + cls + '">' + COPY.head + '</div>' +
      '<p class="kp' + cls + '">' + COPY.p1 + '</p>' +
      '<div class="kmore"><div>' +
        '<div class="ksec' + cls + '">' + COPY.wellL + '</div>' +
        '<ul class="kl well">' + COPY.well.map(function (t) { return '<li class="' + cls.trim() + '"><i>' + BUL + '</i><span>' + t + '</span></li>'; }).join("") + '</ul>' +
        '<div class="ksec' + cls + '">' + COPY.gapL + '</div>' +
        '<p class="kp' + cls + '">' + COPY.gap + '</p>' +
        '<ul class="kl next">' + COPY.steps.map(function (t) { return '<li class="' + cls.trim() + '"><i>' + BUL + '</i><span>' + t + '</span></li>'; }).join("") + '</ul>' +
      '</div></div>' +
      '<button class="kfold' + cls + '" type="button" aria-expanded="true"><span>Show less</span>' + CHEV + '</button>';
  }
  function revHead() {
    return '<div class="krow"><span class="kmk">' + mark(28) + '</span><div class="keb">' + COPY.eyebrow + '</div></div>';
  }
  function readyHead() {
    return '<div class="krow"><span class="kmk km-ready">' + mark(36, true) + '</span><div><div class="kt">' + COPY.readyT + '</div>' +
      '<div class="ks">' + COPY.readyS + '</div></div></div>';
  }
  var BTN = '<button class="unlock" type="button">' + IC.unlock + COPY.readyBtn + '</button>';

  function kReady(kind) {
    /* Gift: the Metabolic Kickstarter's gift box peeks in from the card's bottom
       right corner, clipped by it; the button is sized to its words so the box
       has the corner to itself. */
    if (kind === "gift") {
      return '<div class="kc ready gift"><div class="kgift"><div class="gbox"></div></div>' +
        '<div class="kin in-ready">' + readyHead() + BTN + '</div>' +
        '<div class="kin in-rev" style="display:none">' + revHead() + revBody() + '</div></div>';
    }
    if (kind === "seal") {
      return '<div class="kc ready"><div class="kin">' +
        '<div class="stack hs"><div class="h-ready">' + readyHead() + '</div><div class="h-rev" style="opacity:0">' + revHead() + '</div></div>' +
        '<div class="sealed">' + revBody("blur") + '<div class="frost"></div></div>' +
        BTN + '</div></div>';
    }
    /* Gather and aurora: title, line, then the button. No shimmer bars: the
       insight is not loading, it is waiting on a tap. */
    return '<div class="kc ready">' + (kind === "aurora" ? '<div class="kveil"></div>' : "") +
      '<div class="kin in-ready">' + readyHead() + BTN + '</div>' +
      '<div class="kin in-rev" style="display:none">' + revHead() + revBody() + '</div></div>';
  }
  function kRevealed() {
    return '<div class="kc"><div class="kin">' + revHead() + revBody() + '</div></div>';
  }

  /* ------------------------------------------------------- the charts */
  function cardHead(mode) {
    if (mode === "filling") {
      return '<div class="ch"><div><div class="l">This week so far</div>' +
        '<div class="cn wait"><b>&ndash;</b><span class="stag" data-s="none">Score on Monday</span></div></div></div>';
    }
    return '<div class="ch"><div><div class="l">Your week</div>' +
      '<div class="cn"><b>' + WEEK + '<i>%</i></b><span class="stag" data-s="solid">Solid Week</span></div></div></div>';   /* days logged is KAIRA's line, not repeated here */
  }
  function dayState(i, mode) {
    var fut = mode === "filling" && i > TODAY;
    return { fut: fut, s: fut ? null : DAYS[i].s };
  }
  function colCls(st, i, sel) {
    return "c" + (st.fut ? " fut" : st.s === null ? " none" : "") + (i === sel ? " sel" : "");
  }
  function dayAttr(i, st) {
    var d = DAYS[i];
    return ' data-i="' + i + '" aria-label="' + d.name + ", " + (st.fut ? "still to come" : st.s === null ? "not logged" : st.s + " percent, " + TAG[status(st.s)]) + '"';
  }

  /* C: tubes with an orb on top */
  function chartC(o) {
    var H = 108, line = 16 + 6 + Math.round(H * .3);
    var cols = DAYS.map(function (d, i) {
      var st = dayState(i, o.mode), inner = "";
      if (st.s !== null) inner = '<span class="fill" style="height:' + st.s + '%">' + (o.green ? "" : orb(st.s)) + '</span>';
      else if (!st.fut) inner = '<span class="hol"></span>';
      return '<div class="' + colCls(st, i, o.sel) + '"' + dayAttr(i, st) + '><span class="v">' + (st.s === null ? "" : st.s) + '</span>' +
        '<span class="tube">' + inner + '</span><span class="dk">' + d.k + '</span></div>';
    }).join("");
    var lg = o.green
      ? '<div class="lg"><span><i class="ln" style="border-top-color:var(--ok-300)"></i>Target</span></div>'
      : '<div class="lg"><span>' + orb(70) + 'Solid Day</span><span>' + orb(60) + 'Room To Grow</span><span><i class="ho"></i>Not logged</span></div>';
    return '<div class="cc' + (o.green ? " green" : "") + '">' + (o.green ? greenHead() : cardHead(o.mode)) +
      '<div class="plot"><span class="tk" style="top:' + (line - 8) + 'px">70</span><span class="tl" style="top:' + line + 'px"></span>' + cols + '</div>' + lg + '</div>';
  }
  function greenHead() {
    return '<div class="ch"><div><div class="l">Sufficiency</div><div class="cn"><b>' + WEEK + '<i>%</i></b>' +
      '<span class="stag" data-s="solid">A strong week</span></div></div><div class="r" style="color:var(--ok-600)"><b style="color:var(--ok-600)">+6</b>on last week</div></div>';
  }

  /* A: seven small copies of the day view's gauge. The same 270 degree arc
     from bottom left over the top to bottom right, the same 30 orbs in a
     zigzag, big on the inside and small on the outside, filled in arc order. */
  function gauge(s) {
    var n = s === null ? 0 : Math.round(s / 100 * 30), dots = "";
    for (var i = 0; i < 30; i++) {
      var a = 1.25 * Math.PI - i / 29 * 1.5 * Math.PI, odd = i % 2;
      var r = odd ? 19 : 15.6, rr = odd ? 1.25 : 1.85;
      var x = 22 + Math.cos(a) * r, y = 22 - Math.sin(a) * r;
      dots += '<circle cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" r="' + rr + '" fill="' + (i < n ? "#12B76A" : "#D3D9E2") + '"/>';
    }
    return '<svg width="64" height="58" viewBox="0 0 44 40" aria-hidden="true">' + dots +
      '<text x="22" y="26.5" text-anchor="middle" font-family="Roboto, sans-serif" font-size="13" font-weight="600" fill="' + (s === null ? "#98A2B3" : "#101828") + '">' +
      (s === null ? "&ndash;" : s) + '</text></svg>';
  }
  function chartA(o) {
    var cols = DAYS.map(function (d, i) {
      var st = dayState(i, o.mode);
      return '<div class="' + colCls(st, i, o.sel) + '"' + dayAttr(i, st) + '><span class="gz">' + gauge(st.s) + '</span><span class="dk">' + d.k + '</span></div>';
    }).join("");
    return '<div class="cc">' + cardHead(o.mode) + '<div class="plot az">' + cols + '</div>' +
      '</div>';
  }

  /* B: seven small bubbles, filled to the day's score. The liquid is the
     pearl grey the liquid score already has; only the surface line wears the
     day's status. */
  var bid = 0;
  function bubble(s) {
    var id = "tb" + (++bid), y = s === null ? 40 : 2 + 36 * (1 - s / 100);
    var ink = s === null ? "#D0D5DD" : { solid: "#12B76A", grow: "#F79009", attention: "#F04438" }[status(s)];
    var w = "M0 " + y + " Q5 " + (y - 1.6) + " 10 " + y + " T20 " + y + " T30 " + y + " T40 " + y;
    return '<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><defs>' +
      '<clipPath id="' + id + 'c"><circle cx="20" cy="20" r="18.5"/></clipPath>' +
      '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEF1F5"/><stop offset="1" stop-color="#C9D0DA"/></linearGradient></defs>' +
      '<circle cx="20" cy="20" r="19.25" fill="#fff" stroke="#E4E7EC" stroke-width="1.5"/>' +
      '<g clip-path="url(#' + id + 'c)">' + (s === null ? "" :
        '<path d="' + w + ' V40 H0 Z" fill="url(#' + id + 'g)"/><path d="' + w + '" fill="none" stroke="' + ink + '" stroke-width="2"/>') + '</g>' +
      '<text x="20" y="24.5" text-anchor="middle" font-family="Roboto, sans-serif" font-size="13" font-weight="600" fill="' + (s === null ? "#98A2B3" : "#101828") + '">' +
      (s === null ? "&ndash;" : s) + '</text></svg>';
  }
  function chartB(o) {
    var cols = DAYS.map(function (d, i) {
      var st = dayState(i, o.mode);
      return '<div class="' + colCls(st, i, o.sel) + '"' + dayAttr(i, st) + ' style="gap:8px"><span class="bb">' + bubble(st.s) + '</span><span class="dk">' + d.k + '</span></div>';
    }).join("");
    return '<div class="cc">' + cardHead(o.mode) + '<div class="plot" style="padding-left:0;margin-top:20px">' + cols + '</div>' +
      '<div class="lg"><span><i class="ln" style="border-top:2px solid #12B76A"></i>Solid Day</span><span><i class="ln" style="border-top:2px solid #F79009"></i>Room To Grow</span><span><i class="ho"></i>Not logged</span></div></div>';
  }

  /* D: the orb string. Each day is one orb from the gauge, placed at its
     score, joined by a quiet grey thread. 40 to 100, with the Solid band. */
  function chartD(o) {
    var W = 302, H = 150, cw = W / 7, y = function (s) { return 22 + (100 - s) / 60 * 104; };
    var pts = [], dots = "", holes = "";
    DAYS.forEach(function (d, i) {
      var st = dayState(i, o.mode), x = cw * i + cw / 2;
      if (st.s === null) { holes += '<span class="ph" style="left:' + x + 'px;top:' + y(40) + 'px"></span>'; return; }
      pts.push([x, y(st.s)]);
      dots += '<span class="pv" style="left:' + x + 'px;top:' + (y(st.s) - 30) + 'px">' + st.s + '</span>' +
        '<img class="orb pt' + (i === o.sel ? " sel" : "") + '" data-i="' + i + '" src="' + ORB[status(st.s)] + '" alt="" style="left:' + x + 'px;top:' + y(st.s) + 'px">';
    });
    var path = pts.length ? "M" + pts[0][0] + " " + pts[0][1] : "";
    for (var k = 1; k < pts.length; k++) {
      var a = pts[k - 1], b = pts[k], mx = (b[0] - a[0]) / 2;
      path += " C" + (a[0] + mx) + " " + a[1] + " " + (b[0] - mx) + " " + b[1] + " " + b[0] + " " + b[1];
    }
    var days = DAYS.map(function (d, i) {
      var st = dayState(i, o.mode);
      return '<span class="' + colCls(st, i, o.sel) + '"><span class="dk">' + d.k + '</span></span>';
    }).join("");
    return '<div class="cc">' + cardHead(o.mode) +
      '<div class="plot" style="margin-top:12px"><span class="tk" style="top:' + (y(70) - 8) + 'px">70</span>' +
      '<div class="str"><svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' +
      '<rect x="0" y="' + y(100) + '" width="' + W + '" height="' + (y(70) - y(100)) + '" rx="8" fill="#F9FAFB"/>' +
      '<line x1="0" x2="' + W + '" y1="' + y(70) + '" y2="' + y(70) + '" stroke="#D0D5DD" stroke-width="1.5" stroke-dasharray="4 4"/>' +
      '<path d="' + path + '" fill="none" stroke="#D0D5DD" stroke-width="2" stroke-linecap="round"/></svg>' + holes + dots + '</div></div>' +
      '<div class="strdays">' + days + '</div>' +
      '<div class="lg"><span>' + orb(70) + 'Solid Day</span><span>' + orb(60) + 'Room To Grow</span><span><i class="ho"></i>Not logged</span></div></div>';
  }

  var CHARTS = { A: chartA, B: chartB, C: chartC, D: chartD };

  /* ------------------------------------------------------- the sheet */
  function sheet(i) {
    var d = DAYS[i], diff = d.s - WEEK;
    return '<div class="scrim"></div><div class="sh" role="dialog" aria-label="' + d.name + '">' +
      '<div class="shh"><h4>' + d.name + ', ' + d.date + '</h4><button class="x" type="button" aria-label="Close">' + IC.x + '</button></div>' +
      '<div class="shg" data-score="' + d.s + '"></div>' +
      '<p class="shp"><b>' + (diff >= 0 ? diff + " above" : -diff + " below") + '</b> your week&rsquo;s ' + WEEK + '.</p>' +
      '<div class="shb">Open ' + d.name + ' in Eat</div></div>';
  }


  /* ------------------------------------------------- your macros this week */
  /* One week of macros, consistent with KAIRA's insight: protein was the gap
     (71g a day of 94g, on target on 1 of the 5 logged days). Neutral by
     design: ink and grey carry the data, the only colour is one amber mark on
     the gap, the same amber as a Room To Grow day. */
  var MAC = [
    { k: "protein", n: "Protein", g: 71, t: 94, met: [0, 1, 0, 0, 0], d: [64, 96, 58, 66, 71] },
    { k: "carbs",   n: "Carbs",   g: 221, t: 238, met: [1, 1, 0, 1, 1], d: [240, 246, 180, 238, 241] },
    { k: "fats",    n: "Fats",    g: 55, t: 63, met: [1, 1, 0, 0, 1], d: [64, 66, 41, 44, 63] },
    { k: "fibre",   n: "Fibre",   g: 24, t: 30, met: [0, 1, 0, 0, 1], d: [22, 31, 18, 20, 30] }
  ];
  var GAP = "protein";
  function pc(m) { return Math.round(m.g / m.t * 100); }
  function gl(k) { return '<i class="mg glyph-' + k + '"></i>'; }
  function macHead(t, r) { return '<div class="mh2"><span>' + t + '</span>' + (r ? '<span class="mr">' + r + '</span>' : "") + '</div>'; }

  var MACROS = {
    /* Gauge tiles: the old Daily averages tiles, made quiet. The glyph sits
       top right in grey, there is no word under it, no shadow and no tinted
       background, so the tiles read as information, not buttons. The arc is
       one colour, GoodFlip's primary green on a grey track, whether or not the target was reached. */
    tiles: function () {
      var R = 88, HALF = Math.PI * R;
      return '<div class="mt2"><div class="mh2"><span>Your macros this week</span></div><div class="trail">' +
        MAC.map(function (m) {
          var p = Math.min(1, m.g / m.t);
          return '<div class="gt">' + gl(m.k) +
            '<span class="gl">' + m.n + '</span><span class="gv">' + m.g + '<s>/' + m.t + 'g</s></span>' +
            '<svg width="196" height="102" viewBox="0 0 196 102" aria-hidden="true">' +
              '<path d="M10 98a88 88 0 0 1 176 0" fill="none" stroke="#EAECF0" stroke-width="16"/>' +
              '<path d="M10 98a88 88 0 0 1 176 0" fill="none" stroke="#299D6B" stroke-width="16"' +
                ' stroke-dasharray="' + (p * HALF).toFixed(1) + ' ' + HALF.toFixed(1) + '"/></svg></div>';
        }).join("") + '</div></div>';
    },
    /* A: quiet rows, a thin ink bar each */
    rows: function () {
      return '<div class="mc">' + macHead("Your macros this week", "Daily average") + MAC.map(function (m) {
        return '<div class="mrow' + (m.k === GAP ? " gap" : "") + '">' + gl(m.k) +
          '<div class="mm"><div class="mt"><b>' + m.n + '</b>' + (m.k === GAP ? '<span class="gp">The gap</span>' : "") +
          '<span class="mv"><b>' + m.g + '</b> of ' + m.t + 'g</span></div>' +
          '<div class="tr"><i style="width:' + Math.min(100, pc(m)) + '%"></i></div></div></div>';
      }).join("") + '</div>';
    },
    /* B: four dials, the glyph in the middle */
    dials: function () {
      return '<div class="mc">' + macHead("Your macros this week", "Of your targets") + '<div class="dials">' + MAC.map(function (m) {
        var r = 22, c = 2 * Math.PI * r, f = Math.min(1, m.g / m.t);
        return '<div class="dl2' + (m.k === GAP ? " gap" : "") + '"><span class="dw"><svg width="56" height="56" viewBox="0 0 56 56">' +
          '<circle cx="28" cy="28" r="' + r + '" fill="none" stroke="#EAECF0" stroke-width="4"/>' +
          '<circle cx="28" cy="28" r="' + r + '" fill="none" stroke="' + (m.k === GAP ? "#F79009" : "#344054") + '" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + (c * f).toFixed(1) + " " + c.toFixed(1) + '" transform="rotate(-90 28 28)"/></svg>' + gl(m.k) + '</span>' +
          '<b>' + pc(m) + '%</b><span>' + m.n + '</span></div>';
      }).join("") + '</div></div>';
    },
    /* C: days on target, a dot per day */
    days: function () {
      var hd = '<div class="drow dhd"><span class="mg" style="visibility:hidden"></span><b></b><span class="dts">' +
        DAYS.map(function (d) { return '<span class="dl3">' + d.k + '</span>'; }).join("") + '</span><span class="dc"></span></div>';
      return '<div class="mc">' + macHead("Days on target", "Met that day") + hd + MAC.map(function (m) {
        var hit = m.met.reduce(function (a, b) { return a + b; }, 0);
        var dots = [0, 1, 2, 3, 4, 5, 6].map(function (i) {
          return '<span class="dt ' + (i > 4 ? "nl" : m.met[i] ? "on" : "off") + '"></span>';
        }).join("");
        return '<div class="drow' + (m.k === GAP ? " gap" : "") + '">' + gl(m.k) + '<b>' + m.n + '</b><span class="dts">' + dots + '</span><span class="dc">' + hit + ' of 5</span></div>';
      }).join("") + '</div>';
    },
    /* D: one scale to 100% of your targets, four glyphs placed on it */
    scale: function () {
      var marks = MAC.map(function (m, i) {
        /* the line runs 50% to 100%: every week lands in that half, and on 0 to 100 the four bunch together */
        return '<span class="sm' + (m.k === GAP ? " gap" : "") + '" style="left:' + ((pc(m) - 50) * 2) + '%;--lift:' + (i % 2 ? 30 : 0) + 'px">' + gl(m.k) + '<b>' + pc(m) + '%</b></span>';
      }).join("");
      return '<div class="mc">' + macHead("Your macros this week", "Daily average") +
        '<div class="sc"><div class="sl"><i></i></div>' + marks + '<span class="s0">50%</span><span class="s1">Target</span></div>' +
        '<p class="snote">Carbs came closest. Protein sat furthest from its target.</p></div>';
    },
    /* E: a sentence first, the numbers as quiet chips */
    words: function () {
      return '<div class="mc">' + macHead("Your macros this week") +
        '<p class="ws">Carbs and fats were close to target. <b>Protein was the gap</b>, about 23g a day short.</p>' +
        '<div class="chips2">' + MAC.map(function (m) {
          return '<span class="ch2' + (m.k === GAP ? " gap" : "") + '">' + gl(m.k) + m.n + ' <b>' + pc(m) + '%</b></span>';
        }).join("") + '</div></div>';
    }
  };

  /* ------------------------------------------------------- the screen */
  /* opts: state "filling" | "ready" | "revealed", chart "A".."D", anim
     "gather" | "aurora" | "seal", sel (day index), sheet (day index), green */
  function screen(o) {
    var mode = o.state === "filling" ? "filling" : "week";
    var sel = o.sheet != null ? o.sheet : o.state === "filling" ? TODAY : o.sel;
    var k = o.state === "filling" ? kLocked() : o.state === "ready" ? kReady(o.anim || "gather") : kRevealed();
    /* Filling weeks have no comparison yet, so the pill centres alone.
       Once a prior week exists, "+N on last week" sits on the right. */
    var solo = true;   /* the date always centres; no "+N on last week" */
    var dl = solo ? "" : "<b>+" + (WEEK - LAST_WEEK) + "</b> on last week";
    return '<div class="scr' + (o.sheet != null ? " sheet-on" : "") + '">' + STATUS_BAR +
      '<div class="hd">' + IC.trend + '<b>Trend</b><span class="tg">How your weeks are going.</span>' + IC.info + '</div>' +
      '<div class="wk' + (solo ? " solo" : "") + '"><div class="wpill"><span class="arr">' + IC.left + '</span><span class="lbl">' + IC.cal + '8 - 14 Mar</span>' +
      '<span class="arr off">' + IC.right + '</span></div><span class="dl">' + dl + '</span></div>' +
      '<div class="bd">' + (o.anim === "aurora" ? '<div class="aur"><i></i><i></i><i></i></div>' : "") + (o.noK ? "" : k) +
      (CHARTS[o.chart || "C"])({ mode: mode, sel: sel, green: o.green }) + (o.mac ? MACROS[o.mac]() : "") + '</div>' +
      NAV + '<div class="fx"></div>' + sheet(o.sheet != null ? o.sheet : 1) + '</div>';
  }

  /* The gauge in the sheet is the real liquid score (r3/heroes/cloud), run
     embedded the way the Eat day view runs it. It is a WebGL page, so it is
     only started when its phone scrolls into view. */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); startGauge(e.target); } });
  }, { rootMargin: "100px" }) : null;
  function startGauge(host) {
    host.innerHTML = '<iframe title="" tabindex="-1" aria-hidden="true" src="' + GAUGE + host.dataset.score + '"></iframe>';
  }

  function openDay(scr, i) {
    var d = DAYS[i];
    if (!d || d.s === null) return;
    var old = scr.querySelector(".sh"), scrim = scr.querySelector(".scrim");
    old.outerHTML = sheet(i).replace(/^<div class="scrim"><\/div>/, "");
    scr.querySelectorAll(".plot .sel, .str .sel").forEach(function (n) { n.classList.remove("sel"); });
    scr.querySelectorAll('[data-i="' + i + '"]').forEach(function (n) { n.classList.add("sel"); });
    scr.querySelectorAll(".strdays > span").forEach(function (n, j) { n.classList.toggle("sel", j === i); });
    wireSheet(scr);
    requestAnimationFrame(function () { requestAnimationFrame(function () { scr.classList.add("sheet-on"); }); });
    startGauge(scr.querySelector(".shg"));
    void scrim;
  }
  function wireSheet(scr) {
    var close = function () { scr.classList.remove("sheet-on"); };
    scr.querySelector(".sh .x").onclick = close;
    scr.querySelector(".scrim").onclick = close;
  }

  /* The gift box Lottie (mk-dynamic, Metabolic-kickstarter/src/assets/Gift_animation.json):
     100 frames at 60fps. 15 to 60 the lid hops and the ribbons wiggle, 18 to 100
     the gold stars bloom. Resting, it plays the hop alone now and then. */
  var giftData = null, giftWait = [];
  function giftJSON(cb) {
    if (giftData) return cb(giftData);
    giftWait.push(cb);
    if (giftWait.length > 1) return;
    fetch("trend-options/gift.json").then(function (r) { return r.json(); }).then(function (d) {
      giftData = d; giftWait.splice(0).forEach(function (f) { f(d); });
    });
  }
  function initGift(scr) {
    var g = scr.querySelector(".gbox");
    if (!g || !window.lottie) return;
    giftJSON(function (d) {
      var an = lottie.loadAnimation({ container: g, renderer: "svg", loop: false, autoplay: false,
        animationData: JSON.parse(JSON.stringify(d)) });
      an.goToAndStop(0, true);
      scr._gift = an;
      if (REDUCED) return;
      var t = setInterval(function () {
        if (!document.contains(g)) { clearInterval(t); return; }
        if (!scr._opened && !scr._busy) an.playSegments([15, 62], true);
      }, 4200);
      setTimeout(function () { if (!scr._opened) an.playSegments([15, 62], true); }, 900);
    });
  }

  function mount(host, o) {
    host.innerHTML = screen(o);
    var scr = host.firstElementChild;
    initGift(scr);
    scr._opts = o;
    wireSheet(scr);
    if (o.sheet != null) { var g = scr.querySelector(".shg"); if (io) io.observe(g); else startGauge(g); }
    scr.addEventListener("click", function (e) {
      var c = e.target.closest("[data-i]");
      if (c && !scr._busy) openDay(scr, +c.dataset.i);
      var u = e.target.closest(".unlock");
      if (u && o.state === "ready" && !scr._busy) play(scr, o.anim || "gather");
    });
    return scr;
  }

  /* ======================================================= the unlocks */
  var EASE = "cubic-bezier(.4,0,.2,1)", OUT = "cubic-bezier(.22,1,.36,1)", INOUT = "cubic-bezier(.65,0,.35,1)";
  function A(el, kf, dur, delay, ease) {
    if (!el) return null;
    return el.animate(kf, { duration: dur, delay: delay || 0, easing: ease || EASE, fill: "both" });
  }
  function resolveIn(el, delay, dur) {
    return A(el, [{ opacity: 0, filter: "blur(6px)", transform: "translateY(8px)" },
      { opacity: 1, filter: "blur(0px)", transform: "none" }], dur || 520, delay, OUT);
  }
  /* the card grows from the ready height to the read's height while the
     ready content steps out and the read comes in */
  function morph(scr, at, dur, revealAt) {
    var card = scr.querySelector(".kc"), rdy = card.querySelector(".in-ready"), rev = card.querySelector(".in-rev");
    var items = [].slice.call(rev.children);
    A(rdy, [{ opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(4px)" }], 280, at - 280);
    later(scr, at, function () {
      var h1 = card.offsetHeight;
      rdy.style.display = "none"; rev.style.display = "";
      items.forEach(function (n) { n.style.opacity = 0; });
      var h2 = card.offsetHeight;
      /* released once it lands: a held height would pin the card at full size, and Show less could not fold it */
      var grow = A(card, [{ height: h1 + "px" }, { height: h2 + "px" }], dur, 0, INOUT);
      if (grow) grow.onfinish = function () { grow.cancel(); };
      items.forEach(function (n, i) { resolveIn(n, (revealAt - at) + i * 110); });
    });
  }
  function later(scr, ms, fn) {
    var run = scr._run;
    setTimeout(function () { if (scr._run === run) fn(); }, ms);
  }
  function at(scr, el) {
    var s = scr.getBoundingClientRect(), r = el.getBoundingClientRect(), k = s.width / 390;
    return { x: (r.left - s.left + r.width / 2) / k, y: (r.top - s.top + r.height / 2) / k };
  }

  function play(scr, kind) {
    scr._run = (scr._run || 0) + 1;
    scr._busy = true;
    later(scr, 3200, function () { scr._busy = false; });
    var btn = scr.querySelector(".unlock");
    A(btn, [{ transform: "scale(1)" }, { transform: "scale(.97)" }, { transform: "scale(1)" }], 260, 0, EASE);

    if (REDUCED) { reduced(scr, kind); return; }
    if (kind === "aurora") return aurora(scr);
    if (kind === "seal") return seal(scr);
    if (kind === "gift") return gift(scr);
    return gather(scr);
  }

  function reduced(scr, kind) {
    if (kind === "seal") {
      scr.querySelectorAll(".blur").forEach(function (n) { n.style.filter = "none"; n.style.opacity = 1; });
      scr.querySelector(".frost").style.display = "none";
      scr.querySelector(".unlock").style.display = "none";
      scr.querySelector(".h-ready").style.opacity = 0; scr.querySelector(".h-rev").style.opacity = 1;
      return;
    }
    var card = scr.querySelector(".kc");
    var kg = card.querySelector(".kgift"); if (kg) kg.style.display = "none";
    card.querySelector(".in-ready").style.display = "none";
    var rev = card.querySelector(".in-rev"); rev.style.display = "";
    A(rev, [{ opacity: 0 }, { opacity: 1 }], 200);
  }

  /* 2. Orbs gather: the week's logged days lift off the chart, drift up
     into KAIRA's mark and take on her colour, the mark draws one breath,
     and the read resolves out of it. About 2.4s. */
  function gather(scr) {
    var fx = scr.querySelector(".fx"), mk = scr.querySelector(".km-ready");
    var m = at(scr, mk);
    var orbs = [].slice.call(scr.querySelectorAll(".cc .fill .orb, .cc .str .pt"));
    A(scr.querySelector(".in-ready .unlock"), [{ opacity: 1 }, { opacity: .4 }], 300, 60);
    orbs.forEach(function (o, i) {
      var p = at(scr, o), c = document.createElement("img");
      c.src = o.src; c.alt = ""; fx.appendChild(c);
      var mid = { x: p.x + (m.x - p.x) * .2 + (i % 2 ? 14 : -14), y: p.y - 46 };
      var t0 = "translate(" + (p.x - 10) + "px," + (p.y - 10) + "px)";
      A(c, [
        { transform: t0 + " scale(1)", opacity: 1, filter: "hue-rotate(0deg) saturate(1)" },
        { transform: "translate(" + (mid.x - 10) + "px," + (mid.y - 10) + "px) scale(1.15)", opacity: 1, offset: .3, filter: "hue-rotate(0deg) saturate(1)" },
        { transform: "translate(" + (m.x - 10) + "px," + (m.y - 10) + "px) scale(.35)", opacity: 0, filter: "hue-rotate(95deg) saturate(1.2)" }
      ], 1050, 120 + i * 80, INOUT);
      /* the chart keeps its days: the orb dims while its copy travels, then comes back */
      A(o, [{ opacity: 1 }, { opacity: .2, offset: .15 }, { opacity: .2, offset: .8 }, { opacity: 1 }], 2300, 100, EASE);
    });
    var arrive = 120 + (orbs.length - 1) * 80 + 1050;
    A(mk, [{ transform: "scale(1)" }, { transform: "scale(1.22)" }, { transform: "scale(1)" }], 900, arrive - 450, INOUT);
    var rip = document.createElement("span"); rip.className = "ripple"; fx.appendChild(rip);
    rip.style.left = (m.x - 20) + "px"; rip.style.top = (m.y - 20) + "px";
    rip.animate([{ transform: "scale(.8)", opacity: .55 }, { transform: "scale(3.4)", opacity: 0 }], { duration: 900, delay: arrive - 200, easing: OUT, fill: "forwards" });
    morph(scr, arrive + 120, 600, arrive + 260);
    later(scr, 3000, function () { fx.innerHTML = ""; });
  }

  /* 1. Aurora veil: KAIRA's indigo, violet and teal light rises behind the
     card, a soft veil lifts inside it, the headline arrives word by word,
     then the light drains away. About 2.6s. */
  function aurora(scr) {
    var card = scr.querySelector(".kc"), aur = scr.querySelector(".aur"), blobs = aur.querySelectorAll("i");
    var COL = ["rgba(68,76,231,.55)", "rgba(132,97,245,.5)", "rgba(34,179,199,.5)"], LEFT = [-10, 110, 230];
    aur.style.height = (card.offsetHeight + 120) + "px";
    blobs.forEach(function (b, i) {
      b.style.background = COL[i]; b.style.left = LEFT[i] + "px";
      A(b, [
        { opacity: 0, transform: "translateY(90px) scale(.8)" },
        { opacity: 1, transform: "translateY(-30px) scale(1.05)", offset: .45 },
        { opacity: .8, transform: "translateY(-60px) scale(1.1)", offset: .7 },
        { opacity: 0, transform: "translateY(-90px) scale(1.15)" }
      ], 2600, 80 + i * 120, "cubic-bezier(.45,0,.4,1)");
    });
    A(card.querySelector(".kveil"), [{ opacity: 0 }, { opacity: 1, offset: .4 }, { opacity: 1, offset: .6 }, { opacity: 0 }], 2500, 150, EASE);
    /* the headline arrives word by word; the rest line by line */
    var rev = card.querySelector(".in-rev"), kh = rev.querySelector(".kh");
    kh.innerHTML = kh.textContent.split(" ").map(function (w) { return '<span style="display:inline-block">' + w + "</span>"; }).join(" ");
    morph(scr, 420, 650, 760);
    later(scr, 420, function () {
      kh.style.opacity = 1;
      kh.getAnimations().forEach(function (a) { a.cancel(); });
      [].slice.call(kh.children).forEach(function (w, i) { resolveIn(w, 340 + i * 70, 480); });
      var rest = [].slice.call(rev.children).filter(function (n) { return n !== kh && !n.classList.contains("krow"); });
      rest.forEach(function (n, i) { n.getAnimations().forEach(function (a) { a.cancel(); }); n.style.opacity = 0; resolveIn(n, 900 + i * 140); });
    });
  }

  /* Gift: the box lifts out of its corner to the middle of the card and opens
     (lid hops, ribbons, gold stars), then the card grows to full height under
     a soft shimmer and KAIRA's insight arrives line by line. About 3.4s. */
  function gift(scr) {
    var card = scr.querySelector(".kc"), g = card.querySelector(".gbox"), fx = scr.querySelector(".fx");
    var an = scr._gift, btn = card.querySelector(".unlock");
    scr._opened = true;
    later(scr, 3900, function () { scr._busy = false; });
    A(btn, [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(.94)" }], 260, 60);
    A(card.querySelector(".in-ready .krow"), [{ opacity: 1 }, { opacity: 0 }], 300, 120);
    if (!g) { morph(scr, 600, 600, 1300); return; }
    /* lift the box out of the card's clip into the screen's effects layer */
    var p = at(scr, g), c = at(scr, card), S = 92;
    fx.appendChild(g);
    g.style.cssText = "position:absolute;left:0;top:0;width:" + S + "px;height:" + S + "px;will-change:transform,opacity";
    var from = "translate(" + (p.x - S / 2) + "px," + (p.y - S / 2) + "px)";
    var to = "translate(" + (c.x - S / 2) + "px," + (c.y - S / 2) + "px)";
    A(g, [{ transform: from + " scale(1)" }, { transform: to + " scale(1.7)" }], 650, 120, INOUT);
    shine(fx, g, c);
    later(scr, 760, function () { if (an) { an.goToAndStop(0, true); an.setSpeed(1.15); an.play(); } });
    A(g, [{ transform: to + " scale(1.7)", opacity: 1 }, { transform: to + " scale(2)", opacity: 0 }], 420, 2050, EASE);
    /* the card grows, a shimmer holds the space, then the words */
    var AT = 2150, DUR = 600, REVEAL = AT + DUR + 650;
    morph(scr, AT, DUR, REVEAL);
    later(scr, AT, function () {
      var sk = document.createElement("div"); sk.className = "ksk";
      sk.innerHTML = "<i style=\"width:86%\"></i><i style=\"width:64%\"></i><i style=\"width:92%\"></i><i style=\"width:78%\"></i><i style=\"width:58%\"></i><i style=\"width:84%\"></i>";
      card.appendChild(sk);
      A(sk, [{ opacity: 0 }, { opacity: 1 }], 260, 80);
      A(sk, [{ opacity: 1 }, { opacity: 0 }], 260, REVEAL - AT - 180);
      later(scr, REVEAL - AT + 120, function () { sk.remove(); });
    });
    later(scr, 3600, function () { if (g.parentNode === fx) g.remove(); });
  }

  /* The shine behind the gift, after the Metabolic Kickstarter's own reveal: a
     warm gold glow, sixteen sunrays turning slowly, a white flash as the lid
     pops, and small gold stars twinkling round it. It swells in as the box
     reaches the middle and drains away as the card grows. */
  function shine(fx, g, c) {
    var rays = "", sp = "";
    for (var i = 0; i < 16; i++) rays += '<i style="transform:rotate(' + (i * 22.5) + 'deg);width:' + (i % 2 ? 120 : 175) + 'px"></i>';
    var SP = [[-20, 88, 1], [35, 120, .7], [80, 70, .9], [125, 110, .6], [160, 84, 1], [200, 130, .7], [240, 76, .8], [285, 116, .6], [320, 92, 1],
      [10, 150, .5], [60, 160, .6], [105, 145, .5], [150, 162, .6], [190, 150, .5], [230, 165, .6], [270, 148, .5], [300, 158, .6], [345, 142, .5]];
    SP.forEach(function (q) {
      var a = q[0] * Math.PI / 180;
      sp += '<b style="left:' + (Math.cos(a) * q[1]).toFixed(1) + 'px;top:' + (Math.sin(a) * q[1] * .8).toFixed(1) + 'px;--s:' + q[2] + '"></b>';
    });
    var sh = document.createElement("div");
    sh.className = "gshine";
    sh.style.left = c.x + "px"; sh.style.top = c.y + "px";
    sh.innerHTML = '<i class="glow"></i><div class="rays">' + rays + '</div><i class="flash"></i>' + sp;
    fx.insertBefore(sh, g);
    var C = "translate(-50%,-50%) ";
    A(sh.querySelector(".glow"), [{ opacity: 0, transform: C + "scale(.3)" }, { opacity: 1, transform: C + "scale(1)", offset: .3 },
      { opacity: .9, transform: C + "scale(1.12)", offset: .75 }, { opacity: 0, transform: C + "scale(1.3)" }], 2000, 560, EASE);
    A(sh.querySelector(".rays"), [{ opacity: 0, scale: ".4" }, { opacity: 1, scale: "1", offset: .3 }, { opacity: 1, scale: "1.08", offset: .78 },
      { opacity: 0, scale: "1.15" }], 1950, 680, EASE);
    A(sh.querySelector(".flash"), [{ opacity: 0, transform: C + "scale(.4)" }, { opacity: .95, transform: C + "scale(1)", offset: .3 },
      { opacity: 0, transform: C + "scale(1.7)" }], 700, 1080, OUT);
    [].slice.call(sh.querySelectorAll("b")).forEach(function (b, i) {
      A(b, [{ opacity: 0, transform: "translate(-50%,-50%) scale(0) rotate(0deg)" },
        { opacity: 1, transform: "translate(-50%,-50%) scale(var(--s)) rotate(45deg)", offset: .45 },
        { opacity: 0, transform: "translate(-50%,-50%) scale(0) rotate(90deg)" }], 900, 960 + (i % 9) * 110 + (i > 8 ? 260 : 0), EASE);
    });
    setTimeout(function () { sh.remove(); }, 3300);
  }

  /* 3. Seal lift: one pass of light across the frosted read, the button
     folds away, then each line clears in turn, top to bottom. About 2s. */
  function seal(scr) {
    var card = scr.querySelector(".kc"), btn = card.querySelector(".unlock"), frost = card.querySelector(".frost");
    var h1 = card.offsetHeight;
    A(btn, [{ opacity: 1, height: "41px", marginTop: "14px", marginBottom: "7px" },
      { opacity: 0, height: "0px", marginTop: "0px", marginBottom: "0px" }], 420, 120, INOUT);
    A(card.querySelector(".h-ready"), [{ opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(4px)" }], 320, 200);
    resolveIn(card.querySelector(".h-rev"), 420, 480);
    A(frost, [{ opacity: 1 }, { opacity: 0 }], 900, 700, EASE);
    [].slice.call(card.querySelectorAll(".blur")).forEach(function (n, i) {
      A(n, [{ filter: "blur(6px)", opacity: .45 }, { filter: "blur(0px)", opacity: 1 }], 560, 560 + i * 240, OUT);
    });
    void h1;
  }

  /* Show less / Read the full insight: the card folds to its lead and grows back */
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".kfold"); if (!b) return;
    var c = b.closest(".kc"), shut = !c.classList.contains("folded");
    c.classList.toggle("folded", shut);
    b.setAttribute("aria-expanded", String(!shut));
    b.querySelector("span").textContent = shut ? "Read the full insight" : "Show less";
  });

  window.TM = { screen: screen, mount: mount, play: play, DAYS: DAYS, WEEK: WEEK, gauge: gauge, chartC: chartC, COPY: COPY };
})();
