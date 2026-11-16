/* Step 1 on a phone (coach-exercise/mobile.css): each exercise shows as its name and a one-line summary,
   "20 reps × 3 sets · 15 sec rest / 4 min · 20 kcal". Tapping it opens its fields under it, one exercise at a time.
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

  /* the builder redraws the day on every change; decorate after each redraw */
  var t = 0;
  function watch() {
    var right = document.getElementById("right"); if (!right) return setTimeout(watch, 100);
    new MutationObserver(function () { clearTimeout(t); t = setTimeout(decorate, 0); }).observe(right, { childList: true, subtree: true });
    decorate();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch); else watch();
})();
