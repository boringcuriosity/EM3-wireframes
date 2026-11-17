/* Step 1 on a phone (coach-exercise/mobile.css): each exercise shows as its name and a one-line summary,
   "20 reps × 3 sets · 15 sec rest / 4 min · Moderate · 20 kcal". Tapping it opens its fields under it, one exercise at a time.
   An exercise with no name yet, or a value missing, stays open so nothing to fix is hidden.
   Reads the builder's own fields; never changes the plan. On a wider screen the summary is hidden by CSS. */
(function () {
  var OPEN = "";
  var val = function (row, k) { var i = row.querySelector('[data-num$="|' + k + '"]'); return i ? i.value.trim() : ""; };
  var unit = function (row, k) { var u = row.querySelector('[data-usel$="|' + k + '"] .v'); return u ? u.textContent.trim().toLowerCase() : ""; };
  var many = function (n, w) { return n + " " + w + (+n === 1 ? "" : "s"); };

  function summary(row) {
    var reps = val(row, "reps"), sets = val(row, "sets");
    var rs = val(row, "rest_post_sets"), rsu = unit(row, "rest_post_sets_unit");
    var re = val(row, "rest_post_exercise"), reu = unit(row, "rest_post_exercise_unit");
    var dur = row.querySelector(".dur"), kc = row.querySelector(".kc");
    var one = [];
    if (reps !== "" && sets !== "") one.push(many(reps, "rep") + " × " + many(sets, "set"));
    if (rs !== "" || re !== "") one.push(rs + " " + rsu === re + " " + reu ? rs + " " + rsu + " rest" : rs + " " + rsu + " / " + re + " " + reu + " rest");
    var two = [];
    if (dur && dur.textContent.trim()) two.push(dur.textContent.trim() + " " + unit(row, "duration_units"));
    var it = row.querySelector(".isel .v b"); if (it) two.push(it.textContent.trim());
    if (kc && kc.firstChild) two.push(kc.firstChild.textContent.trim() + " kcal");
    return [one.join(" · "), two.join(" · ")];
  }
  function name(row) { var v = row.querySelector(".msel .trig .v"); return v ? v.textContent.trim() : "exercise"; }

  function decorate() {
    var right = document.getElementById("right"); if (!right) return;
    [].forEach.call(right.querySelectorAll(".rt .row"), function (row) {
      if (!row.querySelector(".mx-sum")) {
        row.classList.add("xcard");
        row.insertAdjacentHTML("beforeend", '<p class="mx-line"><span></span><span></span></p><button class="mx-sum" type="button"></button>');
      }
      var s = summary(row), ln = row.querySelector(".mx-line").children;
      if (ln[0].textContent !== s[0]) ln[0].textContent = s[0];
      if (ln[1].textContent !== s[1]) ln[1].textContent = s[1];
      /* nothing to fix is ever folded away */
      var must = !!row.querySelector(".trig.empty, .num.bad");
      var open = must || row.id === OPEN;
      if (row.classList.contains("xopen") !== open) row.classList.toggle("xopen", open);
      var b = row.querySelector(".mx-sum"), lab = (open ? "Close " : "Edit ") + name(row);
      if (b.getAttribute("aria-label") !== lab) { b.setAttribute("aria-label", lab); b.setAttribute("aria-expanded", open); }
      b.hidden = must;   /* it cannot close while something is missing */
    });
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest(".mx-sum"); if (!b) return;
    var row = b.closest(".row");
    OPEN = row.classList.contains("xopen") ? "" : row.id;
    decorate();
    if (OPEN) { row.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }
  });

  /* ---------- progressive disclosure on a phone: the same fields and actions, the rarer ones one tap away ---------- */
  var phone = matchMedia("(max-width: 760px)");
  var MORE = {};   /* which step's Day options are open: e (exercise), n (small moves), s (steps) */
  var DOTS = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';
  var txt = function (el) { if (!el) return ""; var i = el.matches("input") ? el : el.querySelector("input"); return (i ? i.value : (el.querySelector(".ctl") || el).textContent).trim(); };
  var MONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* plan details fold into one line: the name, then start, disease and indication. Open while the name is empty */
  function planLine() {
    var st = document.querySelector('.step[data-step="1"]'), fl = st && st.querySelector(".fields"); if (!fl) return;
    var b = st.querySelector(".mx-plan");
    if (!b) {
      b = document.createElement("button"); b.type = "button"; b.className = "mx-plan";
      b.innerHTML = '<span class="mx-pt"><b></b><small></small></span><span class="mx-pe">Edit</span>';
      fl.parentNode.insertBefore(b, fl);
      b.addEventListener("click", function () { st.classList.toggle("mx-fopen"); if (st.classList.contains("mx-fopen")) { var n = document.getElementById("pname"); if (n) n.focus({ preventScroll: true }); } planLine(); });
    }
    var name = txt(document.getElementById("pname")), d = document.getElementById("sdate"), dv = d && d.value ? d.value.split("-") : null;
    var dis = txt(document.getElementById("dis")), ind = txt(document.getElementById("ind")), ass = txt(document.getElementById("ass"));
    var bits = [dv ? "Starts " + (+dv[2]) + " " + MONS[+dv[1] - 1] + " " + dv[0] : "", dis, ind, /^select/i.test(ass) ? "" : ass].filter(Boolean);
    if (!name) st.classList.add("mx-fopen");
    var open = st.classList.contains("mx-fopen");
    var t = b.querySelector("b"), sm = b.querySelector("small"), e = b.querySelector(".mx-pe");
    if (t.textContent !== (name || "Name this plan")) t.textContent = name || "Name this plan";
    if (sm.textContent !== bits.join(" · ")) sm.textContent = bits.join(" · ");
    if (e.textContent !== (open ? "Done" : "Edit")) e.textContent = open ? "Done" : "Edit";
    b.setAttribute("aria-expanded", open); b.setAttribute("aria-label", (open ? "Close" : "Edit") + " plan details");
  }

  /* each step's day tools (rest or no-moves day, clear, copy day, copy week) behind one Day options button */
  function dayTools() {
    [["e", "#right .acts", ".addr"], ["n", "#step2 .sofft", null], ["s", "#step3 .sofft", null]].forEach(function (c) {
      var box = document.querySelector(c[1]); if (!box) return;
      var b = box.querySelector(".mx-more");
      if (!b) {
        b = document.createElement("button"); b.type = "button"; b.className = "mx-more"; b.dataset.mx = c[0];
        b.innerHTML = DOTS + "<span>Day options</span>";
        var after = c[2] && box.querySelector(c[2]);
        if (after) after.insertAdjacentElement("afterend", b); else box.insertBefore(b, box.firstChild);
      }
      box.classList.add("mx-tools");
      if (box.classList.contains("mx-open") !== !!MORE[c[0]]) box.classList.toggle("mx-open", !!MORE[c[0]]);
      b.setAttribute("aria-expanded", !!MORE[c[0]]);
    });
  }

  /* a long step introduction shows two lines, with More for the rest */
  function intros() {
    document.querySelectorAll(".s-head > div:first-child").forEach(function (h) {
      var p = h.querySelector("p"); if (!p || h.querySelector(".mx-intro")) return;
      var b = document.createElement("button"); b.type = "button"; b.className = "mx-intro"; b.textContent = "More";
      p.insertAdjacentElement("afterend", b);
      b.addEventListener("click", function () { var o = h.classList.toggle("mx-iopen"); b.textContent = o ? "Less" : "More"; });
    });
  }

  document.addEventListener("click", function (e) {
    var m = e.target.closest(".mx-more");
    if (m) { MORE[m.dataset.mx] = !MORE[m.dataset.mx]; dayTools(); return; }
    /* a pick inside the open tools closes them */
    var o = e.target.closest(".mx-open button:not(.mx-more)");
    if (o) { var k = o.closest("#step2") ? "n" : o.closest("#step3") ? "s" : "e"; MORE[k] = false; setTimeout(dayTools, 0); }
  });
  document.addEventListener("input", function (e) { if (e.target.closest(".fields")) planLine(); });
  document.addEventListener("change", function (e) { if (e.target.closest(".fields")) planLine(); });

  /* a slim empty part shows just "Add" (mobile.css); its full name stays for screen readers */
  function addNames() {
    document.querySelectorAll(".pcard .addbox:not([aria-label])").forEach(function (b) {
      var l = b.closest(".pcard").querySelector(".pt b"); b.setAttribute("aria-label", b.textContent.trim() + (l ? ", " + l.textContent.trim() : ""));
    });
  }
  function phoneOnly() { if (!phone.matches) return; planLine(); dayTools(); intros(); addNames(); }

  /* the builder redraws the day on every change; decorate after each redraw */
  var t = 0;
  function watch() {
    var right = document.getElementById("right"); if (!right) return setTimeout(watch, 100);
    new MutationObserver(function () { clearTimeout(t); t = setTimeout(function () { decorate(); phoneOnly(); }, 0); }).observe(document.body, { childList: true, subtree: true });
    decorate(); phoneOnly();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch); else watch();
})();
