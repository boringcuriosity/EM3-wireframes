/* Mind: ways to lay out "Your mind plan", for mind/plan-layouts.html. screen.html?layout=<name> asks plan.js to draw
   its plan with one of these. Each gets plan.js's own state and helpers (A), and uses plan.js's taps: data-open opens a
   sheet, data-mt ticks a step, data-mepick picks me-time.
   Every layout is Move's card (move/plan.css .mv-card) holding the same checklist row, so only the grouping changes.
   ponytail: one sample day (?day=), layouts only; the chosen one moves into plan.js and the rest are deleted */
(function () {
  var K = function (x) { return (x.key || x.sheet).split(":")[0]; };
  var id = function (x) { return x.key || x.sheet; };
  var tag = function (x) { return x.sheet ? 'data-open="' + x.sheet + '"' : 'data-mt="' + x.key + '"'; };
  var pick = function (I, ids) { return ids.map(function (k) { return I.filter(function (x) { return id(x) === k; })[0]; }).filter(Boolean); };
  var ICK = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var BED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/></svg>';
  var mark = function (on) { return '<span class="tmark' + (on ? " on" : "") + '">' + (on ? ICK : "") + '</span>'; };
  var cnt = function (rows) { var n = rows.filter(function (x) { return x.on; }).length; return n === rows.length ? "All done" : n + " of " + rows.length + " done"; };
  var bedAt = function (A) { return A.mins(A.P.bed) + (A.mins(A.P.bed) < 720 ? 1440 : 0); };
  var when = function (x) { var k = K(x); return k === "sleep" ? "Morning" : k === "br" || k === "me" ? "Any time" : x.at; };

  /* the one checklist row: the tick (or the sheet it opens), the words, and a chevron when it opens a sheet or the time when it is set */
  function row(x, right) {
    var r = right != null ? right : x.sheet ? CHEV : x.at;
    return '<div class="mv-tip tip ly-row' + (x.on ? " done" : "") + '" data-tiprow="' + id(x) + '">' +
      '<button class="mv-tb tickbtn" ' + tag(x) + ' aria-pressed="' + x.on + '" aria-label="' + x.t + '">' + mark(x.on) + '</button>' +
      '<button class="ly-rb" ' + tag(x) + '><span class="tt">' + x.t + '</span><span class="td">' + x.d + '</span></button>' +
      (r ? '<span class="ly-tm">' + r + '</span>' : "") + '</div>';
  }
  var list = function (rows, right) { return '<div class="mv-tiplist">' + rows.map(function (x) { return row(x, right && right(x)); }).join("") + '</div>'; };
  function card(title, sub, body, scene) {
    return '<section class="mv-card' + (scene ? ' scene" style="--scene:url(/v7/icons/meals/bg/' + scene + '.webp?v=2)' : "") + '"><div class="mv-mh"><div class="t"><div class="n">' + title + '</div><div class="s">' + sub + '</div></div></div>' +
      '<div class="mv-mbi">' + body + '</div></section>';
  }
  /* the sleep window as a bar, 9 PM to 8 AM: the plan as a soft band, last night drawn over it */
  function sleepBar(A) {
    var a = 1260, z = 1920, pc = function (m) { return Math.max(0, Math.min(100, (m - a) / (z - a) * 100)); };
    var pb = bedAt(A), pw = A.mins(A.P.wake) + 1440, on = A.logged();
    return '<div class="ly-bar"><i class="pl" style="left:' + pc(pb) + '%;width:' + (pc(pw) - pc(pb)) + '%"></i>' +
      (on ? '<i class="ac" style="left:' + pc(A.S.bed) + '%;width:' + (pc(A.S.wake) - pc(A.S.bed)) + '%"></i>' : "") + '</div>' +
      '<div class="ly-barl"><span>' + (on ? A.nice(A.S.bed) : A.niceS(A.P.bed)) + '</span><span>' + (on ? A.nice(A.S.wake) : A.niceS(A.P.wake)) + '</span></div>';
  }

  /* the day in four parts, as Eat's meals and Move's workouts: which practice sits where */
  var PARTS = [
    ["Morning", "6 AM to 12 PM", "pre", ["sleep"]],
    ["Afternoon", "12 PM to 5 PM", "msnack", ["br:0", "wd:0"]],
    ["Evening", "5 PM to 9 PM", "snack", ["me", "wd:1", "mood"]],
    ["Night", "9 PM to bedtime", "bed", ["wd:2"]]
  ];
  var span = function (A, p) { return p[0] === "Night" ? "9 PM to " + A.niceS(A.P.bed) + " bedtime" : p[1]; };
  var partCards = function (A, parts) { var I = A.items(); return parts.map(function (p) { var rows = pick(I, p[3]); return card(p[0], span(A, p) + " · " + cnt(rows), list(rows), p[2]); }).join(""); };

  var L = window.MDLAYOUT = {};

  /* ----- time of day ----- */

  /* 1. Parts of the day: one card per part with its scene, every item a row */
  L.parts = function (A) { return partCards(A, PARTS); };

  /* 2. Eat and Move's card: "Your coach's plan" with a picture for each practice, the small steps under it as Move's small moves */
  var TH = { sleep: "moon", br: "wind", me: "heart", mood: "smile" };
  L.coach = function (A) {
    var I = A.items();
    var item = function (x) {
      return '<div class="mv-item' + (x.on ? " done" : "") + '"><button class="mv-tb' + (x.on ? " on" : "") + '" ' + tag(x) + ' aria-pressed="' + x.on + '" aria-label="' + x.t + '"><span class="mv-tk">' + A.IC.check + '</span></button>' +
        '<button class="mv-th ly-th" ' + tag(x) + ' aria-hidden="true" tabindex="-1">' + A.I[TH[K(x)]] + '</button>' +
        '<button class="mv-nm" ' + tag(x) + '>' + x.t + '<span>' + x.d + '</span></button><button class="mv-chev" ' + tag(x) + ' tabindex="-1" aria-hidden="true">' + CHEV + '</button></div>';
    };
    return PARTS.map(function (p) {
      var rows = pick(I, p[3]), big = rows.filter(function (x) { return x.sheet; }), small = rows.filter(function (x) { return !x.sheet; });
      return card(p[0], "Suggested " + span(A, p) + " · " + cnt(rows),
        (big.length ? '<div class="lab">Your coach\'s plan</div><div class="mv-items">' + big.map(item).join("") + '</div>' : "") +
        (small.length ? '<div class="mv-tips"><div class="lab">Small steps</div>' + list(small) + '</div>' : ""), p[2]);
    }).join("");
  };

  /* 3. One card, the four parts inside it as labels: the whole day in one place */
  L.onecard = function (A) {
    var I = A.items();
    return card("Today", cnt(I), PARTS.map(function (p) { return '<div class="ly-grp"><div class="lab">' + p[0] + '</div>' + list(pick(I, p[3])) + '</div>'; }).join(""));
  };

  /* 4. The day as an arc: sunrise to bedtime, each practice a bead on it, the sun where the day is now; the rows follow */
  L.arc = function (A) {
    var I = A.items().slice().sort(function (a, b) { return a.m - b.m; }), H = A.now * 60;
    var a = 360, z = bedAt(A), W = 326, cx = W / 2, cy = 104, rx = 140, ry = 86;
    var pt = function (m) { var t = Math.max(0, Math.min(1, (m - a) / (z - a))), g = Math.PI * (1 - t); return [cx + rx * Math.cos(g), cy - ry * Math.sin(g)]; };
    var s = pt(H), f = function (v) { return v.toFixed(1); };
    var svg = '<svg class="ly-arcsvg" viewBox="0 0 ' + W + ' 120" aria-hidden="true"><defs><linearGradient id="lyArcG" x1="0" x2="1"><stop offset="0" stop-color="#FDE8A4"/><stop offset=".55" stop-color="#A4BCFD"/><stop offset="1" stop-color="#444CE7"/></linearGradient></defs>' +
      '<path d="M' + (cx - rx) + ' ' + cy + ' A' + rx + ' ' + ry + ' 0 0 1 ' + (cx + rx) + ' ' + cy + '" fill="none" stroke="#E4E7EC" stroke-width="2" stroke-dasharray="2 5" stroke-linecap="round"/>' +
      '<path d="M' + (cx - rx) + ' ' + cy + ' A' + rx + ' ' + ry + ' 0 0 1 ' + f(s[0]) + ' ' + f(s[1]) + '" fill="none" stroke="url(#lyArcG)" stroke-width="3" stroke-linecap="round"/>' +
      '<line x1="8" x2="' + (W - 8) + '" y1="' + cy + '" y2="' + cy + '" stroke="#E4E7EC"/>' +
      I.map(function (x) { var p = pt(x.m); return '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="5" fill="' + (x.on ? "#299D6B" : "#fff") + '" stroke="' + (x.on ? "#299D6B" : "#D0D5DD") + '" stroke-width="2"/>'; }).join("") +
      '<g transform="translate(' + f(s[0] - 13) + ' ' + f(s[1] - 13) + ')"><circle cx="13" cy="13" r="13" fill="#FFFBEE" stroke="#FDE8A4"/><g transform="translate(5 5) scale(.667)" color="#CDA935">' + SUN.replace("<svg", '<svg width="24" height="24"') + '</g></g>' +
      '<g transform="translate(' + (W - 30) + ' 4)" color="#444CE7"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.3 2.05a1 1 0 0 1 .27 1.2A7 7 0 0 0 20.75 11.4a1 1 0 0 1 1.2.27A10 10 0 1 1 12.3 2.05Z"/></svg></g>' +
      '<text x="' + (cx - rx) + '" y="118" class="lbl" text-anchor="middle">6 AM</text><text x="' + (cx + rx) + '" y="118" class="lbl" text-anchor="middle">' + A.niceS(A.P.bed) + '</text></svg>';
    return '<section class="mv-card"><div class="mv-mh"><div class="t"><div class="n">Today</div><div class="s">' + cnt(I) + '</div></div></div>' + svg +
      '<div class="mv-mbi">' + list(I, when) + '</div></section>';
  };

  /* ----- a mix ----- */

  /* 5. Last night first, on its own card with its bar; the rest of the day in its parts */
  function lastNight(A) {
    var on = A.logged();
    return '<button class="mv-card ly-ln" data-open="sleep"><span class="hd"><span>' + A.I.moon + 'Last night</span><span class="go">' + (on ? "Edit" : "Log") + CHEV + '</span></span>' +
      '<span class="big">' + (on ? A.hm(A.S.wake - A.S.bed) : "How did you sleep?") + '</span>' + sleepBar(A) +
      '<span class="ft">' + (on ? "Planned " + A.hm(A.P.hours * 60) + ", " + A.niceS(A.P.bed) + " to " + A.niceS(A.P.wake) : "Planned " + A.niceS(A.P.bed) + " to " + A.niceS(A.P.wake) + ". Tap to log it.") + '</span></button>';
  }
  L.nightfirst = function (A) { return lastNight(A) + partCards(A, PARTS.slice(1)); };

  /* 6. Whenever suits you, and at set times: what fits anywhere on one card; what has a clock time runs in order on the other */
  L.settimes = function (A) {
    var I = A.items().slice().sort(function (a, b) { return a.m - b.m; }), anyK = /^(sleep|br|me)$/;
    var any = I.filter(function (x) { return anyK.test(K(x)); }), set = I.filter(function (x) { return !anyK.test(K(x)); });
    return card("Whenever suits you", cnt(any), list(any), "pre") +
      card("At set times", cnt(set), list(set, function (x) { return x.at; }) + '<div class="ly-bedline">' + BED + '<span>Bed by <b>' + A.niceS(A.P.bed) + '</b>, up by ' + A.niceS(A.P.wake) + '</span></div>', "bed");
  };

  /* ----- no time ----- */

  /* 7. Sleep and self-care, the two halves of the Rhythm score */
  L.halves = function (A) {
    var I = A.items(), sl = pick(I, ["sleep", "wd:0", "wd:1", "wd:2"]), sc = pick(I, ["br:0", "me", "mood"]);
    return card("Sleep", "70 of your Rhythm · " + cnt(sl), list(sl, function (x) { return x.sheet ? CHEV : ""; }), "bed") +
      card("Self-care", "30 of your Rhythm · " + cnt(sc), list(sc), "pre");
  };

  /* 8. A card for each practice, each the same: a header, then its rows. Me-time's three choices are ticked right on the card */
  L.cards = function (A) {
    var I = A.items(), g = function (k) { return I.filter(function (x) { return K(x) === k; }); };
    var meOn = A.P.me.some(function (m, j) { return A.S.me[j]; });
    var me = A.P.me.map(function (m, j) { var on = !!A.S.me[j];
      return '<div class="mv-tip tip ly-row' + (on ? " done" : "") + '"><button class="mv-tb tickbtn" data-mepick="' + j + '" aria-pressed="' + on + '" aria-label="' + m.t + '">' + mark(on) + '</button><button class="ly-rb" data-mepick="' + j + '"><span class="tt">' + m.t + '</span><span class="td">' + m.d + '</span></button></div>'; }).join("");
    var plan = "Planned " + A.niceS(A.P.bed) + " to " + A.niceS(A.P.wake);
    return card("Sleep", A.logged() ? plan + " · done" : plan, list(g("sleep"))) +
      card("Breathing", A.P.br[0].n + ", " + A.P.br[0].min + " min" + (A.S.br[0] ? " · done" : ""), list(g("br"))) +
      card("Wind-down", "Small steps for a steady night · " + cnt(g("wd")), list(g("wd"))) +
      card("Something for you", meOn ? "Done for today" : "Any one is enough", '<div class="mv-tiplist">' + me + '</div>') +
      card("How was today?", "A check-in around " + A.niceS(A.P.moodAt) + ". Never scored.", list(g("mood")));
  };

  var css = document.createElement("style");
  css.textContent = [
    ".ly-row .ly-rb{flex:1;min-width:0;display:flex;flex-direction:column;align-items:flex-start;text-align:left;background:none;border:0;padding:0;font:inherit;color:inherit;cursor:pointer}",
    ".ly-row .td{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}",
    ".ly-tm{flex:0 0 auto;font:500 12px/20px Roboto;color:var(--g-500);font-variant-numeric:tabular-nums}.ly-tm svg{width:16px;height:16px;color:var(--g-400);margin-top:2px}",
    ".ly-grp+.ly-grp{margin-top:16px;padding-top:12px;border-top:1px solid var(--g-100)}",
    /* Eat and Move's picture slot, drawn as the practice's glyph on the soft indigo wash */
    ".mv-th.ly-th{display:grid;place-items:center;background:linear-gradient(150deg,var(--in-50),var(--in-100))}",
    ".mv-th.ly-th svg{position:static;width:24px;height:24px;color:var(--in-600);filter:none}",
    ".mv-item.done .ly-th{background:linear-gradient(150deg,var(--g-50),var(--g-100))}.mv-item.done .ly-th svg{color:var(--g-400)}",
    ".ly-arcsvg{display:block;width:100%;height:auto;padding:0 16px 8px}.ly-arcsvg .lbl{font:500 10px Roboto;fill:#98A2B3}",
    /* last night */
    ".ly-ln{display:flex;flex-direction:column;align-items:stretch;gap:4px;width:100%;padding:16px;text-align:left;font:inherit;color:var(--g-900);cursor:pointer}",
    ".ly-ln .hd{display:flex;justify-content:space-between;align-items:center;font:600 13px/18px Roboto;color:var(--in-700)}.ly-ln .hd>span{display:flex;align-items:center;gap:8px}",
    ".ly-ln .hd svg{width:18px;height:18px}.ly-ln .go{font:600 13px Roboto;color:var(--g-500);gap:2px !important}.ly-ln .go svg{width:16px;height:16px}",
    ".ly-ln .big{font:700 28px/34px Roboto;font-variant-numeric:tabular-nums;margin:6px 0 10px}",
    ".ly-ln .ft{font:400 12px/16px Roboto;color:var(--g-500);margin-top:6px}",
    ".ly-bar{position:relative;height:10px;border-radius:9999px;background:var(--g-100);overflow:hidden}",
    ".ly-bar i{position:absolute;top:0;bottom:0;border-radius:9999px}.ly-bar .pl{background:var(--in-100)}.ly-bar .ac{background:linear-gradient(90deg,var(--in-400),var(--in-600));top:2px;bottom:2px}",
    ".ly-barl{display:flex;justify-content:space-between;margin-top:6px;font:500 12px/16px Roboto;color:var(--g-500);font-variant-numeric:tabular-nums}",
    ".ly-bedline{display:flex;gap:8px;align-items:center;margin-top:16px;padding:10px 12px;border-radius:12px;background:var(--in-25);font:400 13px/18px Roboto;color:var(--g-600)}",
    ".ly-bedline svg{width:18px;height:18px;color:var(--in-600);flex:0 0 auto}.ly-bedline b{font-weight:600;color:var(--g-900)}"
  ].join("");
  document.head.appendChild(css);
})();
