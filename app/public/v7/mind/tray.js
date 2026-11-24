/* Mind: ticks stack in a bar and log together, as Move's workouts and small moves do (move/tray.js, 24 Nov 2026).
   What stacks: wind-down tasks, me-time (one coach activity), breathing (its tick), and a mood check-in once its sheet's
   Done is tapped (the face waits in the bar, variants/mood.js). None has a time to set. Last night's sleep keeps its sheet. Log marks them all done at once and the Rhythm gain plays once (variants/win.js).
   The look is plan-tray.js's own (.pt, .pts), which this page already loads. */
(function () {
  var MD = window.MDPLAN; if (!MD || MD.noplan) return;
  var S = MD.S, P = MD.P;
  var REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="width:16px;height:16px"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="m9 6 6 6-6 6"/></svg>';
  var BIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>';
  var TICK = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

  var T = [];   /* keys in the bar, in the order ticked: "wd:1", "me:0", "br:0" */
  var KIND = { wd: "Wind-down", me: "Me-time", br: "Breathing", mood: "Mood" };
  var FACE = {};   /* a mood waiting in the bar: key → the face picked */
  var bar = el("pt fm"), sheet = el("pts");
  bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "Ready to log");
  sheet.setAttribute("role", "dialog");
  function el(c) { var d = document.createElement("div"); d.className = c; document.body.appendChild(d); return d; }
  var q = function (k) { return k.split(":"); };
  function name(k) { var p = q(k); if (p[0] === "mood") return "Mood check-in"; var x = P[p[0]][+p[1]]; return p[0] === "br" ? x.n : x.t; }
  function meta(k) {
    var p = q(k); if (p[0] === "mood") return "Mood · " + (MD.moodLabel ? MD.moodLabel(FACE[k]) : "");
    var x = P[p[0]][+p[1]]; return KIND[p[0]] + (p[0] === "br" ? " · " + x.min + " min" : x.at ? " · " + MD.niceS(x.at) : "");
  }
  var label = function (n) { return n + (n === 1 ? " item" : " items"); };

  /* ---------- the bar ---------- */
  function render(fresh) {
    mark();
    if (!T.length) { bar.classList.remove("up"); document.body.classList.remove("pt-on"); return; }
    bar.innerHTML = '<div class="flw"><button class="rmz" data-mdt="clear" tabindex="-1">Remove</button>' +
      '<div class="fl' + (fresh ? " lit" : "") + '"><button class="tx" data-mdt="review" aria-label="Review what is ready to log"><b>' +
        T.slice().reverse().map(name).join(", ") + '</b><span>Review' + CHEV + '</span></button>' +
      '<button class="go" data-mdt="log">Log<small>' + label(T.length) + '</small></button>' +
      '<button class="xc" data-mdt="peek" aria-label="Show remove">' + X + '</button></div></div>';
    bar.classList.add("up"); document.body.classList.add("pt-on", "pt-fm");
  }
  /* a row waiting in the bar wears the chosen tick: green outline, green check */
  function mark() {
    document.querySelectorAll("#mdRoot [data-tiprow]").forEach(function (row) {
      var sel = T.indexOf(row.dataset.tiprow) > -1, mk = row.querySelector(".tmark");
      row.classList.toggle("pt-sel", sel);
      if (mk && !mk.classList.contains("on") && !!mk.firstChild !== sel) mk.innerHTML = sel ? TICK : "";   /* only on a change, or the observer below loops */
    });
  }
  function peek(open) {
    var w = bar.querySelector(".flw"); if (!w) return;
    open = open === undefined ? !w.classList.contains("open") : open;
    w.classList.toggle("open", open); w.querySelector(".rmz").tabIndex = open ? 0 : -1;
    clearTimeout(peek.t); if (open) peek.t = setTimeout(function () { peek(false); }, 4000);
  }
  /* the row lifts off as a small card and arcs into the bar (Move's and Eat's drop) */
  function toss(row, k) {
    var to = bar.querySelector(".fl .tx b"); if (REDUCED || !row || !to) return;
    var a = row.getBoundingClientRect(), ty = new DOMMatrix(getComputedStyle(bar).transform).m42, b = to.getBoundingClientRect();
    var m = document.createElement("div"); m.className = "morsel";
    m.innerHTML = "<b>" + name(k) + "</b><span>" + KIND[q(k)[0]] + "</span>";
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
  }
  function toggle(k) {
    var at = T.indexOf(k);
    if (at > -1) { T.splice(at, 1); delete FACE[k]; return render(); }
    T.push(k); render(); toss(document.querySelector('#mdRoot [data-tiprow="' + k + '"]'), k);
  }

  /* ---------- the review sheet: each item with a bin, no time (a yes or no for the day) ---------- */
  function review() {
    sheet.innerHTML = '<div class="sh"><div class="hd"><div><h4>Items to log</h4></div><button class="x" data-mdt="close" aria-label="Close">' + X + '</button></div>' +
      T.map(function (k, i) {
        return '<div class="pi"><div class="t"><div class="nm">' + name(k) + '</div><div class="mt">' + meta(k) + '</div></div>' +
          '<div class="ctl"><button class="mvt-rm" data-mdt="rm" data-i="' + i + '" aria-label="Remove ' + name(k) + '">' + BIN + '</button></div></div>';
      }).join("") +
      '<div class="ft"><button class="done" data-mdt="sheetlog">Log ' + label(T.length) + '</button></div></div>';
    requestAnimationFrame(function () { sheet.classList.add("on"); });
  }
  function close() { sheet.classList.remove("on"); }

  /* ---------- log: all done at once, one Rhythm moment ---------- */
  function log() {
    var keys = T.slice(), kinds = keys.map(function (k) { return q(k)[0]; });
    T = []; render(); close();
    keys.forEach(function (k) { var p = q(k); if (p[0] === "mood") { if (MD.moodPut) MD.moodPut(k, FACE[k]); delete FACE[k]; } else S[p[0]][p[1]] = true; });
    MD.batch = keys.length; setTimeout(function () { MD.batch = 0; }, 3000);   /* if no gain plays, it never reaches a later tick */
    MD.cause = kinds.every(function (x) { return x === kinds[0]; }) ? kinds[0] : "any";
    MD.render();
    if (REDUCED) return;
    keys.forEach(function (k, j) {
      var r = document.querySelector('#mdRoot [data-tiprow="' + k + '"]'), mk = r && r.querySelector(".tmark"); if (!mk) return;
      setTimeout(function () { r.classList.add("cheer"); mk.classList.add("pop"); }, j * 90);
    });
  }

  /* ---------- taps, caught before plan.js and the breathing variant see them ---------- */
  document.addEventListener("click", function (e) {
    /* an open wind-down or me-time step, tick or title: into the bar (a done one still opens its menu in plan.js) */
    var t = e.target.closest("#mdRoot [data-mt]");
    if (t) { var k = t.dataset.mt, p = q(k); if (!/^(wd|me)$/.test(p[0]) || S[p[0]][p[1]]) return; e.stopPropagation(); peek(false); return toggle(k); }
    /* breathing's tick, not done: straight into the bar, no question (its title still opens the player) */
    var ba = e.target.closest("#mdRoot [data-brask]");
    if (ba && !S.br[ba.dataset.brask]) { e.stopPropagation(); e.preventDefault(); peek(false); return toggle("br:" + ba.dataset.brask); }
    /* a mood waiting in the bar: its tick takes it back out; its title opens the sheet on the face picked */
    var mo = e.target.closest("#mdRoot .tickbtn[data-open^='mood']");
    if (mo && T.indexOf(mo.dataset.open) > -1) { e.stopPropagation(); e.preventDefault(); return toggle(mo.dataset.open); }
    var b = e.target.closest("[data-mdt]");
    if (!b) { if (e.target === sheet) close(); else if (!e.target.closest(".pt")) peek(false); return; }
    var a = b.dataset.mdt;
    if (a === "peek") return peek();
    peek(false);
    if (a === "clear") { T = []; FACE = {}; return render(); }
    if (a === "review") return review();
    if (a === "close") return close();
    if (a === "rm") { delete FACE[T[+b.dataset.i]]; T.splice(+b.dataset.i, 1); render(); return T.length ? review() : close(); }
    if (a === "log" || a === "sheetlog") return log();
  }, true);
  /* variants/mood.js hands over a first answer on Done, and asks what face is waiting when the sheet reopens */
  window.MDTRAY = {
    mood: function (k, f) { var fresh = T.indexOf(k) < 0; FACE[k] = f; if (fresh) setTimeout(function () { T.push(k); render(); toss(document.querySelector('#mdRoot [data-tiprow="' + k + '"]'), k); }, 220); else render(); },
    waiting: function (k) { return T.indexOf(k) > -1 ? FACE[k] : null; }
  };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && sheet.classList.contains("on")) close(); });

  /* plan.js redraws the cards on every change, so the marks go back on after each one */
  var root = document.getElementById("mdRoot");
  if (root) new MutationObserver(mark).observe(root, { childList: true, subtree: true });
})();
