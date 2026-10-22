/* Move: logging the coach's plan from the cards, the way Eat does (assets/plan-tray.js).
   Ticking a workout lifts it off its row and drops it into the floating bar. The bar opens a sheet
   where each workout has its own time (a wheel) and can be removed. Log plays the win moment, then
   the rows settle as done and the tiles above step up. Tapping a logged workout offers two ways on,
   its time (the wheel) or marking it not done; a ticked small move asks before it comes undone.
   No "How did it feel?" any more.
   The look is plan-tray.js's own (.pt, .pts), which this page already loads. */
(function () {
  var P = window.MVPLAN; if (!P) return;
  var S = P.S, EX = P.EX, RT = P.RT;
  var NOWM = (+new URLSearchParams(location.search).get("now") || 15) * 60 + 40;   /* ponytail: the prototype's clock, 3:40 PM, or ?now= as plan.js */
  var REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="width:16px;height:16px"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="m9 6 6 6-6 6"/></svg>';
  var CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  var BIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>';
  var PEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
  var WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/></svg>';

  var T = [];             /* in the bar: { r, id, time } with time in minutes */
  var ED = null;          /* the logged workout being edited: { r, id, time } */
  var UT = null;          /* the ticked small move being undone: { r, i } */
  var UNDO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>';
  var bar = el("pt fm"), sheet = el("pts"), sheet2 = el("pts pt2");
  bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "Workouts to log");
  sheet.setAttribute("role", "dialog"); sheet2.setAttribute("role", "dialog");
  function el(c) { var d = document.createElement("div"); d.className = c; document.body.appendChild(d); return d; }

  function fmt(m) { var h = Math.floor(m / 60) % 24, mm = m % 60; return ((h % 12) || 12) + ":" + (mm < 10 ? "0" : "") + mm + " " + (h < 12 ? "AM" : "PM"); }
  function hhmm(m) { return ("0" + Math.floor(m / 60)).slice(-2) + ":" + ("0" + m % 60).slice(-2); }
  function fromAt(s) { var q = /^(\d+):(\d+)/.exec(s || ""); return q ? +q[1] * 60 + +q[2] : NOWM; }
  /* "6 AM to 12 PM" → minutes */
  function span(rt) {
    var h = rt.win.match(/(\d+)\s*(AM|PM)/g).map(function (x) { var q = /(\d+)\s*(AM|PM)/.exec(x); return (+q[1] % 12 + (q[2] === "PM" ? 12 : 0)) * 60; });
    return h;
  }
  /* now if this part of the day is open, otherwise its middle, as Eat does for a meal */
  function defTime(r) { var w = span(RT[r]); return NOWM >= w[0] && NOWM <= w[1] ? Math.floor(NOWM / 5) * 5 : Math.round((w[0] + w[1]) / 2 / 5) * 5; }
  var later = function (x) { return x.time > NOWM; };
  var kcal = function () { return T.reduce(function (n, x) { return n + EX[x.id].kcal; }, 0); };
  var label = function (n) { return n + (n === 1 ? " workout" : " workouts"); };
  var key = function (x) { return x.r + "|" + x.id; };

  /* ---------- the bar ---------- */
  function render(fresh) {
    mark();
    if (!T.length) { bar.classList.remove("up"); document.body.classList.remove("pt-on"); return; }
    bar.innerHTML = '<div class="flw"><button class="rmz" data-mt="clear" tabindex="-1">Remove</button>' +
      '<div class="fl' + (fresh ? " lit" : "") + '"><button class="tx" data-mt="review" aria-label="Review the workouts to log"><b>' +
        T.slice().reverse().map(function (x) { return EX[x.id].name; }).join(", ") + '</b><span>Edit time' + CHEV + '</span></button>' +
      '<button class="go" data-mt="log">Log<small>' + label(T.length) + '</small></button>' +
      '<button class="xc" data-mt="peek" aria-label="Show remove">' + X + '</button></div></div>';
    bar.classList.add("up"); document.body.classList.add("pt-on", "pt-fm");
  }
  /* the rows waiting in the bar wear a green outline tick, the ones logged a filled one */
  function mark() {
    var on = T.map(key);
    document.querySelectorAll(".mv-item [data-tick]").forEach(function (b) {
      b.closest(".mv-item").classList.toggle("pt-sel", on.indexOf(b.dataset.tick) > -1);
    });
  }
  function peek(open) {
    var w = bar.querySelector(".flw"); if (!w) return;
    open = open === undefined ? !w.classList.contains("open") : open;
    w.classList.toggle("open", open); w.querySelector(".rmz").tabIndex = open ? 0 : -1;
    clearTimeout(peek.t); if (open) peek.t = setTimeout(function () { peek(false); }, 4000);
  }

  /* the row lifts off as a small card and arcs into the bar, Eat's drop */
  function toss(row, x) {
    var to = bar.querySelector(".fl .tx b"); if (REDUCED || !row || !to) return false;
    var a = row.getBoundingClientRect(), ty = new DOMMatrix(getComputedStyle(bar).transform).m42, b = to.getBoundingClientRect();
    var m = document.createElement("div"); m.className = "morsel";
    m.innerHTML = "<b>" + EX[x.id].name + "</b><span>" + EX[x.id].sets + " sets · " + EX[x.id].kcal + " kcal</span>";
    document.body.appendChild(m);
    m.style.width = "190px"; var mr = m.getBoundingClientRect(), x0 = a.left + 36, y0 = a.top + a.height / 2 - mr.height / 2;
    m.style.left = x0 + "px"; m.style.top = y0 + "px";
    var dx = b.left - x0, dy = b.top - ty + b.height / 2 - mr.height / 2 - y0, lift = Math.min(40, Math.abs(dy) * .16);
    m.animate([
      { transform: "translate(0,0) scale(1)", offset: 0, easing: "cubic-bezier(.2,.85,.35,1)" },
      { transform: "translate(" + dx * .1 + "px," + -lift + "px) scale(1)", offset: .24, easing: "cubic-bezier(.5,0,.85,.4)" },
      { transform: "translate(" + dx * .82 + "px," + dy * .86 + "px) scale(.52)", opacity: .92, offset: .78, easing: "cubic-bezier(.4,0,.2,1)" },
      { transform: "translate(" + dx + "px," + dy + "px) scale(.16)", opacity: 0, offset: 1 }
    ], { duration: 560, fill: "forwards" });
    setTimeout(function () { m.remove(); }, 600);
    setTimeout(function () { var f = bar.querySelector(".fl"); if (f) { f.classList.remove("lit"); void f.offsetWidth; f.classList.add("lit"); } }, 450);
    return true;
  }
  function toggle(r, id, row) {
    var k = r + "|" + id, at = T.map(key).indexOf(k);
    if (at > -1) { T.splice(at, 1); return render(); }
    var x = { r: r, id: id, time: defTime(r) };
    T.push(x); render(); toss(row, x);
  }

  /* ---------- the sheets ---------- */
  function open(s, html) {
    s.innerHTML = '<div class="sh">' + html + "</div>"; s.want = true;   /* a close before the next frame wins */
    if (s === sheet2) { void s.offsetWidth; var u = sheet.classList.contains("on") && sheet.querySelector(".sh"); requestAnimationFrame(function () { if (!s.want) return; s.classList.add("on"); if (u) u.classList.add("back"); }); }
    else requestAnimationFrame(function () { if (s.want) s.classList.add("on"); });
  }
  function close(s) { s.want = false; s.classList.remove("on"); if (s === sheet2) { var u = sheet.querySelector(".sh"); if (u) u.classList.remove("back"); } }
  function head(t, sub) {
    return '<div class="hd"><div><h4>' + t + '</h4>' + (sub ? '<div class="sub">' + sub + '</div>' : "") + '</div><button class="x" data-mt="close" aria-label="Close">' + X + '</button></div>';
  }
  function row(x, i) {
    var e = EX[x.id];
    return '<div class="pi"><div class="t"><div class="nm">' + e.name + '</div><div class="mt">' + RT[x.r].name + ' · ' + e.sets + ' sets · ' + e.kcal + ' kcal</div></div>' +
      '<div class="ctl"><button class="tc' + (later(x) ? " fut" : "") + '" data-mt="wheel" data-i="' + i + '" aria-label="Change the time for ' + e.name + ', now ' + fmt(x.time) + '">' + CLOCK + fmt(x.time) + '</button>' +
      '<button class="mvt-rm" data-mt="rm" data-i="' + i + '" aria-label="Remove ' + e.name + '">' + BIN + '</button></div></div>';
  }
  function list() { return ED ? [ED] : T; }
  function review() {
    var L = list(), late = L.filter(later).length;
    var ask = late ? '<div class="fbn" role="status"><div class="rib">' + WARN + 'Future time</div><div class="in"><b>' + (late === 1 ? "1 workout is" : late + " workouts are") + ' set for later</b>' +
      '<p>You can only log a workout you have already done. Done ' + (late === 1 ? "it" : "them") + '? Set ' + (late === 1 ? "it" : "them") + ' to now.</p>' +
      '<button data-mt="setnow">Set ' + (late === 1 ? "it" : "them") + ' to now, ' + fmt(Math.floor(NOWM / 5) * 5) + '</button></div></div>' : "";
    var n = L.reduce(function (s, x) { return s + EX[x.id].kcal; }, 0);
    open(sheet, head("Workouts to log") + ask + L.map(row).join("") +
      '<div class="ft"><div class="tot"><span>Total</span><b>' + n + ' kcal</b></div>' +
      '<button class="done" data-mt="sheetlog"' + (late ? " disabled" : "") + '>Log ' + label(L.length) + '</button></div>');
  }

  /* the time wheel: hour, minute, AM or PM, rolling into place as the sheet lands (Eat's) */
  var WI = 0;
  function col(c, vals, at) {
    return '<div class="wc ' + c + '" data-wc="' + c + '">' + vals.map(function (v, k) { return '<div' + (k === at ? ' class="on"' : "") + ' data-k="' + k + '">' + v + '</div>'; }).join("") + '</div>';
  }
  function wheel(i) {
    WI = i; var t = list()[i].time, h = Math.floor(t / 60) % 24, hrs = [], mn = [];
    for (var k = 1; k <= 12; k++) hrs.push(k);
    for (k = 0; k < 60; k++) mn.push((k < 10 ? "0" : "") + k);
    open(sheet2, head("When did you do it?", EX[list()[i].id].name) +
      '<div class="wh"><span class="wband"></span>' + col("hr", hrs, (h % 12 || 12) - 1) + col("mn", mn, t % 60) + col("ap", ["AM", "PM"], h < 12 ? 0 : 1) + '</div>' +
      '<div class="whint" aria-live="polite"></div><button class="done" data-mt="setwheel">Done</button>');
    requestAnimationFrame(function () {
      sheet2.querySelectorAll(".wc").forEach(function (c, ci) {
        var to = +c.querySelector(".on").dataset.k * 44, step = ci === 2 ? 44 : 132, from = to >= step ? to - step : to + step;
        c.scrollTop = REDUCED ? to : from;
        if (!REDUCED) setTimeout(function () { c.scrollTo({ top: to, behavior: "smooth" }); }, 240 + ci * 60);
        c.addEventListener("scroll", function () { clearTimeout(c.t); c.t = setTimeout(function () { pick(c); guard(); }, 60); });
      });
      guard();
    });
  }
  function pick(c) {
    var k = Math.max(0, Math.min(c.children.length - 1, Math.round(c.scrollTop / 44)));
    [].forEach.call(c.children, function (d, j) { d.classList.toggle("on", j === k); });
    return k;
  }
  function read() { var g = function (n) { return pick(sheet2.querySelector('[data-wc="' + n + '"]')); }; return (g("hr") + 1) % 12 * 60 + (g("ap") ? 720 : 0) + g("mn"); }
  /* times still to come read grey, and Done waits with a line why */
  function guard() {
    var late = read() > NOWM, d = sheet2.querySelector('[data-mt="setwheel"]');
    sheet2.querySelector(".whint").textContent = late ? "You can only log a time that has passed" : "";
    d.disabled = late;
  }
  sheet2.addEventListener("click", function (e) {
    var d = e.target.closest(".wc div"); if (d) d.parentNode.scrollTo({ top: +d.dataset.k * 44, behavior: REDUCED ? "auto" : "smooth" });
  });
  function flash(i) {
    setTimeout(function () { sheet.querySelectorAll(".tc").forEach(function (c) { if (i < 0 || +c.dataset.i === i) { c.classList.remove("flash"); void c.offsetWidth; c.classList.add("flash"); } }); }, 180);
  }

  /* ---------- log ---------- */
  function settle(items) {
    P.render();
    if (REDUCED) return;
    items.forEach(function (x, j) {
      var b = document.querySelector('[data-tick="' + key(x) + '"]'); if (!b) return;
      var mk = b.querySelector(".mv-tk");
      mk.animate([{ transform: "scale(.6)" }, { transform: "scale(1)" }], { duration: 420, delay: j * 90, easing: "cubic-bezier(.2,0,0,1)", fill: "backwards" });
      if (window.GFBurst) setTimeout(function () { mk.appendChild(window.GFBurst()); }, j * 90);
    });
  }
  function log() {
    var items = T.slice(), go = bar.querySelector(".go"), rect = go.getBoundingClientRect(), plan = (window.MOVEPART && window.MOVEPART[0].T) || kcal();
    /* the gain the win moment shows is the real change to Momentum (momentum.js), worked out before it is made */
    var apply = function (on) { items.forEach(function (x) { if (on) S.done[x.r][x.id] = "Done"; else delete S.done[x.r][x.id]; }); };
    var gain = window.MVMOM ? window.MVMOM.gain(function () { apply(true); }, function () { apply(false); }) : Math.max(1, Math.round(kcal() / plan * 40));
    var land = function () {
      if (window.MVMOM) window.MVMOM.logged();
      items.forEach(function (x) { S.done[x.r][x.id] = "Done"; (S.at[x.r] = S.at[x.r] || {})[x.id] = hhmm(x.time); });
      T = []; render(); settle(items);
    };
    bar.classList.remove("up"); document.body.classList.remove("pt-on");
    win(rect, items.map(function (x) { return EX[x.id].name; }), gain, land);
  }
  /* Eat's win moment, for anything logged on Move: the plan from the bar, or a workout found by search (log.js) */
  function win(rect, names, gain, land, stay) {
    var landed = false, done = function () { if (landed) return; landed = true;
      /* back at the top, behind the green, so the score is in view when it steps up; from the player, it stays where it was */
      if (!stay) window.scrollTo({ top: 0, behavior: "instant" });
      /* the day is rebuilt while the white still covers it, then the white fades off it: no hard cut, and the rebuild is never seen */
      land(); var h = document.querySelector("body > div.wm[role=status]"); if (!h) return;
      h.style.pointerEvents = "none"; h.style.transition = "opacity .36s cubic-bezier(.2,0,0,1)";
      requestAnimationFrame(function () { requestAnimationFrame(function () { h.style.opacity = "0"; }); });
      setTimeout(function () { h.remove(); }, 420); };
    var run = function () {
      var ctl = window.WinMoment && WinMoment.begin(rect, names);
      if (!ctl) return done();
      setTimeout(done, 6200);   /* the moment hands back on an animation frame; a background tab never draws one */
      /* no gain before a plan: the moment names the log and says who reads it */
      setTimeout(function () { ctl.win({ d: gain, n: names.length, title: names.length === 1 ? "Workout logged" : label(names.length) + " logged", say: gain == null ? "Your coach will see this when they build your plan." : "added to your Momentum score" }, done); }, 600);
    };
    if (window.WinMoment) return run();
    loadWin(run, done);
  }
  /* Move's arrival: green ribbons from the left (v7/move-win-moment-options.html). win-moment.js reads this once, when it
     loads, so it is set before the script is ever fetched */
  window.WIN_MODE = "aurora";
  /* fetched once the page has settled, so the first log starts at once instead of waiting on the script */
  function loadWin(ok, fail) {
    var sc = document.createElement("script"); sc.src = "assets/win-moment.js?v=19"; sc.onload = ok; if (fail) sc.onerror = fail; document.head.appendChild(sc);
  }
  addEventListener("load", function () { setTimeout(function () { if (!window.WinMoment) loadWin(function () {}); }, 1500); });

  /* the player's "Next" marks the one on screen as done now, without a question */
  P.feelSheet = function (r, id) {
    S.done[r][id] = "Done"; (S.at[r] = S.at[r] || {})[id] = hhmm(Math.floor(NOWM / 5) * 5);
    P.render(); if (P.onDone) P.onDone(r, id);
  };

  /* a tick on a card: not yet done goes to the bar, done opens its sheet. Caught before plan.js sees it. */
  document.addEventListener("click", function (e) {
    var t = e.target.closest(".mv-item [data-tick]"); if (!t) return;
    e.stopPropagation();
    var p = t.dataset.tick.split("|"), r = +p[0], id = p[1];
    if (!S.done[r][id]) return toggle(r, id, t.closest(".mv-item"));
    ED = { r: r, id: id, time: fromAt(S.at[r] && S.at[r][id]) }; UT = null;
    /* done already: two ways on, each to its own sheet */
    open(sheet, head(EX[id].name, "Done at " + fmt(ED.time)) +
      '<button class="mvt-opt" data-mt="edtime"><span class="ic">' + CLOCK + '</span>Edit workout time' + CHEV + '</button>' +
      '<button class="mvt-opt" data-mt="edundo"><span class="ic">' + UNDO + '</span>Mark workout as not done' + CHEV + '</button>');
  }, true);
  /* a ticked small move asks before it comes undone; an open one ticks as before (plan.js) */
  document.addEventListener("click", function (e) {
    var t = e.target.closest(".mv-tip [data-tip]"); if (!t) return;
    var q = t.dataset.tip.split("|"); if (!S.tips[q[0]][q[1]]) return;
    e.stopPropagation(); ED = null; UT = { r: +q[0], i: +q[1] };
    confirm(RT[UT.r].tips[UT.i].t, "This small move comes off today's log, and what it added to your Momentum score is taken back.");
  }, true);
  function confirm(name, say, q) {
    q = q || ["Mark as not done?", "Mark as not done", "Keep it as done", UNDO];
    open(sheet, head(q[0], name) + '<p class="mvt-say">' + say + '</p>' +
      '<button class="done mvt-pri" data-mt="undo">' + (q[3] || "") + q[1] + '</button><button class="mvt-keep" data-mt="close">' + q[2] + '</button>');
  }
  function reset() { ED = null; UT = null; CB = null; }
  var MENU = null;   /* the searched workout whose three dots are open */
  var CB = null;   /* a confirm from elsewhere (a searched workout's remove, plan.js) */
  window.MVTRAY = {
    /* ask when, then mark done: the player's Mark as completed */
    /* the player's Completed, tapped again: the card's own question, then the player redraws */
    unmark: function (r, id, after) { ED = null; UT = null; confirm(EX[id].name, "It comes off today's log, and the " + EX[id].kcal + " kcal it burned leave your Momentum score."); CB = function () { delete S.done[r][id]; if (S.at[r]) delete S.at[r][id]; if (after) setTimeout(after, 0); }; },
    markAt: function (r, id, after) { UT = null; CB = null; ED = { r: r, id: id, time: defTime(r), mark: true, after: after }; wheel(0); },
    win: function (rect, names, gain, land) { win(rect, names, gain == null ? null : Math.max(0, gain), land); },
    /* the player's Finish: the routine's workouts not yet done drop into the bar, ticked, ready to log together, as Eat's plan does */
    stage: function (r, ids) {
      var go = ids.filter(function (id) { return !S.done[r][id] && T.map(key).indexOf(r + "|" + id) < 0; });
      if (!go.length) return;
      var first = document.querySelector('.mv-item [data-tick="' + r + "|" + go[0] + '"]');
      if (first) first.closest(".mv-item").scrollIntoView({ block: "center", behavior: REDUCED ? "auto" : "smooth" });
      go.forEach(function (id, j) { setTimeout(function () {
        var b = document.querySelector('.mv-item [data-tick="' + r + "|" + id + '"]');
        toggle(r, id, b ? b.closest(".mv-item") : null);
      }, 450 + j * 140); });
    },
    confirm: function (name, say, q, yes) { ED = null; UT = null; confirm(name, say, q); CB = yes; },
    /* a searched workout's three dots: its own sheet, as a coach workout's tick opens, with the way to remove it */
    menu: function (name, sub, say, yes, edit) {
      ED = null; UT = null; CB = null; MENU = { name: name, say: say, yes: yes, edit: edit };
      open(sheet, head(name, sub) +
        (edit ? '<button class="mvt-opt" data-mt="xedit"><span class="ic">' + PEN + '</span>Edit workout' + CHEV + '</button>' : "") +
        '<button class="mvt-opt" data-mt="xrm"><span class="ic">' + BIN + '</span>Remove workout' + CHEV + '</button>');
    }
  };

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-mt]");
    if (!b) { if (e.target === sheet2) { close(sheet2); if (ED && !sheet.classList.contains("on")) reset(); } else if (e.target === sheet) { close(sheet); reset(); } if (!e.target.closest(".pt")) peek(false); return; }
    var a = b.dataset.mt, i = +b.dataset.i;
    if (a === "peek") return peek();
    peek(false);
    if (a === "clear") { T = []; return render(); }
    if (a === "review") return review();
    if (a === "close") { if (b.closest(".pt2")) { close(sheet2); if (ED && !sheet.classList.contains("on")) reset(); return; } close(sheet); reset(); return; }
    if (a === "wheel") return wheel(i);
    if (a === "edtime") { close(sheet); return wheel(0); }
    if (a === "xedit" && MENU) { var me = MENU; close(sheet); return setTimeout(me.edit, 220); }
    if (a === "xrm" && MENU) { var m = MENU; close(sheet); return setTimeout(function () { confirm(m.name, m.say, ["Remove this workout?", "Remove workout", "Keep it", BIN]); CB = m.yes; }, 220); }
    if (a === "edundo") { close(sheet); return setTimeout(function () { confirm(EX[ED.id].name, "It comes off today's log, and the " + EX[ED.id].kcal + " kcal it burned leave your Momentum score."); }, 220); }
    if (a === "undo") {
      if (CB) CB();
      else if (UT) S.tips[UT.r][UT.i] = false;
      else { delete S.done[ED.r][ED.id]; if (S.at[ED.r]) delete S.at[ED.r][ED.id]; }
      close(sheet); reset(); return P.render();
    }
    if (a === "setwheel" && ED) {
      if (ED.mark) {
        /* from the player's Mark as completed: the time makes it done, with the same win moment as a log, over the player */
        var m = ED, at = hhmm(read()), mk = document.querySelector(".mvp-mark"), rect = (mk || sheet2).getBoundingClientRect();
        var on = function () { S.done[m.r][m.id] = "Done"; (S.at[m.r] = S.at[m.r] || {})[m.id] = at; };
        var gain = window.MVMOM ? window.MVMOM.gain(on, function () { delete S.done[m.r][m.id]; }) : null;
        close(sheet2); reset();
        return setTimeout(function () { win(rect, [EX[m.id].name], gain, function () { on(); if (window.MVMOM) window.MVMOM.logged(); P.render(); if (m.after) m.after(); }, true); }, 220);
      }
      S.at[ED.r] = S.at[ED.r] || {}; S.at[ED.r][ED.id] = hhmm(read());
      var after = ED.after; close(sheet2); reset(); P.render(); if (after) after(); return;
    }
    if (a === "setwheel") { list()[WI].time = read(); render(); review(); var u = sheet.querySelector(".sh"); if (u) { u.style.transition = "none"; u.classList.add("back"); void u.offsetWidth; u.style.transition = ""; } close(sheet2); return flash(WI); }
    if (a === "setnow") { list().forEach(function (x) { if (later(x)) x.time = Math.floor(NOWM / 5) * 5; }); review(); return flash(-1); }
    if (a === "rm") {
      /* in the bar it leaves the bar; once logged it is no longer done */
      T.splice(i, 1); render();
      return T.length ? review() : close(sheet);
    }
    if (a === "log") return T.some(later) ? review() : log();
    if (a === "sheetlog") { if (T.some(later)) return; close(sheet); return log(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (sheet2.classList.contains("on")) { close(sheet2); if (ED && !sheet.classList.contains("on")) reset(); } else if (sheet.classList.contains("on")) { close(sheet); reset(); }
  });

  /* plan.js redraws the cards on every change, so the marks go back on after each one */
  var host = document.querySelector(".mv-card").parentNode;
  new MutationObserver(mark).observe(host, { childList: true });
})();
