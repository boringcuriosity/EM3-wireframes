/* Move: what KAIRA says when the line under the Momentum score is tapped ("Learn more by asking KAIRA"), built like
   Eat's nutrition sufficiency answers (v7/score-commentary.html): the question already sent, then in plain steps what
   was logged, what it added, the rule behind it, and what is still open. Momentum never takes points away, so there is
   no answer about a drop. Built on momentum.js's parts (MVMOM.parts); every case is in v7/move-kaira-cases.html.
   Loaded before momentum.js, which calls MVKAIRA.after on a gain; the line on arrival is a nudge with no KAIRA link. */
(function () {
  var NOW = +new URLSearchParams(location.search).get("now") || 15;
  var NAMES = ["morning", "afternoon", "evening", "night"], ENDS = [12, 16, 20, 23];
  var and = function (a) { return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; };
  var tot = function (p) { return Math.round(p.e + p.s + p.n + p.sp); };
  var fmt = function (n) { return Math.round(n).toLocaleString("en-IN"); };
  var OK = "Keep logging honestly, every move adds up.";

  /* the same capsules, list and table Eat's answers use, styled inline so they sit in KAIRA's bubble */
  function tg(t, tone) {
    var c = tone === "up" ? "background:#ECFDF3;color:#067647;box-shadow:inset 0 0 0 1px #ABEFC6" : "background:#F2F4F7;color:#475467;box-shadow:inset 0 0 0 1px #E4E7EC";
    return '<span style="display:inline-flex;align-items:center;height:18px;padding:0 5px;border-radius:5px;font:600 11.5px/1 Roboto,sans-serif;font-variant-numeric:tabular-nums;' + c + '">' + t + "</span>";
  }
  function list(xs) {
    return '<span style="display:block;margin:8px 0 2px">' + xs.map(function (x) {
      return '<span style="display:flex;align-items:center;gap:8px;padding:3px 0"><img src="/v7/r3/assets/trend-bullet.svg" alt="" width="16" height="16" style="flex:none">' +
        '<span style="flex:1;color:#101828">' + x[0] + "</span>" + (x[1] ? tg(x[1], "up") : "") + "</span>";
    }).join("") + "</span>";
  }
  function table(title, rows) {
    return '<span style="display:block;margin-top:12px;color:#101828">' + title + '</span><span style="display:block;margin-top:6px;border-top:1px solid #E0EAFF">' + rows.map(function (r) {
      return '<span style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #F2F4F7"><span style="flex:1;color:#475467">' + r[0] + "</span>" + r[1] + "</span>";
    }).join("") + "</span>";
  }
  /* whole numbers that add up to the total shown: the biggest remainders take the leftover points */
  function share(vals, total) {
    var f = vals.map(Math.floor), left = total - f.reduce(function (a, b) { return a + b; }, 0);
    vals.map(function (v, i) { return [v - Math.floor(v), i]; }).sort(function (a, b) { return b[0] - a[0]; })
      .forEach(function (x) { if (left > 0 && vals[x[1]] > 0) { f[x[1]]++; left--; } });
    return f;
  }

  /* what is still open, with what each would add, best first */
  function left(p) {
    var open = [], gone = [];
    p.mv.forEach(function (m, i) { if (!m) (ENDS[i] > NOW ? open : gone).push(NAMES[i]); });
    var K = p.raw[0][1], kc = K - p.raw[0][0], M = p.raw[1][1], tips = M - p.raw[1][0], G = p.raw[2][1], st = G - p.raw[2][0];
    return [
      { k: "parts", v: 10 * open.length, open: open },
      { k: "workout", v: kc > 0 ? 40 * kc / K : 0, kc: kc },
      { k: "gone", v: 10 * gone.length, gone: gone },
      { k: "steps", v: st > 0 ? 10 * st / G : 0, st: st },
      { k: "tips", v: tips > 0 ? 10 * tips / M : 0, n: tips }
    ].filter(function (x) { return x.v > .5; }).sort(function (a, b) { return b.v - a.v; });
  }
  function next(p) {
    var x = left(p)[0], up = x && tg("+" + Math.round(x.v) + "%", "up");
    if (!x) return "Every part of today has counted. Anything more you do is for your body, not your score.";
    if (x.k === "parts") return x.open.length === 1 && x.open[0] === "night"
      ? "Moving tonight still adds " + up + ". A short walk, logged, is enough for the night to count."
      : "Moving in the " + and(x.open) + " still adds up to " + up + ". A short walk or one small move in each is enough.";
    if (x.k === "workout") return "Your coach's workout still has " + fmt(x.kc) + " kcal to go, worth up to " + up + ".";
    if (x.k === "gone") return "The " + and(x.gone) + (x.gone.length > 1 ? " have" : " has") + " not counted yet. If you moved then, log it at the time it happened for up to " + up + ".";
    if (x.k === "steps") return "About " + fmt(x.st) + " more steps reach your goal, worth up to " + up + ".";
    return (x.n > 1 ? x.n + " small moves are" : "One small move is") + " still open, worth up to " + up + ".";
  }
  window.MVKAIRA = {
    /* tapped after a gain: what was logged, what it added, the rule behind it, then what is still open */
    after: function (a, b, d) {
      var A = [], had = {}, newly = [];
      a.items.forEach(function (x) { had[x.k] = 1; });
      var got = b.items.filter(function (x) { return !had[x.k]; });
      b.mv.forEach(function (m, i) { if (m && !a.mv[i]) newly.push(NAMES[i]); });
      var crossed = tot(a) < 80 && tot(b) >= 80;
      A.push(tot(b) >= 100 ? "Amazing! You reached " + tg("100%", "up") + ". Every part of your day counted today, and we are proud of you."
        : crossed ? "We are proud of you! You crossed " + tg("80%", "up") + ", so today's medal is yours."
        : newly.length ? "Nice! That was your first movement in the " + and(newly) + ", so it added the most it could."
        : got.some(function (x) { return x.kcal; }) ? "Good going, that workout counted toward the calories your coach planned."
        : got.length ? "Nice, every small move you tick counts."
        : "Your steps are counting toward your goal.");
      var g = share([b.e - a.e, b.sp - a.sp, b.s - a.s, b.n - a.n], d), rows = [];
      if (g[0]) rows.push(["Your workout", tg("+" + g[0] + "%", "up")]);
      if (g[1]) rows.push([newly.join() === "night" ? "Moving at night" : "Moving in the " + and(newly), tg("+" + g[1] + "%", "up")]);
      if (g[2]) rows.push(["Your steps", tg("+" + g[2] + "%", "up")]);
      if (g[3]) rows.push(["Your small moves", tg("+" + g[3] + "%", "up")]);
      var what = got.length ? " because you logged:" + list(got.map(function (x) { return [x.n, x.kcal ? x.kcal + " kcal" : ""]; }))
        : b.s > a.s ? " because your steps came in:" + list([[fmt(b.raw[2][0]) + " of " + fmt(b.raw[2][1]) + " steps", ""]]) : ".";
      A.push("Your Momentum went up by " + tg("+" + d + "%", "up") + what + table("What it added:", rows));
      /* the rule behind it, once, where it explains the number */
      var open = left(b).filter(function (x) { return x.k === "parts"; })[0];
      if (newly.length) A.push("Each part of the day you move in adds up to " + tg("+10%", "up") + ", once. So moving a little in every part adds more than one long session.");
      else if (g[0] && open && got.length) A.push("The " + NAMES[got[0].r] + " had already counted, so only the calories added. The same workout in the " + open.open[0] + " would also have added " + tg("+10%", "up") + ".");
      else if (g[2]) A.push("Steps add up to " + tg("+10%", "up") + " as you walk toward your goal of " + fmt(b.raw[2][1]) + ".");
      else if (g[3]) A.push("All your small moves together add up to " + tg("+10%", "up") + ", so each one adds its share.");
      A.push(tot(b) >= 100 ? "Anything more you do today is for your body, not your score." : OK + " " + next(b));
      return { q: "My Momentum went up by +" + d + "%. What does that mean?", a: A };
    }
  };
})();
