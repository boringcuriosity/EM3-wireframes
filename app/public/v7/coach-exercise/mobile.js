/* Move plan builder on a phone (coach-exercise-template.html + coach-exercise/start.js). Read with coach-exercise/mobile.css.
   An app-like layer over the builder: it reads the builder's own fields and clicks the builder's own buttons, so the plan,
   the words and the rules stay exactly as on desktop. On a wider screen none of this shows (mobile.css hides it).
     - every dropdown rises as a bottom sheet (title top left, circle X top right)
     - an exercise is a one-line card; tapping it opens its editor as a sheet, with − and + on the numbers
     - weeks fold into one "Week 1 of 4" button that opens a sheet; the seven days fit one row
     - the rarer tools (rest day, clear, copy, delete) sit behind ⋯ and open as an action sheet */
(function () {
  var phone = matchMedia("(max-width: 760px)");
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var tx = function (el) { return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; };
  var svg = function (d, w) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (w || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>"; };
  var IX = svg('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>', 2.2);
  var IDOTS = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';
  var IDOWN = svg('<path d="M6 9l6 6 6-6"/>', 2.2);
  var ICHECK = svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 2.4);
  var IMINUS = svg('<path d="M6 12h12"/>', 2.4);
  var IPLUS = svg('<path d="M12 6v12M6 12h12"/>', 2.4);
  var IPOWER = svg('<path d="M12 3.5v8"/><path d="M7.2 6.6a7 7 0 1 0 9.6 0"/>');
  var many = function (n, w) { return n + " " + w + (+n === 1 ? "" : "s"); };
  var html = document.documentElement;

  /* ================= one scrim for everything that rises; a tap on it closes the top layer ================= */
  var dim = document.createElement("div"); dim.className = "mx-dim"; dim.setAttribute("aria-hidden", "true");

  /* ================= an action sheet: a title, a list of choices; each choice clicks the builder's own button ================= */
  var SH = null, SHFROM = null;
  function sheet(title, items, opt) {
    closeSheet(true);
    opt = opt || {};
    var w = document.createElement("div");
    w.className = "mx-sheet"; w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-label", title);
    w.innerHTML = '<div class="mx-shh"><div><b>' + esc(title) + "</b>" + (opt.sub ? "<small>" + esc(opt.sub) + "</small>" : "") + '</div><button type="button" class="mx-cx" aria-label="Close">' + IX + '</button></div><div class="mx-shb' + (opt.grid ? " mx-grid" : "") + '"></div>';
    var body = w.querySelector(".mx-shb");
    /* the ones that clear or remove go last, apart from the rest */
    items = items.filter(function (it) { return it.tone !== "red"; }).concat(items.filter(function (it) { return it.tone === "red"; }));
    items.forEach(function (it) {
      if (it.tone === "red" && !opt.grid && items.length > 1 && items.indexOf(it) === items.findIndex(function (x) { return x.tone === "red"; }) && items.indexOf(it) > 0) body.insertAdjacentHTML("beforeend", '<div class="mx-sep" role="separator"></div>');
      var b = document.createElement("button"); b.type = "button";
      b.className = "mx-it" + (it.tone ? " " + it.tone : "") + (it.on ? " on" : "");
      if (it.disabled) b.disabled = true;
      if (it.on) b.setAttribute("aria-current", "true");
      b.innerHTML = (it.icon ? '<span class="mx-ii">' + it.icon + "</span>" : "") + '<span class="mx-il"><b>' + esc(it.label) + "</b>" + (it.sub ? "<small>" + esc(it.sub) + "</small>" : "") + "</span>" +
        (it.badge ? '<span class="mx-ib">' + esc(it.badge) + "</span>" : "") + (it.on && !opt.grid ? '<span class="mx-ick">' + ICHECK + "</span>" : "");
      b.addEventListener("click", function () { closeSheet(); it.act(); });
      body.appendChild(b);
    });
    (opt.foot || []).forEach(function (m, i) {
      var f = w.querySelector(".mx-shf");
      if (!f) { f = document.createElement("div"); f.className = "mx-shf"; w.appendChild(f); }
      var x = document.createElement("button"); x.type = "button"; x.className = "mx-fb" + (m.tone ? " " + m.tone : "");
      x.innerHTML = (m.icon || "") + "<span>" + esc(m.label) + "</span>";
      x.addEventListener("click", function () { closeSheet(); m.act(); });
      f.appendChild(x);
    });
    w.querySelector(".mx-cx").addEventListener("click", function () { closeSheet(); });
    SHFROM = document.activeElement;
    document.body.appendChild(w); SH = w; sync();
    w.setAttribute("tabindex", "-1"); w.focus({ preventScroll: true });
  }
  function closeSheet(quiet) {
    if (!SH) return;
    SH.remove(); SH = null;
    if (!quiet) { if (SHFROM && SHFROM.isConnected) SHFROM.focus({ preventScroll: true }); sync(); }
  }
  /* a builder button as a choice: its own words and icon, red when it clears or removes */
  function proxy(el, o) {
    o = o || {};
    var ic = el.querySelector(".ic, img");
    return {
      label: o.label || tx(el) || el.getAttribute("aria-label") || el.getAttribute("title") || "",
      icon: o.icon || (ic ? ic.outerHTML : ""), sub: o.sub || (el.disabled ? el.getAttribute("title") || "" : ""),
      tone: o.tone || (el.matches(".red, .dn, .trash") ? "red" : ""), disabled: el.disabled,
      act: function () { el.click(); }
    };
  }
  /* a basic-mode copy dropdown inside a folded menu: its choices as their own sheet (its first option only names it) */
  function dropSheet(drop) {
    var opts = $$(".panel .opt", drop);
    sheet(tx(opts[0]) || tx(drop.querySelector(".v")), opts.slice(1).map(function (o) { return { label: tx(o), on: o.classList.contains("sel"), act: function () { o.click(); } }; }));
  }
  function dropItem(drop) {
    var ic = drop.querySelector(".ic"), off = drop.classList.contains("off");
    return { label: tx(drop.querySelector(".v")), icon: ic ? ic.outerHTML : "", disabled: off, sub: off ? drop.getAttribute("title") || "" : "", act: function () { dropSheet(drop); } };
  }

  /* ================= exercises: a one-line card; open, an editor sheet ================= */
  var OPEN = "", RISE = "";
  var val = function (row, k) { var i = row.querySelector('[data-num$="|' + k + '"]'); return i ? i.value.trim() : ""; };
  var unit = function (row, k) { var u = row.querySelector('[data-usel$="|' + k + '"] .opt.sel') || row.querySelector('[data-usel$="|' + k + '"] .v'); return u ? tx(u).toLowerCase() : ""; };
  function summary(row) {
    var reps = val(row, "reps"), sets = val(row, "sets");
    var rs = val(row, "rest_post_sets"), rsu = unit(row, "rest_post_sets_unit");
    var re = val(row, "rest_post_exercise"), reu = unit(row, "rest_post_exercise_unit");
    var dur = row.querySelector(".dur"), kc = row.querySelector(".kc");
    var one = [];
    if (reps !== "" && sets !== "") one.push(many(reps, "rep") + " × " + many(sets, "set"));
    if (rs !== "" || re !== "") one.push(rs + " " + rsu === re + " " + reu ? rs + " " + rsu + " rest" : rs + " " + rsu + " / " + re + " " + reu + " rest");
    var two = [];
    if (dur && tx(dur)) two.push(tx(dur) + " " + unit(row, "duration_units"));
    var it = row.querySelector(".isel .v b, .isel.fixed b"); if (it) two.push(tx(it));
    if (kc && kc.firstChild) two.push(kc.firstChild.textContent.trim() + " kcal");
    return [one.join(" · "), two.join(" · ")];
  }
  function exName(row) { var v = row.querySelector(".msel .trig .v"); return v && tx(v) ? tx(v) : "exercise"; }

  function decorate() {
    var right = $("#right"); if (!right) return;
    /* a new exercise opens its search straight away: its editor opens under it, so the pick lands in the editor */
    var picking = phone.matches && $("#right .rt .row:not(.xopen) .msel.open");
    if (picking) OPEN = picking.closest(".row").id;
    $$(".rt .row", right).forEach(function (row) {
      if (!row.querySelector(".mx-sum")) {
        row.classList.add("xcard");
        row.insertAdjacentHTML("beforeend", '<p class="mx-line"><span></span><span></span></p><button class="mx-sum" type="button">' + IX + '</button><div class="mx-dwrap"><button class="mx-done" type="button">Done</button></div>');
      }
      /* − and + on each number, the same as typing one */
      $$(".num", row).forEach(function (n) {
        if (n.previousElementSibling && n.previousElementSibling.classList.contains("mx-st")) return;
        n.insertAdjacentHTML("beforebegin", '<button type="button" class="mx-st" data-st="-1" tabindex="-1" aria-label="Less">' + IMINUS + "</button>");
        n.insertAdjacentHTML("afterend", '<button type="button" class="mx-st" data-st="1" tabindex="-1" aria-label="More">' + IPLUS + "</button>");
      });
      var need = !!row.querySelector(".trig.empty, .num.bad");
      var s = need ? ["Needs details, tap to finish", ""] : summary(row), ln = row.querySelector(".mx-line").children;
      if (ln[0].textContent !== s[0]) ln[0].textContent = s[0];
      if (ln[1].textContent !== s[1]) ln[1].textContent = s[1];
      if (row.classList.contains("mx-need") !== need) row.classList.toggle("mx-need", need);
      var open = row.id === OPEN;
      if (row.classList.contains("xopen") !== open) row.classList.toggle("xopen", open);
      var rise = open && row.id === RISE;
      if (rise) row.classList.add("mx-rise");
      var b = row.querySelector(".mx-sum"), lab = open ? "Close" : "Edit " + exName(row);
      if (b.getAttribute("aria-label") !== lab) { b.setAttribute("aria-label", lab); b.setAttribute("aria-expanded", open); }
      if (open && row.getAttribute("role") !== "dialog") { row.setAttribute("role", "dialog"); row.setAttribute("aria-label", exName(row)); }
      if (!open && row.hasAttribute("role")) { row.removeAttribute("role"); row.classList.remove("mx-rise"); }
    });
    if (OPEN && !document.getElementById(OPEN)) OPEN = "";
    RISE = "";
  }
  function openEx(id) { OPEN = id; RISE = id; decorate(); sync(); }
  function closeEx() { var was = OPEN; OPEN = ""; decorate(); sync(); var r = was && document.getElementById(was); if (r) r.querySelector(".mx-sum").focus({ preventScroll: true }); }

  /* ================= plan details: one line; Edit opens the fields as a sheet ================= */
  var MONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var val2 = function (el) { if (!el) return ""; var i = el.matches("input") ? el : el.querySelector("input"); return (i ? i.value : tx(el.querySelector(".ctl") || el)).trim(); };
  function planLine() {
    var st = $('.step[data-step="1"]'), fl = st && st.querySelector(".fields"); if (!fl) return;
    var b = st.querySelector(".mx-plan");
    if (!b) {
      b = document.createElement("button"); b.type = "button"; b.className = "mx-plan"; b.setAttribute("aria-haspopup", "dialog");
      b.innerHTML = '<span class="mx-pi">' + svg('<rect x="4.5" y="3.5" width="15" height="17" rx="3"/><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4"/>') + '</span><span class="mx-pt"><b></b><small></small></span><span class="mx-pe">Edit</span>';
      fl.parentNode.insertBefore(b, fl);
      b.addEventListener("click", function () { setPlan(true); });
      fl.insertAdjacentHTML("afterbegin", '<div class="mx-fh"><b>Plan details</b><button type="button" class="mx-cx" aria-label="Close">' + IX + "</button></div>");
      fl.insertAdjacentHTML("beforeend", '<button type="button" class="mx-fdone">Done</button>');
      fl.querySelector(".mx-fh .mx-cx").addEventListener("click", function () { setPlan(false); });
      fl.querySelector(".mx-fdone").addEventListener("click", function () { setPlan(false); });
    }
    var name = val2($("#pname")), d = $("#sdate"), dv = d && d.value ? d.value.split("-") : null;
    var dis = val2($("#dis")), ind = val2($("#ind")), ass = val2($("#ass"));
    var bits = [dv ? "Starts " + (+dv[2]) + " " + MONS[+dv[1] - 1] + " " + dv[0] : "", /^select/i.test(dis) ? "" : dis, ind, /^select/i.test(ass) ? "" : ass].filter(Boolean);
    var t = b.querySelector("b"), sm = b.querySelector("small");
    if (t.textContent !== (name || "Name this plan")) t.textContent = name || "Name this plan";
    if (sm.textContent !== bits.join(" · ")) sm.textContent = bits.join(" · ");
    if (b.classList.contains("mx-empty") !== !name) b.classList.toggle("mx-empty", !name);
  }
  function setPlan(o) {
    var st = $('.step[data-step="1"]'); if (!st) return;
    if (st.classList.contains("mx-fopen") === o) return;
    st.classList.toggle("mx-fopen", o);
    var b = st.querySelector(".mx-plan"); if (b) b.setAttribute("aria-expanded", o);
    var fl = st.querySelector(".fields");
    if (fl) { if (o) { fl.setAttribute("role", "dialog"); fl.setAttribute("aria-label", "Plan details"); fl.classList.add("mx-rise"); } else { fl.removeAttribute("role"); fl.classList.remove("mx-rise"); } }
    sync();
    if (!o && b) b.focus({ preventScroll: true });
  }

  /* ================= weeks: one button with the week you are on; its sheet lists every week ================= */
  function weekBars() {
    var wk = $("#weeks"); if (wk) weekBar(wk, "e");
    $$(".gweeks").forEach(function (g) { weekBar(g, "g"); });
  }
  function badge(chip) { var x = chip.querySelector(":scope > :not(span):not(small):not(.rmw)"); return x && tx(x) ? tx(x) : ""; }
  function weekBar(weeks, kind) {
    var b = weeks.previousElementSibling && weeks.previousElementSibling.classList.contains("mx-wkbar") ? weeks.previousElementSibling : null;
    if (!b) { b = document.createElement("button"); b.type = "button"; b.className = "mx-wkbar"; b.setAttribute("aria-haspopup", "dialog"); weeks.parentNode.insertBefore(b, weeks); b.addEventListener("click", function () { weekSheet(weeks, kind); }); }
    var chips = $$(".wk", weeks), act = chips.filter(function (c) { return c.classList.contains("active"); })[0] || chips[0]; if (!act) return;
    var nm = tx(act.querySelector("span")), err = 0;
    chips.forEach(function (c) { if (badge(c)) err++; });
    var meta = kind === "g" ? tx(act.querySelector("small")) + " days set" : "of " + many(chips.length, "week");
    var h = '<span class="mx-wki">' + svg('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>') + '</span><span class="mx-wkl"><b>' + esc(nm) + "</b><small>" + esc(meta) + "</small></span>" +
      (err ? '<span class="mx-wke">' + err + (err === 1 ? " week needs" : " weeks need") + " fixing</span>" : "") + '<span class="mx-wkc">Change' + IDOWN + "</span>";
    if (b.dataset.h !== h) { b.dataset.h = h; b.innerHTML = h; b.setAttribute("aria-label", nm + ", " + meta + ". Change week"); }
  }
  function weekSheet(weeks, kind) {
    var chips = $$(".wk", weeks), act = chips.filter(function (c) { return c.classList.contains("active"); })[0];
    var items = chips.map(function (c) {
      var sm = c.querySelector("small"), bad = badge(c);
      return { label: tx(c.querySelector("span")), sub: sm ? tx(sm) + " days" : "", badge: bad, tone: bad ? "warn" : "", on: c === act, act: function () { c.click(); } };
    });
    var foot = [];
    if (kind === "e") {
      var add = weeks.querySelector('[data-x="addweek"]'), rm = act && act.querySelector(".rmw");
      if (rm && chips.length > 1) foot.push({ label: "Remove " + tx(act.querySelector("span")), icon: '<i class="ic" aria-hidden="true" style="--ic:url(/v7/img/coach/icons/trash-outline.svg)"></i>', tone: "red", act: function () { rm.click(); } });
      if (add) foot.push({ label: tx(add), icon: '<i class="ic" aria-hidden="true" style="--ic:url(/v7/img/coach/icons/add.svg)"></i>', tone: "pr", act: function () { add.click(); } });
    }
    sheet(kind === "e" ? "Weeks" : "Choose a week", items, { grid: true, foot: foot });
  }

  /* ================= each step's day tools, and a routine's own, behind ⋯ ================= */
  var TOOLS = { e: "#right .acts", n: "#step2 .sofft", s: "#step3 .sofft" };
  function dayTools() {
    Object.keys(TOOLS).forEach(function (k) {
      var box = $(TOOLS[k]); if (!box) return;
      if (!box.querySelector(".mx-more")) {
        var b = document.createElement("button"); b.type = "button"; b.className = "mx-more"; b.dataset.mx = k;
        b.setAttribute("aria-haspopup", "dialog"); b.setAttribute("aria-label", "Day options"); b.innerHTML = IDOTS;
        box.appendChild(b);
      }
      if (!box.classList.contains("mx-tools")) box.classList.add("mx-tools");
    });
    $$(".gbar:not(.mx-gbar)").forEach(function (g) { g.classList.add("mx-gbar"); });
    /* step 3 says the day's goal beside its ⋯, as step 2 says its moves */
    var gw = $("#step3 .gbar .gwhere");
    if (gw && !gw.querySelector("span")) { var on = $("#step3 .gday.on small"); gw.insertAdjacentHTML("beforeend", "<span>" + esc(on && tx(on) !== "Not set" ? tx(on) + " steps" : "Nothing set yet") + "</span>"); }
  }
  function daySheet(k) {
    var box = $(TOOLS[k]); if (!box) return;
    var items = $$("button.b:not(.pr):not(.mx-more), button.cbtn, .drop.cdrop", box).map(function (el) { return el.matches(".drop") ? dropItem(el) : proxy(el); });
    var sc = k === "n" ? "#step2" : "#step3";
    var day = k === "e" ? tx($("#right .days .on")) : tx($(sc + " .gday.on b")).replace(/\s*Rest$/, "");
    var wk = k === "e" ? tx($("#weeks .wk.active span")) : tx($(sc + " .gwk.active span"));
    sheet("Day options", items, { sub: [wk, day].filter(Boolean).join(", ") });
  }
  function routineMenus() {
    $$("#right .rthd").forEach(function (h) {
      if (h.querySelector(".mx-rmore")) return;
      var b = document.createElement("button"); b.type = "button"; b.className = "mx-rmore"; b.setAttribute("aria-haspopup", "dialog");
      b.setAttribute("aria-label", "Routine " + tx(h.querySelector(".rno")) + " options"); b.innerHTML = IDOTS; h.appendChild(b);
    });
  }
  function routineSheet(h) {
    var items = $$(".cbtn, .drop.cdrop", h).map(function (el) { return el.matches(".drop") ? dropItem(el) : proxy(el); });
    var tr = h.querySelector("[data-rmroutine]");
    if (tr) items.push(proxy(tr, { label: "Delete routine", icon: '<i class="ic" aria-hidden="true" style="--ic:url(/v7/img/coach/icons/trash-outline.svg)"></i>', tone: "red" }));
    sheet("Routine " + tx(h.querySelector(".rno")), items);
  }

  /* ================= the plans list: the card opens the plan; the rest of its actions behind ⋯ ================= */
  function listRows() {
    $$(".cs-row").forEach(function (r) {
      var ra = r.querySelector(".cs-ra"); if (!ra || ra.querySelector(".mx-lmore")) return;
      if (!$$(".csb:not([data-csopen])", ra).length) return;
      var b = document.createElement("button"); b.type = "button"; b.className = "mx-lmore"; b.setAttribute("aria-haspopup", "dialog");
      b.setAttribute("aria-label", "More for " + tx(r.querySelector(".cs-rt"))); b.innerHTML = IDOTS; ra.appendChild(b);
    });
  }
  function listSheet(r) {
    var nm = r.querySelector(".cs-rt"), first = nm && nm.firstChild;
    sheet(first && first.nodeType === 3 ? first.textContent.trim() : tx(nm), $$(".csb:not([data-csopen]):not(.mx-lmore)", r.querySelector(".cs-ra")).map(function (b) {
      return proxy(b, { label: b.getAttribute("title") || tx(b), icon: b.querySelector("svg") ? b.querySelector("svg").outerHTML : /deactivate/i.test(tx(b)) ? IPOWER : "" });
    }));
  }

  /* ================= dropdowns rise as sheets: a title and a circle X on each ================= */
  function dropTitle(o) {
    if (o.matches(".addr")) return tx(o.querySelector(".b")) || "Add a Routine";
    if (o.matches(".msel")) return "Choose exercise";
    if (o.matches(".rsel")) { var h = o.parentNode.querySelector("h4, label"); return h ? tx(h) : "Choose"; }
    if (o.matches(".cdrop")) { var f = o.querySelector(".panel .opt"); return f ? tx(f) : tx(o.querySelector(".v")); }
    return o.getAttribute("title") || tx(o.querySelector(".v")) || "Choose";
  }
  function dropHeads() {
    $$(".open").forEach(function (o) {
      if (o.closest(".xopen") && o.matches(".usel, .isel")) return;   /* in the exercise editor these sit inline */
      var p = o.querySelector(":scope > .panel, :scope > .menu"); if (!p || p.querySelector(":scope > .mx-ph")) return;
      p.insertAdjacentHTML("afterbegin", '<div class="mx-ph"><b>' + esc(dropTitle(o)) + '</b><button type="button" class="mx-cx" aria-label="Close">' + IX + "</button></div>");
    });
  }
  function closeDrops() {
    $$(".open").forEach(function (o) { o.classList.remove("open"); });
    $$(".msel .panel").forEach(function (p) { p.remove(); });
  }
  var DROPQ = ".open > .panel, .rsel.open";

  /* ================= small moves: a part's suggestions rise as a sheet ================= */
  var SUGWAS = false;
  function sugSheet() {
    var p = $(".pcard .sugp");
    if (p && !p.querySelector(".mx-sugx")) {
      var h = p.querySelector(".sugh");
      p.insertAdjacentHTML("afterbegin", '<button type="button" class="mx-cx mx-sugx" aria-label="Close">' + IX + "</button>");
      p.setAttribute("role", "dialog"); p.setAttribute("aria-label", tx(h));
      if (!SUGWAS) p.classList.add("mx-rise");
    }
    SUGWAS = !!p;
  }
  function closeSug() { var on = $("[data-sugtip].on"); if (on) on.click(); }

  /* ================= what is open, and the scrim and scroll lock that go with it ================= */
  function sync() {
    if (!phone.matches) { html.classList.remove("mx-lock", "mx-top"); dim.classList.remove("on"); return; }
    if (!dim.isConnected) document.body.appendChild(dim);
    var drop = !!$(DROPQ);
    var ex = !!$(".step:not([hidden]) .rt .row.xopen");
    var plan = !!$('.step[data-step="1"].mx-fopen:not([hidden])');
    var sug = !!$(".pcard .sugp");
    var any = drop || ex || plan || sug || !!SH;
    if (html.classList.contains("mx-lock") !== any) html.classList.toggle("mx-lock", any);
    if (html.classList.contains("mx-top") !== !!SH) html.classList.toggle("mx-top", !!SH);
    if (dim.classList.contains("on") !== any) dim.classList.toggle("on", any);
    if (drop) dropHeads();
  }

  /* ================= taps ================= */
  document.addEventListener("click", function (e) {
    if (!phone.matches) return;
    var t = e.target;
    if (t.closest(".mx-sheet, .scrim, .sugm")) return;
    /* the scrim, or anything outside an open dropdown, closes just the top layer; the tap goes no further */
    var drop = $(DROPQ);
    if (t === dim || drop && !t.closest(".open")) {
      e.stopPropagation(); e.preventDefault();
      if (drop) closeDrops();
      else if (SH) closeSheet();
      else if (OPEN) closeEx();
      else if ($(".pcard .sugp")) closeSug();
      else setPlan(false);
      sync(); return;
    }
    var a;
    if ((a = t.closest(".mx-sum"))) { e.stopPropagation(); var row = a.closest(".row"); if (row.id === OPEN) closeEx(); else openEx(row.id); return; }
    if ((a = t.closest(".mx-done"))) { e.stopPropagation(); closeEx(); return; }
    if ((a = t.closest(".mx-sugx"))) { e.stopPropagation(); closeSug(); return; }
    if ((a = t.closest(".mx-st"))) {
      e.stopPropagation(); e.preventDefault();
      var n = a.parentNode.querySelector(".num"); if (!n) return;
      n.value = Math.min(9999, Math.max(1, (parseInt(n.value, 10) || 0) + +a.dataset.st));
      n.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    if ((a = t.closest(".mx-more"))) { e.stopPropagation(); daySheet(a.dataset.mx); return; }
    if ((a = t.closest(".mx-rmore"))) { e.stopPropagation(); routineSheet(a.closest(".rthd")); return; }
    if ((a = t.closest(".mx-lmore"))) { e.stopPropagation(); listSheet(a.closest(".cs-row")); return; }
    /* a plan card opens the plan, the same as its button */
    if ((a = t.closest(".cs-row")) && !t.closest("button, a")) { var o = a.querySelector("[data-csopen]"); if (o) { e.stopPropagation(); o.click(); } return; }
  }, true);
  /* after the builder has handled a tap, put the scrim and sheet headers in step with what is open now */
  document.addEventListener("click", function () { setTimeout(sync, 0); });
  document.addEventListener("keydown", function (e) {
    if (!phone.matches) return;
    if (e.key === "Escape") {
      if ($(DROPQ)) closeDrops(); else if (SH) closeSheet(); else if (OPEN) closeEx(); else if ($(".pcard .sugp")) closeSug(); else setPlan(false);
      sync(); return;
    }
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".cs-row")) { var o = e.target.querySelector("[data-csopen]"); if (o) o.click(); }
    setTimeout(sync, 0);
  });
  document.addEventListener("input", function (e) { if (e.target.closest(".fields")) planLine(); });
  document.addEventListener("change", function (e) { if (e.target.closest(".fields")) planLine(); });

  /* ================= kept from before: step intros, slim Add names, the alert's X, the patient menu ================= */
  function intros() {
    $$(".s-head > div:first-child").forEach(function (h) {
      var p = h.querySelector("p"); if (!p || h.querySelector(".mx-intro")) return;
      var b = document.createElement("button"); b.type = "button"; b.className = "mx-intro"; b.textContent = "More";
      p.insertAdjacentElement("afterend", b);
      b.addEventListener("click", function () { var o = h.classList.toggle("mx-iopen"); b.textContent = o ? "Less" : "More"; });
    });
  }
  function addNames() {
    $$(".pcard .addbox:not([aria-label])").forEach(function (b) {
      var l = b.closest(".pcard").querySelector(".pt b"); b.setAttribute("aria-label", tx(b) + (l ? ", " + tx(l) : ""));
    });
  }
  function alertX() {
    var al = $("#scrim .alert"); if (!al || al.querySelector(".mx-ax")) return;
    var x = document.createElement("button"); x.type = "button"; x.className = "mx mx-ax"; x.setAttribute("aria-label", "Close");
    x.innerHTML = '<i class="ic" aria-hidden="true" style="--ic:url(/v7/img/coach/icons/close-outline.svg)"></i>';
    x.addEventListener("click", function () { var n = $("#aNo"); if (n) n.click(); });
    al.insertBefore(x, al.firstChild);
  }
  var NAVOPEN = false;
  var BURGER = svg('<path d="M4 7h16M4 12h16M4 17h16"/>', 2.2);
  function navMenu() {
    var pn = $(".cs-pn"), pp = pn && pn.querySelector(".cs-pp"); if (!pp) return;
    var b = pp.querySelector(".mx-burger");
    if (!b) { b = document.createElement("button"); b.type = "button"; b.className = "mx-burger"; b.innerHTML = BURGER; pp.insertBefore(b, pp.firstChild); }
    if (pn.classList.contains("mx-navopen") !== NAVOPEN) pn.classList.toggle("mx-navopen", NAVOPEN);
    if (html.classList.contains("mx-navlock") !== NAVOPEN) html.classList.toggle("mx-navlock", NAVOPEN);
    b.setAttribute("aria-expanded", NAVOPEN); b.setAttribute("aria-label", NAVOPEN ? "Close menu" : "Open menu");
  }
  function setNav(o) { NAVOPEN = o; navMenu(); }
  document.addEventListener("click", function (e) {
    if (e.target.closest(".mx-burger")) { e.stopPropagation(); setNav(!NAVOPEN); return; }
    if (NAVOPEN && !e.target.closest(".cs-pn")) setNav(false);
  }, true);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && NAVOPEN) setNav(false); });
  if (phone.addEventListener) phone.addEventListener("change", function () {
    if (!phone.matches) { setNav(false); closeSheet(true); OPEN = ""; decorate(); setPlan(false); }
    sync();
  });

  function phoneOnly() {
    if (!phone.matches) return;
    planLine(); dayTools(); weekBars(); routineMenus(); listRows(); intros(); addNames(); alertX(); navMenu(); sugSheet(); sync();
  }

  /* the builder redraws on every change; decorate after each redraw */
  var t = 0;
  function watch() {
    if (!$("#right")) return setTimeout(watch, 100);
    new MutationObserver(function () { clearTimeout(t); t = setTimeout(function () { decorate(); phoneOnly(); }, 0); }).observe(document.body, { childList: true, subtree: true });
    decorate(); phoneOnly();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch); else watch();
})();
