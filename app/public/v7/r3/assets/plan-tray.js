/* ============================================================
   Plan tray: logging the coach's plan on the Eat screen itself.

   The "On the card" variant (?plog=card, the default). Ticking a plan food on a
   meal card no longer leaves the screen: the food drops into a bar at the bottom,
   the same bar the logging screen has (the tally strip, the time, Log n items).

   One meal at a time, on purpose. The first food ticked sets the meal; every
   other meal's ticks step back until this one is logged or cleared, so a quick
   log can never turn into logging the whole day in one go. The time starts at
   now if the meal's window is open, otherwise the middle of the window, and can
   be changed. Log plays the win moment, then the day comes back with the foods
   ticked and the score stepping up. KAIRA's button and the tab bar give the
   bottom of the screen to the bar while it is up.

   eat.html calls GFPlanTray.toggle({ m, ref, it }) from its tick handler.
   ============================================================ */
(function () {
  var Q = new URLSearchParams(location.search);
  var DISH = '<svg viewBox="0 0 24 24" fill="none" stroke="#2D3282" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M3.5 11h17"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 7.5c0-1.2 1.1-1.5 1.1-2.7"/><path d="M8.6 7.5c0-1.2 1.1-1.5 1.1-2.7"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="m9 6 6 6-6 6"/></svg>';
  var CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:19px;height:19px"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  var X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="width:16px;height:16px"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var MINUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="width:18px;height:18px"><path d="M5 12h14"/></svg>';
  var PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="width:18px;height:18px"><path d="M12 5v14M5 12h14"/></svg>';

  var css = document.createElement("style");
  css.textContent = [
    /* the bar: the logging screen's tray, measured off log.html */
    ".pt{position:fixed;left:50%;bottom:0;width:100%;max-width:390px;transform:translate(-50%,110%);z-index:30;background:#fff;",
    "padding:8px 16px calc(12px + var(--gf-home-h,20px) + env(safe-area-inset-bottom,0px));transition:transform .34s cubic-bezier(.2,0,0,1)}",
    ".pt.up{transform:translate(-50%,0)}",
    /* a lifted sheet edge rather than the logger's fade: here it sits over cards, not a plain list */
    ".pt{padding-top:14px;border-radius:20px 20px 0 0;box-shadow:0 -1px 0 #EAECF0,0 -10px 28px -14px rgba(16,24,40,.22)}",
    ".pt .ptm{position:relative;display:flex;align-items:center;justify-content:space-between;margin:0 2px 8px;font:500 12px/16px Roboto,sans-serif;letter-spacing:.25px;color:#667085}",
    ".pt .ptm b{color:#101828;font-weight:600}",
    ".pt .clr{display:inline-flex;align-items:center;gap:4px;border:0;background:none;padding:6px 0 6px 8px;margin:-6px 0;color:#667085;font:500 12px/16px Roboto,sans-serif;cursor:pointer}",
    ".pt .hint{color:#B54708}",
    ".pt .tally{position:relative;display:flex;align-items:center;gap:10px;width:100%;min-height:44px;margin:0 0 10px;padding:4px 12px 4px 10px;border:0;border-radius:9999px;background:#fff;cursor:pointer;overflow:hidden;",
    "box-shadow:0 1px 3px rgba(16,24,40,.10),0 6px 16px -6px rgba(16,24,40,.22)}",
    ".pt .tally::after{content:\"\";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transform:translateX(-110%);",
    "background:linear-gradient(105deg,rgba(68,76,231,0) 36%,rgba(68,76,231,.13) 50%,rgba(68,76,231,0) 64%)}",
    ".pt .tally.lit::after{animation:ptShine .85s cubic-bezier(.4,0,.2,1) both}",
    "@keyframes ptShine{0%{opacity:0;transform:translateX(-110%)}16%{opacity:1}74%{opacity:1}100%{opacity:0;transform:translateX(110%)}}",
    ".pt .stack{display:flex;flex-shrink:0}",
    ".pt .tok{width:28px;height:28px;border-radius:9999px;flex-shrink:0;background:#C7D7FE;border:2px solid #fff;display:grid;place-items:center;font:700 11px/1 Roboto,sans-serif;color:#2D3282}",
    ".pt .tok+.tok{margin-left:-10px}.pt .tok.more{background:#EEF4FF;color:#444CE7}",
    ".pt .names{flex:1;min-width:0;text-align:left;font:400 12.5px/18px Roboto,sans-serif;color:#101828;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".pt .kc{flex-shrink:0;font:400 12.5px/18px Roboto,sans-serif;color:#667085}.pt .chev{flex-shrink:0;color:#98A2B3;display:grid}",
    ".pt .trow{display:flex;gap:8px}",
    ".pt .timebtn{display:flex;align-items:center;gap:8px;height:52px;flex-shrink:0;padding:0 16px;border-radius:9999px;background:#fff;border:1px solid #299D6B;color:#299D6B;cursor:pointer;transition:transform .2s ease-out}",
    ".pt .timebtn:active{transform:scale(.96)}.pt .timebtn b{font:700 14px/18px Roboto,sans-serif;color:#299D6B}",
    ".pt .go{flex:1;min-width:0;height:52px;border:0;border-radius:12px;background:#299D6B;color:#fff;font:700 15px/1 Roboto,sans-serif;cursor:pointer;box-shadow:0 4px 0 #2A805A;transition:transform .2s ease-out,box-shadow .2s ease-out}",
    ".pt .go:active{transform:translateY(4px);box-shadow:none}",
    ".pt.nudge .meal{animation:ptNudge .5s cubic-bezier(.4,0,.2,1)}",
    "@keyframes ptNudge{0%,100%{transform:none}25%{transform:translateX(-4px)}50%{transform:translateX(4px)}75%{transform:translateX(-2px)}}",
    /* the screen around it: the tab bar and KAIRA's button give way; this meal's
       ticked foods are marked as in the bar, every other meal's ticks step back */
    "body.pt-on .nav{transform:translate(-50%,110%);transition:transform .34s cubic-bezier(.2,0,0,1)}",
    "body .nav{transition:transform .34s cubic-bezier(.2,0,0,1)}",
    "body.pt-on #kairaFab{opacity:0;transform:scale(.8);pointer-events:none}",
    "#kairaFab{transition:opacity .2s ease-out,transform .2s ease-out}",
    "body.pt-on .col{padding-bottom:190px}",
    ".item.pt-sel .tick{background:#E6FAF1;border-color:#299D6B;color:#299D6B}",
    ".item.pt-sel .tick::after{content:\"\";width:12px;height:12px;background:no-repeat center/12px url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23299D6B' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6L9 17l-5-5'/%3E%3C/svg%3E\")}",
    ".item.pt-out .tickbtn{opacity:.35}",
    /* the review sheet: X top right, title top left, no handle */
    ".pts{position:fixed;inset:0;z-index:40;display:flex;align-items:flex-end;justify-content:center;background:rgba(16,24,40,0);transition:background .25s ease-out;pointer-events:none}",
    ".pts.on{background:rgba(16,24,40,.4);pointer-events:auto}",
    ".pts .sh{width:100%;max-width:390px;max-height:90vh;overflow:auto;background:#fff;border-radius:20px 20px 0 0;padding:20px 16px calc(20px + var(--gf-home-h,20px));transform:translateY(100%);transition:transform .3s cubic-bezier(.2,0,0,1)}",
    ".pts.on .sh{transform:none}",
    ".pts .hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}",
    ".pts h4{margin:0;font:600 18px/24px Roboto,sans-serif;color:#101828}.pts .sub{margin-top:2px;font:400 13px/18px Roboto,sans-serif;color:#667085}",
    ".pts .x{width:32px;height:32px;border-radius:50%;border:0;background:#F2F4F7;color:#344054;display:grid;place-items:center;cursor:pointer;flex-shrink:0}",
    ".pts .r{display:flex;align-items:center;gap:12px;min-height:60px;border-bottom:1px solid #F2F4F7}",
    ".pts .r .n{flex:1;min-width:0;font:600 14px/20px Roboto,sans-serif;color:#101828}.pts .r .n span{display:block;font:400 12px/18px Roboto,sans-serif;color:#667085}",
    ".pts .st{display:flex;align-items:center;height:44px;border:1px solid #E4E7EC;border-radius:12px}",
    ".pts .st button{width:44px;height:44px;border:0;background:none;color:#299D6B;display:grid;place-items:center;cursor:pointer}.pts .st b{min-width:20px;text-align:center;font:600 15px/1 Roboto,sans-serif}",
    ".pts input[type=time]{width:100%;height:56px;border:1px solid #D0D5DD;border-radius:12px;padding:0 14px;font:500 20px/1 Roboto,sans-serif;color:#101828;box-sizing:border-box}",
    ".pts .note{margin:8px 2px 16px;font:400 13px/18px Roboto,sans-serif;color:#667085}",
    ".pts .done{width:100%;height:52px;border:0;border-radius:12px;background:#299D6B;color:#fff;font:700 15px/1 Roboto,sans-serif;box-shadow:0 4px 0 #2A805A;cursor:pointer}",
    "@media (prefers-reduced-motion:reduce){.pt,.pts .sh,body .nav{transition:none}.pt .tally.lit::after{animation:none}}",
  ].join("");
  document.head.appendChild(css);

  var T = null;   /* { m, items: [{ ref, it, n }], time: minutes } */
  var bar = document.createElement("div");
  bar.className = "pt"; bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "Logging from your plan");
  document.body.appendChild(bar);
  var sheet = document.createElement("div");
  sheet.className = "pts"; sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-modal", "true");
  document.body.appendChild(sheet);

  /* "8:00 - 10:00 AM", "12:30 - 2:00 PM": the meal's window, in minutes */
  function windowOf(m) {
    var r = /(\d+):(\d+)\s*(AM|PM)?\s*[-–]\s*(\d+):(\d+)\s*(AM|PM)/i.exec(m.time || "");
    if (!r) return null;
    var to24 = function (h, mm, ap) { h = +h % 12; if (/pm/i.test(ap)) h += 12; return h * 60 + +mm; };
    var b = to24(r[4], r[5], r[6]), a = to24(r[1], r[2], r[3] || r[6]);
    if (a > b) a -= 12 * 60;   /* "11:30 - 12:30 PM": the start is AM */
    return [a, b];
  }
  function defaultTime(m) {
    var w = windowOf(m), d = new Date(), now = d.getHours() * 60 + d.getMinutes();
    if (!w) return Math.round(now / 5) * 5;
    if (now >= w[0] && now <= w[1]) return Math.round(now / 5) * 5;   /* in the window: now */
    return Math.round((w[0] + w[1]) / 2 / 5) * 5;                       /* otherwise its middle */
  }
  function fmt(min) {
    var h = Math.floor(min / 60) % 24, mm = min % 60, ap = h < 12 ? "AM" : "PM";
    return ((h % 12) || 12) + ":" + (mm < 10 ? "0" : "") + mm + " " + ap;
  }
  function kcal() { return T.items.reduce(function (s, x) { return s + Math.round(x.it.cal / x.it.n * x.n); }, 0); }
  function count() { return T.items.reduce(function (s, x) { return s + 1; }, 0); }

  function render(fresh) {
    if (!T || !T.items.length) {
      bar.classList.remove("up"); document.body.classList.remove("pt-on"); mark(); return;
    }
    var newest = T.items.slice().reverse(), shown = newest.slice(0, 2), extra = newest.length - shown.length;
    var toks = shown.map(function () { return '<span class="tok">' + DISH + "</span>"; }).join("") + (extra > 0 ? '<span class="tok more">+' + extra + "</span>" : "");
    var n = count();
    bar.innerHTML =
      '<div class="ptm"><span class="lbl">Logging <b>' + T.m.name + '</b></span>' +
        '<button class="clr" data-pt="clear" aria-label="Clear ' + T.m.name + '">Clear' + X + "</button></div>" +
      '<button class="tally' + (fresh ? " lit" : "") + '" data-pt="review" aria-label="See what is going into ' + T.m.name + '">' +
        '<span class="stack">' + toks + '</span><span class="names">' + newest.map(function (x) { return x.it.name; }).join(", ") + "</span>" +
        '<span class="kc">' + kcal() + ' kcal</span><span class="chev">' + CHEV + "</span></button>" +
      '<div class="trow"><button class="timebtn" data-pt="time" aria-label="Change the time, now ' + fmt(T.time) + '">' + CLOCK + "<b>" + fmt(T.time) + "</b></button>" +
        '<button class="go" data-pt="log">Log ' + n + (n === 1 ? " item" : " items") + "</button></div>";
    bar.classList.add("up"); document.body.classList.add("pt-on");
    mark();
  }

  /* the card's own rows: this meal's chosen foods marked as in the bar, every other meal's ticks stepped back */
  function mark() {
    var refs = T ? T.items.map(function (x) { return x.ref; }) : [];
    document.querySelectorAll(".item[data-ref]").forEach(function (row) {
      var ref = row.dataset.ref, meal = ref.split("|")[0];
      row.classList.toggle("pt-sel", refs.indexOf(ref) > -1);
      row.classList.toggle("pt-out", !!(T && T.items.length && meal !== T.m.id && !row.classList.contains("done")));
    });
  }
  /* the cards repaint themselves (an option switch, a skip), so the marks are put back after every change */
  var pending = false;
  new MutationObserver(function () {
    if (pending) return; pending = true;
    requestAnimationFrame(function () { pending = false; mark(); });
  }).observe(document.body, { childList: true, subtree: true });

  function nudge(other) {
    var lbl = bar.querySelector(".lbl");
    if (lbl) lbl.innerHTML = '<span class="hint">One meal at a time. Log ' + T.m.name + " first.</span>";
    bar.classList.remove("nudge"); void bar.offsetWidth; bar.classList.add("nudge");
    clearTimeout(nudge.t);
    nudge.t = setTimeout(function () { if (T) render(false); }, 2200);
  }

  function toggle(c) {
    if (T && T.items.length && T.m.id !== c.m.id) { nudge(c.m); return true; }
    if (!T || !T.items.length) T = { m: c.m, items: [], time: defaultTime(c.m) };
    var at = -1;
    T.items.forEach(function (x, i) { if (x.ref === c.ref) at = i; });
    if (at > -1) T.items.splice(at, 1);
    else T.items.push({ ref: c.ref, it: c.it, n: c.it.n });
    render(at === -1);
    return true;
  }

  /* ---------- sheets ---------- */
  function openSheet(html) {
    sheet.innerHTML = '<div class="sh">' + html + "</div>";
    requestAnimationFrame(function () { sheet.classList.add("on"); });
  }
  function closeSheet() { sheet.classList.remove("on"); }
  function head(title, sub) {
    return '<div class="hd"><div><h4>' + title + "</h4>" + (sub ? '<div class="sub">' + sub + "</div>" : "") + "</div>" +
      '<button class="x" data-pt="close" aria-label="Close">' + X + "</button></div>";
  }
  function review() {
    var n = count();
    openSheet(head(T.m.name + ", " + n + (n === 1 ? " item" : " items"), fmt(T.time) + " · " + kcal() + " kcal") +
      T.items.map(function (x, i) {
        var unit = x.it.qty;
        return '<div class="r"><div class="n">' + x.it.name + "<span>" + unit + " · " + Math.round(x.it.cal / x.it.n * x.n) + " kcal</span></div>" +
          '<div class="st"><button data-pt="dec" data-i="' + i + '" aria-label="One less ' + x.it.name + '">' + MINUS + "</button><b>" + x.n + "</b>" +
          '<button data-pt="inc" data-i="' + i + '" aria-label="One more ' + x.it.name + '">' + PLUS + "</button></div></div>";
      }).join(""));
  }
  function timeSheet() {
    var w = windowOf(T.m), v = function (min) { var h = Math.floor(min / 60), mm = min % 60; return (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm; };
    openSheet(head("When did you have it?", T.m.name + (w ? ", suggested " + T.m.time : "")) +
      '<input type="time" id="ptTime" value="' + v(T.time) + '" aria-label="Time">' +
      '<p class="note">' + T.m.name + " is logged at this time.</p>" +
      '<button class="done" data-pt="settime">Done</button>');
  }

  /* ---------- log ---------- */
  function facts() {
    var MK = ["p", "c", "fa", "fb"], NAME = ["Protein", "Carbs", "Fats", "Fibre"], KEY = ["p", "c", "f", "fibre"];
    var TG = window.TGT || [];
    var best = 0, share = 0;
    MK.forEach(function (k, i) {
      var g = T.items.reduce(function (s, x) { return s + (x.it[k] || 0) * x.n; }, 0), sh = TG[i] ? g / TG[i] : 0;
      if (sh > share) { share = sh; best = i; }
    });
    var n = count();
    return { d: Math.max(1, Math.min(12, Math.round(share * 34))), queued: false, meal: T.m.name, n: n, key: KEY[best],
      moved: NAME[best] + " moved most", sub: n + (n === 1 ? " item" : " items") + " into " + T.m.name,
      names: T.items.map(function (x) { return x.it.name; }), kcal: kcal(),
      lines: T.items.map(function (x) { return { name: x.it.name, kcal: Math.round(x.it.cal / x.it.n * x.n) }; }),
      g: { p: 0, c: 0, f: 0, fibre: 0 } };
  }
  function log() {
    var f = facts(), go = bar.querySelector(".go");
    var opt = +T.items[0].ref.split("|")[1];
    var save = { state: Q.get("state") || "", t: Date.now(), meal: T.m.id, opt: opt, refs: T.items.map(function (x) { return x.ref; }) };
    var land = function () {
      try { sessionStorage.setItem("gfInline", JSON.stringify(save)); sessionStorage.setItem("gfLogged", String(f.d)); } catch (e) {}
      location.reload();
    };
    var rect = go.getBoundingClientRect();
    /* the win moment is loaded only now: its stylesheet owns ".wm", which this
       screen also uses (the calorie watermark), so it must not sit here idle */
    var run = function () {
      var ctl = window.WinMoment && WinMoment.begin(rect, f.names);
      bar.classList.remove("up");
      if (!ctl) return land();
      setTimeout(function () { ctl.win(f, land); }, 600);   /* the save */
    };
    if (window.WinMoment) return run();
    var sc = document.createElement("script"); sc.src = "assets/win-moment.js?v=12";
    sc.onload = run; sc.onerror = land; document.head.appendChild(sc);
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-pt]");
    if (!b) { if (e.target === sheet) closeSheet(); return; }
    var a = b.dataset.pt;
    if (a === "clear") { T = null; return render(); }
    if (a === "review") return review();
    if (a === "time") return timeSheet();
    if (a === "close") return closeSheet();
    if (a === "settime") {
      var v = (document.getElementById("ptTime").value || "").split(":");
      if (v.length === 2) T.time = +v[0] * 60 + +v[1];
      closeSheet(); return render();
    }
    if (a === "inc" || a === "dec") {
      var x = T.items[+b.dataset.i];
      x.n += a === "inc" ? 1 : -1;
      if (x.n <= 0) T.items.splice(+b.dataset.i, 1);
      if (!T.items.length) { closeSheet(); T = null; return render(); }
      render(); return review();
    }
    if (a === "log") return log();
  });

  window.GFPlanTray = { toggle: toggle };
})();
